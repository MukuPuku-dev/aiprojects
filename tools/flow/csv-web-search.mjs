import fs from 'node:fs';
import path from 'node:path';
import { connect } from './flow-video.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function findOrOpenSearchTab(browser) {
  const contexts = browser.contexts();
  const context = contexts[0] || await browser.newContext();
  const pages = context.pages();
  let page = pages.find(p => /google\.[^/]+\/search\?.*tbm=isch/i.test(p.url()));
  if (!page) {
    page = await context.newPage();
  }
  await page.bringToFront().catch(() => {});
  return page;
}

async function downloadImageUrl(page, imgUrl) {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('data:image/')) {
    const match = imgUrl.match(/^data:image\/[a-z0-9+.-]+;base64,(.+)$/i);
    if (!match) return null;
    const buf = Buffer.from(match[1], 'base64');
    return buf.length >= 2048 ? buf : null;
  }
  if (!/^https?:\/\//i.test(imgUrl)) return null;
  try {
    const res = await page.context().request.get(imgUrl, {
      timeout: 15000,
      headers: { Referer: 'https://www.google.com/' }
    });
    if (!res.ok()) return null;
    const ct = (res.headers()['content-type'] || '').toLowerCase();
    if (ct && !ct.startsWith('image/')) return null;
    const buf = await res.body();
    return buf.length >= 3072 ? buf : null;
  } catch {
    return null;
  }
}

async function searchOneOnPage(page, { query, outFile, log }) {
  const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  log(`Searching Google Images for: "${query}"`);
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.bringToFront().catch(() => {});
  await sleep(1200);

  const currentUrl = page.url();
  if (/google\.[^/]+\/sorry/i.test(currentUrl)) {
    throw new Error('Google is showing a CAPTCHA / verification check in Chrome. Please complete it in the browser window and retry.');
  }

  // Wait for image thumbnails to appear
  await page.waitForSelector('img', { timeout: 15000 });

  // Collect candidate thumbnail indices (skip tiny icons / Google logos)
  const thumbCount = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('#search img, #rso img, div[data-q] img')];
    return imgs.filter(img => {
      const r = img.getBoundingClientRect();
      return r.width >= 70 && r.height >= 70 && img.src && !img.src.includes('gstatic.com/images/branding');
    }).length;
  });

  if (thumbCount === 0) {
    throw new Error(`No image results found on Google Images for "${query}".`);
  }

  const maxTries = Math.min(8, thumbCount);
  for (let i = 0; i < maxTries; i++) {
    const clickedSrc = await page.evaluate(idx => {
      const imgs = [...document.querySelectorAll('#search img, #rso img, div[data-q] img')].filter(img => {
        const r = img.getBoundingClientRect();
        return r.width >= 70 && r.height >= 70 && img.src && !img.src.includes('gstatic.com/images/branding');
      });
      const target = imgs[idx];
      if (!target) return null;
      target.scrollIntoView({ block: 'center' });
      target.click();
      return target.src;
    }, i);

    await sleep(1100);

    // Try to grab the high-res image from Google Images side preview panel
    const previewUrls = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('img.sFlh5c, img.iPVvYb, img.n3VNCb, a[jsname="sTFXNd"] img, [role="dialog"] img')
      ];
      return candidates
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.width >= 120 && r.height >= 90 && el.src;
        })
        .map(el => el.src);
    });

    // Prefer non-encrypted-tbn URLs first, then fall back to preview/thumbnail URLs
    const orderedUrls = [
      ...previewUrls.filter(u => /^https?:\/\//i.test(u) && !u.includes('encrypted-tbn')),
      ...previewUrls.filter(u => /^https?:\/\//i.test(u)),
      clickedSrc
    ].filter(Boolean);

    for (const candidateUrl of orderedUrls) {
      const bytes = await downloadImageUrl(page, candidateUrl);
      if (bytes) {
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, bytes);
        log(`Saved ${path.basename(outFile)} (${Math.round(bytes.length / 1024)} KB)`);
        return { file: outFile, bytes: bytes.length, sourceUrl: candidateUrl };
      }
    }
  }

  throw new Error(`Could not download a usable image from Google Images for "${query}".`);
}

export async function searchAndSaveImageInBrowser({ query, outFile, log = console.log }) {
  const browser = await connect(log);
  const page = await findOrOpenSearchTab(browser);
  return searchOneOnPage(page, { query, outFile, log });
}

export async function searchAndSaveImageBatchInBrowser({
  items = [],
  shouldStop = () => false,
  onProgress = () => {},
  onItemSaved = () => {},
  log = console.log
}) {
  const pending = (Array.isArray(items) ? items : []).filter(it => it && it.query && it.outFile && !fs.existsSync(it.outFile));
  if (!pending.length) {
    return { saved: [], skipped: items.length, file: items[0]?.outFile || '' };
  }

  const browser = await connect(log);
  const page = await findOrOpenSearchTab(browser);
  const saved = [];

  for (let i = 0; i < pending.length; i++) {
    if (shouldStop()) break;
    const item = pending[i];
    onProgress({
      phase: 'searching',
      inFlight: 1,
      remaining: pending.length - i,
      savedCount: saved.length,
      lastQuery: item.query
    });
    try {
      const result = await searchOneOnPage(page, { query: item.query, outFile: item.outFile, log });
      const entry = { ...item, ...result };
      saved.push(entry);
      onItemSaved(entry);
    } catch (err) {
      log(`Skipped ${item.filename}: ${err.message}`);
      if (/CAPTCHA|verification/i.test(err.message)) {
        throw err;
      }
    }
    onProgress({
      phase: 'searching',
      inFlight: 0,
      remaining: pending.length - (i + 1),
      savedCount: saved.length
    });
  }

  return { saved, file: saved[saved.length - 1]?.file || pending[0]?.outFile || '' };
}
