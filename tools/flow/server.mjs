import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVideo } from './flow-video.mjs';
import { createGenerationQueue } from './generation-queue.mjs';
import { ASPECTS, DURATIONS, FLOW_OPTIONS, PROJECT_ID, VIDEO_MODELS, effectiveSettings, listProjects, readSettings, saveSettings } from './flow-settings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PORT = Number(process.env.AIPROJECTS_PORT || 8787);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

const queue = createGenerationQueue(generateVideo);
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
  const defaults = effectiveSettings(readSettings(), project).video;
  const model = body.model || defaults.model;
  const aspect = body.aspect || defaults.aspect;
  const duration = body.duration || defaults.duration;
  if (!VIDEO_MODELS.includes(model)) throw new Error('Unknown model: ' + model);
  if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
  if (!DURATIONS.includes(duration)) throw new Error('Unknown duration: ' + duration);
  const outFile = path.join(ROOT, 'projects', project, 'videos', `day-${String(day).padStart(2, '0')}.mp4`);
  return { day, prompt: body.prompt, model, aspect, duration, outFile };
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
  if (job.result) {
    body.file = path.relative(ROOT, job.result.file).split(path.sep).join('/');
    body.width = job.result.width;
    body.height = job.result.height;
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/api/health') return send(res, 200, { ok: true, service: 'aiprojects-flow', root: ROOT, jobApi: 1, models: VIDEO_MODELS, durations: DURATIONS, aspects: ASPECTS });
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

server.listen(PORT, '127.0.0.1', () => {
  console.log(`aiprojects running at http://127.0.0.1:${PORT}/projects/daily-motivations/`);
});
