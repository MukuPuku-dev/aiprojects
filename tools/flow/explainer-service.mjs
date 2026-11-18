import fs from 'node:fs';
import path from 'node:path';
import { loadWorkspaceCharacters } from './flow-characters.mjs';

export const GEMINI_TEXT_URL = 'https://mukeshpokharel-testing.hf.space/gemini';
export const GEMINI_TTS_URL = 'https://mukeshpokharel-testing.hf.space/geminitts';

const PROJECT_ID = /^[a-z0-9-]+$/;
const VALID_CARD_TYPES = new Set(['whiteboard-prop', 'split-compare', 'red-x', 'map-diagram', 'flat-scene']);

/** Parses sample rate from mimeType like "audio/pcm;rate=24000", defaulting to 24000 Hz. */
export function parseSampleRate(mimeType = '') {
  const m = String(mimeType).match(/rate=(\d+)/i);
  const rate = m ? Number(m[1]) : 24000;
  return Number.isFinite(rate) && rate >= 8000 && rate <= 192000 ? rate : 24000;
}

/** Wraps raw linear PCM (16-bit signed LE) bytes in a standard 44-byte RIFF/WAVE header. */
export function pcmToWav(pcmBuffer, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const buf = Buffer.isBuffer(pcmBuffer) ? pcmBuffer : Buffer.from(pcmBuffer);
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WAVE') {
    return buf;
  }
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitDepth / 8);
  const blockAlign = channels * (bitDepth / 8);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + buf.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(buf.length, 40);
  return Buffer.concat([header, buf]);
}

/** Reads approximate playback duration in seconds from a RIFF/WAVE buffer. */
export function wavDurationSeconds(wavBuffer) {
  if (!Buffer.isBuffer(wavBuffer) || wavBuffer.length < 44) return 0;
  const byteRate = wavBuffer.readUInt32LE(28);
  if (!byteRate) return 0;
  const dataSize = wavBuffer.readUInt32LE(40) || Math.max(0, wavBuffer.length - 44);
  return Math.round((dataSize / byteRate) * 1000) / 1000;
}

function writeAtomic(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, filePath);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function validateId(value, label = 'identifier') {
  if (typeof value !== 'string' || !PROJECT_ID.test(value)) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function sanitizeSlug(raw, fallback = 'custom-episode') {
  const cleaned = String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || fallback;
}

function roundSec(val) {
  return Math.round(Math.max(0, Number(val) || 0) * 1000) / 1000;
}

function stripEmotionTags(text) {
  return String(text || '').replace(/\[[^\]]+\]/g, ' ').replace(/\s+/g, ' ').trim();
}

const EMOTION_PRESETS = {
  romantic: 'warmly and tenderly',
  documentary: 'curious and conversational',
  dramatic: 'dramatic and expressive'
};

/**
 * Formats a block's beats with Gemini TTS inline emotion/delivery tags (e.g. [warmly], [whispering])
 * so the narrator expresses natural emotion while keeping beat texts clean.
 */
