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

const PROGRESS_STORAGE_KEYS = {
  "daily-motivations": "dailymotivations-v1",
  "teenage-love-vibes": "teenage-love-vibes-v1",
  "maya-photos": "maya-photos-v1",
  "jindagi-kitaab": "jindagi-kitaab-v1",
  "kam-nalagne": "kam-nalagne-v1",
  "sadhu-rani": "sadhu-rani-v1",
  "tarkari-katha": "tarkari-katha-v1",
  "stickman-lantern": "stickman-lantern-v1",
  "ink-explainer": "ink-explainer-v1",
  "images-from-csv": "images-from-csv-v1",
  "purplestick": "purplestick-v1"
};
const SERIES_LABELS = {
  "kam-nalagne": "काम नलाग्ने कोही हुँदैन",
  "sadhu-rani": "साधु र राडी",
  "teenage-love-vibes": "Teenage Love Vibes",
  "tarkari-katha": "तरकारीको कथा",
  "stickman-lantern": "The Last Lantern",
  "ink-explainer": "Ink Explainer",
  "purplestick": "PurpleStick"
};

function projectIdFromCard(project) {
  if (project.id) return project.id;
  const m = String(project.href || "").match(/projects\/([a-z0-9-]+)\//);
  return m ? m[1] : "";
}

function pushGkCloudProgress(doneIndices) {
  const checked = {};
  (doneIndices || []).forEach(n => {
    if (Number.isInteger(Number(n)) && Number(n) >= 0) checked[String(n)] = true;
  });
  window.StoryStudioStorage?.saveProjectProgress?.("gk-questions", {
    totalClips: GK_DAYS.length,
    completedCount: Object.keys(checked).length,
    checked,
    state: { done: [...doneIndices].sort((a, b) => a - b) }
  });
}

function uncheckGkDay(day) {
  try {
    const saved = JSON.parse(localStorage.getItem(gkProgressKey) || "[]");
    if (!Array.isArray(saved)) return;
    const next = [...new Set(saved.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < GK_DAYS.length && n !== day - 1))].sort((a, b) => a - b);
    localStorage.setItem(gkProgressKey, JSON.stringify(next));
    pushGkCloudProgress(next);
  } catch {}
}

function syncFailedGkJob(job) {
  if (job && ["failed", "unknown"].includes(job.status) && !job.unchecked) {
    uncheckGkDay(job.day);
    job = { ...job, unchecked: true };
    localStorage.setItem(gkJobKey, JSON.stringify(job));
  }
  return job;
}

function readGkJob() {
  const raw = localStorage.getItem(gkJobKey);
  if (!raw) return null;
  const job = JSON.parse(raw);
  if (!job || typeof job.id !== "string" || !Number.isInteger(job.day) || job.day < 1 || job.day > GK_DAYS.length ||
      !["submitting", "queued", "running", "completed", "failed", "unknown"].includes(job.status)) {
    throw new Error("Saved Flow job information is invalid.");
  }
  return syncFailedGkJob(job);
}

