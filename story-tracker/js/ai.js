// One explicit request per generated prompt.
async function ai(prompt) {
  const r = await fetch(GEMINI, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({prompt})});
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.detail || ("HTTP " + r.status));
  return j.text || "";
}

// Disables a button while an AI task runs and reports errors.
async function runAI(btn, fn) {
  const old = btn.textContent; btn.disabled = true; btn.textContent = "Thinking…";
  try { await fn(); } catch (e) { alert("AI error: " + e.message); }
  btn.disabled = false; btn.textContent = old;
}