export function buildExpressiveBlockPrompt(beats = [], emotionMode = 'auto') {
  const list = Array.isArray(beats) ? beats : [];
  if (!list.length) return '';
  if (emotionMode === 'none') {
    return list.map(b => stripEmotionTags(b?.narration || '')).filter(Boolean).join(' ');
  }
  const presetTag = EMOTION_PRESETS[emotionMode] || 'expressively and naturally';
  let lastTag = '';
  return list
    .map((b, i) => {
      const narr = String(b?.narration || '').trim();
      if (!narr) return '';
      const explicit = String(b?.emotion || '').trim().replace(/^\[|\]$/g, '');
      const tag = emotionMode === 'auto'
        ? (explicit || (i === 0 ? 'warmly and expressively' : ''))
        : (i === 0 ? (explicit || presetTag) : explicit);
      if (tag && tag !== lastTag) {
        lastTag = tag;
        return `[${tag}] ${narr}`;
      }
      return narr;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Aligns rapid visual beats (1.5-2.5s clauses) against word-level timestamps from /geminitts
 * so voiceover plays continuously across the block while beat images snap at exact clause boundaries.
 */
export function alignBeatsToTimestamps(beats, timestamps = [], totalDuration = 0) {
  const list = Array.isArray(beats) ? beats : [];
  if (list.length === 0) return [];

  const counts = list.map(b => {
    const words = stripEmotionTags(b?.narration || '').split(/\s+/).filter(Boolean);
    return Math.max(1, words.length);
  });
  const totalWords = counts.reduce((sum, n) => sum + n, 0);
  const ts = [];
  let inBracket = false;
  for (const t of (Array.isArray(timestamps) ? timestamps : [])) {
    if (!t) continue;
    const txt = String(t.word ?? t.expected ?? '').trim();
    if (!txt) continue;
    if (inBracket) {
      if (txt.includes(']')) inBracket = false;
      continue;
    }
    if (txt.startsWith('[')) {
      if (!txt.includes(']')) inBracket = true;
      continue;
    }
    if (txt.endsWith(']') || /^\[.*\]$/.test(txt)) continue;
    if (t.start === null || t.start === undefined || t.end === null || t.end === undefined) continue;
    if (!Number.isFinite(Number(t.start)) || !Number.isFinite(Number(t.end))) continue;
    ts.push(t);
  }
  const lastTsEnd = ts.length ? Number(ts[ts.length - 1].end) : 0;
  const dur = Math.max(Number(totalDuration) || 0, lastTsEnd);

  // If word timestamps match well enough (>= 60% of expected word count), align directly on word slots.
  const canUseWords = ts.length >= Math.max(list.length, Math.floor(totalWords * 0.6));
  const timings = [];

  if (canUseWords) {
    let cursor = 0;
    for (let i = 0; i < list.length; i++) {
      const remainingBeats = list.length - i - 1;
      const remainingTotalWords = counts.slice(i).reduce((a, b) => a + b, 0);
      const remainingTs = Math.max(0, ts.length - cursor);
      let take = i === list.length - 1
        ? remainingTs
        : Math.max(1, Math.round((counts[i] / Math.max(1, remainingTotalWords)) * remainingTs));
      take = Math.min(take, Math.max(1, remainingTs - remainingBeats));

      const slice = ts.slice(cursor, cursor + take);
      cursor += slice.length;

      const startSec = i === 0
        ? 0
        : timings[i - 1].endSec;
      let endSec;
      if (i === list.length - 1) {
        endSec = Math.max(startSec + 0.25, dur || (slice[slice.length - 1]?.end ?? startSec + 2));
      } else if (slice.length > 0 && ts[cursor]) {
        // Split right in the pause midpoint between the last word of this beat and first word of next beat.
        const aEnd = Number(slice[slice.length - 1].end);
        const bStart = Number(ts[cursor].start);
        endSec = Math.max(startSec + 0.25, (aEnd + Math.max(aEnd, bStart)) / 2);
      } else {
        endSec = startSec + ((dur || totalWords * 0.4) * (counts[i] / Math.max(1, totalWords)));
      }

      timings.push({
        beat: Number(list[i]?.beat || i + 1),
        startSec: roundSec(startSec),
        endSec: roundSec(endSec),
        durationSec: roundSec(Math.max(0.25, endSec - startSec))
      });
    }
    return timings;
  }

  // Fallback proportional word-count weighting across continuous block duration.
  const fallbackTotal = dur > 0 ? dur : Math.max(list.length * 2, totalWords * 0.42);
  let tCursor = 0;
  for (let i = 0; i < list.length; i++) {
    const startSec = i === 0 ? 0 : timings[i - 1].endSec;
    const share = (counts[i] / Math.max(1, totalWords)) * fallbackTotal;
    const endSec = i === list.length - 1 ? fallbackTotal : startSec + share;
    tCursor = endSec;
    timings.push({
      beat: Number(list[i]?.beat || i + 1),
      startSec: roundSec(startSec),
      endSec: roundSec(Math.max(startSec + 0.25, tCursor)),
      durationSec: roundSec(Math.max(0.25, endSec - startSec))
    });
  }
  return timings;
}

/** Calls the configured Gemini text endpoint to generate structured English episodes/scripts. */
export async function callGeminiText(prompt, fetchImpl = fetch) {
  if (typeof prompt !== 'string' || prompt.trim().length < 10) {
    throw new Error('Story prompt is too short.');
  }
  const response = await fetchImpl(GEMINI_TEXT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt.trim() }),
    signal: AbortSignal.timeout(120000)
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Gemini returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    throw new Error(typeof body?.detail === 'string' ? body.detail : `Gemini failed (HTTP ${response.status}).`);
  }
  if (typeof body?.text !== 'string' || !body.text.trim()) {
    throw new Error('Gemini returned empty text.');
  }
  return body.text.trim();
}

async function fetchTtsAudio({ prompt, voice = 'Kore', timestamps = true, language = 'en', fetchImpl = fetch }) {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Narration text (prompt) is required.');
  }
  const selectedVoice = typeof voice === 'string' && voice.trim() ? voice.trim() : 'Kore';
  const payload = {
    prompt: prompt.trim(),
    voice: selectedVoice,
    timestamps: Boolean(timestamps),
    language: typeof language === 'string' && language.trim() ? language.trim() : 'en'
  };

  const response = await fetchImpl(GEMINI_TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(180000)
  });

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Gemini TTS returned invalid JSON (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    throw new Error(typeof body?.detail === 'string' ? body.detail : `Gemini TTS failed (HTTP ${response.status}).`);
  }
  if (typeof body?.audioBase64 !== 'string' || !body.audioBase64) {
    throw new Error('Gemini TTS did not return audioBase64.');
  }

  const rawBytes = Buffer.from(body.audioBase64, 'base64');
  const sampleRate = parseSampleRate(body.mimeType || 'audio/pcm;rate=24000');
  const wavBytes = pcmToWav(rawBytes, sampleRate);
  const duration = wavDurationSeconds(wavBytes);
  const wordTimestamps = Array.isArray(body.timestamps) ? body.timestamps : [];

  return {
    selectedVoice,
    language: payload.language,
    prompt: payload.prompt,
    wavBytes,
    duration,
    wordTimestamps
  };
}

