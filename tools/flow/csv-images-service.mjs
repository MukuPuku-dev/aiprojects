import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export function sanitizeFolderName(name) {
  const cleaned = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'default';
}

export function sanitizeFileName(name) {
  const base = path.basename(String(name || '').trim())
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 120);
  if (!base || base === '.' || base === '..') {
    throw new Error('A valid image filename is required.');
  }
  return /\.(png|jpe?g|webp)$/i.test(base) ? base : `${base}.jpg`;
}

export function csvImagesRoot(root) {
  return path.join(root, 'projects', 'images-from-csv', 'images');
}

export function csvImagesDir(root, folder) {
  return path.join(csvImagesRoot(root), sanitizeFolderName(folder));
}

export function mapAspectToFlow(rawAspect) {
  const val = String(rawAspect || '').trim();
  if (val === '9:16' || val === '3:4' || val === '2:3' || val === '4:5') return '9:16';
  return '16:9';
}

export function listCsvFolders(root) {
  const base = csvImagesRoot(root);
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export function listCsvImages(root, folder) {
  const safeFolder = sanitizeFolderName(folder);
  const dir = csvImagesDir(root, safeFolder);
  const folders = listCsvFolders(root);
  if (!fs.existsSync(dir)) {
    return { folder: safeFolder, folders, files: [] };
  }
  const files = fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
    .map(entry => {
      const full = path.join(dir, entry.name);
      const stat = fs.statSync(full);
      return {
        name: entry.name,
        url: `/projects/images-from-csv/images/${encodeURIComponent(safeFolder)}/${encodeURIComponent(entry.name)}`,
        size: stat.size,
        mtimeMs: stat.mtimeMs
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return { folder: safeFolder, folders, files };
}

export function deleteCsvImage(root, folder, filename) {
  const safeFolder = sanitizeFolderName(folder);
  const safeFile = sanitizeFileName(filename);
  const full = path.join(csvImagesDir(root, safeFolder), safeFile);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    return { deleted: true, file: safeFile };
  }
  return { deleted: false, file: safeFile };
}

export async function compressImageToJpeg(filePath, quality = 85) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const originalSize = fs.statSync(filePath).size;
  const q = Math.max(10, Math.min(100, Math.round(Number(quality) || 85)));
  const tmpOut = `${filePath}.tmp.jpg`;
  const psScript = [
    'Add-Type -AssemblyName System.Drawing',
    '$img = [System.Drawing.Image]::FromFile($env:CSV_IMG_SRC)',
    'try {',
    '  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1',
    '  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)',
    '  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$env:CSV_IMG_Q)',
    '  $img.Save($env:CSV_IMG_DST, $codec, $ep)',
    '} finally {',
    '  $img.Dispose()',
    '}'
  ].join('\n');

  await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    psScript
  ], {
    timeout: 30000,
    env: {
      ...process.env,
      CSV_IMG_SRC: filePath,
      CSV_IMG_DST: tmpOut,
      CSV_IMG_Q: String(q)
    }
  });

  if (fs.existsSync(tmpOut)) {
    fs.renameSync(tmpOut, filePath);
  }
  const compressedSize = fs.statSync(filePath).size;
  return { file: filePath, originalSize, compressedSize };
}
