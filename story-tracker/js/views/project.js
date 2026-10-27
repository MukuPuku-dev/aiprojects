// Project selection, project creation, and project guidance.
function renderSide() {
  $("#plist").innerHTML = projects().map(p => `<div class="proj ${p.id === cur ? "on" : ""}" onclick="openProject('${p.id}')">${esc(p.data.name)}<small>${promptRecords(p.id).length} saved prompts</small></div>`).join("") || '<p class="muted">No projects yet.</p>';
}

function render() {
  renderSide();
  const p = D[cur];
  if (!p) {
    $("#main").innerHTML = `<div class="welcome"><h2>Prompt tracker</h2><p>Choose a project or add one to keep dated prompt records and generate a new prompt when you need it.</p><button class="pri" onclick="newProject()">+ Add project</button></div>`;
    return;
  }
  vProject(p);
}

function openProject(id) { cur = id; render(); }

function newProject() {
  const name = prompt("Project name?");
  if (!name || !name.trim()) return;
  const id = uid();
  D[id] = {id, kind: "project", pid: "", updated: 0, data: {name: name.trim(), premise: "", characters: "", style: "", rules: ""}};
  save(id);
  openProject(id);
}

function vProject(p) {
  $("#main").innerHTML = `<div class="project-head"><h2>${esc(p.data.name)}</h2><span class="muted">${promptRecords(p.id).length} saved prompts</span></div>
  <div id="view"></div>`;
  vEpisodes(p);
}

function vGuidance(p) {
  const f = (key, label, placeholder) => `<label>${label}</label><textarea oninput="bind('${p.id}','${key}',this)" placeholder="${placeholder}">${esc(p.data[key] || "")}</textarea>`;
  return `<details class="card guidance"><summary>Project continuity guidance</summary>
    <p class="muted">Optional details used when generating a prompt. Saved prompt history is also included to help avoid repetition.</p>
    ${f("premise", "Project / story / topic", "What is this project about?")}
    ${f("characters", "Characters or subject", "Descriptions and details that should stay consistent")}
    ${f("style", "Visual style", "Look, lighting, format, or other style preferences")}
    ${f("rules", "Other requirements", "Language, exclusions, or rules to follow")}
    <button onclick="renameProject('${p.id}')">Rename project</button>
    <button class="danger" onclick="deleteProject('${p.id}')">Delete project</button>
  </details>`;
}

function renameProject(id) {
  const name = prompt("Project name?", D[id].data.name);
  if (!name || !name.trim()) return;
  D[id].data.name = name.trim();
  save(id);
  render();
}

async function deleteProject(id) {
  if (!confirm(`Delete "${D[id].data.name}" and its saved prompt records? This cannot be undone.`)) return;
  for (const d of Object.values(D)) if (d.pid === id || d.id === id) await removeDoc(d.id);
  cur = null;
  render();
}
