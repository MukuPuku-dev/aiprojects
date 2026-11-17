const KAM_NALAGNE_STYLE = "STYLE LOCK — grounded, photorealistic live-action Nepali village drama, shot on a cinema camera with natural lenses: soft overcast or warm window light, muted earthy palette (stone grey, mud brown, faded cotton, monsoon green), gentle film grain, real skin texture and lived-in costumes, authentic hill-village Nepal (stone houses, terraced fields, a small bazaar, a school, a stream far below). Handheld but steady, intimate framing, shallow depth of field. Quiet realism, not an action movie, not glossy, not cartoon, not stock footage. Characters must match their reference images exactly in face, build and clothing in every clip.";
const KAM_NALAGNE_PACE = "PACING AND CAMERA: ONE continuous shot with no hard cuts. Slow, motivated camera (gentle push-in, slow pan, handheld follow). One simple action beat per clip; let silence and reactions breathe. Start with about 0.5 seconds of ambient sound before anyone speaks, deliver any dialogue between roughly 0.8s and 8.5s, and finish on a calm, held, well-composed final frame for the last 1 second so the clip joins cleanly to the next one. Emotion is shown in eyes, hands and posture.";
const KAM_NALAGNE_AUDIO = "AUDIO: The characters speak the Nepali lines listed under DIALOGUE, word for word, in the order given, in natural conversational Nepali with authentic pronunciation and lip-sync to the speaker. Do not translate, paraphrase, add words, or add other speech. If there is no DIALOGUE, nobody speaks. No narrator, no singing. Use real ambient sound design (wind, birds, hens, footsteps, water, rain, cloth, tools) and at most a very soft, sparse score that stays under the voices.";
function kamNalagneFormat(ar, dur = "10s") {
  const secs = dur === "10s" ? "10 seconds" : dur;
  return "FORMAT: " + (ar === "9:16" ? "9:16 vertical, faces large and centered, tall layered depth" : "16:9 wide cinematic framing") + ". Exactly " + secs + ". Clean frame with no on-screen text, subtitles, captions, signs with readable writing, logos or watermarks.";
}

const KAM_NALAGNE_CH = {
  S: "SUMAN (25): lean build, sun-weathered face, short black hair, pale-blue shirt, dark brown trousers, worn sandals, cloth shoulder bag. Quiet, observant, a little withdrawn; his confidence is low but his eyes notice everything about water and soil.",
  M: "MAYA (19): Suman's sister; long black braid, maroon kurta with a blue shawl; sharp, expressive, ambitious student, affectionate but sometimes exasperated with her brother.",
  R: "RAMESH (27): Suman's childhood friend; green jacket, black trousers; talkative, warm, teasing, with worry hidden behind jokes.",
  A: "SARASWATI (50): mother of Suman and Maya; green blouse, dark red shawl, hardworking hands, tired caring eyes, always worried about money.",
  B: "BHIMBAHADUR (52): ward chairman; heavy build, moustache, Dhaka topi, brown coat over white daura-suruwal; proud and formal, defensive when wrong, but not a villain.",
  K: "KEDAR (40s): local contractor; dusty work shirt, cap, notebook in pocket; pressured by costs and deadlines, defensive, not cruel.",
  D: "DHANIRAM (65): elderly farmer; weathered face, grey stubble, old topi, faded cotton clothes, a wooden walking stick; wise but sometimes stuck in old ways.",
  U: "SUSHILA (30s): school teacher; neat sari, shawl, cardigan, spectacles; calm, fair-minded, believes in facts and in Maya.",
  F: "SUMAN'S FATHER (late, seen in flashbacks, 50s): lean, grey-streaked hair, thin moustache, faded brown jacket with rolled sleeves, honest intense eyes, a worn notebook in his hand; truthful and stubborn, sometimes harsh when ignored.",
  L: "BISHAL (9): small, bright-eyed village boy, scruffy short hair, oversized faded school sweater and shorts, bare feet or rubber slippers; endlessly curious, asks the questions adults forget to ask.",
  T: "TECHNICIAN (30s): municipality engineer; rain jacket, helmet, measuring tape and clipboard; careful, speaks only about what he can verify."
};
const KAM_NALAGNE_NAMES = { S: "Suman", M: "Maya", R: "Ramesh", A: "Saraswati", B: "Bhimbahadur", K: "Kedar", D: "Dhaniram", U: "Sushila", T: "Technician", F: "Father", L: "Bishal" };
const KAM_NALAGNE_LN = { H: "Home", T: "Tea shop", C: "Canal", W: "Ward office", S: "School", B: "Bazaar", V: "Village road" };
const KAM_NALAGNE_LOC = {
  H: "LOCATION — SUMAN'S HOME: small stone house with a slate roof, mud-plastered yard, hearth with a clay stove, wooden trunk, framed photo of the late father, kerosene lamp at night. Same layout in every clip.",
  T: "LOCATION — TEA SHOP: tiny roadside bazaar tea stall with a tin roof, benches, steel glasses, steaming kettle, a few villagers.",
  C: "LOCATION — THE OLD CANAL: hand-built irrigation canal along terraced fields, stone-lined, small wooden sluice gates, ancient stone markers; the water is the quiet star.",
  W: "LOCATION — WARD OFFICE: modest concrete ward office with a veranda, wooden chairs, a table of papers and a rolled map, a dusty notice board.",
  S: "LOCATION — SCHOOL: simple hill school with a yard, painted classroom doors and a large open ground (chaur) on the upper side with a view over the valley.",
  B: "LOCATION — BAZAAR: small hill bazaar with shops, sacks, a construction site of bricks and cement, people carrying loads.",
  V: "LOCATION — VILLAGE ROAD AND HILLSIDE: newly cut dirt road above the village with a half-finished roadside drain, steep terraced slopes, the old stone outlet hidden in weeds, the lower settlement and a stream far below."
};

