(() => {
  function attachRunner(cfg) {
    let job = null, message = "", starting = false, timer;
    const itemLabel = day => (cfg.mode === "image" ? `Photo #${day}` : `Day ${day}`);

    function readState() {
      const raw = localStorage.getItem(cfg.progressKey);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || typeof state !== "object") throw new Error(`Saved ${cfg.label} progress is invalid.`);
      return state;
    }

    function pushCloudState(state) {
      if (!state || typeof state !== "object") return;
      const checked = state.done && typeof state.done === "object" ? state.done : {};
      const completedCount = cfg.items.filter((_, i) => Boolean(checked[cfg.doneKey(i + 1)])).length;
      window.StoryStudioStorage?.saveProjectProgress?.(cfg.project, {
        totalClips: cfg.items.length,
        completedCount,
        checked,
        state
      });
    }

    function uncheckDay(day) {
      try {
        const state = readState();
        if (!state || !state.done || typeof state.done !== "object" || Array.isArray(state.done)) return;
        delete state.done[cfg.doneKey(day)];
        localStorage.setItem(cfg.progressKey, JSON.stringify(state));
        pushCloudState(state);
      } catch {}
    }

    function syncFailedJob(value) {
      if (cfg.batchImages) return value;
      if (value && ["failed", "unknown"].includes(value.status) && !value.unchecked) {
        uncheckDay(value.day);
        value = { ...value, unchecked: true };
        localStorage.setItem(cfg.jobKey, JSON.stringify(value));
      }
      return value;
    }

    function readJob() {
      const raw = localStorage.getItem(cfg.jobKey);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (!value || typeof value.id !== "string" || !Number.isInteger(value.day) ||
          value.day < 1 || value.day > cfg.items.length ||
          !["submitting", "queued", "running", "completed", "failed", "unknown"].includes(value.status)) {
        throw new Error(`Saved ${cfg.label} Flow job information is invalid.`);
      }
      return syncFailedJob(value);
    }

    function saveJob(value) {
      value = syncFailedJob(value);
      localStorage.setItem(cfg.jobKey, JSON.stringify(value));
      job = value;
    }

    function update() {
      const card = document.querySelector(`[data-flow-project="${cfg.project}"]`);
      if (!card) return;
      const button = card.querySelector(".generate-next");
      const status = card.querySelector(".motivation-status");
      const active = job && ["submitting", "queued", "running"].includes(job.status);
      button.disabled = starting || !!active;
      let text = message;
      if (!text && job) {
        if (cfg.batchImages) {
          const p = job.progress || {};
          const savedTotal = (p.skipped || 0) + (p.savedDays?.length || p.savedCount || 0);
          const total = p.total || cfg.items.length;
          if (active) {
            text = job.status === "queued"
              ? `Queued 5× parallel Flow image batch (${total} beats)…`
              : `⚡ Generating 5× parallel in Flow: ${savedTotal} / ${total} saved (${p.inFlight || 0} active)…`;
          } else if (job.status === "completed") {
            text = `All ${total} ${cfg.label} images generated in Flow ✓`;
          } else {
            text = `Batch stopped/failed (${savedTotal}/${total} saved): ${job.error || "Unknown error"}`;
          }
        } else {
          if (active) text = `${itemLabel(job.day)} marked done. ${job.status === "queued" ? "Waiting for Flow…" : "Generating in Flow…"} You can keep working.`;
          else if (job.status === "completed") text = `${itemLabel(job.day)} is ready.`;
          else text = `${itemLabel(job.day)}: ${job.error || "Job status unknown."} ${itemLabel(job.day)} was unchecked automatically so you can retry.`;
        }
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
          if (!response.ok || !body.ok || body.id !== id || (!cfg.batchImages && body.day !== job.day) ||
              !["queued", "running", "completed", "failed"].includes(body.status)) throw new Error(body.error || "Invalid job status.");
          if (cfg.batchImages && Array.isArray(body.progress?.savedDays) && body.progress.savedDays.length) {
            try {
              const savedState = JSON.parse(localStorage.getItem(cfg.progressKey) || "{}") || {};
              const doneMap = savedState.done || (savedState.done = {});
              let changed = false;
              for (const d of body.progress.savedDays) {
                if (!doneMap[d]) { doneMap[d] = true; changed = true; }
              }
              if (changed) {
                localStorage.setItem(cfg.progressKey, JSON.stringify(savedState));
                pushCloudState(savedState);
              }
            } catch {}
          }
          saveJob({ ...job, status: body.status, file: body.file, error: body.error, progress: body.progress });
          message = "";
        }
      } catch (error) { message = `Cannot check Flow yet: ${error.message}. Retrying…`; }
      update();
      if (job && ["submitting", "queued", "running"].includes(job.status)) timer = setTimeout(poll, 3000);
      else {
        window.dispatchEvent(new Event("videos-changed"));
        if (job && job.status === "completed") {
          const runTt = job.autoPost && !job.autoPosted;
          const runFb = job.autoPostFacebook && !job.autoPostedFacebook;
          const runTg = job.autoPostTelegram && !job.autoPostedTelegram;
          if (runTt || runFb || runTg) {
            saveJob({
              ...job,
              autoPosted: job.autoPosted || runTt,
              autoPostedFacebook: job.autoPostedFacebook || runFb,
              autoPostedTelegram: job.autoPostedTelegram || runTg
            });
            (async () => {
              if (runTt) await window.StoryStudioTikTok?.autoPostDay?.(cfg.project, job.day);
              if (runFb) await window.StoryStudioFacebook?.autoPostDay?.(cfg.project, job.day);
              if (runTg) await window.StoryStudioTelegram?.autoPostDay?.(cfg.project, job.day);
            })();
          }
        }
      }
    }

    async function generate() {
      if (starting) return;
      starting = true;
      message = "Checking Flow settings and saved progress…";
      update();
      let marked = false;
      try {
        if (location.protocol === "file:") throw new Error("Open Story Studio using Start Story Studio.vbs.");
        const existing = readJob();
        if (existing && ["submitting", "queued", "running"].includes(existing.status)) {
          job = existing; message = ""; poll(); return;
        }
        const [healthResponse, settingsResponse] = await Promise.all([
          fetch("/api/health"), fetch(`/api/flow-settings?project=${cfg.project}`)
        ]);
        const health = await healthResponse.json(), settings = await settingsResponse.json();
        if (!healthResponse.ok || health.jobApi !== 1) throw new Error("The generator needs an update. Reopen Start Story Studio.vbs and approve the restart.");
        if (!settingsResponse.ok || !settings.ok) throw new Error(settings.error || "Could not load Flow settings.");

        const raw = localStorage.getItem(cfg.progressKey);
        if (cfg.batchImages) {
          const st = raw ? JSON.parse(raw) : { done: {} };
          const episodeId = st?.episodeId || "ancient-humans-day";
          const aspect = ["9:16", "16:9"].includes(st?.ar) ? st.ar : (settings.effective?.image?.aspect || "16:9");
          const model = settings.effective?.image?.model || "";
          const assetsRes = await fetch(`/api/explainer/assets?project=${cfg.project}&episode=${encodeURIComponent(episodeId)}`, { cache: "no-store" });
          const assetsData = await assetsRes.json();
          const ep = assetsData?.episode || (typeof INK_EXPLAINER_DEFAULT_EPISODE !== "undefined" ? INK_EXPLAINER_DEFAULT_EPISODE : null);
          if (ep && typeof window !== "undefined") window.__INK_ACTIVE_EPISODE = ep;
          const beats = typeof inkExplainerActiveBeats === "function" ? inkExplainerActiveBeats() : cfg.items;
          const batchItems = beats.map((b, idx) => ({
            day: Number(b.beat || idx + 1),
            prompt: inkExplainerPromptFor(idx, aspect)
          }));
          const batchId = crypto.randomUUID();
          const r = await fetch("/api/explainer/generate-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({ id: batchId, project: cfg.project, episode: episodeId, aspect, model, concurrency: 5, items: batchItems })
          });
          const body = await r.json();
          if (!r.ok || !body.ok) throw new Error(body.error || "Could not start parallel Flow image batch.");
          if (body.alreadyComplete) {
            const doneMap = st.done || (st.done = {});
            batchItems.forEach(it => { doneMap[it.day] = true; });
            localStorage.setItem(cfg.progressKey, JSON.stringify(st));
            pushCloudState(st);
            message = `All ${batchItems.length} ${cfg.label} images already exist ✓`;
            return;
          }
          saveJob({ id: batchId, day: 1, status: body.status || "queued", createdAt: Date.now(), progress: body.progress });
          message = ""; update();
          poll();
          return;
        }
        if (raw === null && !confirm(`No saved ${cfg.label} progress was found in this browser. Start with ${itemLabel(1)}?`)) {
          message = `No ${cfg.kind} started. Mark completed items in the workspace first.`; return;
        }
        const state = raw ? JSON.parse(raw) : { done: {} };
        if (!state || typeof state !== "object" || (state.done && (typeof state.done !== "object" || Array.isArray(state.done)))) {
          throw new Error(`Saved ${cfg.label} progress is invalid.`);
        }
        const done = state.done || (state.done = {});
        const index = cfg.items.findIndex((_, i) => !done[cfg.doneKey(i + 1)]);
        if (index < 0) { message = `All ${cfg.items.length} ${cfg.label} ${cfg.kind}s are already marked done.`; return; }

        const payload = cfg.buildPayload(index, state, settings.effective);
        const autoPost = Boolean(settings.effective?.tiktok?.autoPost ?? window.StoryStudioTikTok?.isAutoPostEnabled?.());
        const autoPostFacebook = Boolean(settings.effective?.facebook?.autoPost ?? window.StoryStudioFacebook?.isAutoPostEnabled?.());
        const autoPostTelegram = Boolean(settings.effective?.telegram?.autoPost ?? window.StoryStudioTelegram?.isAutoPostEnabled?.());
        const latest = readJob();
        if (latest && ["submitting", "queued", "running"].includes(latest.status)) { job = latest; message = ""; poll(); return; }
        const next = { id: crypto.randomUUID(), day: index + 1, status: "submitting", createdAt: Date.now(), autoPost, autoPostFacebook, autoPostTelegram };
        saveJob(next);
        try {
          done[cfg.doneKey(index + 1)] = true;
          localStorage.setItem(cfg.progressKey, JSON.stringify(state));
          pushCloudState(state);
          marked = true;
        } catch (error) { localStorage.removeItem(cfg.jobKey); job = null; throw error; }
        message = ""; update();
        const response = await fetch("/api/generation-jobs", {
          method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
          body: JSON.stringify({ id: next.id, project: cfg.project, day: next.day, ...payload })
        });
        const body = await response.json();
        if (!response.ok || !body.ok) saveJob({ ...next, status: "failed", error: body.error || "Could not start the job." });
        else if (body.id !== next.id || body.day !== next.day || !["queued", "running"].includes(body.status)) throw new Error("The generator returned an unexpected job.");
        else saveJob({ ...next, status: body.status });
        poll();
      } catch (error) {
        if (marked) { message = `Could not confirm the job: ${error.message}. Checking the generator; ${itemLabel(job.day)} remains marked done.`; timer = setTimeout(poll, 3000); }
        else message = `Could not start: ${error.message}. Your progress was not changed.`;
      } finally { starting = false; update(); }
    }

    function render() {
      const link = document.querySelector(`a[href="${cfg.href}"]`);
      if (!link) return;
      const card = link.closest(".project-card");
      card.dataset.flowProject = cfg.project;
      const button = document.createElement("button");
      button.type = "button"; button.className = "generate-next"; button.textContent = "▶";
      button.title = `Generate next ${cfg.kind} with Flow`;
      button.setAttribute("aria-label", `Generate next ${cfg.label} ${cfg.kind} with Flow`);
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
      if (event.key !== cfg.jobKey) return;
      try { job = readJob(); message = ""; poll(); update(); } catch (error) { message = error.message; update(); }
    });
    try { job = readJob(); } catch (error) { message = error.message; }
    render(); poll();
  }

  if (typeof VIDEOS !== "undefined") {
    attachRunner({
      project: "daily-motivations",
      label: "Daily Motivations",
      href: "projects/daily-motivations/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "motivation_flow_job",
      progressKey: "dailymotivations-v1",
      items: VIDEOS,
      doneKey: day => day,
      buildPayload: (index, state, effective) => {
        const video = state.picked ? { model: state.model, aspect: state.ar, duration: state.dur } : effective.video;
        if (video.duration !== "10s") throw new Error("Motivation prompts require 10 seconds. Select 10s in the workspace or Flow settings.");
        return { mode: "video", prompt: motivationPromptFor(index, video.aspect), ...video };
      }
    });
  }

  if (typeof TEEN_LOVE_CLIPS !== "undefined") {
    attachRunner({
      project: "teenage-love-vibes",
      label: "Teenage Love Vibes",
      href: "projects/teenage-love-vibes/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "teen_love_flow_job",
      progressKey: "teenage-love-vibes-v1",
      items: TEEN_LOVE_CLIPS,
      doneKey: day => day,
      buildPayload: (index, state, effective) => {
        const video = state.picked ? { model: state.model, aspect: state.ar, duration: state.dur } : effective.video;
        return {
          mode: "video",
          prompt: teenLovePromptFor(index, video.aspect, video.duration),
          characters: teenLoveCharactersFor(index),
          ...video
        };
      }
    });
  }

  if (typeof MAYA_ITEMS !== "undefined") {
    attachRunner({
      project: "maya-photos",
      label: "माया",
      href: "projects/maya-photos/index.html",
      kind: "photo",
      mode: "image",
      jobKey: "maya_flow_job",
      progressKey: "maya-photos-v1",
      items: MAYA_ITEMS,
      doneKey: day => "b" + day,
      buildPayload: (index, state, effective) => {
        const aspect = ["9:16", "16:9"].includes(state.ar) ? state.ar : effective.image.aspect;
        const model = effective.image.model || "";
        return { mode: "image", prompt: mayaPosterPromptFor({ ...MAYA_ITEMS[index], num: index + 1 }, aspect), model, aspect };
      }
    });
  }

  if (typeof KITAAB_ITEMS !== "undefined") {
    attachRunner({
      project: "jindagi-kitaab",
      label: "जिन्दगीको किताब",
      href: "projects/jindagi-kitaab/index.html",
      kind: "photo",
      mode: "image",
      jobKey: "kitaab_flow_job",
      progressKey: "jindagi-kitaab-v1",
      items: KITAAB_ITEMS,
      doneKey: day => "b" + day,
      buildPayload: (index, state, effective) => {
        const aspect = ["9:16", "16:9"].includes(state.ar) ? state.ar : effective.image.aspect;
        const model = effective.image.model || "";
        return { mode: "image", prompt: kitaabPosterPromptFor({ ...KITAAB_ITEMS[index], num: index + 1 }, aspect), model, aspect };
      }
    });
  }

  if (typeof KAM_NALAGNE_CLIPS !== "undefined") {
    attachRunner({
      project: "kam-nalagne",
      label: "काम नलाग्ने कोही हुँदैन",
      href: "projects/kam-nalagne/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "kam_nalagne_flow_job",
      progressKey: "kam-nalagne-v1",
      items: KAM_NALAGNE_CLIPS,
      doneKey: day => KAM_NALAGNE_CLIPS[day - 1]?.doneKey || ("0-" + (day - 1)),
      buildPayload: (index, state, effective) => {
        const video = state.picked
          ? { model: state.model || effective.video.model, aspect: state.ar || effective.video.aspect, duration: state.dur || effective.video.duration }
          : { ...effective.video, aspect: ["9:16", "16:9"].includes(state.ar) ? state.ar : effective.video.aspect };
        return {
          mode: "video",
          prompt: kamNalagnePromptFor(index, video.aspect, video.duration),
          characters: kamNalagneCharactersFor(index),
          ...video
        };
      }
    });
  }

  if (typeof SADHU_RANI_CLIPS !== "undefined") {
    attachRunner({
      project: "sadhu-rani",
      label: "साधु र राडी",
      href: "projects/sadhu-rani/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "sadhu_rani_flow_job",
      progressKey: "sadhu-rani-v1",
      items: SADHU_RANI_CLIPS,
      doneKey: day => SADHU_RANI_CLIPS[day - 1]?.doneKey || ("0-" + (day - 1)),
      buildPayload: (index, state, effective) => {
        const video = state.picked
          ? { model: state.model || effective.video.model, aspect: state.ar || effective.video.aspect, duration: state.dur || effective.video.duration }
          : { ...effective.video, aspect: ["9:16", "16:9"].includes(state.ar) ? state.ar : effective.video.aspect };
        return {
          mode: "video",
          prompt: sadhuRaniPromptFor(index, video.aspect, video.duration),
          characters: sadhuRaniCharactersFor(index),
          ...video
        };
      }
    });
  }

  if (typeof TARKARI_CLIPS !== "undefined") {
    attachRunner({
      project: "tarkari-katha",
      label: "तरकारीको कथा",
      href: "projects/tarkari-katha/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "tarkari_flow_job",
      progressKey: "tarkari-katha-v1",
      items: TARKARI_CLIPS,
      doneKey: day => day,
      buildPayload: (index, state, effective) => {
        const video = state.picked ? { model: state.model, aspect: state.ar, duration: state.dur } : effective.video;
        return {
          mode: "video",
          prompt: tarkariPromptFor(index, video.aspect, video.duration),
          characters: tarkariCharactersFor(index),
          ...video
        };
      }
    });
  }

  if (typeof STICKMAN_CLIPS !== "undefined") {
    attachRunner({
      project: "stickman-lantern",
      label: "The Last Lantern",
      href: "projects/stickman-lantern/index.html",
      kind: "clip",
      mode: "video",
      jobKey: "stickman_lantern_flow_job",
      progressKey: "stickman-lantern-v1",
      items: STICKMAN_CLIPS,
      doneKey: day => day,
      buildPayload: (index, state, effective) => {
        const video = state.picked
          ? { model: state.model || effective.video.model, aspect: state.ar || effective.video.aspect, duration: state.dur || effective.video.duration }
          : { ...effective.video, aspect: ["9:16", "16:9"].includes(state.ar) ? state.ar : effective.video.aspect };
        return {
          mode: "video",
          prompt: stickmanPromptFor(index, video.aspect, video.duration),
          characters: stickmanCharactersFor(index),
          ...video
        };
      }
    });
  }

  if (typeof INK_EXPLAINER_SCENES !== "undefined") {
    attachRunner({
      project: "ink-explainer",
      label: "Ink Explainer",
      href: "projects/ink-explainer/index.html",
      kind: "photo",
      mode: "image",
      batchImages: true,
      jobKey: "ink_explainer_flow_job",
      progressKey: "ink-explainer-v1",
      items: INK_EXPLAINER_SCENES,
      doneKey: day => day,
      buildPayload: (index, state, effective) => {
        const aspect = ["9:16", "16:9"].includes(state.ar) ? state.ar : (effective.image.aspect || "16:9");
        return {
          mode: "image",
          prompt: inkExplainerPromptFor(index, aspect),
          model: effective.image.model,
          aspect
        };
      }
    });
  }
})();