/** Legacy per-scene TTS saver (preserved for compatibility). */
export async function generateAndSaveTts({
  root,
  project = 'ink-explainer',
  scene,
  prompt,
  voice = 'Kore',
  timestamps = true,
  language = 'en',
  fetchImpl = fetch
}) {
  const proj = validateId(project, 'project identifier');
  const sceneNum = Number(scene);
  if (!Number.isInteger(sceneNum) || sceneNum < 1 || sceneNum > 365) {
    throw new Error('scene must be an integer from 1 to 365.');
  }

  const tts = await fetchTtsAudio({ prompt, voice, timestamps, language, fetchImpl });
  const audioDir = path.join(root, 'projects', proj, 'audio');
  const num = pad2(sceneNum);
  const wavFile = path.join(audioDir, `scene-${num}.wav`);
  const metaFile = path.join(audioDir, `scene-${num}.json`);

  writeAtomic(wavFile, tts.wavBytes);
  const meta = {
    scene: sceneNum,
    voice: tts.selectedVoice,
    language: tts.language,
    mimeType: 'audio/wav',
    duration: tts.duration,
    timestamps: tts.wordTimestamps,
    prompt: tts.prompt,
    updatedAt: new Date().toISOString()
  };
  writeAtomic(metaFile, JSON.stringify(meta, null, 2));

  return {
    ok: true,
    scene: sceneNum,
    audioUrl: `/projects/${proj}/audio/scene-${num}.wav`,
    duration: tts.duration,
    timestamps: tts.wordTimestamps,
    voice: tts.selectedVoice
  };
}

