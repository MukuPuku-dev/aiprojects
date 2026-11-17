import fs from 'node:fs';
import path from 'node:path';
import { SELECTORS as S } from './selectors.mjs';

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];
const DEFAULT_DB_URL = process.env.STUDIO_DB_URL || 'https://database-mukeshpokharel.aws-ap-south-1.turso.io';
const DEFAULT_DB_TOKEN = process.env.STUDIO_DB_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMwNzQyNTgsImlkIjoiMDFhMTdiOGQtNjgwMS03M2JjLTk4NmQtYjc1ZmQ2ZThlMjY0Iiwia2lkIjoiU3Vsa0Q4bWRVX1FSdkFLaFVubDEwM3Z0YUtGNldfT3lJdXdxU3RMeXFlayIsInJpZCI6IjAxMGZmMzYyLWNhZDAtNGFmNC1iMGViLWJjN2QzNmNmNjBjZCJ9._GaxGeLpcmAj006y_16nh-AvjNBsJbD5vZ0PvjmAMLimBBQopepFDi4Y4jW4H0aVN1ouPz7Ab1ksYoClDj6cCA';

export function cloudCharacterAssetKey(project, code) {
  const cleanCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
  return `${project}:char-${cleanCode}`;
}

export function bufferToDataUrl(buffer, ext = '.png') {
  const cleanExt = String(ext || '.png').toLowerCase();
  const mime = cleanExt === '.jpg' || cleanExt === '.jpeg'
    ? 'image/jpeg'
    : cleanExt === '.webp'
      ? 'image/webp'
      : 'image/png';
  return `data:${mime};base64,${Buffer.from(buffer).toString('base64')}`;
}

export function dataUrlToBuffer(dataUrl) {
  const match = /^data:image\/([a-z0-9+.-]+);base64,(.+)$/i.exec(String(dataUrl || '').trim());
  if (!match) return null;
  const subtype = match[1].toLowerCase();
  const ext = subtype === 'jpeg' || subtype === 'jpg' ? '.jpg' : subtype === 'webp' ? '.webp' : '.png';
  return { buffer: Buffer.from(match[2], 'base64'), ext };
}

