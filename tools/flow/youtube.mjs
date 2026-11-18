import fs from 'node:fs';
import { connect } from './flow-video.mjs';

export const YOUTUBE_STUDIO_URL = 'https://studio.youtube.com';

const VISIBILITY_NAMES = {
  private: 'PRIVATE',
  unlisted: 'UNLISTED',
  public: 'PUBLIC'
};

/**
 * Uploads an exported episode video to YouTube Studio using the logged-in Chrome CDP profile.
 * Requires the user to be signed into YouTube Studio in that Chrome profile.
 */
export async function uploadToYouTube({
  filePath,
  title,
  description = '',
  visibility = 'unlisted',
  log = console.log
}) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Exported episode video not found. Click "Export Full Episode (.webm)" first.');
  }
  const cleanTitle = String(title || 'Ink Explainer Episode').replace(/\s+/g, ' ').trim().slice(0, 100);
  const cleanDesc = String(description || '').trim().slice(0, 5000);
  const visName = VISIBILITY_NAMES[String(visibility || 'unlisted').toLowerCase()] || 'UNLISTED';

  const browser = await connect(log);
  const context = browser.contexts()[0] || await browser.newContext();
  const page = await context.newPage();

  try {
    log('Opening YouTube Studio...');
    await page.goto(YOUTUBE_STUDIO_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2000);

    if (/accounts\.google\.com/i.test(page.url())) {
      throw new Error('Sign into YouTube Studio in the Flow Chrome window, then try again.');
    }

    const createBtn = page.locator('#create-icon, button[aria-label="Create"], ytcp-button#create-icon').first();
    await createBtn.waitFor({ state: 'visible', timeout: 30000 });
    await createBtn.click();

    const uploadItem = page.locator('#text-item-0, tp-yt-paper-item:has-text("Upload videos"), [test-id="upload"]').first();
    await uploadItem.waitFor({ state: 'visible', timeout: 15000 });
    await uploadItem.click();

    const fileInput = page.locator('input[type="file"][name="Filedata"], input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 15000 });
    log(`Uploading ${filePath} to YouTube Studio...`);
    await fileInput.setInputFiles(filePath);

    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox[id="title-textarea"] div[contenteditable="true"]').first();
    await titleBox.waitFor({ state: 'visible', timeout: 60000 });
    await titleBox.click();
    await page.keyboard.press('Control+A').catch(() => {});
    await titleBox.fill(cleanTitle);

    if (cleanDesc) {
      const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox[id="description-textarea"] div[contenteditable="true"]').first();
      if (await descBox.isVisible().catch(() => false)) {
        await descBox.click();
        await page.keyboard.press('Control+A').catch(() => {});
        await descBox.fill(cleanDesc);
      }
    }

    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible().catch(() => false)) {
      await notForKids.click();
    }

    const nextBtn = page.locator('#next-button').first();
    for (let step = 0; step < 3; step++) {
      await nextBtn.waitFor({ state: 'visible', timeout: 15000 });
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

    const visRadio = page.locator(`tp-yt-paper-radio-button[name="${visName}"]`).first();
    await visRadio.waitFor({ state: 'visible', timeout: 15000 });
    await visRadio.click();
    await page.waitForTimeout(500);

    // Wait briefly if upload is still transferring before Save/Publish becomes enabled
    const doneBtn = page.locator('#done-button').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(
      btn => btn && !btn.hasAttribute('disabled') && btn.getAttribute('aria-disabled') !== 'true',
      await doneBtn.elementHandle(),
      { timeout: 600000 }
    );
    log(`Publishing video (${visName})...`);
    await doneBtn.click();

    await page.locator('ytcp-video-share-dialog, #share-url, a[href*="youtu.be/"], a[href*="youtube.com/watch"]').first()
      .waitFor({ state: 'visible', timeout: 60000 })
      .catch(() => {});

    const videoUrl = await page.locator('a[href*="youtu.be/"], a[href*="youtube.com/watch"]').first()
      .getAttribute('href')
      .catch(() => '');

    log(`YouTube Studio upload finished${videoUrl ? `: ${videoUrl}` : ''}.`);
    return { ok: true, videoUrl: videoUrl || YOUTUBE_STUDIO_URL, visibility: visName.toLowerCase() };
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
