import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { openNewVideo } from './flow-video.mjs';

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
