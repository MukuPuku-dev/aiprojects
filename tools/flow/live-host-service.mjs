import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const DEFAULT_QUIZ_APP_HOST_DIR =
  'c:\\Windows.old\\Users\\Dell\\Documents\\newQuiz-main\\quiz-app\\public\\host-frames';

export const HOST_VIDEO_SPECS = [
  {
    id: 'monitor_read_A',
    duration: '8s',
    title: 'Focused Monitor Reading A (Base · 8s)',
    prompt:
      'Continuous 8-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room, keeping their serious, calm, composed expression with mouth naturally closed the entire time — NEVER looking into the camera lens and NEVER smiling. Subtle realistic eye movements reading lines across the off-camera monitor, calm steady breathing, and two natural eye blinks. Zero camera movement, photorealistic real webcam footage, no text, no watermark.',
  },
  {
    id: 'monitor_read_B',
    duration: '8s',
    title: 'Focused Concentration Lean (Alternate Base · 8s)',
    prompt:
      'Continuous 8-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room with mouth naturally closed — NEVER looking into the camera lens and NEVER smiling. They subtly lean forward about two centimeters in deeper serious concentration while reading a challenging exam question on the off-camera monitor, slight thoughtful brow focus, natural blink, then smoothly ease back to the exact starting posture. Zero camera movement, photorealistic webcam footage, no text, no watermark.',
  },
  {
    id: 'tablet_mark',
    duration: '6s',
    title: 'Desk Tablet / Marker Guidance (6s)',
    prompt:
      'Continuous 6-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room with mouth naturally closed — NEVER looking into the camera lens and NEVER smiling. Their eyes drop calmly downward toward their desk tablet with serious focus while their right shoulder makes a subtle, steady writing/guiding micro-movement as if underlining text on screen, then their eyes smoothly lift back to the off-camera monitor at the exact starting pose. Zero camera movement, photorealistic webcam footage, no text, no watermark.',
  },
  {
    id: 'answer_confirm',
    duration: '6s',
    title: 'Serious Answer Confirmation Nod (6s)',
    prompt:
      'Continuous 6-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room with mouth naturally closed — NEVER looking into the camera lens and NEVER smiling. Eyes stay locked on the off-camera quiz monitor; they give one single restrained, serious, authoritative teacher micro-nod confirming the correct answer, blink naturally, and settle cleanly back to the exact starting pose. Zero camera movement, photorealistic webcam footage, no text, no watermark.',
  },
  {
    id: 'scan_comments',
    duration: '6s',
    title: 'Scanning Live Chat Window (6s)',
    prompt:
      'Continuous 6-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room with mouth naturally closed — NEVER looking into the camera lens and NEVER smiling. Their eyes shift calmly about 15 degrees lower-right as if scanning incoming live viewer answers on a second monitor or phone on the desk, maintaining a serious attentive expression with one natural blink, then smoothly return their gaze to the main off-camera monitor at the exact starting pose. Zero camera movement, photorealistic webcam footage, no text, no watermark.',
  },
  {
    id: 'breath_reset',
    duration: '8s',
    title: 'Calm Posture & Breath Settle (8s)',
    prompt:
      'Continuous 8-second locked-tripod desk webcam shot starting and ending on the exact same frame. The person remains seated in the exact same neutral softly-blurred study room with mouth naturally closed — NEVER looking into the camera lens and NEVER smiling. Eyes stay steadily focused on the off-camera monitor while taking one calm, natural slow breath and making a tiny relaxed shoulder settle, blinking naturally, returning seamlessly to the exact starting pose. Zero camera movement, photorealistic webcam footage, no text, no watermark.',
  },
];

export function buildAnchorFocusPrompt(cfg = {}) {
  const isFemale = String(cfg.hostId || '').includes('female') || String(cfg.name || '').toLowerCase().includes('akansha');
  const outfit = isFemale
    ? 'wearing her exact navy-blue tailored blazer suit, crisp white collared shirt, patterned tie, and lapel pin'
    : 'wearing his exact mustard-yellow jacket and teal knit scarf';

  return [
    `Ultra-realistic desk webcam photograph of the EXACT same person @RAW_REF (preserve exact face, hair, skin tone, and ${outfit}).`,
    `CAMERA ANGLE & EXPRESSION: Slightly off-axis 3/4 desk-webcam perspective (about 22 degrees off-center). The person is NOT looking at the camera lens — their eyes are focused calmly and seriously slightly off-camera toward their computer monitor. Mouth is naturally closed, calm, serious, composed, zero smile, zero grin.`,
    `SETTING & LIGHTING: Seated at a desk in a clean, softly out-of-focus neutral study room (muted warm-gray wall, subtle soft bokeh bookshelf and warm desk lamp far in background), realistic natural soft monitor light on their face. Authentic 4K Logitech/Sony desk webcam look, chest-up framing centered cleanly for circular crop, no text, no watermark, no collage.`,
  ].join(' ');
}

