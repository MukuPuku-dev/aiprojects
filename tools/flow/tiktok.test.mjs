import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { captionFromGemini, createTikTokService, selectFirstTikTokSound } from './tiktok.mjs';
import {
  FACEBOOK_CREATE_URL,
  captionFromGemini as facebookCaptionFromGemini,
  createFacebookService,
  enableFacebookAiLabel
} from './facebook.mjs';
import {
  CHAT_ID as TELEGRAM_DEFAULT_CHAT_ID,
  createTelegramService,
  uploadToTelegram
} from './telegram.mjs';

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

test('maya-photos uses supplied caption directly while teenage-love-vibes requests Gemini continuation story', async t => {
  const prompts = {};
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls++;
    const p = JSON.parse(options.body).prompt;
    prompts[prompts._next] = p;
    return new Response(JSON.stringify({ text: 'Story caption' }), { status: 200 });
  });
  const preset = 'प्रिय ..!\n\nकथाको निरन्तरता\n\n— @माया';
  assert.equal(await captionFromGemini(`  ${preset}  `, 'maya-photos'), preset);
  const kitaabPreset = 'केही पानाहरू बन्द नै रहन देऊ ।\n#LifeIsABook #UnspokenFeelings';
  assert.equal(await captionFromGemini(`  ${kitaabPreset}  `, 'jindagi-kitaab'), kitaabPreset);
  assert.equal(calls, 0);

  prompts._next = 'teenage-love-vibes';
  await captionFromGemini('Clip: Window Breeze', 'teenage-love-vibes');
  assert.equal(calls, 1);
  assert.match(prompts['teenage-love-vibes'], /silent teenage love scene/);
  assert.match(prompts['teenage-love-vibes'], /heart-touching Nepali continuation story/);
});

