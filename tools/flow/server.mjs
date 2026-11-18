import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generateCharactersInFlow, generateFrameVideo, generateImage, generateImageBatch, generateVideo } from './flow-video.mjs';
import { resolveRequiredCharacters } from './flow-characters.mjs';
import { createGenerationQueue } from './generation-queue.mjs';
import { createTikTokService } from './tiktok.mjs';
import { createFacebookService } from './facebook.mjs';
import { createTelegramService, uploadToTelegram } from './telegram.mjs';
import { ASPECTS, DURATIONS, FLOW_OPTIONS, PROJECT_ID, VIDEO_MODELS, effectiveSettings, listProjects, readSettings, saveSettings, studioProjectName } from './flow-settings.mjs';
import { callGeminiText, deleteBeatImage, deleteBeatTransition, episodeFlowProjectName, generateAndSaveBlockTts, generateAndSaveTts, listExplainerAssets, saveBeatImage, saveCustomStory, saveEpisode } from './explainer-service.mjs';
import { compressImageToJpeg, csvImagesDir, deleteCsvImage, listCsvImages, mapAspectToFlow, sanitizeFileName, sanitizeFolderName } from './csv-images-service.mjs';
import { searchAndSaveImageBatchInBrowser, searchAndSaveImageInBrowser } from './csv-web-search.mjs';
import { uploadToYouTube } from './youtube.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PORT = Number(process.env.AIPROJECTS_PORT || 8787);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.wav': 'audio/wav', '.webm': 'video/webm' };

const queue = createGenerationQueue(job => {
  if (job.mode === 'youtube') return uploadToYouTube(job);
  if (job.mode === 'characters') return generateCharactersInFlow(job);
  if (job.mode === 'image-batch') return generateImageBatch(job);
  if (job.mode === 'frames') return generateFrameVideo(job);
  if (job.mode === 'frames-batch') return job.run();
  if (job.mode === 'csv-image-batch') return job.run();
  return job.mode === 'image' ? generateImage(job) : generateVideo(job);
});
const tiktok = createTikTokService(ROOT);
const facebook = createFacebookService(ROOT);
const telegram = createTelegramService(ROOT);
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 1e6) reject(new Error('Request too large.')); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('Body must be JSON.')); } });
    req.on('error', reject);
  });
}

function validate(body) {
  const day = Number(body.day);
  if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('day must be an integer from 1 to 365.');
  if (typeof body.prompt !== 'string' || body.prompt.trim().length < 20) throw new Error('prompt is required.');
  const project = body.project || 'daily-motivations';
  if (!PROJECT_ID.test(project)) throw new Error('project must use lowercase letters, digits and dashes.');
  const flowProject = studioProjectName(project);
  if (!flowProject) throw new Error(`No studio card name found for project ${project}.`);
  const effective = effectiveSettings(readSettings(), project);
  const characterConsistency = Boolean(effective.characters?.consistency);
  const requiredCharacters = characterConsistency
    ? resolveRequiredCharacters(ROOT, project, body.characters)
    : [];
  const mode = body.mode === 'image' || project === 'maya-photos' || project === 'jindagi-kitaab' || project === 'ink-explainer' ? 'image' : 'video';
  if (mode === 'image') {
    const model = typeof body.model === 'string' ? body.model.trim() : effective.image.model;
    if (model.length > 80) throw new Error('Image model name must be 80 characters or fewer.');
    const aspect = body.aspect || effective.image.aspect;
    if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
    const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : '';
    if (episode && !PROJECT_ID.test(episode)) throw new Error('episode must use lowercase letters, digits and dashes.');
    const targetFlowProject = project === 'ink-explainer' && episode
      ? episodeFlowProjectName(ROOT, project, episode, flowProject)
      : flowProject;
    const charProject = project === 'ink-explainer' && episode
      ? `${project}/episodes/${episode}`
      : project;
    const useBeatChars = project === 'ink-explainer' && Array.isArray(body.characters) && body.characters.length > 0;
    const effCharConsistency = useBeatChars ? true : characterConsistency;
    const effRequiredChars = useBeatChars
      ? resolveRequiredCharacters(ROOT, charProject, body.characters)
      : requiredCharacters;
    const outFile = project === 'ink-explainer' && episode
      ? path.join(ROOT, 'projects', project, 'episodes', episode, 'images', `beat-${String(day).padStart(2, '0')}.png`)
      : path.join(ROOT, 'projects', project, 'videos', `day-${String(day).padStart(2, '0')}.png`);
    return { mode: 'image', day, prompt: body.prompt, model, aspect, outFile, flowProject: targetFlowProject, project, charProject, characterConsistency: effCharConsistency, requiredCharacters: effRequiredChars };
  }
  const model = body.model || effective.video.model;
  const aspect = body.aspect || effective.video.aspect;
  const duration = body.duration || effective.video.duration;
  if (!VIDEO_MODELS.includes(model)) throw new Error('Unknown model: ' + model);
  if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
  if (!DURATIONS.includes(duration)) throw new Error('Unknown duration: ' + duration);
  const outFile = path.join(ROOT, 'projects', project, 'videos', `day-${String(day).padStart(2, '0')}.mp4`);
  return { mode: 'video', day, prompt: body.prompt, model, aspect, duration, outFile, flowProject, project, characterConsistency, requiredCharacters };
}

