// Load the local cache first, then reconcile it with the remote database.
loadCache();
cur = projects()[0]?.id || null;
render();
status("connecting to database…");
loadRemote()
  .then(() => { status("synced ✓"); if (!D[cur]) cur = projects()[0]?.id || null; render(); })
  .catch(e => status("⚠ offline (local only): " + e.message));

document.addEventListener("visibilitychange", () => document.hidden ? flushPending() : syncNow(false));
window.addEventListener("pagehide", flushPending);
window.addEventListener("online", () => syncNow(false));
setInterval(() => { if (!document.hidden) syncNow(false); }, 120000);
