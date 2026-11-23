import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';

export const YT_DLP_DEFAULT = 'C:\\Tools\\yt-dlp\\yt-dlp.exe';
export const FFMPEG_ROOT_DEFAULT = 'C:\\Tools\\ffmpeg';

export function getDownloadDir() {
  const dir = path.join(os.homedir(), 'Downloads', 'FacebookReels');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function findYtDlpExe() {
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) return process.env.YTDLP_PATH;
  if (fs.existsSync(YT_DLP_DEFAULT)) return YT_DLP_DEFAULT;
  return null;
}

function findFileRecursive(rootDir, targetName, maxDepth = 4) {
  if (!rootDir || !fs.existsSync(rootDir)) return null;
  const targetLower = targetName.toLowerCase();
  const queue = [{ dir: rootDir, depth: 0 }];
  while (queue.length > 0) {
    const { dir, depth } = queue.shift();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.toLowerCase() === targetLower) {
        return full;
      }
      if (entry.isDirectory() && depth < maxDepth) {
        queue.push({ dir: full, depth: depth + 1 });
      }
    }
  }
  return null;
}

export function findFfmpegExe() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const found = findFileRecursive(FFMPEG_ROOT_DEFAULT, 'ffmpeg.exe', 4);
  if (found) return found;
  if (fs.existsSync('C:\\ffmpeg\\bin\\ffmpeg.exe')) return 'C:\\ffmpeg\\bin\\ffmpeg.exe';
  return null;
}

export function getToolsStatus() {
  const ytdlpPath = findYtDlpExe();
  const ffmpegPath = findFfmpegExe();
  const downloadDir = getDownloadDir();
  return {
    ytdlpPath: ytdlpPath || YT_DLP_DEFAULT,
    ytdlpFound: Boolean(ytdlpPath),
    ffmpegPath: ffmpegPath || FFMPEG_ROOT_DEFAULT,
    ffmpegDir: ffmpegPath ? path.dirname(ffmpegPath) : FFMPEG_ROOT_DEFAULT,
    ffmpegFound: Boolean(ffmpegPath),
    downloadDir
  };
}

export function validateFacebookUrl(rawUrl) {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) throw new Error('Please paste a Facebook video link.');
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('That does not look like a valid link. Please paste the full https:// URL.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http:// and https:// links are supported.');
  }
  return parsed.toString();
}

const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.webm', '.mov', '.m4v']);

export function listDownloadedVideos() {
  const dir = getDownloadDir();
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!VIDEO_EXTS.has(ext)) continue;
    const fullPath = path.join(dir, entry.name);
    try {
      const stat = fs.statSync(fullPath);
      files.push({
        name: entry.name,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        ext,
        url: `/api/fb-downloader/video/${encodeURIComponent(entry.name)}`
      });
    } catch {}
  }
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files;
}

export function resolveVideoFile(filename) {
  const raw = String(filename || '');
  if (
    !raw.trim() ||
    raw === '.' ||
    raw === '..' ||
    raw.includes('/') ||
    raw.includes('\\') ||
    raw.includes('\0') ||
    path.basename(raw) !== raw
  ) {
    throw new Error('Invalid filename.');
  }
  const dir = path.resolve(getDownloadDir());
  const full = path.resolve(dir, raw);
  if (path.dirname(full).toLowerCase() !== dir.toLowerCase()) {
    throw new Error('Invalid filename path.');
  }
  return full;
}

export function deleteDownloadedVideo(filename) {
  const full = resolveVideoFile(filename);
  if (!fs.existsSync(full)) throw new Error('Video file not found.');
  fs.unlinkSync(full);
  return { deleted: path.basename(full) };
}

export function openInExplorer(filename) {
  const dir = getDownloadDir();
  if (filename) {
    const full = resolveVideoFile(filename);
    if (!fs.existsSync(full)) throw new Error('Video file not found.');
    const child = spawn('explorer.exe', [`/select,${full}`], { detached: true, stdio: 'ignore' });
    child.unref();
    return { opened: full };
  }
  const child = spawn('explorer.exe', [dir], { detached: true, stdio: 'ignore' });
  child.unref();
  return { opened: dir };
}

export function openInDefaultPlayer(filename) {
  const full = resolveVideoFile(filename);
  if (!fs.existsSync(full)) throw new Error('Video file not found.');
  const child = spawn('explorer.exe', [full], { detached: true, stdio: 'ignore' });
  child.unref();
  return { opened: full };
}

const WINDOWS_RESERVED_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;

