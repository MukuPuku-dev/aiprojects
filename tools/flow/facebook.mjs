import { connect } from './flow-video.mjs';
import { buildGeminiCaption, createSocialPostService } from './social-service.mjs';

export const FACEBOOK_CREATE_URL = 'https://www.facebook.com/post/create';

export function createFacebookService(root, { generateCaption = captionFromGemini, upload = uploadToFacebook } = {}) {
  return createSocialPostService({
    root,
    platform: 'Facebook',
    recordFileName: 'facebook-posts.json',
    generateCaption,
    upload
  });
}

export async function captionFromGemini(context, project) {
  return buildGeminiCaption(context, project, 'Facebook');
}

/** Confirms that Facebook accepted the post or raises a descriptive error if submission failed. */
export async function confirmFacebookPost(page, caption = '', timeout = 60000) {
  const snippet = caption.replace(/\s+/g, ' ').trim().slice(0, 60);
  const startedAt = Date.now();
  const handle = await page.waitForFunction(({ snippet, startedAt }) => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    if (/couldn't upload|upload failed|something went wrong\. please try again|unable to post/i.test(text)) {
      return 'error';
    }
    if (/your post is being processed|post shared|your post has been shared|published|your reel is being processed|video is being processed|uploading your video|posting\.\.\./i.test(text)) {
      return 'submitted';
    }
    const path = location.pathname;
    if (path !== '/post/create' && !path.startsWith('/login') && !path.startsWith('/checkpoint')) {
      return 'submitted';
    }
    if (snippet && text.includes(snippet)) {
      const submitBtn = document.querySelector('[aria-label="Post"], [aria-label="Publish"]');
      if (!submitBtn && Date.now() - startedAt > 1500) return 'submitted';
    }
    return false;
  }, { snippet, startedAt }, { timeout });

  const state = await handle.jsonValue();
  await handle.dispose();
  if (state === 'error') {
    throw new Error('Facebook reported an error while submitting the post.');
  }
  if (state !== 'submitted') {
    throw new Error('Facebook did not confirm the post submission.');
  }
}

async function ensureFacebookComposer(page) {
  const dialog = page.locator('div[role="dialog"] [contenteditable="true"][role="textbox"], div[aria-label="Create post"]').first();
  if (await dialog.isVisible().catch(() => false)) return;

  const openTrigger = page.locator([
    'div[role="button"]:has-text("What\'s on your mind")',
    'div[role="button"]:has-text("Create post")',
    '[aria-label*="Create a post" i]',
    '[aria-label*="What\'s on your mind" i]'
  ].join(', ')).first();

  if (await openTrigger.isVisible().catch(() => false)) {
    await openTrigger.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
}

async function attachMediaToFacebook(page, file) {
  await ensureFacebookComposer(page);
  const fileSelector = '[role="dialog"] input[type="file"], div[aria-label="Create post"] input[type="file"], [role="main"] input[type="file"], input[type="file"][accept*="image"], input[type="file"][accept*="video"], input[type="file"]';
  const input = page.locator(fileSelector).first();
  try {
    await input.waitFor({ state: 'attached', timeout: 5000 });
    await input.setInputFiles(file);
    return;
  } catch {
    // Some Facebook accounts only mount the media <input type="file"> after clicking "Photo/video".
  }

  const trigger = page.locator([
    '[role="dialog"] [aria-label*="Photo/video" i]',
    '[role="dialog"] [aria-label*="Photo" i]',
    '[role="dialog"] [aria-label*="Add Photos/Videos" i]',
    '[aria-label*="Photo/video" i]',
    '[aria-label*="Add photo" i]',
    '[aria-label*="Add video" i]',
    '[role="button"]:has-text("Photo/video")',
    '[role="button"]:has-text("Add photos/videos")'
  ].join(', ')).first();
  if (await trigger.isVisible().catch(() => false)) {
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null);
    await trigger.click().catch(() => {});
    const chooser = await chooserPromise;
    if (chooser) {
      await chooser.setFiles(file);
      return;
    }
  }

  try {
    await input.waitFor({ state: 'attached', timeout: 15000 });
    await input.setInputFiles(file);
  } catch {
    throw new Error('Facebook post composer did not appear at https://www.facebook.com/post/create. Sign in to Facebook in the Flow Chrome window and retry.');
  }
}

