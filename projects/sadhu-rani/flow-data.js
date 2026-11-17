const SADHU_RANI_STYLE = "STYLE LOCK — grounded, photorealistic live-action Nepali rural folk tale shot on a cinema camera with natural lenses: warm dusk and kerosene-lamp light, soft morning river light, earthy palette of ochre, mud brown, faded saffron and harvest gold, gentle film grain, real skin texture and lived-in hand-spun costumes, authentic hill-village Nepal (mud-and-stone farmhouses, terraced paddy fields, a river bend with a pipal tree). Handheld but steady, intimate framing, shallow depth of field. Quiet, spiritual and humane, not glossy, not cartoon, not stock footage. Characters must match their reference images exactly in face, build and clothing in every clip.";
const SADHU_RANI_PACE = "PACING AND CAMERA: ONE continuous shot with no hard cuts. Slow, motivated camera (gentle push-in, slow pan, handheld follow). One simple action beat per clip; let silence and reactions breathe. Start with about 0.5 seconds of ambient sound before anyone speaks, deliver any dialogue between roughly 0.8s and 8.5s, and finish on a calm, held, well-composed final frame for the last 1 second so the clip joins cleanly to the next one. Emotion is shown in eyes, hands and posture.";
const SADHU_RANI_AUDIO = "AUDIO: The characters speak the Nepali lines listed under DIALOGUE, word for word, in the order given, in natural conversational Nepali with authentic pronunciation and lip-sync to the speaker. Do not translate, paraphrase, add words, or add other speech. If there is no DIALOGUE, nobody speaks. No narrator, no singing. Use real ambient sound design (wind, birds, hens, footsteps, water, rain, cloth, tools) and at most a very soft, sparse score that stays under the voices.";
function sadhuRaniFormat(ar, dur = "10s") {
  const secs = dur === "10s" ? "10 seconds" : dur;
  return "FORMAT: " + (ar === "9:16" ? "9:16 vertical, faces large and centered, tall layered depth" : "16:9 wide cinematic framing") + ". Exactly " + secs + ". Clean frame with no on-screen text, subtitles, captions, signs with readable writing, logos or watermarks.";
}

const SADHU_RANI_CH = {
  G: "THE SADHU (60s): lean, calm ascetic with long grey matted hair tied up, long white-grey beard, ochre-saffron robe worn thin, rudraksha beads, a wooden staff and a brass water pot (kamandalu), a small cloth bundle, bare feet. Serene, gentle eyes; speaks softly; truly honest by nature.",
  H: "HARI (45): village farmer; sun-darkened skin, short hair, cotton daura-suruwal with a grey shawl, a Dhaka topi; warm and hospitable, but weak when tempted and quick to justify small wrongs.",
  W: "DEVI (40): Hari's wife; red-bordered cotton sari with a faded shawl, simple glass bangles, a pinch of worry always in her eyes; kind, honest, uneasy about her husband's habits.",
  N: "RAMKAJI (50): Hari's neighbour and a hard-working farmer; stocky, moustache, brown vest over white shirt, a cloth wrapped around his head; blunt and short-tempered but fair at heart."
};
const SADHU_RANI_NAMES = { G: "Sadhu", H: "Hari", W: "Devi", N: "Ramkaji" };
const SADHU_RANI_LN = { H: "Hari's house", F: "Paddy field", V: "Village path", R: "River bank" };
const SADHU_RANI_LOC = {
  H: "LOCATION — HARI'S HOUSE: modest mud-and-stone farmhouse with a slate roof, courtyard with a wooden mortar for pounding grain, a clay hearth in the main room lit by a kerosene lamp, a corner where a thick woolen mat (raadi) is kept. Same layout in every clip.",
  F: "LOCATION — PADDY FIELD: terraced hillside paddy fields at harvest, golden ripe stalks, narrow earth bunds, dusk light; the neighbour Ramkaji's field is the one next to Hari's.",
  V: "LOCATION — VILLAGE PATH: dusty hill-village path with stone walls, a small roadside shrine with a bell, a few houses, hens and dogs, morning or dusk light.",
  R: "LOCATION — RIVER BANK: quiet river bend outside the village with smooth stones and a huge pipal tree with a stone platform beneath it; clear morning light on the water."
};

