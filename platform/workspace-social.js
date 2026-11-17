(() => {
  const KEYS = {
    tiktok: "story_studio_auto_post_tiktok",
    facebook: "story_studio_auto_post_facebook",
    telegram: "story_studio_auto_post_telegram"
  };

  function isEnabled(platform) {
    try { return localStorage.getItem(KEYS[platform]) === "true"; }
    catch { return false; }
  }

  async function persistSetting(platform, enabled) {
    const val = Boolean(enabled);
    try { localStorage.setItem(KEYS[platform], val ? "true" : "false"); } catch {}
    if (location.protocol === "file:") return;
    try {
      const r = await fetch("/api/flow-settings", { cache: "no-store" });
      if (!r.ok) return;
      const body = await r.json();
      const s = body?.settings;
      if (!s) return;
      const defaults = {
        ...(s.defaults || {}),
        [platform]: { ...(s.defaults?.[platform] || {}), autoPost: val }
      };
      await fetch("/api/flow-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaults, projects: s.projects || {} })
      });
    } catch {}
  }

  async function initAutoPostToggles({ projectId, tiktokSelector, facebookSelector, telegramSelector = "#autoPostTelegramToggle", onToast }) {
    const map = {
      tiktok: document.querySelector(tiktokSelector),
      facebook: document.querySelector(facebookSelector),
      telegram: document.querySelector(telegramSelector)
    };
    for (const [platform, el] of Object.entries(map)) {
      if (!el) continue;
      el.checked = isEnabled(platform);
      el.addEventListener("change", async () => {
        const val = Boolean(el.checked);
        await persistSetting(platform, val);
        const label = platform === "facebook" ? "Auto-post Facebook" : platform === "telegram" ? "Auto-send Telegram" : "Auto-post TikTok";
        onToast?.(val ? `${label} ON ✓` : `${label} OFF`);
      });
    }
    if (location.protocol === "file:") return;
    try {
      const r = await fetch(`/api/flow-settings?project=${encodeURIComponent(projectId)}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      for (const [platform, el] of Object.entries(map)) {
        const remote = j?.effective?.[platform]?.autoPost;
        if (typeof remote === "boolean") {
          try { localStorage.setItem(KEYS[platform], String(remote)); } catch {}
          if (el) el.checked = remote;
        }
      }
    } catch {}
  }

  async function postMedia({ platform, projectId, day, context, label, onStatus, force = false }) {
    const name = platform === "facebook" ? "Facebook" : platform === "telegram" ? "Telegram" : "TikTok";
    onStatus?.(`Uploading ${label || ""} to ${name}…`.replace(/\s+/g, " ").trim());
    let r = await fetch(`/api/${platform}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: projectId, day, context, ...(force ? { force: true } : {}) })
    });
    let j = await r.json();
    if (!r.ok && /already posted/i.test(j?.error || "") && !force && confirm(`${label || "This video"} was already marked posted on ${name}. Repost it now?`)) {
      r = await fetch(`/api/${platform}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectId, day, context, force: true })
      });
      j = await r.json();
    }
    if (!r.ok || !j.ok || typeof j.id !== "string") {
      throw new Error(j.error || `${name} upload failed`);
    }
    let st = { status: "uploading" };
    while (!["posted", "failed", "unknown"].includes(st.status)) {
      await new Promise(res => setTimeout(res, 2000));
      const pr = await fetch(`/api/${platform}/posts/${encodeURIComponent(j.id)}`, { cache: "no-store" });
      if (!pr.ok) break;
      st = await pr.json();
      if (!st.ok) throw new Error(st.error || `${name} status check failed`);
      const stage = st.status === "caption" ? "Preparing caption" : st.status === "posting" ? "Publishing" : "Uploading";
      onStatus?.(`${name}: ${stage}…`);
    }
    if (st.status !== "posted") {
      throw new Error(st.error || `${name} post did not complete`);
    }
    return st;
  }

  async function autoPostAfterFlow({ projectId, day, context, tiktokEnabled, facebookEnabled, telegramEnabled, label, onStatus, onToast }) {
    const done = [];
    if (tiktokEnabled) {
      await postMedia({ platform: "tiktok", projectId, day, context, label, onStatus });
      done.push("TikTok");
    }
    if (facebookEnabled) {
      await postMedia({ platform: "facebook", projectId, day, context, label, onStatus });
      done.push("Facebook");
    }
    const tgOn = typeof telegramEnabled === "boolean"
      ? telegramEnabled
      : Boolean(document.querySelector("#autoPostTelegramToggle")?.checked ?? isEnabled("telegram"));
    if (tgOn) {
      await postMedia({ platform: "telegram", projectId, day, context, label, onStatus });
      done.push("Telegram");
    }
    if (done.length) {
      onStatus?.(`Saved & posted to ${done.join(" & ")} ✓`);
      onToast?.(`${label || "#" + day} posted to ${done.join(" & ")} ✓`);
    }
  }

  window.StoryStudioSocial = {
    initAutoPostToggles,
    postMedia,
    autoPostAfterFlow,
    isEnabled
  };
})();
