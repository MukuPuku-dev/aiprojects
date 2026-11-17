import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { confirmTikTokPost } from './tiktok.mjs';
import { confirmFacebookPost } from './facebook.mjs';

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

test('auto-post TikTok defaults to false and auto-submits jindagi-kitaab photo without extra click when enabled', async () => {
  const { context, page, requests } = await setup();
  try {
    const toggle = page.locator('#auto-post-tiktok');
    await toggle.waitFor();
    assert.equal(await toggle.isChecked(), false);

    let kitaabGenerated = false;
    let postedPayload = null;
    await page.route('**/api/flow-settings?*', route => route.fulfill({
      json: { ok: true, effective: { image: { model: '', aspect: '9:16' }, video: { model: 'Omni 1.1 Flash', aspect: '9:16', duration: '10s' }, tiktok: { autoPost: true } } }
    }));
    await page.route('**/api/generation-jobs/*', route => {
      const body = requests[0];
      kitaabGenerated = true;
      return route.fulfill({ json: { ok: true, id: body.id, day: body.day, status: 'completed', file: 'projects/jindagi-kitaab/videos/day-01.png' } });
    });
    await page.route('**/api/tiktok/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      const videos = project === 'jindagi-kitaab' && kitaabGenerated
        ? [{ day: 1, ext: '.png', status: postedPayload ? 'posted' : 'unposted', active: false }]
        : [];
      return route.fulfill({ json: { ok: true, videos } });
    });
    await page.route('**/api/tiktok/posts', route => {
      postedPayload = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'kitaab-tt-1' } });
    });
    await page.route('**/api/tiktok/posts/kitaab-tt-1', route => route.fulfill({ json: { ok: true, status: 'posted' } }));

    await toggle.check();
    await page.evaluate(() => localStorage.setItem('jindagi-kitaab-v1', JSON.stringify({ done: {} })));
    await page.getByRole('button', { name: 'Generate next जिन्दगीको किताब photo with Flow' }).click();

    await page.locator('[data-flow-project="jindagi-kitaab"]').getByText('Day 1 submitted to TikTok.', { exact: false }).waitFor({ timeout: 10000 });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].project, 'jindagi-kitaab');
    assert.equal(requests[0].mode, 'image');
    assert.equal(postedPayload.project, 'jindagi-kitaab');
    assert.equal(postedPayload.day, 1);
    assert.match(postedPayload.context, /केही पानाहरू बन्द नै रहन देऊ/);
    assert.match(postedPayload.context, /#LifeIsABook/);
  } finally { await context.close(); }
});

