import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateVideo } from './flow-video.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const PORT = Number(process.env.AIPROJECTS_PORT || 8787);
const MODELS = ['Omni 1.1 Flash', 'Omni 1.2 Flash', 'Veo 3.1 - Lite', 'Veo 3.1 - Fast', 'Veo 3.1 - Quality'];
const DURATIONS = ['4s', '6s', '8s', '10s'];
const ASPECTS = ['9:16', '16:9'];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

let queue = Promise.resolve();
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
  if (!/^[a-z0-9-]+$/.test(project)) throw new Error('project must use lowercase letters, digits and dashes.');
  const model = body.model || MODELS[0];
  const aspect = body.aspect || '9:16';
  const duration = body.duration || '10s';
  if (!MODELS.includes(model)) throw new Error('Unknown model: ' + model);
  if (!ASPECTS.includes(aspect)) throw new Error('Unknown aspect: ' + aspect);
  if (!DURATIONS.includes(duration)) throw new Error('Unknown duration: ' + duration);
  const outFile = path.join(ROOT, 'projects', project, 'videos', `day-${String(day).padStart(2, '0')}.mp4`);
  return { day, prompt: body.prompt, model, aspect, duration, outFile };
}

async function handleGenerate(req, res) {
  let job;
  try { job = validate(await readBody(req)); }
  catch (err) { return send(res, 400, { ok: false, error: err.message }); }

  const run = queue.then(() => generateVideo({ ...job, log: m => console.log(`[day ${job.day}] ${m}`) }));
  queue = run.catch(() => {});
  try {
    const result = await run;
    send(res, 200, { ok: true, day: job.day, file: path.relative(ROOT, result.file).split(path.sep).join('/'), width: result.width, height: result.height });
  } catch (err) {
    console.error(`[day ${job.day}] failed: ${err.message}`);
    send(res, 500, { ok: false, error: err.message });
  }
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname === '/api/health') return send(res, 200, { ok: true, models: MODELS, durations: DURATIONS, aspects: ASPECTS });
  if (url.pathname === '/api/generate') {
    if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'Use POST.' });
    return handleGenerate(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url.pathname);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`aiprojects running at http://127.0.0.1:${PORT}/projects/daily-motivations/`);
});
