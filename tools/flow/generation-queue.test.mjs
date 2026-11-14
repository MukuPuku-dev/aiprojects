import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGenerationQueue } from './generation-queue.mjs';

test('tracks queued jobs, serializes generation and continues after failures', async () => {
  const started = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const queue = createGenerationQueue(async input => {
    started.push(input.day);
    if (input.day === 1) { await gate; throw new Error('Flow failed'); }
    return { file: 'video.mp4' };
  });
  const first = queue.submit('first', { day: 1 });
  const second = queue.submit('second', { day: 2 });
  assert.equal(first.status, 'queued');
  assert.equal(second.status, 'queued');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [1]);
  assert.equal(first.status, 'running');
  assert.equal(second.status, 'queued');
  release();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(first.status, 'failed');
  assert.equal(first.error, 'Flow failed');
  assert.equal(second.status, 'completed');
  assert.equal(second.result.file, 'video.mp4');
  assert.deepEqual(started, [1, 2]);
  assert.throws(() => queue.submit('first', { day: 3 }), /already exists/);
});
