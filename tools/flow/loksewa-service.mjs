import fs from 'node:fs';
import path from 'node:path';
import { callGeminiText } from './explainer-service.mjs';

export function sanitizeSetId(raw) {
  const cleaned = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || 'custom-set';
}

export function sanitizeImageFile(raw) {
  const base = path.basename(String(raw || '').trim())
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^_+/, '')
    .slice(0, 100);
  if (!base || base === '.' || base === '..') {
    throw new Error('A valid image filename is required.');
  }
  return /\.(png|jpe?g|webp)$/i.test(base) ? base : `${base}.jpg`;
}

export function loksewaRoot(root) {
  return path.join(root, 'projects', 'loksewa-sheet');
}

export function loksewaImagesDir(root, setId) {
  return path.join(loksewaRoot(root), 'images', sanitizeSetId(setId));
}

export function loksewaVideosDir(root) {
  return path.join(loksewaRoot(root), 'videos');
}

/**
 * Normalizes a Hugging Face Space URL into the direct `.hf.space/<endpointPath>` API URL.
 * Accepts:
 *   - https://huggingface.co/spaces/mukeshpokharel/explanation-demo
 *   - https://mukeshpokharel-explanation-demo.hf.space
 *   - https://mukeshpokharel-explanation-demo.hf.space/texttovideo-loksewa
 *   - https://mukeshpokharel-explanation-demo.hf.space/texttovideo-loksewa-kinetic
 *   - http://127.0.0.1:7860
 */