test('shows Facebook post icon for generated media, submits to /api/facebook/posts, and supports Facebook auto-post', async () => {
  const { context, page, requests } = await setup();
  try {
    let fbPosted = null;
    await page.route('**/api/facebook/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      return route.fulfill({
        json: {
          ok: true,
          videos: project === 'gk-questions'
            ? [{ day: 4, status: fbPosted ? 'posted' : 'unposted', active: false }]
            : [{ day: 1, status: 'posted', active: false }]
        }
      });
    });
    await page.reload();

    const fbIcon = page.getByRole('button', { name: 'Post GK Questions Day 4 to Facebook' });
    await fbIcon.waitFor();
    assert.equal(await page.getByRole('button', { name: 'Post Daily Motivations Day 1 to Facebook' }).count(), 0);
    assert.match(await page.locator('[data-flow-project="daily-motivations"] .tiktok-row').textContent(), /Submitted to Facebook/);

    await page.route('**/api/facebook/posts', route => {
      fbPosted = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'fb-job-1' } });
    });
    await page.route('**/api/facebook/posts/fb-job-1', route => route.fulfill({ json: { ok: true, status: 'posted' } }));
    page.once('dialog', dialog => dialog.accept());
    await fbIcon.click();
    await page.getByText('Day 4 submitted to Facebook.', { exact: false }).waitFor({ timeout: 10000 });
    assert.equal(fbPosted.project, 'gk-questions');
    assert.equal(fbPosted.day, 4);

    const fbToggle = page.locator('#auto-post-facebook');
    await fbToggle.waitFor();
    assert.equal(await fbToggle.isChecked(), false);

    let kitaabReady = false;
    let kitaabFbPayload = null;
    await page.route('**/api/flow-settings?*', route => route.fulfill({
      json: {
        ok: true,
        effective: {
          image: { model: '', aspect: '9:16' },
          video: { model: 'Omni 1.1 Flash', aspect: '9:16', duration: '10s' },
          tiktok: { autoPost: false },
          facebook: { autoPost: true }
        }
      }
    }));
    await page.route('**/api/generation-jobs/*', route => {
      const body = requests[0];
      kitaabReady = true;
      return route.fulfill({ json: { ok: true, id: body.id, day: body.day, status: 'completed', file: 'projects/jindagi-kitaab/videos/day-01.png' } });
    });
    await page.route('**/api/tiktok/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      return route.fulfill({
        json: {
          ok: true,
          videos: project === 'jindagi-kitaab' && kitaabReady ? [{ day: 1, ext: '.png', status: 'unposted', active: false }] : []
        }
      });
    });
    await page.route('**/api/facebook/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      return route.fulfill({
        json: {
          ok: true,
          videos: project === 'jindagi-kitaab' && kitaabReady ? [{ day: 1, ext: '.png', status: kitaabFbPayload ? 'posted' : 'unposted', active: false }] : []
        }
      });
    });
    await page.route('**/api/facebook/posts', route => {
      kitaabFbPayload = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'kitaab-fb-1' } });
    });
    await page.route('**/api/facebook/posts/kitaab-fb-1', route => route.fulfill({ json: { ok: true, status: 'posted' } }));

    await fbToggle.check();
    await page.evaluate(() => localStorage.setItem('jindagi-kitaab-v1', JSON.stringify({ done: {} })));
    await page.getByRole('button', { name: 'Generate next जिन्दगीको किताब photo with Flow' }).click();
    await page.locator('[data-flow-project="jindagi-kitaab"]').getByText('Day 1 submitted to Facebook.', { exact: false }).waitFor({ timeout: 10000 });
    assert.equal(kitaabFbPayload.project, 'jindagi-kitaab');
    assert.equal(kitaabFbPayload.day, 1);
    assert.match(kitaabFbPayload.context, /#LifeIsABook/);
  } finally { await context.close(); }
});

test('confirmFacebookPost confirms post submission and rejects Facebook errors', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.route('**/post/create', route => route.fulfill({
      contentType: 'text/html',
      body: `<div role="dialog"><div aria-label="Post" role="button">Post</div><button onclick="document.body.innerHTML='<p>Your post is being processed</p>';">Submit</button></div>`
    }));
    await page.goto(`${base}/post/create`);
    await page.click('button:has-text("Submit")');
    await confirmFacebookPost(page, 'Test caption');

    await page.route('**/post/error', route => route.fulfill({
      contentType: 'text/html',
      body: `<p>Something went wrong. Please try again later.</p>`
    }));
    await page.goto(`${base}/post/error`);
    await assert.rejects(() => confirmFacebookPost(page, 'Test caption', 2000), /Facebook reported an error/);
  } finally { await context.close(); }
});

