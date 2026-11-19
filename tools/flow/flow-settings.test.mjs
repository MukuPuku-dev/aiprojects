import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { effectiveSettings, normalizeSettings, studioProjectName } from './flow-settings.mjs';
import {
  alignBeatsToTimestamps,
  buildExpressiveBlockPrompt,
  deleteBeatImage,
  episodeFlowProjectName,
  generateAndSaveBlockTts,
  generateAndSaveTts,
  listEpisodes,
  listExplainerAssets,
  loadCustomStory,
  loadEpisode,
  pcmToWav,
  saveBeatImage,
  saveCustomStory,
  saveEpisode,
  wavDurationSeconds
} from './explainer-service.mjs';

test('uses the studio card name as the Flow project name', () => {
  assert.equal(studioProjectName('daily-motivations'), 'Daily Motivations');
  assert.equal(studioProjectName('gk-questions'), 'GK Questions');
  assert.equal(studioProjectName('teenage-love-vibes'), 'Teenage Love Vibes');
  assert.equal(studioProjectName('maya-photos'), 'माया');
  assert.equal(studioProjectName('jindagi-kitaab'), 'जिन्दगीको किताब');
  assert.equal(studioProjectName('tarkari-katha'), 'तरकारीको कथा');
  assert.equal(studioProjectName('stickman-lantern'), 'The Last Lantern');
  assert.equal(studioProjectName('ink-explainer'), 'Ink Explainer');
});

test('returns null for a workspace the studio does not list', () => {
  assert.equal(studioProjectName('no-such-workspace'), null);
});

test('tiktok and facebook autoPost default to false and support per-project overrides', () => {
  const base = normalizeSettings({});
  assert.equal(base.defaults.tiktok.autoPost, false);
  assert.equal(base.defaults.facebook.autoPost, false);
  assert.equal(effectiveSettings(base, 'jindagi-kitaab').tiktok.autoPost, false);
  assert.equal(effectiveSettings(base, 'jindagi-kitaab').facebook.autoPost, false);

  const customized = normalizeSettings({
    defaults: { tiktok: { autoPost: false }, facebook: { autoPost: false } },
    projects: { 'jindagi-kitaab': { tiktok: { autoPost: true }, facebook: { autoPost: true } } }
  });
  assert.equal(effectiveSettings(customized, 'daily-motivations').tiktok.autoPost, false);
  assert.equal(effectiveSettings(customized, 'daily-motivations').facebook.autoPost, false);
  assert.equal(effectiveSettings(customized, 'jindagi-kitaab').tiktok.autoPost, true);
  assert.equal(effectiveSettings(customized, 'jindagi-kitaab').facebook.autoPost, true);
});

test('characters.consistency defaults to false and supports per-project overrides', () => {
  const base = normalizeSettings({});
  assert.equal(base.defaults.characters.consistency, false);
  assert.equal(effectiveSettings(base, 'gk-questions').characters.consistency, false);

  const customized = normalizeSettings({
    projects: { 'teenage-love-vibes': { characters: { consistency: true } } }
  });
  assert.equal(effectiveSettings(customized, 'gk-questions').characters.consistency, false);
  assert.equal(effectiveSettings(customized, 'teenage-love-vibes').characters.consistency, true);
});

test('telegram settings default to autoPost true, chatId 7223190114, and placeholder token', () => {
  const base = normalizeSettings({});
  assert.equal(base.defaults.telegram.autoPost, true);
  assert.equal(base.defaults.telegram.botToken, 'PASTE_YOUR_BOTFATHER_TOKEN_HERE');
  assert.equal(base.defaults.telegram.chatId, '7223190114');
  assert.equal(effectiveSettings(base, 'daily-motivations').telegram.autoPost, true);
  assert.equal(effectiveSettings(base, 'daily-motivations').telegram.chatId, '7223190114');

  const customized = normalizeSettings({
    defaults: { telegram: { autoPost: true, botToken: '123456:ABC-DEF', chatId: '7223190114' } },
    projects: { 'daily-motivations': { telegram: { autoPost: false } } }
  });
  assert.equal(effectiveSettings(customized, 'gk-questions').telegram.autoPost, true);
  assert.equal(effectiveSettings(customized, 'gk-questions').telegram.botToken, '123456:ABC-DEF');
  assert.equal(effectiveSettings(customized, 'daily-motivations').telegram.autoPost, false);
});

