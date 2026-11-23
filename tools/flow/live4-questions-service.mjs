/**
 * Live 4 Questions Service for `quiz-app-live4-questions` project.
 *
 * Talks directly to Firestore REST API (`loksewa-info` -> `live4_question_banks/main`)
 * with zero SDK/credential overhead, so edits made in `aiprojects` propagate live
 * mid-show to `quiz-app` Live 4 (`loksewasheet`) without disrupting the ongoing question.
 */

export const FIRESTORE_PROJECT_ID = 'loksewa-info';
export const LIVE4_DOC_PATH = 'live4_question_banks/main';
export const LIVE4_DOC_URL =
  `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${LIVE4_DOC_PATH}`;

const VALID_TYPES = new Set(['DIRECT', 'STATEMENTS', 'MATCH', 'ASSERTION', 'SEQUENCE']);
const VALID_INFO_FORMATS = new Set(['fact', 'keywords', 'comparison', 'timeline', 'steps']);

/* ---------------- Firestore REST Value Converters ---------------- */

function fromFirestoreValue(val) {
  if (!val || typeof val !== 'object') return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    const arr = Array.isArray(val.arrayValue?.values) ? val.arrayValue.values : [];
    return arr.map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const out = {};
    const fields = val.mapValue?.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = fromFirestoreValue(v);
    }
    return out;
  }
  return null;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/* ---------------- Normalization ---------------- */

const LETTER_MAP = {
  a: 0, b: 1, c: 2, d: 3,
  '1': 0, '2': 1, '3': 2, '4': 3,
  'क': 0, 'ख': 1, 'ग': 2, 'घ': 3,
  '१': 0, '२': 1, '३': 2, '४': 3
};

function resolveAnswerIndex(rawAns, options) {
  if (typeof rawAns === 'number' && Number.isInteger(rawAns)) {
    if (rawAns >= 0 && rawAns <= 3) return rawAns;
    if (rawAns >= 1 && rawAns <= 4) return rawAns - 1;
  }
  if (typeof rawAns === 'string') {
    const trimmed = rawAns.trim();
    if (!trimmed) return 0;
    const low = trimmed.toLowerCase();
    // Exact single letter/digit like "A", "b)", "(C)", "ख"
    const mLetter = low.match(/^\(?([a-d1-4कखगघ१२३४])\)?[\.\:\-\s]?$/);
    if (mLetter && mLetter[1] in LETTER_MAP) return LETTER_MAP[mLetter[1]];
    // Starts with "A)" or "Option B"
    const mPrefix = low.match(/^(?:option|opt|ans|answer|उत्तर|सही उत्तर)?\s*[\:\-]?\s*\(?([a-dकखगघ])\)?(?:\s|$|[\.\:\-])/);
    if (mPrefix && mPrefix[1] in LETTER_MAP) return LETTER_MAP[mPrefix[1]];
    // Exact or substring match against one of the 4 options
    if (Array.isArray(options)) {
      const exactIdx = options.findIndex(o => o.trim().toLowerCase() === low);
      if (exactIdx >= 0) return exactIdx;
      const containsIdx = options.findIndex(o => {
        const ol = o.trim().toLowerCase();
        return ol.length >= 2 && (low.includes(ol) || ol.includes(low));
      });
      if (containsIdx >= 0) return containsIdx;
    }
  }
  return 0;
}