const SADHU_RANI_REFS = {
  G: "a 60-year-old Nepali sadhu, long grey matted hair tied up, long white-grey beard, thin ochre-saffron robe, rudraksha beads, wooden staff, brass water pot, small cloth bundle, bare feet, serene eyes",
  H: "a 45-year-old Nepali village farmer, sun-darkened skin, short hair, cotton daura-suruwal with grey shawl and Dhaka topi, slightly guilty warm expression",
  W: "a 40-year-old Nepali village woman, red-bordered cotton sari with faded shawl, glass bangles, kind worried eyes",
  N: "a 50-year-old stocky Nepali farmer with moustache, brown vest over white shirt, cloth wrapped around the head, blunt expression"
};
const SADHU_RANI_LREF = {
  H: "modest mud-and-stone farmhouse with slate roof, courtyard with wooden mortar, clay hearth room lit by a kerosene lamp, a thick woolen mat in the corner",
  F: "terraced hillside paddy fields at harvest, golden ripe stalks, narrow earth bunds, dusk light",
  V: "dusty hill-village path with stone walls and a small roadside shrine with a bell",
  R: "quiet river bend with smooth stones and a huge pipal tree with a stone platform"
};

const SADHU_RANI_EPS = [
  { ne: "साधु र राडी", en: "The Sadhu and the Mat", clips: [
    ["F", "H", "The few sheaves", "Dusk at the edge of a neighbour's ripe golden paddy field. Hari glances around, quickly cuts a few bundles with a sickle and hides them under his shawl, sweat on his brow; a distant dog barks. Low handheld shot, tension in near-silence.", "हरि: थोरै नै त हो, कसले थाहा पाउँछ र?"],
    ["V", "H", "Meeting a villager", "Hari hurries along the village path with the bundle hidden under his shawl; a villager stops him by the roadside shrine. Medium two-shot, shrine bell swaying; the villager is a friendly neighbour in simple clothes.", "गाउँले: हरि दाइ, यत्ति अबेर कहाँबाट?|हरि: खेतबाट… अलिकति काम थियो।"],
    ["H", "HW", "Where did it come from?", "Hari sets the bundle in a dark corner of the courtyard; Devi sees it and stops with a lamp in her hand. Slow push-in on her doubtful face.", "देवी: यो धान कहाँबाट ल्याउनुभयो?|हरि: हाम्रै खेतको हो। सोधिरहन पर्दैन।"],
    ["H", "W", "Pounding the paddy", "Night. Devi pounds the paddy in the wooden mortar by lamplight, husks flying, glancing now and then toward the closed door where Hari sits. Slow side track, rhythmic thuds. No dialogue."],
    ["V", "G", "A stranger at dusk", "A sadhu walks the dusk path with his staff and bundle, stopping at a gate where a villager shakes his head. Low tracking shot, long shadows.", "साधु: नारायण… रातभर बास पाउँ कि?|गाउँले: ठाउँ छैन महाराज, अरू ठाउँ हेर्नुहोस्।"],
    ["H", "GH", "At the gate", "The sadhu stands at Hari's gate; Hari looks up from the veranda and hurries to greet him with joined palms. Eye-level two-shot, warm dusk light.", "साधु: ॐ नमो नारायण। एक रातको बास पाउँ कि, बाबु?|हरि: आउनुहोस् महाराज। अतिथि त देवता हुन्।"],
    ["H", "GHW", "Food for the guest", "By the hearth lamp, Devi serves the sadhu steaming rice and lentils on a leaf plate; she glances at Hari, who looks away. The sadhu eats with gratitude. Slow push-in, three-shot.", "साधु: अन्नपूर्णा प्रसन्न होऊन्। कति मीठो भात!|देवी: खानुहोस् महाराज।"],
    ["H", "GH", "Twelve pure years", "After eating, the sadhu speaks calmly by the fire; Hari listens, then lowers his eyes. Close two-shot, firelight on faces.", "साधु: बाबु, मैले बाह्र वर्ष हिँडेँ, कसैको एक दाना पनि नसोधी लिएको छैन।"],
    ["H", "GW", "The woolen mat", "Devi lays a thick woolen mat (raadi) by the hearth for the sadhu; he touches it with thanks and settles down. Medium shot, soft lamp-light.", "साधु: राडीको न्यानोले आज राम्रो निद्रा आउला।|देवी: शुभ रात्रि महाराज।"],
    ["H", "HW", "Hari can't sleep", "Night. Hari lies awake beside Devi, staring at the dark ceiling; from the next room comes the sadhu's faint steady breathing. Slow push-in on Hari's troubled eyes. No dialogue."],
    ["H", "G", "Before dawn", "Before sunrise the sadhu rises silently, folds the woolen mat and ties it to his bundle; he hesitates, a shadow of temptation crosses his face, then he steps out of the sleeping house. Slow handheld follow, close on his hand gripping the mat. No dialogue."],
    ["H", "HW", "The mat is gone", "Morning. Hari carries tea toward the corner where the sadhu slept and finds it empty; Devi stops sweeping. Medium two-shot, shocked silence.", "हरि: साधु महाराज कहाँ गए? ए… राडी पनि छैन!|देवी: राडी पो लगेछन्!"],
    ["V", "HN", "Raising the village", "Hari runs through the village, calling out; villagers and Ramkaji gather with sticks. Handheld, fast but not frantic.", "हरि: ए छिमेकी हो! एउटा साधुले मेरो राडी चोरेर भागे!|रामकाजी: साधुको भेषमा चोर! खोज्नुपर्छ।"],
    ["V", "HN", "Following the trail", "Hari and Ramkaji lead a line of villagers along footprints in the dusty trail, a dog sniffing ahead, then a boy points. Low tracking shot.", "गाउँले: उता नदीतिर गएको देखियो।", "N", "new moment: leaving the village on the trail"],
    ["R", "G", "The restless sadhu", "Under the pipal tree beside the river the sadhu sits with the mat on his lap, eyes restless, fingers tapping the wool; he cannot meditate. Slow push-in, then distant voices rise. No dialogue."],
    ["R", "GHN", "Caught", "The villagers surround the pipal platform; Hari steps forward, hurt; Ramkaji glares. Slow push-in on the sadhu's calm face.", "हरि: महाराज, तपाईंले मेरो राडी किन चोर्नुभयो?|रामकाजी: ढोंगी साधु!"],
    ["R", "G", "I was pure", "The sadhu stands, holds the mat in both hands and bows his head, speaking from a heavy heart. Close shot, soft river light.", "साधु: म तिम्रो घर आउँदा शुद्ध थिएँ। निस्कने बेला पो मनमा चोरी पस्यो।"],
    ["R", "GH", "The grain", "The sadhu looks gently at Hari; Hari's face freezes as a quick light-only flash of the dusk field and the hidden sickle crosses his mind. Slow push-in on Hari.", "साधु: तिमीले दिएको अन्न नै चोरीको थियो जस्तो लाग्छ। त्यसैको असर मभित्र पस्यो।"],
    ["R", "HN", "The confession", "Hari falls to his knees before Ramkaji and the crowd, shaking; Ramkaji's anger turns to shock. Handheld close shots.", "हरि: महाराज होइन, चोर त म हुँ। त्यो धान रामकाजीको खेतबाट काटेको थिएँ।|रामकाजी: हरि… तैँले?"],
    ["R", "HN", "Forgiveness", "Ramkaji stands silent, then lifts Hari by the shoulders; the villagers lower their sticks. Medium two-shot, slow pull-back.", "रामकाजी: गल्ती मान्ने मान्छे सानो हुँदैन। धानको मोल फर्काइदे।|हरि: म आजै फर्काउँछु, दाइ।"],
    ["R", "GHN", "The mat returned", "The sadhu offers the woolen mat back to Hari with both hands; Hari bows, deeply moved, while Ramkaji watches with softened eyes. Close three-shot, warm morning light.", "साधु: यो राडी फिर्ता लिनू, बाबु। चोरीको थोरै पनि मन भारी बनाउँछ।|हरि: महाराज… आजदेखि मेरो अन्न इमानदारीको मात्र हुनेछ।"],
    ["R", "GHN", "Jasto ann, usto man", "The sadhu raises his staff, nods to the villagers and walks away along the river path into the rising sun. Hari and Ramkaji stand together watching; the villagers fall silent. Slow pull-back, final held wide frame.", "साधु: याद राख, जस्तो अन्न, उस्तै मन।"]
  ]}
];

