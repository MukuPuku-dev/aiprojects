// Generates and saves one complete prompt in a single explicit AI request.
async function generatePrompt(button, pid) {
  const project = D[pid];
  const date = $("#promptDate").value || today();
  const direction = $("#direction").value.trim();
  const previous = promptRecords(pid).slice(0, 10);
  const priorText = previous.map(r => `DATE: ${r.date || "unknown"}\nPROMPT: ${r.text.slice(0, 1200)}`).join("\n\n---\n\n");
  const b = project.data;
  const request = `Create ONE complete, standalone video-generation prompt for a 10-second video.

PROJECT: ${b.name}
PROJECT / STORY / TOPIC: ${b.premise || "(not specified)"}
CHARACTERS OR SUBJECT: ${b.characters || "(choose an appropriate subject)"}
VISUAL STYLE: ${b.style || "(choose an appropriate cinematic style)"}
OTHER REQUIREMENTS: ${b.rules || "(none specified)"}
DATE FOR THIS VIDEO: ${date}
TODAY'S DIRECTION: ${direction || "(choose a suitable idea consistent with this project)"}

PREVIOUSLY SAVED PROMPTS (most recent first; use these for continuity and avoid repeating their story, actions, dialogue, or distinctive imagery):
${priorText || "(none yet)"}

Return only one prompt, ready to paste into a video generator. Organize it in this order using clear section headings: opening format and duration; CHARACTER; ENVIRONMENT; SHOT-BY-SHOT STORY AND TIMING with time ranges covering the full 10 seconds; EXACT DIALOGUE / VOICEOVER; AUDIO; VISUAL STYLE; STRICT REQUIREMENTS. Make the character and setting concrete and consistent with the project guidance. Include exact dialogue only when appropriate, and keep it short enough to fit naturally within 10 seconds. Keep the whole prompt self-contained. Do not include an example, alternatives, commentary, or multiple prompts.`;

  button.disabled = true;
  const original = button.textContent;
  button.textContent = "Generating one prompt…";
  try {
    const text = (await ai(request)).trim();
    if (!text) throw new Error("The AI returned an empty prompt.");
    savePromptRecord(pid, date, text, "Generated");
    status("prompt generated and saved ✓");
    render();
  } catch (e) {
    alert("Could not generate prompt: " + e.message);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}