/** Synthesizes continuous voiceover for a narration block and aligns all its 1.5-2.5s visual beats. */
export async function generateAndSaveBlockTts({
  root,
  project = 'ink-explainer',
  episodeId = 'ancient-humans-day',
  blockId,
  beats = [],
  prompt,
  voice = 'Kore',
  emotionMode = 'auto',
  language = 'en',
  fetchImpl = fetch
}) {
  const proj = validateId(project, 'project identifier');
  const epId = validateId(episodeId, 'episode identifier');
  const blkNum = Number(blockId);
  if (!Number.isInteger(blkNum) || blkNum < 1 || blkNum > 100) {
    throw new Error('blockId must be an integer from 1 to 100.');
  }
  const spokenText = (typeof prompt === 'string' && prompt.trim())
    ? prompt.trim()
    : buildExpressiveBlockPrompt(beats, emotionMode);

  const tts = await fetchTtsAudio({ prompt: spokenText, voice, timestamps: true, language, fetchImpl });
  const beatTimings = alignBeatsToTimestamps(beats, tts.wordTimestamps, tts.duration);

  const audioDir = path.join(root, 'projects', proj, 'episodes', epId, 'audio');
  const num = pad2(blkNum);
  const wavFile = path.join(audioDir, `block-${num}.wav`);
  const metaFile = path.join(audioDir, `block-${num}.json`);

  writeAtomic(wavFile, tts.wavBytes);
  const meta = {
    episodeId: epId,
    blockId: blkNum,
    voice: tts.selectedVoice,
    language: tts.language,
    mimeType: 'audio/wav',
    duration: tts.duration,
    timestamps: tts.wordTimestamps,
    beatTimings,
    prompt: tts.prompt,
    updatedAt: new Date().toISOString()
  };
  writeAtomic(metaFile, JSON.stringify(meta, null, 2));

  return {
    ok: true,
    episodeId: epId,
    blockId: blkNum,
    audioUrl: `/projects/${proj}/episodes/${epId}/audio/block-${num}.wav`,
    duration: tts.duration,
    timestamps: tts.wordTimestamps,
    beatTimings,
    voice: tts.selectedVoice
  };
}

/** Saves or deletes a rapid-beat episode under projects/<project>/episodes/<episodeId>/episode.json. */
export function saveEpisode(root, project = 'ink-explainer', episode) {
  const proj = validateId(project, 'project identifier');
  if (episode?.delete && episode?.id) {
    const epId = validateId(episode.id, 'episode identifier');
    const dir = path.join(root, 'projects', proj, 'episodes', epId);
    if (epId !== 'ancient-humans-day' && fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    return null;
  }
  if (!episode || typeof episode !== 'object' || !Array.isArray(episode.blocks) || episode.blocks.length === 0) {
    throw new Error('Episode must contain a non-empty blocks array.');
  }

  const epId = sanitizeSlug(episode.id || episode.title);
  let globalBeat = 0;
  const cleanBlocks = episode.blocks.map((blk, bIdx) => {
    const bId = bIdx + 1;
    const rawBeats = Array.isArray(blk?.beats) ? blk.beats : [];
    const beats = rawBeats.map(b => {
      globalBeat += 1;
      const cardType = VALID_CARD_TYPES.has(b?.cardType) ? b.cardType : 'flat-scene';
      return {
        beat: globalBeat,
        cardType,
        label: String(b?.label || '').trim(),
        emotion: String(b?.emotion || '').trim(),
        characters: Array.isArray(b?.characters) ? b.characters.map(c => String(c || '').trim().toUpperCase()).filter(Boolean) : [],
        narration: String(b?.narration || '').trim(),
        visual: String(b?.visual || '').trim()
      };
    });
    return {
      blockId: bId,
      title: String(blk?.title || `Block ${bId}`).trim(),
      beats
    };
  });

  if (globalBeat === 0) {
    throw new Error('Episode must contain at least one beat.');
  }

  const clean = {
    id: epId,
    title: String(episode.title || 'Untitled Explainer Episode').trim(),
    subtitle: String(episode.subtitle || 'Rapid-Beat Explainer').trim(),
    hook: String(episode.hook || '').trim(),
    niche: String(episode.niche || 'History & Human Curiosity').trim(),
    language: String(episode.language || 'en').trim() === 'ne' ? 'ne' : 'en',
    characters: Array.isArray(episode.characters)
      ? episode.characters
          .filter(c => c && (c.code || c.name))
          .map(c => ({
            code: String(c.code || c.name).trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_'),
            name: String(c.name || c.code).trim(),
            role: String(c.role || '').trim(),
            refPrompt: String(c.refPrompt || '').trim()
          }))
      : [],
    blocks: cleanBlocks,
    updatedAt: new Date().toISOString()
  };

  const file = path.join(root, 'projects', proj, 'episodes', epId, 'episode.json');
  writeAtomic(file, JSON.stringify(clean, null, 2));
  return clean;
}

/** Loads an episode JSON if saved on disk. */
export function loadEpisode(root, project = 'ink-explainer', episodeId = 'ancient-humans-day') {
  const proj = validateId(project, 'project identifier');
  const epId = validateId(episodeId, 'episode identifier');
  const file = path.join(root, 'projects', proj, 'episodes', epId, 'episode.json');
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && Array.isArray(parsed.blocks) ? parsed : null;
  } catch {
    return null;
  }
}

