const VALID_CATS = new Set(['couple', 'school', 'dating', 'office', 'everyday']);
const VALID_CHARS = new Set(['PURP_GUY', 'PURP_GIRL', 'PURP_TEACHER', 'WHITE_KID', 'OLD_RICH', 'PURP_DOC']);
const VALID_LOCS = new Set(['LIVING_ROOM', 'CLASSROOM', 'PARK', 'OFFICE', 'CAFE', 'CLINIC', 'BARBERSHOP']);
const VALID_LANGS = new Set(['en', 'hi', 'ne']);

const DEFAULT_WHO_BY_CAT = {
  couple: ['PURP_GUY', 'PURP_GIRL'],
  school: ['WHITE_KID', 'PURP_TEACHER'],
  dating: ['PURP_GUY', 'PURP_GIRL'],
  office: ['PURP_GUY', 'PURP_TEACHER'],
  everyday: ['PURP_GUY', 'PURP_DOC']
};

const DEFAULT_LOC_BY_CAT = {
  couple: 'LIVING_ROOM',
  school: 'CLASSROOM',
  dating: 'CAFE',
  office: 'OFFICE',
  everyday: 'CLINIC'
};

const LANG_CONFIG = {
  en: {
    name: 'English',
    dialogueRule: 'Write all spoken dialogue in natural, snappy, hilarious everyday American English.',
    titleRule: 'Write catchy English viral Reels titles with 😂 emoji.',
    defaultTags: '#PurpleStick #stickman #stickmananimation #funnyreels #viralreels #comedy #memes'
  },
  hi: {
    name: 'Hindi',
    dialogueRule: 'Write all spoken dialogue in natural, punchy, hilarious conversational Hindi using Devanagari script (e.g., "अरे सुनो...", "क्या बात कर रहे हो?!"). Keep speaker prefixes in English (WIFE:, HUSBAND:, BOSS:, etc.) so the parser reads them cleanly, while all spoken words are in crisp Hindi Devanagari.',
    titleRule: 'Write catchy Hindi/Hinglish viral Reels titles with 😂 emoji.',
    defaultTags: '#PurpleStick #HindiComedy #StickmanHindi #funnyreels #viralreels #DesiComedy #memes'
  },
  ne: {
    name: 'Nepali',
    dialogueRule: 'Write all spoken dialogue in natural, punchy, hilarious everyday Nepali using Devanagari script (e.g., "ए बुढा सुन त...", "के भन्यौ तिमीले?!"). Keep speaker prefixes in English (WIFE:, HUSBAND:, TEACHER:, etc.) so the parser reads them cleanly, while all spoken words are in natural spoken Nepali Devanagari.',
    titleRule: 'Write catchy Nepali/English viral Reels titles with 😂 emoji.',
    defaultTags: '#PurpleStick #NepaliComedy #StickmanNepal #funnyreels #viralreels #NepaliMemes #comedy'
  }
};

export function normalizeLang(lang) {
  const clean = String(lang || 'en').trim().toLowerCase();
  return VALID_LANGS.has(clean) ? clean : 'en';
}

