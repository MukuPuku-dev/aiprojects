const grid = document.getElementById("project-grid");
const search = document.getElementById("project-search");
const emptyState = document.getElementById("empty-state");
const projectCount = document.getElementById("project-count");
const gkJobKey = "gk_flow_job";
const gkProgressKey = "gk_completed_days";
let gkJob = null;
let gkMessage = "";
let gkStarting = false;
let gkPollTimer;

function readGkJob() {
  const raw = localStorage.getItem(gkJobKey);
  if (!raw) return null;
  const job = JSON.parse(raw);
  if (!job || typeof job.id !== "string" || !Number.isInteger(job.day) || job.day < 1 || job.day > GK_DAYS.length ||
      !["submitting", "queued", "running", "completed", "failed", "unknown"].includes(job.status)) {
    throw new Error("Saved Flow job information is invalid.");
  }
  return job;
}

function saveGkJob(job) {
  localStorage.setItem(gkJobKey, JSON.stringify(job));
  gkJob = job;
}

function updateGkCard() {
  const card = grid.querySelector('[data-flow-project="gk-questions"]');
  if (!card) return;
  const button = card.querySelector(".generate-next");
  const status = card.querySelector(".generate-status");
  const message = status.querySelector("span");
  const video = status.querySelector("a");
  const active = gkJob && ["submitting", "queued", "running"].includes(gkJob.status);
  button.disabled = gkStarting || !!active;
  video.hidden = true;
  let text = gkMessage;
  if (!text && gkJob) {
    if (active) text = `Day ${gkJob.day} marked done. ${gkJob.status === "queued" ? "Waiting for Flow…" : "Generating in Flow…"} You can keep working.`;
    else if (gkJob.status === "completed") {
      text = `Day ${gkJob.day} is ready.`;
      const expected = `projects/gk-questions/videos/day-${String(gkJob.day).padStart(2, "0")}.mp4`;
      if (gkJob.file === expected) { video.href = "/" + expected; video.hidden = false; }
      else text = `Day ${gkJob.day} finished, but its video path was invalid.`;
    } else {
      text = `Day ${gkJob.day}: ${gkJob.error || "The job status is unknown."} It remains marked done; check the video and uncheck that day in the workspace if you need to retry.`;
    }
  }
  message.textContent = text;
  status.hidden = !text;
}

async function pollGkJob() {
  clearTimeout(gkPollTimer);
  if (!gkJob || !["submitting", "queued", "running"].includes(gkJob.status)) return;
  const id = gkJob.id;
  try {
    const response = await fetch(`/api/generation-jobs/${encodeURIComponent(id)}`);
    const body = await response.json();
    if (!gkJob || gkJob.id !== id) return;
    if (response.status === 404 && gkJob.status === "submitting" && Date.now() - gkJob.createdAt < 15000) {
      gkMessage = "Waiting for the generator to accept the job…";
    } else if (response.status === 404) {
      saveGkJob({ ...gkJob, status: "unknown", error: body.error || "Job not found; the generator may have restarted." });
      gkMessage = "";
    } else {
      if (!response.ok || !body.ok) throw new Error(body.error || "Could not check the job.");
      if (body.id !== id || body.day !== gkJob.day || !["queued", "running", "completed", "failed"].includes(body.status)) throw new Error("Invalid job status returned by the generator.");
      saveGkJob({ ...gkJob, status: body.status, file: body.file, error: body.error });
      gkMessage = "";
    }
  } catch (error) {
    gkMessage = `Cannot check Flow yet: ${error.message}. The job may still be running; retrying…`;
  }
  updateGkCard();
  if (gkJob && ["submitting", "queued", "running"].includes(gkJob.status)) gkPollTimer = setTimeout(pollGkJob, 3000);
}

