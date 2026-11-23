import { connect } from './flow-video.mjs';
import { readAccountList } from './flow-accounts.mjs';

const CLAUDE_NEW_URL = 'https://claude.ai/new';
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const LIMIT_RE = /you['’]?ve reached|message limit|usage limit|limit reached|out of free messages|free plan limit|resets? (?:at|in)/i;

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

async function findOrOpenClaudePage(browser) {
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => /claude\.ai/i.test(p.url()));
  if (!page) {
    page = await ctx.newPage();
  }
  await bringPageToFront(page);
  await page.goto(CLAUDE_NEW_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  return page;
}

async function readCurrentClaudeEmail(page) {
  const menuBtn = page.locator('[data-testid="user-menu-button"]').first();
  if (!(await menuBtn.isVisible().catch(() => false))) return '';
  try {
    await menuBtn.click();
    await page.waitForTimeout(450);
    const text = await page.locator('[data-radix-popper-content-wrapper], [role="menu"]').first().innerText().catch(() => '');
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
    const m = text.match(EMAIL_RE);
    return m ? m[0].toLowerCase() : '';
  } catch {
    await page.keyboard.press('Escape').catch(() => {});
    return '';
  }
}

async function isOnClaudeLogin(page) {
  if (/\/login|accounts\.google\./i.test(page.url())) return true;
  const googleBtn = page.locator('button:has-text("Continue with Google")').first();
  if (await googleBtn.isVisible().catch(() => false)) return true;
  const chatInput = page.locator('[data-testid="chat-input"]').first();
  return !(await chatInput.isVisible().catch(() => false));
}

async function checkRateLimitBanner(page) {
  return page.evaluate(reSource => {
    const re = new RegExp(reSource, 'i');
    const selectors = [
      '[data-testid="message-warning"]',
      '[role="alert"]',
      '[class*="banner"]',
      '[class*="limit"]',
      'main'
    ];
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (sel === 'main') continue;
        const txt = (el.innerText || '').trim();
        if (txt && re.test(txt)) return txt.slice(0, 200);
      }
    }
    const bodyText = (document.body?.innerText || '').slice(-1500);
    if (re.test(bodyText)) return bodyText.match(re)?.[0] || 'Claude usage limit reached';
    return '';
  }, LIMIT_RE.source).catch(() => '');
}

async function loginWithGoogle(page, targetEmail, log) {
  if (!/accounts\.google\./i.test(page.url())) {
    const googleBtn = page.locator('button:has-text("Continue with Google")').first();
    if (await googleBtn.waitFor({ state: 'visible', timeout: 12000 }).then(() => true, () => false)) {
      log(`Clicking "Continue with Google" on Claude${targetEmail ? ` for ${targetEmail}` : ''}...`);
      await googleBtn.click();
      await page.waitForTimeout(2500);
    }
  }

  // Handle Google account chooser if it appears (either same tab or popup)
  for (let i = 0; i < 20; i++) {
    if (await page.locator('[data-testid="chat-input"]').first().isVisible().catch(() => false)) {
      return true;
    }
    const allPages = page.context().pages();
    const googlePage = allPages.find(p => /accounts\.google\./i.test(p.url()));
    if (googlePage) {
      await bringPageToFront(googlePage);
      if (targetEmail) {
        const acct = googlePage.locator(`[data-identifier="${targetEmail}" i], [data-email="${targetEmail}" i], li:has-text("${targetEmail}")`).first();
        if (await acct.isVisible().catch(() => false)) {
          log(`Selecting Google account ${targetEmail}...`);
          await acct.click();
          await sleep(2500);
          continue;
        }
      } else {
        const firstAcct = googlePage.locator('[data-identifier], ul li [role="link"]').first();
        if (await firstAcct.isVisible().catch(() => false)) {
          log('Selecting first signed-in Google account for Claude...');
          await firstAcct.click();
          await sleep(2500);
          continue;
        }
      }
      // Handle "Continue" / consent button if Google asks for confirmation
      const contBtn = googlePage.locator('button:has-text("Continue"), button:has-text("Allow")').first();
      if (await contBtn.isVisible().catch(() => false)) {
        await contBtn.click().catch(() => {});
        await sleep(2000);
        continue;
      }
    }
    await sleep(1000);
  }

  if (await page.locator('[data-testid="chat-input"]').first().isVisible().catch(() => false)) {
    return true;
  }
  throw new Error('Claude requires Google sign-in or human verification. Complete it in the Chrome window, then retry.');
}