export function normalizeLive4Question(item, defaults = {}) {
  const q = item && typeof item === 'object' ? item : {};
  const questionText = String(q.questionText ?? q.question ?? q.q ?? '').trim();

  let options = [];
  if (Array.isArray(q.options)) {
    options = q.options.map(o => String(o ?? '').trim());
  } else if (q.A !== undefined || q.a !== undefined || q.optionA !== undefined) {
    options = [
      String(q.A ?? q.a ?? q.optionA ?? '').trim(),
      String(q.B ?? q.b ?? q.optionB ?? '').trim(),
      String(q.C ?? q.c ?? q.optionC ?? '').trim(),
      String(q.D ?? q.d ?? q.optionD ?? '').trim()
    ];
  }
  // Strip accidental "A) " / "क) " prefix from options
  options = options.slice(0, 4).map(o => o.replace(/^\(?[A-Da-dकखगघ]\)?[\.\)\:\-]\s*/, '').trim());
  while (options.length < 4) options.push('');

  const rawCorrect =
    q.correctAnswerIndex !== undefined
      ? q.correctAnswerIndex
      : q.correctIndex !== undefined
        ? q.correctIndex
        : q.answerIndex !== undefined
          ? q.answerIndex
          : q.answer ?? q.correct ?? q.correctAnswer ?? 0;

  const correctAnswerIndex = resolveAnswerIndex(rawCorrect, options);
  const category = String(q.category || defaults.category || 'सामान्य ज्ञान').trim() || 'सामान्य ज्ञान';
  const difficulty = String(q.difficulty || defaults.difficulty || 'Medium').trim() || 'Medium';
  const rawType = String(q.questionType || 'DIRECT').trim().toUpperCase();
  const questionType = VALID_TYPES.has(rawType) ? rawType : 'DIRECT';
  const answerText = options[correctAnswerIndex] || '';
  const rawExplanation = String(q.explanation || q.note || q.reason || '').trim();
  const explanation = rawExplanation || (answerText ? `सही उत्तर: ${answerText}` : 'महत्वपूर्ण लोकसेवा प्रश्न।');

  let extraInformation = Array.isArray(q.extraInformation)
    ? q.extraInformation
        .filter(c => c && typeof c === 'object')
        .map(c => {
          const fmt = String(c.format || 'fact').trim().toLowerCase();
          return {
            format: VALID_INFO_FORMATS.has(fmt) ? fmt : 'fact',
            title: String(c.title || 'मुख्य तथ्य').trim() || 'मुख्य तथ्य',
            content: String(c.content || '').trim()
          };
        })
        .filter(c => c.content.length > 0)
    : [];

  if (extraInformation.length === 0) {
    extraInformation = [
      {
        format: 'fact',
        title: category,
        content: explanation
      }
    ];
  }

  return {
    questionText,
    options,
    correctAnswerIndex,
    category,
    difficulty,
    questionType,
    explanation,
    extraInformation
  };
}

export function validateQuestionList(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('At least 1 valid question is required.');
  }
  const normalized = questions.map((item, idx) => {
    const nq = normalizeLive4Question(item);
    if (!nq.questionText) throw new Error(`Question #${idx + 1} is missing question text.`);
    if (nq.options.some(o => !o)) throw new Error(`Question #${idx + 1} needs all 4 non-empty options (A–D).`);
    if (nq.correctAnswerIndex < 0 || nq.correctAnswerIndex > 3) {
      throw new Error(`Question #${idx + 1} has invalid correct answer index.`);
    }
    return nq;
  });
  return normalized;
}

/* ---------------- Firestore REST Read / Write ---------------- */

export async function fetchLive4Bank() {
  const res = await fetch(LIVE4_DOC_URL, { method: 'GET' });
  if (res.status === 404) {
    return {
      exists: false,
      schemaVersion: 1,
      revision: 0,
      updatedAt: '',
      topicText: '',
      questions: []
    };
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Firestore read failed (${res.status}): ${txt.slice(0, 260)}`);
  }
  const doc = await res.json();
  const fields = doc?.fields || {};
  const schemaVersion = Number(fromFirestoreValue(fields.schemaVersion) || 1);
  const revision = Number(fromFirestoreValue(fields.revision) || 1);
  const updatedAt = String(fromFirestoreValue(fields.updatedAt) || '');
  const topicText = String(fromFirestoreValue(fields.topicText) || '');
  const rawQs = fromFirestoreValue(fields.questions);
  const questions = Array.isArray(rawQs) ? rawQs.map(q => normalizeLive4Question(q)) : [];
  return {
    exists: true,
    schemaVersion,
    revision,
    updatedAt,
    topicText,
    questions
  };
}

export async function saveLive4Bank({ questions, topicText }) {
  const normalized = validateQuestionList(questions);
  let currentRevision = 0;
  let currentTopicText = '';
  try {
    const existing = await fetchLive4Bank();
    if (existing.exists) {
      currentRevision = existing.revision || 0;
      currentTopicText = existing.topicText || '';
    }
  } catch {
    // Proceed with revision 1 if unreadable
  }

  const nextRevision = Math.max(1, currentRevision + 1);
  const updatedAt = new Date().toISOString();
  const finalTopicText = typeof topicText === 'string' ? topicText.trim() : currentTopicText;

  const payload = {
    fields: {
      schemaVersion: toFirestoreValue(1),
      revision: toFirestoreValue(nextRevision),
      updatedAt: toFirestoreValue(updatedAt),
      topicText: toFirestoreValue(finalTopicText),
      questions: toFirestoreValue(normalized)
    }
  };

  const res = await fetch(LIVE4_DOC_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Firestore save failed (${res.status}): ${txt.slice(0, 260)}`);
  }

  return {
    schemaVersion: 1,
    revision: nextRevision,
    updatedAt,
    topicText: finalTopicText,
    count: normalized.length,
    questions: normalized
  };
}

