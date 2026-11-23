import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const DEFAULT_OUTRO_FILENAME = 'Breakfast_Club_3s_to_6s.mp4';
export const TRANSCRIBE_URL = process.env.TRANSCRIBE_URL || 'https://mukeshpokharel-testing.hf.space/transcribe';

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
  const evenW = width % 2 === 0 ? width : width + 1;
  const evenH = height % 2 === 0 ? height : height + 1;
  const duration = Math.max(0.5, Number(info.format?.duration) || 8);
  return { width: evenW, height: evenH, hasAudio, duration };
}

/** Strips speaker prefixes ("WIFE:", "HUSBAND:") and stage cues ("*BZZZZT!*") to get clean spoken text. */
export function cleanSpokenDialogue(rawDialogue = '') {
  return String(rawDialogue || '')
    .split(/\r?\n|\|/)
    .map(line => line.replace(/^\s*[A-Za-z0-9 _/-]{1,24}:\s*/, '').replace(/\*[^*]+\*/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extracts the dialogue section from a PurpleStick Flow prompt if dialogueText wasn't passed explicitly. */
export function extractSpokenDialogueFromPrompt(prompt = '') {
  const m = String(prompt || '').match(/EXACT (?:ENGLISH|HINDI|NEPALI)?\s*DIALOGUE[^:\n]*:\s*\n([\s\S]*?)(?:\n\n[A-Z][A-Z0-9 &()/-]+:|$)/i);
  if (!m) return '';
  return cleanSpokenDialogue(m[1]);
}

export function transcribeLangCode(lang = 'en') {
  const clean = String(lang || 'en').trim().toLowerCase();
  if (clean === 'hi' || clean === 'hi-in' || clean === 'hindi') return 'hi-IN';
  if (clean === 'ne' || clean === 'ne-np' || clean === 'nepali') return 'ne-NP';
  return 'en-US';
}

/** Escapes a local file path for FFmpeg's libass filter argument on Windows & POSIX. */
function escapeFfmpegFilterPath(filePath) {
  return String(filePath).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
}

function fmtAssTime(sec) {
  const totalCs = Math.max(0, Math.round((Number(sec) || 0) * 100));
  const h = Math.floor(totalCs / 360000);
  const m = Math.floor((totalCs % 360000) / 6000);
  const s = Math.floor((totalCs % 6000) / 100);
  const cs = totalCs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function escapeAssText(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\r?\n/g, '\\N');
}

/**
 * Groups per-word timestamps into bold viral 4–7 word Reels caption phrases,
 * keeping each word's exact [start, end] so the active spoken word highlights in bright yellow!
 */
export function groupWordsIntoCaptionChunks(timestamps = [], maxDuration = 10, language = 'en') {
  const isLatin = transcribeLangCode(language) === 'en-US';
  const words = (Array.isArray(timestamps) ? timestamps : [])
    .filter(w => w && String(w.word ?? w.expected ?? '').trim())
    .map(w => {
      const raw = String(w.word ?? w.expected).trim();
      return {
        word: isLatin ? raw.toUpperCase() : raw,
        start: Math.max(0, Number(w.start) || 0),
        end: Math.max(0, Number(w.end) || 0)
      };
    })
    .filter(w => w.end >= w.start);

  if (!words.length) return [];

  const chunks = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    const start = current[0].start;
    const end = Math.max(start + 0.15, current[current.length - 1].end);
    chunks.push({ words: current, text: current.map(w => w.word).join(' '), start, end });
    current = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prev = current.length ? current[current.length - 1] : null;
    const gap = prev ? (w.start - prev.end) : 0;

    if (prev && gap >= 0.45) {
      flush();
    }

    current.push(w);
    const joinedLen = current.map(x => x.word).join(' ').length;
    const endsSentence = /[.!?]$/.test(w.word);

    if (endsSentence && current.length >= 2) {
      flush();
    } else if (current.length >= 6 || joinedLen >= 34) {
      flush();
    }
  }
  flush();

  // Smooth tiny gaps between chunks
  for (let i = 0; i < chunks.length; i++) {
    const next = chunks[i + 1];
    if (next && next.start > chunks[i].end && next.start - chunks[i].end < 0.2) {
      chunks[i].end = next.start;
    } else if (!next) {
      chunks[i].end = Math.min(maxDuration, chunks[i].end + 0.25);
    }
  }
  return chunks;
}

/**
 * Builds a complete ASS subtitle document with:
 * - PurpleStick brand watermark at top-center
 * - Bold ALL-CAPS white sentence phrases with thick black outline, where the currently spoken
 *   word moves in bright yellow (&H0000EAFF&) synced to exact word-level timestamps!
 */
export function buildPurpleStickAss({ timestamps = [], duration = 10, includeLogo = true, language = 'en' }) {
  const isDevanagari = transcribeLangCode(language) !== 'en-US';
  const capFont = isDevanagari ? 'Nirmala UI' : 'Poppins';
  const capSize = isDevanagari ? 54 : 58;
  const chunks = groupWordsIntoCaptionChunks(timestamps, duration, language);
  const lines = [
    '[Script Info]',
    'ScriptType: v4.00+',
    'PlayResX: 720',
    'PlayResY: 1280',
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: BrandLogo,Poppins,56,&H00F755A8,&H00F755A8,&H00FFFFFF,&H80000000,-1,0,0,0,100,100,1,0,1,4,2,8,30,30,52,1',
    `Style: CapBase,${capFont},${capSize},&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,1,6,2,2,36,36,220,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text'
  ];

  if (includeLogo) {
    lines.push(`Dialogue: 1,${fmtAssTime(0)},${fmtAssTime(duration)},BrandLogo,,0,0,0,,PurpleStick`);
  }

  for (const chunk of chunks) {
    const ws = chunk.words;
    for (let k = 0; k < ws.length; k++) {
      const wStart = k === 0 ? chunk.start : Math.max(chunk.start, ws[k].start);
      const nextWordStart = ws[k + 1] ? ws[k + 1].start : chunk.end;
      const wEnd = Math.max(wStart + 0.05, Math.min(chunk.end, Math.max(ws[k].end, nextWordStart)));
      const rendered = ws.map((w, idx) => {
        const safe = escapeAssText(w.word);
        return idx === k ? `{\\c&H0000EAFF&}${safe}{\\c&H00FFFFFF&}` : safe;
      }).join(' ');
      lines.push(`Dialogue: 2,${fmtAssTime(wStart)},${fmtAssTime(wEnd)},CapBase,,0,0,0,,${rendered}`);
    }
  }

  return lines.join('\n') + '\n';
}

/** Extracts mono 16kHz WAV audio from an MP4 and sends it to the HF Space /transcribe endpoint. */
export async function transcribeVideoAudio(videoPath, { ffmpegBin, expectedText = '', duration = 0, language = 'en-US', log, fetchImpl = fetch } = {}) {
  const ffmpeg = ffmpegBin || findFfmpegBin();
  const wavPath = `${videoPath}.audio.tmp.wav`;
  try {
    await runBin(ffmpeg, ['-y', '-i', videoPath, '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', wavPath]);
    const audioBase64 = fs.readFileSync(wavPath).toString('base64');
    log?.(`Sending extracted audio (${Math.round(audioBase64.length / 1024)} KB b64) to ${TRANSCRIBE_URL} for word timestamps…`);
    const response = await fetchImpl(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: 'audio/wav',
        language,
        text: expectedText || null,
        duration: duration > 0 ? duration : null
      }),
      signal: AbortSignal.timeout(120000)
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) {
      throw new Error(body?.detail || `Transcribe HTTP ${response.status}`);
    }
    const aligned = Array.isArray(body.timestamps) ? body.timestamps : [];
    const heard = Array.isArray(body.heard) ? body.heard : [];

    // Prefer aligned (exact spelling) when at least half of words matched; otherwise use verbatim heard words
    if (aligned.length && heard.length) {
      const matched = aligned.filter(w => w.status && w.status !== 'estimated').length;
      if (matched / aligned.length >= 0.45) {
        log?.(`Received ${aligned.length} aligned word timestamps (${matched}/${aligned.length} matched).`);
        return aligned;
      }
      log?.(`Flow improvised dialogue (${matched}/${aligned.length} matched); using ${heard.length} verbatim heard timestamps.`);
      return heard;
    }
    const chosen = aligned.length ? aligned : heard;
    log?.(`Received ${chosen.length} word timestamps.`);
    return chosen;
  } finally {
    try { if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath); } catch {}
  }
}

/**
 * Post-processes a Flow-generated PurpleStick MP4:
 * 1) Extracts audio -> gets exact word timestamps from /transcribe -> burns synced viral captions + PurpleStick logo.
 * 2) Appends Breakfast_Club_3s_to_6s.mp4 (letterboxed into the same 9:16 canvas with normalized audio).
 * 3) Atomically replaces videoPath in place.
 */
export async function appendPurpleStickOutro(videoPath, {
  root,
  outroPath,
  prompt = '',
  dialogueText = '',
  language = 'en',
  burnSubtitles = true,
  log
} = {}) {
  const ffmpeg = findFfmpegBin();
  const ffprobe = findFfprobeBin(ffmpeg);
  const outro = outroPath || resolvePurpleStickOutro(root);
  const mainInfo = await probeVideo(ffprobe, videoPath);
  const { width: W, height: H } = mainInfo;
  const langCode = transcribeLangCode(language);

  let assPath = null;
  let wordTimestamps = [];
  if (burnSubtitles) {
    if (mainInfo.hasAudio) {
      const expectedText = cleanSpokenDialogue(dialogueText) || extractSpokenDialogueFromPrompt(prompt);
      try {
        wordTimestamps = await transcribeVideoAudio(videoPath, {
          ffmpegBin: ffmpeg,
          expectedText,
          duration: mainInfo.duration,
          language: langCode,
          log
        });
      } catch (err) {
        log?.(`Audio transcription warning (continuing with logo + outro): ${err.message}`);
      }
    }
    const assContent = buildPurpleStickAss({
      timestamps: wordTimestamps,
      duration: mainInfo.duration,
      includeLogo: true,
      language: langCode
    });
    assPath = `${videoPath}.subs.tmp.ass`;
    fs.writeFileSync(assPath, assContent, 'utf8');
  }

  const vScale = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p`;
  const aNorm = 'aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo';
  const fontsDir = root ? escapeFfmpegFilterPath(root) : '';
  const assFilter = assPath
    ? `,ass='${escapeFfmpegFilterPath(assPath)}'${fontsDir ? `:fontsdir='${fontsDir}'` : ''}`
    : '';

  const tmpOut = `${videoPath}.outro.tmp.mp4`;
  try {
    if (outro && fs.existsSync(outro)) {
      const outroInfo = await probeVideo(ffprobe, outro);
      const a0Filter = mainInfo.hasAudio
        ? `[0:a]${aNorm}[a0]`
        : `anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${mainInfo.duration.toFixed(3)}[a0]`;
      const a1Filter = outroInfo.hasAudio
        ? `[1:a]${aNorm}[a1]`
        : `anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration=${outroInfo.duration.toFixed(3)}[a1]`;

      const filterComplex = [
        `[0:v]${vScale}${assFilter}[v0]`,
        `[1:v]${vScale}[v1]`,
        a0Filter,
        a1Filter,
        '[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]'
      ].join(';');

      log?.(`Rendering final PurpleStick video (${wordTimestamps.length} synced words + ${path.basename(outro)})…`);
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
      log?.(`Saved final PurpleStick video: ${path.basename(videoPath)}`);
      return { appended: true, subtitled: Boolean(assPath), words: wordTimestamps.length, outFile: videoPath, outro };
    }

    if (assPath) {
      log?.(`Burning synced captions + logo into ${path.basename(videoPath)} (no outro found)…`);
      await runBin(ffmpeg, [
        '-y',
        '-i', videoPath,
        '-vf', `${vScale}${assFilter}`,
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
      return { appended: false, subtitled: true, words: wordTimestamps.length, outFile: videoPath };
    }

    return { appended: false, subtitled: false, words: 0, outFile: videoPath };
  } catch (err) {
    try { if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut); } catch {}
    throw err;
  } finally {
    try { if (assPath && fs.existsSync(assPath)) fs.unlinkSync(assPath); } catch {}
  }
}
