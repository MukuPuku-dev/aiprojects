import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SELECTORS as S } from './selectors.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MIN_CREDITS = 15;
export const ACCOUNTS_FILE = path.join(HERE, 'flow-accounts.json');
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const SIGNED_OUT_RE = /\bsigned out\b/i;

// Local, gitignored list of Google accounts in the order to try them: {"accounts": ["a@x.com", "b@x.com"]}.
export function readAccountList() {
  if (!fs.existsSync(ACCOUNTS_FILE)) return [];
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); }
  catch { throw new Error(`flow-accounts.json is not valid JSON: ${ACCOUNTS_FILE}`); }
  const list = Array.isArray(parsed?.accounts) ? parsed.accounts : null;
  if (!list || !list.every(e => typeof e === 'string' && EMAIL.test(e.trim()))) {
    throw new Error('flow-accounts.json must look like {"accounts": ["name@example.com"]}.');
  }
  return list.map(e => e.trim().toLowerCase());
}

function saveAccountList(emails) {
  try {
    const unique = [...new Set(emails.map(e => String(e || '').trim().toLowerCase()).filter(e => EMAIL.test(e)))];
    if (!unique.length) return;
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify({ accounts: unique }, null, 2) + '\n');
  } catch {}
}

// Reads the text of Flow's account menu, e.g. "5 Google Flow credits" and "Credits refresh daily at 21:52".
export function parseAccountMenu(text) {
  const email = text.match(EMAIL)?.[0].toLowerCase() ?? null;
  const credits = text.match(/(\d[\d,]*)\s+Google Flow credits/i);
  const refresh = text.match(/Credits refresh[^\n]*?\bat\s+([^\n]+)/i);
  return {
    email,
    credits: credits ? Number(credits[1].replace(/,/g, '')) : null,
    refresh: refresh ? refresh[1].trim() : null
  };
}

/**
 * Extracts signed-in account emails from Google Account Chooser DOM entries ({ identifier, text }).
 * Skips any entry marked "Signed out" so automation never stalls on a password screen.
 */
export function parseChooserEntries(entries = []) {
  const result = [];
  const seen = new Set();
  for (const entry of entries) {
    const text = String(entry?.text || '');
    if (SIGNED_OUT_RE.test(text)) continue;
    const raw = String(entry?.identifier || '').trim() || (text.match(EMAIL)?.[0] || '');
    const email = raw.trim().toLowerCase();
    if (!email || !EMAIL.test(email) || seen.has(email)) continue;
    seen.add(email);
    result.push(email);
  }
  return result;
}

const describe = info => `${info.email ?? 'unknown account'}: ${info.credits ?? 'not shown'} credits (refresh at ${info.refresh ?? 'unknown'})`;

async function closeAccountPanel(page) {
  const close = page.locator(S.closeAccountPanel).first();
  if (!(await close.isVisible().catch(() => false))) return;
  await close.click();
  await close.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function openAccountPanel(page) {
  await closeAccountPanel(page);
  const btn = page.locator(S.accountButton).first();
  if (!(await btn.isVisible().catch(() => false))) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await page.waitForTimeout(300);
  }
  if (!(await btn.isVisible().catch(() => false))) {
    const home = page.url().match(/^https:\/\/flow\.google\.com\/(u\/\d+\/)?/)?.[0] || 'https://flow.google.com/';
    await page.goto(home, { waitUntil: 'domcontentloaded' });
  }
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click({ timeout: 15000 });
  const panel = page.locator(S.menuPanel).filter({ hasText: S.switchAccountText }).first();
  await panel.waitFor({ state: 'visible', timeout: 10000 });
  return panel;
}

async function readMenu(page) {
  const panel = await openAccountPanel(page);
  const info = parseAccountMenu(await panel.innerText());
  await closeAccountPanel(page);
  return info;
}

