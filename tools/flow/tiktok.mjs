import { connect } from './flow-video.mjs';
import { buildGeminiCaption, createSocialPostService } from './social-service.mjs';

const UPLOAD_URL = 'https://www.tiktok.com/creator-center/upload?from=upload';
const PHOTO_UPLOAD_URL = 'https://www.tiktok.com/tiktokstudio/upload?from=upload&tab=photo';

export function createTikTokService(root, { generateCaption = captionFromGemini, upload = uploadToTikTok } = {}) {
  return createSocialPostService({
    root,
    platform: 'TikTok',
    recordFileName: 'tiktok-posts.json',
    generateCaption,
    upload
  });
}

export async function captionFromGemini(context, project) {
  return buildGeminiCaption(context, project, 'TikTok');
}

export async function confirmTikTokPost(page, caption) {
  const waitForResult = allowConfirmation => page.waitForFunction(({ expected, allowConfirmation }) => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    const normalized = expected.replace(/\s+/g, ' ');
    if (allowConfirmation && /continue to post\?/i.test(text) && [...document.querySelectorAll('button')].some(button => button.innerText.trim() === 'Post now')) return 'confirmation';
    if (/your (?:video|photo|post) (?:has been|was) (?:uploaded|posted)|(?:video|photo) (?:has been|was) (?:uploaded|posted)|post (?:published|uploaded) successfully/i.test(text)) return 'submitted';
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

/** Clicks "Add sound", picks the first "For You" track, and ensures the sound picker is closed. */
export async function selectFirstTikTokSound(page) {
  const addSound = page.getByRole('button', { name: 'Add sound' }).first();
  await addSound.waitFor({ state: 'visible', timeout: 60000 });
  await addSound.click();
  const useButton = page.getByRole('button', { name: 'Use', exact: true }).first();
  await useButton.waitFor({ state: 'visible', timeout: 60000 });
  await useButton.click();
  await page.getByRole('button', { name: 'Replace', exact: true }).first().waitFor({ state: 'visible', timeout: 30000 });
  if (await useButton.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {});
  }
}

export async function uploadToTikTok({ file, caption, beforePost }) {
  const browser = await connect(console.log);
  let page;
  try {
    const context = browser.contexts()[0];
    if (!context) throw new Error('Chrome has no browser profile.');
    page = await context.newPage();
    const isImage = /\.(png|jpe?g)$/i.test(file);
    await page.goto(isImage ? PHOTO_UPLOAD_URL : UPLOAD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const input = page.locator(isImage ? 'input[type="file"][accept*="image"], input[type="file"]' : 'input[type="file"][accept*="video"], input[type="file"]').first();
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
    if (isImage) await selectFirstTikTokSound(page);
    const now = page.locator('input[name="postSchedule"][value="post_now"]');
    if (!(await now.isChecked())) throw new Error('TikTok is not set to post now. Check its scheduling settings.');
    const post = isImage
      ? page.getByRole('button', { name: 'Post', exact: true }).first()
      : page.locator('[data-e2e="post_video_button"]');
    await post.waitFor({ state: 'visible', timeout: 180000 });
    await page.waitForFunction(isPhoto => {
      const button = isPhoto
        ? [...document.querySelectorAll('button')].find(b => b.innerText.trim() === 'Post')
        : document.querySelector('[data-e2e="post_video_button"]');
      return button && !button.disabled && button.getAttribute('aria-disabled') !== 'true' && button.getAttribute('data-disabled') !== 'true' && button.getAttribute('data-loading') !== 'true';
    }, isImage, { timeout: 180000 });
    beforePost();
    await post.click();
    await confirmTikTokPost(page, caption);
  } catch (error) {
    throw new Error(`TikTok browser: ${error.message}`);
  } finally {
    await browser.close().catch(error => console.error(`Could not disconnect Chrome: ${error.message}`));
  }
}
