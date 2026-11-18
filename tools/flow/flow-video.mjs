import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { FLOW_URL, SELECTORS as S } from './selectors.mjs';
import { ensureCredits, readAccountList } from './flow-accounts.mjs';
import { attachCharactersToPrompt, ensureCharactersInFlow } from './flow-characters.mjs';
import { ensureFlowProject } from './flow-project.mjs';

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

async function ensureDirectPromptMode(page) {
  const agentClose = page.locator('flow-agent-panel button[aria-label="Close"]').first();
  if (await agentClose.isVisible().catch(() => false)) {
    await agentClose.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  const trigger = page.locator(`flow-prompt-box ${S.settingsTrigger}`).first();
  if (!(await trigger.isVisible().catch(() => false))) {
    const agentChip = page.locator('flow-prompt-box flow-agent-mode-toggle-chip button, flow-prompt-box button.agent-mode-chip').first();
    if (await agentChip.isVisible().catch(() => false)) {
      await agentChip.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function openSettingsPanel(page) {
  await ensureDirectPromptMode(page);
  const modelButton = page.locator(S.modelFamilyButton).first();
  if (!(await modelButton.isVisible().catch(() => false))) {
    const trigger = page.locator(`flow-prompt-box ${S.settingsTrigger}, ${S.settingsTrigger}`).filter({ visible: true }).first();
    await trigger.click();
  }
  await modelButton.waitFor({ state: 'visible', timeout: 15000 });
  return modelButton;
}

async function selectModel(page, modelButton, model) {
  if (!model) return;
  if (!((await modelButton.innerText()).trim().startsWith(model))) {
    await modelButton.click();
    const item = page.getByRole('menuitem', { name: S.modelMenuItem(model) }).first();
    await item.waitFor({ state: 'visible', timeout: 10000 });
    await item.click();
    await page.waitForTimeout(500);
  }
  if (!((await modelButton.innerText()).trim().startsWith(model))) throw new Error(`Flow did not select model ${model}.`);
}

async function configure(page, { model, aspect, duration }) {
  const modelButton = await openSettingsPanel(page);
  await setRadio(page, page.getByRole('radio', { name: S.videoModeRadio }), 'Video mode');
  await selectModel(page, modelButton, model);
  await setRadio(page, page.getByRole('radio', { name: S.aspectRadio(aspect) }), `aspect ${aspect}`);
  await setRadio(page, page.getByRole('radio', { name: S.durationRadio(duration) }), `duration ${duration}`);
  await setRadio(page, page.getByRole('radio', { name: S.singleRadio }), 'x1 output count');
}

async function configureImage(page, { model, aspect }) {
  const modelButton = await openSettingsPanel(page);
  await setRadio(page, page.getByRole('radio', { name: S.imageModeRadio }), 'Image mode');
  await selectModel(page, modelButton, model);
  await setRadio(page, page.getByRole('radio', { name: S.aspectRadio(aspect) }), `aspect ${aspect}`);
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

function checkAspect(width, height, aspect) {
  const [w, h] = aspect.split(':').map(Number);
  if (Math.abs(width / height - w / h) / (w / h) > 0.08) {
    throw new Error(`Flow returned ${width}x${height}, expected ${aspect}.`);
  }
}

async function saveViaVideoElement(page, outFile, aspect, log) {
  const handle = await page.waitForFunction(selector => {
    const video = document.querySelector(selector);
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight || !video.currentSrc) return false;
    return { src: video.currentSrc, width: video.videoWidth, height: video.videoHeight };
  }, S.videoPlayer, { timeout: 60000 });
  const result = await handle.jsonValue();
  await handle.dispose();

  checkAspect(result.width, result.height, aspect);
  const bytes = await downloadVideo(page, result.src);
  if (!bytes.length) throw new Error('Flow returned an empty video.');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, bytes);
  log(`Saved ${outFile} (${result.width}x${result.height}).`);
  return { file: outFile, width: result.width, height: result.height };
}

async function readElementDims(page, selector, wProp, hProp) {
  return page.evaluate(({ selector, wProp, hProp }) => {
    const el = document.querySelector(selector);
    const width = el?.[wProp];
    const height = el?.[hProp];
    return width && height ? { width, height } : null;
  }, { selector, wProp, hProp }).catch(() => null);
}

async function downloadViaMenu(page, outFile, aspect, dims, emptyMessage, log) {
  if (dims) checkAspect(dims.width, dims.height, aspect);

  const downloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.locator(S.downloadMediaButton).first().click();
  const originalItem = page.getByRole('menuitem', { name: S.downloadOriginalItem }).first();
  const dl = await Promise.race([
    downloadPromise,
    originalItem.waitFor({ state: 'visible', timeout: 10000 }).then(
      async () => { await originalItem.click(); return downloadPromise; },
      () => downloadPromise
    )
  ]);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await dl.saveAs(outFile);
  if (!fs.existsSync(outFile) || !fs.statSync(outFile).size) {
    throw new Error(emptyMessage);
  }
  const sizeLabel = dims ? ` (${dims.width}x${dims.height})` : '';
  log(`Saved ${outFile}${sizeLabel}.`);
  return { file: outFile, width: dims?.width ?? null, height: dims?.height ?? null };
}

export async function saveOpenedVideo(page, outFile, aspect, log = console.log) {
  const player = page.locator(S.videoPlayer).first();
  const downloadBtn = page.locator(S.downloadMediaButton).first();
  await Promise.any([
    player.waitFor({ state: 'attached', timeout: 30000 }),
    downloadBtn.waitFor({ state: 'visible', timeout: 30000 })
  ]).catch(() => {
    throw new Error('Timed out waiting for the generated video player or download button.');
  });

  if (await player.count() > 0) return saveViaVideoElement(page, outFile, aspect, log);
  const dims = await readElementDims(page, S.editorCanvas, 'width', 'height');
  return downloadViaMenu(page, outFile, aspect, dims, 'Flow returned an empty video.', log);
}

export async function saveOpenedImage(page, outFile, aspect, log = console.log) {
  const downloadBtn = page.locator(S.downloadMediaButton).first();
  await downloadBtn.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {
    throw new Error('Timed out waiting for the generated image download button.');
  });
  const dims = await readElementDims(page, S.imagePreview, 'naturalWidth', 'naturalHeight');
  return downloadViaMenu(page, outFile, aspect, dims, 'Flow returned an empty image.', log);
}

const normalizePrompt = text => text.replace(/\s+/g, ' ').trim();

async function openNewMedia(page, thumbnailSelector, previousThumbnails, prompt, label, timeout) {
  const seen = new Set(previousThumbnails);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const handle = await page.waitForFunction(({ selector, seen }) => {
      const image = [...document.querySelectorAll(selector)].find(el =>
        el.src && !seen.includes(el.src) && el.getClientRects().length > 0
      );
      return image ? image.src : false;
    }, { selector: thumbnailSelector, seen: [...seen] }, { timeout: Math.max(1, deadline - Date.now()), polling: 2000 });
    const src = await handle.jsonValue();
    await handle.dispose();
    seen.add(src);
    const thumbnail = page.locator(thumbnailSelector).filter({ visible: true });
    const idx = await thumbnail.evaluateAll((els, target) => els.findIndex(el => el.src === target), src).catch(() => -1);
    if (idx < 0) continue;
    const clicked = await thumbnail.nth(idx).click({ timeout: 5000 }).then(() => true, () => false);
    if (!clicked) continue;
    const promptElement = page.locator(S.videoPrompt).first();
    await promptElement.waitFor({ state: 'visible', timeout: 30000 });
    if (normalizePrompt(await promptElement.innerText()) === normalizePrompt(prompt)) return;
    await page.goBack({ waitUntil: 'domcontentloaded' });
  }
  throw new Error(`Timed out waiting for the generated Flow ${label}.`);
}

export function openNewVideo(page, previousThumbnails, prompt, timeout = 900000) {
  return openNewMedia(page, S.videoThumbnail, previousThumbnails, prompt, 'video', timeout);
}

export function openNewImage(page, previousThumbnails, prompt, timeout = 300000) {
  return openNewMedia(page, S.imageThumbnail, previousThumbnails, prompt, 'image', timeout);
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

async function runGeneration({ checkCredits, configurePage, thumbnailSelector, waitOpen, saveOpened, summary, prompt, flowProject, project = '', charProject = '', characterConsistency = false, requiredCharacters = [], log }) {
  const browser = await connect(log);
  let page;
  try {
    page = await findFlowPage(browser);
    if (checkCredits) await ensureCredits(page, { accounts: readAccountList(), log });
    await ensureFlowProject(page, flowProject, { log });
    await ensureDirectPromptMode(page);
    if (characterConsistency && requiredCharacters.length) {
      await ensureCharactersInFlow(page, { root: ROOT, project: charProject || project, characters: requiredCharacters, log });
    }
    await configurePage(page);
    if (characterConsistency && requiredCharacters.length) {
      await attachCharactersToPrompt(page, { characters: requiredCharacters, log });
    }

    const box = page.locator(S.promptBox).first();
    await box.waitFor({ state: 'visible', timeout: 15000 });
    await box.fill(prompt);

    const before = await page.locator(thumbnailSelector).evaluateAll(images => images.map(image => image.src).filter(Boolean));
    const submit = page.locator(S.submitButton).first();
    await submit.waitFor({ state: 'visible', timeout: 15000 });
    if (await submit.isDisabled()) throw new Error('Start generation is disabled after filling the prompt. Check Flow settings.');

    log(`Submitting to Flow (${summary})...`);
    await submit.click();

    await waitOpen(page, before);
    const result = await saveOpened(page);
    await page.goBack({ waitUntil: 'domcontentloaded' });
    return result;
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

/**
 * Generates one video in Flow and saves it to outFile.
 * Throws with a diagnostic log path on failure. Does not resubmit on its own.
 */
export function generateVideo({ prompt, outFile, model, aspect, duration, flowProject, project = '', characterConsistency = false, requiredCharacters = [], log = console.log }) {
  return runGeneration({
    checkCredits: true,
    configurePage: page => configure(page, { model, aspect, duration }),
    thumbnailSelector: S.videoThumbnail,
    waitOpen: (page, before) => openNewVideo(page, before, prompt),
    saveOpened: page => saveOpenedVideo(page, outFile, aspect, log),
    summary: `${model}, ${aspect}, ${duration}`,
    prompt, flowProject, project, characterConsistency, requiredCharacters, log
  });
}

/**
 * Generates one image in Flow and saves it to outFile without checking credits or switching accounts.
 */
export function generateImage({ prompt, outFile, model = '', aspect = '9:16', flowProject, project = '', charProject = '', characterConsistency = false, requiredCharacters = [], log = console.log }) {
  return runGeneration({
    checkCredits: false,
    configurePage: page => configureImage(page, { model, aspect }),
    thumbnailSelector: S.imageThumbnail,
    waitOpen: (page, before) => openNewImage(page, before, prompt),
    saveOpened: page => saveOpenedImage(page, outFile, aspect, log),
    summary: `Image${model ? `, ${model}` : ''}, ${aspect}`,
    prompt, flowProject, project, charProject, characterConsistency, requiredCharacters, log
  });
}

/**
 * Generates/syncs episode cast characters in Flow and saves them to the episode's workspace.
 */
export async function generateCharactersInFlow({ flowProject, charProject, characters = [], log = console.log }) {
  if (!characters.length) return { count: 0 };
  const browser = await connect(log);
  let page;
  try {
    page = await findFlowPage(browser);
    await ensureFlowProject(page, flowProject, { log });
    await ensureDirectPromptMode(page);
    await ensureCharactersInFlow(page, { root: ROOT, project: charProject, characters, log });
    return { count: characters.length };
  } catch (err) {
    if (page) {
      const base = await diagnose(page, 'char-failure', err);
      err.message += ` Diagnostics: ${base}`;
    }
    throw err;
  } finally {
    await browser.close().catch(() => {});
  }
}

/**
 * Generates multiple Flow images in parallel by keeping up to `concurrency` (5-6) prompts
 * in flight simultaneously and saving each image as soon as its tile completes.
 */
export async function generateImageBatch({
  items = [],
  model = '',
  aspect = '16:9',
  flowProject,
  charProject = '',
  characters = [],
  concurrency = 5,
  shouldStop = () => false,
  onProgress = () => {},
  onItemSaved = () => {},
  log = console.log
}) {
  const pending = (Array.isArray(items) ? items : []).filter(it => it && it.prompt && it.outFile && !fs.existsSync(it.outFile));
  if (!pending.length) {
    return { saved: [], skipped: items.length, file: items[0]?.outFile || '' };
  }

  const maxParallel = Math.max(1, Math.min(6, Number(concurrency) || 5));
  const browser = await connect(log);
  let page;
  const saved = [];

  try {
    page = await findFlowPage(browser);
    await ensureFlowProject(page, flowProject, { log });
    await ensureDirectPromptMode(page);
    if (characters.length && charProject) {
      onProgress({ phase: 'characters', inFlight: 0, remaining: pending.length, savedCount: 0 });
      await ensureCharactersInFlow(page, { root: ROOT, project: charProject, characters, log });
    }
    await configureImage(page, { model, aspect });

    const before = await page.locator(S.imageThumbnail).evaluateAll(imgs => imgs.map(i => i.src).filter(Boolean));
    const seen = new Set(before);
    const inFlight = new Map();
    const inFlightCount = () => {
      let n = 0;
      for (const arr of inFlight.values()) n += arr.length;
      return n;
    };

    let deadline = Date.now() + 300000;

    while ((pending.length > 0 && !shouldStop()) || inFlightCount() > 0) {
      // 1. Top up Flow's active queue up to `maxParallel` simultaneous image prompts.
      while (!shouldStop() && pending.length > 0 && inFlightCount() < maxParallel) {
        const next = pending[0];
        if (Array.isArray(next.characters) && next.characters.length > 0) {
          await attachCharactersToPrompt(page, { characters: next.characters, log });
        }
        const box = page.locator(S.promptBox).first();
        await box.waitFor({ state: 'visible', timeout: 15000 });
        await box.fill(next.prompt);

        const submit = page.locator(S.submitButton).first();
        await submit.waitFor({ state: 'visible', timeout: 10000 });
        if (await submit.isDisabled()) {
          await sleep(900);
          if (await submit.isDisabled()) {
            if (inFlightCount() > 0) break;
            throw new Error('Start generation is disabled after filling the prompt. Check Flow settings.');
          }
        }

        pending.shift();
        const key = normalizePrompt(next.prompt);
        if (!inFlight.has(key)) inFlight.set(key, []);
        inFlight.get(key).push(next);

        log(`Submitting beat ${next.day} to Flow (${inFlightCount()}/${maxParallel} parallel, ${pending.length} queued)...`);
        await submit.click();
        deadline = Date.now() + 300000;
        onProgress({ phase: 'generating', inFlight: inFlightCount(), remaining: pending.length, savedCount: saved.length, lastDay: next.day });
        await sleep(750);
      }

      if (inFlightCount() === 0) break;

      // 2. Wait for the next newly finished image thumbnail, match its prompt, and save immediately.
      while (inFlightCount() > 0) {
        if (Date.now() >= deadline) {
          throw new Error(`Timed out waiting for ${inFlightCount()} in-flight Flow image(s).`);
        }
        const handle = await page.waitForFunction(({ selector, seenList }) => {
          const image = [...document.querySelectorAll(selector)].find(el =>
            el.src && !seenList.includes(el.src) && el.getClientRects().length > 0
          );
          return image ? image.src : false;
        }, { selector: S.imageThumbnail, seenList: [...seen] }, { timeout: Math.max(1000, deadline - Date.now()), polling: 1500 });

        const src = await handle.jsonValue();
        await handle.dispose();
        seen.add(src);

        const thumbnail = page.locator(S.imageThumbnail).filter({ visible: true });
        const idx = await thumbnail.evaluateAll((els, target) => els.findIndex(el => el.src === target), src).catch(() => -1);
        if (idx < 0) continue;

        const clicked = await thumbnail.nth(idx).click({ timeout: 5000 }).then(() => true, () => false);
        if (!clicked) continue;

        const promptElement = page.locator(S.videoPrompt).first();
        await promptElement.waitFor({ state: 'visible', timeout: 30000 });
        const norm = normalizePrompt(await promptElement.innerText());
        const queueForPrompt = inFlight.get(norm);

        if (queueForPrompt && queueForPrompt.length > 0) {
          const matched = queueForPrompt.shift();
          if (queueForPrompt.length === 0) inFlight.delete(norm);
          const result = await saveOpenedImage(page, matched.outFile, aspect, log);
          const entry = { ...matched, ...result };
          saved.push(entry);
          deadline = Date.now() + 300000;
          onItemSaved(entry);
          onProgress({ phase: 'generating', inFlight: inFlightCount(), remaining: pending.length, savedCount: saved.length, lastDay: matched.day });
        }

        await page.goBack({ waitUntil: 'domcontentloaded' });
        await page.locator(S.promptBox).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

        // Immediately top up the Flow queue if more items are waiting.
        if (!shouldStop() && pending.length > 0 && inFlightCount() < maxParallel) break;
      }
    }

    return { saved, file: saved[saved.length - 1]?.file || items[0]?.outFile || '' };
  } catch (err) {
    if (page) {
      const base = await diagnose(page, 'batch-failure', err);
      err.message += ` Diagnostics: ${base}`;
    }
    throw err;
  } finally {
    await browser.close().catch(() => {});
  }
}


/* ---------- Frames mode (Start frame + End frame -> video) ---------- */

async function clickConfirmIfShown(page) {
  const confirm = page.getByRole('button', { name: S.frameConfirmButton }).filter({ visible: true }).first();
  if (await confirm.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false)) {
    await confirm.click().catch(() => {});
    await page.waitForTimeout(500);
  }
}

/** Puts a local image into the Start or End tile of Flow's Frames mode. */
async function attachFrame(page, label, file, log) {
  if (!file || !fs.existsSync(file)) throw new Error(`${label} frame file is missing: ${file}`);
  const tile = page.locator(S.frameTile(label)).filter({ visible: true }).first();
  await tile.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
    throw new Error(`Flow ${label} frame tile not found. Is Frames mode selected? Update selectors.mjs (frameTile).`);
  });
  let chooser = null;
  let chooserWait = page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null);
  await tile.click();
  chooser = await chooserWait;
  if (!chooser) {
    // The tile opened a menu/dialog: click its Upload entry.
    const upload = page.locator('.cdk-overlay-container').getByText(S.frameUploadItem).filter({ visible: true }).first();
    if (await upload.waitFor({ state: 'visible', timeout: 5000 }).then(() => true, () => false)) {
      chooserWait = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
      await upload.click();
      chooser = await chooserWait;
    }
  }
  if (chooser) await chooser.setFiles(file);
  else {
    const input = page.locator('input[type="file"]').first();
    await input.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
      throw new Error(`Could not upload the ${label} frame (no file chooser). Update selectors.mjs (frameTile/frameUploadItem).`);
    });
    await input.setInputFiles(file);
  }
  await clickConfirmIfShown(page);
  await page.waitForTimeout(2500); // let Flow finish ingesting the image
  log(`${label} frame attached (${path.basename(file)}).`);
}