async function generateNextGk() {
  if (gkStarting) return;
  gkStarting = true;
  gkMessage = "Checking Flow settings and saved progress…";
  updateGkCard();
  let marked = false;
  try {
    if (location.protocol === "file:") throw new Error("Start Story Studio using Start Story Studio.vbs, then use the Flow icon there.");
    const existing = readGkJob();
    if (existing && ["submitting", "queued", "running"].includes(existing.status)) {
      gkJob = existing;
      gkMessage = "";
      pollGkJob();
      return;
    }
    const [healthResponse, settingsResponse] = await Promise.all([
      fetch("/api/health"), fetch("/api/flow-settings?project=gk-questions")
    ]);
    const health = await healthResponse.json();
    const settings = await settingsResponse.json();
    if (!healthResponse.ok || health.jobApi !== 1) throw new Error("The generator needs an update. Reopen Start Story Studio.vbs and approve the restart.");
    if (!settingsResponse.ok || !settings.ok) throw new Error(settings.error || "Could not load Flow settings.");
    const { model, aspect, duration } = settings.effective.video;
    if (duration !== "10s") throw new Error("GK prompts require 10 seconds. Set the GK Questions duration to 10s in Flow settings.");
    const raw = localStorage.getItem(gkProgressKey);
    if (raw === null && !confirm("No saved GK progress was found in this browser and studio address. Start with Day 1? Cancel if you need to mark completed days first.")) {
      gkMessage = "No clip started. Mark completed days in the GK workspace first.";
      return;
    }
    const latest = readGkJob();
    if (latest && ["submitting", "queued", "running"].includes(latest.status)) {
      gkJob = latest;
      gkMessage = "";
      pollGkJob();
      return;
    }
    const saved = JSON.parse(localStorage.getItem(gkProgressKey) || "[]");
    if (!Array.isArray(saved) || saved.some(n => !Number.isInteger(Number(n)) || Number(n) < 0 || Number(n) >= GK_DAYS.length)) throw new Error("Saved GK progress is invalid.");
    const done = new Set(saved.map(Number));
    const index = GK_DAYS.findIndex((_, i) => !done.has(i));
    if (index < 0) { gkMessage = "All 30 original GK clips are already marked done."; return; }
    const job = { id: crypto.randomUUID(), day: index + 1, status: "submitting", createdAt: Date.now() };
    const prompt = gkPromptFor(GK_DAYS[index], index, aspect);
    saveGkJob(job);
    try {
      done.add(index);
      localStorage.setItem(gkProgressKey, JSON.stringify([...done].sort((a, b) => a - b)));
      marked = true;
    } catch (error) {
      localStorage.removeItem(gkJobKey);
      gkJob = null;
      throw error;
    }
    gkMessage = "";
    updateGkCard();
    const response = await fetch("/api/generation-jobs", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ id: job.id, project: "gk-questions", day: job.day, prompt, model, aspect, duration })
    });
    const body = await response.json();
    if (!response.ok || !body.ok) {
      saveGkJob({ ...job, status: "failed", error: body.error || "Could not start the job." });
    } else if (body.id !== job.id || body.day !== job.day || !["queued", "running"].includes(body.status)) {
      throw new Error("The generator returned an unexpected job.");
    } else {
      saveGkJob({ ...job, status: body.status });
    }
    pollGkJob();
  } catch (error) {
    if (marked) {
      gkMessage = `Could not confirm the job: ${error.message}. Checking the generator; Day ${gkJob.day} remains marked done.`;
      gkPollTimer = setTimeout(pollGkJob, 3000);
    } else {
      gkMessage = `Could not start: ${error.message}. Your progress was not changed.`;
    }
  } finally {
    gkStarting = false;
    updateGkCard();
  }
}

function renderProjects(query = "") {
  const term = query.trim().toLowerCase();
  const matches = PROJECTS.filter(project =>
    [project.name, project.type, project.description].some(value => value.toLowerCase().includes(term))
  );

  grid.replaceChildren(...matches.map(project => {
    const card = document.createElement("article");
    card.className = `project-card ${project.accent}`;

    const top = document.createElement("div");
    top.className = "card-top";
    const mark = document.createElement("span");
    mark.className = "project-mark";
    mark.textContent = project.mark;
    mark.setAttribute("aria-hidden", "true");
    const type = document.createElement("span");
    type.className = "project-type";
    type.textContent = project.type;
    top.append(mark, type);
    if (project.finished) {
      const finished = document.createElement("span");
      finished.className = "project-finished";
      finished.textContent = "✓ Finished";
      top.append(finished);
    }
    if (project.flowNext && project.href.includes("gk-questions")) {
      card.dataset.flowProject = "gk-questions";
      const generate = document.createElement("button");
      generate.type = "button";
      generate.className = "generate-next";
      generate.title = "Generate next clip with Flow";
      generate.setAttribute("aria-label", `Generate next ${project.name} clip with Flow`);
      generate.textContent = "▶";
      generate.addEventListener("click", generateNextGk);
      top.append(generate);
    }

    const title = document.createElement("h3");
    title.textContent = project.name;
    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.description;
    const open = document.createElement("a");
    open.className = "open-project";
    open.href = project.href;
    open.textContent = "Open workspace";
    open.setAttribute("aria-label", `Open ${project.name} workspace`);
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    open.append(arrow);

    card.append(top, title, description, open);
    if (project.flowNext && project.href.includes("gk-questions")) {
      const status = document.createElement("p");
      status.className = "generate-status";
      status.setAttribute("role", "status");
      const message = document.createElement("span");
      const video = document.createElement("a");
      video.textContent = "Open video";
      video.target = "_blank";
      video.rel = "noopener";
      video.hidden = true;
      status.append(message, video);
      card.append(status);
    }
    return card;
  }));

  emptyState.hidden = matches.length > 0;
  projectCount.textContent = `${PROJECTS.length} ${PROJECTS.length === 1 ? "project" : "projects"} · ready to continue`;
  updateGkCard();
  window.dispatchEvent(new Event("projects-rendered"));
}

search.addEventListener("input", () => renderProjects(search.value));
try { gkJob = readGkJob(); } catch (error) { gkMessage = error.message; }
window.addEventListener("storage", event => {
  if (event.key !== gkJobKey) return;
  try { gkJob = readGkJob(); gkMessage = ""; pollGkJob(); }
  catch (error) { gkMessage = error.message; updateGkCard(); }
});
renderProjects();
pollGkJob();