async function logoutClaude(page, log) {
  const menuBtn = page.locator('[data-testid="user-menu-button"]').first();
  await menuBtn.waitFor({ state: 'visible', timeout: 10000 });
  await menuBtn.click();
  await page.waitForTimeout(450);
  const logoutBtn = page.locator('[data-testid="user-menu-logout"], [role="menuitem"]:has-text("Log out")').first();
  await logoutBtn.waitFor({ state: 'visible', timeout: 8000 });
  log('Logging out of current Claude account to switch accounts...');
  await logoutBtn.click();
  await page.waitForTimeout(3000);
  if (!/\/login/i.test(page.url())) {
    await page.goto('https://claude.ai/login', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
}

async function extractAssistantResponse(page) {
  return page.evaluate(() => {
    const msgs = [...document.querySelectorAll('[data-testid="assistant-message"]')];
    const last = msgs[msgs.length - 1];
    if (!last) return '';

    const cleanAndNormalize = raw => {
      let s = String(raw || '').trim().replace(/^Claude responded:\s*/i, '').trim();
      if (s.includes('{') && s.includes('}') && /[\u201C\u201D]/.test(s)) {
        s = s.replace(/[\u201C\u201D]/g, '"');
      }
      return s;
    };

    // 1. Prefer a JSON code block if Claude fenced its JSON response (check both pre code and pre)
    const codeBlocks = [...last.querySelectorAll('pre code, pre')]
      .map(c => cleanAndNormalize(c.innerText || c.textContent || ''))
      .filter(Boolean);
    const jsonBlock = codeBlocks
      .filter(txt => txt.includes('{') && txt.includes('}'))
      .sort((a, b) => b.length - a.length)[0];
    if (jsonBlock) return jsonBlock;

    // 2. Check ALL markdown/response containers (skipping thinking blocks that lack JSON)
    const containers = [...last.querySelectorAll('.standard-markdown, .font-claude-response, .font-claude-message')];
    const jsonContainer = containers
      .map(el => cleanAndNormalize(el.innerText || el.textContent || ''))
      .filter(txt => txt.includes('{') && txt.includes('}'))
      .sort((a, b) => b.length - a.length)[0];
    if (jsonContainer) return jsonContainer;

    // 3. Fallback to the full visible text of the last assistant message
    const fullText = cleanAndNormalize(last.innerText || last.textContent || '');
    if (fullText) return fullText;

    return '';
  });
}

async function submitAndWaitClaudeResponse(page, prompt, log) {
  if (!/claude\.ai\/new/i.test(page.url())) {
    await page.goto(CLAUDE_NEW_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
  }

  const limitBefore = await checkRateLimitBanner(page);
  if (limitBefore) {
    const err = new Error(`Claude usage limit: ${limitBefore}`);
    err.code = 'CLAUDE_RATE_LIMIT';
    throw err;
  }

  const input = page.locator('[data-testid="chat-input"]').first();
  await input.waitFor({ state: 'visible', timeout: 20000 });
  await input.click();
  await input.fill(prompt);
  await page.waitForTimeout(400);

  const sendBtn = page.locator('button[data-testid="chat-input-send"], button[aria-label="Send message"]').first();
  await sendBtn.waitFor({ state: 'visible', timeout: 10000 });
  if (await sendBtn.isDisabled().catch(() => false)) {
    const limitNow = await checkRateLimitBanner(page);
    if (limitNow) {
      const err = new Error(`Claude usage limit: ${limitNow}`);
      err.code = 'CLAUDE_RATE_LIMIT';
      throw err;
    }
    throw new Error('Claude Send button is disabled after entering the prompt.');
  }

  const beforeMsgCount = await page.locator('[data-testid="assistant-message"]').count().catch(() => 0);
  log('Submitting episode prompt to Claude AI in Chrome...');
  await sendBtn.click();

  // Wait for assistant-message to appear and finish streaming
  const deadline = Date.now() + 240_000;
  let sawAssistant = false;
  let stableText = '';
  let stableSince = 0;

  while (Date.now() < deadline) {
    await sleep(1200);
    const limitMsg = await checkRateLimitBanner(page);
    if (limitMsg && !sawAssistant) {
      const err = new Error(`Claude usage limit: ${limitMsg}`);
      err.code = 'CLAUDE_RATE_LIMIT';
      throw err;
    }

    const status = await page.evaluate(prevCount => {
      const msgs = [...document.querySelectorAll('[data-testid="assistant-message"]')];
      if (msgs.length <= prevCount) return { ready: false, count: msgs.length, streaming: true, hasCopy: false, warn: '' };
      const last = msgs[msgs.length - 1];
      const streaming = last.getAttribute('data-is-streaming') === 'true';
      const hasCopy = Boolean(last.querySelector('button[data-testid="action-bar-copy"], button[aria-label="Copy"]'));
      const warn = last.querySelector('[data-testid="message-warning"]')?.innerText?.trim() || '';
      const stopBtn = Boolean(document.querySelector('button[aria-label*="Stop" i]'));
      return {
        ready: true,
        count: msgs.length,
        streaming: streaming || stopBtn,
        hasCopy,
        warn,
        len: (last.innerText || '').length
      };
    }, beforeMsgCount);

    if (status.ready) {
      sawAssistant = true;
      if (status.warn && /didn.?t load|try again|limit/i.test(status.warn)) {
        const err = new Error(`Claude warning: ${status.warn}`);
        err.code = 'CLAUDE_RATE_LIMIT';
        throw err;
      }
      if (!status.streaming) {
        const text = await extractAssistantResponse(page);
        if (text && (status.hasCopy || (text === stableText && Date.now() - stableSince >= 2000))) {
          log(`Claude response received (${text.length} chars).`);
          return text;
        }
        if (text !== stableText) {
          stableText = text;
          stableSince = Date.now();
        }
      }
    }
  }

  throw new Error('Timed out waiting for Claude AI response in Chrome.');
}

/**
 * Runs a prompt through claude.ai in the Flow Chrome debugger browser.
 * Automatically logs in with Google if signed out, and rotates through accounts in
 * tools/flow/flow-accounts.json if the active Claude account hits its usage limit.
 */
export async function callClaudeInBrowser({ prompt, log = console.log }) {
  if (!prompt || !String(prompt).trim()) throw new Error('prompt is required.');
  const accounts = readAccountList().map(a => a.toLowerCase());
  const triedEmails = new Set();
  const browser = await connect(log);

  try {
    const page = await findOrOpenClaudePage(browser);

    if (await isOnClaudeLogin(page)) {
      await loginWithGoogle(page, accounts[0] || '', log);
    }

    const maxAttempts = Math.max(1, accounts.length + 1);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const currentEmail = await readCurrentClaudeEmail(page);
      if (currentEmail) {
        triedEmails.add(currentEmail);
        log(`Using Claude account: ${currentEmail}`);
      }

      try {
        const text = await submitAndWaitClaudeResponse(page, prompt, log);
        return { text, account: currentEmail };
      } catch (err) {
        if (err.code !== 'CLAUDE_RATE_LIMIT') throw err;
        const nextEmail = accounts.find(e => !triedEmails.has(e));
        if (!nextEmail) {
          throw new Error(`${err.message} (no remaining accounts in flow-accounts.json to switch to).`);
        }
        log(`Claude account ${currentEmail || 'current'} hit limit. Switching to ${nextEmail}...`);
        await logoutClaude(page, log);
        await loginWithGoogle(page, nextEmail, log);
      }
    }

    throw new Error('All configured Claude accounts hit their usage limit.');
  } finally {
    await browser.close().catch(() => {});
  }
}