async function configureFrames(page, { model, aspect, duration, startFile, endFile, log }) {
  const modelButton = await openSettingsPanel(page);
  await setRadio(page, page.getByRole('radio', { name: S.videoModeRadio }), 'Video mode');
  await selectModel(page, modelButton, model);
  await setRadio(page, page.getByRole('radio', { name: S.framesRadio }), 'Frames mode');
  await setRadio(page, page.getByRole('radio', { name: S.aspectRadio(aspect) }), `aspect ${aspect}`);
  await setRadio(page, page.getByRole('radio', { name: S.durationRadio(duration) }), `duration ${duration}`);
  await setRadio(page, page.getByRole('radio', { name: S.singleRadio }), 'x1 output count');
  await page.keyboard.press('Escape').catch(() => {}); // close the settings popup so the tiles are clickable
  await page.waitForTimeout(300);
  await attachFrame(page, 'Start', startFile, log);
  await attachFrame(page, 'End', endFile, log);
}

/**
 * Generates one Flow video from a Start frame and an End frame and saves it to outFile.
 * Credits are checked like normal video jobs. Does not resubmit on its own.
 */
export function generateFrameVideo({ prompt, outFile, model, aspect, duration, startFile, endFile, flowProject, log = console.log }) {
  return runGeneration({
    checkCredits: true,
    configurePage: page => configureFrames(page, { model, aspect, duration, startFile, endFile, log }),
    thumbnailSelector: S.videoThumbnail,
    waitOpen: (page, before) => openNewVideo(page, before, prompt),
    saveOpened: page => saveOpenedVideo(page, outFile, aspect, log),
    summary: `Frames, ${model}, ${aspect}, ${duration}`,
    prompt, flowProject, log
  });
}