test('explainer-service wraps PCM in WAV, persists custom stories, and saves TTS assets', async t => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ink-explainer-test-'));
  t.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

  const pcm = Buffer.alloc(48000, 1); // 1 second at 24kHz mono 16-bit
  const wav = pcmToWav(pcm, 24000);
  assert.equal(wav.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(wav.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.equal(wavDurationSeconds(wav), 1);
  assert.equal(pcmToWav(wav, 24000).length, wav.length);

  const saved = saveCustomStory(tmpRoot, 'ink-explainer', {
    title: 'Test Documentary',
    scenes: [
      { scene: 1, chapter: 'Intro', title: 'Hook', narration: 'Imagine waking up early.', visual: 'Cartoon sunrise.', kenBurns: 'zoom-in' }
    ]
  });
  assert.equal(saved.scenes.length, 1);
  assert.equal(loadCustomStory(tmpRoot, 'ink-explainer')?.title, 'Test Documentary');

  const mockFetch = async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        audioBase64: pcm.toString('base64'),
        mimeType: 'audio/pcm;rate=24000',
        timestamps: [{ expected: 'Imagine', start: 0, end: 0.4, status: 'matched' }]
      };
    }
  });

  const ttsRes = await generateAndSaveTts({
    root: tmpRoot,
    project: 'ink-explainer',
    scene: 1,
    prompt: 'Imagine waking up early.',
    voice: 'Kore',
    timestamps: true,
    language: 'en',
    fetchImpl: mockFetch
  });
  assert.equal(ttsRes.ok, true);
  assert.equal(ttsRes.duration, 1);
  assert.equal(ttsRes.audioUrl, '/projects/ink-explainer/audio/scene-01.wav');

  const imgDir = path.join(tmpRoot, 'projects', 'ink-explainer', 'videos');
  fs.mkdirSync(imgDir, { recursive: true });
  fs.writeFileSync(path.join(imgDir, 'day-01.png'), Buffer.from('png'));

  const assets = listExplainerAssets(tmpRoot, 'ink-explainer');
  assert.equal(assets.ok, true);
  assert.ok(assets.images[1].url.startsWith('/projects/ink-explainer/videos/day-01.png'));
  assert.equal(assets.audio[1].duration, 1);
  assert.equal(assets.audio[1].timestamps.length, 1);
  assert.equal(assets.story.title, 'Test Documentary');
});

