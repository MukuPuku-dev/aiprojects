import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  resolveVideoFile,
  sanitizeVideoBaseName,
  uniqueFilePath
} from './fb-downloader-service.mjs';

const FIXED_DATE = new Date(2026, 10, 23, 8, 30, 5);

test('sanitizeVideoBaseName cleans fullwidth chars, middots, ellipsis, hashtags, and replacement chars', () => {
  const input = '2.3M views · 79K reactions ｜ WAIT... WHY DID HE TAKE THE BLENDER？ #marriagejokea [1473945621335961]';
  const cleaned = sanitizeVideoBaseName(input, { now: FIXED_DATE });
  assert.equal(
    cleaned,
    '2.3M views 79K reactions WAIT WHY DID HE TAKE THE BLENDER marriagejokea [1473945621335961]'
  );
  assert.ok(!cleaned.includes('..'));
  assert.ok(!/[<>:"/\\|?*#·｜？\uFFFD]/.test(cleaned));
});

test('sanitizeVideoBaseName falls back to valid timestamped name for invalid or empty titles', () => {
  assert.equal(sanitizeVideoBaseName('', { now: FIXED_DATE }), 'Facebook_Reel_20261123_083005');
  assert.equal(sanitizeVideoBaseName('   ...   ', { now: FIXED_DATE }), 'Facebook_Reel_20261123_083005');
  assert.equal(sanitizeVideoBaseName('😂😂🔥🔥', { now: FIXED_DATE }), 'Facebook_Reel_20261123_083005');
  assert.equal(sanitizeVideoBaseName('CON', { now: FIXED_DATE }), 'Facebook_Reel_20261123_083005');
  assert.equal(
    sanitizeVideoBaseName('???  [1473945621335961]', { now: FIXED_DATE }),
    'Facebook_Reel_20261123_083005 [1473945621335961]'
  );
});

test('sanitizeVideoBaseName preserves Unicode letters and combining marks (e.g. Nepali)', () => {
  const cleaned = sanitizeVideoBaseName('नेपाली कथा... 😂 [987654321]', { now: FIXED_DATE });
  assert.equal(cleaned, 'नेपाली कथा [987654321]');
});

test('resolveVideoFile allows ellipsis inside a filename but blocks path traversal', () => {
  const validName = '2.3M views · 79K reactions ｜ WAIT... WHY DID HE TAKE THE BLENDER？ #marriagejokea [1473945621335961].mp4';
  const resolved = resolveVideoFile(validName);
  assert.ok(resolved.endsWith(path.join('FacebookReels', validName)));

  for (const bad of ['', '   ', '.', '..', '../secret.mp4', '..\\secret.mp4', 'a/b.mp4', 'a\\b.mp4', 'bad\0.mp4']) {
    assert.throws(() => resolveVideoFile(bad), /Invalid filename/);
  }
});

test('uniqueFilePath deduplicates sanitized names inside a directory', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fb-dl-test-'));
  try {
    const first = uniqueFilePath(tmpDir, 'WAIT... WHY？ [123456]', '.mp4');
    assert.equal(path.basename(first), 'WAIT WHY [123456].mp4');
    fs.writeFileSync(first, 'dummy');

    const second = uniqueFilePath(tmpDir, 'WAIT... WHY？ [123456]', '.mp4');
    assert.equal(path.basename(second), 'WAIT WHY [123456] (2).mp4');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
