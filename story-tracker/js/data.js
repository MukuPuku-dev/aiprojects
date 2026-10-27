// Project and dated prompt-record queries.
let cur = null;

const projects = () => Object.values(D).filter(d => d.kind === "project").sort((a, b) => b.updated - a.updated);

function promptRecords(pid) {
  const records = [];
  for (const d of Object.values(D)) {
    if (d.pid !== pid) continue;
    if (d.kind === "prompt") {
      records.push({key: "prompt:" + d.id, docId: d.id, kind: "prompt", date: d.data.date, text: d.data.text || "", source: d.data.source || "Saved prompt"});
    } else if (d.kind === "episode" && Array.isArray(d.data.frames)) {
      d.data.frames.forEach((text, index) => records.push({
        key: `frame:${d.id}:${index}`, docId: d.id, index, kind: "frame",
        date: d.data.date || "", text, source: "Earlier prompt"
      }));
    } else if (d.kind === "note") {
      records.push({
        key: "note:" + d.id, docId: d.id, kind: "note",
        date: d.data.date || dateStr(new Date(d.updated || Date.now())),
        text: d.data.text || "", source: "Previously saved note"
      });
    }
  }
  return records.filter(r => r.text.trim()).sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.key.localeCompare(a.key));
}

// Sets one field on a doc and saves it (used by inline oninput handlers).
function bind(id, key, el) { D[id].data[key] = el.value; save(id); }

function savePromptRecord(pid, date, text, source) {
  const id = uid();
  D[id] = {id, kind: "prompt", pid, updated: 0, data: {date, text, source}};
  save(id);
}

function updatePromptRecord(record, text) {
  const d = D[record.docId];
  if (!d) return;
  if (record.kind === "prompt") d.data.text = text;
  else if (record.kind === "frame") d.data.frames[record.index] = text;
  else d.data.text = text;
  save(d.id);
}

function deletePromptRecord(record) {
  if (record.kind === "frame") {
    const d = D[record.docId];
    if (!d) return;
    d.data.frames.splice(record.index, 1);
    save(d.id);
    render();
  } else {
    removeDoc(record.docId).then(render);
  }
}
