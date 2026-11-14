import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTikTokService } from './tiktok.mjs';

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
