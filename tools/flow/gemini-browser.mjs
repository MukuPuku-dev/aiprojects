import { connect } from './flow-video.mjs';

const GEMINI_APP_URL = 'https://gemini.google.com/app';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function bringPageToFront(page) {
  try {
    const cdp = await page.context().newCDPSession(page);
    const { windowId } = await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await cdp.detach().catch(() => {});
  } catch {}
  await page.bringToFront().catch(() => {});
}

function geminiFreshUrl(currentUrl) {
  const m = String(currentUrl || '').match(/^https:\/\/gemini\.google\.com(\/u\/\d+)?/i);
  return m ? `${m[0]}/app` : GEMINI_APP_URL;
}

async function findOrOpenGeminiPage(browser) {
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => /gemini\.google\.com/i.test(p.url()));
  if (!page) {
    page = await ctx.newPage();
  }
  await bringPageToFront(page);
  const targetUrl = geminiFreshUrl(page.url());
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page;
}

async function locatePromptInput(page) {
  const selectors = [
    'rich-textarea .ql-editor[contenteditable="true"]',
    'div.ql-editor[contenteditable="true"]',
    'div[role="textbox"][contenteditable="true"]',
    'rich-textarea textarea',
    'textarea'
  ];
  for (const sel of selectors) {
    const loc = page.locator(sel).filter({ visible: true }).first();
    if (await loc.isVisible().catch(() => false)) return loc;
  }
  const combined = page.locator(selectors.join(', ')).filter({ visible: true }).first();
  await combined.waitFor({ state: 'visible', timeout: 25000 });
  return combined;
}

async function extractLatestGeminiResponse(page) {
  return page.evaluate(() => {
    const nodes = [
      ...document.querySelectorAll('model-response message-content, model-response .model-response-text, model-response .markdown, model-response')
    ];
    const last = nodes[nodes.length - 1];
    if (!last) return '';

    const codeBlocks = [...last.querySelectorAll('pre code, pre')].map(el => (el.innerText || '').trim()).filter(Boolean);
    for (let i = codeBlocks.length - 1; i >= 0; i -= 1) {
      const normalized = codeBlocks[i].replace(/[\u201C\u201D]/g, '"');
      if (normalized.includes('{') || normalized.includes('[')) {
        return normalized;
      }
    }

    const raw = (last.innerText || '').trim().replace(/[\u201C\u201D]/g, '"');
    return raw;
  });
}

async function submitAndWaitGeminiResponse(page, prompt, log) {
  if (/accounts\.google\./i.test(page.url())) {
    throw new Error('Google sign-in is required on gemini.google.com. Sign in once in the debug Chrome window, then retry.');
  }

  const input = await locatePromptInput(page);
  await input.click();
  await page.waitForTimeout(250);

  // Use fill first; fall back to clipboard/insertText for Quill rich-textarea editors
  const filled = await input.fill(prompt).then(() => true, () => false);
  if (!filled) {
    await page.keyboard.press('Control+A').catch(() => {});
    await page.keyboard.press('Backspace').catch(() => {});
    await page.keyboard.insertText(prompt);
  }
  await page.waitForTimeout(450);

  const beforeCount = await page.locator('model-response').count().catch(() => 0);
  log('Submitting prompt to Gemini in local debug Chrome...');

  const sendBtn = page.locator(
    'button.send-button, button[aria-label="Send message"], button[aria-label*="Send" i][mat-icon-button], button[aria-label*="Submit" i]'
  ).filter({ visible: true }).first();

  if (await sendBtn.isVisible().catch(() => false)) {
    await sendBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }

  const deadline = Date.now() + 240_000;
  let stableText = '';
  let stableSince = 0;

  while (Date.now() < deadline) {
    await sleep(1200);

    const state = await page.evaluate(prevCount => {
      const responses = [...document.querySelectorAll('model-response')];
      if (responses.length <= prevCount) {
        return { ready: false, streaming: true, hasActions: false };
      }
      const last = responses[responses.length - 1];
      const stopBtn = Boolean(
        document.querySelector('button[aria-label*="Stop" i], button.stop-button, mat-icon[fonticon="stop"]')
      );
      const spinner = Boolean(last.querySelector('mat-progress-spinner, .thinking-indicator, .loading-indicator'));
      const hasActions = Boolean(
        last.querySelector('button[aria-label*="Copy" i], button[data-test-id="copy-button"], message-actions')
      );
      return {
        ready: true,
        streaming: stopBtn || spinner,
        hasActions
      };
    }, beforeCount);

    if (state.ready && !state.streaming) {
      const text = await extractLatestGeminiResponse(page);
      if (text && text.length >= 20) {
        if (text === stableText && Date.now() - stableSince >= 2200) {
          log(`Gemini (browser) response received (${text.length} chars).`);
          return text;
        }
        if (text !== stableText) {
          stableText = text;
          stableSince = Date.now();
        }
      }
    }
  }

  throw new Error('Timed out waiting for Gemini response in local debug Chrome.');
}

/**
 * Runs a prompt through gemini.google.com in the Flow debug Chrome browser.
 */
export async function callGeminiInBrowser({ prompt, log = console.log }) {
  if (!prompt || !String(prompt).trim()) throw new Error('prompt is required.');
  const browser = await connect(log);
  try {
    const page = await findOrOpenGeminiPage(browser);
    const text = await submitAndWaitGeminiResponse(page, prompt, log);
    return { text, account: 'gemini.google.com' };
  } finally {
    await browser.close().catch(() => {});
  }
}
