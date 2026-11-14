(() => {
  const projects = ["gk-questions", "daily-motivations"];
  const lists = new Map(), messages = new Map(), busy = new Set();
  let refreshing = false;

  function contextFor(project, day) {
    if (project === "gk-questions") {
      const item = GK_DAYS[day - 1];
      return `Nepali general knowledge quiz, day ${day}, topic: ${item.title}.\n${item.qs.map(([q, a]) => `${q} — ${a}`).join("\n")}`;
    }
    const item = VIDEOS[day - 1];
    return `Nepali motivational video, day ${day}. Spoken line: ${item.q}\nMeaning: ${item.en}\nScene: ${item.scene}`;
  }
  function cardFor(project) { return document.querySelector(`[data-flow-project="${project}"]`); }
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
    const message = messages.get(project);
    if (message) {
      const line = document.createElement("p");
      line.className = "tiktok-message"; line.setAttribute("role", "status"); line.textContent = message;
      panel.append(line);
    }
    for (const video of lists.get(project) || []) {
      const row = document.createElement("div");
      row.className = "tiktok-row";
      const link = document.createElement("a");
      link.href = `/projects/${project}/videos/day-${String(video.day).padStart(2, "0")}.mp4`;
      link.target = "_blank"; link.rel = "noopener"; link.textContent = `Day ${video.day}`;
      row.append(link);
      if (video.active || busy.has(`${project}:${video.day}`)) {
        row.append(document.createTextNode(" Uploading to TikTok…"));
      } else if (video.status === "posted") {
        row.append(document.createTextNode(" Submitted to TikTok ✓"));
      } else if (video.status === "unknown") {
        const resolve = document.createElement("button");
        resolve.type = "button"; resolve.textContent = "Resolve status";
        resolve.title = "Check TikTok before resolving the uncertain post";
        resolve.addEventListener("click", () => resolveStatus(project, video.day));
        row.append(document.createTextNode(" Posting result unknown. "), resolve);
      } else {
        const post = document.createElement("button");
        post.type = "button"; post.className = "tiktok-post"; post.textContent = "♪";
        post.title = `Post Day ${video.day} to TikTok`;
        post.setAttribute("aria-label", `Post ${project === "gk-questions" ? "GK Questions" : "Daily Motivations"} Day ${video.day} to TikTok`);
        post.addEventListener("click", () => start(project, video.day));
        row.append(post);
      }
      panel.append(row);
    }
  }
  async function refresh() {
    if (refreshing || location.protocol === "file:") return;
    refreshing = true;
    try {
      await Promise.all(projects.map(async project => {
        try {
          const response = await fetch(`/api/tiktok/videos?project=${project}`, { cache: "no-store" });
          if (response.status === 404) throw new Error("Restart Story Studio to enable TikTok posting.");
          const body = await response.json();
          if (!response.ok || !body.ok || !Array.isArray(body.videos)) throw new Error(body.error || "Could not load videos.");
          lists.set(project, body.videos);
          if (messages.get(project)?.startsWith("Could not load")) messages.delete(project);
        } catch (error) { messages.set(project, `Could not load TikTok videos: ${error.message}`); }
        render(project);
      }));
    } finally { refreshing = false; }
  }
  async function start(project, day) {
    if (!confirm(`Post ${project === "gk-questions" ? "GK Questions" : "Daily Motivations"} Day ${day} to TikTok using the signed-in account? Gemini will generate the caption.`)) return;
    const key = `${project}:${day}`;
    busy.add(key); messages.set(project, `Preparing Day ${day} caption with Gemini…`); render(project);
    try {
      const response = await fetch("/api/tiktok/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, day, context: contextFor(project, day) })
      });
      const body = await response.json();
      if (!response.ok || !body.ok || typeof body.id !== "string") throw new Error(body.error || "Could not start TikTok posting.");
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const statusResponse = await fetch(`/api/tiktok/posts/${encodeURIComponent(body.id)}`);
        const status = await statusResponse.json();
        if (!statusResponse.ok || !status.ok) throw new Error(status.error || "Could not check the upload.");
        if (status.status === "posted") { messages.set(project, `Day ${day} submitted to TikTok. Check its review and privacy status there.`); break; }
        if (status.status === "failed" || status.status === "unknown") throw new Error(`${status.error || "Posting failed."}${status.status === "unknown" ? " Check TikTok before trying again." : ""}`);
        messages.set(project, status.status === "caption" ? `Preparing Day ${day} caption with Gemini…` : `Day ${day}: ${status.status === "posting" ? "Posting" : "Uploading"} in TikTok…`);
        render(project);
      }
    } catch (error) { messages.set(project, `Day ${day}: ${error.message}`); }
    finally { busy.delete(key); await refresh(); render(project); }
  }
  async function resolveStatus(project, day) {
    if (!confirm(`Check TikTok for Day ${day} before continuing. Choose OK only if you have checked; Cancel leaves the status unresolved.`)) return;
    const posted = confirm(`Is Day ${day} visible as a posted video on TikTok?\n\nOK = mark posted. Cancel = it was not posted, allow retry.`);
    try {
      const response = await fetch("/api/tiktok/resolve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, day, posted })
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Could not update status.");
      messages.set(project, posted ? `Day ${day} marked posted.` : `Day ${day} can be retried.`);
    } catch (error) { messages.set(project, `Could not resolve Day ${day}: ${error.message}`); }
    await refresh(); render(project);
  }
  window.addEventListener("projects-rendered", () => { projects.forEach(render); refresh(); });
  window.addEventListener("videos-changed", refresh);
  refresh();
  setInterval(refresh, 5000);
})();