test('auto-sends generated media with caption to Telegram via /api/telegram/posts and saves Bot Token in UI', async () => {
  const { context, page, requests } = await setup();
  try {
    const tokenInput = page.locator('#telegram-bot-token-quick');
    const chatIdInput = page.locator('#telegram-chat-id-quick');
    await tokenInput.waitFor();
    assert.equal(await tokenInput.inputValue(), 'PASTE_YOUR_BOTFATHER_TOKEN_HERE');
    assert.equal(await chatIdInput.inputValue(), '7223190114');

    let kitaabReady = false;
    let tgPayload = null;
    await page.route('**/api/flow-settings?*', route => route.fulfill({
      json: {
        ok: true,
        effective: {
          image: { model: '', aspect: '9:16' },
          video: { model: 'Omni 1.1 Flash', aspect: '9:16', duration: '10s' },
          tiktok: { autoPost: false },
          facebook: { autoPost: false },
          telegram: { autoPost: true, botToken: '123456:BOT_TOKEN', chatId: '7223190114' }
        }
      }
    }));
    await page.route('**/api/generation-jobs/*', route => {
      const body = requests[0];
      kitaabReady = true;
      return route.fulfill({ json: { ok: true, id: body.id, day: body.day, status: 'completed', file: 'projects/jindagi-kitaab/videos/day-01.png' } });
    });
    await page.route('**/api/telegram/videos?*', route => {
      const project = new URL(route.request().url()).searchParams.get('project');
      return route.fulfill({
        json: {
          ok: true,
          videos: project === 'jindagi-kitaab' && kitaabReady ? [{ day: 1, ext: '.png', status: tgPayload ? 'posted' : 'unposted', active: false }] : []
        }
      });
    });
    await page.route('**/api/telegram/posts', route => {
      tgPayload = route.request().postDataJSON();
      return route.fulfill({ status: 202, json: { ok: true, id: 'kitaab-tg-1' } });
    });
    await page.route('**/api/telegram/posts/kitaab-tg-1', route => route.fulfill({ json: { ok: true, status: 'posted' } }));

    await page.evaluate(() => localStorage.setItem('jindagi-kitaab-v1', JSON.stringify({ done: {} })));
    await page.getByRole('button', { name: 'Generate next जिन्दगीको किताब photo with Flow' }).click();
    await page.locator('[data-flow-project="jindagi-kitaab"]').getByText('Day 1 sent to Telegram with caption ✓', { exact: false }).waitFor({ timeout: 10000 });
    assert.equal(tgPayload.project, 'jindagi-kitaab');
    assert.equal(tgPayload.day, 1);
    assert.match(tgPayload.context, /#LifeIsABook/);
  } finally { await context.close(); }
});

test('kam-nalagne and sadhu-rani Flow buttons generate next unmarked clip with required characters', async () => {
  const { context, page, requests } = await setup();
  try {
    await page.route('**/api/generation-jobs/*', route => {
      const last = requests[requests.length - 1];
      return route.fulfill({ json: { ok: true, id: last.id, day: last.day, status: 'completed', file: `projects/${last.project}/videos/day-${String(last.day).padStart(2, '0')}.mp4` } });
    });

    await page.evaluate(() => {
      localStorage.setItem('kam-nalagne-v1', JSON.stringify({ done: { '0-0': true, '0-1': true }, ar: '16:9' }));
      localStorage.setItem('sadhu-rani-v1', JSON.stringify({ done: { '0-0': true }, ar: '9:16' }));
    });

    await page.getByRole('button', { name: 'Generate next काम नलाग्ने कोही हुँदैन clip with Flow' }).click();
    await page.locator('[data-flow-project="kam-nalagne"]').getByText('Day 3 is ready.').waitFor();
    assert.equal(requests[0].project, 'kam-nalagne');
    assert.equal(requests[0].day, 3);
    assert.deepEqual(requests[0].characters.map(c => c.code), ['S', 'A']);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('kam-nalagne-v1')).done['0-2']), true);

    await page.getByRole('button', { name: 'Generate next साधु र राडी clip with Flow' }).click();
    await page.locator('[data-flow-project="sadhu-rani"]').getByText('Day 2 is ready.').waitFor();
    assert.equal(requests[1].project, 'sadhu-rani');
    assert.equal(requests[1].day, 2);
    assert.deepEqual(requests[1].characters.map(c => c.code), ['H']);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('sadhu-rani-v1')).done['0-1']), true);
  } finally { await context.close(); }
});

test('stickman-lantern Flow button generates next unmarked 16:9 visual-only scene', async () => {
  const { context, page, requests } = await setup();
  try {
    await page.route('**/api/flow-settings?*', route => route.fulfill({
      json: { ok: true, effective: { video: { model: 'Omni 1.1 Flash', aspect: '16:9', duration: '10s' }, characters: { consistency: true } } }
    }));
    await page.route('**/api/generation-jobs/*', route => {
      const last = requests[requests.length - 1];
      return route.fulfill({ json: { ok: true, id: last.id, day: last.day, status: 'completed', file: `projects/${last.project}/videos/day-${String(last.day).padStart(2, '0')}.mp4` } });
    });

    await page.evaluate(() => {
      localStorage.setItem('stickman-lantern-v1', JSON.stringify({ done: { 1: true, 2: true, 3: true, 4: true, 5: true }, ar: '16:9' }));
    });

    await page.getByRole('button', { name: 'Generate next The Last Lantern clip with Flow' }).click();
    await page.locator('[data-flow-project="stickman-lantern"]').getByText('Day 6 is ready.').waitFor();
    assert.equal(requests[0].project, 'stickman-lantern');
    assert.equal(requests[0].day, 6);
    assert.equal(requests[0].aspect, '16:9');
    assert.match(requests[0].prompt, /NARRATION = NO/i);
    assert.deepEqual(requests[0].characters.map(c => c.code), ['KIRAN', 'PIP']);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('stickman-lantern-v1')).done[6]), true);
  } finally { await context.close(); }
});
