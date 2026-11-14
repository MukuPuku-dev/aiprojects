import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAccountMenu } from './flow-accounts.mjs';

test('reads the active account, its credits and refresh time from the Flow account menu', () => {
  const menu = 'close\nMukesh Pokharel\nmukesh.inaruwa12@gmail.com\nSwitch account\nmovie_filter_auto\n5 Google Flow credits\nCredits refresh daily at 21:52\nUpgrade';
  assert.deepEqual(parseAccountMenu(menu), { email: 'mukesh.inaruwa12@gmail.com', credits: 5, refresh: '21:52' });
});

test('reports missing credits as null instead of zero', () => {
  const info = parseAccountMenu('Mukesh\nMUKESH.INARUWA20@gmail.com\nSwitch account');
  assert.equal(info.email, 'mukesh.inaruwa20@gmail.com');
  assert.equal(info.credits, null);
  assert.equal(info.refresh, null);
});

test('parses credit counts with thousands separators', () => {
  assert.equal(parseAccountMenu('1,250 Google Flow credits').credits, 1250);
});