export function buildPurpleStickConceptPrompt({
  theme = '',
  category = 'all',
  language = 'en',
  seriesMode = 'standalone',
  seriesTitle = '',
  count = 3,
  existingTitles = [],
  previousBeats = []
} = {}) {
  const lang = normalizeLang(language);
  const langCfg = LANG_CONFIG[lang];
  const n = Math.max(1, Math.min(15, Number(count) || 3));
  const isOngoing = seriesMode === 'ongoing';

  const catRule = category && category !== 'all' && VALID_CATS.has(category)
    ? `All ${n} skits MUST belong to category "${category}".`
    : `Mix categories across: couple, school, dating, office, everyday.`;

  const seriesRule = isOngoing
    ? [
        `ONGOING SERIES MODE: You are writing the next ${n} connected 10-second comedy episodes of an ongoing mini-series${seriesTitle ? ` titled "${seriesTitle}"` : ''}.`,
        `Each 10-second episode MUST work as a standalone laugh-out-loud punchline AND escalate a funny ongoing storyline / running gag from episode to episode!`,
        Array.isArray(previousBeats) && previousBeats.length
          ? `Previous episodes in this series (continue directly from here!):\n${previousBeats.slice(-8).map((b, i) => `  Ep ${i + 1}: ${b}`).join('\n')}`
          : `Start from Episode 1 and build a hilarious escalating arc across all ${n} episodes.`
      ].join('\n')
    : `STANDALONE REELS MODE: Each of the ${n} skits is a self-contained 10-second viral comedy Reel with a fresh twist.`;

  const themeRule = theme && theme.trim()
    ? `Topic / Premise: "${theme.trim()}". Build super-funny, ultra-relatable comedy twists around this topic.`
    : `Invent fresh, viral, laugh-out-loud everyday comedy twists (like 20M-view stickman comedy Reels).`;

  const avoidList = !isOngoing && Array.isArray(existingTitles) && existingTitles.length
    ? `Do NOT repeat any of these existing titles/jokes: ${existingTitles.slice(-25).join(' | ')}`
    : '';

  return [
    `You are a viral comedy writer for "PurpleStick" — a 9:16 vertical 2D stickman comedy Reels studio starring royal-purple cartoon caricature stickmen (PurpleStick Guy & PurpleStick Girl).`,
    `Generate ${n} brand-new, hilarious, ultra-punchy 8-second comedy skit concepts.`,
    `LANGUAGE: ${langCfg.name}. ${langCfg.dialogueRule} ${langCfg.titleRule}`,
    seriesRule,
    catRule,
    themeRule,
    avoidList,
    ``,
    `STRICT RULES:`,
    `- Each skit must be 4 tight, snappy dialogue lines that fit naturally in an 8-second clip: Setup -> Twist -> Savage/Unexpected Punchline. Do NOT force rigid second-by-second timestamps on dialogue—let Flow pace the comedic timing naturally.`,
    `- Keep humor clever, snappy, and PG-13 Facebook/TikTok/YouTube safe.`,
    `- Choose 2 characters ONLY from these codes: PURP_GUY, PURP_GIRL, PURP_TEACHER, WHITE_KID, OLD_RICH, PURP_DOC.`,
    `- Choose 1 background set ONLY from these codes: LIVING_ROOM, CLASSROOM, PARK, OFFICE, CAFE, CLINIC, BARBERSHOP.`,
    `- Format "line" as pipe-separated speaker lines with English speaker tags, e.g. "WIFE: ...|HUSBAND: ...|WIFE: ...|HUSBAND: ...".`,
    `- Keep "visual" and "sfx" written in clear English for the video animator.`,
    ``,
    `Return ONLY valid JSON (no markdown fences, no commentary) as an array of ${n} objects with this EXACT schema:`,
    `[`,
    `  {`,
    `    "cat": "couple",`,
    `    "who": ["PURP_GUY", "PURP_GIRL"],`,
    `    "loc": "LIVING_ROOM",`,
    `    "title": "Catchy Viral Title! 😂",`,
    `    "hook": "Short 1-line teaser hook",`,
    `    "line": "WIFE: ...|HUSBAND: ...|WIFE: ...|HUSBAND: ...",`,
    `    "visual": "Setup -> Twist -> Punchline visual action beats (natural 8s comedic flow)",`,
    `    "sfx": "Voice styles + subtle matching cartoon SFX",`,
    `    "tags": "${langCfg.defaultTags}"`,
    `  }`,
    `]`
  ].filter(Boolean).join('\n');
}

function normalizeQuotes(str) {
  return String(str || '').replace(/[\u201C\u201D\u201E\u201F]/g, '"');
}

function tryParseJson(candidate) {
  if (!candidate) return null;
  for (const variant of [candidate, normalizeQuotes(candidate)]) {
    try { return JSON.parse(variant); } catch {}
    const cleaned = variant.replace(/,\s*([}\]])/g, '$1');
    try { return JSON.parse(cleaned); } catch {}
  }
  return null;
}

/** Walks text respecting JSON strings/escapes and extracts every valid {...} skit object. */
function extractBalancedObjects(text) {
  const results = [];
  let inStr = false;
  let escape = false;
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}' && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) {
        const obj = tryParseJson(text.slice(start, i + 1));
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && (obj.line || obj.dialogue || obj.title)) {
          results.push(obj);
        }
        start = -1;
      }
    }
  }
  return results;
}