const SADHU_RANI_TIMEWORD = /^(Night|Dusk|Morning|Dawn|Evening|Midnight|Late|Before|Back home|Days later|Flashback|Cold open|Afternoon|Quiet establishing)/i;
function sadhuRaniContOf(e, c) {
  const k = SADHU_RANI_EPS[e].clips[c];
  if (k[5] === "C") return { cont: true, why: k[6] || "same place and moment" };
  if (k[5] === "N") return { cont: false, why: k[6] || "new setup" };
  if (c === 0) return { cont: false, why: "opening clip: build it from the references" };
  const p = SADHU_RANI_EPS[e].clips[c - 1];
  if (p[0] !== k[0]) return { cont: false, why: "new place" };
  if (SADHU_RANI_TIMEWORD.test(k[3]) || /flashback|flash-forward|cold open/i.test(k[2] + " " + k[3].slice(0, 90))) return { cont: false, why: "new time of day or a different look" };
  return { cont: true, why: "same place, same moment" };
}

function sadhuRaniBuildPrompt(e, c, ar = "16:9", dur = "10s") {
  const k = SADHU_RANI_EPS[e].clips[c];
  const n = SADHU_RANI_EPS[e].clips.length;
  const lines = k[4] ? k[4].split("|") : [];
  const chars = [...k[1]].map(x => SADHU_RANI_CH[x]).join("\n\n") || "No people in frame.";
  const ct = sadhuRaniContOf(e, c);
  const prev = ct.cont
    ? "CONTINUITY — CONTINUE FROM CLIP " + c + ": attach the final frame of clip " + c + " as the start frame and keep people, clothing, light, place and screen direction identical to it. Anyone newly arriving in this clip must match their reference image."
    : "CONTINUITY — NEW SETUP (" + ct.why + "): do not use a start frame. Build the shot fresh from the attached reference images (characters and place), with the clothing, light and look described here.";
  return "SHOT — clip " + (c + 1) + " of " + n + " in the short film \"" + SADHU_RANI_EPS[e].en + "\", one continuous 10-second live-action drama clip:\n" + k[3] + "\n\nCHARACTERS — match the reference images exactly:\n" + chars + "\n\n" + SADHU_RANI_LOC[k[0]] + "\n\nDIALOGUE (speak exactly as written, in Nepali):\n" + (lines.length ? lines.map(l => "• " + l).join("\n") : "None. Nobody speaks in this clip.") + "\n\n" + prev + "\n\n" + SADHU_RANI_STYLE + "\n\n" + SADHU_RANI_PACE + "\n\n" + SADHU_RANI_AUDIO + "\n\n" + sadhuRaniFormat(ar, dur);
}

const SADHU_RANI_CLIPS = [];
SADHU_RANI_EPS.forEach((ep, e) => {
  ep.clips.forEach((clip, c) => {
    SADHU_RANI_CLIPS.push({
      epIndex: e,
      clipIndex: c,
      doneKey: `${e}-${c}`,
      epNe: ep.ne,
      epEn: ep.en,
      clip
    });
  });
});

function sadhuRaniPromptFor(index, ar = "16:9", dur = "10s") {
  const item = SADHU_RANI_CLIPS[index];
  if (!item) return "";
  return sadhuRaniBuildPrompt(item.epIndex, item.clipIndex, ar, dur);
}

function sadhuRaniCharactersFor(index) {
  const item = SADHU_RANI_CLIPS[index];
  const codes = [...(item?.clip?.[1] || "")];
  return codes.map(code => ({
    code,
    name: SADHU_RANI_NAMES[code] || code,
    refPrompt: "Character reference: full-body front three-quarter view of " + (SADHU_RANI_REFS[code] || SADHU_RANI_CH[code] || code) + ". Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text."
  }));
}
