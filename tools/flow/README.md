# Google Flow video automation

Generates a project's video in Google Flow and saves it into `projects/<project>/videos/day-NN.mp4`.

## Run

On Windows, double-click **Start Story Studio.vbs** in the `aiprojects` folder. It starts the generator in the background and opens the studio in your browser. If it is already running, the launcher reuses it. Open your project from the studio rather than opening its HTML file directly. Node.js and the project dependencies must already be installed.
After a server update, the launcher may ask to restart the generator. Restarting interrupts active generations; approve only when they have finished.

Alternatively, start it from a terminal:

```powershell
cd "C:\Users\ai genius\Documents\aiprojects"
npm install        # first time only
npm start          # starts tools/flow/server.mjs on 127.0.0.1:8787
```

Open `http://127.0.0.1:8787/projects/daily-motivations/` (not `file://`, which cannot reach the server).
Check the status with `http://127.0.0.1:8787/api/health`.

## How it works

- `flow-video.mjs` connects to a Chrome that has remote debugging on port 9222. If none is running, it launches Chrome with a profile.
- Profile: `FLOW_PROFILE_DIR`, or the Katahari `.flow-profile` if it exists, or `aiprojects\.flow-profile`. Sign in to Google once in that profile.
- `FLOW_CDP_URL` can point to an already running Chrome instead.
- Jobs run one at a time. The page's Generate button calls `POST /api/generate` with the day's prompt, model, aspect and duration.
- Failures save a screenshot and JSON to `tools/flow/logs/`.
- Before each video, the active Google account's credits are read from the account menu. If it has fewer than 15, Flow switches to the next account in `tools/flow/flow-accounts.json` (a gitignored list of emails, tried in order) and checks again. If no account has 15 or more, the job fails.
- Each studio project's video is generated in the Flow project with the same name as its card in the studio (e.g. "Daily Motivations"). If the active account has a project with that name, it is opened. Otherwise a new project is created and renamed to that name. The name comes from `platform/projects.js`.

## When Flow's UI changes

1. Run one generation and read the newest file in `tools/flow/logs/`.
2. Update the matching locator in `selectors.mjs`. It is the only file that holds Flow selectors.
3. Restart the server, because the driver is loaded at startup.

## Settings

Open `http://127.0.0.1:8787/tools/flow/settings.html` (or the "Flow settings" link on the studio home page).

- **Defaults for all projects:** video model, aspect ratio and duration; image model name and aspect ratio.
- **Per project:** override any of those for one project. "Use default" follows the defaults.
- Saved to `tools/flow/settings.json`. Built-in defaults: Omni 1.1 Flash, 9:16, 10s.
- `POST /api/generate` uses the project's settings for any field the request leaves out, so an automation only needs `project`, `day` and `prompt`.
- Daily Motivations uses these defaults until someone changes its model, aspect or duration on the page.
- The Flow icon on the GK Questions project card starts the first original day not marked done in that browser, without leaving the studio. It uses the GK project settings and marks the day done as generation starts. You can navigate away or refresh; return to the project card for its status and video link. Keep the generator and Flow Chrome running: restarting the generator interrupts jobs and clears their status. The existing GK prompts require a 10-second duration. If generation fails, the day remains marked done; uncheck it in the project to retry. Progress saved under `file://` or in a different browser is separate; if no saved progress is found, the page asks before starting Day 1.
- The Daily Motivations card also has a Flow icon. It uses that workspace's selected settings, or its Flow defaults if none were selected, and marks the next day made when the job starts. Its prompts also require 10 seconds. If the job fails, uncheck the day in the workspace before retrying.

Image settings are stored and returned by the API, but the driver does not generate images yet. Flow's image-mode selectors need to be added to `selectors.mjs` first.

## Post to TikTok

The GK Questions and Daily Motivations cards list MP4s in their videos folders. Day-numbered videos use the selected day's description for their captions; for other files, enter a description when prompted. Click the music-note icon beside an unposted video and confirm to post it through TikTok's website, without a TikTok API. The generator asks the public Gemini service at `https://mukeshpokharel-testing.hf.space/gemini` for a Nepali caption, then opens TikTok Studio in the same Chrome profile as Flow. Sign in to TikTok in that Chrome window when needed and keep the generator and browser open. TikTok's own posting and privacy settings apply. The actual Space currently exposes `/gemini`, with the same `{"prompt":"..."}` and `{"text":"..."}` contract as `/geminiGenerate`.

Gemini is instructed to include the quiz's questions and answers and related accurate GK information without day numbers; motivation captions expand on the original spoken line. For other files, provide the relevant quiz details or motivational line in the description.

Confirmed submissions are remembered in `tools/flow/tiktok-posts.json`, keyed to the video content; generating a replacement makes it eligible to post again. Submission does not guarantee public visibility: TikTok may put a video under review or apply privacy restrictions. If a browser error or restart occurs after submission, the result is marked **unknown** to prevent duplicate posts. Check TikTok first, then use **Resolve status** to mark it posted or allow a retry. A previously posted video that predates this feature must be checked manually before using its icon. Do not remove the posting history unless you are prepared to check videos manually.

API:

- `GET /api/flow-settings` returns the saved settings, the option lists and the project ids.
- `GET /api/flow-settings?project=<id>` also returns `effective`, the merged values for that project.
- `PUT /api/flow-settings` with the full settings object replaces the saved settings.

## Flow Frames Studio (`projects/flow-frames`)

Start-frame + End-frame videos. Same machinery as Ink Explainer (Gemini text/TTS via the public Space, Flow driven through Chrome), no API keys.

1. Pick one of 47 templates, topic, language, aspect, and shot length (default **4s**; 6/8/10 allowed). Gemini (`/api/explainer/gemini`) writes the storyboard (style bible, cast, shots with start/end prompts, motion prompt, narration).
2. **Create characters in Flow** (consistency), then **Generate all frames**: Flow image mode, up to 4 in parallel, saved to `projects/flow-frames/episodes/<id>/frames/frame-NN.png`.
3. **Generate all videos**: for each shot the driver switches Flow to *Video > Frames*, uploads the Start and End images, pastes the motion prompt and saves `videos/shot-NN.mp4`.
4. Voice per shot via Gemini TTS (`/api/explainer/block-tts`), then **Play episode** to preview.

Chaining: a chained shot's Start frame is the previous shot's End frame, so N shots need N+1 images and clips join seamlessly. Server code: `frames-service.mjs`, `frames-routes.mjs` (`/api/frames/*`), `generateFrameVideo` in `flow-video.mjs`. Tests: `node --test tools/flow/frames-service.test.mjs`.

The Start/End tile selectors (`frameTile`, `frameUploadItem`, `frameConfirmButton`, `framesRadio`) are in `selectors.mjs`. If a Frames-mode run fails, read the newest file in `logs/` and adjust them. Restart the generator after updating.