export async function executeTursoSql(statement, args = [], { url = DEFAULT_DB_URL, token = DEFAULT_DB_TOKEN, fetchImpl = fetch } = {}) {
  const res = await fetchImpl(`${url}/v2/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: statement,
            args: args.map(v =>
              v === null || v === undefined
                ? { type: 'null' }
                : { type: typeof v === 'number' ? 'integer' : 'text', value: String(v) }
            )
          }
        },
        { type: 'close' }
      ]
    })
  });
  if (!res.ok) throw new Error(`Turso HTTP ${res.status}`);
  const payload = await res.json();
  const first = payload?.results?.[0];
  if (!first) throw new Error('Empty Turso response');
  if (first.type === 'error') throw new Error(first.error?.message || 'Turso SQL error');
  return (first.response?.result?.rows || []).map(row => row.map(col => col.value));
}

export async function pushCharacterToCloudDb(project, { code, name, refPrompt = '', imageBuffer, ext = '.png' }, dbOpts = {}) {
  if (!imageBuffer || !imageBuffer.length) return false;
  const cleanCode = String(code || name || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
  const assetKey = cloudCharacterAssetKey(project, cleanCode);
  const dataUrl = bufferToDataUrl(imageBuffer, ext);
  await executeTursoSql('CREATE TABLE IF NOT EXISTS assets(key TEXT PRIMARY KEY,data TEXT)', [], dbOpts);
  await executeTursoSql(
    'INSERT INTO assets(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data',
    [assetKey, dataUrl],
    dbOpts
  );
  await executeTursoSql(
    "CREATE TABLE IF NOT EXISTS characters(id TEXT PRIMARY KEY, project_id TEXT NOT NULL, project_name TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, role TEXT DEFAULT '', appearance TEXT NOT NULL, ref_prompt TEXT NOT NULL, image_key TEXT DEFAULT '', updated_at INTEGER NOT NULL DEFAULT 0)",
    [],
    dbOpts
  );
  const charId = `${project}:${cleanCode}`;
  const cleanName = String(name || cleanCode).trim();
  const cleanPrompt = String(refPrompt || cleanName).trim();
  await executeTursoSql(
    "INSERT INTO characters(id,project_id,project_name,code,name,role,appearance,ref_prompt,image_key,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,ref_prompt=CASE WHEN excluded.ref_prompt != '' THEN excluded.ref_prompt ELSE characters.ref_prompt END,image_key=excluded.image_key,updated_at=excluded.updated_at",
    [charId, project, project, cleanCode, cleanName, '', cleanPrompt, cleanPrompt, `char-${cleanCode}`, Date.now()],
    dbOpts
  );
  return true;
}

export async function pullCharacterFromCloudDb(root, project, { code, name, refPrompt = '' }, dbOpts = {}) {
  const cleanCode = String(code || name || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
  const assetKey = cloudCharacterAssetKey(project, cleanCode);
  const rows = await executeTursoSql('SELECT data FROM assets WHERE key = ?', [assetKey], dbOpts);
  const dataUrl = rows?.[0]?.[0];
  if (!dataUrl) return null;
  const parsed = dataUrlToBuffer(dataUrl);
  if (!parsed || !parsed.buffer.length) return null;
  return saveWorkspaceCharacter(root, project, {
    code: cleanCode,
    name: name || cleanCode,
    refPrompt,
    imageBuffer: parsed.buffer,
    ext: parsed.ext
  });
}

export async function syncWorkspaceCharacterWithCloud(root, project, char, { log = console.log, dbOpts = {} } = {}) {
  const cleanCode = String(char.code || char.name || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
  let imageFile = (char.imageFile && fs.existsSync(char.imageFile))
    ? char.imageFile
    : findWorkspaceCharacterFile(root, project, cleanCode);

  try {
    const assetKey = cloudCharacterAssetKey(project, cleanCode);
    const rows = await executeTursoSql('SELECT length(data) FROM assets WHERE key = ?', [assetKey], dbOpts);
    const hasCloud = Number(rows?.[0]?.[0]) > 0;

    if (imageFile && !hasCloud) {
      const imageBuffer = fs.readFileSync(imageFile);
      const ext = path.extname(imageFile) || '.png';
      await pushCharacterToCloudDb(project, { code: cleanCode, name: char.name, refPrompt: char.refPrompt, imageBuffer, ext }, dbOpts);
      log(`Synced workspace character "${char.name}" to online database (${assetKey}).`);
    } else if (!imageFile && hasCloud) {
      const pulled = await pullCharacterFromCloudDb(root, project, char, dbOpts);
      if (pulled?.imageFile) {
        imageFile = pulled.imageFile;
        log(`Pulled character "${char.name}" from online database to workspace (${imageFile}).`);
      }
    }
  } catch (err) {
    log(`Cloud character check skipped for "${char.name}": ${err.message}`);
  }

  return { ...char, code: cleanCode, imageFile };
}

export function characterDir(root, project) {
  return path.join(root, 'projects', project, 'characters');
}

export function findWorkspaceCharacterFile(root, project, code) {
  const dir = characterDir(root, project);
  if (!fs.existsSync(dir)) return null;
  const clean = String(code || '').trim();
  if (!clean) return null;
  for (const stem of [clean, clean.toUpperCase(), clean.toLowerCase()]) {
    for (const ext of IMAGE_EXTS) {
      const candidate = path.join(dir, `${stem}${ext}`);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

export function loadWorkspaceCharacters(root, project) {
  const dir = characterDir(root, project);
  const metaPath = path.join(dir, 'characters.json');
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) || {}; } catch {}
  }
  const out = {};
  for (const [code, entry] of Object.entries(meta)) {
    out[code] = { ...entry, code, imageFile: findWorkspaceCharacterFile(root, project, code) };
  }
  return out;
}

export function saveWorkspaceCharacter(root, project, { code, name, refPrompt = '', imageBuffer = null, ext = '.png' }) {
  const cleanCode = String(code || name || '').trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
  if (!cleanCode) throw new Error('Character code is required.');
  const dir = characterDir(root, project);
  fs.mkdirSync(dir, { recursive: true });

  let imageFile = findWorkspaceCharacterFile(root, project, cleanCode);
  if (imageBuffer && imageBuffer.length) {
    const safeExt = IMAGE_EXTS.includes(ext.toLowerCase()) ? ext.toLowerCase() : '.png';
    imageFile = path.join(dir, `${cleanCode}${safeExt}`);
    const tmp = `${imageFile}.tmp`;
    fs.writeFileSync(tmp, imageBuffer);
    fs.renameSync(tmp, imageFile);
  }

  const metaPath = path.join(dir, 'characters.json');
  let meta = {};
  if (fs.existsSync(metaPath)) {
    try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) || {}; } catch {}
  }
  meta[cleanCode] = {
    code: cleanCode,
    name: String(name || cleanCode).trim(),
    refPrompt: String(refPrompt || '').trim(),
    updatedAt: new Date().toISOString()
  };
  const tmpMeta = `${metaPath}.tmp`;
  fs.writeFileSync(tmpMeta, JSON.stringify(meta, null, 2) + '\n');
  fs.renameSync(tmpMeta, metaPath);

  return { ...meta[cleanCode], imageFile };
}

export function resolveRequiredCharacters(root, project, requested = []) {
  if (!Array.isArray(requested) || !requested.length) return [];
  const stored = loadWorkspaceCharacters(root, project);
  const seen = new Set();
  const resolved = [];
  for (const item of requested) {
    const rawCode = typeof item === 'string' ? item : (item?.code || item?.name || '');
    const code = String(rawCode).trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, '_');
    if (!code || seen.has(code)) continue;
    seen.add(code);
    const saved = stored[code] || {};
    const name = String((typeof item === 'object' && item?.name) || saved.name || code).trim();
    const refPrompt = String((typeof item === 'object' && item?.refPrompt) || saved.refPrompt || '').trim();
    const imageFile = findWorkspaceCharacterFile(root, project, code);
    resolved.push({ code, name, refPrompt, imageFile });
  }
  return resolved;
}

async function openIngredientsOverlay(page, { filter = 'All' } = {}) {
  await page.locator(S.addIngredientsButton).first().click({ timeout: 10000 });
  const search = page.locator(S.searchAssetsInput).first();
  await search.waitFor({ state: 'visible', timeout: 10000 });
  if (filter) {
    const filterEl = page.locator(`.cdk-overlay-container :text-is("${filter}")`).first();
    if (await filterEl.isVisible().catch(() => false)) {
      await filterEl.click().catch(() => {});
      await page.waitForTimeout(250);
    }
  }
  return search;
}

async function findOverlayAsset(page, searchInput, name) {
  await searchInput.fill(name);
  await page.waitForTimeout(450);
  const needle = name.trim().toLowerCase();
  const items = page.locator('.cdk-overlay-container button.asset-item');
  const count = await items.count();
  let imageMatch = null;
  for (let i = 0; i < count; i++) {
    const item = items.nth(i);
    if (!(await item.isVisible().catch(() => false))) continue;
    const title = ((await item.locator('.asset-title').first().innerText().catch(() => '')) || '').trim().toLowerCase();
    const fullText = ((await item.innerText().catch(() => '')) || '').trim().toLowerCase();
    const lines = fullText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const label = title || lines[0] || '';
    const kind = lines[lines.length - 1] || '';
    if (kind === 'video' || fullText.includes('no assets found')) continue;
    if (label === needle) {
      if (kind === 'character') return item;
      if (!imageMatch) imageMatch = item;
    }
  }
  if (imageMatch) return imageMatch;

  const fallback = page.locator('.cdk-overlay-container [role="option"], .cdk-overlay-container [class*="asset"], .cdk-overlay-container [class*="tile"], .cdk-overlay-container button')
    .filter({ hasText: new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s+(?:Character|Image))?\\s*$`, 'i') })
    .first();
  if (await fallback.isVisible().catch(() => false)) {
    const text = ((await fallback.innerText().catch(() => '')) || '').trim().toLowerCase();
    if (text && !text.includes('no assets found') && !text.endsWith('video') && text.includes(needle)) return fallback;
  }
  return null;
}