async function openAccountChooser(page) {
  if (S.googleAccountsUrl.test(page.url())) return;
  const panel = await openAccountPanel(page);
  const link = panel.getByText(S.switchAccountText, { exact: true }).first();
  await link.waitFor({ state: 'visible', timeout: 10000 });
  await link.evaluate(el => el.click());
  await page.waitForURL(url => S.googleAccountsUrl.test(url), { timeout: 20000 });
  // Give the chooser list a brief moment to finish rendering all signed-in accounts
  await page.locator('[data-identifier], [data-email]').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

async function discoverChooserAccounts(page) {
  const entries = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('[data-identifier], [data-email]')];
    if (nodes.length) {
      return nodes.map(el => ({
        identifier: el.getAttribute('data-identifier') || el.getAttribute('data-email') || '',
        text: (el.closest('li, [role="link"], [role="button"], div') || el).innerText || el.innerText || ''
      }));
    }
    return [...document.querySelectorAll('li, [role="link"], [role="button"]')].map(el => ({
      identifier: '',
      text: el.innerText || ''
    }));
  }).catch(() => []);
  return parseChooserEntries(entries);
}

async function pickChooserAccount(page, email) {
  const byAttr = page.locator(`[data-identifier="${email}" i], [data-email="${email}" i]`).first();
  const option = (await byAttr.isVisible().catch(() => false))
    ? byAttr
    : page.getByText(email, { exact: true }).first();
  await option.waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => { throw new Error(`Google did not list ${email} in the account chooser.`); });
  await option.click();

  await page.waitForURL(url => !S.googleAccountsUrl.test(url) && S.pageUrl.test(url), { timeout: 60000 });
  await page.locator(S.accountButton).first().waitFor({ state: 'visible', timeout: 30000 });
}

/**
 * Makes sure the active Flow account has at least MIN_CREDITS, automatically discovering and
 * switching through ALL signed-in Google accounts (plus any configured in `accounts`).
 * Throws when no account has enough credits. Returns the account that will generate the video.
 */
export async function ensureCredits(page, { accounts = [], preferredAccount = '', minCredits = MIN_CREDITS, log = console.log } = {}) {
  let active = await readMenu(page);
  log(`Flow account ${describe(active)}.`);

  const pref = String(preferredAccount || '').trim().toLowerCase();
  if (pref && EMAIL.test(pref) && active.email !== pref) {
    try {
      log(`Switching to preferred Flow account ${pref}...`);
      await openAccountChooser(page);
      await pickChooserAccount(page, pref);
      active = await readMenu(page);
      log(`Flow account ${describe(active)}.`);
    } catch (err) {
      log(`Could not switch to preferred account ${pref}: ${err.message}`);
    }
  }

  if (active.credits >= minCredits) return active;

  const checked = new Set(active.email ? [active.email] : []);
  const queue = [];
  const enqueue = list => {
    for (const raw of list) {
      const email = String(raw || '').trim().toLowerCase();
      if (email && EMAIL.test(email) && !checked.has(email) && !queue.includes(email)) {
        queue.push(email);
      }
    }
  };
  enqueue(accounts);

  const report = [active];
  let discovered = false;

  while (true) {
    if (!discovered) {
      log(`Credits below ${MIN_CREDITS}. Opening Google Account Chooser to check all signed-in accounts...`);
      await openAccountChooser(page);
      const found = await discoverChooserAccounts(page);
      discovered = true;
      if (found.length) {
        log(`Found ${found.length} signed-in Google account(s): ${found.join(', ')}.`);
        enqueue(found);
        saveAccountList([active.email, ...accounts, ...found]);
      }
    }

    const email = queue.shift();
    if (!email) break;
    checked.add(email);

    try {
      await openAccountChooser(page);
      log(`Credits below ${MIN_CREDITS}. Switching to ${email}...`);
      await pickChooserAccount(page, email);
      const info = await readMenu(page);
      log(`Flow account ${describe(info)}.`);
      report.push(info);
      if (info.email) checked.add(info.email);
      if (info.credits >= MIN_CREDITS) return info;
    } catch (err) {
      log(`Skipping ${email}: ${err.message}`);
      report.push({ email, credits: null, refresh: `error: ${err.message}` });
      // Return to Flow home if we got stranded on an error/consent page before trying the next account
      if (!S.googleAccountsUrl.test(page.url()) && !S.pageUrl.test(page.url())) {
        await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }
  }

  throw new Error(`No Flow account has at least ${MIN_CREDITS} credits. ${report.map(describe).join('; ')}.`);
}