test('lists and posts maya-photos and jindagi-kitaab PNG images and teenage-love-vibes MP4 clips', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-tiktok-new-'));
  const mayaDir = path.join(root, 'projects', 'maya-photos', 'videos');
  const kitaabDir = path.join(root, 'projects', 'jindagi-kitaab', 'videos');
  const loveDir = path.join(root, 'projects', 'teenage-love-vibes', 'videos');
  fs.mkdirSync(mayaDir, { recursive: true });
  fs.mkdirSync(kitaabDir, { recursive: true });
  fs.mkdirSync(loveDir, { recursive: true });
  fs.writeFileSync(path.join(mayaDir, 'day-01.png'), 'png-bytes');
  fs.writeFileSync(path.join(kitaabDir, 'day-01.png'), 'kitaab-png-bytes');
  fs.writeFileSync(path.join(loveDir, 'day-02.mp4'), 'mp4-bytes');
  const uploadedFiles = [];
  const service = createTikTokService(root, {
    generateCaption: async () => 'लम्बे कथाको क्याप्सन',
    upload: async ({ file, beforePost }) => { uploadedFiles.push(path.basename(file)); beforePost(); }
  });
  try {
    assert.deepEqual(service.list('maya-photos'), [{ day: 1, ext: '.png', status: 'unposted', active: false }]);
    assert.deepEqual(service.list('jindagi-kitaab'), [{ day: 1, ext: '.png', status: 'unposted', active: false }]);
    assert.deepEqual(service.list('teenage-love-vibes'), [{ day: 2, status: 'unposted', active: false }]);
    const job1 = service.start('maya-photos', 1, 'Portrait story context');
    assert.equal((await finished(service, job1.id)).status, 'posted');
    const jobKitaab = service.start('jindagi-kitaab', 1, 'Sunset quote context');
    assert.equal((await finished(service, jobKitaab.id)).status, 'posted');
    const job2 = service.start('teenage-love-vibes', 2, 'Silent crush story context');
    assert.equal((await finished(service, job2.id)).status, 'posted');
    assert.deepEqual(uploadedFiles, ['day-01.png', 'day-01.png', 'day-02.mp4']);
    assert.equal(service.list('maya-photos')[0].status, 'posted');
    assert.equal(service.list('jindagi-kitaab')[0].status, 'posted');
    assert.equal(service.list('teenage-love-vibes')[0].status, 'posted');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('selectFirstTikTokSound opens Sounds, picks the first For You sound, and dismisses the modal if needed', async () => {
  const events = [];
  const createButton = (name, { visible = true, onClick } = {}) => ({
    first() { return this; },
    async waitFor({ state }) { events.push(`wait:${name}:${state}`); },
    async click() { events.push(`click:${name}`); onClick?.(); },
    async isVisible() { events.push(`visible:${name}`); return visible; }
  });
  let replaceVisible = false;
  const page = {
    getByRole(role, { name }) {
      assert.equal(role, 'button');
      if (name === 'Add sound') return createButton('Add sound');
      if (name === 'Use') return createButton('Use', { visible: true, onClick: () => { replaceVisible = true; } });
      if (name === 'Replace') {
        return createButton('Replace', {
          onClick: () => {}
        });
      }
      throw new Error(`Unexpected role query: ${name}`);
    },
    keyboard: {
      async press(key) { events.push(`press:${key}`); }
    }
  };
  await selectFirstTikTokSound(page);
  assert.equal(replaceVisible, true);
  assert.deepEqual(events, [
    'wait:Add sound:visible',
    'click:Add sound',
    'wait:Use:visible',
    'click:Use',
    'wait:Replace:visible',
    'visible:Use',
    'press:Escape'
  ]);
});

test('Facebook service uses https://www.facebook.com/post/create and tracks posts independently from TikTok', async t => {
  assert.equal(FACEBOOK_CREATE_URL, 'https://www.facebook.com/post/create');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-facebook-'));
  const gkDir = path.join(root, 'projects', 'gk-questions', 'videos');
  const kitaabDir = path.join(root, 'projects', 'jindagi-kitaab', 'videos');
  fs.mkdirSync(gkDir, { recursive: true });
  fs.mkdirSync(kitaabDir, { recursive: true });
  fs.writeFileSync(path.join(gkDir, 'day-04.mp4'), 'video-bytes');
  fs.writeFileSync(path.join(kitaabDir, 'day-01.png'), 'png-bytes');

  let geminiPrompt;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    geminiPrompt = JSON.parse(options.body).prompt;
    return new Response(JSON.stringify({ text: 'Facebook Nepali Caption' }), { status: 200 });
  });

  const tt = createTikTokService(root, { generateCaption: async () => 'tt', upload: async ({ beforePost }) => beforePost() });
  const fbUploaded = [];
  const fb = createFacebookService(root, {
    upload: async ({ file, caption, beforePost }) => {
      fbUploaded.push({ file: path.basename(file), caption });
      beforePost();
    }
  });

  try {
    const ttJob = tt.start('gk-questions', 4, 'quiz');
    assert.equal((await finished(tt, ttJob.id)).status, 'posted');
    assert.equal(fb.list('gk-questions')[0].status, 'unposted');

    const fbJob = fb.start('gk-questions', 4, 'Nepali GK quiz context');
    assert.equal((await finished(fb, fbJob.id)).status, 'posted');
    assert.match(geminiPrompt, /Write one Facebook caption in Nepali\./);
    assert.equal(fb.list('gk-questions')[0].status, 'posted');

    const fbPhotoJob = fb.start('jindagi-kitaab', 1, 'केही पानाहरू बन्द नै रहन देऊ । #LifeIsABook');
    assert.equal((await finished(fb, fbPhotoJob.id)).status, 'posted');
    assert.deepEqual(fbUploaded, [
      { file: 'day-04.mp4', caption: 'Facebook Nepali Caption' },
      { file: 'day-01.png', caption: 'केही पानाहरू बन्द नै रहन देऊ । #LifeIsABook' }
    ]);

    const restarted = createFacebookService(root);
    assert.equal(restarted.list('gk-questions')[0].status, 'posted');
    assert.equal(restarted.list('jindagi-kitaab')[0].status, 'posted');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('Facebook uncertain submission blocks retry until explicitly resolved', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-fb-unknown-'));
  const dir = path.join(root, 'projects', 'daily-motivations', 'videos');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'day-01.mp4'), 'video');
  const service = createFacebookService(root, {
    generateCaption: async () => 'caption',
    upload: async ({ beforePost }) => { beforePost(); throw new Error('network drop'); }
  });
  try {
    const job = service.start('daily-motivations', 1, 'Motivation context');
    assert.equal((await finished(service, job.id)).status, 'unknown');
    assert.equal(service.list('daily-motivations')[0].status, 'unknown');
    assert.throws(() => service.start('daily-motivations', 1, 'Motivation context'), /unknown/);
    service.resolve('daily-motivations', 1, false);
    assert.equal(service.list('daily-motivations')[0].status, 'unposted');
    assert.equal(await facebookCaptionFromGemini('  Direct preset  ', 'jindagi-kitaab'), 'Direct preset');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('enableFacebookAiLabel turns on Add AI label switch when off and leaves it on when already enabled', async () => {
  const makeRowDom = (initialChecked) => {
    let aiChecked = initialChecked;
    let boostChecked = false;
    let aiClicks = 0;
    let boostClicks = 0;
    const aiToggle = {
      getAttribute(name) { return name === 'aria-checked' ? String(aiChecked) : null; },
      scrollIntoView() {},
      click() { aiClicks++; aiChecked = !aiChecked; }
    };
    const boostToggle = {
      getAttribute(name) { return name === 'aria-checked' ? String(boostChecked) : null; },
      scrollIntoView() {},
      click() { boostClicks++; boostChecked = !boostChecked; }
    };
    const aiRow = {
      querySelectorAll(sel) { return sel.includes('switch') ? [aiToggle] : []; },
      parentElement: null
    };
    const boostRow = {
      querySelectorAll(sel) { return sel.includes('switch') ? [boostToggle] : []; },
      parentElement: null
    };
    const shareSection = {
      querySelectorAll(sel) { return sel.includes('switch') ? [aiToggle, boostToggle] : []; },
      parentElement: null
    };
    aiRow.parentElement = shareSection;
    boostRow.parentElement = shareSection;
    const aiLabel = { children: [], textContent: 'Add AI label', scrollIntoView() {}, parentElement: aiRow };
    return {
      state: () => ({ aiChecked, boostChecked, aiClicks, boostClicks }),
      run(fn) {
        const prevDoc = globalThis.document;
        globalThis.document = {
          body: shareSection,
          querySelector() { return null; },
          querySelectorAll(sel) { return sel.includes('span') ? [aiLabel] : []; }
        };
        try { return fn(); } finally { globalThis.document = prevDoc; }
      }
    };
  };

  const offDom = makeRowDom(false);
  await enableFacebookAiLabel({
    async evaluate(fn) { return offDom.run(fn); },
    async waitForTimeout() {}
  });
  assert.deepEqual(offDom.state(), { aiChecked: true, boostChecked: false, aiClicks: 1, boostClicks: 0 });

  const onDom = makeRowDom(true);
  await enableFacebookAiLabel({
    async evaluate(fn) { return onDom.run(fn); },
    async waitForTimeout() {}
  });
  assert.deepEqual(onDom.state(), { aiChecked: true, boostChecked: false, aiClicks: 0, boostClicks: 0 });
});

test('Telegram service sends video via sendVideo and photo via sendPhoto to chat 7223190114 with captions', async t => {
  assert.equal(TELEGRAM_DEFAULT_CHAT_ID, '7223190114');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-telegram-'));
  const gkDir = path.join(root, 'projects', 'gk-questions', 'videos');
  const mayaDir = path.join(root, 'projects', 'maya-photos', 'videos');
  fs.mkdirSync(gkDir, { recursive: true });
  fs.mkdirSync(mayaDir, { recursive: true });
  const videoFile = path.join(gkDir, 'day-01.mp4');
  const photoFile = path.join(mayaDir, 'day-01.png');
  fs.writeFileSync(videoFile, 'mp4-video-content');
  fs.writeFileSync(photoFile, 'png-photo-content');

  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200 });
  });

  try {
    let beforeCalled = 0;
    await uploadToTelegram({
      file: videoFile,
      caption: 'नेपाली GK प्रश्न र उत्तर #NepaliGK',
      botToken: '999888:TEST_BOT_TOKEN',
      beforePost: () => { beforeCalled++; }
    });
    assert.equal(beforeCalled, 1);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.telegram.org/bot999888:TEST_BOT_TOKEN/sendVideo');
    assert.equal(calls[0].options.body.get('chat_id'), '7223190114');
    assert.equal(calls[0].options.body.get('caption'), 'नेपाली GK प्रश्न र उत्तर #NepaliGK');
    assert.equal(calls[0].options.body.get('video').name, 'day-01.mp4');

    const longCaption = 'क'.repeat(1200);
    await uploadToTelegram({
      file: photoFile,
      caption: longCaption,
      botToken: '999888:TEST_BOT_TOKEN',
      beforePost: () => { beforeCalled++; }
    });
    assert.equal(beforeCalled, 2);
    assert.equal(calls.length, 3);
    assert.equal(calls[1].url, 'https://api.telegram.org/bot999888:TEST_BOT_TOKEN/sendPhoto');
    assert.equal(calls[1].options.body.get('chat_id'), '7223190114');
    assert.equal(calls[1].options.body.get('photo').name, 'day-01.png');
    assert.equal(calls[1].options.body.get('caption').length, 1024);
    assert.equal(calls[2].url, 'https://api.telegram.org/bot999888:TEST_BOT_TOKEN/sendMessage');
    assert.equal(JSON.parse(calls[2].options.body).text, longCaption);

    const tg = createTelegramService(root, {
      generateCaption: async () => 'Telegram Caption',
      upload: async ({ file, caption, beforePost }) => uploadToTelegram({
        file,
        caption,
        botToken: '999888:TEST_BOT_TOKEN',
        beforePost
      })
    });
    const job = tg.start('gk-questions', 1, 'GK context');
    assert.equal((await finished(tg, job.id)).status, 'posted');
    assert.equal(tg.list('gk-questions')[0].status, 'posted');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('Facebook and social service allow reposting when force is true', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-repost-'));
  try {
    const dir = path.join(root, 'projects', 'tarkari-katha', 'videos');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'day-01.mp4'), 'video');
    let uploads = 0;
    const fb = createFacebookService(root, {
      generateCaption: async () => 'Caption',
      upload: async ({ beforePost }) => { uploads++; beforePost(); }
    });
    const first = fb.start('tarkari-katha', 1, 'clip 1');
    assert.equal((await finished(fb, first.id)).status, 'posted');
    assert.throws(() => fb.start('tarkari-katha', 1, 'clip 1'), /already posted/);
    const repost = fb.start('tarkari-katha', 1, 'clip 1', { force: true });
    assert.equal((await finished(fb, repost.id)).status, 'posted');
    assert.equal(uploads, 2);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
