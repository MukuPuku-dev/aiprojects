import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { confirmTikTokPost } from './tiktok.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let server, browser, base;

before(async () => {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.resolve(root, '.' + (url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end(); return;
    }
    const ext = path.extname(file);
    res.setHeader('Content-Type', ext === '.js' ? 'text/javascript; charset=utf-8' : ext === '.css' ? 'text/css' : 'text/html; charset=utf-8');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.FLOW_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
});
after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

async function setup() {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  await page.route('**/api/health', route => route.fulfill({ json: { ok: true, jobApi: 1 } }));
  await page.route('**/api/flow-settings?*', route => route.fulfill({ json: { ok: true, effective: { video: { model: 'Omni 1.1 Flash', aspect: '9:16', duration: '10s' } } } }));
  await page.route('**/api/generation-jobs', route => {
    const body = route.request().postDataJSON(); requests.push(body);
    return route.fulfill({ status: 202, json: { ok: true, id: body.id, day: body.day, status: 'queued' } });
  });
  await page.route('**/api/generation-jobs/*', route => {
    const body = requests[0];
    return route.fulfill({ json: { ok: true, id: body.id, day: body.day, status: 'completed', file: `projects/daily-motivations/videos/day-02.mp4` } });
  });
  await page.route('**/api/tiktok/videos?*', route => {
    const project = new URL(route.request().url()).searchParams.get('project');
    return route.fulfill({ json: { ok: true, videos: project === 'gk-questions' ? [{ day: 4, status: 'unposted', active: false }] : [{ day: 1, status: 'posted', active: false }] } });
  });
  await page.goto(base);
  return { context, page, requests };
}

test('motivation Flow button generates next unmarked day with saved workspace settings', async () => {
  const { context, page, requests } = await setup();
  try {
    await page.evaluate(() => localStorage.setItem('dailymotivations-v1', JSON.stringify({
      done: { 1: true }, picked: true, model: 'Omni 1.2 Flash', ar: '16:9', dur: '10s'
    })));
    await page.getByRole('button', { name: 'Generate next Daily Motivations clip with Flow' }).click();
    await page.getByText('Day 2 is ready.').waitFor();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].project, 'daily-motivations');
    assert.equal(requests[0].day, 2);
    assert.equal(requests[0].model, 'Omni 1.2 Flash');
    assert.match(requests[0].prompt, /16:9 wide/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('dailymotivations-v1')).done[2]), true);
    await page.reload();
    await page.getByText('Day 2 is ready.').waitFor();
    assert.equal(requests.length, 1);
  } finally { await context.close(); }
});

test('shows post icon only for generated unposted videos and sends the matching context', async () => {
  const { context, page } = await setup();
  try {
    const icon = page.getByRole('button', { name: 'Post GK Questions Day 4 to TikTok' });
    await icon.waitFor();
    assert.equal(await page.getByRole('button', { name: 'Post Daily Motivations Day 1 to TikTok' }).count(), 0);
    assert.match(await page.locator('[data-flow-project="daily-motivations"] .tiktok-row').textContent(), /Submitted to TikTok/);
    let posted;
    await page.route('**/api/tiktok/posts', route => {
      posted = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'job' } });
    });

    await page.route('**/api/tiktok/posts/job', route => route.fulfill({ json: { ok: true, status: 'posted' } }));
    page.once('dialog', dialog => dialog.accept());
    await icon.click();
    await page.getByText('Day 4 submitted to TikTok.', { exact: false }).waitFor({ timeout: 10000 });
    assert.equal(posted.project, 'gk-questions');
    assert.equal(posted.day, 4);
    assert.match(posted.context, /पृथ्वीनारायण शाह/);
  } finally { await context.close(); }
});

test('shows standalone videos and uses their own description for TikTok', async () => {
  const { context, page } = await setup();
  try {
    await page.route('**/api/tiktok/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      return route.fulfill({ json: { ok: true, videos: project === 'daily-motivations'
        ? [{ file: 'sunrise test.mp4', status: 'unposted', active: false }]
        : [] } });
    });
    await page.reload();
    const icon = page.getByRole('button', { name: 'Post Daily Motivations sunrise test.mp4 to TikTok' });
    await icon.waitFor();
    assert.match(await page.getByRole('link', { name: 'sunrise test.mp4' }).getAttribute('href'), /sunrise%20test\.mp4$/);
    let posted;
    await page.route('**/api/tiktok/posts', route => {
      posted = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'job' } });
    });
    await page.route('**/api/tiktok/posts/job', route => route.fulfill({ json: { ok: true, status: 'posted' } }));
    page.on('dialog', dialog => dialog.accept(dialog.type() === 'prompt' ? 'Sunrise over snowy mountains' : undefined));
    await icon.click();
    await page.getByText('sunrise test.mp4 submitted to TikTok.', { exact: false }).waitFor({ timeout: 10000 });
    assert.deepEqual(posted, { project: 'daily-motivations', file: 'sunrise test.mp4', context: 'Sunrise over snowy mountains' });
  } finally { await context.close(); }
});

test('handles TikTok check confirmation and verifies the submitted caption', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.route('**/mock-upload', route => route.fulfill({
      contentType: 'text/html',
      body: `<p>Continue to post?</p><button onclick="history.pushState({}, '', '/tiktokstudio/content'); document.body.textContent='Caption for this video';">Post now</button>`
    }));
    await page.goto(`${base}/mock-upload`);
    await confirmTikTokPost(page, 'Caption for this video');
    assert.equal(new URL(page.url()).pathname, '/tiktokstudio/content');
  } finally { await context.close(); }
});
