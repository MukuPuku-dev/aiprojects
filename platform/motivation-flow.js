(() => {
  const project = "daily-motivations";
  const jobKey = "motivation_flow_job";
  const progressKey = "dailymotivations-v1";
  let job = null, message = "", starting = false, timer;

  function readJob() {
    const raw = localStorage.getItem(jobKey);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (!value || typeof value.id !== "string" || !Number.isInteger(value.day) ||
        value.day < 1 || value.day > VIDEOS.length ||
        !["submitting", "queued", "running", "completed", "failed", "unknown"].includes(value.status)) {
      throw new Error("Saved motivation Flow job information is invalid.");
    }
    return value;
  }
  function saveJob(value) { localStorage.setItem(jobKey, JSON.stringify(value)); job = value; }
  function update() {
    const card = document.querySelector('[data-flow-project="daily-motivations"]');
    if (!card) return;
    const button = card.querySelector(".generate-next");
    const status = card.querySelector(".motivation-status");
    const active = job && ["submitting", "queued", "running"].includes(job.status);
    button.disabled = starting || !!active;
    let text = message;
    if (!text && job) {
      if (active) text = `Day ${job.day} marked done. ${job.status === "queued" ? "Waiting for Flow…" : "Generating in Flow…"} You can keep working.`;
      else if (job.status === "completed") text = `Day ${job.day} is ready.`;
      else text = `Day ${job.day}: ${job.error || "Job status unknown."} It remains marked done; uncheck it in the workspace to retry.`;
    }
    status.textContent = text;
    status.hidden = !text;
  }
  async function poll() {
    clearTimeout(timer);
    if (!job || !["submitting", "queued", "running"].includes(job.status)) return;
    const id = job.id;
    try {
      const response = await fetch(`/api/generation-jobs/${encodeURIComponent(id)}`);
      const body = await response.json();
      if (!job || job.id !== id) return;
      if (response.status === 404 && job.status === "submitting" && Date.now() - job.createdAt < 15000) {
        message = "Waiting for the generator to accept the job…";
      } else if (response.status === 404) {
        saveJob({ ...job, status: "unknown", error: body.error || "Generator restarted." });
        message = "";
      } else {
        if (!response.ok || !body.ok || body.id !== id || body.day !== job.day ||
            !["queued", "running", "completed", "failed"].includes(body.status)) throw new Error(body.error || "Invalid job status.");
        saveJob({ ...job, status: body.status, file: body.file, error: body.error });
        message = "";
      }
    } catch (error) { message = `Cannot check Flow yet: ${error.message}. Retrying…`; }
    update();
    if (job && ["submitting", "queued", "running"].includes(job.status)) timer = setTimeout(poll, 3000);
    else window.dispatchEvent(new Event("videos-changed"));
  }
  async function generate() {
    if (starting) return;
    starting = true;
    message = "Checking Flow settings and saved progress…";
    update();
    let marked = false;
    try {
      if (location.protocol === "file:") throw new Error("Open Story Studio through the local server.");
      const existing = readJob();
      if (existing && ["submitting", "queued", "running"].includes(existing.status)) {
        job = existing; message = ""; poll(); return;
      }
      const [healthResponse, settingsResponse] = await Promise.all([
        fetch("/api/health"), fetch(`/api/flow-settings?project=${project}`)
      ]);
      const health = await healthResponse.json(), settings = await settingsResponse.json();
      if (!healthResponse.ok || health.jobApi !== 1) throw new Error("The generator needs an update. Reopen Start Story Studio and approve the restart.");
      if (!settingsResponse.ok || !settings.ok) throw new Error(settings.error || "Could not load Flow settings.");
      const raw = localStorage.getItem(progressKey);
      if (raw === null && !confirm("No saved Daily Motivations progress was found in this browser. Start with Day 1?")) {
        message = "No clip started. Mark completed days in the workspace first."; return;
      }
      const state = raw ? JSON.parse(raw) : { done: {} };
      if (!state || typeof state !== "object" || !state.done || typeof state.done !== "object" || Array.isArray(state.done)) throw new Error("Saved motivation progress is invalid.");
      const index = VIDEOS.findIndex((_, i) => !state.done[i + 1]);
      if (index < 0) { message = "All 30 motivation clips are already marked done."; return; }
      const video = state.picked ? { model: state.model, aspect: state.ar, duration: state.dur } : settings.effective.video;
      if (video.duration !== "10s") throw new Error("Motivation prompts require 10 seconds. Select 10s in the workspace or Flow settings.");
      const latest = readJob();
      if (latest && ["submitting", "queued", "running"].includes(latest.status)) { job = latest; message = ""; poll(); return; }
      const next = { id: crypto.randomUUID(), day: index + 1, status: "submitting", createdAt: Date.now() };
      saveJob(next);
      try {
        state.done[index + 1] = true;
        localStorage.setItem(progressKey, JSON.stringify(state));
        marked = true;
      } catch (error) { localStorage.removeItem(jobKey); job = null; throw error; }
      message = ""; update();
      const response = await fetch("/api/generation-jobs", {
        method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
        body: JSON.stringify({ id: next.id, project, day: next.day, prompt: motivationPromptFor(index, video.aspect), ...video })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) saveJob({ ...next, status: "failed", error: body.error || "Could not start the job." });
      else if (body.id !== next.id || body.day !== next.day || !["queued", "running"].includes(body.status)) throw new Error("The generator returned an unexpected job.");
      else saveJob({ ...next, status: body.status });
      poll();
    } catch (error) {
      if (marked) { message = `Could not confirm the job: ${error.message}. Checking the generator; Day ${job.day} remains marked done.`; timer = setTimeout(poll, 3000); }
      else message = `Could not start: ${error.message}. Your progress was not changed.`;
    } finally { starting = false; update(); }
  }
  function render() {
    const link = document.querySelector('a[href="projects/daily-motivations/index.html"]');
    if (!link) return;
    const card = link.closest(".project-card");
    card.dataset.flowProject = project;
    const button = document.createElement("button");
    button.type = "button"; button.className = "generate-next"; button.textContent = "▶";
    button.title = "Generate next clip with Flow";
    button.setAttribute("aria-label", "Generate next Daily Motivations clip with Flow");
    button.addEventListener("click", generate);
    card.querySelector(".card-top").append(button);
    const status = document.createElement("p");
    status.className = "motivation-status";
    status.setAttribute("role", "status");
    card.append(status);
    update();
  }
  window.addEventListener("projects-rendered", render);
  window.addEventListener("storage", event => {
    if (event.key !== jobKey) return;
    try { job = readJob(); message = ""; poll(); update(); } catch (error) { message = error.message; update(); }
  });
  try { job = readJob(); } catch (error) { message = error.message; }
  render(); poll();
})();
