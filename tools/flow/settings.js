(() => {
  const $ = selector => document.querySelector(selector);
  // Form field id -> [settings group, key] and the option list it draws from.
  const FIELDS = {
    "video-model": ["video", "model", "videoModels"],
    "video-aspect": ["video", "aspect", "aspects"],
    "video-duration": ["video", "duration", "durations"],
    "image-model": ["image", "model"],
    "image-aspect": ["image", "aspect", "aspects"]
  };

  let doc = null;
  let options = null;
  let active = "";

  const setStatus = (message, kind = "") => {
    const el = $("#status");
    el.textContent = message;
    el.className = "status " + kind;
  };

  const nonEmpty = obj => Object.fromEntries(Object.entries(obj).filter(([, value]) => value));

  function renderForm() {
    const isProject = active !== "";
    for (const [id, [group, key, listName]] of Object.entries(FIELDS)) {
      const el = $("#" + id);
      const fallback = doc.defaults[group][key];
      if (listName) {
        el.replaceChildren(
          ...(isProject ? [new Option(`Use default (${fallback})`, "")] : []),
          ...options[listName].map(value => new Option(value, value))
        );
        el.value = isProject ? (doc.projects[active]?.[group]?.[key] ?? "") : fallback;
      } else {
        el.value = isProject ? (doc.projects[active]?.[group]?.[key] ?? "") : fallback;
        el.placeholder = isProject
          ? `Use default (${fallback || "Flow's current model"})`
          : "Exact model name from Flow's menu, or empty";
      }
    }
    $("#scope-title").textContent = isProject ? `Overrides for ${active}` : "Defaults for all projects";
    $("#scope-note").textContent = isProject
      ? "Fields set to \"Use default\" follow the defaults above."
      : "These apply to every project that has no override.";
    $("#reset").disabled = !isProject;
  }

  function readForm() {
    const values = { video: {}, image: {} };
    for (const [id, [group, key]] of Object.entries(FIELDS)) values[group][key] = $("#" + id).value.trim();
    return values;
  }

  // Copies the visible form into the in-memory settings for the scope that is active.
  function storeForm() {
    const values = readForm();
    if (active === "") {
      doc.defaults = values;
      return;
    }
    const kept = { video: nonEmpty(values.video), image: nonEmpty(values.image) };
    if (Object.keys(kept.video).length || Object.keys(kept.image).length) doc.projects[active] = kept;
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
