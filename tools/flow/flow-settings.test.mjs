import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studioProjectName } from './flow-settings.mjs';

test('uses the studio card name as the Flow project name', () => {
  assert.equal(studioProjectName('daily-motivations'), 'Daily Motivations');
  assert.equal(studioProjectName('gk-questions'), 'GK Questions');
});

test('returns null for a workspace the studio does not list', () => {
  assert.equal(studioProjectName('no-such-workspace'), null);
});
