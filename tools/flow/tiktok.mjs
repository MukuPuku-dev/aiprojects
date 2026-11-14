import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { connect } from './flow-video.mjs';

const PROJECTS = new Set(['gk-questions', 'daily-motivations']);
const UPLOAD_URL = 'https://www.tiktok.com/creator-center/upload?from=upload';
const GEMINI_URL = 'https://mukeshpokharel-testing.hf.space/gemini';

export function createTikTokService(root, { generateCaption = captionFromGemini, upload = uploadToTikTok } = {}) {
  const recordFile = path.join(root, 'tools', 'flow', 'tiktok-posts.json');
  const jobs = new Map();
  let active = null;
  const keyFor = (project, day) => `${project}:${day}`;

  function validate(project, day) {
    if (!PROJECTS.has(project) || !Number.isInteger(day) || day < 1 || day > 30) throw new Error('Invalid project or day.');
    return path.join(root, 'projects', project, 'videos', `day-${String(day).padStart(2, '0')}.mp4`);
  }
  function records() {
    if (!fs.existsSync(recordFile)) return {};
    const data = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('TikTok posting history is invalid.');
    return data;
  }
  function writeRecords(data) {
    fs.mkdirSync(path.dirname(recordFile), { recursive: true });
    const temporary = recordFile + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temporary, recordFile);
  }
  function digest(file) {
    return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  function list(project) {
    if (!PROJECTS.has(project)) throw new Error('Invalid project.');
    const saved = records();
    const result = [];
    for (let day = 1; day <= 30; day++) {
      const file = validate(project, day);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
      const record = saved[keyFor(project, day)];
      const sameVideo = record && record.hash === digest(file);
      const status = record?.status === 'pending' ? 'unknown' : sameVideo && record?.status === 'posted' ? 'posted' : 'unposted';
      result.push({ day, status, active: !!active && active.project === project && active.day === day });
    }
    return result;
  }
  function start(project, day, context) {
    const file = validate(project, day);
    if (typeof context !== 'string' || !context.trim() || context.length > 5000) throw new Error('Video context is required.');
    if (active) throw new Error('Another TikTok upload is already in progress.');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error('The generated video was not found.');
    const hash = digest(file);
    const key = keyFor(project, day);
    const saved = records();
    if (saved[key]?.status === 'pending') throw new Error('The previous posting result is unknown. Check TikTok before resolving it.');
    if (saved[key]?.status === 'posted' && saved[key].hash === hash) throw new Error('This video was already posted.');
    const job = { id: randomUUID(), project, day, status: 'caption', error: null };
    active = job;
    jobs.set(job.id, job);
    (async () => {
      let submitted = false;
      try {
        const caption = await generateCaption(context, project);
        job.status = 'uploading';
        await upload({
          file, caption,
          beforePost: () => {
            if (digest(file) !== hash) throw new Error('The video changed during upload. No post was submitted.');
            const current = records();
            current[key] = { hash, status: 'pending', updatedAt: new Date().toISOString() };
            writeRecords(current);
            submitted = true;
            job.status = 'posting';
          }
        });
        const current = records();
        current[key] = { hash, status: 'posted', updatedAt: new Date().toISOString() };
        writeRecords(current);
        job.status = 'posted';
      } catch (error) {
        job.status = submitted ? 'unknown' : 'failed';
        job.error = error.message;
        console.error(`TikTok ${project} day ${day}: ${error.message}`);
      } finally { active = null; }
    })();
    return job;
  }
  function resolve(project, day, posted) {
    const file = validate(project, day), key = keyFor(project, day);
    if (typeof posted !== 'boolean') throw new Error('Choose whether the video was posted.');
    if (active && active.project === project && active.day === day) throw new Error('The upload is still running.');
    const saved = records();
    if (saved[key]?.status !== 'pending') throw new Error('There is no uncertain post to resolve.');
    if (posted) saved[key] = { ...saved[key], status: 'posted', updatedAt: new Date().toISOString() };
    else delete saved[key];
    writeRecords(saved);
  }
  return { list, start, resolve, get: id => jobs.get(id) };
}

