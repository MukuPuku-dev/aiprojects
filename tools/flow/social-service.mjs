import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

export const SOCIAL_PROJECTS = new Set(['gk-questions', 'daily-motivations', 'teenage-love-vibes', 'maya-photos', 'jindagi-kitaab', 'kam-nalagne', 'sadhu-rani', 'tarkari-katha', 'stickman-lantern', 'ink-explainer', 'purplestick']);
export const GEMINI_URL = 'https://mukeshpokharel-testing.hf.space/gemini';
const STANDALONE_FILE = /^[^\\/:*?"<>|\x00-\x1f]+\.(?:mp4|png|jpe?g)$/i;
const NUMBERED_DAY_FILE = /^day-(?:0[1-9]|[1-9]\d+)\.(?:mp4|png|jpe?g)$/i;

/** Generates a Nepali social caption via Gemini or returns preset captions directly. */
export async function buildGeminiCaption(context, project, platform = 'TikTok') {
  if (project === 'maya-photos' || project === 'jindagi-kitaab') return context.trim();
  let guidance;
  if (project === 'gk-questions') {
    guidance = 'Write an informative caption covering the supplied quiz questions and answers, with useful related general knowledge where you are confident it is accurate. Do not invent facts; omit uncertain details. Invite viewers to share their score. Do not mention a day number, episode number, or series numbering.';
  } else if (project === 'teenage-love-vibes') {
    guidance = 'Write a long, deeply emotional, heart-touching Nepali continuation story (3 to 4 expressive paragraphs) continuing the silent teenage love scene and unspoken feelings described below. Write as a soulful narrative or heartfelt message that makes readers feel every emotion, and end with 4 to 6 relevant hashtags. Output plain text only.';
  } else if (project === 'tarkari-katha') {
    guidance = 'Write a warm, funny, and heart-touching Nepali continuation story (3 expressive paragraphs) continuing the 3D vegetable friends adventure (Aalu, Golbheda, Pyaaj, Khursani, Lasun Baaje) described below, weaving humor with a gentle life lesson about growth and self-worth, and end with 4 to 6 relevant hashtags. Output plain text only.';
  } else if (project === 'stickman-lantern') {
    guidance = 'Write a gripping, emotional Nepali storytelling caption (2 to 3 expressive paragraphs) continuing this silent 2D stickman survival adventure ("The Last Lantern" / अन्तिम लालटिन) about Kiran, Pip, and the Clockwork Owl carrying hope through darkness, and end with 4 to 6 relevant hashtags. Output plain text only.';
  } else if (project === 'ink-explainer') {
    guidance = 'Write a curious, witty, engaging English storytelling caption (2 short punchy paragraphs + a thought-provoking question) matching a viral Ink Explainer documentary style about ancient human life, history, or hidden everyday truths, and end with 4 to 6 relevant English hashtags. Output plain text only.';
  } else if (project === 'purplestick') {
    guidance = 'Write a short, punchy, hilarious viral English Facebook Reels / TikTok comedy caption (1 catchy hook line with 😂 emoji + 1 witty call-to-action like tagging a friend) for this PurpleStick 2D stickman comedy skit, and end with 6 to 8 viral hashtags including #PurpleStick #stickman #stickmananimation #funnyreels #viralreels #comedy #memes. Output plain text only.';
  } else {
    guidance = 'Build a strong, encouraging continuation of the supplied original motivational line: include the line and expand its specific message with a few meaningful sentences and practical encouragement. Keep the same intent and tone; do not make unsupported factual claims.';
  }
  const lang = (project === 'ink-explainer' || project === 'purplestick') ? 'English' : 'Nepali';
  const prompt = `Write one ${platform} caption in ${lang}. ${guidance} Include a few relevant hashtags. Output only the caption, without quotation marks or explanations.\n\nVideo details:\n${context}`;
  const response = await fetch(GEMINI_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(120000)
  });
  let body;
  try { body = await response.json(); } catch { throw new Error(`Gemini returned invalid JSON (HTTP ${response.status}).`); }
  if (!response.ok) throw new Error(`Gemini: ${typeof body.detail === 'string' ? body.detail : `HTTP ${response.status}`}`);
  if (typeof body.text !== 'string' || !body.text.trim() || body.text.length > 4000) throw new Error('Gemini returned an empty or overlong caption.');
  return body.text.trim();
}

