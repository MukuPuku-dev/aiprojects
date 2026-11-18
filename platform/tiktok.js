(() => {
  const projects = ["gk-questions", "daily-motivations", "teenage-love-vibes", "maya-photos", "jindagi-kitaab", "kam-nalagne", "sadhu-rani", "tarkari-katha", "stickman-lantern"];
  const PROJECT_LABELS = {
    "gk-questions": "GK Questions",
    "daily-motivations": "Daily Motivations",
    "teenage-love-vibes": "Teenage Love Vibes",
    "maya-photos": "माया",
    "jindagi-kitaab": "जिन्दगीको किताब",
    "kam-nalagne": "काम नलाग्ने कोही हुँदैन",
    "sadhu-rani": "साधु र राडी",
    "tarkari-katha": "तरकारीको कथा",
    "stickman-lantern": "The Last Lantern",
    "ink-explainer": "Ink Explainer"
  };

  const PLATFORMS = {
    tiktok: {
      id: "tiktok",
      name: "TikTok",
      apiBase: "/api/tiktok",
      autoPostKey: "story_studio_auto_post_tiktok",
      toggleId: "auto-post-tiktok",
      icon: "♪",
      postClass: "tiktok-post",
      resolveLabel: "Resolve status",
      postedText: " Submitted to TikTok ✓",
      uploadingText: " Uploading to TikTok…",
      unknownText: " Posting result unknown. ",
      restartText: "Restart Story Studio to enable TikTok posting.",
      submittedText: label => `${label} submitted to TikTok. Check its review and privacy status there.`,
      promptFileCaption: presetCap => presetCap ? "Enter the TikTok caption for this photo:" : "Describe this video for its TikTok caption:"
    },
    facebook: {
      id: "facebook",
      name: "Facebook",
      apiBase: "/api/facebook",
      autoPostKey: "story_studio_auto_post_facebook",
      toggleId: "auto-post-facebook",
      iconSvg: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      icon: "f",
      postClass: "facebook-post",
      resolveLabel: "Resolve Facebook",
      postedText: " Submitted to Facebook ✓",
      uploadingText: " Uploading to Facebook…",
      unknownText: " Facebook result unknown. ",
      restartText: "Restart Story Studio to enable Facebook posting.",
      submittedText: label => `${label} submitted to Facebook. Check your post on Facebook.`,
      promptFileCaption: presetCap => presetCap ? "Enter the Facebook caption for this photo:" : "Describe this video for its Facebook caption:"
    },
    telegram: {
      id: "telegram",
      name: "Telegram",
      apiBase: "/api/telegram",
      autoPostKey: "story_studio_auto_post_telegram",
      toggleId: "auto-post-telegram",
      iconSvg: '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
      icon: "✈",
      postClass: "telegram-post",
      resolveLabel: "Resolve Telegram",
      postedText: " Sent to Telegram ✓",
      uploadingText: " Sending to Telegram…",
      unknownText: " Telegram result unknown. ",
      restartText: "Restart Story Studio to enable Telegram sending.",
      submittedText: label => `${label} sent to Telegram with caption ✓`,
      confirmMsg: (projLabel, label, usesPresetCaption) => `Send ${projLabel} ${label} to Telegram?${usesPresetCaption ? "" : " Gemini will generate the caption."}`,
      promptFileCaption: presetCap => presetCap ? "Enter the Telegram caption for this photo:" : "Describe this video for its Telegram caption:"
    }
  };

  const state = {
    tiktok: { lists: new Map(), messages: new Map(), busy: new Set() },
    facebook: { lists: new Map(), messages: new Map(), busy: new Set() },
    telegram: { lists: new Map(), messages: new Map(), busy: new Set() }
  };
  let refreshPromise = null;
  const expandedProjects = new Set();

  function isPresetCaptionProject(project) {
    return project === "maya-photos" || project === "jindagi-kitaab";
  }

  function isAutoPostEnabled(platformId) {
    const cfg = PLATFORMS[platformId];
    try { return localStorage.getItem(cfg.autoPostKey) === "true"; }
    catch { return false; }
  }

  async function setAutoPostEnabled(platformId, enabled, persistRemote = true) {
    const cfg = PLATFORMS[platformId];
    const val = Boolean(enabled);
    try { localStorage.setItem(cfg.autoPostKey, val ? "true" : "false"); } catch {}
    const box = document.getElementById(cfg.toggleId);
    if (box) box.checked = val;
    if (!persistRemote || location.protocol === "file:") return;
    try {
      const r = await fetch("/api/flow-settings", { cache: "no-store" });
      if (!r.ok) return;
      const body = await r.json();
      if (!body?.ok || !body.settings) return;
      const next = {
        defaults: {
          ...(body.settings.defaults || {}),
          [platformId]: { ...(body.settings.defaults?.[platformId] || {}), autoPost: val }
        },
        projects: body.settings.projects || {}
      };
      await fetch("/api/flow-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next)
      });
    } catch {}
  }

  async function syncAutoPostToggles() {
    for (const platformId of Object.keys(PLATFORMS)) {
      const cfg = PLATFORMS[platformId];
      const box = document.getElementById(cfg.toggleId);
      if (box) {
        box.checked = isAutoPostEnabled(platformId);
        if (!box.dataset.wired) {
          box.dataset.wired = "1";
          box.addEventListener("change", () => setAutoPostEnabled(platformId, box.checked, true));
        }
      }
    }
    const tgForm = document.getElementById("telegram-config-form");
    const tgTokenInput = document.getElementById("telegram-bot-token-quick");
    const tgChatIdInput = document.getElementById("telegram-chat-id-quick");
    const tgSaveStatus = document.getElementById("telegram-config-status");
    if (tgForm && !tgForm.dataset.wired) {
      tgForm.dataset.wired = "1";
      tgForm.addEventListener("submit", async e => {
        e.preventDefault();
        if (location.protocol === "file:") {
          if (tgSaveStatus) tgSaveStatus.textContent = "Open via Start Story Studio.vbs to save.";
          return;
        }
        try {
          const r = await fetch("/api/flow-settings", { cache: "no-store" });
          const body = await r.json();
          if (!r.ok || !body?.ok) throw new Error(body?.error || "Could not load settings.");
          const tokenVal = (tgTokenInput?.value || "").trim() || "PASTE_YOUR_BOTFATHER_TOKEN_HERE";
          const chatVal = (tgChatIdInput?.value || "").trim() || "7223190114";
          const next = {
            defaults: {
              ...(body.settings.defaults || {}),
              telegram: {
                ...(body.settings.defaults?.telegram || {}),
                botToken: tokenVal,
                chatId: chatVal
              }
            },
            projects: body.settings.projects || {}
          };
          const sr = await fetch("/api/flow-settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next)
          });
          const sb = await sr.json();
          if (!sr.ok || !sb?.ok) throw new Error(sb?.error || "Save failed.");
          if (tgSaveStatus) tgSaveStatus.textContent = "Saved to settings.json ✓";
        } catch (err) {
          if (tgSaveStatus) tgSaveStatus.textContent = err.message;
        }
      });
    }
    if (location.protocol === "file:") return;
    try {
      const r = await fetch("/api/flow-settings", { cache: "no-store" });
      if (!r.ok) return;
      const body = await r.json();
      for (const platformId of Object.keys(PLATFORMS)) {
        const remoteVal = body?.settings?.defaults?.[platformId]?.autoPost;
        if (typeof remoteVal === "boolean") await setAutoPostEnabled(platformId, remoteVal, false);
      }
      const tgCfg = body?.settings?.defaults?.telegram;
      if (tgCfg) {
        if (tgTokenInput && document.activeElement !== tgTokenInput) {
          tgTokenInput.value = tgCfg.botToken || "PASTE_YOUR_BOTFATHER_TOKEN_HERE";
        }
        if (tgChatIdInput && document.activeElement !== tgChatIdInput) {
          tgChatIdInput.value = tgCfg.chatId || "7223190114";
        }
      }
    } catch {}
  }

  function contextFor(project, day) {
    if (project === "gk-questions") {
      const item = GK_DAYS[day - 1];
      return `Nepali general knowledge quiz, topic: ${item.title}.\n${item.qs.map(([q, a]) => `${q} — ${a}`).join("\n")}`;
    }
    if (project === "teenage-love-vibes") {
      const item = TEEN_LOVE_CLIPS[day - 1];
      return `Dialogueless cinematic Nepali teenage love clip #${day}: "${item.title}" (${item.beat}).\nVisual scene: ${item.shot}\nHeart-touching continuation story direction:\n${item.cap}`.slice(0, 4800);
    }
    if (project === "maya-photos") return mayaCaptionFor(MAYA_ITEMS[day - 1]).slice(0, 4800);
    if (project === "jindagi-kitaab") return kitaabShortCaptionFor(KITAAB_ITEMS[day - 1]).slice(0, 4800);
    if (project === "kam-nalagne") {
      const item = KAM_NALAGNE_CLIPS[day - 1];
      const k = item?.clip || [];
      return `Nepali village drama "काम नलाग्ने कोही हुँदैन" — Episode ${(item?.epIndex || 0) + 1} (${item?.epNe || ""}), Clip ${(item?.clipIndex || 0) + 1}: ${k[2] || ""}.\nScene: ${k[3] || ""}\nDialogue:\n${(k[4] || "").split("|").join("\n")}`.slice(0, 4800);
    }
    if (project === "sadhu-rani") {
      const item = SADHU_RANI_CLIPS[day - 1];
      const k = item?.clip || [];
      return `Nepali folk tale "साधु र राडी" — Clip ${day}: ${k[2] || ""}.\nScene: ${k[3] || ""}\nDialogue:\n${(k[4] || "").split("|").join("\n")}`.slice(0, 4800);
    }
    if (project === "tarkari-katha") {
      const item = TARKARI_CLIPS[day - 1];
      return `3D Macro Nepali vegetable comedy-drama "तरकारीको कथा" clip #${day}: "${item.title}" (${item.beat}).\nVisual scene: ${item.shot}\nDialogue:\n${(item.line || "").split("|").join("\n")}\nContinuation story direction:\n${item.cap}`.slice(0, 4800);
    }
    if (project === "stickman-lantern") {
      const item = STICKMAN_CLIPS[day - 1];
      return `Visual-only 16:9 2D stickman survival adventure "The Last Lantern" Scene #${day}: "${item.title}" (${item.beat}).\nVisual scene: ${item.visual}\nAnimation action: ${item.animAction}`.slice(0, 4800);
    }
    if (project === "ink-explainer") {
      const scenes = typeof inkExplainerActiveScenes === "function" ? inkExplainerActiveScenes() : INK_EXPLAINER_SCENES;
      const item = scenes[day - 1] || INK_EXPLAINER_SCENES[0];
      return `English Ink Explainer visual story Scene #${day}: "${item.title}" (${item.chapter}).\nNarration: ${item.narration}\nVisual scene: ${item.visual}`.slice(0, 4800);
    }
    const item = VIDEOS[day - 1];
    return `Nepali motivational video, day ${day}. Spoken line: ${item.q}\nMeaning: ${item.en}\nScene: ${item.scene}`;
  }

  function labelFor(project) { return PROJECT_LABELS[project] || project; }
  function cardFor(project) { return document.querySelector(`[data-flow-project="${project}"]`); }
  function videoId(video) { return video.file ?? video.day; }
  function videoLabel(video) { return video.file || `Day ${video.day}`; }
  function videoBody(video) { return video.file ? { file: video.file } : { day: video.day }; }

  function renderPlatformAction(platformId, project, video) {
    if (!video) return null;
    const cfg = PLATFORMS[platformId];
    const pState = state[platformId];
    const label = videoLabel(video);
    const slot = document.createElement("span");
    slot.className = `social-slot social-slot-${platformId}`;
    if (video.active || pState.busy.has(`${project}:${videoId(video)}`)) {
      slot.append(document.createTextNode(cfg.uploadingText));
    } else if (video.status === "posted") {
      const repostBtn = document.createElement("button");
      repostBtn.type = "button";
      repostBtn.className = `${cfg.postClass} repost-btn`;
      repostBtn.textContent = "↻";
      repostBtn.title = `Repost ${label} to ${cfg.name}`;
      repostBtn.setAttribute("aria-label", `Retry ${labelFor(project)} ${label} on ${cfg.name}`);
      repostBtn.addEventListener("click", () => start(platformId, project, video, { force: true }));
      slot.append(document.createTextNode(`${cfg.postedText} `), repostBtn);
    } else if (video.status === "unknown") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = cfg.resolveLabel;
      btn.title = `Check ${cfg.name} before resolving the uncertain post`;
      btn.addEventListener("click", () => resolveStatus(platformId, project, video));
      slot.append(document.createTextNode(cfg.unknownText), btn);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = cfg.postClass;
      if (cfg.iconSvg) {
        btn.innerHTML = cfg.iconSvg;
      } else {
        btn.textContent = cfg.icon;
      }
      btn.title = `Post ${label} to ${cfg.name}`;
      btn.setAttribute("aria-label", `Post ${labelFor(project)} ${label} to ${cfg.name}`);
      btn.addEventListener("click", () => start(platformId, project, video));
      slot.append(btn);
    }
    return slot;
  }

  function render(project) {
    const card = cardFor(project);
    if (!card) return;
    let panel = card.querySelector(".tiktok-videos");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "tiktok-videos";
      card.append(panel);
    }
    panel.replaceChildren();
    for (const platformId of Object.keys(PLATFORMS)) {
      const msg = state[platformId].messages.get(project);
      if (msg) {
        const line = document.createElement("p");
        line.className = "tiktok-message";
        line.setAttribute("role", "status");
        line.textContent = msg;
        panel.append(line);
      }
    }

    const ttList = state.tiktok.lists.get(project) || [];
    const fbList = state.facebook.lists.get(project) || [];
    const tgList = state.telegram.lists.get(project) || [];
    const ttMap = new Map(ttList.map(v => [videoId(v), v]));
    const fbMap = new Map(fbList.map(v => [videoId(v), v]));
    const tgMap = new Map(tgList.map(v => [videoId(v), v]));
    const orderedIds = [...ttMap.keys()];
    for (const id of fbMap.keys()) if (!orderedIds.includes(id)) orderedIds.push(id);
    for (const id of tgMap.keys()) if (!orderedIds.includes(id)) orderedIds.push(id);

    if (!orderedIds.length) return;

    const ttDone = orderedIds.filter(id => ttMap.get(id)?.status === "posted").length;
    const fbDone = orderedIds.filter(id => fbMap.get(id)?.status === "posted").length;
    const tgDone = orderedIds.filter(id => tgMap.get(id)?.status === "posted").length;

    const details = document.createElement("details");
    details.className = "tiktok-expander";
    details.open = expandedProjects.has(project);
    details.addEventListener("toggle", () => {
      if (details.open) expandedProjects.add(project);
      else expandedProjects.delete(project);
    });

    const summary = document.createElement("summary");
    summary.textContent = `${orderedIds.length} ready · ♪ ${ttDone} · f ${fbDone} · ✈ ${tgDone}`;
    details.append(summary);

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "tiktok-rows";

    for (const id of orderedIds) {
      const known = ttMap.get(id) || fbMap.get(id) || tgMap.get(id);
      const ttVideo = ttMap.get(id) || { day: known.day, file: known.file, ext: known.ext, status: 'unposted', active: false };
      const fbVideo = fbMap.get(id) || { day: known.day, file: known.file, ext: known.ext, status: 'unposted', active: false };
      const tgVideo = tgMap.get(id) || { day: known.day, file: known.file, ext: known.ext, status: 'unposted', active: false };
      const video = known;
      const row = document.createElement("div");
      row.className = "tiktok-row";
      const link = document.createElement("a");
      const label = videoLabel(video);
      const ext = video.ext || ".mp4";
      const filename = video.file || `day-${String(video.day).padStart(2, "0")}${ext}`;
      link.href = `/projects/${project}/videos/${encodeURIComponent(filename)}`;
      link.target = "_blank"; link.rel = "noopener"; link.textContent = label;
      row.append(link);
      const ttSlot = renderPlatformAction("tiktok", project, ttVideo);
      if (ttSlot) row.append(ttSlot);
      const fbSlot = renderPlatformAction("facebook", project, fbVideo);
      if (fbSlot) row.append(fbSlot);
      const tgSlot = renderPlatformAction("telegram", project, tgVideo);
      if (tgSlot) row.append(tgSlot);
      rowsWrap.append(row);
    }

    details.append(rowsWrap);
    panel.append(details);
  }

  async function fetchPlatformVideos(platformId, project, suppressMissing = false) {
    const cfg = PLATFORMS[platformId];
    const pState = state[platformId];
    try {
      const response = await fetch(`${cfg.apiBase}/videos?project=${project}`, { cache: "no-store" });
      if (response.status === 404) {
        if (suppressMissing) return pState.lists.get(project) || [];
        throw new Error(cfg.restartText);
      }
      const body = await response.json();
      if (!response.ok || !body.ok || !Array.isArray(body.videos)) throw new Error(body.error || "Could not load videos.");
      pState.lists.set(project, body.videos);
      if (pState.messages.get(project)?.startsWith("Could not load")) pState.messages.delete(project);
      return body.videos;
    } catch (error) {
      if (!suppressMissing) pState.messages.set(project, `Could not load ${cfg.name} videos: ${error.message}`);
      return pState.lists.get(project) || [];
    }
  }

  function refresh() {
    if (location.protocol === "file:") return Promise.resolve();
    if (refreshPromise) return refreshPromise;
    refreshPromise = Promise.all(projects.map(async project => {
      await Promise.all([
        fetchPlatformVideos("tiktok", project, false),
        fetchPlatformVideos("facebook", project, true),
        fetchPlatformVideos("telegram", project, true)
      ]);
      render(project);
    })).finally(() => { refreshPromise = null; });
    return refreshPromise;
  }

  async function start(platformId, project, video, options = {}) {
    const cfg = PLATFORMS[platformId];
    const pState = state[platformId];
    const label = videoLabel(video);
    const auto = options.auto === true;
    const force = options.force === true;
    const presetCap = isPresetCaptionProject(project);
    const usesPresetCaption = presetCap && !video.file;
    const actionWord = force ? "Repost" : "Post";
    if (!auto && !confirm(cfg.confirmMsg && !force ? cfg.confirmMsg(labelFor(project), label, usesPresetCaption) : `${actionWord} ${labelFor(project)} ${label} to ${cfg.name} using the signed-in account?${usesPresetCaption ? "" : " Gemini will generate the caption."}`)) return;
    let context;
    if (video.file) {
      if (auto) return;
      context = prompt(cfg.promptFileCaption(presetCap));
      if (context === null) return;
      if (!context.trim() || context.length > 5000) {
        pState.messages.set(project, "Enter a video description of 1–5000 characters.");
        render(project);
        return;
      }
    } else {
      context = contextFor(project, video.day);
    }
    const key = `${project}:${videoId(video)}`;
    if (pState.busy.has(key)) return;
    pState.busy.add(key);
    pState.messages.set(project, presetCap ? `Uploading ${label} to ${cfg.name}…` : `Preparing ${label} ${cfg.name} caption with Gemini…`);
    render(project);
    try {
      const response = await fetch(`${cfg.apiBase}/posts`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, ...videoBody(video), context, ...(force ? { force: true } : {}) })
      });
      const body = await response.json();
      if (!response.ok || !body.ok || typeof body.id !== "string") throw new Error(body.error || `Could not start ${cfg.name} posting.`);
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const statusResponse = await fetch(`${cfg.apiBase}/posts/${encodeURIComponent(body.id)}`);
        const status = await statusResponse.json();
        if (!statusResponse.ok || !status.ok) throw new Error(status.error || "Could not check the upload.");
        if (status.status === "posted") { pState.messages.set(project, cfg.submittedText(label)); break; }
        if (status.status === "failed" || status.status === "unknown") throw new Error(`${status.error || "Posting failed."}${status.status === "unknown" ? ` Check ${cfg.name} before trying again.` : ""}`);
        pState.messages.set(project, status.status === "caption" && !presetCap ? `Preparing ${label} ${cfg.name} caption with Gemini…` : `${label}: ${status.status === "posting" ? "Posting" : "Uploading"} in ${cfg.name}…`);
        render(project);
      }
    } catch (error) { pState.messages.set(project, `${label}: ${error.message}`); }
    finally { pState.busy.delete(key); await refresh(); render(project); }
  }

  async function autoPostDay(platformId, project, day) {
    const cfg = PLATFORMS[platformId];
    const pState = state[platformId];
    if (!cfg || !projects.includes(project) || !Number.isInteger(day) || location.protocol === "file:") return;
    let videos = await fetchPlatformVideos(platformId, project, false);
    render(project);
    let video = videos.find(v => v.day === day);
    if (!video || video.status === "posted") {
      await new Promise(r => setTimeout(r, 500));
      videos = await fetchPlatformVideos(platformId, project, false);
      render(project);
      video = videos.find(v => v.day === day);
    }
    if (!video) {
      video = { day, status: "unposted", active: false };
    }
    if (video.status === "posted" || video.status === "unknown") return;
    await start(platformId, project, video, { auto: true });
  }

  async function resolveStatus(platformId, project, video) {
    const cfg = PLATFORMS[platformId];
    const pState = state[platformId];
    const label = videoLabel(video);
    if (!confirm(`Check ${cfg.name} for ${label} before continuing. Choose OK only if you have checked; Cancel leaves the status unresolved.`)) return;
    const posted = confirm(`Is ${label} visible as a posted post on ${cfg.name}?\n\nOK = mark posted. Cancel = it was not posted, allow retry.`);
    try {
      const response = await fetch(`${cfg.apiBase}/resolve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, ...videoBody(video), posted })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Could not update status.");
      pState.messages.set(project, posted ? `${label} marked posted on ${cfg.name}.` : `${label} can be retried on ${cfg.name}.`);
    } catch (error) { pState.messages.set(project, `Could not resolve ${label}: ${error.message}`); }
    await refresh(); render(project);
  }

  window.StoryStudioTikTok = {
    autoPostDay: (project, day) => autoPostDay("tiktok", project, day),
    isAutoPostEnabled: () => isAutoPostEnabled("tiktok"),
    setAutoPostEnabled: (val, persist = true) => setAutoPostEnabled("tiktok", val, persist),
    refresh
  };
  window.StoryStudioFacebook = {
    autoPostDay: (project, day) => autoPostDay("facebook", project, day),
    isAutoPostEnabled: () => isAutoPostEnabled("facebook"),
    setAutoPostEnabled: (val, persist = true) => setAutoPostEnabled("facebook", val, persist),
    refresh
  };
  window.StoryStudioTelegram = {
    autoPostDay: (project, day) => autoPostDay("telegram", project, day),
    isAutoPostEnabled: () => isAutoPostEnabled("telegram"),
    setAutoPostEnabled: (val, persist = true) => setAutoPostEnabled("telegram", val, persist),
    refresh
  };

  window.addEventListener("projects-rendered", () => { projects.forEach(render); refresh(); syncAutoPostToggles(); });
  window.addEventListener("videos-changed", refresh);
  syncAutoPostToggles();
  refresh();
  setInterval(refresh, 5000);
})();
