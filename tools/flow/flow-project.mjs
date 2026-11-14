import { SELECTORS as S } from './selectors.mjs';

const HOME_URL = 'https://flow.google.com/';

// Keeps the account prefix (e.g. /u/1/) so the home page stays on the active Google account.
function homeUrl(current) {
  return current.match(/^https:\/\/flow\.google\.com\/(u\/\d+\/)?/)?.[0] ?? HOME_URL;
}

async function headingMatches(page, name) {
  return page.evaluate(n => document.querySelector('.header-title-heading')?.textContent.trim() === n, name).catch(() => false);
}

async function findProjectLink(page, name) {
  const cards = page.locator(S.projectCard);
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const title = (await cards.nth(i).locator(S.projectTitle).first().textContent()).trim();
    if (title === name) return cards.nth(i).locator(S.projectLink).first();
  }
  return null;
}

async function createProject(page, name) {
  await page.getByRole('button', { name: S.newProjectButton }).first().click();
  await page.waitForURL(/\/project\//, { timeout: 30000 });
  const input = page.locator(S.projectTitleInput).first();
  await input.waitFor({ state: 'visible', timeout: 15000 });
  await input.fill(name);
  await input.press('Enter');
}

/**
 * Makes sure the active Flow account is on a project named `name`.
 * Opens the existing project with that name, or creates one and renames it.
 */
export async function ensureFlowProject(page, name, { log = console.log } = {}) {
  if (await headingMatches(page, name)) return;

  await page.goto(homeUrl(page.url()), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: S.newProjectButton }).first().waitFor({ state: 'visible', timeout: 30000 });
  await page.locator(S.projectCard).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

  const link = await findProjectLink(page, name);
  if (link) {
    log(`Opening Flow project "${name}".`);
    await link.click();
  } else {
    log(`Creating Flow project "${name}".`);
    await createProject(page, name);
  }

  await page.waitForFunction(n => document.querySelector('.header-title-heading')?.textContent.trim() === n, name, { timeout: 30000 })
    .catch(() => { throw new Error(`Flow did not open the project "${name}".`); });
}