function extractJsonArray(rawText) {
  let text = normalizeQuotes(String(rawText || '').replace(/^\uFEFF/, '').replace(/[\u200B-\u200D]/g, '').trim());
  if (!text) throw new Error('AI returned an empty response.');

  // 1. Try fenced code blocks first
  const fenceMatches = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  for (const m of fenceMatches) {
    const parsed = tryParseJson(m[1].trim());
    if (Array.isArray(parsed) && parsed.length) return parsed;
    if (parsed && typeof parsed === 'object') {
      const inner = parsed.concepts || parsed.skits || parsed.episodes;
      if (Array.isArray(inner) && inner.length) return inner;
    }
  }

  // 2. Try direct parse of full text
  const direct = tryParseJson(text);
  if (Array.isArray(direct) && direct.length) return direct;
  if (direct && typeof direct === 'object') {
    const inner = direct.concepts || direct.skits || direct.episodes;
    if (Array.isArray(inner) && inner.length) return inner;
  }

  // 3. Find the JSON array starting with `[` followed by `{` (ignoring stray `[1]` or `[Copy]` earlier in DOM)
  const arrStartMatch = text.match(/\[\s*\{/);
  if (arrStartMatch) {
    const start = arrStartMatch.index;
    const end = text.lastIndexOf(']');
    if (end > start) {
      const parsed = tryParseJson(text.slice(start, end + 1));
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  }

  // 4. Fallback: recover every complete balanced `{...}` skit object even if array wrapper had extra UI text or truncation
  const objects = extractBalancedObjects(text);
  if (objects.length) return objects;

  const preview = text.slice(0, 140).replace(/\s+/g, ' ');
  throw new Error(`Could not parse JSON concepts from AI response (preview: "${preview}").`);
}

export function parsePurpleStickConcepts(rawText, { fallbackCategory = 'couple', language = 'en' } = {}) {
  const arr = extractJsonArray(rawText);
  if (!Array.isArray(arr) || !arr.length) throw new Error('AI did not return any concepts.');
  const fallbackCat = VALID_CATS.has(fallbackCategory) ? fallbackCategory : 'couple';
  const lang = normalizeLang(language);
  const langCfg = LANG_CONFIG[lang];

  return arr.map((item, idx) => {
    const cat = VALID_CATS.has(String(item?.cat || '').toLowerCase())
      ? String(item.cat).toLowerCase()
      : fallbackCat;
    let who = Array.isArray(item?.who)
      ? item.who.map(c => String(c || '').trim().toUpperCase()).filter(c => VALID_CHARS.has(c))
      : [];
    who = [...new Set(who)];
    if (who.length < 2) who = DEFAULT_WHO_BY_CAT[cat] || ['PURP_GUY', 'PURP_GIRL'];

    const rawLoc = String(item?.loc || '').trim().toUpperCase();
    const loc = VALID_LOCS.has(rawLoc) ? rawLoc : (DEFAULT_LOC_BY_CAT[cat] || 'LIVING_ROOM');

    const title = String(item?.title || `PurpleStick Skit #${idx + 1} 😂`).trim();
    const hook = String(item?.hook || 'Wait for the punchline!').trim();
    let line = '';
    if (Array.isArray(item?.line)) {
      line = item.line.map(s => String(s || '').trim()).filter(Boolean).join('|');
    } else {
      line = String(item?.line || item?.dialogue || '').trim().replace(/\r?\n+/g, '|');
    }
    if (!line) throw new Error(`Concept "${title}" is missing dialogue lines.`);

    const visual = String(item?.visual || 'Setup -> Twist -> Punchline visual action beats.').trim();
    const reaction = String(item?.reaction || '').trim();
    const sfx = String(item?.sfx || 'Expressive cartoon voices with subtle matching sound effects.').trim();
    let tags = String(item?.tags || langCfg.defaultTags).trim();
    if (!/#purplestick/i.test(tags)) tags = `#PurpleStick ${tags}`;

    return { cat, lang, who, loc, title, hook, line, visual, reaction, sfx, tags };
  });
}
