(() => {
  const $ = selector => document.querySelector(selector);
  // Form field id -> [settings group, key] and the option list it draws from.
  const FIELDS = {
    "video-model": ["video", "model", "videoModels"],
    "video-aspect": ["video", "aspect", "aspects"],
    "video-duration": ["video", "duration", "durations"],
    "video-resolution": ["video", "resolution", "resolutions"],
    "video-upscale": ["video", "upscale", "upscaleModes"],
    "image-model": ["image", "model"],
    "image-aspect": ["image", "aspect", "aspects"],
    "telegram-bot-token": ["telegram", "botToken"],
    "telegram-chat-id": ["telegram", "chatId"]
  };
  const UPSCALE_LABELS = {
    auto: "Auto (On for mukesh.inaruwa@gmail.com Pro)",
    on: "On (Always upscale if available)",
    off: "Off (Download original size)"
  };
  const BOOL_LABELS = { false: "Off (false — wait for click)", true: "On (true — auto-post directly)" };
  const TELEGRAM_LABELS = { false: "Off (false — wait for click)", true: "On (true — auto-send to Telegram)" };
  const CHARACTER_LABELS = { false: "Off (false — skip character refs)", true: "On (true — ensure & attach characters)" };

  let doc = null;
  let options = null;
  let active = "";

  const setStatus = (message, kind = "") => {
    const el = $("#status");
    el.textContent = message;
    el.className = "status " + kind;
  };

  const nonEmpty = obj => Object.fromEntries(Object.entries(obj).filter(([, value]) => value));

  function renderBoolSelect(el, group, key, isProject, labels = BOOL_LABELS) {
    const fallback = Boolean(doc.defaults?.[group]?.[key]);
    el.replaceChildren(
      ...(isProject ? [new Option(`Use default (${fallback ? "On" : "Off"})`, "")] : []),
      new Option(labels.false, "false"),
      new Option(labels.true, "true")
    );
    const val = isProject ? doc.projects[active]?.[group]?.[key] : fallback;
    el.value = typeof val === "boolean" ? String(val) : "";
  }

  function renderForm() {
    const isProject = active !== "";
    for (const [id, [group, key, listName]] of Object.entries(FIELDS)) {
      const el = $("#" + id);
      const fallback = doc.defaults[group][key];
      if (listName) {
        const labelFor = v => (listName === "upscaleModes" ? (UPSCALE_LABELS[v] || v) : v);
        el.replaceChildren(
          ...(isProject ? [new Option(`Use default (${labelFor(fallback)})`, "")] : []),
          ...options[listName].map(value => new Option(labelFor(value), value))
        );
        el.value = isProject ? (doc.projects[active]?.[group]?.[key] ?? "") : fallback;
      } else {
        el.value = isProject ? (doc.projects[active]?.[group]?.[key] ?? "") : (fallback ?? "");
        if (id === "telegram-bot-token") {
          el.placeholder = isProject
            ? `Use default (${fallback || "PASTE_YOUR_BOTFATHER_TOKEN_HERE"})`
            : "PASTE_YOUR_BOTFATHER_TOKEN_HERE";
        } else if (id === "telegram-chat-id") {
          el.placeholder = isProject
            ? `Use default (${fallback || "7223190114"})`
            : "7223190114";
        } else {
          el.placeholder = isProject
            ? `Use default (${fallback || "Flow's current model"})`
            : "Exact model name from Flow's menu, or empty";
        }
      }
    }
    $("#scope-title").textContent = isProject ? `Overrides for ${active}` : "Defaults for all projects";
    renderBoolSelect($("#tiktok-auto-post"), "tiktok", "autoPost", isProject);
    renderBoolSelect($("#facebook-auto-post"), "facebook", "autoPost", isProject);
    renderBoolSelect($("#telegram-auto-post"), "telegram", "autoPost", isProject, TELEGRAM_LABELS);
    renderBoolSelect($("#character-consistency"), "characters", "consistency", isProject, CHARACTER_LABELS);
    $("#scope-note").textContent = isProject
      ? "Fields set to \"Use default\" follow the defaults above."
      : "These apply to every project that has no override.";
    $("#reset").disabled = !isProject;
  }

  function readForm() {
    const values = { video: {}, image: {}, tiktok: {}, facebook: {}, telegram: {}, characters: {} };
    for (const [id, [group, key]] of Object.entries(FIELDS)) values[group][key] = $("#" + id).value.trim();
    const ttRaw = $("#tiktok-auto-post").value;
    if (ttRaw === "true" || ttRaw === "false") values.tiktok.autoPost = ttRaw === "true";
    const fbRaw = $("#facebook-auto-post").value;
    if (fbRaw === "true" || fbRaw === "false") values.facebook.autoPost = fbRaw === "true";
    const tgRaw = $("#telegram-auto-post").value;
    if (tgRaw === "true" || tgRaw === "false") values.telegram.autoPost = tgRaw === "true";
    const charRaw = $("#character-consistency").value;
    if (charRaw === "true" || charRaw === "false") values.characters.consistency = charRaw === "true";
    return values;
  }

  // Copies the visible form into the in-memory settings for the scope that is active.
  function storeForm() {
    const values = readForm();
    if (active === "") {
      doc.defaults = values;
      return;
    }
    const tgKept = {
      ...nonEmpty({ botToken: values.telegram.botToken, chatId: values.telegram.chatId }),
      ...(typeof values.telegram.autoPost === "boolean" ? { autoPost: values.telegram.autoPost } : {})
    };
    const kept = {
      video: nonEmpty(values.video),
      image: nonEmpty(values.image),
      ...(Object.keys(values.tiktok).length ? { tiktok: values.tiktok } : {}),
      ...(Object.keys(values.facebook).length ? { facebook: values.facebook } : {}),
      ...(Object.keys(tgKept).length ? { telegram: tgKept } : {}),
      ...(Object.keys(values.characters).length ? { characters: values.characters } : {})
    };
    if (Object.keys(kept.video).length || Object.keys(kept.image).length || kept.tiktok || kept.facebook || kept.telegram || kept.characters) doc.projects[active] = kept;
    else delete doc.projects[active];
  }

  async function save(message) {
    try {
      const response = await fetch("/api/flow-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc)
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Save failed.");
      doc = body.settings;
      renderForm();
      setStatus(message, "ok");
    } catch (error) {
      setStatus(error.message, "error");
    }
  }

  async function load() {
    try {
      const response = await fetch("/api/flow-settings");
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Could not load settings.");
      doc = body.settings;
      options = body.options;
      $("#scope").replaceChildren(
        new Option("All projects (defaults)", ""),
        ...body.projects.map(id => new Option(id, id))
      );
      renderForm();
    } catch (error) {
      setStatus(`Could not load Flow settings (${error.message}). Double-click Start Story Studio.vbs in the aiprojects folder, then open Flow settings from the studio.`, "error");
      $("#form").querySelectorAll("select, input, button").forEach(el => { el.disabled = true; });
    }
  }

  $("#scope").addEventListener("change", event => {
    storeForm();
    active = event.target.value;
    renderForm();
    setStatus("");
  });

  $("#form").addEventListener("submit", event => {
    event.preventDefault();
    storeForm();
    save("Saved ✓");
  });

  $("#reset").addEventListener("click", () => {
    delete doc.projects[active];
    save(`${active} now uses the defaults ✓`);
  });

  load();
})();
