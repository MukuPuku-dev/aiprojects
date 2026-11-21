import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const DEFAULT_OUTRO_FILENAME = 'Breakfast_Club_3s_to_6s.mp4';

export function findFfmpegBin() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  const known = ['C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'];
  for (const p of known) if (fs.existsSync(p)) return p;
  const home = process.env.USERPROFILE || process.env.HOME || os.homedir() || '';
  const extDir = path.join(home, '.vscode', 'extensions');
  if (fs.existsSync(extDir)) {
    for (const entry of fs.readdirSync(extDir)) {
      const candidate = path.join(extDir, entry, 'bin', 'ffmpeg.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return 'ffmpeg';
}

export function findFfprobeBin(ffmpegBin) {
  if (ffmpegBin && /ffmpeg(\.exe)?$/i.test(ffmpegBin)) {
    const sibling = ffmpegBin.replace(/ffmpeg(\.exe)?$/i, 'ffprobe$1');
    if (fs.existsSync(sibling)) return sibling;
  }
  const known = ['C:\\ffmpeg\\bin\\ffprobe.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe'];
  for (const p of known) if (fs.existsSync(p)) return p;
  return 'ffprobe';
}

export function resolvePurpleStickOutro(root) {
  const home = process.env.USERPROFILE || process.env.HOME || os.homedir() || '';
  const candidates = [
    root ? path.join(root, 'projects', 'purplestick', 'assets', DEFAULT_OUTRO_FILENAME) : '',
    root ? path.join(root, 'projects', 'purplestick', DEFAULT_OUTRO_FILENAME) : '',
    root ? path.join(root, 'projects', 'purplestick', 'outro.mp4') : '',
    path.join(home, 'Downloads', DEFAULT_OUTRO_FILENAME)
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p) && fs.lstatSync(p).isFile()) || null;
}

function runBin(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d.toString(); });
    child.stderr.on('data', d => { stderr += d.toString(); if (stderr.length > 4000) stderr = stderr.slice(-4000); });
    child.on('error', reject);
    child.on('close', code => (code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr || `${bin} exited ${code}`))));
  });
}

async function probeVideo(ffprobeBin, filePath) {
  const { stdout } = await runBin(ffprobeBin, [
    '-v', 'error',
    '-show_entries', 'stream=codec_type,width,height:format=duration',
    '-of', 'json',
    filePath
  ]);
  const info = JSON.parse(stdout || '{}');
  const streams = Array.isArray(info.streams) ? info.streams : [];
  const v = streams.find(s => s.codec_type === 'video') || {};
  const hasAudio = streams.some(s => s.codec_type === 'audio');
  const width = Number(v.width) > 0 ? Number(v.width) : 720;
  const height = Number(v.height) > 0 ? Number(v.height) : 1280;
  // Ensure even dimensions for libx264 yuv420p
  const evenW = width % 2 === 0 ? width : width + 1;
  const evenH = height % 2 === 0 ? height : height + 1;
  const duration = Math.max(0.5, Number(info.format?.duration) || 8);
  return { width: evenW, height: evenH, hasAudio, duration };
}

/**
 * Appends the PurpleStick laughing-meme outro clip onto the end of a Flow-generated MP4
 * and atomically replaces the file in place so downstream social posting uses the final video.
 */
export async function appendPurpleStickOutro(videoPath, { root, outroPath, log } = {}) {
  const outro = outroPath || resolvePurpleStickOutro(root);
  if (!outro || !fs.existsSync(outro)) {
    log?.(`PurpleStick outro not found (${DEFAULT_OUTRO_FILENAME}); keeping original Flow video.`);
    return { appended: false, outFile: videoPath };
  }
  const ffmpeg = findFfmpegBin();
  const ffprobe = findFfprobeBin(ffmpeg);
  const mainInfo = await probeVideo(ffprobe, videoPath);
  const outroInfo = await probeVideo(ffprobe, outro);
  const { width: W, height: H } = mainInfo;

  const vScale = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p`;
  const aNorm = 'aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo';

  const a0Filter = mainInfo.hasAudio
    ? `[0:a]${aNorm}[a0]`
    : `anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${mainInfo.duration.toFixed(3)}[a0]`;
  const a1Filter = outroInfo.hasAudio
    ? `[1:a]${aNorm}[a1]`
    : `anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${outroInfo.duration.toFixed(3)}[a1]`;

  const filterComplex = [
    `[0:v]${vScale}[v0]`,
    `[1:v]${vScale}[v1]`,
    a0Filter,
    a1Filter,
    '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]'
  ].join(';');

  const tmpOut = `${videoPath}.outro.tmp.mp4`;
  log?.(`Appending PurpleStick outro (${path.basename(outro)}) to ${path.basename(videoPath)} (${W}x${H})…`);
  try {
    await runBin(ffmpeg, [
      '-y',
      '-i', videoPath,
      '-i', outro,
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-map', '[a]',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '20',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      tmpOut
    ]);
    fs.renameSync(tmpOut, videoPath);
    log?.(`Saved final PurpleStick video with outro: ${path.basename(videoPath)}`);
    return { appended: true, outFile: videoPath, outro };
  } catch (err) {
    try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch {}
    throw err;
  }
}