function saveGkJob(job) {
  job = syncFailedGkJob(job);
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
      text = `Day ${gkJob.day}: ${gkJob.error || "The job status is unknown."} Day ${gkJob.day} was unchecked automatically so you can retry.`;
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
  else if (gkJob && gkJob.status === "completed") {
    const runTt = gkJob.autoPost && !gkJob.autoPosted;
    const runFb = gkJob.autoPostFacebook && !gkJob.autoPostedFacebook;
    const runTg = gkJob.autoPostTelegram && !gkJob.autoPostedTelegram;
    if (runTt || runFb || runTg) {
      saveGkJob({
        ...gkJob,
        autoPosted: gkJob.autoPosted || runTt,
        autoPostedFacebook: gkJob.autoPostedFacebook || runFb,
        autoPostedTelegram: gkJob.autoPostedTelegram || runTg
      });
      (async () => {
        if (runTt) await window.StoryStudioTikTok?.autoPostDay?.("gk-questions", gkJob.day);
        if (runFb) await window.StoryStudioFacebook?.autoPostDay?.("gk-questions", gkJob.day);
        if (runTg) await window.StoryStudioTelegram?.autoPostDay?.("gk-questions", gkJob.day);
      })();
    }
  }
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
    const autoPost = Boolean(settings.effective?.tiktok?.autoPost ?? window.StoryStudioTikTok?.isAutoPostEnabled?.());
    const autoPostFacebook = Boolean(settings.effective?.facebook?.autoPost ?? window.StoryStudioFacebook?.isAutoPostEnabled?.());
    const autoPostTelegram = Boolean(settings.effective?.telegram?.autoPost ?? window.StoryStudioTelegram?.isAutoPostEnabled?.());
    const job = { id: crypto.randomUUID(), day: index + 1, status: "submitting", createdAt: Date.now(), autoPost, autoPostFacebook, autoPostTelegram };
    const prompt = gkPromptFor(GK_DAYS[index], index, aspect);
    saveGkJob(job);
    try {
      done.add(index);
      const sorted = [...done].sort((a, b) => a - b);
      localStorage.setItem(gkProgressKey, JSON.stringify(sorted));
      pushGkCloudProgress(sorted);
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

    const pid = projectIdFromCard(project);
    const title = document.createElement("h3");
    title.textContent = project.name;
    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.description;

    const progWrap = document.createElement("div");
    progWrap.className = "project-progress";
    progWrap.dataset.progressProject = pid;
    const progLabel = document.createElement("div");
    progLabel.className = "project-progress-label";
    const progLeft = document.createElement("span");
    const progPct = document.createElement("span");
    progLabel.append(progLeft, progPct);
    const progBar = document.createElement("div");
    progBar.className = "project-progress-bar";
    const progFill = document.createElement("i");
    progBar.append(progFill);
    progWrap.append(progLabel, progBar);
    updateProgressBarEl(progWrap, pid, project.totalClips || 30, isPhotoProject(pid));

    const open = document.createElement("a");
    open.className = "open-project";
    open.href = project.href;
    open.textContent = "Open workspace";
    open.setAttribute("aria-label", `Open ${project.name} workspace`);
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    open.append(arrow);

    card.append(top, title, description, progWrap, open);
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

function isPhotoProject(pid) {
  return pid === "maya-photos" || pid === "jindagi-kitaab" || pid === "ink-explainer" || pid === "images-from-csv";
}

function readLocalSummary(pid, defaultTotal) {
  let total = defaultTotal || 30;
  let completed = 0;
  try {
    if (pid === "gk-questions") {
      const raw = localStorage.getItem(gkProgressKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) completed = new Set(arr.map(Number).filter(Number.isInteger)).size;
      }
    } else if (PROGRESS_STORAGE_KEYS[pid]) {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEYS[pid]);
      if (raw) {
        const st = JSON.parse(raw);
        const doneMap = st?.done && typeof st.done === "object" ? st.done : {};
        completed = Object.values(doneMap).filter(Boolean).length;
      }
    }
    const metaRaw = localStorage.getItem("studio_progress_meta_" + pid);
    if (metaRaw) {
      const meta = JSON.parse(metaRaw);
      if (meta?.totalClips > total) total = meta.totalClips;
      if (completed === 0 && typeof meta?.completedCount === "number") completed = meta.completedCount;
    }
  } catch {}
  return { completed: Math.min(completed, total), total };
}

function updateProgressBarEl(progWrap, pid, defaultTotal, isPhoto, overrideRecord) {
  const summary = overrideRecord
    ? {
        completed: Math.max(readLocalSummary(pid, defaultTotal).completed, Number(overrideRecord.completedCount || 0)),
        total: Math.max(defaultTotal || 30, Number(overrideRecord.totalClips || 0))
      }
    : readLocalSummary(pid, defaultTotal);
  const pct = summary.total ? Math.round((summary.completed / summary.total) * 100) : 0;
  const spans = progWrap.querySelectorAll(".project-progress-label span");
  if (spans[0]) spans[0].textContent = `${summary.completed} / ${summary.total} ${isPhoto ? "photos" : "clips"} done`;
  if (spans[1]) spans[1].textContent = `${pct}%`;
  const fill = progWrap.querySelector(".project-progress-bar i");
  if (fill) fill.style.width = `${pct}%`;
}

function mergeRemoteRecordIntoLocal(pid, rec) {
  if (!rec || typeof rec !== "object") return;
  const checked = rec.checked && typeof rec.checked === "object" ? rec.checked : {};
  const remoteKeys = Object.keys(checked).filter(k => checked[k]);
  if (remoteKeys.length === 0) return;
  try {
    if (pid === "gk-questions") {
      const raw = localStorage.getItem(gkProgressKey);
      const localArr = raw ? JSON.parse(raw) : [];
      const merged = new Set(Array.isArray(localArr) ? localArr.map(Number).filter(Number.isInteger) : []);
      remoteKeys.forEach(k => {
        const n = Number(k);
        if (Number.isInteger(n) && n >= 0 && n < GK_DAYS.length) merged.add(n);
      });
      localStorage.setItem(gkProgressKey, JSON.stringify([...merged].sort((a, b) => a - b)));
    } else if (PROGRESS_STORAGE_KEYS[pid]) {
      const key = PROGRESS_STORAGE_KEYS[pid];
      const raw = localStorage.getItem(key);
      const localState = raw ? JSON.parse(raw) : { done: {} };
      const done = { ...(localState?.done || {}) };
      remoteKeys.forEach(k => { done[k] = true; });
      localStorage.setItem(key, JSON.stringify({ ...(rec.state || {}), ...localState, done }));
    }
  } catch {}
}