/** Lists available saved episodes under projects/<project>/episodes/. */
export function listEpisodes(root, project = 'ink-explainer') {
  const proj = validateId(project, 'project identifier');
  const episodesDir = path.join(root, 'projects', proj, 'episodes');
  const items = [];
  let hasDefault = false;

  if (fs.existsSync(episodesDir)) {
    for (const entry of fs.readdirSync(episodesDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !PROJECT_ID.test(entry.name)) continue;
      const ep = loadEpisode(root, proj, entry.name);
      if (!ep) continue;
      if (ep.id === 'ancient-humans-day') hasDefault = true;
      const totalBeats = ep.blocks.reduce((n, b) => n + (Array.isArray(b.beats) ? b.beats.length : 0), 0);
      items.push({
        id: ep.id,
        title: ep.title,
        subtitle: ep.subtitle || '',
        totalBlocks: ep.blocks.length,
        totalBeats,
        updatedAt: ep.updatedAt || '',
        isDefault: ep.id === 'ancient-humans-day'
      });
    }
  }

  if (!hasDefault) {
    items.unshift({
      id: 'ancient-humans-day',
      title: 'What Did Ancient Humans Actually Do All Day?',
      subtitle: '32 Rapid Visual Beats · Built-in Default Episode',
      totalBlocks: 4,
      totalBeats: 32,
      updatedAt: '',
      isDefault: true
    });
  }
  return items;
}

/** Saves or resets custom-story.json (legacy single-story API preserved). */
export function saveCustomStory(root, project = 'ink-explainer', story) {
  const proj = validateId(project, 'project identifier');
  const file = path.join(root, 'projects', proj, 'custom-story.json');
  if (!story || story.reset) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return null;
  }
  if (typeof story !== 'object' || !Array.isArray(story.scenes) || story.scenes.length === 0) {
    throw new Error('Story must contain a non-empty scenes array.');
  }
  const clean = {
    title: String(story.title || 'Untitled Explainer').trim(),
    subtitle: String(story.subtitle || 'English Narrated Illustrated Story').trim(),
    hook: String(story.hook || '').trim(),
    niche: String(story.niche || 'History & Human Curiosity').trim(),
    scenes: story.scenes.map((s, idx) => ({
      scene: idx + 1,
      chapter: String(s.chapter || `Part ${idx + 1}`).trim(),
      title: String(s.title || `Scene ${idx + 1}`).trim(),
      narration: String(s.narration || '').trim(),
      visual: String(s.visual || '').trim(),
      kenBurns: ['zoom-in', 'zoom-out', 'pan-left', 'pan-right'].includes(s.kenBurns) ? s.kenBurns : 'zoom-in'
    })),
    updatedAt: new Date().toISOString()
  };
  writeAtomic(file, JSON.stringify(clean, null, 2));
  return clean;
}

