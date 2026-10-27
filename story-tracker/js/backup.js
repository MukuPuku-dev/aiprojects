// JSON export / import.
function exportAll() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(D, null, 1)], {type: "application/json"}));
  a.download = "tracker-backup.json"; a.click();
}

function importAll(inp) {
  const f = inp.files[0]; if (!f) return;
  f.text().then(t => { const o = JSON.parse(t); for (const id in o) { D[id] = o[id]; D[id].updated = Date.now(); save(id); } render(); });
}
