const PURPLESTICK_META = {
  brand: "PurpleStick",
  niche: "Viral 2D Stickman Comedy Reels (9:16 Vertical)",
  title: "PurpleStick Comedy Reels",
  durationLabel: "30 viral 8–10s comedy skits",
  aspect: "9:16",
  styleName: "Clean 2D Vector Stickman Cartoon · Royal Purple Heads · Expressive Lip-Sync & Slapstick Reactions"
};

const PURPLESTICK_CATS = [
  { id: "all", label: "All Skits (30)" },
  { id: "couple", label: "Couple Comedy (1–8)" },
  { id: "school", label: "School & Teacher (9–14)" },
  { id: "dating", label: "Money & Dating (15–20)" },
  { id: "office", label: "Boss & Office (21–25)" },
  { id: "everyday", label: "Doctor & Everyday (26–30)" }
];

const PURPLESTICK_CHARS = {
  PURP_GUY: "PURP_GUY (PurpleStick Guy / Husband): Clean 2D vector cartoon stickman with a large perfectly round vibrant royal-purple (#8B3DFF) head, small cute spiky purple hair tuft on top, thick crisp black outlines, huge expressive white cartoon eyes with dynamic black pupils and eyebrows, animated lip-syncing mouth, and a thin solid black stickman body, arms, legs, and flat black oval feet.",
  PURP_GIRL: "PURP_GIRL (PurpleStick Girl / Wife): Clean 2D vector cartoon stickman with a large perfectly round vibrant royal-purple (#8B3DFF) head, sleek dark-brown/black cartoon ponytail (or flowing shoulder-length dark hair), cute curved eyelashes, glossy red-pink cartoon lips, huge expressive white eyes, thick crisp black outlines, and a thin solid black stickman body with expressive stick arms and legs.",
  PURP_TEACHER: "PURP_TEACHER (PurpleStick Teacher / Boss): Clean 2D vector cartoon stickman with a large round vibrant royal-purple (#8B3DFF) head, expressive furrowed eyebrows and big cartoon eyes, wearing a neat white collared dress shirt with a dark charcoal necktie over a thin black stickman body and legs, thick crisp black outlines.",
  WHITE_KID: "WHITE_KID (Cheeky Student / Friend): Clean 2D vector cartoon stickman with a slightly smaller round pure-white head, smug half-lidded expressive cartoon eyes, cheeky smirk, thick crisp black outlines, and a thin solid black stickman body and limbs.",
  OLD_RICH: "OLD_RICH (Rich Grandpa / Elder): Clean 2D vector cartoon stickman with a stylized cartoon older man's head (bald top, fluffy white side hair tufts, gentle laugh lines, warm expressive eyes), thick crisp black outlines, and a thin solid black stickman body and limbs.",
  PURP_DOC: "PURP_DOC (PurpleStick Doctor / Waiter): Clean 2D vector cartoon stickman with a large round vibrant royal-purple (#8B3DFF) head, glasses perched on face, big expressive white eyes, wearing a crisp white doctor coat with a black stethoscope (or neat server bowtie) over a thin black stickman body."
};

const PURPLESTICK_CHAR_NAMES = {
  PURP_GUY: "PurpleStick Guy",
  PURP_GIRL: "PurpleStick Girl",
  PURP_TEACHER: "PurpleStick Teacher/Boss",
  WHITE_KID: "Cheeky Student",
  OLD_RICH: "Rich Grandpa",
  PURP_DOC: "PurpleStick Pro"
};

const PURPLESTICK_LOCS = {
  LIVING_ROOM: "Clean 2D flat-vector cartoon living room: soft cream-beige sofa, framed minimalist mountain picture on a light off-white wall, tall floor lamp, wooden door and coffee table with TV remote in muted pastel tones so the vibrant royal-purple stickmen pop cleanly.",
  CLASSROOM: "Clean 2D flat-vector cartoon school classroom: large dark-green chalkboard with chalk tray and projector screen above, teacher's wooden desk, student desks, classroom globe, and soft cream walls in crisp cartoon outlines.",
  PARK: "Clean 2D flat-vector cartoon sunny park: bright sky-blue backdrop with fluffy white clouds, lush green cartoon trees, smooth green grass lawn, and a curved dirt path.",
  OFFICE: "Clean 2D flat-vector cartoon office: neat wooden executive desk with laptop, mug, and framed chart on a light pastel wall, office chair, and window blinds.",
  CAFE: "Clean 2D flat-vector cartoon cozy café: small round wooden table with two cups of coffee and a bill folder, warm pastel wall, framed menu board, and window.",
  CLINIC: "Clean 2D flat-vector cartoon doctor's clinic: clean examination table, wall eye-chart, medical cabinet, and soft mint-white walls.",
  BARBERSHOP: "Clean 2D flat-vector cartoon barbershop: barber chair, wall mirror, clippers and comb on counter, pastel striped accent wall."
};

const PURPLESTICK_MASTER_STYLE = "MASTER STYLE LOCK — Exact viral 2D Flash/vector stickman comedy animation (PurpleStick style) in crisp 9:16 vertical format. Thick clean uniform black outlines, flat cel-shaded cartoon colors, vibrant royal-purple (#8B3DFF) round stickman heads with HUGE hyper-expressive cartoon eyes, eyebrows, and accurate lip-syncing mouths on thin black stick bodies. Clean, uncluttered pastel 2D cartoon backgrounds. Snappy comedic animation timing: quick poses, smug eye-rolls, wide jaw-drop shock lines, sparkling heart-eyes, angry red steam, or dizzy spiral eyes on punchline.";