async function enterFacebookCaption(page, caption) {
  const editor = page.locator([
    '[role="dialog"] [contenteditable="true"][role="textbox"]',
    '[role="dialog"] [contenteditable="true"]',
    'div[contenteditable="true"][data-lexical-editor="true"]',
    '[role="main"] [contenteditable="true"][role="textbox"]',
    '[contenteditable="true"][role="textbox"]',
    '[aria-placeholder*="mind" i]',
    '[aria-label*="Write something" i]'
  ].join(', ')).first();
  await editor.waitFor({ state: 'visible', timeout: 30000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(caption);
  const entered = (await editor.innerText()).replace(/\s+/g, ' ').trim();
  const expectedPrefix = caption.replace(/\s+/g, ' ').trim().slice(0, 30);
  if (expectedPrefix && !entered.includes(expectedPrefix)) {
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(caption);
  }
  // Dismiss hashtag/mention autocomplete popups (e.g. #FirstLove dropdown) that can cover the Post button.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
  if (await page.locator('[role="listbox"]').first().isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.locator('body').click({ position: { x: 10, y: 10 }, force: true }).catch(() => {});
  }
}

/** Ensures Facebook's "Add AI label" toggle is turned on when present in the composer. */
export async function enableFacebookAiLabel(page) {
  const toggleAiLabel = () => page.evaluate(() => {
    const isChecked = el => el.getAttribute('aria-checked') === 'true' || el.checked === true;
    const findRowToggle = () => {
      const direct = document.querySelector('[role="switch"][aria-label*="AI label" i], input[type="checkbox"][aria-label*="AI label" i]');
      if (direct) return direct;

      const labelEl = [...document.querySelectorAll('span, div, label, p')]
        .filter(el => el.children.length === 0 && /^add ai label$/i.test((el.textContent || '').trim()))
        .pop();
      if (!labelEl) return null;

      labelEl.scrollIntoView({ block: 'center', inline: 'nearest' });
      let container = labelEl.parentElement;
      for (let depth = 0; depth < 6 && container && container !== document.body; depth++) {
        const controls = container.querySelectorAll('[role="switch"], input[type="checkbox"]');
        if (controls.length === 1) return controls[0];
        if (controls.length > 1) break;
        container = container.parentElement;
      }
      return null;
    };

    const toggle = findRowToggle();
    if (!toggle) return 'not-found';
    toggle.scrollIntoView({ block: 'center', inline: 'nearest' });
    if (isChecked(toggle)) return 'already-on';
    toggle.click();
    return isChecked(toggle) ? 'turned-on' : 'clicked';
  }).catch(() => 'not-found');

  const first = await toggleAiLabel();
  if (first === 'clicked') {
    await page.waitForTimeout(250);
    await toggleAiLabel();
  }
}

async function submitFacebookPost(page, beforePost) {
  const isButtonEnabled = locator => locator.evaluate(el => {
    const disabledAttr = el.getAttribute('aria-disabled');
    return !el.disabled && disabledAttr !== 'true';
  }).catch(() => false);

  const postSelector = [
    '[aria-label="Post"]',
    '[aria-label="Publish"]',
    '[aria-label="Share now"]',
    '[role="dialog"] [role="button"]:text-is("Post")',
    '[role="dialog"] [role="button"]:text-is("Publish")',
    '[role="dialog"] button:text-is("Post")',
    '[role="dialog"] button:text-is("Publish")',
    '[role="main"] [role="button"]:text-is("Post")',
    '[role="main"] [role="button"]:text-is("Publish")',
    'button:text-is("Post")',
    'button:text-is("Publish")'
  ].join(', ');
  const nextSelector = [
    '[aria-label="Next"]',
    '[role="dialog"] [role="button"]:text-is("Next")',
    '[role="main"] [role="button"]:text-is("Next")',
    'button:text-is("Next")'
  ].join(', ');

  const deadline = Date.now() + 180000;
  let clickedNext = 0;

  while (Date.now() < deadline) {
    const postBtn = page.locator(postSelector).first();

    if (await postBtn.isVisible().catch(() => false) && await isButtonEnabled(postBtn)) {
      if (await page.locator('[role="listbox"]').first().isVisible().catch(() => false)) {
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(200);
      }
      await enableFacebookAiLabel(page);
      await postBtn.scrollIntoViewIfNeeded().catch(() => {});
      beforePost();
      await postBtn.click({ timeout: 15000 });
      return;
    }

    if (clickedNext < 3) {
      const nextBtn = page.locator(nextSelector).first();
      if (await nextBtn.isVisible().catch(() => false) && await isButtonEnabled(nextBtn)) {
        await nextBtn.click();
        clickedNext++;
        await page.waitForTimeout(800);
        continue;
      }
    }

    await page.waitForTimeout(1000);
  }
  throw new Error('Timed out waiting for Facebook Post button to become ready.');
}

export async function uploadToFacebook({ file, caption, beforePost }) {
  const browser = await connect(console.log);
  let page;
  try {
    const context = browser.contexts()[0];
    if (!context) throw new Error('Chrome has no browser profile.');
    page = await context.newPage();
    await page.goto(FACEBOOK_CREATE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const bodyText = await page.locator('body').innerText().catch(() => '');
    if (/log in to facebook|create new account/i.test(bodyText) && page.url().includes('/login')) {
      throw new Error('Not signed in to Facebook. Sign in at https://www.facebook.com in the Flow Chrome window and retry.');
    }

    await attachMediaToFacebook(page, file);
    await enterFacebookCaption(page, caption);
    await submitFacebookPost(page, beforePost);
    await confirmFacebookPost(page, caption);
  } catch (error) {
    throw new Error(`Facebook browser: ${error.message}`);
  } finally {
    await browser.close().catch(error => console.error(`Could not disconnect Chrome: ${error.message}`));
  }
}
