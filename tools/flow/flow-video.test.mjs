import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { openNewImage, openNewVideo, saveOpenedImage, saveOpenedVideo } from './flow-video.mjs';

let browser;
before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.FLOW_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
});
after(async () => { if (browser) await browser.close(); });

async function setup() {
  const page = await browser.newPage();
  await page.route('http://flow-test.local/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/project') {
      await route.fulfill({ contentType: 'text/html', body: `
        <flow-video-tile><img alt="Generated video thumbnail" src="/old.png" onclick="location.href='/old'"></flow-video-tile>
        <flow-video-tile><img alt="Generated video thumbnail" src="/wrong.png" onclick="location.href='/wrong'"></flow-video-tile>
        <flow-video-tile><img alt="Generated video thumbnail" src="/new.png" onclick="location.href='/new'"></flow-video-tile>
        <style>img { width: 20px; height: 20px; }</style>` });
    } else if (['/old', '/wrong', '/new'].includes(url.pathname)) {
      const prompt = url.pathname === '/new' ? 'Expected prompt' : 'Different prompt';
      await route.fulfill({ contentType: 'text/html', body: `<div class="prompt-text">${prompt}</div>` });
    } else {
      await route.fulfill({ status: 404, body: '' });
    }
  });
  await page.goto('http://flow-test.local/project');
  return page;
}

test('skips previous thumbnails and other prompts before opening the matching video', async () => {
  const page = await setup();
  try {
    await openNewVideo(page, ['http://flow-test.local/old.png'], 'Expected prompt', 10000);
    assert.equal(new URL(page.url()).pathname, '/new');
  } finally { await page.close(); }
});

test('does not open a thumbnail that was present before submission', async () => {
  const page = await setup();
  try {
    await assert.rejects(openNewVideo(page, [
      'http://flow-test.local/old.png',
      'http://flow-test.local/wrong.png',
      'http://flow-test.local/new.png'
    ], 'Expected prompt', 1000), /Timeout/);
    assert.equal(new URL(page.url()).pathname, '/project');
  } finally { await page.close(); }
});

test('saves video via Download media menu when scene editor uses canvas instead of video tag', async () => {
  const page = await browser.newPage();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-dl-'));
  const outFile = path.join(dir, 'day-06.mp4');
  const srv = http.createServer((req, res) => {
    if (req.url === '/edit') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <flow-scene-editor-canvas><canvas width="1080" height="1920"></canvas></flow-scene-editor-canvas>
        <button aria-label="Download media" onclick="document.getElementById('menu').hidden=false">download</button>
        <div id="menu" hidden>
          <button role="menuitem">270p Animated GIF</button>
          <button role="menuitem" onclick="const a=document.createElement('a');a.href='/clip.mp4';a.download='clip.mp4';a.click();">720p Original size</button>
        </div>`);
    } else if (req.url === '/clip.mp4') {
      res.writeHead(200, { 'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment; filename="clip.mp4"' });
      res.end(Buffer.from('fake-mp4-data'));
    } else {
      res.writeHead(404); res.end();
    }
  });
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  try {
    await page.goto(`http://127.0.0.1:${srv.address().port}/edit`);
    const result = await saveOpenedVideo(page, outFile, '9:16', () => {});
    assert.equal(result.width, 1080);
    assert.equal(result.height, 1920);
    assert.equal(fs.readFileSync(outFile, 'utf8'), 'fake-mp4-data');
  } finally {
    await page.close();
    await new Promise(resolve => srv.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('opens newly generated image tile matching prompt and saves via Download media menu', async () => {
  const page = await browser.newPage();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-img-'));
  const outFile = path.join(dir, 'day-01.png');
  const srv = http.createServer((req, res) => {
    if (req.url === '/project') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <flow-image-tile><img alt="Tile displaying a user's image" src="/old.png" onclick="location.href='/old'"></flow-image-tile>
        <flow-image-tile><img alt="Tile displaying a user's image" src="/new.png" onclick="location.href='/edit'"></flow-image-tile>
        <style>img { width: 20px; height: 20px; }</style>`);
    } else if (req.url === '/old') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<div class="prompt-text">Different prompt</div>');
    } else if (req.url === '/edit') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div class="prompt-text">Expected image prompt</div>
        <img alt="Tile displaying a user's image" src="/preview.png">
        <button aria-label="Download media" onclick="document.getElementById('menu').hidden=false">download</button>
        <div id="menu" hidden>
          <button role="menuitem" onclick="const a=document.createElement('a');a.href='/full.png';a.download='full.png';a.click();">1K\nOriginal size</button>
          <button role="menuitem">2K\nUpscaled</button>
        </div>`);
    } else if (req.url === '/full.png') {
      res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Disposition': 'attachment; filename="full.png"' });
      res.end(Buffer.from('fake-png-data'));
    } else {
      res.writeHead(404); res.end();
    }
  });
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    await page.goto(`${base}/project`);
    await openNewImage(page, [`${base}/old.png`], 'Expected image prompt', 10000);
    assert.equal(new URL(page.url()).pathname, '/edit');
    const result = await saveOpenedImage(page, outFile, '9:16', () => {});
    assert.equal(result.file, outFile);
    assert.equal(fs.readFileSync(outFile, 'utf8'), 'fake-png-data');
  } finally {
    await page.close();
    await new Promise(resolve => srv.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
