# Google Flow video automation

Generates a project's video in Google Flow and saves it into `projects/<project>/videos/day-NN.mp4`.

## Run

On Windows, double-click **Start Story Studio.vbs** in the `aiprojects` folder. It starts the generator in the background and opens the studio in your browser. If it is already running, the launcher reuses it. Open your project from the studio rather than opening its HTML file directly. Node.js and the project dependencies must already be installed.

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

Image settings are stored and returned by the API, but the driver does not generate images yet. Flow's image-mode selectors need to be added to `selectors.mjs` first.

API:

- `GET /api/flow-settings` returns the saved settings, the option lists and the project ids.
- `GET /api/flow-settings?project=<id>` also returns `effective`, the merged values for that project.
- `PUT /api/flow-settings` with the full settings object replaces the saved settings.