const KAM_NALAGNE_REFS = {
  L: "a 9-year-old Nepali village boy, scruffy short hair, oversized faded school sweater and shorts, bright curious eyes",
  F: "a 50-year-old Nepali man (Suman's late father), grey-streaked hair, thin moustache, faded brown jacket with rolled sleeves, honest intense eyes, holding a small notebook",
  S: "a lean 25-year-old Nepali man, sun-weathered face, short black hair, pale-blue shirt, dark brown trousers, worn sandals, cloth shoulder bag, quiet observant expression",
  M: "a 19-year-old Nepali woman, long black braid, maroon kurta and blue shawl, sharp expressive face",
  R: "a 27-year-old Nepali man, green jacket and black trousers, friendly teasing smile",
  A: "a 50-year-old Nepali woman, green blouse and dark red shawl, hardworking hands, tired caring eyes",
  B: "a 52-year-old heavyset Nepali man with a moustache, Dhaka topi, brown coat over white daura-suruwal, proud expression",
  K: "a 40-year-old Nepali contractor, dusty work shirt, cap, notebook in pocket, defensive but tired",
  D: "a 65-year-old Nepali farmer, weathered face, grey stubble, old topi, faded cotton clothes, wooden stick",
  U: "a 35-year-old Nepali schoolteacher, neat sari with cardigan, spectacles, calm face",
  T: "a 30-year-old Nepali municipal engineer, rain jacket, helmet, clipboard and measuring tape"
};
const KAM_NALAGNE_LREF = {
  H: "stone house with slate roof and mud-plastered yard in a Nepali hill village, clay stove, wooden trunk",
  T: "tiny roadside tea stall in a Nepali hill bazaar, tin roof, benches, steel glasses",
  C: "hand-built stone irrigation canal along terraced fields with wooden sluice gates and old carved stone markers",
  W: "modest concrete ward office with a veranda, wooden chairs, notice board",
  S: "simple hill school with yard and a large open upper ground over a valley",
  B: "small Nepali hill bazaar with shops, sacks and a brick construction site",
  V: "newly cut dirt road above a Nepali village with a half-finished drain, steep terraces and a stone outlet hidden in weeds"
};

