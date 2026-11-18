import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseCsv, mapCsvRows, suggestFolderSlug, cleanPromptForAi, makePhotorealisticPrompt } from '../../projects/images-from-csv/csv-parser.js';
import {
  sanitizeFolderName,
  sanitizeFileName,
  mapAspectToFlow,
  csvImagesDir,
  listCsvImages,
  deleteCsvImage,
  compressImageToJpeg
} from './csv-images-service.mjs';
import { studioProjectName } from './flow-settings.mjs';

test('studioProjectName resolves Images from CSV', () => {
  assert.equal(studioProjectName('images-from-csv'), 'Images from CSV');
});

test('parseCsv and mapCsvRows handle BOM, quoted commas, Nepali text, and identifiable filenames', () => {
  const sampleCsv = `\uFEFFid,type,placement,aspect,width,caption_ne,labels_to_add_in_word,ai_prompt_or_photo_brief
PH-1.1,PH,"Lesson 1 opener, full width",4:3,full,कटहरी गाउँपालिकाको वडा नक्सा,Ward numbers,"Official ward map of Katahari Rural Municipality - NOT AI-generated."
AI-1.1,AI,"Lesson 1, after the story",4:3,full,नागरिक बडापत्र पढ्दै सुमन र साथीहरू,,"Children's educational picture-book illustration for a Nepali Class 5 textbook. STRICTLY NO text. Scene: a group of 5 Class-5 students with a teacher standing in front of a large wall board."
DG-6.1,DG,"Lesson 6, after detail section 3",4:3,full,गोबर ग्यास प्लान्ट कसरी चल्छ?,"Add labels","Cut-away diagram: a Terai household with a cow and a small cow shed."`;

  const parsed = parseCsv(sampleCsv);
  assert.equal(parsed.rows.length, 3);

  const mapped = mapCsvRows(parsed);
  assert.equal(mapped[0].id, 'PH-1.1');
  assert.equal(mapped[0].isAiDefault, false);
  assert.equal(mapped[0].selected, false);
  assert.match(mapped[0].filename, /^PH-1\.1_lesson1_.*\.jpg$/);
  assert.ok(mapped[0].searchQuery.includes('Official ward map of Katahari Rural Municipality'));
  const cleanedPrompt = cleanPromptForAi(mapped[0]);
  assert.ok(!/NOT AI-generated/i.test(cleanedPrompt));

  assert.equal(mapped[1].id, 'AI-1.1');
  assert.equal(mapped[1].isAiDefault, true);
  assert.equal(mapped[1].selected, true);
  assert.match(mapped[1].filename, /^AI-1\.1_lesson1_.*\.jpg$/);
  const photoPrompt = makePhotorealisticPrompt(mapped[1].prompt);
  assert.match(photoPrompt, /^Photorealistic documentary DSLR photograph in Katahari Rural Municipality, Morang, eastern Terai, Nepal/);
  assert.ok(!/gouache|picture-book illustration/i.test(photoPrompt));

  assert.equal(mapped[2].id, 'DG-6.1');
  assert.equal(mapped[2].isAiDefault, true);
  assert.equal(mapped[2].selected, true);
  assert.match(mapped[2].filename, /^DG-6\.1_lesson6_.*\.jpg$/);

  const uniqueNames = new Set(mapped.map(m => m.filename));
  assert.equal(uniqueNames.size, 3);
});

test('csv-images-service sanitizes paths, maps aspects, and lists/deletes images', () => {
  assert.equal(sanitizeFolderName('Katahari Class 5!'), 'katahari-class-5');
  assert.equal(sanitizeFolderName('../evil/path'), 'evil-path');
  assert.equal(sanitizeFileName('AI-1.1_lesson1_students'), 'AI-1.1_lesson1_students.jpg');
  assert.equal(sanitizeFileName('folder/AI-1.1.jpg'), 'AI-1.1.jpg');
  assert.equal(mapAspectToFlow('4:3'), '16:9');
  assert.equal(mapAspectToFlow('3:1'), '16:9');
  assert.equal(mapAspectToFlow('9:16'), '9:16');
  assert.equal(suggestFolderSlug('katahari_images.csv'), 'katahari_images');

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'csv-imgs-'));
  try {
    const dir = csvImagesDir(tmpRoot, 'batch-1');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'AI-1.1_lesson1_test.png'), 'fake-png');

    const listed = listCsvImages(tmpRoot, 'batch-1');
    assert.equal(listed.folder, 'batch-1');
    assert.deepEqual(listed.folders, ['batch-1']);
    assert.equal(listed.files.length, 1);
    assert.equal(listed.files[0].name, 'AI-1.1_lesson1_test.png');

    const del = deleteCsvImage(tmpRoot, 'batch-1', 'AI-1.1_lesson1_test.png');
    assert.equal(del.deleted, true);
    assert.equal(listCsvImages(tmpRoot, 'batch-1').files.length, 0);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('compressImageToJpeg re-encodes an image to 85% lossy JPEG', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csv-compress-'));
  try {
    const sample = path.join(tmpDir, 'sample.jpg');
    // Create a 1x1 PNG via base64, then compress to 85% JPEG
    const png1x1 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQz0AEwDiqAgBzAwX+b4fT7QAAAABJRU5ErkJggg==',
      'base64'
    );
    fs.writeFileSync(sample, png1x1);
    const res = await compressImageToJpeg(sample, 85);
    assert.ok(res && res.compressedSize > 0);
    const header = fs.readFileSync(sample).subarray(0, 2);
    assert.equal(header[0], 0xff);
    assert.equal(header[1], 0xd8);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
