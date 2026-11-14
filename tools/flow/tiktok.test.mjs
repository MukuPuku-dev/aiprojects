import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captionFromGemini, createTikTokService } from './tiktok.mjs';

function fixture(upload) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tiktok-'));
  const directory = path.join(root, 'projects', 'gk-questions', 'videos');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'day-04.mp4'), 'video');
  const service = createTikTokService(root, { generateCaption: async () => 'caption', upload });
  return { root, service, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}
async function finished(service, id) {
  for (let i = 0; i < 100; i++) {
    const job = service.get(id);
    if (['posted', 'failed', 'unknown'].includes(job.status)) return job;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  throw new Error('Job did not finish.');
}

test('Gemini GK captions use quiz facts without day numbering', async t => {
  let prompt;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    prompt = JSON.parse(options.body).prompt;
    return new Response(JSON.stringify({ text: ' GK caption ' }), { status: 200 });
  });
  const context = 'Quiz: नेपालको राष्ट्रिय फूल? — लालीगुराँस';
  assert.equal(await captionFromGemini(context, 'gk-questions'), 'GK caption');
  assert.match(prompt, /supplied quiz questions and answers/);
  assert.match(prompt, /related general knowledge/);
  assert.match(prompt, /Do not invent facts/);
  assert.match(prompt, /Do not mention a day number/);
  assert.ok(prompt.includes(context));
});

test('Gemini motivation captions continue the original spoken line', async t => {
  let prompt;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    prompt = JSON.parse(options.body).prompt;
    return new Response(JSON.stringify({ text: 'Motivation caption' }), { status: 200 });
  });
  const context = 'Spoken line: आजको पसिना भोलिको मुस्कान बन्छ।';
  assert.equal(await captionFromGemini(context, 'daily-motivations'), 'Motivation caption');
  assert.match(prompt, /continuation of the supplied original motivational line/);
  assert.match(prompt, /include the line and expand its specific message/);
  assert.ok(prompt.includes(context));
});

test('records successful posts across restarts and permits a new video', async () => {
  const f = fixture(async ({ beforePost }) => { beforePost(); });
  try {
    assert.deepEqual(f.service.list('gk-questions'), [{ day: 4, status: 'unposted', active: false }]);
    const job = f.service.start('gk-questions', 4, 'history quiz');
    assert.equal((await finished(f.service, job.id)).status, 'posted');
    const restarted = createTikTokService(f.root);
    assert.equal(restarted.list('gk-questions')[0].status, 'posted');
    assert.throws(() => restarted.start('gk-questions', 4, 'history quiz'), /already posted/);
    fs.writeFileSync(path.join(f.root, 'projects', 'gk-questions', 'videos', 'day-04.mp4'), 'new video');
    assert.equal(restarted.list('gk-questions')[0].status, 'unposted');
    assert.throws(() => restarted.list('../outside'), /Invalid project/);
  } finally { f.cleanup(); }
});

test('blocks retries after an uncertain submission until explicitly resolved', async () => {
  const f = fixture(async ({ beforePost }) => { beforePost(); throw new Error('lost connection'); });
  try {
    const job = f.service.start('gk-questions', 4, 'history quiz');
    assert.equal((await finished(f.service, job.id)).status, 'unknown');
    const restarted = createTikTokService(f.root);
    assert.equal(restarted.list('gk-questions')[0].status, 'unknown');
    assert.throws(() => restarted.start('gk-questions', 4, 'history quiz'), /unknown/);
    restarted.resolve('gk-questions', 4, false);
    assert.equal(restarted.list('gk-questions')[0].status, 'unposted');
  } finally { f.cleanup(); }
});

test('does not record a post when upload fails before submission', async () => {
  const f = fixture(async () => { throw new Error('login required'); });
  try {
    const job = f.service.start('gk-questions', 4, 'history quiz');
    assert.equal((await finished(f.service, job.id)).status, 'failed');
    assert.equal(f.service.list('gk-questions')[0].status, 'unposted');
    assert.throws(() => f.service.start('gk-questions', 4, ''), /context/);
  } finally { f.cleanup(); }
});

test('lists and tracks standalone videos separately from numbered days', async () => {
  let uploaded;
  const f = fixture(async ({ file, beforePost }) => { uploaded = file; beforePost(); });
  try {
    const name = 'sunrise test.mp4';
    fs.writeFileSync(path.join(f.root, 'projects', 'gk-questions', 'videos', name), 'standalone');
    assert.deepEqual(f.service.list('gk-questions'), [
      { day: 4, status: 'unposted', active: false },
      { file: name, status: 'unposted', active: false }
    ]);
    const job = f.service.start('gk-questions', name, 'Sunrise over mountains');
    assert.equal((await finished(f.service, job.id)).status, 'posted');
    assert.equal(path.basename(uploaded), name);
    const restarted = createTikTokService(f.root);
    assert.equal(restarted.list('gk-questions')[1].status, 'posted');
    assert.throws(() => restarted.start('gk-questions', name, 'Sunrise'), /already posted/);
    assert.throws(() => restarted.start('gk-questions', '..\\outside.mp4', 'Sunrise'), /Invalid video/);
    assert.throws(() => restarted.start('gk-questions', 'day-04.mp4', 'Sunrise'), /Invalid video/);
  } finally { f.cleanup(); }
});

test('requires resolution when a standalone post has an uncertain result', async () => {
  const f = fixture(async ({ beforePost }) => { beforePost(); throw new Error('lost connection'); });
  try {
    const name = 'sunrise.mp4';
    fs.writeFileSync(path.join(f.root, 'projects', 'gk-questions', 'videos', name), 'standalone');
    const job = f.service.start('gk-questions', name, 'Sunrise');
    assert.equal((await finished(f.service, job.id)).status, 'unknown');
    assert.equal(f.service.list('gk-questions')[1].status, 'unknown');
    f.service.resolve('gk-questions', name, false);
    assert.equal(f.service.list('gk-questions')[1].status, 'unposted');
  } finally { f.cleanup(); }
});
