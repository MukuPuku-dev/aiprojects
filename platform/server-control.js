// Generator status plus Restart / Stop buttons in the studio top bar,
// and a compact top-right Restart icon button on every project workspace.
(() => {
  if (location.protocol === "file:" || window.__storyStudioServerControlLoaded) return;
  window.__storyStudioServerControlLoaded = true;

  async function health() {
    try {
      const response = await fetch("/api/health", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error();
      return body;
    } catch { return null; }
  }

  async function send(action, force = false) {
    const response = await fetch("/api/server", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, force })
    });
    return { response, body: await response.json() };
  }

  const box = document.getElementById("server-control");

  // Full topbar widget on Studio Home
  if (box) {
    const status = box.querySelector(".server-status");
    const restart = box.querySelector("[data-server=restart]");
    const stop = box.querySelector("[data-server=stop]");
    let busyAction = false;

    function show(text, state) {
      status.textContent = text;
      box.dataset.state = state;
      restart.disabled = stop.disabled = busyAction || state !== "online";
    }

    async function refresh() {
      if (busyAction) return;
      const body = await health();
      if (!body) show("Generator offline · double-click Start Story Studio.vbs", "offline");
      else if (body.serverApi !== 1) show("Generator outdated · restart it once from Start Story Studio.vbs", "outdated");
      else show(body.busy ? "Generator online · working…" : "Generator online", "online");
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
    return;
  }

  // Compact top-right Restart icon button for every workspace page
  function mountFloatingRestart() {
    if (document.getElementById("ss-mini-restart")) return;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ss-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      #ss-mini-restart {
        position: fixed; top: 10px; right: 12px; z-index: 9999;
        width: 34px; height: 34px; padding: 0; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        background: rgba(18, 16, 28, 0.86); color: #f3f0ff;
        border: 1px solid rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(8px); cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        font: 700 16px/1 system-ui, sans-serif; transition: transform .15s, border-color .15s, background .15s;
      }
      #ss-mini-restart:hover:not(:disabled) { border-color: #a855f7; background: rgba(34, 24, 54, 0.95); transform: scale(1.06); }
      #ss-mini-restart:disabled { opacity: .55; cursor: wait; }
      #ss-mini-restart .ss-icon { display: inline-block; line-height: 1; }
      #ss-mini-restart[data-state="working"] .ss-icon { animation: ss-spin .85s linear infinite; }
      #ss-mini-restart .ss-dot {
        position: absolute; top: 2px; right: 2px; width: 7px; height: 7px;
        border-radius: 50%; background: #4ade80; border: 1px solid #0e0c18;
      }
      #ss-mini-restart[data-state="working"] .ss-dot { background: #facc15; }
      #ss-mini-restart[data-state="offline"] .ss-dot { background: #f87171; }
    `;
    document.head.appendChild(style);

    const btn = document.createElement("button");
    btn.id = "ss-mini-restart";
    btn.type = "button";
    btn.dataset.state = "online";
    btn.title = "Restart Story Studio server";
    btn.setAttribute("aria-label", "Restart Story Studio server");
    btn.innerHTML = `<span class="ss-icon" aria-hidden="true">↻</span><span class="ss-dot" aria-hidden="true"></span>`;
    document.body.appendChild(btn);

    let busyAction = false;
    function setState(state, title) {
      btn.dataset.state = state;
      btn.title = title;
      btn.disabled = busyAction || state === "offline";
    }

    async function refresh() {
      if (busyAction) return;
      const body = await health();
      if (!body) setState("offline", "Server offline · double-click Start Story Studio.vbs");
      else if (body.busy) setState("online", "Server online (working…) · click to restart");
      else setState("online", "Server online · click to restart Story Studio");
    }

    btn.addEventListener("click", async () => {
      if (busyAction) return;
      busyAction = true;
      setState("working", "Restarting Story Studio server…");
      try {
        let { response, body } = await send("restart");
        if (response.status === 409 && body.busy) {
          if (!confirm(`${body.error}\n\nRestart anyway? The running job will be interrupted.`)) {
            busyAction = false; refresh(); return;
          }
          ({ response, body } = await send("restart", true));
        }
        if (!response.ok || !body.ok) throw new Error(body.error || "Restart failed.");
      } catch (err) {
        busyAction = false;
        setState("offline", `Restart failed: ${err.message}`);
        return;
      }
      const deadline = Date.now() + 20000;
      await new Promise(r => setTimeout(r, 1000));
      while (Date.now() < deadline) {
        if (await health()) { busyAction = false; location.reload(); return; }
        await new Promise(r => setTimeout(r, 500));
      }
      busyAction = false;
      setState("offline", "Server did not come back · double-click Start Story Studio.vbs");
    });

    refresh();
    setInterval(refresh, 15000);
  }

  if (document.body) mountFloatingRestart();
  else document.addEventListener("DOMContentLoaded", mountFloatingRestart);
})();