/** Loads custom-story.json if present. */
export function loadCustomStory(root, project = 'ink-explainer') {
  const proj = validateId(project, 'project identifier');
  const file = path.join(root, 'projects', proj, 'custom-story.json');
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && Array.isArray(parsed.scenes) ? parsed : null;
  } catch {
    return null;
  }
}

/** Deletes a single generated beat image from disk so batch generation will regenerate only missing beats. */
export function deleteBeatImage(root, project = 'ink-explainer', episodeId = 'ancient-humans-day', beatNum) {
  const proj = validateId(project, 'project identifier');
  const epId = validateId(episodeId, 'episode identifier');
  const num = Number(beatNum);
  if (!Number.isInteger(num) || num < 1 || num > 365) {
    throw new Error('beat must be an integer from 1 to 365.');
  }
  const dir = path.join(root, 'projects', proj, 'episodes', epId, 'images');
  const stem = `beat-${pad2(num)}`;
  let deleted = false;
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const file = path.join(dir, `${stem}${ext}`);
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      deleted = true;
    }
  }
  return { ok: true, deleted, beat: num };
}

/** Saves a manually pasted/uploaded beat image to disk so it is used immediately and skipped by Batch Flow. */
export function saveBeatImage(root, project = 'ink-explainer', episodeId = 'ancient-humans-day', beatNum, imageBuffer, ext = '.png') {
  const proj = validateId(project, 'project identifier');
  const epId = validateId(episodeId, 'episode identifier');
  const num = Number(beatNum);
  if (!Number.isInteger(num) || num < 1 || num > 365) {
    throw new Error('beat must be an integer from 1 to 365.');
  }
  const buf = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer || []);
  if (!buf.length) throw new Error('Image file is empty.');
  const cleanExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(String(ext || '').toLowerCase())
    ? String(ext).toLowerCase()
    : '.png';
  deleteBeatImage(root, proj, epId, num);
  const fileName = `beat-${pad2(num)}${cleanExt}`;
  const outPath = path.join(root, 'projects', proj, 'episodes', epId, 'images', fileName);
  writeAtomic(outPath, buf);
  return { ok: true, beat: num, url: `/projects/${proj}/episodes/${epId}/images/${fileName}` };
}

/** Builds a dedicated, concise Google Flow project name per Ink Explainer episode. */
export function episodeFlowProjectName(root, project = 'ink-explainer', episodeId = '', baseFlowProject = 'Ink Explainer') {
  const base = String(baseFlowProject || 'Ink Explainer').trim();
  const epId = typeof episodeId === 'string' ? episodeId.trim() : '';
  if (!epId) return base;
  const ep = loadEpisode(root, project, epId);
  const rawTitle = ep?.title || (epId === 'ancient-humans-day' ? 'Ancient Humans All Day' : epId);
  const shortTitle = rawTitle.replace(/\s+/g, ' ').trim().slice(0, 42).trim();
  return shortTitle ? `${base} · ${shortTitle}` : base;
}