export function hostAnchorPath(root, hostId) {
  return path.join(hostProfileDir(root, hostId), 'ANCHOR_FOCUS.png');
}

export function hostVideosDir(root, hostId) {
  return path.join(hostProfileDir(root, hostId), 'videos');
}

export function exportHostVideosToQuizApp(root, hostId, targetDir) {
  const safeId = sanitizeHostId(hostId);
  const cfg = loadHostConfig(root, safeId);
  const destBase = String(targetDir || cfg.exportTargetDir || DEFAULT_QUIZ_APP_HOST_DIR).trim();
  const srcDir = hostVideosDir(root, safeId);
  const destDir = path.join(destBase, 'videos');
  fs.mkdirSync(destDir, { recursive: true });

  // Also export cropped anchor image as fallback still
  const anchorSq = path.join(hostProfileDir(root, safeId), 'anchor_focus_sq.jpg');
  if (fs.existsSync(anchorSq)) {
    fs.copyFileSync(anchorSq, path.join(destBase, 'anchor_focus.jpg'));
  }

  const exported = {};
  for (const spec of HOST_VIDEO_SPECS) {
    const sqFile = path.join(srcDir, `${spec.id}_sq.mp4`);
    const rawFile = path.join(srcDir, `${spec.id}.mp4`);
    const pick = fs.existsSync(sqFile) ? sqFile : fs.existsSync(rawFile) ? rawFile : null;
    if (pick) {
      const dst = path.join(destDir, `${spec.id}.mp4`);
      fs.copyFileSync(pick, dst);
      exported[spec.id] = `videos/${spec.id}.mp4`;
    }
  }

  const manifest = {
    version: 3,
    mode: 'operator-continuous',
    hostId: safeId,
    name: cfg.name,
    anchorImage: fs.existsSync(path.join(destBase, 'anchor_focus.jpg')) ? 'anchor_focus.jpg' : 'base_front.jpg',
    clips: exported,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(destBase, 'video-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return { destDir, clips: exported };
}

export const HOST_PERSONA_PRESETS = {
  nepali_male_educator: {
    id: 'nepali_male_educator',
    label: 'Nepali Male Educator (Pure White Studio)',
    name: 'Mukesh',
    masterPrompt:
      'Ultra-realistic chest-up studio portrait photograph of a friendly, sharp young Nepali male educator and live quiz host, short textured dark hair, warm friendly face, wearing a mustard-yellow jacket and teal knit scarf with a subtle black lapel clip mic. Seated facing a 4K webcam straight-on, soft even studio lighting, isolated on a 100% PURE SOLID SEAMLESS WHITE BACKGROUND (#FFFFFF). Zero mountains, zero trees, zero outdoors, zero bookshelves, zero props, zero shadows on backdrop — ONLY pure solid #FFFFFF white behind the subject. Centered head and shoulders with generous headroom for circular crop, no text, no watermark.',
  },
  nepali_female_educator: {
    id: 'nepali_female_educator',
    label: 'Nepali Female Educator (Pure White Studio)',
    name: 'Akansha',
    masterPrompt:
      'Ultra-realistic chest-up studio portrait photograph of a warm, confident young Nepali female educator and live quiz host, wavy dark hair styled half-up, warm radiant smile, wearing a sharp navy-blue tailored blazer suit, crisp white collared shirt, patterned tie, and subtle lapel pin. Seated facing a 4K webcam straight-on, soft even studio lighting, isolated on a 100% PURE SOLID SEAMLESS WHITE BACKGROUND (#FFFFFF). Zero lines, zero outdoors, zero bookshelves, zero props, zero shadows on backdrop — ONLY pure solid #FFFFFF white behind the subject. Centered head and shoulders with generous headroom for circular crop, no text, no watermark.',
  },
};

/**
 * 8 themed 3x3 contact-sheet grids = 72 consistent ultra-realistic frames.
 * Each cell corresponds to a specific viseme or micro-expression slot so the
 * live quiz engine can drive real-time lip-sync + gaze choreography.
 */
export const HOST_GRID_SPECS = [
  {
    id: '01_talk_camera',
    state: 'talk_camera',
    title: '01 · Camera Talk (Core Lip-Sync Visemes)',
    description: 'Looking straight into camera — 9 core mouth shapes + blink for crisp lip-sync.',
    cells: [
      { slot: 'closed', label: 'Closed Neutral', desc: 'mouth gently closed, calm attentive gaze straight into camera' },
      { slot: 'slight', label: 'Slight Open (Ah)', desc: 'mouth slightly parted speaking a soft syllable, looking at camera' },
      { slot: 'mid', label: 'Mid Open (Eh)', desc: 'mouth moderately open mid-word, relaxed jaw, looking at camera' },
      { slot: 'wide', label: 'Wide Open (Aa)', desc: 'mouth clearly open on an open vowel sound, energetic speaking, looking at camera' },
      { slot: 'round', label: 'Round Lips (Oo)', desc: 'lips softly rounded in an O/U vowel shape, looking at camera' },
      { slot: 'teeth', label: 'Teeth Smile (Ee)', desc: 'mouth slightly wide showing upper teeth on an E/I sound, looking at camera' },
      { slot: 'fv', label: 'Lip Tuck (F/V/M)', desc: 'lower lip gently touching upper teeth as if saying F/V/P, looking at camera' },
      { slot: 'smile', label: 'Closed Warm Smile', desc: 'lips closed in a warm confident smile between sentences, looking at camera' },
      { slot: 'blink', label: 'Natural Blink', desc: 'eyes naturally closed mid-blink, mouth relaxed closed, facing camera' },
    ],
  },
  {
    id: '02_talk_emphatic',
    state: 'talk_emphatic',
    title: '02 · Camera Talk (Emphatic & Engaged)',
    description: 'Slight head tilt, raised eyebrows & engaged expressions while explaining key words.',
    cells: [
      { slot: 'closed', label: 'Engaged Closed', desc: 'slight 5-degree head tilt right, raised eyebrows, mouth closed, looking at camera' },
      { slot: 'slight', label: 'Emphatic Slight', desc: 'slight forward lean, mouth slightly open emphasizing a point, looking at camera' },
      { slot: 'mid', label: 'Emphatic Mid', desc: 'expressive eyebrows, mouth moderately open mid-explanation, looking at camera' },
      { slot: 'wide', label: 'Emphatic Wide', desc: 'enthusiastic expression, mouth open wide on stressed word, looking at camera' },
      { slot: 'round', label: 'Emphatic Round', desc: 'curious raised brows, lips rounded speaking O sound, looking at camera' },
      { slot: 'teeth', label: 'Emphatic Ee', desc: 'bright eyes, smiling teeth visible on E sound, slight head tilt left, looking at camera' },
      { slot: 'fv', label: 'Emphatic Lip', desc: 'focused gaze at camera, lower lip lightly tucked mid-consonant' },
      { slot: 'smile', label: 'Confident Nod', desc: 'subtle approving nod with warm closed-mouth smile, looking at camera' },
      { slot: 'blink', label: 'Emphatic Blink', desc: 'slight head tilt, natural mid-blink with soft smile' },
    ],
  },
  {
    id: '03_talk_warm',
    state: 'talk_warm',
    title: '03 · Camera Talk (Natural Posture Shift)',
    description: 'Secondary natural speaking posture so long questions never look looped or robotic.',
    cells: [
      { slot: 'closed', label: 'Relaxed Closed', desc: 'shoulders slightly turned 6 degrees left, eyes straight at camera, mouth gently closed' },
      { slot: 'slight', label: 'Relaxed Slight', desc: 'relaxed posture, mouth slightly open speaking calmly, looking at camera' },
      { slot: 'mid', label: 'Relaxed Mid', desc: 'conversational expression, mouth mid-open speaking naturally, looking at camera' },
      { slot: 'wide', label: 'Relaxed Wide', desc: 'animated conversational open mouth on vowel, warm eyes at camera' },
      { slot: 'round', label: 'Relaxed Round', desc: 'soft rounded O-shape lips, friendly eyes looking directly at camera' },
      { slot: 'teeth', label: 'Relaxed Ee', desc: 'friendly slight smile showing teeth mid-word, looking at camera' },
      { slot: 'fv', label: 'Relaxed F/V', desc: 'natural speaking pause with lips lightly pressed, looking at camera' },
      { slot: 'smile', label: 'Warm Listening', desc: 'warm relaxed smile, slight chin tilt, eyes locked on camera' },
      { slot: 'blink', label: 'Relaxed Blink', desc: 'natural calm blink with relaxed shoulders, facing camera' },
    ],
  },
  {
    id: '04_look_down_write',
    state: 'look_down_write',
    title: '04 · Looking Down at Sheet (Using Marker Hand)',
    description: 'Host looks down-left toward the exam paper while the gloved red-marker hand underlines/ticks!',
    cells: [
      { slot: 'closed', label: 'Focus Down Closed', desc: 'head angled slightly downward and left, eyes looking down at desk exam sheet as if writing with right hand, mouth closed focused' },
      { slot: 'slight', label: 'Write & Speak Slight', desc: 'looking down-left at exam paper while speaking, mouth slightly open' },
      { slot: 'mid', label: 'Write & Speak Mid', desc: 'looking down-left at exam paper while reading aloud, mouth moderately open' },
      { slot: 'wide', label: 'Write & Speak Wide', desc: 'looking down-left at exam paper while articulating a word, mouth clearly open' },
      { slot: 'round', label: 'Write & Speak Round', desc: 'looking down-left at exam paper, lips softly rounded speaking' },
      { slot: 'teeth', label: 'Write & Speak Ee', desc: 'looking down-left at exam paper, slight smile teeth visible while speaking' },
      { slot: 'fv', label: 'Write Concentrate', desc: 'looking down at desk sheet with focused brow, lips lightly together' },
      { slot: 'smile', label: 'Write Slight Smile', desc: 'looking down-left at exam sheet with a subtle satisfied smile as if underlining' },
      { slot: 'blink', label: 'Write Blink', desc: 'head angled down toward desk paper, eyes blinking naturally' },
    ],
  },
  {
    id: '05_look_down_read',
    state: 'look_down_read',
    title: '05 · Reading Sheet + Quick Glance Up',
    description: 'Natural transitions between reading the paper below and glancing back at the camera.',
    cells: [
      { slot: 'closed', label: 'Glance Down-Center', desc: 'eyes lowered halfway toward screen/sheet, head almost level, mouth closed' },
      { slot: 'slight', label: 'Read Half-Down Slight', desc: 'eyes reading text just below camera lens, mouth slightly open' },
      { slot: 'mid', label: 'Read Half-Down Mid', desc: 'eyes reading text below lens, mouth moderately open speaking clearly' },
      { slot: 'wide', label: 'Read Half-Down Wide', desc: 'eyes scanning sheet below lens, mouth open speaking clearly' },
      { slot: 'round', label: 'Read Half-Down Round', desc: 'eyes looking slightly down-right at sheet, lips rounded' },
      { slot: 'teeth', label: 'Read Half-Down Ee', desc: 'eyes looking slightly down at sheet, bright articulate mouth shape' },
      { slot: 'fv', label: 'Pause Scanning', desc: 'eyes scanning left-to-right across lower screen, lips softly pressed' },
      { slot: 'smile', label: 'Glance Back Smile', desc: 'glancing back up toward camera with an inviting slight smile' },
      { slot: 'blink', label: 'Glance Blink', desc: 'mid-transition head level, eyes gently closed blinking' },
    ],
  },
  {
    id: '06_think_wait',
    state: 'think_wait',
    title: '06 · Countdown & Thinking (Waiting for Viewers)',
    description: 'Silent expectant poses during the 5-second countdown timer — zero dead-still freeze!',
    cells: [
      { slot: 'idle_1', label: 'Expectant Gaze', desc: 'looking straight at camera expectantly waiting for viewer answers, subtle closed smile' },
      { slot: 'idle_2', label: 'Curious Tilt Right', desc: 'slight head tilt right with curious raised eyebrow, mouth closed, looking at camera' },
      { slot: 'idle_3', label: 'Curious Tilt Left', desc: 'slight head tilt left, warm encouraging expression, mouth closed, looking at camera' },
      { slot: 'idle_4', label: 'Glance At Sheet', desc: 'quick silent glance down-left toward the question sheet, thoughtful expression' },
      { slot: 'idle_5', label: 'Subtle Thinking', desc: 'thoughtful gaze slightly upward-right as if pondering the answer, lips closed' },
      { slot: 'idle_6', label: 'Encouraging Nod', desc: 'gentle encouraging expression leaning very slightly forward, looking at camera' },
      { slot: 'idle_7', label: 'Almost Time', desc: 'playful knowing smile, eyebrows slightly lifted as countdown nears end, looking at camera' },
      { slot: 'idle_8', label: 'Calm Wait', desc: 'relaxed calm breathing posture, steady friendly eye contact with camera' },
      { slot: 'blink', label: 'Wait Blink', desc: 'natural calm blink while waiting, subtle smile' },
    ],
  },
  {
    id: '07_reveal_celebrate',
    state: 'reveal_celebrate',
    title: '07 · Answer Reveal & Confident Smile',
    description: 'Warm, rewarding expressions when ticking the green checkmark and announcing the answer.',
    cells: [
      { slot: 'closed', label: 'Proud Smile Closed', desc: 'bright proud closed-mouth smile looking straight at camera' },
      { slot: 'slight', label: 'Reveal Slight', desc: 'happy smiling expression, mouth slightly open announcing the answer, looking at camera' },
      { slot: 'mid', label: 'Reveal Mid', desc: 'enthusiastic happy smile, mouth moderately open speaking the correct answer, looking at camera' },
      { slot: 'wide', label: 'Reveal Wide', desc: 'joyful articulate expression, mouth open wide announcing answer, looking at camera' },
      { slot: 'round', label: 'Reveal Round', desc: 'warm pleased expression, lips rounded speaking, looking at camera' },
      { slot: 'teeth', label: 'Big Happy Smile', desc: 'wide genuine happy smile showing teeth, bright eyes at camera' },
      { slot: 'fv', label: 'Approving Look', desc: 'nodding slightly with warm approving eyes, lips lightly touching' },
      { slot: 'smile', label: 'Bingo Expression', desc: 'confident raised eyebrows and warm celebratory grin looking at camera' },
      { slot: 'blink', label: 'Happy Blink', desc: 'warm smiling eyes gently closed mid-blink' },
    ],
  },
  {
    id: '08_react_comments',
    state: 'react_comments',
    title: '08 · Viewer Comments & Live Chat Reactions',
    description: 'Warm, personal expressions when reading live comments and greeting viewers.',
    cells: [
      { slot: 'closed', label: 'Attentive Listen', desc: 'warm attentive gaze at camera as if reading live chat comments, soft smile' },
      { slot: 'slight', label: 'Chat Speak Slight', desc: 'friendly conversational slight open mouth greeting viewers, looking at camera' },
      { slot: 'mid', label: 'Chat Speak Mid', desc: 'warm laughing eyes, mouth moderately open replying to a comment, looking at camera' },
      { slot: 'wide', label: 'Chat Speak Wide', desc: 'cheerful expressive open mouth praising a viewer, looking at camera' },
      { slot: 'round', label: 'Impressed Ooh', desc: 'pleasantly surprised impressed expression, rounded lips, raised eyebrows, looking at camera' },
      { slot: 'teeth', label: 'Warm Laugh', desc: 'genuine light chuckle smile showing teeth, joyful eyes looking at camera' },
      { slot: 'fv', label: 'Friendly Nod', desc: 'appreciative slight head tilt, warm lips closed, looking at camera' },
      { slot: 'smile', label: 'Thank You Smile', desc: 'heartfelt grateful smile straight into the camera' },
      { slot: 'blink', label: 'Warm Blink', desc: 'relaxed happy blink while smiling at camera' },
    ],
  },
];

export function sanitizeHostId(raw) {
  const cleaned = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return cleaned || 'default-host';
}

export function liveHostRoot(root) {
  return path.join(root, 'projects', 'live-host-studio');
}

export function hostProfileDir(root, hostId) {
  return path.join(liveHostRoot(root), 'hosts', sanitizeHostId(hostId));
}

export function hostGridsDir(root, hostId) {
  return path.join(hostProfileDir(root, hostId), 'grids');
}

export function hostFramesDir(root, hostId) {
  return path.join(hostProfileDir(root, hostId), 'frames');
}

export function hostConfigPath(root, hostId) {
  return path.join(hostProfileDir(root, hostId), 'host-config.json');
}

export function loadHostConfig(root, hostId) {
  const safeId = sanitizeHostId(hostId);
  const cfgPath = hostConfigPath(root, safeId);
  const fallback = {
    hostId: safeId,
    presetId: 'nepali_male_educator',
    name: HOST_PERSONA_PRESETS.nepali_male_educator.name,
    masterPrompt: HOST_PERSONA_PRESETS.nepali_male_educator.masterPrompt,
    jpegQuality: 82,
    frameSize: 384,
    edgeTrimPercent: 3.5,
    exportTargetDir: DEFAULT_QUIZ_APP_HOST_DIR,
  };
  if (!fs.existsSync(cfgPath)) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(fs.readFileSync(cfgPath, 'utf8')) || {}), hostId: safeId };
  } catch {
    return fallback;
  }
}