/* ---------------- Copy-Paste Raw Parser ---------------- */

function tryExtractJson(text) {
  const cleaned = String(text || '').trim();
  if (!cleaned) return null;
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : cleaned;
  try {
    return JSON.parse(candidate);
  } catch {
    // Try locating outermost [ ... ] or { ... }
    const arrStart = candidate.indexOf('[');
    const arrEnd = candidate.lastIndexOf(']');
    if (arrStart >= 0 && arrEnd > arrStart) {
      try {
        return JSON.parse(candidate.slice(arrStart, arrEnd + 1));
      } catch { /* ignore */ }
    }
    const objStart = candidate.indexOf('{');
    const objEnd = candidate.lastIndexOf('}');
    if (objStart >= 0 && objEnd > objStart) {
      try {
        return JSON.parse(candidate.slice(objStart, objEnd + 1));
      } catch { /* ignore */ }
    }
  }
  return null;
}

export function parseRawQuestionsText(rawText, defaults = {}) {
  const text = String(rawText || '').replace(/\r\n/g, '\n').trim();
  if (!text) return { questions: [], warnings: ['Input text is empty.'] };

  // 1. Try JSON first
  const parsedJson = tryExtractJson(text);
  if (parsedJson) {
    const arr = Array.isArray(parsedJson)
      ? parsedJson
      : Array.isArray(parsedJson.questions)
        ? parsedJson.questions
        : null;
    if (arr && arr.length > 0) {
      const warnings = [];
      const questions = [];
      arr.forEach((item, idx) => {
        const nq = normalizeLive4Question(item, defaults);
        if (nq.questionText && nq.options.every(Boolean)) {
          questions.push(nq);
        } else {
          warnings.push(`JSON item #${idx + 1} skipped (missing question text or 4 options).`);
        }
      });
      return { questions, warnings, source: 'json' };
    }
  }

  // 2. Smart text / numbered MCQ block parser
  const lines = text.split('\n').map(l => l.trim());
  const questions = [];
  const warnings = [];

  let current = null;
  const flush = () => {
    if (!current) return;
    if (current.questionText && current.options.length >= 2) {
      while (current.options.length < 4) current.options.push(`विकल्प ${current.options.length + 1}`);
      const ansIdx = current.starredIndex >= 0
        ? current.starredIndex
        : resolveAnswerIndex(current.answerRaw, current.options);
      questions.push(
        normalizeLive4Question(
          {
            questionText: current.questionText,
            options: current.options.slice(0, 4),
            correctAnswerIndex: ansIdx,
            explanation: current.explanation,
            category: defaults.category || 'सामान्य ज्ञान',
            difficulty: defaults.difficulty || 'Medium'
          },
          defaults
        )
      );
    } else if (current.questionText) {
      warnings.push(`Skipped incomplete block: "${current.questionText.slice(0, 50)}"`);
    }
    current = null;
  };

  const optLineRe = /^\(?([A-Da-dकखगघ])\)?[\.\)\:\-]\s*(.+)$/;
  const ansLineRe = /^(?:ans(?:wer)?|correct(?:\s*answer)?|उत्तर|सही\s*उत्तर)\s*[\:\-\=]\s*(.+)$/i;
  const expLineRe = /^(?:exp(?:lanation)?|note|व्याख्या|नोट|विवरण)\s*[\:\-\=]\s*(.+)$/i;
  const qStartRe = /^(?:Q\.?\s*\d+|\d+|[०-९]+|प्रश्न\s*(?:नं\.?|नम्बर)?\s*[\d०-९]+)[\.\)\:\-\s]+(.+)$/i;

  for (const line of lines) {
    if (!line) {
      if (current && current.options.length >= 4) flush();
      continue;
    }

    // Check answer line
    const ansMatch = line.match(ansLineRe);
    if (ansMatch && current) {
      current.answerRaw = ansMatch[1].trim();
      continue;
    }

    // Check explanation line
    const expMatch = line.match(expLineRe);
    if (expMatch && current) {
      current.explanation = expMatch[1].trim();
      continue;
    }

    // Check inline multi-options on a single line like: A) One  B) Two  C) Three  D) Four
    const inlineParts = line.split(/(?=(?:^|\s)\(?[A-Da-dकखगघ]\)?[\.\)\:\-]\s)/).map(s => s.trim()).filter(Boolean);
    if (inlineParts.length >= 2 && inlineParts.every(p => optLineRe.test(p))) {
      if (!current) current = { questionText: '', options: [], answerRaw: '', explanation: '', starredIndex: -1 };
      for (const part of inlineParts) {
        const m = part.match(optLineRe);
        if (!m) continue;
        let val = m[2].trim();
        const isStarred = /[\*✓✔]|(?:\(correct\)|\(सही\))/i.test(val);
        val = val.replace(/\s*(?:[\*✓✔]|\(correct\)|\(सही\))\s*/gi, '').trim();
        if (isStarred) current.starredIndex = current.options.length;
        current.options.push(val);
      }
      continue;
    }

    // Check single option line
    const optMatch = line.match(optLineRe);
    if (optMatch && current) {
      let val = optMatch[2].trim();
      const isStarred = /[\*✓✔]|(?:\(correct\)|\(सही\))/i.test(val);
      val = val.replace(/\s*(?:[\*✓✔]|\(correct\)|\(सही\))\s*/gi, '').trim();
      if (isStarred) current.starredIndex = current.options.length;
      current.options.push(val);
      continue;
    }

    // New numbered question or question line after options
    const qMatch = line.match(qStartRe);
    if (qMatch) {
      if (current && (current.options.length > 0 || current.questionText)) flush();
      current = {
        questionText: qMatch[1].trim(),
        options: [],
        answerRaw: '',
        explanation: '',
        starredIndex: -1
      };
      continue;
    }

    // Unnumbered line: either starts a new question (if previous already has options) or continues question text
    if (!current || current.options.length > 0) {
      flush();
      current = {
        questionText: line,
        options: [],
        answerRaw: '',
        explanation: '',
        starredIndex: -1
      };
    } else {
      current.questionText = `${current.questionText}\n${line}`;
    }
  }
  flush();

  return { questions, warnings, source: 'text' };
}

