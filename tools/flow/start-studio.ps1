$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$url = 'http://127.0.0.1:8787'

function Get-StudioHealth {
    try {
        return Invoke-RestMethod -Uri "$url/api/health" -TimeoutSec 2 -UseBasicParsing
    } catch {
        return $null
    }
}

function Test-OurStudio($health) {
    return $null -ne $health -and $health.ok -eq $true -and
        $health.service -eq 'aiprojects-flow' -and $health.root -eq $root
}

try {
    $health = Get-StudioHealth
    if (-not (Test-OurStudio $health)) {
        if ($null -ne $health) {
            throw 'Port 8787 is already being used by another server. Close it and try again.'
        }

        $node = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue
        if (-not $node) {
            throw 'Node.js is not installed or is not on your PATH. Install Node.js, then try again.'
        }
        if (-not (Test-Path (Join-Path $root 'node_modules\playwright-core\package.json'))) {
            throw 'The Flow dependencies are missing. Run npm install once in the aiprojects folder, then try again.'
        }

        $env:AIPROJECTS_PORT = '8787'
        $server = Start-Process -FilePath $node.Source -ArgumentList "`"$(Join-Path $PSScriptRoot 'server.mjs')`"" -WorkingDirectory $root -WindowStyle Hidden -PassThru
        $deadline = (Get-Date).AddSeconds(15)
        do {
            Start-Sleep -Milliseconds 300
            $health = Get-StudioHealth
            if (Test-OurStudio $health) { break }
            $server.Refresh()
        } while (-not $server.HasExited -and (Get-Date) -lt $deadline)

        if (-not (Test-OurStudio $health)) {
            if (-not $server.HasExited) { Stop-Process -Id $server.Id }
            throw 'The generator could not start. Port 8787 may already be in use, or the server may have failed to start.'
        }
    }

    Start-Process "$url/"
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Story Studio', 'OK', 'Error') | Out-Null
}
