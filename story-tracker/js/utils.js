// Small generic helpers.
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const status = t => $("#status").textContent = t;
const copy = t => navigator.clipboard.writeText(t).then(() => status("copied ✓"));

// Dates are handled as local "YYYY-MM-DD" strings.
const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => dateStr(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number); return dateStr(new Date(y, m - 1, d + n)); };

// Parses "KEY: value" blocks from an AI reply, e.g. parseFields(t, ["TITLE","SUMMARY"]) -> {TITLE, SUMMARY}.
function parseFields(text, keys) {
  const out = {}, re = new RegExp("^[\\s*#_>-]*(" + keys.join("|") + ")[\\s*_]*:[\\s*_]*(.*)$", "i");
  let k = null;
  for (const line of text.split("\n")) {
    const m = line.match(re);
    if (m) { k = m[1].toUpperCase(); out[k] = m[2]; } else if (k) out[k] += "\n" + line;
  }
  for (const key in out) out[key] = out[key].trim().replace(/^\*+|\*+$/g, "").trim();
  return out;
}

// Turns a numbered/bulleted AI list into an array of clean lines.
const parseList = text => text.split("\n").map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/\*+/g, "").trim()).filter(l => l.length > 3);