async function handleGenerate(req, res) {
  let job;
  try { job = validate(await readBody(req)); }
  catch (err) { return send(res, 400, { ok: false, error: err.message }); }

  try {
    const result = await queue.enqueue({ ...job, log: m => console.log(`[day ${job.day}] ${m}`) });
    send(res, 200, { ok: true, day: job.day, file: path.relative(ROOT, result.file).split(path.sep).join('/'), width: result.width, height: result.height });
  } catch (err) {
    console.error(`[day ${job.day}] failed: ${err.message}`);
    send(res, 500, { ok: false, error: err.message });
  }
}

async function handleGenerationJob(req, res) {
  let body, job;
  try {
    body = await readBody(req);
    if (typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)) throw new Error('A valid job ID is required.');
    job = validate(body);
    if (queue.get(body.id)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
  } catch (err) {
    return send(res, 400, { ok: false, error: err.message });
  }
  const tracked = queue.submit(body.id, { ...job, log: m => console.log(`[day ${job.day}] ${m}`) });
  send(res, 202, { ok: true, id: tracked.id, day: tracked.day, status: tracked.status });
}

function handleJobStatus(res, id) {
  const job = queue.get(id);
  if (!job) return send(res, 404, { ok: false, error: 'Job not found. The generator may have restarted.' });
  const body = { ok: true, id: job.id, day: job.day, status: job.status };
  if (job.progress) body.progress = job.progress;
  if (job.result) {
    if (job.result.file) body.file = path.relative(ROOT, job.result.file).split(path.sep).join('/');
    if (job.result.width) body.width = job.result.width;
    if (job.result.height) body.height = job.result.height;
    if (Array.isArray(job.result.saved)) body.savedCount = job.result.saved.length;
    if (job.result.videoUrl) body.videoUrl = job.result.videoUrl;
  }
  if (job.error) body.error = job.error;
  send(res, 200, body);
}

