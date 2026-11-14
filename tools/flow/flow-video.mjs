import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { FLOW_URL, SELECTORS as S } from './selectors.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const LOG_DIR = path.join(HERE, 'logs');
const CHROME = process.env.FLOW_CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = Number(process.env.FLOW_DEBUG_PORT || 9222);
const ENDPOINT = process.env.FLOW_CDP_URL || `http://127.0.0.1:${PORT}`;
const SIBLING_PROFILE = path.resolve(ROOT, '..', 'katahari-books', '.flow-profile');
const PROFILE = process.env.FLOW_PROFILE_DIR
  || (fs.existsSync(SIBLING_PROFILE) ? SIBLING_PROFILE : path.join(ROOT, '.flow-profile'));

const sleep = ms => new Promise(r => setTimeout(r, ms));
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

export async function connect(log) {
  try { return await chromium.connectOverCDP(ENDPOINT, { timeout: 5000 }); } catch {}
  if (!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}. Set FLOW_CHROME_PATH.`);
  fs.mkdirSync(PROFILE, { recursive: true });
  log(`Starting Chrome with the Flow profile (${PROFILE})...`);
  spawn(CHROME, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--no-first-run', '--no-default-browser-check', '--start-minimized', FLOW_URL],
    { detached: true, stdio: 'ignore' }).unref();
  for (let i = 0; i < 60; i++) {
    await sleep(1000);
    try { return await chromium.connectOverCDP(ENDPOINT, { timeout: 3000 }); } catch {}
  }
  throw new Error('Chrome started but the debug port did not open. Close other Chrome windows that use this profile and retry.');
}

async function findFlowPage(browser) {
  const pages = browser.contexts().flatMap(c => c.pages());
  let page = pages.find(p => S.pageUrl.test(p.url()));
  if (!page) {
    page = await browser.contexts()[0].newPage();
    await page.goto(FLOW_URL, { waitUntil: 'domcontentloaded' });
  }
  if (/accounts\.google\./.test(page.url())) throw new Error('Google sign-in is showing. Sign in in the Flow Chrome window, then retry.');
  return page;
}

async function setRadio(page, locator, label) {
  const radio = locator.first();
  await radio.waitFor({ state: 'visible', timeout: 10000 }).catch(() => { throw new Error(`Flow setting not found: ${label}.`); });
  if ((await radio.getAttribute('aria-checked')) !== 'true') {
    await radio.click();
    await page.waitForTimeout(400);
  }
  if ((await radio.getAttribute('aria-checked')) !== 'true') throw new Error(`Flow did not select ${label}.`);
}

async function configure(page, { model, aspect, duration }) {
  const modelButton = page.locator(S.modelFamilyButton).first();
  if (!(await modelButton.isVisible().catch(() => false))) await page.locator(S.settingsTrigger).first().click();
  await modelButton.waitFor({ state: 'visible', timeout: 15000 });

  await setRadio(page, page.getByRole('radio', { name: S.videoModeRadio }), 'Video mode');

  if (!((await modelButton.innerText()).trim().startsWith(model))) {
    await modelButton.click();
    const item = page.getByRole('menuitem', { name: S.modelMenuItem(model) }).first();
    await item.waitFor({ state: 'visible', timeout: 10000 });
    await item.click();
    await page.waitForTimeout(500);
  }
  if (!((await modelButton.innerText()).trim().startsWith(model))) throw new Error(`Flow did not select model ${model}.`);

  await setRadio(page, page.getByRole('radio', { name: S.aspectRadio(aspect) }), `aspect ${aspect}`);
  await setRadio(page, page.getByRole('radio', { name: S.durationRadio(duration) }), `duration ${duration}`);
  await setRadio(page, page.getByRole('radio', { name: S.singleRadio }), 'x1 output count');
}

async function downloadVideo(page, src) {
  try {
    const base64 = await page.evaluate(async url => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const bytes = new Uint8Array(await (await response.blob()).arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return btoa(binary);
    }, src);
    return Buffer.from(base64, 'base64');
  } catch {
    const response = await page.context().request.get(src, { timeout: 180000 });
    if (!response.ok()) throw new Error('Video download failed with HTTP ' + response.status());
    return await response.body();
  }
}

async function diagnose(page, label, error) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const base = path.join(LOG_DIR, `${stamp()}-${label}`);
  await page.screenshot({ path: base + '.png' }).catch(() => {});
  const info = await page.evaluate(() => ({
    url: location.href,
    videos: document.querySelectorAll('video').length,
    flowTags: [...new Set([...document.querySelectorAll('*')].map(e => e.tagName.toLowerCase()).filter(t => t.startsWith('flow-')))]
  })).catch(() => ({}));
  fs.writeFileSync(base + '.json', JSON.stringify({ error: String(error && error.message || error), ...info }, null, 2));
  return base;
}

/**
 * Generates one video in Flow and saves it to outFile.
 * Throws with a diagnostic log path on failure. Does not resubmit on its own.
 */
export async function generateVideo({ prompt, outFile, model, aspect, duration, log = console.log }) {
  const browser = await connect(log);
  let page;
  try {
    page = await findFlowPage(browser);
    await configure(page, { model, aspect, duration });

    const box = page.locator(S.promptBox).first();
    await box.waitFor({ state: 'visible', timeout: 15000 });
    await box.fill(prompt);

    const before = await page.evaluate(() => [...document.querySelectorAll('video')].map(v => v.currentSrc || v.src));
    const submit = page.locator(S.submitButton).first();
    await submit.waitFor({ state: 'visible', timeout: 15000 });
    if (await submit.isDisabled()) throw new Error('Start generation is disabled after filling the prompt. Check Flow settings.');

    log(`Submitting to Flow (${model}, ${aspect}, ${duration})...`);
    await submit.click();

    const handle = await page.waitForFunction(old => {
      const v = [...document.querySelectorAll('video')].find(x => {
        const s = x.currentSrc || x.src;
        return s && !old.includes(s) && x.readyState >= 2 && x.videoWidth > 0;
      });
      return v ? { src: v.currentSrc || v.src, width: v.videoWidth, height: v.videoHeight } : false;
    }, before, { timeout: 900000, polling: 2000 });
    const result = await handle.jsonValue();
    await handle.dispose();

    const [w, h] = aspect.split(':').map(Number);
    if (Math.abs(result.width / result.height - w / h) / (w / h) > 0.08) {
      const base = await diagnose(page, 'aspect-mismatch', `${result.width}x${result.height}`);
      throw new Error(`Flow returned ${result.width}x${result.height}, expected ${aspect}. Diagnostics: ${base}`);
    }

    const bytes = await downloadVideo(page, result.src);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, bytes);
    log(`Saved ${outFile} (${result.width}x${result.height}).`);
    return { file: outFile, width: result.width, height: result.height };
  } catch (err) {
    if (page) {
      const base = await diagnose(page, 'failure', err);
      err.message += ` Diagnostics: ${base}`;
    }
    throw err;
  } finally {
    await browser.close().catch(() => {});
  }
}
