// A project's dated prompt history and the forms to save or generate prompts.
function vEpisodes(p) {
  $("#view").innerHTML = `<section class="card">
    <h3>Prompt for a date</h3>
    <label for="promptDate">Date</label><input id="promptDate" type="date" value="${today()}">
    <label for="direction">Optional topic or direction for this prompt</label>
    <input id="direction" placeholder="Leave blank to let the AI choose">
    <div class="bar"><button id="generatePrompt" class="pri" onclick="generatePrompt(this,'${p.id}')">Generate one 10-second video prompt</button></div>
    <p class="muted">This makes one AI request, uses the 10 most recent saved prompts for continuity, and saves the result to the selected date. It does not generate a script or send anything to Flow.</p>
  </section>
  <section class="card">
    <h3>Save a prompt you already have</h3>
    <label for="externalPrompt">Paste prompt</label><textarea id="externalPrompt" placeholder="Paste a prompt generated elsewhere"></textarea>
    <button class="pri" onclick="saveExternalPrompt('${p.id}')">Save prompt to selected date</button>
  </section>
  ${vGuidance(p)}
  <section><h3>Prompt history</h3><div id="history">${renderPromptHistory(p.id)}</div></section>`;
}

function renderPromptHistory(pid) {
  const records = promptRecords(pid);
  if (!records.length) return '<p class="muted">No prompts saved yet. Generate one or paste a prompt above.</p>';
  let date = null, html = "";
  for (const r of records) {
    const heading = r.date || "Date not recorded";
    if (heading !== date) {
      date = heading;
      html += `<h3 class="date-heading">${esc(heading)}</h3>`;
    }
    html += `<article class="card prompt-record">
      <div class="bar record-meta"><span class="muted">${esc(r.source)}</span>
        <button class="sm" onclick="copyPrompt('${r.key}')">Copy</button>
        <button class="sm danger" onclick="removePrompt('${r.key}')">Delete</button>
      </div>
      <textarea id="record-${r.key}" aria-label="Saved prompt">${esc(r.text)}</textarea>
      <button class="sm" onclick="updatePrompt('${r.key}')">Save changes</button>
    </article>`;
  }
  return html;
}

function saveExternalPrompt(pid) {
  const date = $("#promptDate").value || today();
  const text = $("#externalPrompt").value.trim();
  if (!text) return alert("Paste a prompt before saving.");
  savePromptRecord(pid, date, text, "Added manually");
  $("#externalPrompt").value = "";
  status("prompt saved ✓");
  render();
}

function findPromptRecord(key) { return promptRecords(cur).find(r => r.key === key); }

function copyPrompt(key) {
  const record = findPromptRecord(key);
  if (record) copy(record.text);
}

function updatePrompt(key) {
  const record = findPromptRecord(key), input = document.getElementById("record-" + key);
  if (!record || !input) return;
  updatePromptRecord(record, input.value);
  status("prompt updated ✓");
}

function removePrompt(key) {
  const record = findPromptRecord(key);
  if (!record || !confirm("Delete this saved prompt?")) return;
  deletePromptRecord(record);
}