export async function isCharacterInFlowProject(page, name) {
  const search = await openIngredientsOverlay(page);
  const found = await findOverlayAsset(page, search, name);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(200);
  return Boolean(found);
}

async function openCharactersCreator(page) {
  const promptBox = page.locator(S.characterPromptBox).first();
  if (await promptBox.isVisible().catch(() => false)) return;

  const navItem = page.locator(S.charactersNavItem).first();
  if (await navItem.isVisible().catch(() => false)) {
    await navItem.click({ timeout: 10000 });
  }

  const newCharBtn = page.locator(S.newCharacterButton).first();
  await Promise.any([
    promptBox.waitFor({ state: 'visible', timeout: 10000 }),
    newCharBtn.waitFor({ state: 'visible', timeout: 10000 })
  ]).catch(() => {});

  if (!(await promptBox.isVisible().catch(() => false)) && (await newCharBtn.isVisible().catch(() => false))) {
    await newCharBtn.click({ timeout: 10000 });
  }

  await promptBox.waitFor({ state: 'visible', timeout: 15000 });
}

async function setCharacterNameOnPage(page, name) {
  const editNameBtn = page.locator('button[aria-label="Edit name"], [aria-label*="Edit character name" i]').first();
  if (await editNameBtn.isVisible().catch(() => false)) {
    await editNameBtn.click().catch(() => {});
    await page.waitForTimeout(250);
  }
  const editableSelectors = [
    'input[aria-label="Character name"]',
    'flow-editable-text input',
    'flow-editable-text textarea',
    'flow-editable-text [contenteditable="true"]',
    'input[aria-label*="name" i]',
    'input[placeholder*="name" i]',
    '.title-input input'
  ].join(', ');
  let input = page.locator(editableSelectors).first();
  if (!(await input.isVisible().catch(() => false))) {
    const triggers = [
      'flow-character-form flow-editable-text',
      'flow-character-edit-header flow-editable-text',
      'flow-editable-text',
      '.title:has-text("Untitled character")',
      '.title:has-text("New character")',
      ':text-is("Untitled character")',
      ':text-is("New character")'
    ];
    for (const sel of triggers) {
      const el = page.locator(sel).first();
      if (!(await el.isVisible().catch(() => false))) continue;
      await el.click().catch(() => {});
      await page.waitForTimeout(250);
      input = page.locator(editableSelectors).first();
      if (await input.isVisible().catch(() => false)) break;
    }
  }
  const charNameInput = page.locator('input[aria-label="Character name"]').first();
  if (await charNameInput.isVisible().catch(() => false)) {
    input = charNameInput;
  } else {
    input = page.locator(editableSelectors).first();
  }
  if (await input.isVisible().catch(() => false)) {
    await input.fill(name);
    await input.press('Enter').catch(() => {});
    await input.evaluate(el => el.blur?.()).catch(() => {});
    await page.waitForTimeout(300);
  }
}