/* ---------------- AI Prompts (Claude Browser / Gemini Browser) ---------------- */

const QUESTION_TYPES_ORDER = ['DIRECT', 'STATEMENTS', 'MATCH', 'ASSERTION', 'SEQUENCE'];
const OTHER_TYPES_ORDER = ['STATEMENTS', 'MATCH', 'ASSERTION', 'SEQUENCE'];

const MAX_GEN_QUESTIONS = 100;

export function computeDefaultTypeCounts(totalCount = 10) {
  const safeTotal = Math.max(1, Math.min(MAX_GEN_QUESTIONS, Number(totalCount) || 10));
  const direct = Math.round(safeTotal * 0.6);
  const rem = Math.max(0, safeTotal - direct);
  const counts = { DIRECT: direct, STATEMENTS: 0, MATCH: 0, ASSERTION: 0, SEQUENCE: 0 };
  for (let i = 0; i < rem; i++) {
    counts[OTHER_TYPES_ORDER[i % OTHER_TYPES_ORDER.length]] += 1;
  }
  return counts;
}

function normalizeTypeCounts(rawTypeCounts, fallbackCount = 10) {
  if (!rawTypeCounts || typeof rawTypeCounts !== 'object') {
    return computeDefaultTypeCounts(fallbackCount);
  }
  const counts = { DIRECT: 0, STATEMENTS: 0, MATCH: 0, ASSERTION: 0, SEQUENCE: 0 };
  let sum = 0;
  for (const t of QUESTION_TYPES_ORDER) {
    const n = Math.max(0, Math.min(MAX_GEN_QUESTIONS, Math.floor(Number(rawTypeCounts[t]) || 0)));
    counts[t] = n;
    sum += n;
  }
  if (sum <= 0) return computeDefaultTypeCounts(fallbackCount);
  // Cap total at MAX_GEN_QUESTIONS while preserving ratios as cleanly as possible
  if (sum > MAX_GEN_QUESTIONS) {
    let excess = sum - MAX_GEN_QUESTIONS;
    for (const t of QUESTION_TYPES_ORDER) {
      if (excess <= 0) break;
      const cut = Math.min(counts[t], excess);
      counts[t] -= cut;
      excess -= cut;
    }
  }
  return counts;
}