async function hydrateCloudProgress() {
  const statusEl = document.getElementById("cloud-sync-status");
  if (!window.StoryStudioStorage?.loadAllProjectProgress) {
    if (statusEl) statusEl.textContent = "Local storage mode";
    return;
  }
  const { progress, error } = await window.StoryStudioStorage.loadAllProjectProgress();
  Object.entries(progress || {}).forEach(([pid, rec]) => {
    mergeRemoteRecordIntoLocal(pid, rec);
    const wrap = document.querySelector(`.project-progress[data-progress-project="${pid}"]`);
    const proj = PROJECTS.find(p => projectIdFromCard(p) === pid);
    if (wrap) updateProgressBarEl(wrap, pid, proj?.totalClips || 30, isPhotoProject(pid), rec);
  });
  if (statusEl) {
    statusEl.textContent = error
      ? "Cloud sync offline (cached locally)"
      : window.StoryStudioStorage.canUseRemoteCloud()
        ? "Synced with Turso cloud DB ✓"
        : "Cloud ready (test sandbox active)";
  }
}

async function initCharacterVault() {
  const filtersEl = document.getElementById("vault-filters");
  const gridEl = document.getElementById("vault-grid");
  const addBtn = document.getElementById("toggle-add-char");
  const cancelBtn = document.getElementById("cancel-add-char");
  const formEl = document.getElementById("add-char-form");
  if (!filtersEl || !gridEl || !window.StoryStudioStorage?.listCharacters) return;

  let activeSeries = "all";
  let characters = [];
  const assetCache = new Map();
  const storages = new Map();

  function getStorage(pid) {
    const id = pid || "default";
    if (!storages.has(id)) storages.set(id, window.StoryStudioStorage.createProjectStorage({ projectId: id }));
    return storages.get(id);
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const im = new Image();
      const url = URL.createObjectURL(file);
      im.onload = () => {
        try {
          const w = Math.min(1024, im.width || 1024);
          const h = Math.round((im.height || w) * w / (im.width || w));
          const c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(im, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", 0.85));
        } catch (err) { reject(err); }
        finally { URL.revokeObjectURL(url); }
      };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not decode image.")); };
      im.src = url;
    });
  }

  async function loadAssetUrl(pid, assetKey) {
    if (!assetKey) return null;
    const cacheKey = `${pid}:${assetKey}`;
    if (assetCache.has(cacheKey)) return assetCache.get(cacheKey);
    await getStorage(pid).listAssets([assetKey]).catch(() => {});
    let res = await getStorage(pid).getAssets([assetKey]);
    let url = res?.assets?.[assetKey] || null;
    if (!url && pid !== "default") {
      await getStorage("default").listAssets([assetKey]).catch(() => {});
      res = await getStorage("default").getAssets([assetKey]);
      url = res?.assets?.[assetKey] || null;
    }
    assetCache.set(cacheKey, url);
    return url;
  }

  async function reloadCharacters() {
    await window.StoryStudioStorage.seedDefaultCharacters?.();
    const res = await window.StoryStudioStorage.listCharacters();
    characters = Array.isArray(res) ? res : [];
    renderVault();
  }

  function renderVaultFilters() {
    const ids = [...new Set(characters.map(c => c.project_id))];
    const chips = [
      { id: "all", label: `All Series (${characters.length})` },
      ...ids.map(id => ({
        id,
        label: `${SERIES_LABELS[id] || id} (${characters.filter(c => c.project_id === id).length})`
      }))
    ];
    filtersEl.replaceChildren(...chips.map(ch => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `vault-btn${activeSeries === ch.id ? " active" : ""}`;
      btn.textContent = ch.label;
      btn.onclick = () => { activeSeries = ch.id; renderVault(); };
      return btn;
    }));
  }

  function renderVault() {
    renderVaultFilters();
    const visible = activeSeries === "all" ? characters : characters.filter(c => c.project_id === activeSeries);
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No saved characters in this series yet.";
      gridEl.replaceChildren(empty);
      return;
    }
    const defaultIds = new Set((window.StoryStudioStorage.DEFAULT_CHARACTERS || []).map(d => d.id));
    const cards = visible.map(ch => {
      const card = document.createElement("article");
      card.className = "vault-card";
      const pid = ch.project_id;
      const assetKey = ch.image_key || ("char-" + ch.code);
      const promptText = ch.ref_prompt || ch.appearance || "";

      const head = document.createElement("div");
      head.className = "vault-card-head";
      const series = document.createElement("span");
      series.className = "vault-series";
      series.textContent = ch.project_name || SERIES_LABELS[pid] || pid;
      const key = document.createElement("span");
      key.className = "vault-key";
      key.textContent = assetKey;
      head.append(series, key);

      const title = document.createElement("h3");
      title.textContent = ch.name;
      const role = document.createElement("p");
      role.className = "vault-role";
      role.textContent = ch.role;

      const thumbSlot = document.createElement("div");
      const emptyThumb = document.createElement("div");
      emptyThumb.className = "vault-thumb-empty";
      emptyThumb.textContent = "No reference image yet · Upload or open workspace";
      thumbSlot.append(emptyThumb);

      if (assetKey) {
        loadAssetUrl(pid, assetKey).then(url => {
          if (!url) return;
          const img = document.createElement("img");
          img.className = "vault-thumb";
          img.src = url;
          img.alt = `${ch.name} reference`;
          thumbSlot.replaceChildren(img);
        }).catch(() => {});
      }

      const promptP = document.createElement("p");
      promptP.className = "vault-prompt";
      promptP.textContent = promptText;

      const btns = document.createElement("div");
      btns.className = "vault-card-btns";

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "vault-btn";
      copyBtn.textContent = "Copy Prompt";
      copyBtn.onclick = async () => {
        try { await navigator.clipboard.writeText(promptText); } catch {}
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => { copyBtn.textContent = "Copy Prompt"; }, 1400);
      };

      const upLabel = document.createElement("label");
      upLabel.className = "vault-btn";
      upLabel.textContent = "Upload Ref";
      const fileIn = document.createElement("input");
      fileIn.type = "file";
      fileIn.accept = "image/*";
      fileIn.hidden = true;
      fileIn.onchange = async () => {
        const f = fileIn.files?.[0];
        if (!f || !assetKey) return;
        upLabel.textContent = "Saving…";
        try {
          const dataUrl = await fileToDataUrl(f);
          await getStorage(pid).saveAsset(assetKey, dataUrl);
          assetCache.set(`${pid}:${assetKey}`, dataUrl);
          const img = document.createElement("img");
          img.className = "vault-thumb";
          img.src = dataUrl;
          img.alt = `${ch.name} reference`;
          thumbSlot.replaceChildren(img);
        } finally {
          upLabel.textContent = "Upload Ref";
        }
      };
      upLabel.append(fileIn);

      btns.append(copyBtn, upLabel);

      if (!defaultIds.has(ch.id)) {
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "vault-btn";
        delBtn.textContent = "Delete";
        delBtn.onclick = async () => {
          await window.StoryStudioStorage.deleteCharacter(ch.id);
          await reloadCharacters();
        };
        btns.append(delBtn);
      }

      card.append(head, title, role, thumbSlot, promptP, btns);
      return card;
    });
    gridEl.replaceChildren(...cards);
  }

  if (addBtn && formEl) {
    addBtn.onclick = () => { formEl.hidden = !formEl.hidden; };
  }
  if (cancelBtn && formEl) {
    cancelBtn.onclick = () => { formEl.hidden = true; formEl.reset(); };
  }
  if (formEl) {
    formEl.onsubmit = async e => {
      e.preventDefault();
      const projectId = document.getElementById("vc-project").value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "custom-series";
      const name = document.getElementById("vc-name").value.trim();
      const role = document.getElementById("vc-role").value.trim();
      const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") || `C${Date.now()}`;
      const assetKey = document.getElementById("vc-asset").value.trim() || `char-${code}`;
      const prompt = document.getElementById("vc-prompt").value.trim();
      if (!name || !prompt) return;
      await window.StoryStudioStorage.saveCharacter({
        id: `${projectId}:${code}`,
        project_id: projectId,
        project_name: SERIES_LABELS[projectId] || projectId,
        code,
        name,
        role: role || "Series character",
        appearance: prompt,
        ref_prompt: prompt,
        image_key: assetKey
      });
      formEl.reset();
      formEl.hidden = true;
      activeSeries = projectId;
      await reloadCharacters();
    };
  }

  await reloadCharacters();
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
hydrateCloudProgress();
initCharacterVault();