const PURPLESTICK_AUDIO_RULE = "AUDIO & VOICE LOCK — Clear, lively, natural American English cartoon voice acting with distinct expressive voices for each character (snappy female, deadpan/cocky male, cheeky kid, gruff boss, gentle old man). Deliver every dialogue line word-for-word with razor-sharp comedic timing and zero dead air. Include punchy cartoon sound effects (phone tap, dramatic gasp, cartoon slap/bonk, sparkle chime, record scratch, angry shout) and finish the final 1 second with a brief playful comedy rimshot / studio laugh sting.";

function purpleStickOverlayRule(includeOverlay) {
  if (!includeOverlay) {
    return "FRAME CLEANLINESS — Keep the 9:16 frame 100% clean with NO baked-in captions, NO subtitles, and NO watermark so bold yellow/white viral captions, the PurpleStick logo, and the laughing meme reaction clip can be added in CapCut.";
  }
  return "BRANDING & VIRAL CAPTIONS — Place a clean bold 'PurpleStick' logo in vibrant royal purple with crisp white/dark edge at top-center/top-right. Display big, bold, high-contrast centered lower-third subtitles synced to every spoken phrase, alternating bright yellow and crisp white text with thick black outlines (viral Facebook Reels comedy style).";
}

// [cat, who, loc, title, hook, dialogue (pipe-separated), visualAction, punchlineReaction, sfx, tags]
const RAW_PURPLESTICK_SKITS = [
  // ================= COUPLE COMEDY (1-8) =================
  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Husband's Brutal Diet Reply! 😂",
    "She thinks she's glowing... he names four fast-food chains.",
    "WIFE: Honey, my stomach is getting bigger, I think I'm expecting!|HUSBAND: Yeah, and I already know who the dads are.|WIFE: Excuse me?! Who?!|HUSBAND: McDonald's, Domino's, Subway, or KFC!|WIFE: WHAT?!",
    "0–2.5s: Wife stands beside the couch holding her belly nervously; Husband slouches on the sofa scrolling his phone. 2.5–4.5s: Husband glances up with smug half-lidded eyes; Wife gasps wide-eyed. 4.5–6.5s: Husband grins and counts on his fingers smugly. 6.5–8.5s: Wife's eyebrows snap down in fury, shouts 'WHAT?!' and delivers a fast cartoon slap.",
    "Cartoon slap impact burst! Husband flies back on the couch with dizzy spinning spiral eyes and phone flying out of his hand.",
    "Snappy sitcom voices, smug chuckle, loud cartoon SLAP sound, dizzy birdies chirp, quick laugh sting.",
    "#PurpleStick #stickman #stickmananimation #couplecomedy #funnyreels #viralreels #memes #LaughOutLoud"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Wife's Savage Boss Comeback! 😂",
    "He told his boss to get lost... she had another plan.",
    "WIFE: Honey, your boss called me today. He said you're fired.|HUSBAND: Oh yeah? Tell him to kiss my butt!|WIFE: Already handled it—I invited him for dinner and charmed him.|HUSBAND: Wait, what?!|WIFE: You start back Monday. You're welcome!",
    "0–2.5s: Both sit on the living room sofa; Wife looks gently concerned while telling him the news. 2.5–4.5s: Husband jumps up furiously, shaking his fist in anger. 4.5–7s: Wife flips to a sly, confident smirk, waving one hand casually. 7–8.5s: Husband freezes with a giant cartoon jaw-drop and comic shock lines bursting around his purple head.",
    "Giant wide-eyed cartoon jaw-drop freeze with white shock lines radiating around Husband's purple head.",
    "Concerned female voice, angry male yell, sly confident smirk tone, dramatic record-scratch + shock gasp, laugh sting.",
    "#PurpleStick #stickman #couplecomedy #funnyreels #viralreels #comedy #jokes #LaughOutLoud"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Do I Look Fat In This? 😂",
    "The most dangerous question in marriage history.",
    "WIFE: Be honest, honey. Does this dress make me look fat?|HUSBAND: Babe, don't blame the dress!|WIFE: Aww, really?!|HUSBAND: Yeah, the dress is doing its absolute best!|WIFE: YOU'RE DEAD!",
    "0–2.5s: Wife spins around happily in front of the couch asking earnestly. 2.5–4s: Husband puts down his phone, looking thoughtful and serious. 4–5.5s: Wife blushes with tiny hearts floating around her head. 5.5–8.5s: Husband smirks with deadpan honesty; Wife's eyes turn fiery red as she grabs a sofa pillow to whack him.",
    "Cartoon pillow-bonk explosion! Husband's head squashes flat with stars spinning around it.",
    "Sweet hopeful voice, deadpan male delivery, romantic chime interrupted by record scratch, huge cartoon BONK, laugh sting.",
    "#PurpleStick #stickman #husbandandwife #couplecomedy #funnyreels #viralreels #memes"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Husband's Wi-Fi Password Mistake! 😂",
    "She asked for the password... he got way too honest.",
    "WIFE: Babe, what's the new Wi-Fi password?|HUSBAND: 'YouSpendTooMuchMoney', all lowercase.|WIFE: Seriously?! Let me change it right now.|HUSBAND: To what?|WIFE: 'SleepOnTheCouchTonight'!",
    "0–2.5s: Wife taps her phone standing next to the sofa. 2.5–4.5s: Husband chuckles proudly, kicking his feet up on the coffee table. 4.5–7s: Wife narrows her eyes, types rapidly on her phone with an evil grin. 7–8.5s: She tosses a blanket and pillow directly onto Husband's face.",
    "Pillow slams into Husband's face; he peeks out wide-eyed and speechless.",
    "Phone tap clicks, cocky male laugh, fast typing SFX, triumphant female smirk, comic thud, laugh sting.",
    "#PurpleStick #stickman #stickmananimation #couplecomedy #wifehumor #funnyreels #viralreels"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "CAFE",
    "I'm Not Hungry, Don't Order For Me! 😂",
    "Every boyfriend knows this trap.",
    "HUSBAND: Sure you don't want fries?|WIFE: Nope, I'm on a strict diet. Not a single bite.|HUSBAND: Okay, cool.|WIFE: Wait... let me just taste one. And ten more.|HUSBAND: MY FRIES!",
    "0–2.5s: Sitting at a cozy café table; Wife waves her hand proudly refusing food. 2.5–4.5s: A giant golden basket of fries slides onto the table; Husband smiles happily. 4.5–7s: Wife's arm blurs like a cartoon vacuum cleaner stealing 90% of the fries in 2 seconds. 7–8.5s: Husband stares at one sad tiny fry left in the basket, eyes bulging in horror.",
    "Extreme zoom-in on Husband's horrified wide eyes staring at a single lonely french fry.",
    "Confident female voice, happy plate clink, rapid cartoon vacuum-slurp SFX, dramatic horror violin sting, laugh sting.",
    "#PurpleStick #stickman #couplecomedy #relatable #funnyreels #viralreels #foodie #memes"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Why Are You Ignoring Me?! 😂",
    "He finally mastered selective hearing.",
    "WIFE: Are you even listening to me?!|HUSBAND: Of course, babe. Every word.|WIFE: Then what did I just say?|HUSBAND: Uh... 'Are you even listening to me?'|WIFE: GET OUT!",
    "0–2.5s: Husband stares blankly at a game controller while Wife stands beside him with hands on hips. 2.5–5s: Wife crosses her arms, squinting suspiciously. 5–7s: Husband grins like a genius, giving a confident finger-gun. 7–8.5s: Wife erupts with cartoon anger veins and kicks him straight off the couch.",
    "Husband launches sideways off-frame with a cartoon whoosh and crash!",
    "Game bleeps, sharp female interrogation, confident finger-gun snap, cartoon angry roar + whoosh crash, laugh sting.",
    "#PurpleStick #stickman #couplecomedy #funnyreels #viralreels #husbandjokes #LaughOutLoud"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Her Secret Shopping Math! 😂",
    "Girl math just broke his calculator.",
    "HUSBAND: You spent $500 at the mall?!|WIFE: Relax! That dress was 50% off!|HUSBAND: That still means you spent $500!|WIFE: No, silly—it means I SAVED $500! So we're basically rich!|HUSBAND: Wait... what?!",
    "0–2.5s: Wife stands surrounded by five colorful shopping bags; Husband holds a long receipt looking faint. 2.5–5.5s: Wife waves her hands brightly with floating dollar-sign sparkles and total confidence. 5.5–8.5s: Floating math equations swirl around Husband's purple head as his brain short-circuits with smoke puffing out his ears.",
    "Cartoon math symbols spin around Husband's dizzy purple head while little puffs of steam pop from his ears.",
    "Panicked male voice, cheerful bubbly female logic, cash register cha-ching, dial-up brain glitch SFX, laugh sting.",
    "#PurpleStick #stickman #girlmath #couplecomedy #funnyreels #viralreels #memes"],

  ["couple", ["PURP_GUY", "PURP_GIRL"], "LIVING_ROOM",
    "Who's The Boss Of This House?! 😂",
    "He talked big... for exactly two seconds.",
    "HUSBAND: Listen! I wear the pants in this house!|WIFE: Oh really? And who picked those pants out for you?|HUSBAND: ...You did, honey.|WIFE: And who told you when you can wear them?|HUSBAND: Yes ma'am, sorry ma'am!",
    "0–2.5s: Husband puffs out his stick-chest proudly, thumping it like a hero. 2.5–5s: Wife slowly leans in with one raised eyebrow and laser-calm stare. 5–8.5s: Husband instantly shrinks down to half-size on the sofa, sweating nervously and saluting her politely.",
    "Husband shrinks cartoonishly small with giant sweat drops and gives a trembling salute.",
    "Booming heroic male voice, icy calm female voice, balloon-deflating whistle SFX, meek squeaky apology, laugh sting.",
    "#PurpleStick #stickman #couplecomedy #marriagehumor #funnyreels #viralreels #LaughOutLoud"],

  // ================= SCHOOL & TEACHER (9-14) =================
  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "Who Is Stupid?! 😂",
    "The classic classroom name-trap that broke the teacher.",
    "STUDENT: Sir, if my name is 'Me' and your name is 'You', then who is stupid?|TEACHER: You!|STUDENT: But sir... my name is 'Me'!|TEACHER: GET OUT OF MY CLASS!",
    "0–3s: Classroom chalkboard backdrop. Cheeky white-headed Student stands left gesturing innocently; tall PurpleStick Teacher in white shirt & tie listens calmly on right. 3–4.5s: Teacher replies 'You!' with a smug grin. 4.5–6s: Student smirks half-lidded and taps his chest: 'But sir, my name is Me!' 6–8.5s: Teacher's purple face turns furious, brows jagged, pointing aggressively at the door while Student flees in panic.",
    "Teacher points dramatically toward the door with fiery anger lines while Student scrambles backward wide-eyed!",
    "Cheeky kid voice, stern teacher voice, sudden realization pause, explosive angry shout, quick laugh sting.",
    "#PurpleStick #stickman #schoolcomedy #teacherandstudent #funnyreels #viralreels #jokes #LaughOutLoud"],

  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "Why Didn't You Do Homework?! 😂",
    "The smoothest excuse in classroom history.",
    "TEACHER: Where is your homework?!|STUDENT: Sir, I didn't want to hurt the environment.|TEACHER: What does that have to do with homework?!|STUDENT: Saving paper saves trees, sir!|TEACHER: GET OUT!",
    "0–2.5s: PurpleStick Teacher taps his wooden desk impatiently in front of the green chalkboard. 2.5–5s: Cheeky Student folds his hands innocently like an angel, a tiny glowing halo popping above his head. 5–7s: Student smiles proudly with sparkle eyes. 7–8.5s: Teacher's halo shatters in rage as he shouts and points straight out the classroom door.",
    "Student's fake angel halo cracks as Teacher roars with steam shooting out of his purple head!",
    "Strict teacher voice, innocent angelic choir chime, cheeky kid tone, glass-shatter + angry yell, laugh sting.",
    "#PurpleStick #stickman #schooljokes #stickmananimation #funnyreels #viralreels #comedy"],

  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "100% Genius Math Answer! 😂",
    "He technically isn't wrong...",
    "TEACHER: If you have 10 chocolates and I ask for 5, how many are left?|STUDENT: 10, sir!|TEACHER: How is it 10?!|STUDENT: Because I'm not giving you any!|TEACHER: OUT OF MY CLASS!",
    "0–3s: PurpleStick Teacher holds up fingers by the chalkboard quizzing the Student. 3–4.5s: Student answers instantly with total confidence. 4.5–6.5s: Teacher blinks confused; Student crosses his arms with a rock-solid smug grin. 6.5–8.5s: Teacher's tie flips up in shock and rage as he points to the exit.",
    "Teacher's eyes bulge huge with rage lines while Student struts toward the door like a boss.",
    "Teacher quiz tone, instant confident kid reply, record scratch, angry teacher shout, laugh sting.",
    "#PurpleStick #stickman #mathjoke #schoolcomedy #funnyreels #viralreels #memes"],

  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "Sleeping In Class Caught! 😂",
    "He turned getting caught into a roast.",
    "TEACHER: Hey! Why are you sleeping in my class?!|STUDENT: Sir, your voice is so peaceful!|TEACHER: Aww, really?|STUDENT: Yeah, better than sleeping pills!|TEACHER: PRINCIPAL'S OFFICE, NOW!",
    "0–2.5s: Student snores at his desk with cartoon 'Zzz' bubbles; PurpleStick Teacher stomps over angrily. 2.5–5s: Student rubs his eyes and flatters him sweetly; Teacher blushes shyly with cute sparkles. 5–8.5s: Student drops the punchline with a sleepy yawn; Teacher turns volcanic angry and points violently at the door.",
    "Teacher's blush instantly turns into an angry comic explosion with jagged shock lines!",
    "Cartoon snore, loud desk slam, sweet sparkle chime, sleepy kid yawn, angry shout, laugh sting.",
    "#PurpleStick #stickman #classroomcomedy #funnyreels #viralreels #schoollife #LaughOutLoud"],

  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "Why Are You Late Today?! 😂",
    "He blamed the road sign and won.",
    "TEACHER: Why are you 30 minutes late?!|STUDENT: Because of the sign on the road, sir!|TEACHER: What sign?!|STUDENT: 'School Ahead, Go Slow!'|TEACHER: GET OUT!",
    "0–2.5s: PurpleStick Teacher taps his wristwatch furiously as Student casually strolls into the classroom. 2.5–5s: Student shrugs innocently, gesturing outside. 5–7s: Student points upward proudly as if following the law. 7–8.5s: Teacher facepalms so hard his whole stick body vibrates, then yells 'GET OUT!'",
    "Teacher does an epic cartoon facepalm with a loud smack, then points furiously at the door!",
    "Tapping watch ticks, innocent kid shrug, dramatic pause, loud cartoon facepalm smack + shout, laugh sting.",
    "#PurpleStick #stickman #schoolcomedy #funnyreels #viralreels #jokes #memes"],

  ["school", ["WHITE_KID", "PURP_TEACHER"], "CLASSROOM",
    "Name One Past Tense Verb! 😂",
    "Grammar lesson turned into emotional damage.",
    "TEACHER: Give me a sentence in the past tense!|STUDENT: Yesterday I had a girlfriend.|TEACHER: Good! Now future tense!|STUDENT: Tomorrow I'll be rich and she'll regret it!|TEACHER: ...Respect. Sit down.",
    "0–2.5s: PurpleStick Teacher holds chalk at the green chalkboard; Student stands confidently. 2.5–5.5s: Student puts on pixelated cool sunglasses sliding down onto his face as he delivers the future-tense line. 5.5–8.5s: Teacher freezes, slowly nods with impressed respect, and gives him a slow clap.",
    "Sunglasses drop onto Student's face while Teacher nods deeply and gives an impressed thumbs-up!",
    "Classroom chalk tap, confident kid delivery, cool bass-drop sunglasses SFX, impressed slow clap, laugh sting.",
    "#PurpleStick #stickman #grammarjoke #funnyreels #viralreels #comedy #LaughOutLoud"],

  // ================= MONEY & DATING (15-20) =================
  ["dating", ["OLD_RICH", "PURP_GIRL"], "PARK",
    "You Are So Young! 😂",
    "Age is just a number... especially with six zeroes.",
    "GRANDPA: Will you marry me?|GIRL: Seriously?! How old are you?!|GRANDPA: 75... 75 million US dollars!|GIRL: REALLY?! Oh baby, you are SO young!",
    "0–2.5s: Sunny green park. Rich Grandpa kneels on one knee holding up a sparkling diamond ring box; PurpleStick Girl crosses her arms disgusted. 2.5–4.5s: Grandpa smiles slyly, raising one finger: '75...' then adds '$75 million US dollars!' 4.5–6.5s: Quick close-up on PurpleStick Girl as pink floating hearts explode behind her and her eyes turn into giant glittering starry anime eyes! 6.5–8.5s: She leaps into Grandpa's arms kissing his cheek while Grandpa gives a smug side-eye wink at the camera.",
    "Giant floating pink hearts & starry sparkle eyes! Girl hugs Grandpa joyfully while he smirks proudly at the camera.",
    "Gentle old man voice, disgusted female scoff, magical harp sparkle chime on '$75 million', joyful giggle + kiss pop, laugh sting.",
    "#PurpleStick #stickman #stickmananimation #comedy #jokes #funnyreels #viralreels #datinghumor"],

  ["dating", ["PURP_GUY", "PURP_GIRL"], "CAFE",
    "Who's Paying The Bill?! 😂",
    "The fastest fake phone call in history.",
    "GIRL: That dinner was amazing! Ready for the check?|GUY: Wait—I believe in 50/50 equality!|GIRL: Oh, totally!|GUY: Great, you pay 50%... and your dad pays the other 50%!|GIRL: EXCUSE ME?!",
    "0–2.5s: Cozy café table with empty plates and a leather bill folder. Girl smiles sweetly. 2.5–5s: PurpleStick Guy holds up a heroic finger lecturing about equality; Girl nods warmly. 5–7s: Guy slides the entire bill folder smoothly across the table to her with a cheeky grin. 7–8.5s: Girl's hair spikes up in cartoon shock as she splashes water from her cup at him.",
    "Water splash freezes mid-air as Guy ducks with wide panicked eyes!",
    "Pleasant café clink, heroic male speech, smooth table slide, record scratch + cartoon water splash, laugh sting.",
    "#PurpleStick #stickman #datingcomedy #funnyreels #viralreels #comedy #memes"],

  ["dating", ["PURP_GUY", "PURP_GIRL"], "PARK",
    "She Asked About His Car! 😂",
    "Wait until she hears what he actually drives.",
    "GIRL: So, what kind of car do you drive?|GUY: A brand new $300,000 Mercedes!|GIRL: OMG! Take me for a ride right now!|GUY: Sure! Hop on—my bus route starts at 5 PM!|GIRL: A BUS?!",
    "0–2.5s: Walking in the sunny park; Girl twirls her ponytail looking impressed. 2.5–5s: Guy puffs up proudly; Girl's eyes turn into giant sparkling hearts! 5–7.5s: Guy pulls out a bus driver's cap and puts it on his purple head with a cheerful grin. 7.5–8.5s: Girl's heart-eyes shatter into pieces as her jaw drops to the grass.",
    "Pink hearts shatter like glass as Girl's jaw drops cartoonishly to the ground!",
    "Flirty female voice, proud male brag, magical sparkle chime, bus horn HONK + glass shatter, laugh sting.",
    "#PurpleStick #stickman #datingjokes #plotwist #funnyreels #viralreels #LaughOutLoud"],

  ["dating", ["PURP_GUY", "PURP_GIRL"], "CAFE",
    "Love Or Money?! 😂",
    "She didn't even hesitate for half a second.",
    "GUY: Be honest—if I lost all my money, would you still love me?|GIRL: Of course, baby! I'd love you forever!|GUY: Aww, really?!|GIRL: Yes... and I'd miss you SO much!|GUY: WAIT WHAT?!",
    "0–2.5s: Across the café table, PurpleStick Guy holds her hands tenderly looking deeply into her eyes. 2.5–5s: Girl smiles warmly; Guy blushes with floating hearts. 5–7s: Girl waves goodbye sweetly while sliding her chair back toward the exit. 7–8.5s: Guy's eyes bulge out of his purple head in total betrayal!",
    "Guy's heart cracks in half on screen with giant cartoon shock lines!",
    "Romantic soft violin, sweet female reassurance, record scratch, cheeky goodbye wave, dramatic betrayal gasp, laugh sting.",
    "#PurpleStick #stickman #datinghumor #couplecomedy #funnyreels #viralreels #memes"],

  ["dating", ["PURP_GUY", "PURP_GIRL"], "PARK",
    "Her Red Flag Detector! 😂",
    "One question ended the whole date.",
    "GIRL: Tell me honestly, what's your biggest flaw?|GUY: Sometimes I'm way too honest.|GIRL: Oh, I don't think honesty is a flaw!|GUY: I don't really care what you think.|GIRL: EXCUSE ME?!",
    "0–2.5s: Sitting on a park bench; Girl smiles warmly asking a get-to-know-you question. 2.5–5s: Guy looks thoughtful and polite; Girl nods approvingly. 5–7s: Guy replies completely deadpan without blinking. 7–8.5s: Girl freezes in disbelief, eyes wide as saucers, then smacks him with her purse!",
    "Cartoon purse-smack with a big POW star burst! Guy tumbles off the bench with dizzy eyes.",
    "Friendly date chatter, deadpan flat male delivery, awkward cricket chirp, loud purse BONK, laugh sting.",
    "#PurpleStick #stickman #firstdate #funnyreels #viralreels #comedy #jokes"],

  ["dating", ["OLD_RICH", "PURP_GIRL"], "CAFE",
    "The Millionaire's Secret Test! 😂",
    "She thought she played him... he played chess.",
    "GIRL: Sweetheart, buy me a designer bag!|GRANDPA: Anything for you! Here's my credit card.|GIRL: Yay!! Wait... why does it say 'Declined'?!|GRANDPA: Because I only pay for real love, sweetie!|GIRL: NOOO!",
    "0–2.5s: At the café table, PurpleStick Girl bats her eyelashes cutely; Rich Grandpa calmly hands over a shiny gold card. 2.5–5s: Girl cheers with starry eyes, taps it on a card reader—loud red 'DECLINED' buzzer flashes! 5–8.5s: Grandpa puts on cool dark sunglasses and sips his espresso smugly while Girl screams in cartoon meltdown.",
    "Grandpa calmly sips coffee in cool shades while Girl's head turns red with cartoon shock lines!",
    "Cute pleading voice, shiny card chime, harsh game-show BUZZER, smooth cool grandpa chuckle, laugh sting.",
    "#PurpleStick #stickman #golddigger #plottwist #funnyreels #viralreels #LaughOutLoud"],

  // ================= BOSS & OFFICE (21-25) =================
  ["office", ["PURP_GUY", "PURP_TEACHER"], "OFFICE",
    "Boss Caught Him Leaving Early! 😂",
    "The boldest comeback ever said to a boss.",
    "BOSS: Hey! You came in two hours late today!|EMPLOYEE: True, boss.|BOSS: And now you're leaving two hours early?!|EMPLOYEE: Well, I didn't want to be late twice in one day!|BOSS: YOU'RE FIRED!",
    "0–2.5s: Office desk. PurpleStick Boss in shirt and tie points angrily at the wall clock; PurpleStick Guy holds his backpack calmly. 2.5–5.5s: Guy nods with totally sincere, innocent logic. 5.5–8.5s: Boss's eyes pop wide open in disbelief, face steaming as he yells 'YOU'RE FIRED!' while Guy cheerfully waves goodbye.",
    "Boss's purple head vibrates with angry steam while Guy strolls happily out the door!",
    "Angry boss voice, calm logical employee voice, comic blink silence, explosive boss yell, laugh sting.",
    "#PurpleStick #stickman #officehumor #bossandemployee #funnyreels #viralreels #workmemes"],

  ["office", ["PURP_GUY", "PURP_TEACHER"], "OFFICE",
    "Asking Boss For A Raise! 😂",
    "He had four companies chasing him...",
    "EMPLOYEE: Boss, I need a raise! Four companies are after me!|BOSS:Whoa, really?! Which companies?!|EMPLOYEE: Electric, Water, Gas, and Internet!|BOSS: GET BACK TO WORK!",
    "0–2.5s: PurpleStick Guy leans confidently over the executive desk; Boss sits up nervously sweating. 2.5–5s: Boss leans forward impressed and worried. 5–7s: Guy counts on his fingers with a deadpan sigh. 7–8.5s: Boss slams both hands on the desk shouting while Guy sprints back to his cubicle.",
    "Boss slams the desk so hard his coffee mug jumps into the air!",
    "Confident employee voice, panicked boss gulp, deadpan bill list, loud desk slam + yell, laugh sting.",
    "#PurpleStick #stickman #officecomedy #workjokes #funnyreels #viralreels #LaughOutLoud"],

  ["office", ["PURP_GUY", "PURP_TEACHER"], "OFFICE",
    "Boss's New Lamborghini Joke! 😂",
    "Corporate motivation hits different.",
    "EMPLOYEE: Boss, your new Lamborghini is insane!|BOSS: Thanks! If you work overtime all year and never take a break...|EMPLOYEE: I can buy one too?!|BOSS: No, I can buy a SECOND one!|EMPLOYEE: WHAT?!",
    "0–2.5s: Standing by the office window; PurpleStick Guy admires outside with starry eyes. 2.5–5.5s: Boss puts a warm mentor hand on his shoulder; Guy's eyes sparkle with hope and motivation! 5.5–8.5s: Boss grins slyly dropping the punchline; Guy's starry eyes shatter into pure jaw-drop shock.",
    "Guy freezes with a gigantic jaw-drop and comic shock lines while Boss winks proudly!",
    "Excited employee voice, inspiring motivational music swell, record scratch on punchline, shock gasp, laugh sting.",
    "#PurpleStick #stickman #corporatehumor #bossjokes #funnyreels #viralreels #memes"],

  ["office", ["PURP_GUY", "PURP_TEACHER"], "OFFICE",
    "Job Interview Gone Wrong! 😂",
    "He answered the 5-year question too well.",
    "BOSS: Where do you see yourself in five years?|EMPLOYEE: Honestly? Sitting in your chair.|BOSS: Oh, ambitious! Wanting my job?|EMPLOYEE: No, I just really like this chair. It's comfy!|BOSS: NEXT!",
    "0–2.5s: Executive office interview. Boss steeples his fingers seriously across the desk. 2.5–5s: Boss nods impressed with a proud smile. 5–7.5s: Guy leans over and pats the leather office chair lovingly. 7.5–8.5s: Boss instantly presses a big red trapdoor/next button and yells 'NEXT!'",
    "Boss slaps a giant red desk buzzer while Guy gets comically yanked backward out of frame!",
    "Serious interview tone, impressed hmm, goofy honest reply, loud red buzzer + cartoon slide whistle, laugh sting.",
    "#PurpleStick #stickman #jobinterview #officecomedy #funnyreels #viralreels #comedy"],

  ["office", ["PURP_GUY", "PURP_TEACHER"], "OFFICE",
    "Calling In Sick To Work! 😂",
    "Worst sick-leave excuse ever.",
    "BOSS: You said you're too sick to work today?!|EMPLOYEE: Cough—yes boss, I'm in bed dying!|BOSS: Then why are you standing right behind me at the beach?!|EMPLOYEE: ...Doctor prescribed vitamin D?|BOSS: YOU'RE FIRED!",
    "0–2.5s: Split/reveal vibe—PurpleStick Guy holds a phone to his ear faking a dramatic cough while wearing sunglasses and holding a coconut drink! 2.5–5.5s: Camera pulls back revealing PurpleStick Boss standing right in front of him in swim trunks, glaring. 5.5–8.5s: Guy sips his coconut nervously; Boss explodes yelling 'YOU'RE FIRED!'",
    "Guy nervously slurps his coconut straw with huge sweat drops as Boss blows his top!",
    "Fake theatrical cough, tropical seagull SFX, dramatic zoom reveal, loud straw slurp + angry boss yell, laugh sting.",
    "#PurpleStick #stickman #workcomedy #sickday #funnyreels #viralreels #LaughOutLoud"],

  // ================= DOCTOR & EVERYDAY (26-30) =================
  ["everyday", ["PURP_GUY", "PURP_DOC"], "CLINIC",
    "Doctor's Shocking Memory Cure! 😂",
    "This doctor knows how to get paid.",
    "PATIENT: Doctor, I have a terrible problem—I forget everything!|DOCTOR: Hmm, since when?|PATIENT: Since when what?|DOCTOR: Alright... please pay in advance!|PATIENT: WAIT WHAT?!",
    "0–2.5s: Clean cartoon clinic. PurpleStick Guy sits on the exam table looking worried; PurpleStick Doctor in white coat & stethoscope takes notes seriously. 2.5–5s: Guy blinks completely blankly with a floating question mark over his head. 5–8.5s: Doctor instantly holds out a giant credit card machine with a sly grin; Guy stares wide-eyed.",
    "Doctor whips out a giant glowing card reader while Guy freezes in confused shock!",
    "Worried patient voice, thoughtful doctor hmm, cartoon blink pop, cash-register ding, laugh sting.",
    "#PurpleStick #stickman #doctorjokes #funnyreels #viralreels #comedy #memes"],

  ["everyday", ["PURP_GUY", "PURP_DOC"], "BARBERSHOP",
    "Barber Destroyed His Haircut! 😂",
    "Every guy has felt this exact pain.",
    "BARBER: So, how do you want your haircut today?|GUY: Just a tiny trim off the top, please.|BARBER: Say no more! *BZZZZT!* All done!|GUY: ...You shaved me completely bald!|BARBER: That'll be $40!",
    "0–2.5s: Barbershop chair; PurpleStick Guy sits happily with his signature purple hair tuft. 2.5–5s: Barber grins with electric clippers—one fast cartoon blur *BZZZZT*—and Guy's hair tuft vanishes, leaving his purple head shiny as a bowling ball! 5–8.5s: Guy looks in the mirror in silent horror as a sparkle glints off his bald head; Barber cheerfully holds out his hand for cash.",
    "Bright cartoon shine gleams off Guy's completely bald purple head while he stares in pure horror!",
    "Cheerful barber voice, loud electric clipper BZZZZT, dramatic horror chord, shiny sparkle ding, laugh sting.",
    "#PurpleStick #stickman #barbershop #haircutfail #funnyreels #viralreels #relatable"],

  ["everyday", ["PURP_GUY", "PURP_DOC"], "CLINIC",
    "Doctor, It Hurts Everywhere! 😂",
    "The cheapest diagnosis in medical history.",
    "PATIENT: Doc, when I touch my knee, it hurts! Touch my head, hurts! Touch my arm, hurts!|DOCTOR: Let me check... yup, I know what's wrong!|PATIENT: Is it serious?!|DOCTOR: Your finger is broken!|PATIENT: OH!",
    "0–3s: PurpleStick Guy pokes his knee, head, and arm wincing in cartoon pain ('Ow! Ow! Ow!'). 3–5.5s: Doctor adjusts his glasses gravely; Guy trembles terrified. 5.5–8.5s: Doctor points at Guy's crooked bandaged-looking index finger; Guy stares at his own finger with a hilarious blank realization.",
    "Zoom in on Guy staring at his own bent finger with wide-eyed comic realization!",
    "Quick 'ow-ow-ow' yelps, dramatic medical suspense chord, deadpan doctor reveal, funny 'OH!' + laugh sting.",
    "#PurpleStick #stickman #doctorcomedy #jokes #funnyreels #viralreels #LaughOutLoud"],

  ["everyday", ["PURP_GUY", "PURP_DOC"], "CAFE",
    "Waiter, There's A Fly In My Soup! 😂",
    "Customer service level: 1000.",
    "CUSTOMER: Waiter! There's a fly swimming in my soup!|WAITER: Shhh! Keep your voice down, sir!|CUSTOMER: Why?!|WAITER: Otherwise everyone else will want one too!|CUSTOMER: EXCUSE ME?!",
    "0–2.5s: Cozy café table. PurpleStick Guy points in horror at a tiny cartoon fly doing backstroke in his soup bowl. 2.5–5.5s: PurpleStick Waiter with bowtie leans in whispering nervously and checking around the room. 5.5–8.5s: Waiter smiles proudly at his genius logic; Guy's jaw drops and the tiny fly waves at him.",
    "Guy's jaw drops wide open while the tiny fly in the soup bowl gives a cheeky wave!",
    "Disgusted customer gasp, sneaky whispered waiter voice, tiny cartoon splash, record scratch + shock gasp, laugh sting.",
    "#PurpleStick #stickman #restaurantjokes #funnyreels #viralreels #comedy #memes"],

  ["everyday", ["PURP_GUY", "PURP_GIRL"], "PARK",
    "He Found A Magic Lamp! 😂",
    "Be careful what you wish for...",
    "GUY: Genie! I wish to be surrounded by beautiful women who never leave me alone!|WIFE: POOF! Wish granted!|GUY: Wait—why did I turn into a chocolate bar?!|WIFE: Because every girl loves chocolate!|GUY: NOOO!",
    "0–2.5s: Sunny park; PurpleStick Guy rubs a glowing golden lamp with a cocky dream-big grin. 2.5–5s: Giant puff of purple magic smoke *POOF!* 5–8.5s: Smoke clears revealing Guy transformed into a giant cartoon chocolate bar with his purple stickman eyes panicking, as five PurpleStick girls sprint toward him with starry eyes!",
    "Guy-as-a-chocolate-bar screams wide-eyed while starry-eyed girls chase him across the park!",
    "Magical shimmer chime, dramatic POOF explosion, panicked cartoon scream, fast cartoon running footsteps, laugh sting.",
    "#PurpleStick #stickman #geniejoke #plottwist #funnyreels #viralreels #LaughOutLoud"]
];

