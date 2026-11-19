const INK_EXPLAINER_META = {
  id: "ink-explainer",
  name: "Ink Explainer",
  aspect: "16:9",
  mode: "image",
  defaultVoice: "Kore",
  voices: ["Kore", "Puck", "Charon", "Fenrir", "Aoede", "Zephyr"],
  referenceVideo: "https://www.youtube.com/watch?v=49_Ph2q6uIM",
  viralFormula: [
    {
      title: "1. Phrase-by-Phrase Visual Cuts (1 Image / 1.5–2.5s)",
      detail: "Inspired directly by Ink Explainer's 11-minute hit ('What Did Ancient Humans Actually Do All Day?'): voiceover flows continuously in paragraphs while a new minimal illustration snaps onto screen every 5–10 words using word timestamps."
    },
    {
      title: "2. 5 Iconic Low-Friction Card Types",
      detail: "Whiteboard props ('SPEAR', 'REWIND 50,000 YEARS'), dashed vertical split comparisons ('YOU | HIM', 'FAST | STEADY'), bold corner-to-corner Red X negations, flat continent/timeline maps, and flat-horizon stickman caveman scenes."
    },
    {
      title: "3. Multi-Episode Studio (Not Day-to-Day)",
      detail: "Each episode lives in its own isolated episode library with continuous block WAV narration, timestamp-aligned rapid beats, and one full-episode HTML/WebM video output."
    }
  ]
};

const INK_EXPLAINER_CARD_STYLES = {
  "whiteboard-prop":
    "2D minimalist whiteboard explainer illustration on a pure solid white (#FFFFFF) background in Ink Explainer / Casually Explained style: thin clean black ink outlines, flat muted color fills, a single centered hand-drawn subject, and crisp uppercase black hand-lettered label text only where specified. No clutter, no photorealism, no gradients.",
  "split-compare":
    "2D minimalist explainer split-screen comparison card on a pure solid white (#FFFFFF) background divided vertically down the exact center by a dashed black ink line: characters have round white circle heads, thin black stick-figure limbs, simple dot eyes and expressive eyebrows (caveman has messy dark brown hair and ragged brown fur pelt tunic; modern human has plain black stick body). Clean uppercase black header labels centered at the top of each half.",
  "red-x":
    "2D flat hand-drawn stickman explainer cartoon scene with thin black ink outlines, round white circle head characters, muted flat wall/floor colors, with a bold giant bright-red X drawn corner-to-corner across the entire frame to visually cross it out.",
  "map-diagram":
    "2D flat minimalist explainer diagram or map on a pure solid white (#FFFFFF) background: clean black ink outlines, flat solid continent/region fills, simple red location pins or black timeline arrows, and crisp uppercase hand-lettered black labels.",
  "flat-scene":
    "2D flat hand-drawn stickman explainer scene in the exact Ink Explainer YouTube style: characters have round white circle heads, thin black stick-figure arms and legs, simple dot eyes and expressive eyebrows (prehistoric humans wear ragged brown fur pelt tunics with messy dark brown hair; modern anthropologists wear a tan pith helmet with clipboard and stopwatch). Simple flat horizon line, solid pale sky (#bce3f5 or warm peach #f7c9a9), flat tan-ochre earth ground (#d5b485), minimal props, clean black ink outlines, zero gradients, zero subtitles."
};

