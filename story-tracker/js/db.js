// Storage: in-memory store D (id -> doc), localStorage cache, and Turso sync.
// A doc is {id, kind: project|episode|note, pid: parent project id, data, updated}.
let D = {};

async function sql(stmts) {
  const requests = stmts.map(([q, args = []]) => ({type: "execute", stmt: {sql: q, args: args.map(v => typeof v === "number" ? {type: "integer", value: String(v)} : {type: "text", value: String(v)})}}));
  requests.push({type: "close"});
  const r = await fetch(TURSO, {method: "POST", headers: {Authorization: "Bearer " + TOKEN, "Content-Type": "application/json"}, body: JSON.stringify({requests})});
  if (!r.ok) throw new Error("Turso " + r.status + " " + await r.text());
  const j = await r.json();
  const bad = j.results.find(x => x.type === "error");
  if (bad) throw new Error(bad.error.message);
  return j.results;
}

async function loadRemote() {
  await sql([["CREATE TABLE IF NOT EXISTS docs(id TEXT PRIMARY KEY, kind TEXT, pid TEXT, data TEXT, updated INTEGER)"]]);
  const rows = (await sql([["SELECT id,kind,pid,data,updated FROM docs"]]))[0].response.result.rows;
  const remote = {};
  rows.forEach(r => { const [id, kind, pid, data, updated] = r.map(c => c.value); remote[id] = {id, kind, pid, data: JSON.parse(data), updated: +updated}; });
  // newest wins; push local-only / newer items up
  const push = [];
  let changed = false;
  for (const id in D) if (!remote[id] || D[id].updated > remote[id].updated) push.push(D[id]);
  for (const id in remote) if (!D[id] || remote[id].updated > D[id].updated) { D[id] = remote[id]; changed = true; }
  // docs deleted elsewhere: drop local copies that were already synced before
  for (const id in D) if (!remote[id] && !pending.has(id) && D[id].synced) { delete D[id]; changed = true; }
  for (const d of push) await upsertRemote(d);
  for (const id in D) D[id].synced = true;
  cache();
  return changed;
}

const upsertRemote = d => sql([["INSERT INTO docs(id,kind,pid,data,updated) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated=excluded.updated,pid=excluded.pid", [d.id, d.kind, d.pid || "", JSON.stringify(d.data), d.updated]]]);

function cache() { localStorage.setItem("tracker_cache", JSON.stringify(D)); }
function loadCache() { try { D = JSON.parse(localStorage.getItem("tracker_cache") || "{}"); } catch { D = {}; } }

const saveTimers = {};
const pending = new Set();
function save(id) {
  const d = D[id]; d.updated = Date.now(); cache(); status("saving…");
  pending.add(id);
  clearTimeout(saveTimers[id]);
  saveTimers[id] = setTimeout(() => push(id), 600);
}

function push(id) {
  clearTimeout(saveTimers[id]);
  const d = D[id]; if (!d) return pending.delete(id);
  return upsertRemote(d).then(() => { pending.delete(id); if (!pending.size) status("saved ✓"); }).catch(e => status("⚠ not synced, will retry: " + e.message));
}

// Pushes anything still waiting (used when the tab is hidden/closed).
function flushPending() { pending.forEach(push); }

async function removeDoc(id) {
  delete D[id]; cache();
  try { await sql([["DELETE FROM docs WHERE id=?", [id]]]); } catch (e) { status("⚠ " + e.message); }
}

async function syncNow(manual = true) {
  if (manual) status("syncing…");
  try {
    flushPending();
    const changed = await loadRemote();
    status("synced ✓");
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if (manual || (changed && !typing)) { if (!D[cur]) cur = null; render(); }
  } catch (e) { status("⚠ " + e.message); }
}