/** Shared posting state machine, media lookup, hashing, and queue for social platforms. */
export function createSocialPostService({ root, platform, recordFileName, generateCaption, upload }) {
  const recordFile = path.join(root, 'tools', 'flow', recordFileName);
  const jobs = new Map();
  let active = null;
  const keyFor = (project, video) => typeof video === 'number' ? `${project}:${video}` : `${project}:file:${video}`;

  function resolveDayMedia(project, day) {
    const dir = path.join(root, 'projects', project, 'videos');
    const num = String(day).padStart(2, '0');
    const order = project === 'maya-photos' || project === 'jindagi-kitaab' || project === 'ink-explainer'
      ? ['.png', '.jpg', '.jpeg', '.mp4']
      : ['.mp4', '.png', '.jpg', '.jpeg'];
    for (const ext of order) {
      const candidate = path.join(dir, `day-${num}${ext}`);
      if (fs.existsSync(candidate) && fs.lstatSync(candidate).isFile()) return { file: candidate, ext };
    }
    const ext = order[0];
    return { file: path.join(dir, `day-${num}${ext}`), ext };
  }

  function maxDaysFor(project) {
    if (project === 'kam-nalagne') return 77;
    if (project === 'sadhu-rani') return 22;
    if (project === 'tarkari-katha') return 40;
    if (project === 'stickman-lantern') return 64;
    if (project === 'ink-explainer') return 60;
    return 30;
  }

  function validate(project, video) {
    if (!SOCIAL_PROJECTS.has(project)) throw new Error('Invalid project.');
    if (Number.isInteger(video) && video >= 1 && video <= maxDaysFor(project)) {
      return resolveDayMedia(project, video).file;
    }
    if (typeof video === 'string' && video.length <= 255 && STANDALONE_FILE.test(video) && !NUMBERED_DAY_FILE.test(video)) {
      return path.join(root, 'projects', project, 'videos', video);
    }
    throw new Error('Invalid video.');
  }

  function records() {
    if (!fs.existsSync(recordFile)) return {};
    const data = JSON.parse(fs.readFileSync(recordFile, 'utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${platform} posting history is invalid.`);
    return data;
  }

  function writeRecords(data) {
    fs.mkdirSync(path.dirname(recordFile), { recursive: true });
    const temporary = recordFile + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temporary, recordFile);
  }

  function digest(file) {
    return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }

  function list(project) {
    if (!SOCIAL_PROJECTS.has(project)) throw new Error('Invalid project.');
    const saved = records();
    const result = [];
    function add(video) {
      const file = validate(project, video);
      if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) return;
      const ext = path.extname(file).toLowerCase();
      const record = saved[keyFor(project, video)];
      const sameVideo = record && record.hash === digest(file);
      const status = record?.status === 'pending' ? 'unknown' : sameVideo && record?.status === 'posted' ? 'posted' : 'unposted';
      result.push({
        ...(typeof video === 'number' ? { day: video, ...(ext !== '.mp4' ? { ext } : {}) } : { file: video }),
        status,
        active: !!active && active.project === project && active.video === video
      });
    }
    const maxDays = maxDaysFor(project);
    for (let day = 1; day <= maxDays; day++) add(day);
    const directory = path.join(root, 'projects', project, 'videos');
    if (fs.existsSync(directory)) {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isFile() || !STANDALONE_FILE.test(entry.name) || NUMBERED_DAY_FILE.test(entry.name)) continue;
        add(entry.name);
      }
    }
    return result;
  }

  function start(project, video, context, { force = false } = {}) {
    const file = validate(project, video);
    if (typeof context !== 'string' || !context.trim() || context.length > 5000) throw new Error('Video context is required.');
    if (active) throw new Error(`Another ${platform} upload is already in progress.`);
    if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) throw new Error('The generated video was not found.');
    const hash = digest(file);
    const key = keyFor(project, video);
    const saved = records();
    if (saved[key]?.status === 'pending') throw new Error(`The previous posting result is unknown. Check ${platform} before resolving it.`);
    if (!force && saved[key]?.status === 'posted' && saved[key].hash === hash) throw new Error('This video was already posted.');
    const job = { id: randomUUID(), project, video, ...(typeof video === 'number' ? { day: video } : { file: video }), status: 'caption', error: null };
    active = job;
    jobs.set(job.id, job);
    (async () => {
      let submitted = false;
      try {
        const caption = await generateCaption(context, project);
        job.status = 'uploading';
        await upload({
          file, caption,
          beforePost: () => {
            if (digest(file) !== hash) throw new Error('The video changed during upload. No post was submitted.');
            const current = records();
            current[key] = { hash, status: 'pending', updatedAt: new Date().toISOString() };
            writeRecords(current);
            submitted = true;
            job.status = 'posting';
          }
        });
        const current = records();
        current[key] = { hash, status: 'posted', updatedAt: new Date().toISOString() };
        writeRecords(current);
        job.status = 'posted';
      } catch (error) {
        job.status = submitted ? 'unknown' : 'failed';
        job.error = error.message;
        console.error(`${platform} ${project} ${video}: ${error.message}`);
      } finally { active = null; }
    })();
    return job;
  }

  function resolve(project, video, posted) {
    validate(project, video);
    const key = keyFor(project, video);
    if (typeof posted !== 'boolean') throw new Error('Choose whether the video was posted.');
    if (active && active.project === project && active.video === video) throw new Error('The upload is still running.');
    const saved = records();
    if (saved[key]?.status !== 'pending') throw new Error('There is no uncertain post to resolve.');
    if (posted) saved[key] = { ...saved[key], status: 'posted', updatedAt: new Date().toISOString() };
    else delete saved[key];
    writeRecords(saved);
  }

  return { list, start, resolve, get: id => jobs.get(id), busy: () => !!active };
}