export function resolveLoksewaEndpoint(rawUrl, endpointPath = '/texttovideo-loksewa') {
  const targetPath = String(endpointPath || '/texttovideo-loksewa').startsWith('/')
    ? String(endpointPath || '/texttovideo-loksewa')
    : `/${endpointPath}`;
  let s = String(rawUrl || '').trim();
  if (!s) {
    s = 'https://huggingface.co/spaces/mukeshpokharel/explanation-demo';
  }
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  const u = new URL(s);
  if (/^(www\.)?huggingface\.co$/i.test(u.hostname)) {
    const m = u.pathname.match(/^\/spaces\/([^/]+)\/([^/]+)/i);
    if (!m) {
      throw new Error('Invalid Hugging Face Space URL. Expected https://huggingface.co/spaces/<owner>/<space>');
    }
    const owner = m[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const space = m[2].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `https://${owner}-${space}.hf.space${targetPath}`;
  }
  const basePath = u.pathname
    .replace(/\/+$/, '')
    .replace(/\/(?:texttovideo-[a-z0-9_-]+|client-manifest)$/i, '');
  return `${u.origin}${basePath}${targetPath}`;
}

export async function fetchLoksewaManifest(spaceUrl, bearerToken = '') {
  const endpoint = resolveLoksewaEndpoint(spaceUrl, '/client-manifest');
  const token = String(bearerToken || '').trim();
  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
  }
  const response = await fetch(endpoint, {
    method: 'GET',
    headers,
    signal: AbortSignal.timeout(30 * 1000)
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Manifest fetch failed (HTTP ${response.status}): ${errText.slice(0, 300) || response.statusText}`);
  }
  const manifest = await response.json();
  if (!manifest || !Array.isArray(manifest.endpoints)) {
    throw new Error('Server returned an invalid /client-manifest payload.');
  }
  return { ok: true, endpoint, manifest };
}

export function listLoksewaImages(root, setId) {
  const safeSet = sanitizeSetId(setId);
  const dir = loksewaImagesDir(root, safeSet);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && /\.(png|jpe?g|webp)$/i.test(e.name))
    .map(e => {
      const full = path.join(dir, e.name);
      const st = fs.statSync(full);
      return {
        name: e.name,
        url: `/projects/loksewa-sheet/images/${encodeURIComponent(safeSet)}/${encodeURIComponent(e.name)}`,
        size: st.size,
        mtimeMs: st.mtimeMs
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function buildDefaultReelsCaptionFromFilename(name) {
  const clean = String(name || '').replace(/\.mp4$/i, '');
  if (clean.startsWith('kinetic_')) {
    return [
      '⚡ Quick Visual Explainer — Watch till the end! ✨',
      '',
      'Which point surprised you the most? Comment below 👇',
      'Save & follow for more bite-sized knowledge daily!',
      '',
      '#facts #knowledge #shorts #reels #tiktok #viral #nepal #learning'
    ].join('\n');
  }
  return [
    '📝 Loksewa & GK Quick Test — कति वटा मिलाउनुभयो? 🎯',
    '',
    'आफ्नो स्कोर कमेन्टमा लेख्नुहोस् 👇',
    'दैनिक लोकसेवा र सामान्यज्ञानको लागि Follow / Save गर्नुहोस्!',
    '',
    '#loksewa #nepal #gk #quiz #loksewaexam #nepali #reels #tiktok #shorts'
  ].join('\n');
}

function buildLoksewaReelsCaption({ title, part_label, questions = [] }) {
  const sampleQ = questions[0]?.question || '';
  const isNepali = /[\u0900-\u097F]/.test(`${title || ''} ${sampleQ}`);
  const count = questions.length;
  if (isNepali) {
    return [
      `📝 ${title || 'लोकसेवा सामान्यज्ञान MCQs'}${part_label ? ` (${part_label})` : ''} 🎯`,
      sampleQ ? `❓ ${sampleQ}` : '',
      `🔥 जम्मा ${count} महत्वपूर्ण प्रश्नहरू — तपाईंले कति वटा मिलाउनुभयो? कमेन्टमा लेख्नुहोस् 👇`,
      'दैनिक लोकसेवा तयारी र GK भिडियोको लागि Follow & Save गर्नुहोस्!',
      '',
      '#loksewa #loksewanepal #gknepal #nepali #quiz #pscnepal #loksewaexam #reels #tiktoknepal #shorts'
    ].filter(Boolean).join('\n');
  }
  return [
    `🧠 ${title || 'General Knowledge MCQ Challenge'}${part_label ? ` · ${part_label}` : ''} 🎯`,
    sampleQ ? `❓ ${sampleQ}` : '',
    `🔥 ${count} quick questions — how many did you score? Drop your score below 👇`,
    'Save & follow for daily brain-boosting GK quizzes!',
    '',
    '#gk #quiz #trivia #generalknowledge #quiztime #reels #tiktok #shorts #viral'
  ].filter(Boolean).join('\n');
}

function buildKineticReelsCaption({ title, hook, slides = [] }) {
  const isNepali = /[\u0900-\u097F]/.test(`${title || ''} ${hook || ''}`);
  const pts = slides.slice(0, 3).map(s => s.heading).filter(Boolean);
  if (isNepali) {
    return [
      `⚡ ${title || 'रोचक जानकारी'} ✨`,
      hook ? hook : '',
      pts.length ? `👉 ${pts.join(' · ')}...` : '',
      'तपाईंलाई कुन कुरा सबैभन्दा मन पर्‍यो? कमेन्टमा लेख्नुहोस् 👇',
      'यस्तै रोचक भिडियोका लागि Follow & Save गर्नुहोस्!',
      '',
      '#nepal #nepali #facts #knowledge #reels #tiktoknepal #shorts #viral'
    ].filter(Boolean).join('\n');
  }
  return [
    `⚡ ${title || 'Must-Know Facts'} ✨`,
    hook ? hook : '',
    pts.length ? `👉 ${pts.join(' · ')}...` : '',
    'Which one amazed you the most? Comment below 👇',
    'Save & follow for more crisp visual explainers!',
    '',
    '#facts #knowledge #didyouknow #learning #reels #tiktok #shorts #viral'
  ].filter(Boolean).join('\n');
}

function captionFileForVideo(videoPath) {
  return `${videoPath}.caption.txt`;
}

export function listLoksewaVideos(root) {
  const dir = loksewaVideosDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isFile() && /\.mp4$/i.test(e.name))
    .map(e => {
      const full = path.join(dir, e.name);
      const st = fs.statSync(full);
      const capPath = captionFileForVideo(full);
      let caption = '';
      if (fs.existsSync(capPath)) {
        try { caption = fs.readFileSync(capPath, 'utf8').trim(); } catch {}
      }
      if (!caption) caption = buildDefaultReelsCaptionFromFilename(e.name);
      return {
        name: e.name,
        url: `/projects/loksewa-sheet/videos/${encodeURIComponent(e.name)}`,
        size: st.size,
        mtimeMs: st.mtimeMs,
        caption
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

export function saveUploadedLoksewaImage(root, setId, filename, dataUrl) {
  const safeSet = sanitizeSetId(setId);
  const safeFile = sanitizeImageFile(filename);
  const raw = String(dataUrl || '').trim();
  const match = raw.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  const b64 = match ? match[2] : raw;
  const buf = Buffer.from(b64, 'base64');
  if (!buf || buf.length < 64) {
    throw new Error('Uploaded image data is empty or invalid.');
  }
  const dir = loksewaImagesDir(root, safeSet);
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, safeFile);
  fs.writeFileSync(outPath, buf);
  return {
    name: safeFile,
    url: `/projects/loksewa-sheet/images/${encodeURIComponent(safeSet)}/${encodeURIComponent(safeFile)}`,
    size: buf.length,
    mtimeMs: Date.now()
  };
}

export function deleteLoksewaImage(root, setId, filename) {
  const safeSet = sanitizeSetId(setId);
  const safeFile = sanitizeImageFile(filename);
  const full = path.join(loksewaImagesDir(root, safeSet), safeFile);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    return { deleted: true, name: safeFile };
  }
  return { deleted: false, name: safeFile };
}

export function deleteLoksewaVideo(root, filename) {
  const base = path.basename(String(filename || '').trim());
  if (!base || !/\.mp4$/i.test(base) || base.includes('..')) {
    throw new Error('A valid .mp4 video filename is required.');
  }
  const full = path.join(loksewaVideosDir(root), base);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    const capPath = captionFileForVideo(full);
    if (fs.existsSync(capPath)) { try { fs.unlinkSync(capPath); } catch {} }
    return { deleted: true, name: base };
  }
  return { deleted: false, name: base };
}

export function deleteAllLoksewaVideos(root) {
  const dir = loksewaVideosDir(root);
  if (!fs.existsSync(dir)) return { deletedCount: 0 };
  let deletedCount = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && /\.mp4$/i.test(entry.name)) {
      const full = path.join(dir, entry.name);
      fs.unlinkSync(full);
      const capPath = captionFileForVideo(full);
      if (fs.existsSync(capPath)) { try { fs.unlinkSync(capPath); } catch {} }
      deletedCount += 1;
    }
  }
  return { deletedCount };
}

export function readLoksewaImageAsDataUrl(root, setId, filename) {
  if (!filename) return null;
  const safeSet = sanitizeSetId(setId);
  const safeFile = sanitizeImageFile(filename);
  const full = path.join(loksewaImagesDir(root, safeSet), safeFile);
  if (!fs.existsSync(full)) return null;
  const buf = fs.readFileSync(full);
  if (!buf || buf.length < 64) return null;
  const ext = path.extname(safeFile).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function parseGeminiQuestionsJson(rawText) {
  const cleaned = String(rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();

  // 1. Standard JSON parse attempt (with trailing comma cleanup)
  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const candidates = [objMatch ? objMatch[0] : cleaned, cleaned];
  for (const cand of candidates) {
    try {
      const fixed = cand.replace(/,\s*([}\]])/g, '$1');
      const parsed = JSON.parse(fixed);
      const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.questions) ? parsed.questions : []);
      if (list.length) {
        return { bannerTitle: String(parsed?.bannerTitle || '').trim(), list };
      }
    } catch { /* try recovery */ }
  }

  // 2. Truncation recovery: extract bannerTitle and every complete {...} item inside "questions":[...]
  const titleMatch = cleaned.match(/"bannerTitle"\s*:\s*"([^"]+)"/);
  const bannerTitle = titleMatch ? titleMatch[1].trim() : '';
  const qArrStart = cleaned.indexOf('[');
  if (qArrStart === -1) {
    throw new Error('Gemini returned malformed JSON. Please try again.');
  }
  const recovered = [];
  let inStr = false;
  let esc = false;
  let depth = 0;
  let objStart = -1;
  for (let i = qArrStart + 1; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && objStart >= 0) {
        const chunk = cleaned.slice(objStart, i + 1).replace(/,\s*([}\]])/g, '$1');
        try {
          const item = JSON.parse(chunk);
          if (item && item.question) recovered.push(item);
        } catch { /* skip broken item */ }
        objStart = -1;
      }
    }
  }
  if (!recovered.length) {
    throw new Error('Gemini output was truncated before completing any question. Try a smaller count or retry.');
  }
  return { bannerTitle, list: recovered };
}

export function buildLoksewaGeneratePrompt({ topic, language = 'nepali', count = 4, difficulty = 'medium' }) {
  const cleanTopic = String(topic || '').trim();
  if (cleanTopic.length < 2) {
    throw new Error('Please enter a topic to generate questions.');
  }
  const n = Math.max(1, Math.min(25, Number(count) || 4));
  const langLabel =
    language === 'english'
      ? 'English'
      : (language === 'bilingual'
        ? 'Mixed Nepali (Devanagari) and English'
        : 'Nepali (Devanagari script)');

  return [
    `You are an expert Loksewa (Nepal Public Service Commission) & General Knowledge quiz author.`,
    `Generate exactly ${n} accurate, engaging, verified multiple-choice questions on the topic: "${cleanTopic}".`,
    `Language: ${langLabel}. Difficulty: ${difficulty}.`,
    `Rules:`,
    `- Each question must be concise (1 short sentence) and factually 100% accurate.`,
    `- Provide exactly 4 concise options in "options" (no "A)" or "1." prefixes).`,
    `- "answer" MUST exactly match one of the 4 strings in "options".`,
    `- "imagePrompt" MUST be a short English visual scene description (8-16 words only, NO boilerplate) for a realistic photograph representing the question topic without revealing text.`,
    `- Provide a short "bannerTitle" in ${langLabel} (max 38 characters).`,
    `- Do NOT put double quotes inside values; use single quotes if needed.`,
    `Return ONLY compact valid JSON using plain ASCII double quotes (no markdown fences, no extra text):`,
    `{"bannerTitle":"...","questions":[{"question":"...","options":["...","...","...","..."],"answer":"...","imagePrompt":"..."}]}`
  ].join('\n');
}

export function normalizeGeneratedLoksewaQuestions(rawText, { topic, language = 'nepali', count = 4 }) {
  const cleanTopic = String(topic || '').trim();
  const n = Math.max(1, Math.min(25, Number(count) || 4));
  const { bannerTitle, list } = parseGeminiQuestionsJson(rawText);
  if (!list.length) {
    throw new Error('AI returned no questions. Please try again.');
  }

  const normalized = list.slice(0, n).map((item, idx) => {
    const qText = String(item?.question || '').trim();
    const opts = Array.isArray(item?.options)
      ? item.options.map(o => String(o || '').replace(/^[A-Da-d1-4][\)\.\:\-\s]+/, '').trim()).filter(Boolean)
      : [];
    let ans = String(item?.answer || '').replace(/^[A-Da-d1-4][\)\.\:\-\s]+/, '').trim();
    if (!opts.includes(ans) && opts.length >= 4) {
      const idxMatch = opts.findIndex(o => o.toLowerCase() === ans.toLowerCase());
      if (idxMatch >= 0) ans = opts[idxMatch];
      else opts[0] = ans || opts[0];
    }
    while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
    const rawVisual = String(item?.imagePrompt || '').trim();
    const imagePrompt = rawVisual
      ? (/ultra-realistic|photograph/i.test(rawVisual)
        ? rawVisual
        : `Ultra-realistic DSLR editorial photograph of ${rawVisual.replace(/\.$/, '')}, natural lighting, crisp sharp focus, shallow depth of field, centered subject, no text, no letters, no numbers, no watermark`)
      : `Ultra-realistic DSLR editorial photograph representing ${cleanTopic} quiz item ${idx + 1}, natural lighting, crisp sharp focus, shallow depth of field, centered subject, no text, no letters, no numbers, no watermark`;
    return {
      question: qText,
      options: opts.slice(0, 4),
      answer: ans || opts[0],
      imagePrompt
    };
  }).filter(q => q.question && q.answer);

  if (!normalized.length) {
    throw new Error('Could not parse valid questions from AI output.');
  }

  return {
    bannerTitle: bannerTitle || (language === 'english' ? `${cleanTopic} · GK Quiz` : `${cleanTopic} · सामान्यज्ञान`),
    questions: normalized
  };
}

/**
 * Generates structured Loksewa / GK MCQs with tailored Google Flow image prompts using Gemini API.
 */
export async function generateLoksewaQuestionsWithGemini({ topic, language = 'nepali', count = 4, difficulty = 'medium' }) {
  const prompt = buildLoksewaGeneratePrompt({ topic, language, count, difficulty });
  const rawText = await callGeminiText(prompt);
  return normalizeGeneratedLoksewaQuestions(rawText, { topic, language, count });
}

/**
 * Proxies the Loksewa Sheet payload + base64-encoded Flow images to the user's
 * Hugging Face Space `/texttovideo-loksewa` or `/texttovideo-loksewa-kinetic`
 * endpoint with optional Bearer token, saves the returned MP4 locally, and returns its local URL.
 */
export async function sendLoksewaToServer(root, payload) {
  const isKinetic = String(payload.endpointMode || '').trim().toLowerCase() === 'kinetic';
  const rawCustomPath = typeof payload.endpointPath === 'string' && payload.endpointPath.trim()
    ? payload.endpointPath.trim()
    : (isKinetic ? '/texttovideo-loksewa-kinetic' : '/texttovideo-loksewa');
  const endpointPath = rawCustomPath.startsWith('/') ? rawCustomPath : `/${rawCustomPath}`;
  const endpoint = resolveLoksewaEndpoint(payload.spaceUrl, endpointPath);
  const token = String(payload.bearerToken || '').trim();
  const safeSet = sanitizeSetId(payload.setId);
  const rawQuestions = Array.isArray(payload.questions) ? payload.questions : [];
  if (!rawQuestions.length) {
    throw new Error('At least one question is required.');
  }

  let clientImagesSent = 0;
  const serverQuestions = rawQuestions.map((q, idx) => {
    let imageBase64 = typeof q.image_base64 === 'string' && q.image_base64.trim() ? q.image_base64.trim() : null;
    if (!imageBase64 && q.imageFile) {
      imageBase64 = readLoksewaImageAsDataUrl(root, safeSet, q.imageFile);
    }
    if (imageBase64) clientImagesSent += 1;

    return {
      question: String(q.question || '').trim(),
      answer: String(q.answer || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(o => String(o || '').trim()).filter(Boolean) : undefined,
      ...(imageBase64 ? { image_base64: imageBase64 } : {}),
      ...(q.image_url ? { image_url: String(q.image_url).trim() } : {})
    };
  });

  for (let i = 0; i < serverQuestions.length; i += 1) {
    if (!serverQuestions[i].question || !serverQuestions[i].answer) {
      throw new Error(`Question ${i + 1} is missing question text or answer.`);
    }
  }

  const extraParams = (payload.extraParams && typeof payload.extraParams === 'object' && !Array.isArray(payload.extraParams))
    ? payload.extraParams
    : {};

  const reqBody = {
    questions: serverQuestions,
    title: payload.title || undefined,
    part_label: payload.part_label || undefined,
    countdown_seconds: Number(payload.countdown_seconds) || 5.0,
    playback_speed: Number(payload.playback_speed) || 1.0,
    voice: payload.voice || 'Kore',
    ...(isKinetic
      ? { theme: String(payload.theme || 'random').trim() || 'random' }
      : {
        design_variant: payload.design_variant || 'hand',
        show_hand_images: payload.show_hand_images !== false,
        use_cloudflare_images: payload.use_cloudflare_images !== false
      }),
    ...extraParams,
    uploadToFacebook: Boolean(payload.uploadToFacebook),
    uploadToYoutube: Boolean(payload.uploadToYoutube),
    schedule: Boolean(payload.schedule),
    ...(payload.pageId ? { pageId: String(payload.pageId).trim() } : {})
  };

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
  }

  console.log(`[loksewa] POST ${endpoint} (${serverQuestions.length} Qs, ${clientImagesSent} client images, auth=${token ? 'yes' : 'no'})`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(reqBody),
    signal: AbortSignal.timeout(10 * 60 * 1000)
  });

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    let errText = '';
    try {
      errText = await response.text();
    } catch {
      errText = '';
    }
    let detail = errText.slice(0, 500);
    try {
      const parsedErr = JSON.parse(errText);
      if (parsedErr?.detail) detail = typeof parsedErr.detail === 'string' ? parsedErr.detail : JSON.stringify(parsedErr.detail);
      else if (parsedErr?.error) detail = String(parsedErr.error);
    } catch { /* plain text */ }
    throw new Error(`HF Space returned HTTP ${response.status}: ${detail || response.statusText}`);
  }

  const arrayBuf = await response.arrayBuffer();
  const buf = Buffer.from(arrayBuf);
  if (buf.length < 1024 || (!contentType.includes('video') && !contentType.includes('octet-stream'))) {
    const preview = buf.toString('utf8', 0, Math.min(buf.length, 400));
    throw new Error(`Unexpected non-video response (${contentType || 'unknown'}): ${preview}`);
  }

  const outDir = loksewaVideosDir(root);
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const rawPrefix = String(payload.outputPrefix || (isKinetic ? 'loksewa_kinetic' : 'loksewa'))
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'loksewa';
  const outName = `${rawPrefix}_${safeSet}_${stamp}.mp4`;
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, buf);
  const caption = buildLoksewaReelsCaption({
    title: reqBody.title,
    part_label: reqBody.part_label,
    questions: serverQuestions
  });
  try { fs.writeFileSync(captionFileForVideo(outPath), caption, 'utf8'); } catch {}

  return {
    ok: true,
    endpoint,
    endpointPath,
    endpointMode: isKinetic ? 'kinetic' : (payload.endpointMode || 'sheet'),
    filename: outName,
    videoUrl: `/projects/loksewa-sheet/videos/${encodeURIComponent(outName)}`,
    size: buf.length,
    caption,
    clientImagesSent,
    totalQuestions: serverQuestions.length
  };
}

/**
 * Builds a strict fact-checking prompt for Claude (via debug Chrome browser)
 * to verify every Loksewa/GK MCQ question, its options, and its marked answer.
 */
export function resolveKineticEndpoint(rawUrl) {
  const lok = resolveLoksewaEndpoint(rawUrl);
  return lok.replace(/\/texttovideo-loksewa$/i, '/texttovideo-kinetic');
}

export function buildKineticScriptPrompt({ topic, language = 'english', count = 5 }) {
  const cleanTopic = String(topic || '').trim();
  if (cleanTopic.length < 2) {
    throw new Error('Please enter a topic for your kinetic explainer video.');
  }
  const n = Math.max(2, Math.min(10, Number(count) || 5));
  const langLabel =
    language === 'nepali'
      ? 'Nepali (Devanagari script)'
      : (language === 'bilingual' ? 'Mixed Nepali (Devanagari) and English' : 'English');

  return [
    `You are a viral short-form scriptwriter who creates hypnotic, simple, clear, high-retention kinetic-typography Shorts/Reels (like "5 Beautiful Things About Nepal").`,
    `Write a ${n}-point informative short video script on: "${cleanTopic}".`,
    `Language: ${langLabel}.`,
    `Rules:`,
    `- Keep the message universal, crystal-clear, simple, and deeply engaging.`,
    `- "title": punchy short title (max 42 chars).`,
    `- "hook": 1-2 short spoken sentences that hook the viewer in 3 seconds.`,
    `- "slides": array of exactly ${n} items. Each item has:`,
    `  - "tag": "${language === 'nepali' ? '०१, ०२...' : '01, 02...'}".`,
    `  - "heading": bold 3-7 word headline.`,
    `  - "narration": 1-2 crisp, clear spoken sentences (14-26 words) synced to visuals.`,
    `  - "highlight": 1-3 exact power words from heading or narration to highlight in the accent color.`,
    `  - "imagePrompt": short 8-16 word English visual scene description for an optional realistic photograph (no boilerplate, no text).`,
    `- "outro": 1 short engaging closing CTA sentence.`,
    `- Do NOT use double quotes inside string values; use single quotes if needed.`,
    `Return ONLY valid compact JSON using plain ASCII double quotes (no markdown fences, no commentary):`,
    `{"title":"...","hook":"...","outro":"...","slides":[{"tag":"01","heading":"...","narration":"...","highlight":"...","imagePrompt":"..."}]}`
  ].join('\n');
}

export function normalizeGeneratedKineticScript(rawText, { topic, language = 'english', count = 5 }) {
  const cleanTopic = String(topic || '').trim();
  const n = Math.max(2, Math.min(10, Number(count) || 5));
  const cleaned = String(rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse((objMatch ? objMatch[0] : cleaned).replace(/,\s*([}\]])/g, '$1'));
  const rawSlides = Array.isArray(parsed?.slides) ? parsed.slides : [];
  if (!rawSlides.length) {
    throw new Error('AI returned no slides. Please try again.');
  }

  const slides = rawSlides.slice(0, n).map((s, idx) => {
    const rawVisual = String(s?.imagePrompt || '').trim();
    const imagePrompt = rawVisual
      ? (/ultra-realistic|photograph/i.test(rawVisual)
        ? rawVisual
        : `Ultra-realistic DSLR editorial photograph of ${rawVisual.replace(/\.$/, '')}, natural lighting, crisp sharp focus, shallow depth of field, centered subject, no text, no letters, no watermark`)
      : `Ultra-realistic DSLR editorial photograph representing ${cleanTopic} point ${idx + 1}, natural lighting, crisp sharp focus, shallow depth of field, no text, no watermark`;
    return {
      tag: String(s?.tag || String(idx + 1).padStart(2, '0')).trim(),
      heading: String(s?.heading || '').trim(),
      narration: String(s?.narration || s?.heading || '').trim(),
      highlight: String(s?.highlight || '').trim(),
      layout: 'auto',
      imagePrompt
    };
  }).filter(s => s.narration);

  return {
    title: String(parsed?.title || cleanTopic).trim(),
    hook: String(parsed?.hook || '').trim(),
    outro: String(parsed?.outro || '').trim(),
    slides
  };
}

export async function generateKineticScriptWithGemini({ topic, language = 'english', count = 5 }) {
  const prompt = buildKineticScriptPrompt({ topic, language, count });
  const rawText = await callGeminiText(prompt);
  return normalizeGeneratedKineticScript(rawText, { topic, language, count });
}

export async function sendKineticToServer(root, payload) {
  const endpoint = resolveKineticEndpoint(payload.spaceUrl);
  const token = String(payload.bearerToken || '').trim();
  const safeSet = sanitizeSetId(payload.setId || 'kinetic');
  const rawSlides = Array.isArray(payload.slides) ? payload.slides : [];
  if (!rawSlides.length) {
    throw new Error('At least one slide is required.');
  }

  let clientImagesSent = 0;
  const serverSlides = rawSlides.map((s, idx) => {
    let imageBase64 = typeof s.image_base64 === 'string' && s.image_base64.trim() ? s.image_base64.trim() : null;
    if (!imageBase64 && s.imageFile) {
      imageBase64 = readLoksewaImageAsDataUrl(root, safeSet, s.imageFile);
    }
    if (imageBase64) clientImagesSent += 1;
    return {
      tag: String(s.tag || String(idx + 1).padStart(2, '0')).trim(),
      heading: String(s.heading || '').trim(),
      narration: String(s.narration || '').trim(),
      highlight: String(s.highlight || '').trim(),
      layout: String(s.layout || 'auto').trim(),
      ...(imageBase64 ? { image_base64: imageBase64 } : {}),
      ...(s.image_url ? { image_url: String(s.image_url).trim() } : {})
    };
  }).filter(s => s.narration);

  const reqBody = {
    title: String(payload.title || 'Viral Explainer').trim(),
    hook: String(payload.hook || '').trim() || undefined,
    outro: String(payload.outro || '').trim() || undefined,
    slides: serverSlides,
    theme: String(payload.theme || 'random').trim(),
    voice: String(payload.voice || 'Kore').trim(),
    playback_speed: Number(payload.playback_speed) || 1.05,
    uploadToFacebook: Boolean(payload.uploadToFacebook),
    uploadToYoutube: Boolean(payload.uploadToYoutube),
    schedule: Boolean(payload.schedule),
    ...(payload.pageId ? { pageId: String(payload.pageId).trim() } : {})
  };

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
  }

  console.log(`[kinetic] POST ${endpoint} (${serverSlides.length} slides, ${clientImagesSent} images, theme=${reqBody.theme})`);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(reqBody),
    signal: AbortSignal.timeout(10 * 60 * 1000)
  });

  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    let detail = errText.slice(0, 500);
    try {
      const parsedErr = JSON.parse(errText);
      if (parsedErr?.detail) detail = typeof parsedErr.detail === 'string' ? parsedErr.detail : JSON.stringify(parsedErr.detail);
    } catch {}
    throw new Error(`HF Space returned HTTP ${response.status}: ${detail || response.statusText}`);
  }

  const buf = Buffer.from(await response.arrayBuffer());
  if (buf.length < 1024 || (!contentType.includes('video') && !contentType.includes('octet-stream'))) {
    throw new Error(`Unexpected non-video response (${contentType || 'unknown'}).`);
  }

  const outDir = loksewaVideosDir(root);
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outName = `kinetic_${safeSet}_${stamp}.mp4`;
  const outPath = path.join(outDir, outName);
  fs.writeFileSync(outPath, buf);
  const caption = buildKineticReelsCaption({
    title: reqBody.title,
    hook: reqBody.hook,
    slides: serverSlides
  });
  try { fs.writeFileSync(captionFileForVideo(outPath), caption, 'utf8'); } catch {}

  return {
    ok: true,
    endpoint,
    filename: outName,
    videoUrl: `/projects/loksewa-sheet/videos/${encodeURIComponent(outName)}`,
    size: buf.length,
    caption,
    clientImagesSent,
    totalSlides: serverSlides.length
  };
}

export function buildClaudeVerifyPrompt(questions = []) {
  const list = Array.isArray(questions) ? questions : [];
  if (!list.length) {
    throw new Error('At least one question is required for verification.');
  }
  const formatted = list.map((q, idx) => {
    const opts = Array.isArray(q.options) ? q.options : [];
    const optStr = opts.map((o, i) => `${['A', 'B', 'C', 'D'][i] || i + 1}) ${String(o || '').trim()}`).join(' | ');
    return `${idx}. Q: ${String(q.question || '').trim()}\n   Options: ${optStr}\n   Marked Answer: ${String(q.answer || '').trim()}`;
  }).join('\n\n');

  return [
    'You are a strict fact-checker for Nepali Loksewa (Nepal Public Service Commission) and General Knowledge MCQ quizzes.',
    'Carefully verify EVERY question below — check exact facts, Nepali B.S./A.D. dates, award winners, geography numbers, science facts, and confirm whether the Marked Answer is 100% factually correct.',
    'If a question has a factual error, wrong marked answer, outdated/incorrect year, or missing true answer among the options, provide the exact correction.',
    '',
    'Questions to verify:',
    formatted,
    '',
    'Return ONLY a valid JSON array using plain ASCII double quotes (no smart/curly quotes, no markdown fences, no extra prose outside JSON) with ONE object per question in the exact same 0-based order:',
    '[',
    '  {',
    '    "index": 0,',
    '    "status": "correct" | "wrong" | "ambiguous",',
    '    "correctedQuestion": "only include if question text itself needs correction, otherwise empty string",',
    '    "correctedOptions": ["opt1", "opt2", "opt3", "opt4"], // only include if options need fixing, otherwise omit or []',
    '    "correctedAnswer": "exact correct answer string (must match one of the options, or correctedOptions if provided)",',
    '    "reason": "short 1-sentence factual explanation"',
    '  }',
    ']'
  ].join('\n');
}

/**
 * Extracts and normalizes Claude's JSON verification array from raw browser text.
 */
export function parseClaudeVerifyResponse(rawText, questions = []) {
  const text = String(rawText || '').trim();
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    // Claude's web UI often converts ASCII quotes to curly/typographic quotes
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    return { parsed: false, results: [], rawText: text };
  }
  try {
    const jsonCandidate = match[0].replace(/,\s*([}\]])/g, '$1');
    const arr = JSON.parse(jsonCandidate);
    if (!Array.isArray(arr)) return { parsed: false, results: [], rawText: text };
    const results = arr.map((item, pos) => {
      const idx = Number.isInteger(item?.index) ? item.index : pos;
      const orig = questions[idx] || {};
      const rawStatus = String(item?.status || 'correct').toLowerCase().trim();
      const status = rawStatus === 'wrong' || rawStatus === 'incorrect'
        ? 'wrong'
        : (rawStatus === 'ambiguous' || rawStatus === 'unsure' ? 'ambiguous' : 'correct');
      const correctedQuestion = String(item?.correctedQuestion || '').trim();
      const correctedOptions = Array.isArray(item?.correctedOptions)
        ? item.correctedOptions.map(o => String(o || '').replace(/^[A-Da-d1-4][\)\.\:\-\s]+/, '').trim()).filter(Boolean)
        : [];
      const correctedAnswer = String(item?.correctedAnswer || '').replace(/^[A-Da-d1-4][\)\.\:\-\s]+/, '').trim();
      const reason = String(item?.reason || '').trim();
      return {
        index: idx,
        status,
        currentQuestion: String(orig.question || ''),
        currentOptions: Array.isArray(orig.options) ? orig.options : [],
        currentAnswer: String(orig.answer || ''),
        correctedQuestion: correctedQuestion && correctedQuestion !== String(orig.question || '').trim() ? correctedQuestion : '',
        correctedOptions: correctedOptions.length >= 2 ? correctedOptions.slice(0, 4) : [],
        correctedAnswer: correctedAnswer || String(orig.answer || ''),
        reason
      };
    }).filter(r => r.index >= 0 && r.index < questions.length);
    return { parsed: true, results, rawText: text };
  } catch {
    return { parsed: false, results: [], rawText: text };
  }
}
