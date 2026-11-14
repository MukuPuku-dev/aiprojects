# Google Flow video automation

Generates a project's video in Google Flow and saves it into `projects/<project>/videos/day-NN.mp4`.

## Run

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

Model, duration and aspect are set on the page. Defaults: Omni 1.1 Flash, 10s, 9:16.