export function buildLive4GeneratePrompt({
  topic = 'नेपाल र विश्व सामान्य ज्ञान (Loksewa GK)',
  language = 'Nepali',
  count = 10,
  difficulty = 'Medium',
  typeCounts = null,
  diverseFields = true,
  seedContent = '',
  existingQuestions = []
}) {
  const normalizedTypes = normalizeTypeCounts(typeCounts, count);
  const safeCount = QUESTION_TYPES_ORDER.reduce((acc, t) => acc + normalizedTypes[t], 0);
  const trimmedSeed = String(seedContent || '').trim().slice(0, 12000);
  const seedBlock = trimmedSeed
    ? `\nUSER-PROVIDED QUESTIONS / FACTS / NOTES (PRIORITY INPUT):
The user provided the following questions, facts, or notes below.
- PRIORITY: Use and incorporate the user's provided questions/facts FIRST, converting or adapting them cleanly into the required JSON schema and designated questionType formats (DIRECT, STATEMENTS, MATCH, ASSERTION, SEQUENCE) with 4 plausible options, verified answer, and 1-line explanation.
- If the user provided raw facts or notes rather than finished MCQs, craft exam-grade MCQs from them (using STATEMENTS, MATCH, ASSERTION, or SEQUENCE where suitable).
- If the user's material is NOT enough to reach ${safeCount} questions (or does not fill every requested questionType), generate your own fresh, high-accuracy, diverse questions to fill the remaining slots so the final output contains EXACTLY ${safeCount} questions matching the required breakdown.
- Fact-check any user-provided answers; if there is an obvious factual error, correct it and explain briefly in "explanation".
---
${trimmedSeed}
---\n`
    : '';
  const avoidList = Array.isArray(existingQuestions) && existingQuestions.length
    ? `\nDO NOT repeat or paraphrase any of these already-queued questions:\n${existingQuestions
        .slice(-30)
        .map((q, i) => `${i + 1}. ${String(q.questionText || q || '').slice(0, 120)}`)
        .join('\n')}\n`
    : '';

  const typeLines = QUESTION_TYPES_ORDER
    .filter(t => normalizedTypes[t] > 0)
    .map(t => `  * ${t}: EXACTLY ${normalizedTypes[t]} question(s)`)
    .join('\n');

  const formatGuideParts = [];
  if (normalizedTypes.DIRECT > 0) {
    formatGuideParts.push(`  - DIRECT: Concise, direct 1-2 line factual MCQ.`);
  }
  if (normalizedTypes.STATEMENTS > 0) {
    formatGuideParts.push(`  - STATEMENTS: Present 2 short numbered statements (1. ... \\n2. ...) and ask which statement(s) are true/false, with 4 clear options (e.g. "१ मात्र सही", "२ मात्र सही", "दुवै सही", "दुवै गलत" in Nepali, or English equivalents).`);
  }
  if (normalizedTypes.MATCH > 0) {
    formatGuideParts.push(`  - MATCH: Compact 3-pair or 4-pair matching (Group A vs Group B) formatted cleanly in short lines inside questionText, with 4 code-combination options (e.g. "a-2, b-1, c-3" / "क-२, ख-१, ग-३").`);
  }
  if (normalizedTypes.ASSERTION > 0) {
    formatGuideParts.push(`  - ASSERTION: Short Assertion (A) and Reason (R) (e.g. "कथन (A): ... \\nकारण (R): ...") with 4 standard evaluation options.`);
  }
  if (normalizedTypes.SEQUENCE > 0) {
    formatGuideParts.push(`  - SEQUENCE: Ask to arrange 3-4 short events/places/items in correct chronological, geographical, or ascending/descending order, with 4 ordering options.`);
  }

  const diversityRule = diverseFields !== false
    ? `- Field Diversity (IMPORTANT): Spread the ${safeCount} questions across DIVERSE fields — cover a broad mix of Nepal Geography (नेपालको भूगोल), Nepal History (इतिहास), Constitution & Polity (संविधान र शासन), Economy (अर्थतन्त्र), Science & Tech (विज्ञान र प्रविधि), Culture & Literature (संस्कृति/साहित्य), World Geography (विश्व भूगोल), International Organizations/UN (अन्तर्राष्ट्रिय सम्बन्ध), and Current Affairs/Sports/Awards (समसामयिक/खेलकुद) within the requested topic. Do NOT cluster multiple questions on the same narrow subtopic, and set an accurate specific "category" for each question.`
    : `- Set an accurate specific "category" for each question matching the topic.`;

  return `You are a senior Nepal Loksewa Aayog & GK exam question author.
Generate EXACTLY ${safeCount} high-accuracy, engaging, exam-grade multiple-choice questions for a live YouTube Loksewa quiz show.

Requirements:
- Topic / Focus: ${topic}
- Language: ${language} (if Nepali, use clean natural Devanagari script; if English, use crisp English)
- Difficulty: ${difficulty}
- REQUIRED Question Type Breakdown (strictly follow these exact counts and set each item's "questionType" field accordingly):
${typeLines}
- How to format each questionType (keep every question mobile-readable & compact):
${formatGuideParts.join('\n')}
${diversityRule}
- Every question MUST have a 100% factually verified, unambiguous correct answer (double-check dates, numbers, geography, constitution articles, and names!).
- Every question MUST have exactly 4 distinct plausible options.
- Distribute correctAnswerIndex (0, 1, 2, 3) evenly across questions.
- Keep options short and crisp.
- Include a crisp 1-line "explanation" (used as a teacher's blue-pen margin note after answer reveal).
${seedBlock}${avoidList}
Return ONLY valid JSON (no markdown commentary outside JSON) in this exact format:
{
  "topicText": "Short banner title for this live show",
  "questions": [
    {
      "questionText": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 1,
      "category": "भूगोल",
      "difficulty": "${difficulty}",
      "questionType": "DIRECT | STATEMENTS | MATCH | ASSERTION | SEQUENCE",
      "explanation": "Concise 1-line factual reason.",
      "extraInformation": [
        { "format": "fact", "title": "मुख्य तथ्य", "content": "One useful exam memory fact." }
      ]
    }
  ]
}`;
}