test('explainer-service aligns rapid beats to timestamps and isolates multi-episode assets', async t => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ink-episode-test-'));
  t.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

  const beats = [
    { beat: 1, cardType: 'flat-scene', label: '', narration: 'Alarm screams early', visual: 'Clock' },
    { beat: 2, cardType: 'split-compare', label: 'YOU | HIM', narration: 'yet he relaxed calmly', visual: 'Split' }
  ];
  const wordTimestamps = [
    { expected: 'Alarm', start: 0.05, end: 0.45 },
    { expected: 'screams', start: 0.50, end: 1.00 },
    { expected: 'early', start: 1.05, end: 1.55 },
    { expected: 'yet', start: 1.75, end: 2.00 },
    { expected: 'he', start: 2.05, end: 2.25 },
    { expected: 'relaxed', start: 2.30, end: 2.80 },
    { expected: 'calmly', start: 2.85, end: 3.40 }
  ];

  const aligned = alignBeatsToTimestamps(beats, wordTimestamps, 3.6);
  assert.equal(aligned.length, 2);
  assert.equal(aligned[0].beat, 1);
  assert.equal(aligned[0].startSec, 0);
  assert.equal(aligned[0].endSec, 1.65); // midpoint between 1.55 and 1.75
  assert.equal(aligned[1].startSec, 1.65);
  assert.equal(aligned[1].endSec, 3.6);

  const savedEp = saveEpisode(tmpRoot, 'ink-explainer', {
    id: 'medieval-vacations',
    title: 'Why Medieval Peasants Had More Vacation',
    blocks: [{ blockId: 1, title: 'Hook', beats }]
  });
  assert.equal(savedEp.id, 'medieval-vacations');
  assert.equal(loadEpisode(tmpRoot, 'ink-explainer', 'medieval-vacations')?.title, 'Why Medieval Peasants Had More Vacation');

  const epList = listEpisodes(tmpRoot, 'ink-explainer');
  assert.ok(epList.some(e => e.id === 'ancient-humans-day' && e.isDefault));
  assert.ok(epList.some(e => e.id === 'medieval-vacations' && e.totalBeats === 2));

  // 3.6s PCM at 24kHz mono 16-bit = 3.6 * 48000 = 172800 bytes
  const pcmBlock = Buffer.alloc(172800, 2);
  const blockRes = await generateAndSaveBlockTts({
    root: tmpRoot,
    project: 'ink-explainer',
    episodeId: 'medieval-vacations',
    blockId: 1,
    beats,
    voice: 'Kore',
    language: 'en',
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      async json() {
        return {
          audioBase64: pcmBlock.toString('base64'),
          mimeType: 'audio/pcm;rate=24000',
          timestamps: wordTimestamps
        };
      }
    })
  });
  assert.equal(blockRes.ok, true);
  assert.equal(blockRes.duration, 3.6);
  assert.equal(blockRes.audioUrl, '/projects/ink-explainer/episodes/medieval-vacations/audio/block-01.wav');
  assert.equal(blockRes.beatTimings.length, 2);
  assert.equal(blockRes.beatTimings[0].endSec, 1.65);

  const epAssets = listExplainerAssets(tmpRoot, 'ink-explainer', 'medieval-vacations');
  assert.equal(epAssets.activeEpisodeId, 'medieval-vacations');
  assert.equal(epAssets.blockAudio[1].beatTimings[0].endSec, 1.65);

  const expressive = buildExpressiveBlockPrompt([
    { beat: 1, emotion: 'warmly', narration: 'It rained softly.' },
    { beat: 2, emotion: 'whispering', narration: 'Then she smiled.' }
  ], 'auto');
  assert.equal(expressive, '[warmly] It rained softly. [whispering] Then she smiled.');

  const alignedWithTags = alignBeatsToTimestamps(
    [
      { beat: 1, narration: '[warmly and softly] It rained softly.' },
      { beat: 2, narration: '[whispering] Then she smiled.' }
    ],
    [
      { word: '[warmly', start: 0, end: 0.1 },
      { word: 'and', start: 0.1, end: 0.15 },
      { word: 'softly]', start: 0.15, end: 0.2 },
      { word: 'It', start: 0.2, end: 0.4 },
      { word: 'rained', start: 0.45, end: 0.7 },
      { word: 'softly.', start: 0.75, end: 1.2 },
      { word: '[whispering]', start: 1.2, end: 1.2 },
      { word: 'Then', start: 1.4, end: 1.6 },
      { word: 'she', start: 1.65, end: 1.85 },
      { word: 'smiled.', start: 1.9, end: 2.4 }
    ],
    2.5
  );
  assert.equal(alignedWithTags[0].endSec, 1.3);
  assert.equal(alignedWithTags[1].startSec, 1.3);
  assert.equal(alignedWithTags[1].endSec, 2.5);

  assert.equal(
    episodeFlowProjectName(tmpRoot, 'ink-explainer', 'ancient-humans-day'),
    'Ink Explainer · Ancient Humans All Day'
  );
  assert.equal(
    episodeFlowProjectName(tmpRoot, 'ink-explainer', 'medieval-vacations'),
    'Ink Explainer · Why Medieval Peasants Had More V'
  );
  assert.ok(episodeFlowProjectName(tmpRoot, 'ink-explainer', 'medieval-vacations').length <= 48);

  const epImgDir = path.join(tmpRoot, 'projects', 'ink-explainer', 'episodes', 'medieval-vacations', 'images');
  fs.mkdirSync(epImgDir, { recursive: true });
  fs.writeFileSync(path.join(epImgDir, 'beat-01.png'), Buffer.from('a'));
  fs.writeFileSync(path.join(epImgDir, 'beat-02.png'), Buffer.from('b'));
  const delRes = deleteBeatImage(tmpRoot, 'ink-explainer', 'medieval-vacations', 1);
  assert.equal(delRes.deleted, true);
  assert.equal(fs.existsSync(path.join(epImgDir, 'beat-01.png')), false);
  assert.equal(fs.existsSync(path.join(epImgDir, 'beat-02.png')), true);

  const upRes = saveBeatImage(tmpRoot, 'ink-explainer', 'medieval-vacations', 1, Buffer.from('jpgbytes'), '.jpg');
  assert.equal(upRes.ok, true);
  assert.equal(upRes.url, '/projects/ink-explainer/episodes/medieval-vacations/images/beat-01.jpg');
  assert.equal(fs.existsSync(path.join(epImgDir, 'beat-01.jpg')), true);
});