export async function captionFromGemini(context, project) {
  const guidance = project === 'gk-questions'
    ? 'Invite viewers to answer the general knowledge quiz and comment how many answers they got right. Do not mention a specific topic, facts, people, places, dates, answer choices, multiple-choice, IQ scores or IQ tests.'
    : 'Reflect the supplied motivational line. Do not add facts or claims that are not in the video details.';
  const prompt = `Write one concise TikTok caption in Nepali. ${guidance} Include a few relevant hashtags. Output only the caption, without quotation marks or explanations.\n\nVideo details:\n${context}`;
  const response = await fetch(GEMINI_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(120000)
  });
  let body;
  try { body = await response.json(); } catch { throw new Error(`Gemini returned invalid JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`Gemini: ${typeof body.detail === 'string' ? body.detail : `HTTP ${response.status}`}`);
  if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 4000) throw new Error('Gemini returned an empty or overlong caption.');
  return body.text.trim();
}

export async function confirmTikTokPost(page, caption) {
  const waitForResult = allowConfirmation => page.waitForFunction(({ expected, allowConfirmation }) => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const normalized = expected.replace(/\s+/g, ' ');
    if (allowConfirmation && /continue to post\?/i.test(text) && [...document.querySelectorAll('button')].some(button => button.innerText.trim() === 'Post now')) return 'confirmation';
    if (/your video (has been|was) (uploaded|posted)|video (has been|was) (uploaded|posted)|post (published|uploaded) successfully/i.test(text)) return 'submitted';
    if (location.pathname.startsWith('/tiktokstudio/content') && text.includes(normalized)) return 'submitted';
    return false;
  }, { expected: caption, allowConfirmation }, { timeout: 90000 });

  const result = await waitForResult(true);
  const state = await result.jsonValue();
  await result.dispose();
  if (state === 'confirmation') {
    await page.getByRole('button', { name: 'Post now', exact: true }).click();
    const final = await waitForResult(false);
    const finalState = await final.jsonValue();
    await final.dispose();
    if (finalState !== 'submitted') throw new Error('TikTok did not confirm the submission.');
  }
}

export async function uploadToTikTok({ file, caption, beforePost }) {
  const browser = await connect(console.log);
  let page;
  try {
    const context = browser.contexts()[0];
    if (!context) throw new Error('Chrome has no browser profile.');
    page = await context.newPage();
    await page.goto(UPLOAD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.bringToFront();
    const input = page.locator('input[type="file"][accept*="video"]');
    try { await input.waitFor({ state: 'attached', timeout: 300000 }); }
    catch { throw new Error('TikTok upload page did not appear. Sign in in the Flow Chrome window and retry.'); }
    await input.setInputFiles(file);
    const editor = page.locator('[contenteditable="true"][role="combobox"]');
    await editor.waitFor({ state: 'visible', timeout: 180000 });
    const gotIt = page.getByRole('button', { name: 'Got it', exact: true });
    if (await gotIt.isVisible()) await gotIt.click();
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(caption);
    if ((await editor.innerText()).trim() !== caption) throw new Error('TikTok did not accept the complete caption.');
    const now = page.locator('input[name="postSchedule"][value="post_now"]');
    if (!(await now.isChecked())) throw new Error('TikTok is not set to post now. Check its scheduling settings.');
    const post = page.locator('[data-e2e="post_video_button"]');
    await post.waitFor({ state: 'visible', timeout: 180000 });
    await page.waitForFunction(() => {
      const button = document.querySelector('[data-e2e="post_video_button"]');
      return button && !button.disabled && button.getAttribute('aria-disabled') !== 'true' && button.getAttribute('data-loading') !== 'true';
    }, null, { timeout: 180000 });
    beforePost();
    await post.click();
    await confirmTikTokPost(page, caption);
  } catch (error) {
    throw new Error(`TikTok browser: ${error.message}`);
  } finally {
    await browser.close().catch(error => console.error(`Could not disconnect Chrome: ${error.message}`));
  }
}
