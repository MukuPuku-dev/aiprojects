import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  bufferToDataUrl,
  downloadImageBytes,
  ensureAndAttachCharacters,
  findWorkspaceCharacterFile,
  resolveRequiredCharacters,
  saveWorkspaceCharacter,
  syncWorkspaceCharacterWithCloud
} from './flow-characters.mjs';

test('workspace character store saves images, finds them by code, and resolves only required characters', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-chars-'));
  try {
    assert.equal(findWorkspaceCharacterFile(root, 'teenage-love-vibes', 'AARAV'), null);

    const saved = saveWorkspaceCharacter(root, 'teenage-love-vibes', {
      code: 'AARAV',
      name: 'Aarav',
      refPrompt: '17yo Nepali boy reference',
      imageBuffer: Buffer.from('fake-png-bytes'),
      ext: '.png'
    });
    assert.ok(fs.existsSync(saved.imageFile));
    assert.equal(path.basename(saved.imageFile), 'AARAV.png');

    const resolved = resolveRequiredCharacters(root, 'teenage-love-vibes', [
      { code: 'AARAV', name: 'Aarav', refPrompt: '17yo Nepali boy reference' },
      { code: 'AARAV', name: 'Aarav', refPrompt: 'duplicate should be skipped' }
    ]);
    assert.equal(resolved.length, 1);
    assert.equal(resolved[0].code, 'AARAV');
    assert.equal(resolved[0].name, 'Aarav');
    assert.equal(resolved[0].imageFile, saved.imageFile);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('ensureAndAttachCharacters handles all 4 workspace/Flow scenarios', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-char-flow-'));
  try {
    const savedSuman = saveWorkspaceCharacter(root, 'teenage-love-vibes', {
      code: 'SUMAN',
      name: 'Suman',
      refPrompt: 'Suman prompt',
      imageBuffer: Buffer.from('suman-bytes')
    });
    const savedAarav = saveWorkspaceCharacter(root, 'teenage-love-vibes', {
      code: 'AARAV',
      name: 'Aarav',
      refPrompt: 'Aarav prompt',
      imageBuffer: Buffer.from('aarav-bytes')
    });

    const events = [];
    const inFlow = new Set(['Suman', 'Maya']);
    const characters = [
      // Scenario 1: In workspace and in Flow -> reuse directly
      { code: 'SUMAN', name: 'Suman', refPrompt: 'Suman prompt', imageFile: savedSuman.imageFile },
      // Scenario 2: In workspace, not in Flow -> upload workspace to Flow
      { code: 'AARAV', name: 'Aarav', refPrompt: 'Aarav prompt', imageFile: savedAarav.imageFile },
      // Scenario 3: Not in workspace, not in Flow -> generate in Flow & save to workspace
      { code: 'AANYA', name: 'Aanya', refPrompt: 'Aanya prompt', imageFile: null },
      // Scenario 4: Not in workspace, present in Flow -> copy from Flow to workspace
      { code: 'MAYA', name: 'Maya', refPrompt: 'Maya prompt', imageFile: null }
    ];

    await ensureAndAttachCharacters({}, {
      root,
      project: 'teenage-love-vibes',
      characters,
      log: () => {},
      ops: {
        isInFlow: async (_page, name) => inFlow.has(name),
        uploadToFlow: async (_page, c) => {
          events.push(`upload:${c.name}:${path.basename(c.imageFile)}`);
          inFlow.add(c.name);
        },
        generateInFlow: async (_page, c) => {
          events.push(`generate:${c.name}`);
          const saved = saveWorkspaceCharacter(root, 'teenage-love-vibes', {
            code: c.code,
            name: c.name,
            refPrompt: c.refPrompt,
            imageBuffer: Buffer.from('generated-aanya')
          });
          inFlow.add(c.name);
          return saved;
        },
        copyFromFlow: async (_page, c) => {
          events.push(`copyFromFlow:${c.name}`);
          return saveWorkspaceCharacter(root, 'teenage-love-vibes', {
            code: c.code,
            name: c.name,
            refPrompt: c.refPrompt,
            imageBuffer: Buffer.from('copied-maya')
          });
        },
        attach: async (_page, name) => {
          events.push(`attach:${name}`);
        }
      }
    });

    assert.deepEqual(events, [
      'upload:Aarav:AARAV.png',
      'generate:Aanya',
      'copyFromFlow:Maya',
      'attach:Suman',
      'attach:Aarav',
      'attach:Aanya',
      'attach:Maya'
    ]);
    assert.ok(findWorkspaceCharacterFile(root, 'teenage-love-vibes', 'AANYA'));
    assert.ok(findWorkspaceCharacterFile(root, 'teenage-love-vibes', 'MAYA'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('syncWorkspaceCharacterWithCloud pushes local character to cloud and pulls cloud character when missing locally', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-char-cloud-'));
  try {
    const cloudAssets = new Map();
    const fakeFetch = async (_url, init) => {
      const body = JSON.parse(init.body);
      const stmt = body.requests[0].stmt;
      const sql = stmt.sql;
      const args = (stmt.args || []).map(a => a.value);
      let rows = [];
      if (sql.startsWith('SELECT length(data) FROM assets')) {
        const val = cloudAssets.get(args[0]);
        if (val) rows = [[{ value: String(val.length) }]];
      } else if (sql.startsWith('SELECT data FROM assets')) {
        const val = cloudAssets.get(args[0]);
        if (val) rows = [[{ value: val }]];
      } else if (sql.startsWith('INSERT INTO assets')) {
        cloudAssets.set(args[0], args[1]);
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ results: [{ type: 'ok', response: { result: { rows } } }] })
      };
    };

    // 1. Local file exists, cloud is empty -> pushes to cloud
    const savedLocal = saveWorkspaceCharacter(root, 'teenage-love-vibes', {
      code: 'AARAV',
      name: 'Aarav',
      refPrompt: 'Aarav prompt',
      imageBuffer: Buffer.from('aarav-local-img')
    });
    await syncWorkspaceCharacterWithCloud(root, 'teenage-love-vibes', savedLocal, {
      log: () => {},
      dbOpts: { fetchImpl: fakeFetch }
    });
    assert.equal(cloudAssets.get('teenage-love-vibes:char-AARAV'), bufferToDataUrl(Buffer.from('aarav-local-img'), '.png'));

    // 2. Cloud has AANYA, local does not -> pulls from cloud to local workspace
    cloudAssets.set('teenage-love-vibes:char-AANYA', bufferToDataUrl(Buffer.from('aanya-cloud-img'), '.png'));
    const syncedAanya = await syncWorkspaceCharacterWithCloud(root, 'teenage-love-vibes', {
      code: 'AANYA',
      name: 'Aanya',
      refPrompt: 'Aanya prompt',
      imageFile: null
    }, {
      log: () => {},
      dbOpts: { fetchImpl: fakeFetch }
    });
    assert.ok(syncedAanya.imageFile && fs.existsSync(syncedAanya.imageFile));
    assert.deepEqual(fs.readFileSync(syncedAanya.imageFile), Buffer.from('aanya-cloud-img'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('downloadImageBytes falls back to browser context request when page fetch fails CORS', async () => {
  const expected = Buffer.from('png-from-context-request');
  const fakePage = {
    evaluate: async () => {
      throw new TypeError('Failed to fetch');
    },
    context: () => ({
      request: {
        get: async url => {
          assert.equal(url, 'https://storage.googleapis.com/flow/char.png');
          return {
            ok: () => true,
            status: () => 200,
            body: async () => expected
          };
        }
      }
    })
  };
  const actual = await downloadImageBytes(fakePage, 'https://storage.googleapis.com/flow/char.png');
  assert.deepEqual(actual, expected);
});