async function finishCharacterPage(page) {
  const doneBtn = page.locator(S.characterDoneButton).first();
  if (await doneBtn.isVisible().catch(() => false) && !(await doneBtn.isDisabled().catch(() => true))) {
    await doneBtn.click();
  } else {
    await page.locator(S.characterBackButton).first().click({ timeout: 10000 });
  }
  await page.locator(S.promptBox).first().waitFor({ state: 'visible', timeout: 15000 });
  if (S.allMediaNavItem) {
    const allMedia = page.locator(S.allMediaNavItem).first();
    if (await allMedia.isVisible().catch(() => false)) {
      await allMedia.click().catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

async function getExistingImageSrcs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('img')].map(img => img.src).filter(Boolean)
  );
}

async function waitForNewCharacterImageSrc(page, beforeSrcs, timeout = 180000) {
  const handle = await page.waitForFunction(prev => {
    const candidates = [
      ...document.querySelectorAll('img[alt="Generated character image"], flow-character-image-preview img, flow-image-tile img'),
      ...document.querySelectorAll('img')
    ];
    const hit = candidates.find(img =>
      img.complete &&
      img.naturalWidth > 128 &&
      img.src &&
      !prev.includes(img.src) &&
      !img.src.includes('/flow_characters/')
    );
    return hit ? hit.src : false;
  }, beforeSrcs, { timeout });
  const src = await handle.jsonValue();
  await handle.dispose();
  return src;
}

