// Generator status plus Restart / Stop buttons in the studio top bar.
(() => {
  const box = document.getElementById("server-control");
  if (!box || location.protocol === "file:") return;
  const status = box.querySelector(".server-status");
  const restart = box.querySelector("[data-server=restart]");
  const stop = box.querySelector("[data-server=stop]");
  let busyAction = false;

  function show(text, state) {
    status.textContent = text;
    box.dataset.state = state;
    restart.disabled = stop.disabled = busyAction || state !== "online";
  }

  async function health() {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error();
      return body;
    } catch { return null; }
  }

  async function refresh() {
    if (busyAction) return;
    const body = await health();
    if (!body) show("Generator offline · double-click Start Story Studio.vbs", "offline");
    else if (body.serverApi !== 1) show("Generator outdated · restart it once from Start Story Studio.vbs", "outdated");
    else show(body.busy ? "Generator online · working…" : "Generator online", "online");
  }

  async function send(action, force = false) {
    const response = await fetch("/api/server", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, force })
    });
    return { response, body: await response.json() };
  }

  async function control(action) {
    const verb = action === "restart" ? "Restart" : "Stop";
    if (action === "stop" && !confirm("Stop the generator? Flow and TikTok buttons stop working until you double-click Start Story Studio.vbs again.")) return;
    busyAction = true;
    show(action === "restart" ? "Restarting generator…" : "Stopping generator…", "working");
    try {
      let { response, body } = await send(action);
      if (response.status === 409 && body.busy) {
        if (!confirm(`${body.error}\n\n${verb} anyway? The running job will be interrupted and its day unchecked so you can retry.`)) {
          busyAction = false; refresh(); return;
        }
        ({ response, body } = await send(action, true));
      }
      if (!response.ok || !body.ok) throw new Error(body.error || `${verb} failed.`);
    } catch (error) {
      busyAction = false;
      show(`${verb} failed: ${error.message}`, "offline");
      return;
    }
    if (action === "stop") {
      await new Promise(r => setTimeout(r, 800));
      busyAction = false;
      show("Generator stopped · double-click Start Story Studio.vbs to start it again", "offline");
      return;
    }
    // Wait for the old copy to go away and the new one to answer.
    const deadline = Date.now() + 20000;
    await new Promise(r => setTimeout(r, 1000));
    while (Date.now() < deadline) {
      if (await health()) { busyAction = false; await refresh(); location.reload(); return; }
      await new Promise(r => setTimeout(r, 500));
    }
    busyAction = false;
    show("Generator did not come back · double-click Start Story Studio.vbs", "offline");
  }

  box.hidden = false;
  restart.addEventListener("click", () => control("restart"));
  stop.addEventListener("click", () => control("stop"));
  refresh();
  setInterval(refresh, 10000);
})();