/** Lists local beat images, continuous block audio tracks, and episode metadata. */
export function listExplainerAssets(root, project = 'ink-explainer', episodeId = 'ancient-humans-day') {
  const proj = validateId(project, 'project identifier');
  const epId = validateId(episodeId || 'ancient-humans-day', 'episode identifier');
  const videosDir = path.join(root, 'projects', proj, 'videos');
  const audioDir = path.join(root, 'projects', proj, 'audio');
  const epImagesDir = path.join(root, 'projects', proj, 'episodes', epId, 'images');
  const epAudioDir = path.join(root, 'projects', proj, 'episodes', epId, 'audio');

  const images = {};
  const audio = {};
  const beatImages = {};
  const blockAudio = {};

  if (fs.existsSync(videosDir)) {
    for (const entry of fs.readdirSync(videosDir)) {
      const m = entry.match(/^day-(\d+)\.(png|jpe?g|webp)$/i);
      if (m) {
        const idx = Number(m[1]);
        const stat = fs.statSync(path.join(videosDir, entry));
        images[idx] = { url: `/projects/${proj}/videos/${entry}?t=${Math.floor(stat.mtimeMs)}`, file: entry };
      }
    }
  }

  if (fs.existsSync(audioDir)) {
    for (const entry of fs.readdirSync(audioDir)) {
      const m = entry.match(/^scene-(\d+)\.wav$/i);
      if (!m) continue;
      const idx = Number(m[1]);
      const stat = fs.statSync(path.join(audioDir, entry));
      const metaPath = path.join(audioDir, `scene-${m[1]}.json`);
      let meta = {};
      if (fs.existsSync(metaPath)) {
        try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
      }
      audio[idx] = {
        url: `/projects/${proj}/audio/${entry}?t=${Math.floor(stat.mtimeMs)}`,
        duration: Number(meta.duration || 0),
        timestamps: Array.isArray(meta.timestamps) ? meta.timestamps : [],
        voice: meta.voice || 'Kore',
        prompt: meta.prompt || ''
      };
    }
  }

  if (fs.existsSync(epImagesDir)) {
    for (const entry of fs.readdirSync(epImagesDir)) {
      const m = entry.match(/^beat-(\d+)\.(png|jpe?g|webp)$/i);
      if (m) {
        const idx = Number(m[1]);
        const stat = fs.statSync(path.join(epImagesDir, entry));
        beatImages[idx] = { url: `/projects/${proj}/episodes/${epId}/images/${entry}?t=${Math.floor(stat.mtimeMs)}`, file: entry };
      }
    }
  }

  if (fs.existsSync(epAudioDir)) {
    for (const entry of fs.readdirSync(epAudioDir)) {
      const m = entry.match(/^block-(\d+)\.wav$/i);
      if (!m) continue;
      const blkId = Number(m[1]);
      const stat = fs.statSync(path.join(epAudioDir, entry));
      const metaPath = path.join(epAudioDir, `block-${m[1]}.json`);
      let meta = {};
      if (fs.existsSync(metaPath)) {
        try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch {}
      }
      blockAudio[blkId] = {
        url: `/projects/${proj}/episodes/${epId}/audio/${entry}?t=${Math.floor(stat.mtimeMs)}`,
        duration: Number(meta.duration || 0),
        timestamps: Array.isArray(meta.timestamps) ? meta.timestamps : [],
        beatTimings: Array.isArray(meta.beatTimings) ? meta.beatTimings : [],
        voice: meta.voice || 'Kore',
        prompt: meta.prompt || ''
      };
    }
  }

  const charScope = `${proj}/episodes/${epId}`;
  const storedChars = loadWorkspaceCharacters(root, charScope);
  const episodeCharacters = {};
  for (const [code, entry] of Object.entries(storedChars)) {
    const fileName = entry.imageFile ? path.basename(entry.imageFile) : '';
    let imageUrl = '';
    if (fileName && fs.existsSync(entry.imageFile)) {
      const stat = fs.statSync(entry.imageFile);
      imageUrl = `/projects/${proj}/episodes/${epId}/characters/${fileName}?t=${Math.floor(stat.mtimeMs)}`;
    }
    episodeCharacters[code] = {
      code,
      name: entry.name || code,
      refPrompt: entry.refPrompt || '',
      imageUrl
    };
  }

  let exportedVideoUrl = '';
  for (const fname of ['episode.mp4', 'episode.webm']) {
    const exportPath = path.join(root, 'projects', proj, 'episodes', epId, fname);
    if (fs.existsSync(exportPath)) {
      const stat = fs.statSync(exportPath);
      exportedVideoUrl = `/projects/${proj}/episodes/${epId}/${fname}?t=${Math.floor(stat.mtimeMs)}`;
      break;
    }
  }

  return {
    ok: true,
    project: proj,
    activeEpisodeId: epId,
    flowProject: episodeFlowProjectName(root, proj, epId),
    exportedVideoUrl,
    episodes: listEpisodes(root, proj),
    episode: loadEpisode(root, proj, epId),
    episodeCharacters,
    beatImages,
    blockAudio,
    images,
    audio,
    story: loadCustomStory(root, proj)
  };
}