const KAM_NALAGNE_EPS = [
  { ne: "गाउँले चिनेको सुमन", en: "The village's Suman", clips: [
    ["V", "S", "Cold open: the night it all comes to", "Cold open, flash-forward look: desaturated, cold, rain-lashed night on a dark hillside. A mud-covered hand grips a soaked notebook as rain hammers it; far below, lantern lights move uphill; a deep rumble rolls through the earth; Suman's drenched face turns toward the sound, breathing hard. Slow handheld push-in, a held frame on his eyes, then the picture fades to black in the last second.", "सुमन: सबै माथि जानुहोस्… छिटो!"],
    ["V", "", "Sundarpur at dawn", "Quiet establishing shot, no people in frame: dawn mist over the terraced hills of Sundarpur, thin streams of water glinting in stone canals, smoke rising from slate roofs, a hen crossing a path. Slow drone-like glide down toward one small stone house. A soft hint of water sound under everything. No dialogue."],
    ["H", "SA", "Five more minutes", "Dawn in the stone yard, hens scattering. Saraswati sprinkles water and calls toward the doorway; Suman groans under a blanket on the veranda. Slow push-in from the yard.", "सरस्वती: सुमन! घाम आँगनमा आइपुग्यो, तँ अझै सिरकभित्रै?|सुमन: उठ्दै छु आमा… पाँच मिनेट।"],
    ["H", "SMA", "A job in the bazaar", "Maya steps out with her books and a dry look at her brother; Saraswati hands Suman a cup of tea and nudges him toward the gate. Medium three-shot, handheld.", "माया: तिम्रो पाँच मिनेटमा त मेरो आधा कक्षा सकिन्छ।|सरस्वती: आज बजारमा केदार ठेकेदारले मान्छे खोजेको रे। जा, छोरा।"],
    ["V", "SL", "The curious boy", "On the hillside path a small village boy (Bishal, 9) skips after Suman, who walks with his shoulder bag; they stop beside a trickling stone-lined stream. Low tracking shot at the boy's height.", "बिशाल: दाइ, कुलोमा पानी किन कहिल्यै सुक्दैन?|सुमन: किनकि कसैले पानीको बाटो खुला राखेको छ।"],
    ["T", "SR", "Welcome to the tea shop", "Suman arrives at the tea stall; Ramesh and two villagers on a bench turn and grin. Ramesh opens his arms in mock welcome. Handheld, eye level, steam rising from glasses.", "रमेश: ओहो, गाउँको सबैभन्दा व्यस्त मान्छे आइपुग्यो!|सुमन: के काम छ तेरो?"],
    ["T", "SR", "Going abroad", "Tight two-shot on the bench. Ramesh jokes about going abroad while the villagers laugh; Suman smiles politely, eyes dropping to his glass. Slow push-in on Suman.", "रमेश: म त विदेश जाने तयारीमा। तँ चाहिँ कुन देश जाने?|सुमन: अहिले चिया पसलसम्म आएको छु।"],
    ["T", "SR", "The label", "An older villager at the end of the bench says the cruel line quietly, as if it were common sense; the laughter fades; Suman puts coins on the counter and stands. Ramesh calls after him softly, but Suman walks out without turning. Slow push-in on Suman's back, then a held frame of the empty doorway.", "गाउँले: काम नलाग्ने मान्छे पनि कतै कामको हुन्छ र?|रमेश: ए सुमन… ठट्टा गरेको हो।"],
    ["C", "S", "A leaking canal", "A farmer packs wet soil against a leaking canal wall, cursing as water keeps seeping; Suman arrives on the path above and stops to watch. Low tracking shot at water level.", "किसान: यो कुलोले आज पनि मलाई दुःख दियो!"],
    ["C", "S", "Three stones", "Suman crouches and quietly shifts three stones; the water turns back into the channel; the farmer stares, stunned. Close on Suman's hands, then a slow pull-back.", "किसान: तँलाई यो कुलोको कुरा कसले सिकायो?|सुमन: बुबासँग हिँड्दा देखेको।"],
    ["C", "S", "The carved stone", "Alone at the canal, Suman brushes soil off a half-buried old stone marker carved with three wavy lines; for a moment his hand rests where a larger hand once guided his (a brief warm memory shown by light only, no extra person). Slow push-in on the stone. No dialogue.", "", "N", "the farmer has left; Suman is alone"],
    ["H", "SM", "The fee deadline", "Evening lamp-light in the house. Maya reads from her notebook at the floor-table; Suman sits by the wall, avoiding her eyes. Static two-shot, slow drift in.", "माया: दाइ, शुल्क बुझाउने अन्तिम मिति आउँदैछ।|सुमन: म मिलाउँछु। दुई दिन दे।"],
    ["H", "MA", "Two days again", "Maya answers flatly and leaves the room; Saraswati, in the background, opens a small tin box and counts a few crumpled notes, then closes it quietly. Slow rack of focus from Maya to Saraswati.", "माया: हरेक पटक दुई दिन भन्छौ।"],
    ["H", "S", "The father's photo", "Night. Suman sits alone before the framed photo of his late father beside a kerosene lamp, and speaks softly to it. Close shot, slow push-in, flame flickering.", "सुमन: बुबा… म साँच्चै काम नलाग्ने हो र?"],
    ["C", "S", "The sound under the road", "Night. Suman stands by the canal; he tilts his head, hearing a strange low gurgle coming from somewhere high above, under the new road. Slow push-in on his listening face, then a held wide frame of the dark hillside. No dialogue."],
    ["V", "S", "The unfinished drain", "Torch in hand, Suman climbs to the freshly cut dirt road and finds a narrow half-finished drain where water is already pooling and soaking the slope. He kneels, touches the wet soil, frowns. Handheld, torch beam sweeping. No dialogue."],
    ["V", "SK", "Headlights", "A jeep's headlights sweep the road; Kedar steps out, torch in hand, surprised to find Suman there. Medium two-shot in the headlight glare.", "केदार: यत्ति रात यहाँ के गर्दै छस्? घर जा।|सुमन: पानीको आवाज सुन्दै थिएँ।"],
    ["H", "S", "The third marker", "Back home at night. Suman opens his father's notebook on the floor; a single page shows a sketch of three wavy lines like the carved stone, with a smudged arrow pointing into blank space; he lifts his eyes as, far away, a faint rumble echoes like the cold open. Slow push-in on the page, then a final held frame on his face. No readable text on the page. No dialogue."]
  ]},
  { ne: "घरको बोझ", en: "The weight at home", clips: [
    ["H", "SA", "The household ledger", "Morning. Saraswati writes figures in a worn ledger by the hearth, lips moving as she counts; Suman watches from the doorway, feeling the weight. Slow push-in.", "सरस्वती: घर चलाउन पैसा मात्र होइन, हिसाब पनि चाहिन्छ।|सुमन: म आज बजारमा काम खोज्छु। खाली हात फर्किन्न।"],
    ["B", "SK", "Heavy loads", "At a bazaar building site Suman hoists bricks onto his back among other laborers, grimacing; Kedar names a low daily wage; Suman starts to object, then swallows it and lifts the load. Handheld follow.", "केदार: दिनको यति नै हुन्छ। चित्त नबुझे अर्को खोज।"],
    ["H", "SM", "Money and a sore back", "Dusk in the yard. Suman hands Maya a few crumpled notes, wincing as he straightens his back; Maya notices and her smile fades. Medium two-shot.", "माया: यति भारी काम किन गरेको?|सुमन: पैसा हलुका काम गरेर आउँदैन रहेछ।"],
    ["H", "SM", "The father's notebook", "Maya digs through the wooden trunk and lifts out a worn hand-written notebook; Suman takes it carefully, thumbs its edges. Close over-the-shoulder shot as pages fall open on sketches of canals.", "सुमन: यो बुबाले सधैँ बोकेर हिँड्नुहुन्थ्यो।|माया: तिमीले पनि यसमा लेखेका कुरा बुझ्छौ?|सुमन: केही बुझ्छु। सबै होइन।"],
    ["H", "S", "Sketches in lamplight", "Night. Suman alone by the kerosene lamp, tracing the father's canal sketches with a finger, then closing the notebook and resting both hands on it. Slow push-in on his face, then a held shot of his hands on the cover. No dialogue."]
  ]},
  { ne: "साथी र सपनाहरू", en: "Friends and dreams", clips: [
    ["B", "SR", "Ramesh's big plans", "Bazaar, bright afternoon. Ramesh in new shoes and a clean shirt shows Suman his passport photos, beaming; Suman smiles and claps his shoulder. Handheld two-shot.", "रमेश: अब दुई महिनाभित्र उडिन्छ होला।|सुमन: पहिले भिसा आओस्, त्यसपछि मलाई चकलेट पठाइस्।"],
    ["H", "SR", "The comparison", "Outside Ramesh's house, an older man proudly praises his son to neighbors and gestures at Suman as the example not to follow; Ramesh winces; Suman quietly turns and leaves. Slow lateral track.", "रमेशका बुबा: हेर्, छोरा भए रमेशजस्तो! अरू त…"],
    ["V", "SR", "Walking the path", "The two friends walk along a hillside path, shoulders almost touching, a small silence between them. Slow tracking shot from the front.", "रमेश: यहाँ बसेर के गर्छस्? मसँगै हिँड न।|सुमन: गएपछि घर कसले हेर्छ?"],
    ["V", "SR", "The village is emptying", "They stop at a ridge overlooking half-empty terraces and shuttered houses. Ramesh shrugs; Suman stares at the fields. Slow push-in on both.", "रमेश: घर त सबैले छोडेर गएका छन्।|सुमन: त्यही भएर त गाउँ खाली हुँदैछ।"],
    ["B", "SR", "The bus leaves", "A battered local bus at the stand. Ramesh hugs Suman, climbs aboard and leans out of the window; the bus pulls away in dust; Suman stands alone, then slowly walks back along the empty path. Wide held final frame.", "रमेश: म गएँ भनेर हराउँदिनँ।"]
  ]},
  { ne: "बुबाले छोडेको ज्ञान", en: "The knowledge his father left", clips: [
    ["C", "SD", "The fallen root", "Dhaniram's terrace. Suman clears a fallen tree root and a clot of earth blocking the water channel with his hands, water rushing through. Dhaniram watches on his stick, impressed. Low tracking shot.", "धनिराम: तेरो बाउ पनि पानीको आवाज सुनेर बाटो पत्ता लगाउँथ्यो।|सुमन: आवाज सुनेर होइन, हेरेर होला काका।"],
    ["C", "SD", "An old dispute", "Dhaniram and Suman sit on the canal wall; Dhaniram speaks heavily, looking away at the fields, remembering. Slow push-in on the old man's face.", "धनिराम: तेरो बाउले पुरानो निकास बन्द नगर्न भनेका थिए। कसैले सुनेनन्।"],
    ["V", "F", "Flashback: the warning", "Flashback look: slightly desaturated, warmer grain. Suman's father (50s, grey-streaked hair) argues with workers at a canal construction site, pointing at an old stone outlet; the foreman waves him off; he snaps harshly at a farmer, then steadies himself. Handheld.", "बुबा: पुरानो निकास नथुन्नुहोस्, पानी फर्किन्छ!"],
    ["H", "SA", "Was he wrong?", "Night, kitchen. Saraswati stirs a pot, Suman asks quietly. She answers without turning, then finally looks at him. Slow push-in, warm lamp-light.", "सुमन: बुबा गलत हुनुहुन्थ्यो?|सरस्वती: सबै कुरामा सही हुनुहुन्थेन। तर उहाँले देखेको कुरा कसैले सुनेन।"],
    ["H", "SA", "Why he spoke", "Same kitchen. Suman asks his last question; Saraswati touches the framed photo of her husband, then Suman's cheek. Then Suman opens the notebook and studies it like a document for the first time. Slow push-in, final held frame on the open page.", "सुमन: त्यसो भए किन बोल्नुभएको?|सरस्वती: किनकि चुप लाग्दा पनि उहाँलाई चैन हुँदैनथ्यो।"]
  ]},
  { ne: "सानो काम, ठूलो अपमान", en: "Small work, large insult", clips: [
    ["C", "S", "The water dispute", "Two farmers argue loudly over whose field gets water first. Suman steps in calmly, points to the upper sluice gate, shows the leak with his hand. Handheld at the center of the argument.", "सुमन: माथिल्लो ढोका गलत समयमा खोलिएको छ। पानी चुहिरहेको छ।"],
    ["W", "SB", "Dismissed", "Ward office veranda. Bhimbahadur, flanked by villagers, looks Suman up and down and cuts him off. Slow push-in on Bhim, Suman's quiet reaction in the foreground.", "भीमबहादुर: तँलाई कृषि कार्यालयको इन्जिनियरले पठाएको हो?|सुमन: होइन अध्यक्षज्यू। पानीको ढोका हेरेको मात्र हुँ।"],
    ["W", "SB", "Someone else's credit", "Evening ward veranda: Bhim announces that the committee solved the water problem; applause; Suman stands at the back, unmentioned, giving a small tired nod. Slow pan from the applause to Suman.", "भीमबहादुर: समितिले पानीको समस्या समाधान गरेको छ। सबैलाई बधाई!"],
    ["H", "SM", "What is a name worth?", "Dusk at home. Maya is indignant on her brother's behalf; Suman calmly peels his sandals off. Medium two-shot.", "माया: तिमीले गरेको कामको श्रेय अरूले लिए। तिमीलाई आफ्नो नामको पनि मतलब छैन?|सुमन: मतलब छ। तर नामले भात पाक्दैन।"],
    ["W", "BK", "The old outlet on the map", "Inside the ward office, Bhim and Kedar bend over a rolled map. Kedar's finger rests on a faint old line; Bhim looks away. Insert on the line, then a held shot of Bhim's evasive face.", "केदार: यो पुरानो निकास किन बन्द गरिएको?|भीमबहादुर: पुरानो कुरा हो, कसले सम्झन्छ र?"]
  ]},
  { ne: "मायाको सपना", en: "Maya's dream", clips: [
    ["S", "MU", "The scholarship", "School corridor, bright morning. Sushila holds out a scholarship notice to Maya, who hesitates and glances at her worn shoes. Slow push-in.", "सुशीला: तिमीले आवेदन नै नदिई आफूलाई अयोग्य नठान।|माया: छात्रवृत्ति पाए पनि बस्ने र आउने खर्च?"],
    ["H", "SMA", "The question he can't answer", "Evening in the house. Maya confronts Suman about his own future while Saraswati pretends not to listen at the stove. Slow handheld push-in on the siblings.", "माया: दाइ, तिमीले सबै कुरा मिलाउँछु भन्छौ। तर आफ्नो कामचाहिँ कहिले मिलाउँछौ?|सुमन: त्यो प्रश्नको उत्तर मसँग छैन।"],
    ["B", "S", "Fixing the wage first", "Bazaar shop-front. Suman, sacks stacked behind him, stands straight and agrees on his pay before lifting anything; the shopkeeper blinks, then nods. Steady medium shot.", "सुमन: ज्याला पहिल्यै तय गरौँ, त्यसपछि काम सुरु गर्छु।"],
    ["H", "SMA", "The father's sentence", "Dusk. Saraswati, hands in her lap, remembers her husband's words; Suman and Maya both go still and teary. Slow push-in on the three faces.", "सरस्वती: बुबाले भन्नुहुन्थ्यो, मेरो छोराले पानीको बाटो चिन्छ, छोरीले किताबको बाटो चिनोस्।"],
    ["S", "MU", "The application", "School office. Maya signs the application form with a steady hand and slides it across the desk to Sushila, who smiles. Close shot on the pen, then Maya's resolved face.", "माया: यो मेरो निर्णय हो।"]
  ]},
  { ne: "वर्षा आउँदैछ", en: "The rains are coming", clips: [
    ["V", "D", "Preparing for monsoon", "Late-spring morning. Villagers repair terrace edges, patch slate roofs, clear drains; children carry stones; the slow rhythm of work before the rains, Dhaniram stands on a terrace edge directing the work with his stick; clouds gather over the ridge. Wide slow pan. No dialogue."],
    ["V", "SD", "The water changed direction", "Upper canal. Suman and Dhaniram stand where the new road drain cuts across the old water path; Suman kneels, studies the flow, frowns. Low handheld shot.", "सुमन: काका, यो पानी पहिले यताबाट आउँथ्यो?|धनिराम: पहिले बाटो फराकिलो थियो। अहिले सडकले काटेको छ।", "N", "new place: the upper canal"],
    ["V", "SD", "Paper and ground", "Same place. Dhaniram taps his stick on the ground; Suman looks from the road drain to the slope above. Slow push-in on both.", "सुमन: कागजमा चाहिँ के देखाएको छ?|धनिराम: कागज हेर्ने मान्छेले जमिन पनि हेर्नुपर्छ नि।"],
    ["H", "SAM", "Mother's fear", "Evening kitchen. Saraswati fears the old quarrel repeating; Maya advises her brother to gather facts first; Suman listens, then nods slowly. Handheld three-shot.", "सरस्वती: फेरि बुबाजस्तै झगडामा नपर्, छोरा।|माया: पहिले तथ्य जुटाऊ, दाइ।"],
    ["V", "S", "First heavy rain", "Night. The first big rain hammers the slate roof; from the window Suman sees the road drain overflowing and brown water running across the path. He pulls on his bag and steps into the rain to look. Slow push-in to a held frame. No dialogue."]
  ]},
  { ne: "चेतावनी", en: "The warning", clips: [
    ["H", "S", "Notebook against the map", "Midnight. Suman lays his father's notebook beside a printed map of the new road, lamp-lit, comparing lines with a pencil; one line fails to meet. Overhead slow push-in.", "सुमन: पुरानो निकास यहाँ नक्सामा छैन।"],
    ["V", "SD", "The buried outlet", "Hillside above the road. Suman and Dhaniram pull weeds off a stone outlet buried in soil; Suman measures it with a rope and notes it in the notebook. Handheld.", "धनिराम: तेरो बाउले पनि यही बाटो देखाउँथ्यो।|सुमन: त्यसैले मात्र सही मान्न मिल्दैन काका। अहिलेको अवस्था पनि हेर्नुपर्छ।"],
    ["V", "SK", "Contractor confrontation", "On the half-finished road, Kedar blocks Suman's path, arms folded, dust on his boots. Suman stays calm. Medium two-shot, slow push-in.", "केदार: त्यो हेर्ने काम इन्जिनियरको हो।|सुमन: हो, त्यसैले उहाँलाई देखाउन खोजेको।", "N", "new spot on the road"],
    ["H", "MAS", "Maya's good news", "Yard, morning. Maya runs in waving a letter; Saraswati drops her water pot with joy; Suman laughs for the first time in the story and lifts his sister off the ground. Handheld, bright.", "माया: दाइ! छात्रवृत्तिको प्रारम्भिक छनोटमा परेँ!"],
    ["V", "S", "The marker stake", "Hillside. Suman drives a small wooden stake beside a thin crack and photographs it; the next morning the crack is wider and seepage runs. Time cut inside the same shot via a slow camera drift from evening to morning light. Final held frame on the wet crack. No dialogue."]
  ]},
  { ne: "कसले सुन्ने?", en: "Who will listen?", clips: [
    ["W", "SB", "The meeting", "Ward meeting on the veranda; villagers on benches; Suman unrolls his map and begins to speak; Bhim cuts across him. Slow push-in on Suman.", "सुमन: पुरानो निकास र नयाँ नालीको बीचमा पानी थुनिएको छ।|भीमबहादुर: तँले बनाएको नक्सा हेरेर गाउँ चलाउने?"],
    ["W", "SKB", "Calling for a technician", "Same meeting. Kedar defends the work; Suman keeps his voice level and keeps his hand on the map. Bhimbahadur sits listening with arms crossed. Medium three-shot, handheld.", "केदार: काम प्राविधिकको स्वीकृतिमा भएको हो।|सुमन: त्यसो भए प्राविधिकलाई यहीँ बोलाएर हेरौँ।"],
    ["S", "SU", "The teacher reads", "Empty classroom after hours. Sushila reads the notebook page by page, adjusting her spectacles; Suman waits at the desk. Slow push-in.", "सुशीला: म इन्जिनियर होइन, तर यो नगरपालिकाको प्राविधिकलाई देखाउनुपर्छ।"],
    ["W", "BK", "Blaming each other", "Night, behind the ward office. Bhim and Kedar argue in low harsh voices, each pointing at the other. Handheld, lit by a single bulb.", "केदार: तपाईंले सही गर्नुभएको थियो।|भीमबहादुर: तैँले पनि त साँघुरो बनाइस्!"],
    ["H", "SA", "Speak with proof", "Night at home. Saraswati sits close to Suman and holds his hand. Slow push-in, warm light.", "सरस्वती: बोल्। तर यसपालि प्रमाण लिएर बोल्, र आफ्नो ज्यान जोखिममा नपार्।"]
  ]},
  { ne: "त्यो रात नजिकिँदै", en: "The night draws near", clips: [
    ["V", "ST", "The technician arrives", "Hillside. The municipal technician measures the narrowed drain and the crack with a tape while Suman lays out the notebook and photos. Handheld two-shot, grey sky.", "प्राविधिक: तिमीले देखाएको ठाउँ जाँच गर्नुपर्ने रहेछ। अनुमानले होइन, थप निरीक्षणपछि निर्णय गर्छौँ।|सुमन: मलाई पनि त्यही चाहिएको हो सर।"],
    ["H", "AMS", "Maya leaves for the exam", "Morning. Saraswati packs food into Maya's bag in the yard; clouds darken; Maya hugs her, Suman gives her a small nod. Slow push-in.", "सरस्वती: खाना खान नबिर्स।|माया: चिन्ता नगर आमा।"],
    ["V", "SD", "The marker in the rain", "Heavy rain on the slope. Suman and Dhaniram keep their distance and look at the stake and crack from afar; the seepage is stronger. Long lens, slow push-in.", "धनिराम: आज चुहावट बढेको छ।|सुमन: यहाँ नउभिऔँ काका, टाढाबाटै हेरौँ।"],
    ["V", "SB", "Convincing the lower hamlet", "Lower hamlet, rain dripping from eaves. Suman and Bhim at a doorway; a villager refuses to leave his house. Handheld close-ups.", "गाउँले: हरेक वर्ष पानी पर्छ। घर छोडेर कहाँ जाने?|सुमन: जाँच नहुँदासम्म सुरक्षित ठाउँमा बसौँ।", "N", "new place: the lower hamlet"],
    ["W", "B", "The alarm", "Night. Bhim speaks into a loudspeaker on the ward veranda as lantern-lit families start walking uphill with bundles and children. Far away a low rumble of sliding earth; faces turn toward the dark hillside; the shot holds, then fades to black.", "भीमबहादुर: तल्लो बस्तीका सबै परिवार विद्यालयको चौरमा जानुहोस्!"]
  ]},
  { ne: "गाउँको परीक्षा", en: "The village's test", clips: [
    ["S", "B", "Gathering at the school ground", "Night, rain. Families huddle on the upper school ground under tarps; Bhim carries sacks himself and organizes. Handheld wide shot, lanterns and tarps.", "भीमबहादुर: बच्चा र वृद्धलाई पहिले भित्र लैजाऔँ।"],
    ["V", "SR", "Ramesh returns", "Rainy road. A soaked Ramesh with a bag arrives and finds Suman among the crowd. They clasp arms. Handheld two-shot.", "रमेश: म विदेश जान निस्केको, गाउँमै फसिएछु।|सुमन: अहिले जो जहाँ छ, त्यहीँबाट काम गरौँ।"],
    ["V", "SR", "Moving the animals", "Muddy lane. Suman and Ramesh coax cows and goats toward the community shed through the rain; a villager hesitates and then follows. Steady tracking shot.", "रमेश: ल, आज तेरो आदेश मान्छु।", "N", "new moment: moving the animals"],
    ["V", "ST", "A small slide", "Hillside in rain, wide. A section of earth slumps and mud slides toward the road; the technician shouts and Suman pulls a villager back as everyone steps to a safe line. Handheld, tense.", "प्राविधिक: सुरक्षित दूरीमा बस्नुहोस्! पानीलाई पुरानो निकासतिर मोड्न सकिन्छ।", "N", "new place: the hillside"],
    ["V", "SKD", "Opening the old outlet", "Villagers, Kedar's laborers and Dhaniram clear branches and silt from the old stone outlet; Suman points the line; water finds its path and rushes through. Low tracking shot, then a held frame on the running water.", "सुमन: सबै मिलेर तान्नुहोस्!"],
    ["S", "SB", "Dawn after the night", "Dawn, rain easing. Bhim sits down beside an exhausted Suman on a ground-level wall; the valley is wet and grey. Slow push-in on the two.", "भीमबहादुर: तँले समयमै कुरा नउठाएको भए…|सुमन: मैले मात्र गरेको होइन अध्यक्षज्यू। सबैले मिलेर गरेको हो।"],
    ["H", "SA", "Maya on the phone", "Dawn at home. Saraswati holds an old phone to her ear; the signal crackles; Suman leans in; Maya's far voice breaks in and out. Close handheld two-shot.", "माया (फोनमा): दाइ, म सुरक्षित छु। आमालाई भन्नुहोस्।"]
  ]},
  { ne: "कसैलाई सानो नसम्झ", en: "Never think anyone small", clips: [
    ["V", "S", "The morning after", "Mud-covered lane, a collapsed empty shed, villagers sweeping silt from doorways, tired and quiet, helping each other; Suman carries a basket of rubble. Slow wide pan. No dialogue."],
    ["W", "BK", "Taking responsibility", "Village meeting at the ward veranda. Bhim stands, removes his topi, and admits his part; Kedar follows, looking at the floor. Slow push-in on Bhim.", "भीमबहादुर: गल्ती ठेकेदारको मात्र होइन। मैले पनि कागज हेरेँ, जमिन हेरिनँ।|केदार: मैले लागत घटाएँ। त्यसको असर के पर्छ भनेर पर्याप्त सोचिनँ।"],
    ["W", "SDTBK", "A new committee", "The villagers form a circle: farmers, the technician, Bhimbahadur and Kedar among them, youth. Dhaniram speaks; Suman is invited to join and hesitates, then steps in. Handheld, warm light.", "धनिराम: अब दोष गनेर मात्र हुँदैन। अर्को वर्ष फेरि यही नहोस्।"],
    ["H", "SM", "Maya comes home", "Afternoon, the yard. Maya enters with her bag; the siblings face each other, then hug. Medium two-shot.", "माया: दाइ, गाउँको पानीको बाटो तिमीले देख्यौ। अब आफ्नो बाटो पनि खोज।|सुमन: खोज्दै छु। यसपालि भागेर होइन, बुझेर।"],
    ["H", "AB", "An apology to his widow", "The yard of the house. Bhim, hat in his hands, speaks to Saraswati; she looks at him for a long time, then gives a small nod. Slow push-in on the two.", "भीमबहादुर: तपाईंका श्रीमान्लाई हामीले समयमै सुनिदिएनौँ। माफ गर्नुहोला।"],
    ["C", "SL", "The last scene", "Days later. Suman repairs a small canal section; Bishal, the boy beside him, places a stone and watches the water turn, then looks up at Suman. Slow push-in on the two of them, held final frame.", "बालक: दाइ, यो ढुंगा राखेपछि पानी किन अर्कोतिर गयो?|सुमन: पानीलाई बाटो देखाइदिएको।|बालक: मान्छेलाई पनि बाटो देखाउन मिल्छ?|सुमन: मिल्छ। तर पहिले उसको कुरा सुन्नुपर्छ।"],
    ["C", "MRDBK", "The village goes on", "Slow pull-back from the canal water to reveal the village in its everyday life, the figures small in the wide frame: Maya with a book walking toward the school, Ramesh on the phone doing sums on a scrap of paper, Dhaniram working in his terrace field, Bhimbahadur and Kedar labouring with the repair crew. Sunlit, calm, hopeful. Final held wide frame. No dialogue.", "", "C", "pull-back continues from the canal shot"]
  ]}
];