const PURPLESTICK_CLIPS = RAW_PURPLESTICK_SKITS.map(([cat, who, loc, title, hook, line, visual, reaction, sfx, tags], idx) => {
  const num = idx + 1;
  const charList = who.map(c => PURPLESTICK_CHAR_NAMES[c] || c).join(" & ");
  const dialogueLines = line.split("|").join("\n");
  const cap = `${title}\n\n${hook}\n\nTag someone who needs to see this! 😂👇\nFollow @PurpleStick for daily stickman comedy!\n\n${tags}`;
  return {
    num,
    cat,
    who,
    loc,
    title,
    hook,
    line,
    dialogueLines,
    visual,
    reaction,
    sfx,
    tags,
    charList,
    cap
  };
});

function purpleStickPromptFor(i, ar = "9:16", dur = "10s", includeOverlay = true) {
  const c = PURPLESTICK_CLIPS[i];
  if (!c) return "";
  return [
    `GOOGLE FLOW 2D STICKMAN COMEDY PROMPT — "PURPLESTICK" — SKIT #${c.num}/${PURPLESTICK_CLIPS.length}: ${c.title}`,
    `CHARACTERS — keep approved PurpleStick designs strictly consistent:\n${c.who.map(code => PURPLESTICK_CHARS[code]).join("\n")}`,
    `BACKGROUND SET: ${PURPLESTICK_LOCS[c.loc]}`,
    `EXACT ENGLISH DIALOGUE (deliver word-for-word with expressive cartoon lip-sync and razor-sharp comedic timing):\n${c.dialogueLines}`,
    `ANIMATION & ACTION TIMELINE (${dur}): ${c.visual}`,
    `PUNCHLINE REACTION FINALE: ${c.reaction}`,
    `SOUND EFFECTS & AUDIO: ${c.sfx}`,
    PURPLESTICK_MASTER_STYLE,
    PURPLESTICK_AUDIO_RULE,
    purpleStickOverlayRule(includeOverlay),
    `FORMAT: ${ar === "16:9" ? "16:9 wide" : "9:16 vertical Facebook Reels / TikTok / YouTube Shorts"} framing. Exactly ${dur}, crisp 2D vector cartoon animation, high-energy viral comedy pacing.`
  ].join("\n\n");
}

