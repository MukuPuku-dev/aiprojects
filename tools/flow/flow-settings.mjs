import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
export const SETTINGS_FILE = path.join(HERE, 'settings.json');
export const PROJECT_ID = /^[a-z0-9-]+$/;

export const VIDEO_MODELS = ['Omni 1.1 Flash', 'Omni 1.2 Flash', 'Veo 3.1 - Lite', 'Veo 3.1 - Fast', 'Veo 3.1 - Quality'];
export const DURATIONS = ['4s', '6s', '8s', '10s'];
export const ASPECTS = ['9:16', '16:9'];
export const FLOW_OPTIONS = { videoModels: VIDEO_MODELS, durations: DURATIONS, aspects: ASPECTS };

export const DEFAULT_TELEGRAM_BOT_TOKEN = 'PASTE_YOUR_BOTFATHER_TOKEN_HERE';
export const DEFAULT_TELEGRAM_CHAT_ID = '7223190114';

// An empty image model means "keep whatever model Flow currently has selected".
const DEFAULTS = {
  video: { model: VIDEO_MODELS[0], aspect: '9:16', duration: '10s' },
  image: { model: '', aspect: '9:16' },
  tiktok: { autoPost: false },
  facebook: { autoPost: false },
  telegram: { autoPost: true, botToken: DEFAULT_TELEGRAM_BOT_TOKEN, chatId: DEFAULT_TELEGRAM_CHAT_ID },
  characters: { consistency: false }
};

function cleanBooleanSection(input, key) {
  const src = input && typeof input === 'object' ? input : {};
  const raw = src[key];
  if (raw === undefined || raw === null || raw === '') return {};
  if (typeof raw === 'boolean') return { [key]: raw };
  if (raw === 'true' || raw === 'false') return { [key]: raw === 'true' };
  throw new Error(`${key} must be true or false.`);
}

const choice = (allowed, label) => value => {
  if (!allowed.includes(value)) throw new Error(`Unknown ${label}: ${value}`);
  return value;
};
const VIDEO_FIELDS = {
  model: choice(VIDEO_MODELS, 'video model'),
  aspect: choice(ASPECTS, 'aspect'),
  duration: choice(DURATIONS, 'duration')
};
const IMAGE_FIELDS = {
  model: value => {
    if (value.length > 80) throw new Error('Image model name must be 80 characters or fewer.');
    return value;
  },
  aspect: choice(ASPECTS, 'image aspect')
};
const TELEGRAM_FIELDS = {
  botToken: value => {
    if (value.length > 200) throw new Error('Telegram bot token must be 200 characters or fewer.');
    return value;
  },
  chatId: value => {
    if (value.length > 80) throw new Error('Telegram chat ID must be 80 characters or fewer.');
    return value;
  }
};
const FLOW_PROJECT_FIELD = {
  flowProject: value => {
    if (value.length > 80) throw new Error('Flow project name must be 80 characters or fewer.');
    return value;
  }
};
// Keeps only known, non-empty fields. Empty values mean "inherit".
function cleanSection(input, fields) {
  const src = input && typeof input === 'object' ? input : {};
  const out = {};
  for (const [key, check] of Object.entries(fields)) {
    const raw = src[key];
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== 'string') throw new Error(`${key} must be text.`);
    const value = raw.trim();
    if (value) out[key] = check(value);
  }
  return out;
}

export function normalizeSettings(input) {
  const src = input && typeof input === 'object' ? input : {};
  const defaults = {
    video: { ...DEFAULTS.video, ...cleanSection(src.defaults?.video, VIDEO_FIELDS) },
    image: { ...DEFAULTS.image, ...cleanSection(src.defaults?.image, IMAGE_FIELDS) },
    tiktok: { ...DEFAULTS.tiktok, ...cleanBooleanSection(src.defaults?.tiktok, 'autoPost') },
    facebook: { ...DEFAULTS.facebook, ...cleanBooleanSection(src.defaults?.facebook, 'autoPost') },
    telegram: {
      ...DEFAULTS.telegram,
      ...cleanBooleanSection(src.defaults?.telegram, 'autoPost'),
      ...cleanSection(src.defaults?.telegram, TELEGRAM_FIELDS)
    },
    characters: { ...DEFAULTS.characters, ...cleanBooleanSection(src.defaults?.characters, 'consistency') }
  };
  const projects = {};
  for (const [id, entry] of Object.entries(src.projects || {})) {
    if (!PROJECT_ID.test(id)) throw new Error(`Invalid project id: ${id}`);
    const video = cleanSection(entry?.video, VIDEO_FIELDS);
    const image = cleanSection(entry?.image, IMAGE_FIELDS);
    const tiktok = cleanBooleanSection(entry?.tiktok, 'autoPost');
    const facebook = cleanBooleanSection(entry?.facebook, 'autoPost');
    const telegram = {
      ...cleanBooleanSection(entry?.telegram, 'autoPost'),
      ...cleanSection(entry?.telegram, TELEGRAM_FIELDS)
    };
    const characters = cleanBooleanSection(entry?.characters, 'consistency');
    if (Object.keys(video).length || Object.keys(image).length || Object.keys(tiktok).length || Object.keys(facebook).length || Object.keys(telegram).length || Object.keys(characters).length) {
      projects[id] = {
        video,
        image,
        ...(Object.keys(tiktok).length ? { tiktok } : {}),
        ...(Object.keys(facebook).length ? { facebook } : {}),
        ...(Object.keys(telegram).length ? { telegram } : {}),
        ...(Object.keys(characters).length ? { characters } : {})
      };
    }
  }
  return { defaults, projects };
}

export function readSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) return normalizeSettings({});
  let parsed;
  try { parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')); }
  catch { throw new Error(`settings.json is not valid JSON: ${SETTINGS_FILE}`); }
  return normalizeSettings(parsed);
}

export function saveSettings(input) {
  const settings = normalizeSettings(input);
  const tmp = SETTINGS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(settings, null, 2) + '\n');
  fs.renameSync(tmp, SETTINGS_FILE);
  return settings;
}

export function effectiveSettings(settings, project) {
  const override = Object.hasOwn(settings.projects, project) ? settings.projects[project] : {};
  return {
    video: { ...settings.defaults.video, ...override.video },
    image: { ...settings.defaults.image, ...override.image },
    tiktok: { ...settings.defaults.tiktok, ...override.tiktok },
    facebook: { ...settings.defaults.facebook, ...override.facebook },
    telegram: { ...settings.defaults.telegram, ...override.telegram },
    characters: { ...settings.defaults.characters, ...override.characters }
  };
}

// The studio card name for a workspace id, read from platform/projects.js. Used as the Flow project name.
export function studioProjectName(project) {
  const file = path.join(ROOT, 'platform', 'projects.js');
  const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const pattern = /name:\s*"([^"]+)"[^}]*?href:\s*"projects\/([a-z0-9-]+)\//g;
  for (const match of source.matchAll(pattern)) {
    if (match[2] === project) return match[1];
  }
  return null;
}

// Project folders are the ones under projects/ that have an index.html.
export function listProjects() {
  const dir = path.join(ROOT, 'projects');
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && PROJECT_ID.test(entry.name) && fs.existsSync(path.join(dir, entry.name, 'index.html')))
    .map(entry => entry.name)
    .sort();
}