function formatFallbackTimestamp(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function sanitizeVideoBaseName(rawName, { fallbackPrefix = 'Facebook_Reel', maxLength = 95, now = new Date() } = {}) {
  const original = String(rawName || '');
  const idMatch = original.match(/\[([A-Za-z0-9_-]{4,32})\]\s*$/);
  const idToken = idMatch ? `[${idMatch[1]}]` : '';
  const idSuffix = idToken ? ` ${idToken}` : '';

  let text = original
    .normalize('NFKC')
    .replace(/\uFFFD/g, ' ')
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/[<>:"/\\|?*#%&$^!;`~]/g, ' ')
    .replace(/\.{2,}/g, ' ')
    .replace(/[^\p{L}\p{M}\p{N}\s._()[\]-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[.\s_-]+|[.\s_-]+$/g, '');

  if (text.length > maxLength) {
    if (idSuffix && text.endsWith(idToken) && maxLength > idSuffix.length + 10) {
      const head = text.slice(0, maxLength - idSuffix.length).replace(/[.\s_-]+$/g, '');
      text = `${head}${idSuffix}`.trim();
    } else {
      text = text.slice(0, maxLength).replace(/[.\s_-]+$/g, '');
    }
  }

  const withoutId = idToken && text.endsWith(idToken) ? text.slice(0, -idToken.length).trim() : text;
  const hasMeaningfulChars = /[\p{L}\p{N}]/u.test(withoutId);
  if (!text || !hasMeaningfulChars || text === '.' || text === '..' || WINDOWS_RESERVED_RE.test(text)) {
    const fallback = idSuffix
      ? `${fallbackPrefix}_${formatFallbackTimestamp(now)}${idSuffix}`
      : `${fallbackPrefix}_${formatFallbackTimestamp(now)}`;
    return fallback.slice(0, maxLength);
  }

  return text;
}

export function uniqueFilePath(dir, baseName, ext = '.mp4') {
  const cleanExt = /^\.[a-z0-9]{1,8}$/i.test(String(ext || '')) ? String(ext).toLowerCase() : '.mp4';
  const cleanBase = sanitizeVideoBaseName(baseName);
  let candidate = path.join(dir, `${cleanBase}${cleanExt}`);
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${cleanBase} (${n})${cleanExt}`);
    n += 1;
  }
  return candidate;
}

function moveFileSafely(srcPath, destPath) {
  if (path.resolve(srcPath).toLowerCase() === path.resolve(destPath).toLowerCase()) {
    return destPath;
  }
  try {
    fs.renameSync(srcPath, destPath);
  } catch (err) {
    if (err && err.code === 'EXDEV') {
      fs.copyFileSync(srcPath, destPath);
      fs.unlinkSync(srcPath);
    } else {
      throw err;
    }
  }
  return destPath;
}

function runCommandWithLogs(exe, args, { onLine, onProgress, label }) {
  return new Promise((resolve, reject) => {
    const child = spawn(exe, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' }
    });
    const stdoutLines = [];
    const stderrLines = [];
    let outBuf = '';
    let errBuf = '';

    const handleLine = (line, isErr) => {
      const text = line.trim();
      if (!text) return;
      if (isErr) stderrLines.push(text);
      else stdoutLines.push(text);
      if (onLine) onLine(text);

      // Parse yt-dlp progress: [download]  42.3% of   12.34MiB at    2.10MiB/s ETA 00:03
      const m = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%(?:\s+of\s+([^\s]+))?(?:\s+at\s+([^\s]+))?(?:\s+ETA\s+([^\s]+))?/i);
      if (m && onProgress) {
        onProgress({
          percent: Math.min(100, Math.max(0, Number(m[1]))),
          size: m[2] || '',
          speed: m[3] || '',
          eta: m[4] || ''
        });
      }
    };

    child.stdout.on('data', chunk => {
      outBuf += chunk.toString();
      const parts = outBuf.split(/\r?\n/);
      outBuf = parts.pop() || '';
      for (const line of parts) handleLine(line, false);
    });

    child.stderr.on('data', chunk => {
      errBuf += chunk.toString();
      const parts = errBuf.split(/\r?\n/);
      errBuf = parts.pop() || '';
      for (const line of parts) handleLine(line, true);
    });

    child.on('error', err => reject(new Error(`${label || exe} failed to start: ${err.message}`)));
    child.on('close', code => {
      if (outBuf.trim()) handleLine(outBuf, false);
      if (errBuf.trim()) handleLine(errBuf, true);
      if (code === 0) {
        resolve({ stdoutLines, stderrLines });
      } else {
        const lastErr = [...stderrLines, ...stdoutLines].filter(Boolean).slice(-4).join(' | ');
        reject(new Error(lastErr || `${label || exe} exited with code ${code}`));
      }
    });
  });
}

function extractSavedFilePath(stdoutLines, fallbackDir) {
  for (let i = stdoutLines.length - 1; i >= 0; i--) {
    const line = stdoutLines[i].trim().replace(/^"|"$/g, '');
    if (line && fs.existsSync(line) && fs.statSync(line).isFile()) {
      return line;
    }
  }
  if (fallbackDir && fs.existsSync(fallbackDir)) {
    const files = fs.readdirSync(fallbackDir)
      .filter(name => !/\.(part|ytdl|tmp)$/i.test(name))
      .map(name => path.join(fallbackDir, name))
      .filter(p => fs.statSync(p).isFile())
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    if (files.length > 0) return files[0];
  }
  return null;
}

const jobs = new Map();

function pushJobLog(job, line) {
  job.logs.push(line);
  if (job.logs.length > 120) job.logs.splice(0, job.logs.length - 120);
  job.updatedAt = Date.now();
}

export function getDownloadJob(id) {
  return jobs.get(id) || null;
}

export function startFacebookDownload({ url, quality = '720p' }) {
  const cleanUrl = validateFacebookUrl(url);
  const mode = quality === '1080p' ? '1080p' : '720p';
  const tools = getToolsStatus();
  if (!tools.ytdlpFound) {
    throw new Error(`yt-dlp.exe was not found at ${tools.ytdlpPath}.`);
  }
  if (!tools.ffmpegFound) {
    throw new Error(`ffmpeg.exe was not found inside ${FFMPEG_ROOT_DEFAULT}.`);
  }

  const id = randomUUID();
  const job = {
    id,
    url: cleanUrl,
    quality: mode,
    status: 'running',
    stage: mode === '1080p' ? 'Downloading 1080p video stream…' : 'Downloading 720p video + audio…',
    percent: 0,
    speed: '',
    eta: '',
    logs: [],
    file: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  jobs.set(id, job);

  // Keep memory tidy (retain last 25 jobs)
  if (jobs.size > 25) {
    const oldestKey = jobs.keys().next().value;
    if (oldestKey && oldestKey !== id) jobs.delete(oldestKey);
  }

  (async () => {
    const downloadDir = tools.downloadDir;
    let tempDir = null;
    try {
      if (mode === '720p') {
        tempDir = path.join(downloadDir, `.tmp-${id.slice(0, 8)}`);
        fs.mkdirSync(tempDir, { recursive: true });
        pushJobLog(job, `Running 720p auto-merge into ${downloadDir}`);
        const args = [
          '--newline',
          '--no-playlist',
          '--ffmpeg-location', tools.ffmpegDir,
          '-f', 'bv*[height<=720]+ba/bv*[width<=720]+ba/b[height<=720]/b[width<=720]/bv*+ba/b',
          '--merge-output-format', 'mp4',
          '--windows-filenames',
          '--trim-filenames', '110',
          '-o', '%(title).80s [%(id)s].%(ext)s',
          '--print', 'after_move:filepath',
          '-P', tempDir,
          '--', cleanUrl
        ];
        const { stdoutLines } = await runCommandWithLogs(tools.ytdlpPath, args, {
          label: 'yt-dlp',
          onLine: line => {
            if (/\[Merger\]/i.test(line)) {
              job.stage = 'Merging audio & video with FFmpeg…';
              job.percent = 95;
            }
            pushJobLog(job, line);
          },
          onProgress: p => {
            job.percent = Math.min(94, p.percent);
            job.speed = p.speed;
            job.eta = p.eta;
          }
        });
        const downloadedFile = extractSavedFilePath(stdoutLines, tempDir);
        if (!downloadedFile) throw new Error('Download finished, but the output MP4 file could not be located.');
        const ext = path.extname(downloadedFile) || '.mp4';
        const rawBase = path.basename(downloadedFile, ext);
        const finalFile = uniqueFilePath(downloadDir, rawBase, ext);
        moveFileSafely(downloadedFile, finalFile);
        pushJobLog(job, `Saved as ${path.basename(finalFile)}`);
        const stat = fs.statSync(finalFile);
        const name = path.basename(finalFile);
        job.file = {
          name,
          fullPath: finalFile,
          size: stat.size,
          mtimeMs: stat.mtimeMs,
          url: `/api/fb-downloader/video/${encodeURIComponent(name)}`
        };
        job.stage = 'Ready to play!';
        job.percent = 100;
        job.status = 'completed';
        job.updatedAt = Date.now();
        return;
      }

      // 1080p workflow (Sections 3 & 4 of guide):
      // Download separate video & audio streams into a temp subfolder, then combine with FFmpeg -c copy -movflags +faststart
      tempDir = path.join(downloadDir, `.tmp-${id.slice(0, 8)}`);
      fs.mkdirSync(tempDir, { recursive: true });

      job.stage = 'Step 1/3: Downloading 1080p video stream…';
      pushJobLog(job, 'Step 1/3: Downloading video stream (bv*[height<=1080])…');
      const videoArgs = [
        '--newline',
        '--no-playlist',
        '-f', 'bv*[height<=1080]/bv*[width<=1080]/b[height<=1080]/b[width<=1080]/bv*/b',
        '--windows-filenames',
        '--trim-filenames', '100',
        '-o', '%(title).75s [%(id)s].video.%(ext)s',
        '--print', 'after_move:filepath',
        '-P', tempDir,
        '--', cleanUrl
      ];
      const videoRes = await runCommandWithLogs(tools.ytdlpPath, videoArgs, {
        label: 'yt-dlp (video)',
        onLine: line => pushJobLog(job, line),
        onProgress: p => {
          job.percent = Math.round(p.percent * 0.55);
          job.speed = p.speed;
          job.eta = p.eta;
        }
      });
      const videoFile = extractSavedFilePath(videoRes.stdoutLines, tempDir);
      if (!videoFile) throw new Error('Failed to locate downloaded 1080p video stream.');

      job.stage = 'Step 2/3: Downloading audio stream…';
      job.percent = 58;
      pushJobLog(job, 'Step 2/3: Downloading audio stream (ba)…');
      let audioFile = null;
      try {
        const audioArgs = [
          '--newline',
          '--no-playlist',
          '-f', 'ba',
          '--windows-filenames',
          '--trim-filenames', '100',
          '-o', '%(title).75s [%(id)s].audio.%(ext)s',
          '--print', 'after_move:filepath',
          '-P', tempDir,
          '--', cleanUrl
        ];
        const audioRes = await runCommandWithLogs(tools.ytdlpPath, audioArgs, {
          label: 'yt-dlp (audio)',
          onLine: line => pushJobLog(job, line),
          onProgress: p => {
            job.percent = 58 + Math.round(p.percent * 0.25);
            job.speed = p.speed;
            job.eta = p.eta;
          }
        });
        audioFile = extractSavedFilePath(audioRes.stdoutLines, tempDir);
        if (audioFile === videoFile) audioFile = null;
      } catch (audioErr) {
        pushJobLog(job, `No separate audio stream found (${audioErr.message}); using video file directly.`);
      }

      const rawBase = path.basename(videoFile).replace(/\.video\.[^.]+$/i, '').replace(/\.[^.]+$/, '');
      const finalOutputPath = uniqueFilePath(downloadDir, `${rawBase}_1080p`, '.mp4');

      job.stage = 'Step 3/3: Combining 1080p video + audio with FFmpeg…';
      job.percent = 88;
      job.speed = '';
      job.eta = '';

      if (audioFile) {
        pushJobLog(job, `Step 3/3: Running FFmpeg merge -> ${path.basename(finalOutputPath)}`);
        try {
          await runCommandWithLogs(tools.ffmpegPath, [
            '-y',
            '-i', videoFile,
            '-i', audioFile,
            '-c', 'copy',
            '-movflags', '+faststart',
            finalOutputPath
          ], {
            label: 'FFmpeg',
            onLine: line => {
              if (/frame=|time=|error|warning/i.test(line)) pushJobLog(job, line);
            }
          });
        } catch (copyErr) {
          pushJobLog(job, `Stream copy failed (${copyErr.message}); retrying with AAC audio transcode…`);
          await runCommandWithLogs(tools.ffmpegPath, [
            '-y',
            '-i', videoFile,
            '-i', audioFile,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-movflags', '+faststart',
            finalOutputPath
          ], {
            label: 'FFmpeg (fallback)',
            onLine: line => {
              if (/frame=|time=|error|warning/i.test(line)) pushJobLog(job, line);
            }
          });
        }
      } else {
        pushJobLog(job, `Step 3/3: Fast-starting video into ${path.basename(finalOutputPath)}`);
        await runCommandWithLogs(tools.ffmpegPath, [
          '-y',
          '-i', videoFile,
          '-c', 'copy',
          '-movflags', '+faststart',
          finalOutputPath
        ], {
          label: 'FFmpeg',
          onLine: line => {
            if (/frame=|time=|error|warning/i.test(line)) pushJobLog(job, line);
          }
        });
      }

      const stat = fs.statSync(finalOutputPath);
      const name = path.basename(finalOutputPath);
      job.file = {
        name,
        fullPath: finalOutputPath,
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        url: `/api/fb-downloader/video/${encodeURIComponent(name)}`
      };
      job.stage = 'Ready to play!';
      job.percent = 100;
      job.status = 'completed';
      job.updatedAt = Date.now();
    } catch (err) {
      job.status = 'failed';
      job.stage = 'Download failed';
      job.error = err.message || 'Unknown error occurred while downloading.';
      pushJobLog(job, `ERROR: ${job.error}`);
      job.updatedAt = Date.now();
    } finally {
      if (tempDir && fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }
  })();

  return job;
}