export function saveHostConfig(root, hostId, patch = {}) {
  const safeId = sanitizeHostId(hostId);
  const current = loadHostConfig(root, safeId);
  const next = { ...current, ...patch, hostId: safeId, updatedAt: new Date().toISOString() };
  const dir = hostProfileDir(root, safeId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(hostConfigPath(root, safeId), JSON.stringify(next, null, 2) + '\n', 'utf8');
  return next;
}

export function listHostProfiles(root) {
  const base = path.join(liveHostRoot(root), 'hosts');
  if (!fs.existsSync(base)) return ['default-host'];
  const dirs = fs.readdirSync(base, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
  return dirs.length ? dirs : ['default-host'];
}

export function buildGridPrompt(spec, masterPrompt) {
  const panelLines = spec.cells
    .map((c, idx) => {
      const r = Math.floor(idx / 3) + 1;
      const col = (idx % 3) + 1;
      return `Row ${r} Col ${col}: ${c.desc}`;
    })
    .join('; ');

  return [
    `Strict seamless 3x3 photographic contact-sheet grid (3 rows by 3 columns, 9 equal panels, NO borders, NO frames, NO text labels, NO numbers) of the EXACT same person @HOST from the reference portrait.`,
    `MANDATORY BACKGROUND: Every single one of the 9 panels MUST have an identical 100% PURE SOLID SEAMLESS BRIGHT WHITE STUDIO BACKGROUND (#FFFFFF) with ZERO mountains, ZERO trees, ZERO outdoor scenery, ZERO bookshelves, ZERO walls, ZERO props, and ZERO gray gradients.`,
    `Keep identical face, hair, clothing, lighting, studio camera distance, and exact chest-up head-and-shoulders framing across all 9 panels — ONLY change the facial expression, mouth shape, eye gaze, and subtle head angle as specified:`,
    panelLines + '.',
    `Consistent persona notes: ${String(masterPrompt || '').slice(0, 320)}.`,
    `Photorealistic DSLR webcam photography on pure solid #FFFFFF white studio backdrop, sharp focus on eyes and mouth, zero text, zero borders, zero grid lines.`,
  ].join(' ');
}

export function findMasterImage(root, hostId) {
  const safeId = sanitizeHostId(hostId);
  const charDir = path.join(root, 'projects', `live-host-studio-${safeId}`, 'characters');
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = path.join(charDir, `HOST${ext}`);
    if (fs.existsSync(p)) return p;
  }
  const localDir = hostProfileDir(root, safeId);
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = path.join(localDir, `master${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function getHostStatus(root, hostId) {
  const safeId = sanitizeHostId(hostId);
  const config = loadHostConfig(root, safeId);
  const masterPath = findMasterImage(root, safeId);
  const gridsDir = hostGridsDir(root, safeId);
  const framesDir = hostFramesDir(root, safeId);

  let masterUrl = null;
  if (masterPath) {
    const rel = path.relative(root, masterPath).replace(/\\/g, '/');
    masterUrl = '/' + rel.split('/').map(encodeURIComponent).join('/');
  }

  const grids = HOST_GRID_SPECS.map(spec => {
    let gridFile = null;
    if (fs.existsSync(gridsDir)) {
      for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
        const candidate = path.join(gridsDir, `${spec.id}${ext}`);
        if (fs.existsSync(candidate)) {
          gridFile = candidate;
          break;
        }
      }
    }
    const gridStat = gridFile ? fs.statSync(gridFile) : null;
    const gridUrl = gridFile
      ? `/projects/live-host-studio/hosts/${encodeURIComponent(safeId)}/grids/${encodeURIComponent(path.basename(gridFile))}?t=${Math.floor(gridStat.mtimeMs)}`
      : null;

    const slicedFrames = spec.cells.map((cell, idx) => {
      const fname = `${spec.state}_${String(idx).padStart(2, '0')}_${cell.slot}.jpg`;
      const full = path.join(framesDir, fname);
      const exists = fs.existsSync(full);
      const st = exists ? fs.statSync(full) : null;
      return {
        index: idx,
        slot: cell.slot,
        label: cell.label,
        filename: fname,
        exists,
        size: st ? st.size : 0,
        url: exists
          ? `/projects/live-host-studio/hosts/${encodeURIComponent(safeId)}/frames/${encodeURIComponent(fname)}?t=${Math.floor(st.mtimeMs)}`
          : null,
      };
    });

    return {
      id: spec.id,
      state: spec.state,
      title: spec.title,
      description: spec.description,
      prompt: buildGridPrompt(spec, config.masterPrompt),
      hasGrid: Boolean(gridFile),
      gridSize: gridStat ? gridStat.size : 0,
      gridUrl,
      slicedCount: slicedFrames.filter(f => f.exists).length,
      totalCells: spec.cells.length,
      frames: slicedFrames,
    };
  });

  const totalFrames = grids.reduce((acc, g) => acc + g.slicedCount, 0);
  const totalBytes = grids.reduce(
    (acc, g) => acc + g.frames.reduce((s, f) => s + f.size, 0),
    0
  );

  return {
    hostId: safeId,
    profiles: listHostProfiles(root),
    presets: HOST_PERSONA_PRESETS,
    config,
    hasMaster: Boolean(masterPath),
    masterUrl,
    grids,
    totalFrames,
    expectedFrames: HOST_GRID_SPECS.length * 9,
    totalFrameBytes: totalBytes,
  };
}

/**
 * Slices a 3x3 grid image into 9 clean square JPEG frames resized to `frameSize`
 * and lossy-compressed at `jpegQuality` (typically ~95% smaller than Flow PNGs).
 */
export async function sliceAndCompressGrid(root, hostId, gridId, {
  jpegQuality = 82,
  frameSize = 384,
  edgeTrimPercent = 3.5,
} = {}) {
  const safeId = sanitizeHostId(hostId);
  const spec = HOST_GRID_SPECS.find(g => g.id === gridId || g.state === gridId);
  if (!spec) throw new Error(`Unknown grid: ${gridId}`);

  const gridsDir = hostGridsDir(root, safeId);
  let srcFile = null;
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = path.join(gridsDir, `${spec.id}${ext}`);
    if (fs.existsSync(p)) {
      srcFile = p;
      break;
    }
  }
  if (!srcFile) throw new Error(`Grid image not found for ${spec.id}. Generate or upload it first.`);

  const outDir = hostFramesDir(root, safeId);
  fs.mkdirSync(outDir, { recursive: true });

  const q = Math.max(35, Math.min(96, Math.round(Number(jpegQuality) || 82)));
  const sz = Math.max(192, Math.min(768, Math.round(Number(frameSize) || 384)));
  const trim = Math.max(0, Math.min(12, Number(edgeTrimPercent) || 3.5));

  const outNames = spec.cells.map((c, idx) => `${spec.state}_${String(idx).padStart(2, '0')}_${c.slot}.jpg`);

  const psScript = [
    'Add-Type -AssemblyName System.Drawing',
    '$src = [System.Drawing.Image]::FromFile($env:LH_SRC)',
    'try {',
    '  $w = $src.Width',
    '  $h = $src.Height',
    '  $cellW = $w / 3.0',
    '  $cellH = $h / 3.0',
    '  $trimFrac = [double]$env:LH_TRIM / 100.0',
    '  $target = [int]$env:LH_SIZE',
    '  $quality = [long]$env:LH_QUAL',
    '  $names = $env:LH_NAMES.Split("|")',
    '  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1',
    '  $ep = New-Object System.Drawing.Imaging.EncoderParameters(1)',
    '  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)',
    '  for ($i = 0; $i -lt 9; $i++) {',
    '    $r = [math]::Floor($i / 3)',
    '    $c = $i % 3',
    '    $padX = $cellW * $trimFrac',
    '    $padY = $cellH * $trimFrac',
    '    $sx = [int][math]::Round($c * $cellW + $padX)',
    '    $sy = [int][math]::Round($r * $cellH + $padY)',
    '    $sw = [int][math]::Max(16, [math]::Round($cellW - 2 * $padX))',
    '    $sh = [int][math]::Max(16, [math]::Round($cellH - 2 * $padY))',
    '    # Center-crop to square inside the cell so circular PiP never stretches',
    '    $side = [math]::Min($sw, $sh)',
    '    $sx = $sx + [int][math]::Floor(($sw - $side) / 2)',
    '    $sy = $sy + [int][math]::Floor(($sh - $side) / 2)',
    '    $bmp = New-Object System.Drawing.Bitmap($target, $target)',
    '    try {',
    '      $g = [System.Drawing.Graphics]::FromImage($bmp)',
    '      try {',
    '        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic',
    '        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality',
    '        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality',
    '        $dstRect = New-Object System.Drawing.Rectangle(0, 0, $target, $target)',
    '        $srcRect = New-Object System.Drawing.Rectangle($sx, $sy, $side, $side)',
    '        $g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)',
    '      } finally { $g.Dispose() }',
    '      $dstPath = Join-Path $env:LH_OUTDIR $names[$i]',
    '      $bmp.Save($dstPath, $codec, $ep)',
    '    } finally { $bmp.Dispose() }',
    '  }',
    '} finally { $src.Dispose() }',
  ].join('\n');

  await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', psScript], {
    timeout: 60000,
    env: {
      ...process.env,
      LH_SRC: srcFile,
      LH_OUTDIR: outDir,
      LH_TRIM: String(trim),
      LH_SIZE: String(sz),
      LH_QUAL: String(q),
      LH_NAMES: outNames.join('|'),
    },
  });

  const srcBytes = fs.statSync(srcFile).size;
  let totalOutBytes = 0;
  for (const name of outNames) {
    const p = path.join(outDir, name);
    if (fs.existsSync(p)) totalOutBytes += fs.statSync(p).size;
  }

  return {
    gridId: spec.id,
    sliced: outNames.length,
    sourceBytes: srcBytes,
    totalOutputBytes: totalOutBytes,
    avgFrameBytes: Math.round(totalOutBytes / outNames.length),
  };
}

export async function sliceAllGrids(root, hostId, opts = {}) {
  const safeId = sanitizeHostId(hostId);
  const results = [];
  for (const spec of HOST_GRID_SPECS) {
    const gridsDir = hostGridsDir(root, safeId);
    const exists = ['.png', '.jpg', '.jpeg', '.webp'].some(ext =>
      fs.existsSync(path.join(gridsDir, `${spec.id}${ext}`))
    );
    if (!exists) continue;
    results.push(await sliceAndCompressGrid(root, safeId, spec.id, opts));
  }
  return results;
}

export function buildHostManifest(root, hostId) {
  const safeId = sanitizeHostId(hostId);
  const config = loadHostConfig(root, safeId);
  const framesDir = hostFramesDir(root, safeId);
  const states = {};
  let totalFrames = 0;

  for (const spec of HOST_GRID_SPECS) {
    const slots = {};
    const list = [];
    spec.cells.forEach((cell, idx) => {
      const fname = `${spec.state}_${String(idx).padStart(2, '0')}_${cell.slot}.jpg`;
      if (fs.existsSync(path.join(framesDir, fname))) {
        slots[cell.slot] = fname;
        list.push({ slot: cell.slot, file: fname });
        totalFrames++;
      }
    });
    if (list.length > 0) {
      states[spec.state] = { slots, list };
    }
  }

  return {
    version: 1,
    hostId: safeId,
    name: config.name,
    frameSize: config.frameSize,
    totalFrames,
    generatedAt: new Date().toISOString(),
    states,
  };
}

export function exportHostPackToQuizApp(root, hostId, targetDir) {
  const safeId = sanitizeHostId(hostId);
  const config = loadHostConfig(root, safeId);
  const destDir = String(targetDir || config.exportTargetDir || DEFAULT_QUIZ_APP_HOST_DIR).trim();
  if (!destDir) throw new Error('Export target directory is required.');

  const framesDir = hostFramesDir(root, safeId);
  const manifest = buildHostManifest(root, safeId);
  if (manifest.totalFrames === 0) {
    throw new Error('No sliced frames found yet. Generate and slice at least one 3x3 grid first.');
  }

  fs.mkdirSync(destDir, { recursive: true });

  // Clean old jpg frames in target dir so switching hosts doesn't leave stale frames
  for (const entry of fs.readdirSync(destDir, { withFileTypes: true })) {
    if (entry.isFile() && /\.(jpg|jpeg|webp|png)$/i.test(entry.name)) {
      try { fs.unlinkSync(path.join(destDir, entry.name)); } catch {}
    }
  }

  let copied = 0;
  let copiedBytes = 0;
  for (const stateObj of Object.values(manifest.states)) {
    for (const item of stateObj.list) {
      const src = path.join(framesDir, item.file);
      const dst = path.join(destDir, item.file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        copied++;
        copiedBytes += fs.statSync(dst).size;
      }
    }
  }

  const manifestPath = path.join(destDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  return {
    destDir,
    copiedFrames: copied,
    copiedBytes,
    manifestPath,
  };
}

export function saveUploadedHostFile(root, hostId, kind, gridId, dataUrl) {
  const safeId = sanitizeHostId(hostId);
  const raw = String(dataUrl || '').trim();
  const match = raw.match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i);
  const ext = match ? (match[1].toLowerCase().includes('jp') ? '.jpg' : `.${match[1].toLowerCase()}`) : '.png';
  const b64 = match ? match[2] : raw;
  const buf = Buffer.from(b64, 'base64');
  if (!buf || buf.length < 64) throw new Error('Uploaded image is empty or invalid.');

  if (kind === 'master') {
    const charDir = path.join(root, 'projects', `live-host-studio-${safeId}`, 'characters');
    fs.mkdirSync(charDir, { recursive: true });
    const outFile = path.join(charDir, `HOST${ext}`);
    fs.writeFileSync(outFile, buf);
    return { saved: outFile, bytes: buf.length };
  }

  const spec = HOST_GRID_SPECS.find(g => g.id === gridId || g.state === gridId);
  if (!spec) throw new Error(`Unknown gridId: ${gridId}`);
  const dir = hostGridsDir(root, safeId);
  fs.mkdirSync(dir, { recursive: true });
  const outFile = path.join(dir, `${spec.id}${ext}`);
  fs.writeFileSync(outFile, buf);
  return { saved: outFile, bytes: buf.length };
}