function purpleStickCustomPrompt({ title, charA, charB, loc, dialogue, reaction, ar = "9:16", dur = "10s", includeOverlay = true }) {
  const who = [charA, charB].filter(Boolean);
  return [
    `GOOGLE FLOW 2D STICKMAN COMEDY PROMPT — "PURPLESTICK" — CUSTOM SKIT: ${title || "PurpleStick Comedy Skit"}`,
    `CHARACTERS — keep approved PurpleStick designs strictly consistent:\n${who.map(code => PURPLESTICK_CHARS[code] || code).join("\n")}`,
    `BACKGROUND SET: ${PURPLESTICK_LOCS[loc] || PURPLESTICK_LOCS.LIVING_ROOM}`,
    `EXACT ENGLISH DIALOGUE (deliver word-for-word with expressive cartoon lip-sync and razor-sharp comedic timing):\n${dialogue}`,
    `PUNCHLINE REACTION FINALE: ${reaction || "Giant wide-eyed cartoon jaw-drop freeze with white shock lines radiating around the purple head and a quick laugh sting."}`,
    PURPLESTICK_MASTER_STYLE,
    PURPLESTICK_AUDIO_RULE,
    purpleStickOverlayRule(includeOverlay),
    `FORMAT: ${ar === "16:9" ? "16:9 wide" : "9:16 vertical Facebook Reels / TikTok / YouTube Shorts"} framing. Exactly ${dur}, crisp 2D vector cartoon animation, high-energy viral comedy pacing.`
  ].join("\n\n");
}

function purpleStickCharactersFor(i) {
  const who = Array.isArray(PURPLESTICK_CLIPS[i]?.who) ? PURPLESTICK_CLIPS[i].who : [];
  return who.map(code => ({
    code,
    name: PURPLESTICK_CHAR_NAMES[code] || code,
    refPrompt: `Character reference: clean full-body 2D vector cartoon stickman character turnaround sheet of ${PURPLESTICK_CHARS[code] || code} Plain clean white background, thick crisp black outlines, vibrant royal-purple (#8B3DFF) round head (unless specified otherwise), huge expressive eyes showing happy, smug, shocked, and angry expressions, no text.`
  }));
}
