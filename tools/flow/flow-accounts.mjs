import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SELECTORS as S } from './selectors.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MIN_CREDITS = 15;
export const ACCOUNTS_FILE = path.join(HERE, 'flow-accounts.json');
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

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

const describe = info => `${info.email ?? 'unknown account'}: ${info.credits ?? 'not shown'} credits (refresh at ${info.refresh ?? 'unknown'})`;

async function closeAccountPanel(page) {
  const close = page.locator(S.closeAccountPanel).first();
  if (!(await close.isVisible().catch(() => false))) return;
  await close.click();
  await close.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function openAccountPanel(page) {
  await closeAccountPanel(page);
  await page.locator(S.accountButton).first().click({ timeout: 15000 });
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

async function switchAccount(page, email) {
  const panel = await openAccountPanel(page);
  await panel.getByText(S.switchAccountText, { exact: true }).click({ timeout: 10000 });
  await page.waitForURL(url => S.googleAccountsUrl.test(url), { timeout: 20000 });

  const option = page.getByText(email, { exact: true }).first();
  await option.waitFor({ state: 'visible', timeout: 15000 })
    .catch(() => { throw new Error(`Google did not list ${email} in the account chooser.`); });
  await option.click();

  await page.waitForURL(url => !S.googleAccountsUrl.test(url) && S.pageUrl.test(url), { timeout: 60000 });
  await page.locator(S.accountButton).first().waitFor({ state: 'visible', timeout: 30000 });
}

/**
 * Makes sure the active Flow account has at least MIN_CREDITS, switching through `accounts` in order if needed.
 * Throws when no account has enough credits. Returns the account that will generate the video.
 */
export async function ensureCredits(page, { accounts = [], log = console.log } = {}) {
  const active = await readMenu(page);
  log(`Flow account ${describe(active)}.`);
  if (active.credits >= MIN_CREDITS) return active;

  const report = [active];
  for (const email of accounts.filter(e => e !== active.email)) {
    log(`Credits below ${MIN_CREDITS}. Switching to ${email}...`);
    await switchAccount(page, email);
    const info = await readMenu(page);
    if (info.email !== email) throw new Error(`Switched to ${info.email ?? 'an unknown account'} instead of ${email}.`);
    log(`Flow account ${describe(info)}.`);
    report.push(info);
    if (info.credits >= MIN_CREDITS) return info;
  }

  throw new Error(`No Flow account has at least ${MIN_CREDITS} credits. ${report.map(describe).join('; ')}.`);
}