const INK_EXPLAINER_DEFAULT_EPISODE = {
  id: "ancient-humans-day",
  title: "What Did Ancient Humans Actually Do All Day?",
  subtitle: "32 Rapid Visual Beats (~2s/image) · Continuous Block Narration + Word-Timestamp Sync",
  hook: "Your alarm screams at 7 AM, yet for 95% of human history, daily survival work took about 17 hours a week.",
  niche: "Anthropology & Human History",
  characters: [
    {
      code: "CAVEMAN",
      name: "Caveman",
      role: "Prehistoric Hunter-Gatherer",
      refPrompt: "2D flat hand-drawn stickman explainer character standing full-body centered on a pure solid white (#FFFFFF) background: round white circle head, messy dark brown hair, simple dot eyes and expressive eyebrows, thin black stick-figure arms and legs, wearing a ragged brown fur pelt tunic, clean black ink outlines, no text."
    },
    {
      code: "ANTHROPOLOGIST",
      name: "Anthropologist",
      role: "Modern Field Scientist",
      refPrompt: "2D flat hand-drawn stickman explainer character standing full-body centered on a pure solid white (#FFFFFF) background: round white circle head, simple dot eyes, thin black stick-figure limbs, wearing a tan explorer field shirt and tan pith helmet, holding a clipboard and silver stopwatch, clean black ink outlines, no text."
    }
  ],
  blocks: [
    {
      blockId: 1,
      title: "Block 1 · The 7 AM Illusion & 50,000-Year Rewind",
      beats: [
        {
          beat: 1,
          cardType: "flat-scene",
          label: "",
          narration: "Your alarm screams at seven in the morning.",
          visual: "Close-up flat 2D cartoon of a classic red twin-bell alarm clock ringing loudly on a brown wooden nightstand with jagged black sound zigzags on both sides and a sunlit bedroom window behind."
        },
        {
          beat: 2,
          cardType: "flat-scene",
          label: "",
          narration: "You drag yourself out of bed for another shift,",
          visual: "Tired round-white-headed stickman with droopy eyelids standing next to an unmade grey bed looking up at a big round brown wall clock."
        },
        {
          beat: 3,
          cardType: "whiteboard-prop",
          label: "AND TONIGHT...",
          narration: "and tonight you'll collapse just to repeat it all again.",
          visual: "Pure white whiteboard frame with neat hand-lettered uppercase text 'AND TONIGHT...' centered, tiny crescent moon top-right, and small 'zzz' bottom-left."
        },
        {
          beat: 4,
          cardType: "whiteboard-prop",
          label: "REWIND 50,000 YEARS",
          narration: "Now rewind fifty thousand years into the Stone Age.",
          visual: "Pure white card showing a small sand hourglass next to uppercase black hand-lettered text 'REWIND 50,000 YEARS' circled by a clean curved backward arrow."
        },
        {
          beat: 5,
          cardType: "whiteboard-prop",
          label: "SPEAR",
          narration: "Your only tool is a sharpened wooden spear,",
          visual: "Single horizontal hand-drawn wooden spear with a lashed grey stone spearhead centered neatly on pure white, uppercase black word 'SPEAR' centered above."
        },
        {
          beat: 6,
          cardType: "flat-scene",
          label: "",
          narration: "and you wake up beside a small fire on open dirt.",
          visual: "Wide flat pale-orange dawn sky and flat tan earth: messy-haired stickman caveman in ragged brown fur tunic holding a spear stands next to a tiny orange campfire ring with a '?' above his round white head."
        },
        {
          beat: 7,
          cardType: "flat-scene",
          label: "",
          narration: "We were taught ancient life was a grim, nonstop struggle,",
          visual: "Somber overcast grey sky above cracked brown earth and one dead leafless tree: exhausted stickman caveman slumping forward dragging a spear behind him."
        },
        {
          beat: 8,
          cardType: "whiteboard-prop",
          label: "",
          narration: "at least according to every textbook we read in school.",
          visual: "Three thick stacked hardcover books on pure white with a puff of dust and an open book in front showing a hand-drawn ink sketch of a stickman caveman."
        }
      ]
    },
    {
      blockId: 2,
      title: "Block 2 · What Buried Bones Reveal About Modern Traps",
      beats: [
        {
          beat: 9,
          cardType: "flat-scene",
          label: "",
          narration: "Until archaeologists actually dug up the bones underneath our feet.",
          visual: "Flat cross-section diagram of earth strata: pale blue sky and short green grass blades along top horizon, dark brown soil layer below showing a calm white hand-drawn human skeleton lying horizontally underground."
        },
        {
          beat: 10,
          cardType: "whiteboard-prop",
          label: "",
          narration: "Because here is the strange paradox of modern progress:",
          visual: "Stickman narrator with round white head standing centered on a bright white whiteboard background raising one index finger with a knowing half-smile."
        },
        {
          beat: 11,
          cardType: "flat-scene",
          label: "",
          narration: "we built washing machines, microwaves, and cars to save us time,",
          visual: "Cheerful flat indoor living-utility room showing a white front-loading washing machine beside a blue laundry basket on wood floorboards, and floating up arrows beside a microwave and blue car icon."
        },
        {
          beat: 12,
          cardType: "split-compare",
          label: "YOU | HIM",
          narration: "yet you drown in paperwork while he relaxed by the fire.",
          visual: "Split white screen with vertical dashed line: left side labeled 'YOU' has sad white-headed stickman beneath a wall clock beside a tall stack of white papers; right side labeled 'HIM' has grinning messy-haired caveman reclining hands behind head beside a cozy orange campfire."
        },
        {
          beat: 13,
          cardType: "flat-scene",
          label: "",
          narration: "At dig sites around the world, scientists measured ancient skeletons,",
          visual: "Flat desert excavation trench marked with wooden stakes and rope: two stickman archaeologists in tan sun hats kneeling carefully with trowel and paintbrush around white fossil bones and a wooden crate."
        },
        {
          beat: 14,
          cardType: "split-compare",
          label: "MODERN? | CAVEMAN?",
          narration: "comparing hunter-gatherer bones against the early farmers who came later.",
          visual: "Pure white diagram comparing skeleton stature: uppercase hand-lettered label 'MODERN?' above a tall horizontal skeleton pointed to by a stick pointer, next to 'CAVEMAN?' above a skeleton comparison."
        },
        {
          beat: 15,
          cardType: "map-diagram",
          label: "HUNTER-GATHERER -> FARMER",
          narration: "And the transition from foraging to farming shocked historians:",
          visual: "Minimal horizontal timeline arrow on pure white background with two bright red map pins planted at each end labeled 'HUNTER-GATHERER' and 'FARMER'."
        },
        {
          beat: 16,
          cardType: "flat-scene",
          label: "PROGRESS?",
          narration: "early farmers were shorter, sicker, and worked twice as hard.",
          visual: "Uniform green crop rows stretching behind an exhausted hunched caveman farmer dripping sweat over dark tilled furrows with bold question label 'PROGRESS?' near the top sky."
        }
      ]
    },
    {
      blockId: 3,
      title: "Block 3 · Campfire Mornings, No Bosses & Persistence Hunting",
      beats: [
        {
          beat: 17,
          cardType: "whiteboard-prop",
          label: "WORK / DIET / MOVEMENT",
          narration: "Their bones recorded what they ate and how much they worked.",
          visual: "Detailed hand-drawn anatomical ink skeleton lying horizontally on pure white with clean arrows pointing to upper arm labeled 'WORK', jaw labeled 'DIET', and leg bones labeled 'MOVEMENT'."
        },
        {
          beat: 18,
          cardType: "split-compare",
          label: "✓ | ✗",
          narration: "Hunting and gathering beat endless hours of grinding grain.",
          visual: "Split white panel with vertical dashed line: left shows upright smiling caveman holding a spear beside a green checkmark; right shows strained hunchbacked farmer grinding grain on a stone quern beside a red X."
        },
        {
          beat: 19,
          cardType: "flat-scene",
          label: "",
          narration: "A real Paleolithic morning started whenever the sun warmed the camp.",
          visual: "Warm peach sunrise sky and flat ochre plain: happy stickman caveman stretching both arms wide sitting on a straw mat leaning against a round grey boulder beside a crackling fire and planted spear."
        },
        {
          beat: 20,
          cardType: "flat-scene",
          label: "",
          narration: "Families shared leftovers by the embers and planned the day together.",
          visual: "Three prehistoric stickman friends in brown fur tunics sitting relaxed in a circle around a stone campfire eating cooked haunches in front of triangular hide tents."
        },
        {
          beat: 21,
          cardType: "flat-scene",
          label: "",
          narration: "Gathering wild berries, roots, and honey took just a few hours,",
          visual: "Two cheerful stickman gatherers carrying woven baskets stroll calmly past lush green bushes dotted with red berries under a bright pale-blue sky and flat tan plain."
        },
        {
          beat: 22,
          cardType: "red-x",
          label: "",
          narration: "and there was no boss hovering over a desk demanding overtime.",
          visual: "Angry red-faced tie-wearing stickman boss glaring and pointing behind a brown wooden office desk with laptop, crossed out corner-to-corner by a thick giant bright red X."
        },
        {
          beat: 23,
          cardType: "flat-scene",
          label: "",
          narration: "Prey animals were much faster in a short sprint,",
          visual: "Graceful brown-tan horned antelope leaping at full gallop rightward across flat tan grassland with cartoon motion speed lines and little dust puffs."
        },
        {
          beat: 24,
          cardType: "split-compare",
          label: "FAST | STEADY",
          narration: "but humans evolved to sweat and walk steadily for hours.",
          visual: "Split white comparison card with dashed black vertical line: left labeled 'FAST' shows dashing antelope with motion lines; right labeled 'STEADY' shows calm caveman jogging steadily."
        }
      ]
    },
    {
      blockId: 4,
      title: "Block 4 · The 17-Hour Workweek & Afternoon Leisure",
      beats: [
        {
          beat: 25,
          cardType: "flat-scene",
          label: "",
          narration: "Eventually the animal overheated and stopped in its tracks,",
          visual: "Sweating exhausted antelope standing head-down with wavy orange heat-shimmer lines rising above its back as a calm stickman hunter walks up holding a spear from the left."
        },
        {
          beat: 26,
          cardType: "flat-scene",
          label: "",
          narration: "giving the entire band enough meat for days of rest.",
          visual: "Foreground close-up of a sweaty relieved stickman caveman carrying a hunted antelope draped across his shoulders against a warm sunlit plain."
        },
        {
          beat: 27,
          cardType: "flat-scene",
          label: "",
          narration: "Once meat was drying on the rack, the workday was over.",
          visual: "Wooden A-frame drying rack hung with dried meat strips behind two blissful cavemen lounging with arms relaxed behind heads around a crackly campfire."
        },
        {
          beat: 28,
          cardType: "map-diagram",
          label: "NAMIBIA | BOTSWANA | SOUTH AFRICA",
          narration: "In the nineteen-sixties, anthropologist Richard Lee lived in the Kalahari,",
          visual: "Clean flat color map of Southern Africa on pure white showing Namibia in orange, Botswana in beige with a red location pin near the border, and South Africa in green."
        },
        {
          beat: 29,
          cardType: "flat-scene",
          label: "",
          narration: "literally following hunters with a stopwatch to time every chore.",
          visual: "Walking profile across flat pale sky and scrub bushes: caveman carrying spear strides ahead on the left while a stickman anthropologist wearing a tan pith helmet follows closely taking notes on a clipboard with a silver stopwatch."
        },
        {
          beat: 30,
          cardType: "split-compare",
          label: "",
          narration: "Even without grocery stores, refrigerators, or stocked pantries,",
          visual: "Split white card with dashed center divider: left shows caveman holding spear next to a berry bush; right shows colorful supermarket grocery shelves packed with cereal boxes crossed out by a big red X."
        },
        {
          beat: 31,
          cardType: "whiteboard-prop",
          label: "17 HOURS / WEEK",
          narration: "acquiring food took only seventeen hours per week—about two and a half hours a day.",
          visual: "Pure white whiteboard diagram featuring a clean black ink stopwatch next to bold hand-lettered uppercase text '17 HOURS / WEEK' underlined cleanly."
        },
        {
          beat: 32,
          cardType: "flat-scene",
          label: "",
          narration: "The rest of human life was stories, naps, music, and family.",
          visual: "Peaceful flat golden dusk plain with round white-headed prehistoric humans chatting, smiling, and gesturing animatedly around a warm glowing rock campfire."
        }
      ]
    }
  ]
};

