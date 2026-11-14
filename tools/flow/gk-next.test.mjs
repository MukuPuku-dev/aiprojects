import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let server, browser, base;

before(async () => {
  server = http.createServer((req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname;
    const files = {
      '/': 'index.html',
      '/index.html': 'index.html',
      '/platform/platform.css': 'platform/platform.css',
      '/platform/projects.js': 'platform/projects.js',
      '/platform/platform.js': 'platform/platform.js',
      '/projects/gk-questions/flow-data.js': 'projects/gk-questions/flow-data.js',
      '/projects/gk-questions/index.html': 'projects/gk-questions/index.html'
    };
    if (!files[name]) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(files[name]);
    res.setHeader('Content-Type', ext === '.js' ? 'text/javascript' : ext === '.css' ? 'text/css' : 'text/html; charset=utf-8');
    res.end(fs.readFileSync(path.join(root, files[name])));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.FLOW_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  browser = await chromium.launch({ executablePath, headless: true });
});

after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function setup({ done = [], duration = '10s', result = 'success', saveProgress = true, jobApi = 1 } = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  let finished = false;
  await page.route('**/api/health', route => route.fulfill({ json: { ok: true, jobApi } }));
  await page.route('**/api/flow-settings?*', route => route.fulfill({
    json: { ok: true, effective: { video: { model: 'Omni 1.1 Flash', aspect: '16:9', duration } } }
  }));
  await page.route('**/api/generation-jobs', route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    return route.fulfill({ status: 202, json: { ok: true, id: body.id, day: body.day, status: 'queued' } });
  });
  await page.route('**/api/generation-jobs/*', route => {
    const body = requests[0];
    if (!body) return route.fulfill({ status: 404, json: { ok: false, error: 'Job not found' } });
    const status = finished ? (result === 'failure' ? 'failed' : 'completed') : 'running';
    return route.fulfill({ json: {
      ok: true, id: body.id, day: body.day, status,
      ...(status === 'failed' ? { error: 'Flow sign-in required' } : {}),
      ...(status === 'completed' ? { file: `projects/gk-questions/videos/day-${String(body.day).padStart(2, '0')}.mp4` } : {})
    } });
  });
  await page.goto(base);
  if (saveProgress) await page.evaluate(days => localStorage.setItem('gk_completed_days', JSON.stringify(days)), done);
  return { context, page, requests, finish: () => { finished = true; } };
}

test('stays on the project screen and resumes the job after navigating away', async () => {
  const { context, page, requests, finish } = await setup({ done: [0, 2] });
  try {
    const icon = page.getByRole('button', { name: 'Generate next GK Questions clip with Flow' });
    assert.equal(await icon.getAttribute('title'), 'Generate next clip with Flow');
    await icon.click();
    await page.getByText('Day 2 marked done.', { exact: false }).waitFor();
    assert.equal(new URL(page.url()).pathname, '/');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gk_completed_days'))), [0, 1, 2]);
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('gk_flow_job')).status === 'running');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].project, 'gk-questions');
    assert.equal(requests[0].day, 2);
    assert.equal(requests[0].aspect, '16:9');
    assert.match(requests[0].prompt, /DAY 02/);
    assert.match(requests[0].prompt, /16:9/);
    assert.equal(await icon.isDisabled(), true);
    await page.getByRole('link', { name: 'Open GK Questions workspace' }).click();
    await page.getByRole('heading', { name: /GK Questions/ }).waitFor();
    finish();
    await page.getByRole('link', { name: '← सबै प्रोजेक्ट' }).click();
    await page.getByText('Day 2 is ready.').waitFor();
    assert.equal(await page.getByRole('link', { name: 'Open video' }).getAttribute('href'), '/projects/gk-questions/videos/day-02.mp4');
    assert.equal(requests.length, 1);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gk_completed_days'))), [0, 1, 2]);
    await page.reload();
    await page.getByText('Day 2 is ready.').waitFor();
    assert.equal(requests.length, 1);
  } finally { await context.close(); }
});

test('asks before starting when no progress exists in this browser', async () => {
  const { context, page, requests } = await setup({ saveProgress: false });
  try {
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Generate next GK Questions clip with Flow' }).click();
    await page.getByText('No clip started.', { exact: false }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('gk_completed_days')), null);
    assert.equal(requests.length, 0);
  } finally { await context.close(); }
});

test('shows a failed job without losing the started day', async () => {
  const { context, page, finish } = await setup({ done: [0], result: 'failure' });
  try {
    finish();
    await page.getByRole('button', { name: 'Generate next GK Questions clip with Flow' }).click();
    await page.getByText('Flow sign-in required', { exact: false }).waitFor();
    assert.match(await page.locator('.generate-status').textContent(), /uncheck that day/);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gk_completed_days'))), [0, 1]);
  } finally { await context.close(); }
});

test('does not alter progress or submit when duration is incompatible or all days are done', async () => {
  for (const options of [{ done: [0], duration: '8s' }, { done: Array.from({ length: 30 }, (_, i) => i) }]) {
    const { context, page, requests } = await setup(options);
    try {
      await page.getByRole('button', { name: 'Generate next GK Questions clip with Flow' }).click();
      await page.getByText(options.duration ? 'GK prompts require 10 seconds' : 'All 30 original GK clips', { exact: false }).waitFor();
      assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gk_completed_days'))), options.done);
      assert.equal(requests.length, 0);
    } finally { await context.close(); }
  }
});

test('requires a server update before changing progress', async () => {
  const { context, page, requests } = await setup({ done: [0], jobApi: 0 });
  try {
    await page.getByRole('button', { name: 'Generate next GK Questions clip with Flow' }).click();
    await page.getByText('The generator needs an update', { exact: false }).waitFor();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('gk_completed_days'))), [0]);
    assert.equal(requests.length, 0);
  } finally { await context.close(); }
});

test('the GK HTML download remains self-contained', async () => {
  const { context, page } = await setup();
  try {
    await page.getByRole('link', { name: 'Open GK Questions workspace' }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'HTML डाउनलोड' }).click()
    ]);
    const html = await fs.promises.readFile(await download.path(), 'utf8');
    assert.doesNotMatch(html, /src="flow-data\.js"/);
    await page.route('**/standalone.html', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await page.goto(`${base}/standalone.html`);
    await page.getByText('३० दिनको सूची').waitFor();
    assert.match(await page.locator('#prompt').textContent(), /DAY 01/);
  } finally { await context.close(); }
});