export async function downloadImageBytes(page, src) {
  try {
    const base64 = await page.evaluate(async url => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch character image (${res.status})`);
      const buf = new Uint8Array(await res.arrayBuffer());
      let bin = '';
      for (let i = 0; i < buf.length; i += 0x8000) {
        bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      }
      return btoa(bin);
    }, src);
    return Buffer.from(base64, 'base64');
  } catch {
    const res = await page.context().request.get(src, { timeout: 60000 });
    if (!res.ok()) throw new Error(`Failed to fetch character image (${res.status()})`);
    return await res.body();
  }
}

async function uploadWorkspaceCharacterToFlow(page, { name, imageFile, log = console.log }) {
  log(`Uploading saved character "${name}" from workspace to Flow project...`);
  await openCharactersCreator(page);
  const beforeSrcs = await getExistingImageSrcs(page);

  const uploadBtn = page.locator(S.characterUploadButton).first();
  await uploadBtn.waitFor({ state: 'visible', timeout: 10000 });
  const chooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
  await uploadBtn.click();
  const chooser = await chooserPromise;
  if (chooser) {
    await chooser.setFiles(imageFile);
  } else {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 10000 });
    await fileInput.setInputFiles(imageFile);
  }

  await page.locator('flow-character-edit-page').first().waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
  await waitForNewCharacterImageSrc(page, beforeSrcs, 60000).catch(() => {});
  await page.locator('button[aria-label="Edit name"], input[aria-label="Character name"]').first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

  await setCharacterNameOnPage(page, name);
  await finishCharacterPage(page);
}

async function generateAndSaveCharacterInFlow(page, { root, project, code, name, refPrompt, log = console.log }) {
  if (!refPrompt) throw new Error(`Missing reference prompt to generate character "${name}".`);
  log(`Generating character "${name}" in Flow and saving to workspace...`);
  await openCharactersCreator(page);

  const beforeSrcs = await getExistingImageSrcs(page);

  const box = page.locator(S.characterPromptBox).first();
  await box.click();
  await box.fill(refPrompt);
  const submit = page.locator(S.submitButton).first();
  await submit.waitFor({ state: 'visible', timeout: 10000 });
  await submit.click();

  const imgSrc = await waitForNewCharacterImageSrc(page, beforeSrcs, 180000);
  const imageBuffer = await downloadImageBytes(page, imgSrc);

  const saved = saveWorkspaceCharacter(root, project, {
    code,
    name,
    refPrompt,
    imageBuffer,
    ext: '.png'
  });
  await pushCharacterToCloudDb(project, { code, name, refPrompt, imageBuffer, ext: '.png' }).catch(err => {
    log(`Warning: cloud DB sync for "${name}" failed: ${err.message}`);
  });
  log(`Saved character "${name}" to ${saved.imageFile} and synced online.`);

  await setCharacterNameOnPage(page, name);
  await finishCharacterPage(page);
  return saved;
}

export async function copyCharacterFromFlowToWorkspace(page, { root, project, code, name, refPrompt = '', log = console.log }) {
  log(`Copying existing character "${name}" from Flow project to workspace...`);
  if (!(await page.locator(S.charactersNavItem).first().isVisible().catch(() => false))) {
    const backBtn = page.locator(S.characterBackButton).first();
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  let imgSrc = null;
  const navItem = page.locator(S.charactersNavItem).first();
  if (await navItem.isVisible().catch(() => false)) {
    await navItem.click({ timeout: 10000 });
    await page.waitForTimeout(500);
  }

  const tile = page.locator('flow-character-tile')
    .filter({ hasText: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
    .first();

  if (await tile.isVisible().catch(() => false)) {
    imgSrc = await tile.locator('img').first().getAttribute('src').catch(() => null);
    if (!imgSrc) {
      await tile.click();
      await page.waitForSelector('flow-character-edit-page', { timeout: 10000 });
      imgSrc = await waitForNewCharacterImageSrc(page, [], 30000);
      await finishCharacterPage(page);
    } else if (S.allMediaNavItem) {
      const allMedia = page.locator(S.allMediaNavItem).first();
      if (await allMedia.isVisible().catch(() => false)) {
        await allMedia.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
  } else {
    if (S.allMediaNavItem) {
      const allMedia = page.locator(S.allMediaNavItem).first();
      if (await allMedia.isVisible().catch(() => false)) {
        await allMedia.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }
    const search = await openIngredientsOverlay(page);
    const match = await findOverlayAsset(page, search, name);
    if (!match) {
      await page.keyboard.press('Escape').catch(() => {});
      throw new Error(`Character "${name}" was not found in Flow project.`);
    }
    imgSrc = await match.locator('img').first().getAttribute('src').catch(() => null)
      || await page.locator('.cdk-overlay-container img.detail-preview-image').first().getAttribute('src').catch(() => null);
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(200);
  }

  if (!imgSrc) throw new Error(`Could not read image URL for character "${name}" from Flow.`);
  const imageBuffer = await downloadImageBytes(page, imgSrc);
  const saved = saveWorkspaceCharacter(root, project, {
    code,
    name,
    refPrompt,
    imageBuffer,
    ext: '.png'
  });
  await pushCharacterToCloudDb(project, { code, name, refPrompt, imageBuffer, ext: '.png' }).catch(err => {
    log(`Warning: cloud DB sync for "${name}" failed: ${err.message}`);
  });
  log(`Copied character "${name}" from Flow to ${saved.imageFile} and synced online.`);
  return saved;
}

export async function attachCharacterIngredient(page, name, log = console.log) {
  const search = await openIngredientsOverlay(page);
  const match = await findOverlayAsset(page, search, name);
  if (!match) {
    await page.keyboard.press('Escape').catch(() => {});
    throw new Error(`Character "${name}" was not found in Flow ingredients.`);
  }
  log(`Attaching character "${name}" to Flow prompt...`);
  await match.click();
  await page.waitForTimeout(300);
  const addToPromptBtn = page.locator('.cdk-overlay-container button:has-text("Add to prompt"), .cdk-overlay-container .detail-add-to-prompt-btn').first();
  if (await addToPromptBtn.isVisible().catch(() => false)) {
    await addToPromptBtn.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  if (await page.locator(S.searchAssetsInput).first().isVisible().catch(() => false)) {
    await page.keyboard.press('Escape').catch(() => {});
  }
}

/**
 * Ensures required characters are synced across both the workspace (local + online DB)
 * and the active Flow project across all 4 scenarios:
 *  1. In workspace & in Flow -> reuse directly.
 *  2. In workspace & NOT in Flow -> upload from workspace to Flow project and name it.
 *  3. NOT in workspace & NOT in Flow -> generate in Flow, save to workspace + online DB, and name it.
 *  4. NOT in workspace & in Flow -> copy character image from Flow to workspace + online DB first.
 */
export async function ensureCharactersInFlow(page, { root, project, characters, log = console.log, ops = {} }) {
  if (!characters?.length) return;
  const checkInFlow = ops.isInFlow || isCharacterInFlowProject;
  const uploadToFlow = ops.uploadToFlow || uploadWorkspaceCharacterToFlow;
  const generateInFlow = ops.generateInFlow || generateAndSaveCharacterInFlow;
  const copyFromFlow = ops.copyFromFlow || copyCharacterFromFlowToWorkspace;
  const syncWithCloud = ops.syncWithCloud || (ops.isInFlow ? (async (_r, _p, c) => c) : syncWorkspaceCharacterWithCloud);

  for (const rawChar of characters) {
    const char = await syncWithCloud(root, project, rawChar, { log });
    const inWorkspace = Boolean(char.imageFile && fs.existsSync(char.imageFile));
    const inFlow = await checkInFlow(page, char.name);

    if (inWorkspace && inFlow) {
      // Scenario 1: In workspace and in Flow project -> ready to use.
      log(`Character "${char.name}" is present in both workspace and Flow project.`);
    } else if (inWorkspace && !inFlow) {
      // Scenario 2: In workspace, missing in Flow -> upload from workspace to Flow.
      await uploadToFlow(page, { ...char, log });
    } else if (!inWorkspace && !inFlow) {
      // Scenario 3: Missing in both -> generate in Flow and save to workspace + online DB.
      const saved = await generateInFlow(page, { root, project, ...char, log });
      if (saved?.imageFile) rawChar.imageFile = saved.imageFile;
    } else if (!inWorkspace && inFlow) {
      // Scenario 4: Missing in workspace, present in Flow -> copy from Flow to workspace + online DB.
      const saved = await copyFromFlow(page, { root, project, ...char, log });
      if (saved?.imageFile) rawChar.imageFile = saved.imageFile;
    }
  }
}

/** Attaches the required characters as ingredients to the Flow prompt box. */
export async function attachCharactersToPrompt(page, { characters, log = console.log, ops = {} }) {
  if (!characters?.length) return;
  const attach = ops.attach || attachCharacterIngredient;
  for (const char of characters) {
    await attach(page, char.name, log);
  }
}

/**
 * Ensures only the required characters exist in the active Flow project and attaches
 * them as ingredients to the prompt box.
 */
export async function ensureAndAttachCharacters(page, opts) {
  await ensureCharactersInFlow(page, opts);
  await attachCharactersToPrompt(page, opts);
}