function inferBeatCharacters(episode, beat) {
  if (Array.isArray(beat?.characters)) return beat.characters;
  const cast = Array.isArray(episode?.characters) ? episode.characters : [];
  if (!cast.length) return [];
  const txt = `${beat?.visual || ""} ${beat?.narration || ""}`;
  return cast
    .filter(c => {
      const code = String(c.code || "").toUpperCase();
      if (code === "CAVEMAN") return /caveman|hunter|gatherer|farmer|forager|prehistoric/i.test(txt);
      if (code === "ANTHROPOLOGIST") return /anthropologist|archaeologist|scientist|richard lee/i.test(txt);
      return new RegExp(`\\b${String(c.name || code).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(txt);
    })
    .map(c => c.code);
}

function flattenEpisodeBeats(episode) {
  const blocks = Array.isArray(episode?.blocks) ? episode.blocks : [];
  const out = [];
  for (const blk of blocks) {
    const bId = Number(blk.blockId || 1);
    for (const beat of blk.beats || []) {
      out.push({
        beat: Number(beat.beat || out.length + 1),
        scene: Number(beat.beat || out.length + 1),
        blockId: bId,
        blockTitle: blk.title || `Block ${bId}`,
        cardType: INK_EXPLAINER_CARD_STYLES[beat.cardType] ? beat.cardType : "flat-scene",
        label: String(beat.label || "").trim(),
        emotion: String(beat.emotion || "").trim(),
        characters: inferBeatCharacters(episode, beat),
        narration: String(beat.narration || "").trim(),
        visual: String(beat.visual || "").trim(),
        dynamic: Boolean(beat.dynamic),
        motionPrompt: String(beat.motionPrompt || "").trim()
      });
    }
  }
  return out;
}

const INK_EXPLAINER_SCENES = flattenEpisodeBeats(INK_EXPLAINER_DEFAULT_EPISODE);

function inkExplainerActiveEpisode() {
  if (typeof window !== "undefined" && window.__INK_ACTIVE_EPISODE && Array.isArray(window.__INK_ACTIVE_EPISODE.blocks)) {
    return window.__INK_ACTIVE_EPISODE;
  }
  return INK_EXPLAINER_DEFAULT_EPISODE;
}

function inkExplainerActiveBeats() {
  return flattenEpisodeBeats(inkExplainerActiveEpisode());
}

function inkExplainerActiveScenes() {
  return inkExplainerActiveBeats();
}

function inkExplainerPromptFor(index, aspect = "16:9") {
  const beats = inkExplainerActiveBeats();
  const b = beats[index] || beats[0];
  const style = INK_EXPLAINER_CARD_STYLES[b?.cardType] || INK_EXPLAINER_CARD_STYLES["flat-scene"];
  const labelPart = b?.label ? ` On-card hand-lettered label: "${b.label}".` : "";
  const visual = (b?.visual || "Minimalist white-headed stickman beside a flat campfire.").trim();
  return `${style}${labelPart} Subject: ${visual} Aspect ratio: ${aspect}.`;
}

function inkExplainerCaptionFor(index) {
  const ep = inkExplainerActiveEpisode();
  const beats = flattenEpisodeBeats(ep);
  const b = beats[index] || beats[0];
  return `"${ep.title}" — ${b.narration}\n\n#InkExplainer #StickmanExplainer #HumanHistory #VisualStorytelling`;
}

function buildInkEpisodeGeneratorPrompt(topic, blockCount = 4, beatsPerBlock = 10, language = "en") {
  const blocks = Math.max(2, Math.min(20, Number(blockCount) || 4));
  const perBlock = Math.max(6, Math.min(14, Number(beatsPerBlock) || 10));
  const cleanTopic = String(topic || "").trim() || "Why Medieval Peasants Actually Had More Free Time Than You";
  const langName = language === "ne" ? "Nepali (Devanagari script, natural documentary Nepali)" : "English";
  return [
    `You are an expert ${langName} documentary scriptwriter and visual beat director matching the rapid-cut YouTube style of Ink Explainer ('What Did Ancient Humans Actually Do All Day?').`,
    `Write a complete ${langName} episode on this topic: "${cleanTopic}".`,
    `Organize the episode into ${blocks} continuous narration blocks (each ~35-50 seconds of speech so TTS stays well within output limits), and break EACH block into ${perBlock} rapid visual beats (1 image every 1.2–2.2 seconds).`,
    "",
    "CRITICAL RULES:",
    "1. NEVER put a long multi-clause sentence on one single beat! Split every action into its own beat of ONLY 4 to 8 words (e.g. 'He placed a wooden box in her hands,' = Beat 1; 'Open it on the train,' = Beat 2; 'and watched the van disappear.' = Beat 3).",
    "2. Keep 'visual' descriptions in clear English for Google Flow 2D ink-cartoon generation even when 'narration' is in Nepali.",
    "3. Mix the 5 Ink Explainer visual card types across beats ('whiteboard-prop', 'split-compare', 'red-x', 'map-diagram', 'flat-scene').",
    "4. For roughly 15–25% of key consecutive beat transitions (especially early opening hooks and major action/turning-point moments, WITHOUT overlapping the same beat in two adjacent transitions), set \"dynamic\": true and \"motionPrompt\": \"short English camera & character motion bridging this frame to the next beat\" on the starting beat of the pair.",
    "",
    "Return ONLY valid raw JSON (no markdown fences, no commentary) using this exact schema:",
    "{",
    '  "id": "kebab-case-slug",',
    '  "title": "Curiosity-Hook Episode Title",',
    '  "subtitle": "Rapid-Beat Explainer",',
    `  "language": "${language === "ne" ? "ne" : "en"}",`,
    '  "hook": "One-sentence opening curiosity hook",',
    '  "niche": "History & Human Curiosity",',
    '  "characters": [',
    '    { "code": "HERO", "name": "Hero Name", "role": "Lead", "refPrompt": "2D flat stickman explainer character full-body on pure white background: round white circle head, thin black ink outlines, distinct outfit..." }',
    "  ],",
    '  "blocks": [',
    "    {",
    '      "blockId": 1,',
    '      "title": "Block 1 · Hook",',
    '      "beats": [',
    "        {",
    '          "beat": 1,',
    '          "cardType": "flat-scene",',
    '          "label": "",',
    '          "emotion": "warmly",',
    '          "characters": ["HERO"],',
    '          "narration": "Short 4 to 8 word spoken clause,",',
    '          "visual": "Concrete 2D stickman explainer frame description.",',
    '          "dynamic": true,',
    '          "motionPrompt": "Optional short transition motion from Beat 1 to Beat 2"',
    "        }",
    "      ]",
    "    }",
    "  ]",
    "}"
  ].join("\n");
}

function buildInkStoryToEpisodePrompt(storyText, language = "en") {
  const cleanStory = String(storyText || "").trim();
  const isNepali = language === "ne" || /[\u0900-\u097F]/.test(cleanStory);
  return [
    "You are an expert visual storyboard director for the rapid-cut Ink Explainer YouTube style.",
    "Convert the user's FULL written story below into a rapid-beat Ink Explainer episode JSON without losing any plot points, actions, or emotional beats.",
    "",
    "CRITICAL RULES:",
    "1. Group chapters/sections into narration 'blocks' (~70-110 words per block so Gemini TTS stays fast and never hits output limits).",
    "2. Break every sentence into short 4 to 8 word visual beats (~1 image every 1.5s) — NEVER put a full multi-action sentence on one image (e.g., placing a box, saying open it on the train, and watching the van disappear MUST be 3 separate beats!).",
    "3. Write 'visual' prompts in English for Google Flow, keeping 'narration' in the story's language (" + (isNepali ? "Nepali Devanagari" : "English") + ").",
    "4. For roughly 15–25% of high-impact non-overlapping consecutive beat pairs (early hooks, dramatic action, key emotional shifts), include \"dynamic\": true and \"motionPrompt\": \"short English motion prompt bridging to the next beat\" on the first beat of the pair.",
    "5. Return ONLY valid raw JSON (no markdown fences) matching this exact schema (define 2-4 recurring characters with 'refPrompt' and tag each beat's 'characters' array + optional 'emotion' delivery cue):",
    `{ "id": "kebab-case-slug", "title": "Story Title", "subtitle": "Story Subtitle", "language": "${isNepali ? "ne" : "en"}", "hook": "One-sentence hook", "niche": "Story Genre", "characters": [{ "code": "LEAD1", "name": "Name", "role": "Lead", "refPrompt": "2D flat stickman explainer character full-body on pure white background..." }], "blocks": [{ "blockId": 1, "title": "Chapter 1", "beats": [{ "beat": 1, "cardType": "flat-scene", "label": "", "emotion": "warmly", "characters": ["LEAD1"], "narration": "4-8 word spoken clause", "visual": "...", "dynamic": true, "motionPrompt": "Smooth camera push as character reacts" }] }] }`,
    "",
    "USER STORY:",
    cleanStory.slice(0, 24000)
  ].join("\n");
}

function buildDynamicPairsSuggestPrompt(episode) {
  const beats = [];
  (episode?.blocks || []).forEach(blk => {
    (blk.beats || []).forEach(b => {
      beats.push({ beat: b.beat, cardType: b.cardType, narration: b.narration, visual: b.visual });
    });
  });
  const targetCount = Math.max(3, Math.min(12, Math.round(beats.length * 0.18)));
  return [
    `You are an animation director for an Ink Explainer rapid-beat video ("${episode?.title || "Episode"}").`,
    `Below are ${beats.length} consecutive visual beats. Most beats should remain static images, while ONLY the ${targetCount} highest-impact consecutive beat pairs (e.g., early opening hooks, dramatic actions, scene transformations, key emotional turns) should be animated using Google Flow Frames mode (Start Frame = Beat N, End Frame = Beat N+1).`,
    "",
    "RULES:",
    `1. Pick about ${targetCount} consecutive beat pairs (fromBeat -> fromBeat + 1).`,
    "2. Do NOT pick overlapping pairs (if you pick 1->2, do not pick 2->3; pick e.g. 5->6 next).",
    "3. For each pair, write a concise English 'motionPrompt' (12-25 words) describing the smooth 2D animation connecting Start Frame (Beat N) to End Frame (Beat N+1), matching both visuals.",
    '4. Return ONLY valid raw JSON: { "pairs": [ { "fromBeat": 1, "toBeat": 2, "motionPrompt": "..." } ] }',
    "",
    "BEATS:",
    JSON.stringify(beats)
  ].join("\n");
}

function buildOpeningHooksPrompt(episode) {
  const isNe = episode?.language === "ne";
  const langName = isNe ? "Nepali (Devanagari script)" : "English";
  const sampleBeats = (episode?.blocks?.[0]?.beats || []).slice(0, 6).map(b => b.narration).join(" ");
  return [
    `You are a viral YouTube & TikTok retention strategist for Ink Explainer ("${episode?.title || "Episode"}").`,
    `Current hook: "${episode?.hook || ""}". Opening lines: "${sampleBeats}".`,
    `Generate 5 distinct, high-retention opening hooks (for the first 3 to 5 seconds of the video) using these 5 proven archetypes:`,
    "1. Myth-Buster (Everyone believes X, but they are completely wrong)",
    "2. Shocking Scale / Contrast (Tiny underdog vs giant force)",
    "3. High-Stakes Flash-Forward (Drop straight into the most dangerous turning point)",
    "4. Visual Paradox Question (A bizarre visual contradiction that demands an answer)",
    "5. Hidden Detail / Secret (Zoom into a map or prop detail nobody notices)",
    "",
    "RULES:",
    `1. Write 'hookText' and each beat's 'narration' (4 to 7 words per beat, 2 beats per hook) in ${langName}.`,
    "2. Write 'visual' and 'motionPrompt' in clear English for 2D Ink Explainer stickman generation.",
    "3. Mark the first beat of each 2-beat hook with \"dynamic\": true and a punchy 'motionPrompt' connecting Beat 1 -> Beat 2.",
    '4. Return ONLY valid raw JSON: { "hooks": [ { "style": "1. Myth-Buster", "whyItWorks": "Breaks viewer assumption in 2 seconds", "hookText": "...", "beats": [ { "cardType": "red-x", "label": "", "emotion": "dramatically", "narration": "...", "visual": "...", "dynamic": true, "motionPrompt": "..." }, { "cardType": "flat-scene", "label": "", "emotion": "excitedly", "narration": "...", "visual": "..." } ] } ] }'
  ].join("\n");
}