function serveStatic(req, res, pathname) {
  const rel = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  let file = path.resolve(ROOT, '.' + rel);
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) { res.writeHead(403); return res.end('Forbidden'); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

async function handleSettings(req, res, url) {
  try {
    if (req.method === 'GET') {
      const settings = readSettings();
      const body = { ok: true, settings, options: FLOW_OPTIONS, projects: listProjects() };
      const project = url.searchParams.get('project');
      if (project) {
        if (!PROJECT_ID.test(project)) throw new Error('project must use lowercase letters, digits and dashes.');
        body.project = project;
        body.effective = effectiveSettings(settings, project);
      }
      return send(res, 200, body);
    }
    if (req.method === 'PUT') {
      const settings = saveSettings(await readBody(req));
      return send(res, 200, { ok: true, settings });
    }
  } catch (err) {
    return send(res, 400, { ok: false, error: err.message });
  }
  send(res, 405, { ok: false, error: 'Use GET or PUT.' });
}

// Stops this server, and for "restart" starts a fresh copy (hidden, detached) that picks up code changes.
async function handleServerControl(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
  if (req.headers.origin !== `http://127.0.0.1:${PORT}` || !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
    return send(res, 403, { ok: false, error: 'Requests must originate from the local studio.' });
  }
  let body;
  try { body = await readBody(req); } catch (err) { return send(res, 400, { ok: false, error: err.message }); }
  if (!['restart', 'stop'].includes(body.action)) return send(res, 400, { ok: false, error: 'action must be "restart" or "stop".' });
  if ((queue.busy() || tiktok.busy() || facebook.busy() || telegram.busy()) && body.force !== true) {
    return send(res, 409, { ok: false, busy: true, error: 'A Flow generation or social upload is still running.' });
  }
  send(res, 202, { ok: true, action: body.action });
  console.log(`Server ${body.action} requested from the studio.`);
  setTimeout(() => {
    server.close(() => {
      if (body.action === 'restart') {
        spawn(process.execPath, process.argv.slice(1), { cwd: ROOT, env: process.env, detached: true, stdio: 'ignore', windowsHide: true }).unref();
      }
      process.exit(0);
    });
    server.closeAllConnections();
  }, 200);
}

async function handleSocialRoute(req, res, url, base, service, label) {
  if (url.pathname === `${base}/videos`) {
    if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Use GET.' });
    try { return send(res, 200, { ok: true, videos: service.list(url.searchParams.get('project')) }); }
    catch (err) { return send(res, 400, { ok: false, error: err.message }); }
  }
  if (url.pathname === `${base}/posts` || url.pathname === `${base}/resolve`) {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
    if (req.headers.origin !== `http://127.0.0.1:${PORT}` || !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return send(res, 403, { ok: false, error: 'Requests must originate from the local studio.' });
    }
    try {
      const body = await readBody(req);
      if (url.pathname === `${base}/resolve`) {
        service.resolve(body.project, body.file ?? body.day, body.posted);
        return send(res, 200, { ok: true });
      }
      const job = service.start(body.project, body.file ?? body.day, body.context, { force: Boolean(body.force) });
      return send(res, 202, { ok: true, id: job.id });
    } catch (err) { return send(res, 400, { ok: false, error: err.message }); }
  }
  if (url.pathname.startsWith(`${base}/posts/`)) {
    if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Use GET.' });
    const job = service.get(url.pathname.slice(`${base}/posts/`.length));
    if (!job) return send(res, 404, { ok: false, error: `${label} job not found. Check the video status before retrying.` });
    return send(res, 200, { ok: true, ...job });
  }
  return send(res, 404, { ok: false, error: 'Not found.' });
}

async function handleExplainerRoute(req, res, url) {
  if (url.pathname === '/api/explainer/assets') {
    if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Use GET.' });
    try {
      return send(res, 200, listExplainerAssets(
        ROOT,
        url.searchParams.get('project') || 'ink-explainer',
        url.searchParams.get('episode') || 'ancient-humans-day'
      ));
    } catch (err) { return send(res, 400, { ok: false, error: err.message }); }
  }
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
  if (url.pathname === '/api/explainer/save-export') {
    if (req.headers.origin !== `http://127.0.0.1:${PORT}`) {
      return send(res, 403, { ok: false, error: 'Requests must originate from the local studio.' });
    }
    try {
      const project = url.searchParams.get('project') || 'ink-explainer';
      const episode = url.searchParams.get('episode') || 'ancient-humans-day';
      const rawFile = url.searchParams.get('file') || 'episode.webm';
      if (!PROJECT_ID.test(project) || !PROJECT_ID.test(episode)) throw new Error('Invalid project or episode.');
      if (!/^[a-z0-9._-]+\.(webm|mp4)$/i.test(rawFile)) throw new Error('Invalid export filename.');
      const outPath = path.join(ROOT, 'projects', project, 'episodes', episode, rawFile);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const tmpPath = `${outPath}.${process.pid}.${Date.now()}.tmp`;
      const ws = fs.createWriteStream(tmpPath);
      await new Promise((resolve, reject) => {
        req.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
        req.on('error', reject);
      });
      fs.renameSync(tmpPath, outPath);
      return send(res, 200, { ok: true, fileName: rawFile, url: `/projects/${project}/episodes/${episode}/${rawFile}` });
    } catch (err) {
      return send(res, 400, { ok: false, error: err.message });
    }
  }
  if (url.pathname === '/api/explainer/upload-beat-image') {
    if (req.headers.origin !== `http://127.0.0.1:${PORT}`) {
      return send(res, 403, { ok: false, error: 'Requests must originate from the local studio.' });
    }
    try {
      const project = url.searchParams.get('project') || 'ink-explainer';
      const episode = url.searchParams.get('episode') || 'ancient-humans-day';
      const beat = Number(url.searchParams.get('beat'));
      const ct = String(req.headers['content-type'] || '').toLowerCase();
      const ext = ct.includes('jpeg') || ct.includes('jpg') ? '.jpg' : ct.includes('webp') ? '.webp' : '.png';
      const chunks = [];
      let total = 0;
      await new Promise((resolve, reject) => {
        req.on('data', c => {
          total += c.length;
          if (total > 25 * 1024 * 1024) { reject(new Error('Image too large (max 25MB).')); return; }
          chunks.push(c);
        });
        req.on('end', resolve);
        req.on('error', reject);
      });
      const result = saveBeatImage(ROOT, project, episode, beat, Buffer.concat(chunks), ext);
      return send(res, 200, result);
    } catch (err) {
      return send(res, 400, { ok: false, error: err.message });
    }
  }
  if (req.headers.origin !== `http://127.0.0.1:${PORT}` || !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
    return send(res, 403, { ok: false, error: 'Requests must originate from the local studio.' });
  }
  try {
    const body = await readBody(req);
    if (url.pathname === '/api/explainer/gemini') {
      const text = await callGeminiText(body.prompt);
      return send(res, 200, { ok: true, text });
    }
    if (url.pathname === '/api/explainer/tts') {
      const result = await generateAndSaveTts({
        root: ROOT,
        project: body.project || 'ink-explainer',
        scene: body.scene,
        prompt: body.prompt,
        voice: body.voice || 'Kore',
        timestamps: body.timestamps !== false,
        language: body.language || 'en'
      });
      return send(res, 200, result);
    }
    if (url.pathname === '/api/explainer/block-tts') {
      const result = await generateAndSaveBlockTts({
        root: ROOT,
        project: body.project || 'ink-explainer',
        episodeId: body.episode || body.episodeId || 'ancient-humans-day',
        blockId: body.blockId,
        beats: Array.isArray(body.beats) ? body.beats : [],
        prompt: body.prompt,
        voice: body.voice || 'Kore',
        emotionMode: body.emotionMode || 'auto',
        language: body.language || 'en'
      });
      return send(res, 200, result);
    }
    if (url.pathname === '/api/explainer/episode') {
      const episode = saveEpisode(ROOT, body.project || 'ink-explainer', body.delete ? { delete: true, id: body.id } : (body.episode || body));
      return send(res, 200, { ok: true, episode });
    }
    if (url.pathname === '/api/explainer/story') {
      const story = saveCustomStory(ROOT, body.project || 'ink-explainer', body.reset ? { reset: true } : (body.story || body));
      return send(res, 200, { ok: true, story });
    }
    if (url.pathname === '/api/explainer/generate-characters') {
      const project = body.project || 'ink-explainer';
      if (!PROJECT_ID.test(project)) throw new Error('Invalid project.');
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      if (!PROJECT_ID.test(episode)) throw new Error('Invalid episode.');
      const baseFlowProject = studioProjectName(project);
      if (!baseFlowProject) throw new Error(`No studio card name found for project ${project}.`);
      const flowProject = episodeFlowProjectName(ROOT, project, episode, baseFlowProject);
      const charProject = `${project}/episodes/${episode}`;
      const rawChars = Array.isArray(body.characters) ? body.characters : [];
      if (!rawChars.length) throw new Error('characters array is required.');
      const resolvedChars = resolveRequiredCharacters(ROOT, charProject, rawChars);
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      const tracked = queue.submit(jobId, {
        mode: 'characters',
        day: 1,
        flowProject,
        charProject,
        characters: resolvedChars,
        log: m => console.log(`[ink-chars ${episode}] ${m}`)
      });
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status });
    }
    if (url.pathname === '/api/explainer/generate-batch') {
      const project = body.project || 'ink-explainer';
      if (!PROJECT_ID.test(project)) throw new Error('Invalid project.');
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      if (!PROJECT_ID.test(episode)) throw new Error('Invalid episode.');
      const baseFlowProject = studioProjectName(project);
      if (!baseFlowProject) throw new Error(`No studio card name found for project ${project}.`);
      const flowProject = episodeFlowProjectName(ROOT, project, episode, baseFlowProject);
      const charProject = `${project}/episodes/${episode}`;
      const effective = effectiveSettings(readSettings(), project);
      const aspect = body.aspect || effective.image.aspect || '16:9';
      if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
      const model = typeof body.model === 'string' ? body.model.trim() : effective.image.model;
      const concurrency = Math.max(1, Math.min(6, Number(body.concurrency) || 5));
      const rawCast = Array.isArray(body.characters) ? body.characters : [];
      const castList = rawCast.length ? resolveRequiredCharacters(ROOT, charProject, rawCast) : [];
      const castByCode = new Map(castList.map(c => [c.code, c]));
      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (!rawItems.length) throw new Error('items array is required.');
      const mapped = rawItems.map(it => {
        const day = Number(it.day);
        if (!Number.isInteger(day) || day < 1 || day > 365) throw new Error('Each item requires an integer day 1..365.');
        if (typeof it.prompt !== 'string' || it.prompt.trim().length < 20) throw new Error(`Beat ${day} prompt is too short.`);
        const outFile = path.join(ROOT, 'projects', project, 'episodes', episode, 'images', `beat-${String(day).padStart(2, '0')}.png`);
        const beatChars = Array.isArray(it.characters) && it.characters.length
          ? it.characters.map(c => castByCode.get(String(c || '').trim().toUpperCase()) || resolveRequiredCharacters(ROOT, charProject, [c])[0]).filter(Boolean)
          : [];
        return { day, prompt: it.prompt.trim(), outFile, characters: beatChars };
      });
      const pending = mapped.filter(it => !fs.existsSync(it.outFile));
      if (!pending.length) {
        return send(res, 200, { ok: true, alreadyComplete: true, total: mapped.length, skipped: mapped.length });
      }
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      let tracked;
      tracked = queue.submit(jobId, {
        mode: 'image-batch',
        day: pending[0].day,
        items: pending,
        model,
        aspect,
        flowProject,
        charProject,
        characters: castList,
        concurrency,
        shouldStop: () => Boolean(tracked?.stopRequested),
        onProgress: p => {
          tracked.progress = {
            ...(tracked.progress || {}),
            total: mapped.length,
            skipped: mapped.length - pending.length,
            ...p
          };
        },
        onItemSaved: entry => {
          const prevDays = tracked.progress?.savedDays || [];
          tracked.progress = {
            ...(tracked.progress || {}),
            total: mapped.length,
            skipped: mapped.length - pending.length,
            lastSavedDay: entry.day,
            savedDays: prevDays.includes(entry.day) ? prevDays : [...prevDays, entry.day]
          };
        },
        log: m => console.log(`[ink-batch ${episode}] ${m}`)
      });
      tracked.progress = {
        total: mapped.length,
        skipped: mapped.length - pending.length,
        savedCount: 0,
        inFlight: 0,
        remaining: pending.length,
        savedDays: []
      };
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status, progress: tracked.progress });
    }
    if (url.pathname === '/api/explainer/stop-batch') {
      const job = queue.get(body.id);
      if (!job) return send(res, 404, { ok: false, error: 'Batch job not found.' });
      job.stopRequested = true;
      return send(res, 200, { ok: true, stopping: true });
    }
    if (url.pathname === '/api/explainer/delete-beat-image') {
      const resDel = deleteBeatImage(
        ROOT,
        body.project || 'ink-explainer',
        body.episode || 'ancient-humans-day',
        body.beat
      );
      return send(res, 200, resDel);
    }
    if (url.pathname === '/api/explainer/delete-frame-pair') {
      const resDel = deleteBeatTransition(
        ROOT,
        body.project || 'ink-explainer',
        body.episode || 'ancient-humans-day',
        body.fromBeat
      );
      return send(res, 200, resDel);
    }
    if (url.pathname === '/api/explainer/generate-frame-pair') {
      const project = body.project || 'ink-explainer';
      if (!PROJECT_ID.test(project)) throw new Error('Invalid project.');
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      if (!PROJECT_ID.test(episode)) throw new Error('Invalid episode.');
      const fromBeat = Number(body.fromBeat);
      const toBeat = Number(body.toBeat || (fromBeat + 1));
      if (!Number.isInteger(fromBeat) || fromBeat < 1 || toBeat !== fromBeat + 1) {
        throw new Error('Requires two consecutive beats (fromBeat and toBeat = fromBeat + 1).');
      }
      const imgDir = path.join(ROOT, 'projects', project, 'episodes', episode, 'images');
      const findBeatImg = num => {
        const stem = `beat-${String(num).padStart(2, '0')}`;
        for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
          const p = path.join(imgDir, `${stem}${ext}`);
          if (fs.existsSync(p)) return p;
        }
        return '';
      };
      const startFile = findBeatImg(fromBeat);
      const endFile = findBeatImg(toBeat);
      if (!startFile || !endFile) {
        throw new Error(`Generate or upload both Beat ${fromBeat} and Beat ${toBeat} images first.`);
      }
      const baseFlowProject = studioProjectName(project);
      if (!baseFlowProject) throw new Error(`No studio card name found for project ${project}.`);
      const flowProject = episodeFlowProjectName(ROOT, project, episode, baseFlowProject);
      const effective = effectiveSettings(readSettings(), project);
      const model = body.model || effective.video.model || 'Omni 1.1 Flash';
      const aspect = body.aspect || effective.image.aspect || '16:9';
      const duration = body.duration || '4s';
      if (!VIDEO_MODELS.includes(model)) throw new Error('Unknown model: ' + model);
      if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
      if (!DURATIONS.includes(duration)) throw new Error('Unknown duration: ' + duration);
      const prompt = String(body.prompt || `Smooth continuous 2D ink-explainer animation transitioning naturally from the first frame to the end frame.`).trim();
      const outFile = path.join(ROOT, 'projects', project, 'episodes', episode, 'transitions', `pair-${String(fromBeat).padStart(2, '0')}-${String(toBeat).padStart(2, '0')}.mp4`);
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      const tracked = queue.submit(jobId, {
        mode: 'frames',
        day: fromBeat,
        prompt,
        outFile,
        model,
        aspect,
        duration,
        startFile,
        endFile,
        flowProject,
        log: m => console.log(`[ink-frames ${episode} ${fromBeat}->${toBeat}] ${m}`)
      });
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status });
    }
    if (url.pathname === '/api/explainer/generate-frames-batch') {
      const project = body.project || 'ink-explainer';
      if (!PROJECT_ID.test(project)) throw new Error('Invalid project.');
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      if (!PROJECT_ID.test(episode)) throw new Error('Invalid episode.');
      const rawPairs = Array.isArray(body.pairs) ? body.pairs : [];
      if (!rawPairs.length) throw new Error('pairs array is required.');
      const baseFlowProject = studioProjectName(project);
      if (!baseFlowProject) throw new Error(`No studio card name found for project ${project}.`);
      const flowProject = episodeFlowProjectName(ROOT, project, episode, baseFlowProject);
      const effective = effectiveSettings(readSettings(), project);
      const model = body.model || effective.video.model || 'Omni 1.1 Flash';
      const aspect = body.aspect || effective.image.aspect || '16:9';
      const duration = body.duration || '4s';
      if (!VIDEO_MODELS.includes(model)) throw new Error('Unknown model: ' + model);
      if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
      if (!DURATIONS.includes(duration)) throw new Error('Unknown duration: ' + duration);
      const imgDir = path.join(ROOT, 'projects', project, 'episodes', episode, 'images');
      const transDir = path.join(ROOT, 'projects', project, 'episodes', episode, 'transitions');
      const findBeatImg = num => {
        const stem = `beat-${String(num).padStart(2, '0')}`;
        for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
          const p = path.join(imgDir, `${stem}${ext}`);
          if (fs.existsSync(p)) return p;
        }
        return '';
      };
      const items = rawPairs.map(p => {
        const fromBeat = Number(p.fromBeat);
        const toBeat = Number(p.toBeat || (fromBeat + 1));
        if (!Number.isInteger(fromBeat) || fromBeat < 1 || toBeat !== fromBeat + 1) {
          throw new Error(`Invalid beat pair: ${p.fromBeat}->${p.toBeat}`);
        }
        const startFile = findBeatImg(fromBeat);
        const endFile = findBeatImg(toBeat);
        const outFile = path.join(transDir, `pair-${String(fromBeat).padStart(2, '0')}-${String(toBeat).padStart(2, '0')}.mp4`);
        return {
          fromBeat,
          toBeat,
          startFile,
          endFile,
          outFile,
          prompt: String(p.prompt || 'Smooth continuous 2D ink-explainer animation transitioning naturally from the first frame to the end frame.').trim()
        };
      });
      const pending = items.filter(it => it.startFile && it.endFile && !fs.existsSync(it.outFile));
      const missingImages = items.filter(it => !it.startFile || !it.endFile).map(it => `${it.fromBeat}→${it.toBeat}`);
      if (!pending.length) {
        return send(res, 200, { ok: true, alreadyComplete: true, total: items.length, skipped: items.length - missingImages.length, missingImages });
      }
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      let tracked;
      tracked = queue.submit(jobId, {
        mode: 'frames-batch',
        day: pending[0].fromBeat,
        run: async () => {
          const savedPairs = [];
          for (let i = 0; i < pending.length; i++) {
            if (tracked.stopRequested) break;
            const item = pending[i];
            tracked.progress = {
              total: items.length,
              skipped: items.length - pending.length - missingImages.length,
              completedCount: savedPairs.length,
              currentPair: `${item.fromBeat}→${item.toBeat}`,
              remaining: pending.length - i,
              savedPairs: [...savedPairs],
              missingImages
            };
            await generateFrameVideo({
              prompt: item.prompt,
              outFile: item.outFile,
              model,
              aspect,
              duration,
              startFile: item.startFile,
              endFile: item.endFile,
              flowProject,
              log: m => console.log(`[ink-frames-batch ${episode} ${item.fromBeat}->${item.toBeat}] ${m}`)
            });
            savedPairs.push(item.fromBeat);
            tracked.progress = {
              total: items.length,
              skipped: items.length - pending.length - missingImages.length,
              completedCount: savedPairs.length,
              currentPair: '',
              remaining: pending.length - i - 1,
              savedPairs: [...savedPairs],
              missingImages
            };
          }
          return { savedPairs, stopped: Boolean(tracked.stopRequested) };
        }
      });
      tracked.progress = {
        total: items.length,
        skipped: items.length - pending.length - missingImages.length,
        completedCount: 0,
        currentPair: `${pending[0].fromBeat}→${pending[0].toBeat}`,
        remaining: pending.length,
        savedPairs: [],
        missingImages
      };
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status, progress: tracked.progress });
    }
    if (url.pathname === '/api/explainer/upload-youtube') {
      const project = body.project || 'ink-explainer';
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      const fileName = typeof body.fileName === 'string' && /^[a-z0-9._-]+\.(webm|mp4)$/i.test(body.fileName.trim())
        ? body.fileName.trim()
        : 'episode.webm';
      if (!PROJECT_ID.test(project) || !PROJECT_ID.test(episode)) throw new Error('Invalid project or episode.');
      const filePath = path.join(ROOT, 'projects', project, 'episodes', episode, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Exported ${fileName} not found. Export the video first.`);
      }
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      const tracked = queue.submit(jobId, {
        mode: 'youtube',
        day: 1,
        filePath,
        title: body.title || 'Ink Explainer Episode',
        description: body.description || '',
        visibility: body.visibility || 'unlisted',
        log: m => console.log(`[youtube ${episode}] ${m}`)
      });
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status });
    }
    if (url.pathname === '/api/explainer/send-telegram') {
      const project = body.project || 'ink-explainer';
      const episode = typeof body.episode === 'string' && body.episode.trim() ? body.episode.trim() : 'ancient-humans-day';
      const fileName = typeof body.fileName === 'string' && /^[a-z0-9._-]+\.(webm|mp4)$/i.test(body.fileName.trim())
        ? body.fileName.trim()
        : 'episode.webm';
      if (!PROJECT_ID.test(project) || !PROJECT_ID.test(episode)) throw new Error('Invalid project or episode.');
      const filePath = path.join(ROOT, 'projects', project, 'episodes', episode, fileName);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Exported ${fileName} not found. Export the video first.`);
      }
      await uploadToTelegram({
        file: filePath,
        caption: typeof body.caption === 'string' ? body.caption : ''
      });
      return send(res, 200, { ok: true, fileName });
    }
    return send(res, 404, { ok: false, error: 'Not found.' });
  } catch (err) {
    return send(res, 400, { ok: false, error: err.message });
  }
}