const KAM_NALAGNE_TIMEWORD = /^(Night|Dusk|Morning|Dawn|Evening|Midnight|Late|Before|Back home|Days later|Flashback|Cold open|Afternoon|Quiet establishing)/i;
function kamNalagneContOf(e, c) {
  const k = KAM_NALAGNE_EPS[e].clips[c];
  if (k[5] === "C") return { cont: true, why: k[6] || "same place and moment" };
  if (k[5] === "N") return { cont: false, why: k[6] || "new setup" };
  if (c === 0) return { cont: false, why: "opening clip: build it from the references" };
  const p = KAM_NALAGNE_EPS[e].clips[c - 1];
  if (p[0] !== k[0]) return { cont: false, why: "new place" };
  if (KAM_NALAGNE_TIMEWORD.test(k[3]) || /flashback|flash-forward|cold open/i.test(k[2] + " " + k[3].slice(0, 90))) return { cont: false, why: "new time of day or a different look" };
  return { cont: true, why: "same place, same moment" };
}

function kamNalagneBuildPrompt(e, c, ar = "16:9", dur = "10s") {
  const k = KAM_NALAGNE_EPS[e].clips[c];
  const n = KAM_NALAGNE_EPS[e].clips.length;
  const lines = k[4] ? k[4].split("|") : [];
  const chars = [...k[1]].map(x => KAM_NALAGNE_CH[x]).join("\n\n") || "No people in frame.";
  const ct = kamNalagneContOf(e, c);
  const prev = ct.cont
    ? "CONTINUITY — CONTINUE FROM CLIP " + c + ": attach the final frame of clip " + c + " as the start frame and keep people, clothing, light, place and screen direction identical to it. Anyone newly arriving in this clip must match their reference image."
    : "CONTINUITY — NEW SETUP (" + ct.why + "): do not use a start frame. Build the shot fresh from the attached reference images (characters and place), with the clothing, light and look described here.";
  return "SHOT — clip " + (c + 1) + " of " + n + " in Episode " + (e + 1) + " (" + KAM_NALAGNE_EPS[e].en + "), one continuous 10-second live-action drama clip:\n" + k[3] + "\n\nCHARACTERS — match the reference images exactly:\n" + chars + "\n\n" + KAM_NALAGNE_LOC[k[0]] + "\n\nDIALOGUE (speak exactly as written, in Nepali):\n" + (lines.length ? lines.map(l => "• " + l).join("\n") : "None. Nobody speaks in this clip.") + "\n\n" + prev + "\n\n" + KAM_NALAGNE_STYLE + "\n\n" + KAM_NALAGNE_PACE + "\n\n" + KAM_NALAGNE_AUDIO + "\n\n" + kamNalagneFormat(ar, dur);
}

const KAM_NALAGNE_CLIPS = [];
KAM_NALAGNE_EPS.forEach((ep, e) => {
  ep.clips.forEach((clip, c) => {
    KAM_NALAGNE_CLIPS.push({
      epIndex: e,
      clipIndex: c,
      doneKey: `${e}-${c}`,
      epNe: ep.ne,
      epEn: ep.en,
      clip
    });
  });
});

function kamNalagnePromptFor(index, ar = "16:9", dur = "10s") {
  const item = KAM_NALAGNE_CLIPS[index];
  if (!item) return "";
  return kamNalagneBuildPrompt(item.epIndex, item.clipIndex, ar, dur);
}

function kamNalagneCharactersFor(index) {
  const item = KAM_NALAGNE_CLIPS[index];
  const codes = [...(item?.clip?.[1] || "")];
  return codes.map(code => ({
    code,
    name: KAM_NALAGNE_NAMES[code] || code,
    refPrompt: "Character reference: full-body front three-quarter view of " + (KAM_NALAGNE_REFS[code] || KAM_NALAGNE_CH[code] || code) + ". Plain pale background, entire body visible, natural light, photorealistic, authentic Nepali village drama costume, no text."
  }));
}
