const PROJECTS = [
  {
    name: "Daily Motivations",
    type: "Nepali motivation shorts",
    description: "30 cinematic 10-second Flow clips with original Nepali motivational lines, voice-over scripts, and ready-to-post captions.",
    href: "projects/daily-motivations/index.html",
    id: "daily-motivations",
    totalClips: 30,
    mark: "🔥",
    accent: "coral",
    flowNext: true
  },
  {
    name: "GK Questions",
    type: "Nepali daily rapid-fire quiz",
    description: "30 days of ready-to-copy 10-second Google Flow prompts, with 90 Nepali general-knowledge questions and answers.",
    href: "projects/gk-questions/index.html",
    id: "gk-questions",
    totalClips: 30,
    mark: "🇳🇵",
    accent: "gold",
    flowNext: true
  },
  {
    name: "Teenage Love Vibes",
    type: "Dialogueless cinematic romance · Crush to Breakup",
    description: "30 dialogueless, narrationless 10-second Flow video clips tracing an unforgettable teenage love story from secret crush to deep love to heartbreak through pure visuals, eyes, and music.",
    href: "projects/teenage-love-vibes/index.html",
    id: "teenage-love-vibes",
    totalClips: 30,
    mark: "💔",
    accent: "coral",
    flowNext: true
  },
  {
    name: "माया",
    type: "B&W red-splash portraits · Nepali quote & story photos",
    description: "30 moody black-and-white portrait photo prompts with selective crimson-red tika/gulal color splash, @माया quote cards, heart-touching continuation stories, and a built-in poster compositor.",
    href: "projects/maya-photos/index.html",
    id: "maya-photos",
    totalClips: 30,
    mark: "🥀",
    accent: "gold",
    flowNext: true
  },
  {
    name: "जिन्दगीको किताब",
    type: "Golden-hour sunset quote portraits · Viral Nepali feelings",
    description: "30 warm golden-hour veranda & misty Nepali hill book portraits with heartfelt sky quotes, burnt-orange highlights, Poster Studio, and deep reflection captions.",
    href: "projects/jindagi-kitaab/index.html",
    id: "jindagi-kitaab",
    totalClips: 30,
    mark: "📖",
    accent: "gold",
    flowNext: true
  },
  {
    name: "काम नलाग्ने कोही हुँदैन",
    type: "Nepali village drama · Season 1",
    description: "12 episodes, each broken into several 10-second Flow clips with Nepali dialogue, cast and place references, and episode progress tracking.",
    href: "projects/kam-nalagne/index.html",
    id: "kam-nalagne",
    totalClips: 77,
    mark: "🏔️",
    accent: "gold",
    flowNext: true
  },
  {
    name: "साधु र राडी",
    type: "Nepali folk tale · short story",
    description: "A 22-clip short film about a sadhu, a woolen mat and stolen grain, with Nepali dialogue, reference images and a final moral.",
    href: "projects/sadhu-rani/index.html",
    id: "sadhu-rani",
    totalClips: 22,
    mark: "🪔",
    accent: "coral",
    flowNext: true
  },
  {
    name: "तरकारीको कथा",
    type: "3D Macro Comedy-Drama · Vegetable Saga",
    description: "40 Pixar-style 3D macro clips starring Aalu (Potato), Golbheda (Tomato), Pyaaj (Onion), Khursani (Chili) & Lasun Baaje—funny kitchen escapes, monsoon rescues, and touching future growth.",
    href: "projects/tarkari-katha/index.html",
    id: "tarkari-katha",
    totalClips: 40,
    mark: "🥔",
    accent: "coral",
    flowNext: true
  },
  {
    name: "The Last Lantern",
    type: "16:9 Stickman Survival Saga · 10m+ Visual-Only",
    description: "64 seamless 10-second 16:9 Classic 2D Stickman scenes (10m 40s, no narration): Kiran, Pip & Clockwork Owl journey from a dimmed village through the Ash Forest, Clockwork Spire & Glass City to restore dawn—with full Storyboard, Animation & CapCut Guide.",
    href: "projects/stickman-lantern/index.html",
    id: "stickman-lantern",
    totalClips: 64,
    mark: "🏮",
    accent: "gold",
    flowNext: true
  },
  {
    name: "Ink Explainer",
    type: "16:9 Rapid-Beat English Episode Studio · Flow + Gemini TTS",
    description: "Multi-episode Ink Explainer studio ('What Did Ancient Humans Actually Do All Day?') with continuous block narration, 1 illustration every 1.5–2.5s synced to word timestamps, 5 iconic stickman/whiteboard card types, and full-episode WebM export.",
    href: "projects/ink-explainer/index.html",
    id: "ink-explainer",
    totalClips: 32,
    mark: "🖋️",
    accent: "gold",
    flowNext: true
  },
  {
    name: "Images from CSV",
    type: "CSV Batch Image Generator · Upload CSV & Save to Folder",
    description: "Upload any prompt CSV (with id, type, placement, aspect, caption & prompt/brief), auto-name each image identifiably, generate in Google Flow, and save into an organized folder.",
    href: "projects/images-from-csv/index.html",
    id: "images-from-csv",
    totalClips: 15,
    mark: "🗂️",
    accent: "coral",
    flowNext: false
  },
  {
    name: "Loksewa Sheet Studio",
    type: "Nepali & English MCQ Video Builder · Flow Images + HF Space",
    description: "Build Loksewa & GK exam-sheet videos with 6 built-in Nepali/English sets, custom questions, Gemini AI question generation, Google Flow illustration batching, and direct HF Space rendering.",
    href: "projects/loksewa-sheet/index.html",
    id: "loksewa-sheet",
    totalClips: 60,
    mark: "📝",
    accent: "gold",
    flowNext: false
  },
  {
    name: "PurpleStick",
    type: "9:16 Viral 2D Stickman Comedy Reels · PurpleStick Originals",
    description: "30 punchy 8–10s vertical 2D stickman comedy skits (couple roasts, classroom traps, dating twists, office fails) with royal-purple stickmen, lip-sync English dialogue, viral captions, and a Custom Skit Maker.",
    href: "projects/purplestick/index.html",
    id: "purplestick",
    totalClips: 30,
    mark: "🟣",
    accent: "purple",
    flowNext: true
  },
  {
    name: "Download Facebook Videos",
    type: "Facebook Reels & Video Downloader · yt-dlp + FFmpeg",
    description: "Paste any Facebook video or Reel link to download in 720p (auto-merge) or 1080p (separate video + audio merged with FFmpeg), saved to Downloads\\FacebookReels and ready to play instantly.",
    href: "projects/download-facebook-videos/index.html",
    id: "download-facebook-videos",
    totalClips: 0,
    mark: "📥",
    accent: "coral",
    flowNext: false
  },
  {
    name: "Live Host Avatar Studio",
    type: "72-Frame Photorealistic Lip-Sync & Gaze Host · 3x3 Flow Grids",
    description: "Generate a consistent ultra-realistic live quiz host in Google Flow (1 master portrait + 8× 3x3 expression/gaze grids = 72 frames), auto-slice & 95% lossy-compress, preview live lip-sync, and export directly to Quiz App.",
    href: "projects/live-host-studio/index.html",
    id: "live-host-studio",
    totalClips: 8,
    mark: "🎙️",
    accent: "coral",
    flowNext: false
  },
  {
    name: "Quiz App Live 4 Questions",
    type: "Live 4 Show Queue Controller · Claude & Gemini Browser + Firestore Sync",
    description: "Control the exact questions playing in Quiz App Live 4 (Loksewa Sheet). Generate & fact-check questions via Claude or Gemini browser, paste & auto-format raw MCQs, edit/reorder/remove live, and push zero-disruption mid-show updates directly to Firestore.",
    href: "projects/quiz-app-live4-questions/index.html",
    id: "quiz-app-live4-questions",
    totalClips: 25,
    mark: "📡",
    accent: "gold",
    flowNext: false
  }
];