export function buildLive4FormatPrompt(rawText, { language = 'Nepali', category = 'सामान्य ज्ञान', difficulty = 'Medium' } = {}) {
  return `You are a strict quiz data formatter for a Nepal Loksewa live quiz show.
Convert the pasted raw text below into clean, valid JSON matching the exact Live 4 schema.

Rules:
- Extract EVERY question from the pasted text.
- If a question has fewer than 4 options or is a Q&A pair without distractors, create plausible exam-grade distractors so every question has EXACTLY 4 options.
- Verify the correct answer index (0=A, 1=B, 2=C, 3=D). If the pasted text has an obvious factual typo in the answer key, fix it!
- Keep the original language of each question (default ${language}).
- Add a concise 1-line "explanation" for each question.

Return ONLY valid JSON:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswerIndex": 0,
      "category": "${category}",
      "difficulty": "${difficulty}",
      "questionType": "DIRECT",
      "explanation": "...",
      "extraInformation": [{ "format": "fact", "title": "तथ्य", "content": "..." }]
    }
  ]
}

RAW PASTED TEXT:
${String(rawText || '').slice(0, 18000)}`;
}

export function parseLive4GeneratedResponse(rawText, defaults = {}) {
  const parsed = tryExtractJson(rawText);
  if (!parsed) {
    // Fallback to raw text parser in case AI returned plain numbered MCQs
    const fallback = parseRawQuestionsText(rawText, defaults);
    if (fallback.questions.length > 0) {
      return {
        topicText: '',
        questions: fallback.questions,
        warnings: fallback.warnings
      };
    }
    throw new Error('Could not parse JSON or MCQs from AI response.');
  }
  const arr = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.questions)
      ? parsed.questions
      : [];
  const questions = arr
    .map(item => normalizeLive4Question(item, defaults))
    .filter(q => q.questionText && q.options.every(Boolean));
  if (!questions.length) {
    throw new Error('AI response contained 0 valid 4-option questions.');
  }
  return {
    topicText: typeof parsed.topicText === 'string' ? parsed.topicText.trim() : '',
    questions,
    warnings: []
  };
}