async function handleCsvImagesRoute(req, res, url) {
  try {
    if (url.pathname === '/api/csv-images/list') {
      const folder = url.searchParams.get('folder') || 'default';
      return send(res, 200, { ok: true, ...listCsvImages(ROOT, folder) });
    }
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
    const body = await readBody(req);
    const project = 'images-from-csv';
    const flowProject = studioProjectName(project) || 'Images from CSV';
    const effective = effectiveSettings(readSettings(), project);

    if (url.pathname === '/api/csv-images/delete') {
      const result = deleteCsvImage(ROOT, body.folder, body.filename);
      return send(res, 200, { ok: true, ...result });
    }

    if (url.pathname === '/api/csv-images/delete-batch') {
      const filenames = Array.isArray(body.filenames) ? body.filenames : [];
      if (!filenames.length) throw new Error('filenames array is required.');
      let deletedCount = 0;
      for (const fname of filenames) {
        const resDel = deleteCsvImage(ROOT, body.folder, fname);
        if (resDel.deleted) deletedCount++;
      }
      return send(res, 200, { ok: true, deletedCount });
    }

    if (url.pathname === '/api/csv-images/compress-batch') {
      const folder = sanitizeFolderName(body.folder);
      const outDir = csvImagesDir(ROOT, folder);
      const filenames = Array.isArray(body.filenames) ? body.filenames : [];
      if (!filenames.length) throw new Error('filenames array is required.');
      const quality = Number(body.quality) || 85;
      let compressedCount = 0;
      let savedBytes = 0;
      for (const fname of filenames) {
        const safe = sanitizeFileName(fname);
        const full = path.join(outDir, safe);
        if (fs.existsSync(full)) {
          const info = await compressImageToJpeg(full, quality);
          if (info) {
            compressedCount++;
            savedBytes += Math.max(0, info.originalSize - info.compressedSize);
          }
        }
      }
      return send(res, 200, { ok: true, compressedCount, savedBytes });
    }

    if (url.pathname === '/api/csv-images/stop-batch') {
      const job = queue.get(body.id);
      if (!job) return send(res, 404, { ok: false, error: 'Batch job not found.' });
      job.stopRequested = true;
      return send(res, 200, { ok: true, stopping: true });
    }

    if (url.pathname === '/api/csv-images/search-browser') {
      const query = typeof body.query === 'string' ? body.query.trim() : '';
      if (query.length < 2) throw new Error('Search query is required.');
      const folder = sanitizeFolderName(body.folder);
      const filename = sanitizeFileName(body.filename);
      const outDir = csvImagesDir(ROOT, folder);
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, filename);
      const day = Math.max(1, Number(body.day) || 1);
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      const tracked = queue.submit(jobId, {
        mode: 'csv-image-batch',
        day,
        log: m => console.log(`[csv-search ${folder}/${filename}] ${m}`),
        run: () => searchAndSaveImageInBrowser({
          query,
          outFile,
          log: m => console.log(`[csv-search ${folder}/${filename}] ${m}`)
        })
      });
      return send(res, 202, {
        ok: true,
        id: tracked.id,
        status: tracked.status,
        file: path.relative(ROOT, outFile).split(path.sep).join('/')
      });
    }

    if (url.pathname === '/api/csv-images/search-browser-batch') {
      const folder = sanitizeFolderName(body.folder);
      const outDir = csvImagesDir(ROOT, folder);
      fs.mkdirSync(outDir, { recursive: true });
      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (!rawItems.length) throw new Error('items array is required.');
      const overwrite = Boolean(body.overwrite);
      const mapped = rawItems.map((it, idx) => {
        const query = typeof it.query === 'string' ? it.query.trim() : '';
        if (query.length < 2) throw new Error(`Row ${it.rowId || idx + 1} search query is too short.`);
        const filename = sanitizeFileName(it.filename);
        const outFile = path.join(outDir, filename);
        return {
          day: Number.isInteger(Number(it.day)) && Number(it.day) > 0 ? Number(it.day) : idx + 1,
          rowId: String(it.rowId || idx + 1),
          filename,
          query,
          outFile
        };
      });
      const pending = overwrite ? mapped : mapped.filter(it => !fs.existsSync(it.outFile));
      if (!pending.length) {
        return send(res, 200, { ok: true, alreadyComplete: true, total: mapped.length, skipped: mapped.length });
      }
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });

      let tracked;
      const savedFiles = [];
      tracked = queue.submit(jobId, {
        mode: 'csv-image-batch',
        day: pending[0].day,
        log: m => console.log(`[csv-search-batch ${folder}] ${m}`),
        run: () => searchAndSaveImageBatchInBrowser({
          items: pending,
          shouldStop: () => Boolean(tracked?.stopRequested),
          onProgress: p => {
            tracked.progress = {
              ...(tracked.progress || {}),
              total: mapped.length,
              skipped: mapped.length - pending.length,
              savedCount: savedFiles.length,
              inFlight: p.inFlight ?? 0,
              remaining: p.remaining ?? Math.max(0, pending.length - savedFiles.length),
              lastQuery: p.lastQuery || '',
              savedFiles: [...savedFiles]
            };
          },
          onItemSaved: entry => {
            if (entry.filename && !savedFiles.includes(entry.filename)) savedFiles.push(entry.filename);
            tracked.progress = {
              ...(tracked.progress || {}),
              total: mapped.length,
              skipped: mapped.length - pending.length,
              savedCount: savedFiles.length,
              lastSavedFile: entry.filename,
              savedFiles: [...savedFiles]
            };
          },
          log: m => console.log(`[csv-search-batch ${folder}] ${m}`)
        })
      });
      tracked.progress = {
        total: mapped.length,
        skipped: mapped.length - pending.length,
        savedCount: 0,
        inFlight: 0,
        remaining: pending.length,
        savedFiles: []
      };
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status, progress: tracked.progress });
    }

    if (url.pathname === '/api/csv-images/generate') {
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (prompt.length < 10) throw new Error('Prompt must be at least 10 characters.');
      const folder = sanitizeFolderName(body.folder);
      const filename = sanitizeFileName(body.filename);
      const outDir = csvImagesDir(ROOT, folder);
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, filename);
      const model = typeof body.model === 'string' ? body.model.trim() : effective.image.model;
      const aspect = mapAspectToFlow(body.aspect || effective.image.aspect);
      const day = Math.max(1, Number(body.day) || 1);
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });
      const tracked = queue.submit(jobId, {
        mode: 'csv-image-batch',
        day,
        log: m => console.log(`[csv-img ${folder}/${filename}] ${m}`),
        run: async () => {
          const resImg = await generateImage({
            prompt,
            outFile,
            model,
            aspect,
            flowProject,
            project,
            log: m => console.log(`[csv-img ${folder}/${filename}] ${m}`)
          });
          await compressImageToJpeg(resImg.file || outFile, 85).catch(err => {
            console.warn(`[csv-img] JPEG compression skipped for ${filename}: ${err.message}`);
          });
          return resImg;
        }
      });
      return send(res, 202, {
        ok: true,
        id: tracked.id,
        status: tracked.status,
        file: path.relative(ROOT, outFile).split(path.sep).join('/')
      });
    }

    if (url.pathname === '/api/csv-images/generate-batch') {
      const folder = sanitizeFolderName(body.folder);
      const outDir = csvImagesDir(ROOT, folder);
      fs.mkdirSync(outDir, { recursive: true });
      const model = typeof body.model === 'string' ? body.model.trim() : effective.image.model;
      const concurrency = Math.max(1, Math.min(6, Number(body.concurrency) || 4));
      const rawItems = Array.isArray(body.items) ? body.items : [];
      if (!rawItems.length) throw new Error('items array is required.');
      const overwrite = Boolean(body.overwrite);
      const mapped = rawItems.map((it, idx) => {
        const prompt = typeof it.prompt === 'string' ? it.prompt.trim() : '';
        if (prompt.length < 10) throw new Error(`Row ${it.rowId || idx + 1} prompt is too short.`);
        const filename = sanitizeFileName(it.filename);
        const outFile = path.join(outDir, filename);
        const aspect = body.aspectOverride ? mapAspectToFlow(body.aspectOverride) : mapAspectToFlow(it.aspect);
        return {
          day: Number.isInteger(Number(it.day)) && Number(it.day) > 0 ? Number(it.day) : idx + 1,
          rowId: String(it.rowId || idx + 1),
          filename,
          prompt,
          outFile,
          aspect
        };
      });
      const pending = overwrite ? mapped : mapped.filter(it => !fs.existsSync(it.outFile));
      if (!pending.length) {
        return send(res, 200, { ok: true, alreadyComplete: true, total: mapped.length, skipped: mapped.length });
      }
      const jobId = (typeof body.id === 'string' && body.id.trim()) ? body.id.trim() : randomUUID();
      if (queue.get(jobId)) return send(res, 409, { ok: false, error: 'Job ID already exists.' });

      let tracked;
      const savedFiles = [];
      tracked = queue.submit(jobId, {
        mode: 'csv-image-batch',
        day: pending[0].day,
        log: m => console.log(`[csv-batch ${folder}] ${m}`),
        run: async () => {
          const groups = new Map();
          for (const item of pending) {
            if (!groups.has(item.aspect)) groups.set(item.aspect, []);
            groups.get(item.aspect).push(item);
          }
          const compressionTasks = [];
          for (const [aspect, groupItems] of groups.entries()) {
            if (tracked?.stopRequested) break;
            await generateImageBatch({
              items: groupItems,
              model,
              aspect,
              flowProject,
              concurrency,
              shouldStop: () => Boolean(tracked?.stopRequested),
              onProgress: p => {
                tracked.progress = {
                  ...(tracked.progress || {}),
                  total: mapped.length,
                  skipped: mapped.length - pending.length,
                  savedCount: savedFiles.length,
                  inFlight: p.inFlight ?? 0,
                  remaining: Math.max(0, pending.length - savedFiles.length),
                  savedFiles: [...savedFiles]
                };
              },
              onItemSaved: entry => {
                compressionTasks.push(
                  compressImageToJpeg(entry.file || entry.outFile, 85).catch(err => {
                    console.warn(`[csv-batch] JPEG compression skipped for ${entry.filename}: ${err.message}`);
                  })
                );
                if (entry.filename && !savedFiles.includes(entry.filename)) savedFiles.push(entry.filename);
                tracked.progress = {
                  ...(tracked.progress || {}),
                  total: mapped.length,
                  skipped: mapped.length - pending.length,
                  savedCount: savedFiles.length,
                  lastSavedFile: entry.filename,
                  savedFiles: [...savedFiles]
                };
              },
              log: m => console.log(`[csv-batch ${folder} ${aspect}] ${m}`)
            });
          }
          await Promise.all(compressionTasks);
          return { saved: savedFiles, file: pending[0].outFile };
        }
      });
      tracked.progress = {
        total: mapped.length,
        skipped: mapped.length - pending.length,
        savedCount: 0,
        inFlight: 0,
        remaining: pending.length,
        savedFiles: []
      };
      return send(res, 202, { ok: true, id: tracked.id, status: tracked.status, progress: tracked.progress });
    }

    return send(res, 404, { ok: false, error: 'Not found.' });
  } catch (err) {
    return send(res, 400, { ok: false, error: err.message });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/api/health') return send(res, 200, { ok: true, service: 'aiprojects-flow', root: ROOT, jobApi: 1, tiktokApi: 1, facebookApi: 1, telegramApi: 1, flowProjectApi: 1, serverApi: 1, explainerApi: 1, csvImagesApi: 1, busy: queue.busy() || tiktok.busy() || facebook.busy() || telegram.busy(), models: VIDEO_MODELS, durations: DURATIONS, aspects: ASPECTS });
  if (url.pathname === '/api/server') return handleServerControl(req, res);
  if (url.pathname.startsWith('/api/csv-images/')) return handleCsvImagesRoute(req, res, url);
  if (url.pathname.startsWith('/api/explainer/')) return handleExplainerRoute(req, res, url);
  if (url.pathname.startsWith('/api/tiktok/')) return handleSocialRoute(req, res, url, '/api/tiktok', tiktok, 'TikTok');
  if (url.pathname.startsWith('/api/facebook/')) return handleSocialRoute(req, res, url, '/api/facebook', facebook, 'Facebook');
  if (url.pathname.startsWith('/api/telegram/')) return handleSocialRoute(req, res, url, '/api/telegram', telegram, 'Telegram');
  if (url.pathname === '/api/flow-settings') return handleSettings(req, res, url);
  if (url.pathname === '/api/generate') {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
    return handleGenerate(req, res);
  }
  if (url.pathname === '/api/generation-jobs') {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
    return handleGenerationJob(req, res);
  }
  if (url.pathname.startsWith('/api/generation-jobs/')) {
    if (req.method !== 'GET') return send(res, 405, { ok: false, error: 'Use GET.' });
    return handleJobStatus(res, url.pathname.slice('/api/generation-jobs/'.length));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url.pathname);
});

// Retries briefly so a restart can take over the port the previous copy just released.
let listenAttempts = 0;
server.on('error', err => {
  if (err.code === 'EADDRINUSE' && ++listenAttempts < 20) return setTimeout(() => server.listen(PORT, '127.0.0.1'), 250);
  console.error(err.message);
  process.exit(1);
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`aiprojects running at http://127.0.0.1:${PORT}/projects/daily-motivations/`);
});