export function buildLive4VerifyPrompt(questions) {
  const compact = (Array.isArray(questions) ? questions : []).map((q, i) => ({
    index: i,
    questionText: q.questionText,
    options: q.options,
    correctAnswerIndex: q.correctAnswerIndex,
    explanation: q.explanation || ''
  }));

  return `You are a strict Nepal Loksewa & General Knowledge fact-checker.
Carefully fact-check EVERY question below:
1. Is the marked correctAnswerIndex (0=A, 1=B, 2=C, 3=D) 100% factually correct?
2. Are there duplicate options, ambiguous wording, outdated facts, or spelling/factual errors in the question or explanation?

For each question, return status:
- "ok": 100% accurate and clear
- "fix": factual error, wrong answer key, duplicate option, or typo (MUST include "fixedQuestion" with corrected fields!)
- "warn": mostly okay but slightly ambiguous or needs minor note (optionally include "fixedQuestion")

Return ONLY valid JSON:
{
  "summary": "Brief 1-sentence overall verdict",
  "results": [
    {
      "index": 0,
      "status": "ok",
      "issue": "Verified accurate."
    },
    {
      "index": 1,
      "status": "fix",
      "issue": "Explain the exact factual error and correction.",
      "fixedQuestion": {
        "questionText": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswerIndex": 2,
        "explanation": "..."
      }
    }
  ]
}

QUESTIONS TO FACT-CHECK:
${JSON.stringify(compact, null, 2)}`;
}

export function parseLive4VerifyResponse(rawText, originalQuestions = []) {
  const parsed = tryExtractJson(rawText);
  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error('Could not parse fact-check JSON from AI response.');
  }
  const results = parsed.results
    .filter(r => r && typeof r === 'object' && Number.isInteger(Number(r.index)))
    .map(r => {
      const idx = Number(r.index);
      const orig = originalQuestions[idx] || {};
      const statusRaw = String(r.status || 'ok').toLowerCase();
      const status = statusRaw === 'fix' || statusRaw === 'error' ? 'fix' : statusRaw === 'warn' ? 'warn' : 'ok';
      let fixedQuestion = null;
      if (r.fixedQuestion && typeof r.fixedQuestion === 'object') {
        fixedQuestion = normalizeLive4Question(
          {
            ...orig,
            ...r.fixedQuestion
          },
          { category: orig.category, difficulty: orig.difficulty }
        );
      }
      return {
        index: idx,
        status,
        issue: String(r.issue || r.note || '').trim(),
        fixedQuestion
      };
    });

  return {
    summary: String(parsed.summary || '').trim(),
    results
  };
}
