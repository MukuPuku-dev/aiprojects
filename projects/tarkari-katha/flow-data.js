const TARKARI_ACTS = [
  { id: "all", label: "All Acts (40)" },
  { id: "act1", label: "Act I · Basket Blues (1–11)", grade: "warm morning kitchen sunbeams, floating flour & masala dust motes, cozy golden-amber rim light, tactile macro textures" },
  { id: "act2", label: "Act II · Great Kitchen Escape (12–19)", grade: "high-contrast dramatic countertop shadows, glistening soap-bubble reflections, gleaming brass and steel highlights, dynamic handheld macro energy" },
  { id: "act3", label: "Act III · Monsoon Rooftop Crisis (20–27)", grade: "cool slate-blue monsoon rain, dramatic lightning rim-glow, splashing macro crystal raindrops, wet stone reflections" },
  { id: "act4", label: "Act IV · The Cracked Pot & Sprout of Hope (28–34)", grade: "soft misty dawn lavender-grey warming into tender emerald and honey-gold sunlight, intimate macro bokeh" },
  { id: "act5", label: "Act V · The Rooftop Garden Family (35–40)", grade: "radiant golden-hour Himalayan sunrise, sparkling morning dewdrops, lush vibrant greens and ruby reds, joyous cinematic glow" }
];

const TARKARI_CHARS = {
  ALU: "AALU (Potato, 20s): Plump, endearing Pahadi brown potato with textured soil-flecked matte skin, two tiny bright-green sprout leaves on top of his head like messy hair, big soulful warm-brown eyes, stubby root hands and feet, and a tiny crisscross bandage on his left cheek. Humble, self-conscious about being round and 'ordinary', but fiercely loyal.",
  GOLBHEDA: "GOLBHEDA (Tomato, 20s): Glossy, plump ruby-red tomato with translucent dewy skin, a jaunty five-pointed green calyx stem worn like a French beret on her head, big expressive sparkling eyes with long lashes, and tiny vine-tendril hands. Dramatic, perfectionist diva terrified of getting squished or wrinkled, with a secretly tender heart.",
  PYAAJ: "PYAAJ (Onion, 30s): Round purple-pink onion wearing a slightly peeling papery outer tunic, a neat pointed dry-stem top-knot, tiny round wire-rim spectacles perched on his nose, and watery empathetic eyes. Gentle poet who accidentally makes everyone cry whenever he gets emotional or peels a layer.",
  KHURSANI: "KHURSANI (Chili, teen): Sleek, curved, glossy emerald-green Nepali Akabare/hariyo chili pepper with a curved green stem ponytail, sharp determined eyebrows, and tiny puffs of white steam whistling from his ears when angry. Short-tempered, fearless protector.",
  LASUN: "LASUN (Garlic Baaje, 60s): Weathered ivory-white garlic bulb elder with a wispy dried-root white beard, kind crinkled eyes, papery shawl layers, holding a tiny cinnamon-stick walking staff. Calm, philosophical mentor."
};

const TARKARI_CHAR_NAMES = {
  ALU: "Aalu",
  GOLBHEDA: "Golbheda",
  PYAAJ: "Pyaaj",
  KHURSANI: "Khursani",
  LASUN: "Lasun"
};

const TARKARI_LOCS = {
  NANGLO_BASKET: "Macro view inside a woven bamboo nanglo basket on a rustic wooden Nepali kitchen counter; giant brass karahi, clay spice jars, a shiny steel spoon, and dusty morning sunbeams in soft background bokeh.",
  COUNTER_CANYON: "Towering kitchen countertop canyon seen from a 2-inch vegetable perspective: a gleaming steel sink river with iridescent soap-bubble cliffs, a wooden chopping-board bridge, spice jars, and hanging garlic braids.",
  ROOFTOP_STORM: "Rain-lashed brick rooftop terrace (kausi) in Kathmandu during a monsoon shower; giant splashing raindrops, puddles reflecting lightning, and a rushing corner drainpipe.",
  CLAY_POT: "Inside a sheltered, cracked terracotta flowerpot filled with dark moist soil under an old tin awning on the rooftop; quiet pre-dawn mist and soft dew.",
  SUNRISE_GARDEN: "Lush miniature rooftop vegetable garden bursting from terracotta pots at golden Himalayan sunrise; glowing green vines, dewdrops on leaves, floating dandelion seeds, and warm valley sky."
};

const TARKARI_STYLE = "STYLE LOCK — Pixar / Aardman / Laika flagship 3D macro stop-motion & photorealistic CGI animation shot on a virtual 24mm probe macro lens at f/2.8, extreme shallow depth of field, real subsurface scattering on translucent tomato skin, micro-soil and pore texture on potato, crinkled papery onion layers, miniature water droplet physics, expressive face and eye acting. Consistent character proportions and faces across every clip.";

const TARKARI_AUDIO_RULE = "AUDIO & PACING LOCK — ONE simple action beat per 10-second clip—never rush. Start with ~0.5s of ambient sound matching the previous clip's ending, deliver the Nepali DIALOGUE word for word with expressive lip-sync between 0.8s and 8.5s, and hold the final reaction cleanly for the last 1 second so clips join seamlessly. ZERO on-screen text, ZERO subtitles, ZERO captions, ZERO logos, ZERO watermarks.";

const TARKARI_CLIPS = [
  // Act I: Basket Blues (1-11)
  {
    act: "act1", who: ["ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "The Belly Sit-Up Struggle",
    beat: "Aalu fails at sit-ups and gets stuck on his back while Golbheda giggles by a spoon.",
    shot: "Probe macro shot inside the sunlit bamboo nanglo basket. Plump Aalu strains trying to do a sit-up, wobbles, and rolls helplessly onto his back like an upturned beetle with stubby feet kicking air. Beside a giant shiny steel spoon, glossy Golbheda admires her reflection and giggles gently. Hold on Aalu stuck upside-down, sighing.",
    line: "आलु: ऊफ! मेरो भुँडी कहिले घट्छ होला?|गोलभेँडा: आलु जी, भुँडी होइन, मन हल्का बनाऊ न!",
    prevLink: "Opening clip of the series; establish Aalu, Golbheda, and the sunlit bamboo nanglo basket with the shiny steel spoon.",
    mood: "Sound: playful marimba pizzicato, soft rubbery potato bounce, clinking spoon chime.",
    cap: "आफू गोलो र साधारण छु भनेर सधैँ हीनभावनामा बाँच्ने आलु—तर उसलाई के थाहा, त्यही गोलो शरीर नै भोलि सबैको जीवनरक्षक बन्नेछ!\n\nबाँसको नाङ्लोमा बिहानीको घाम छिर्दै गर्दा आलु आफ्नो मोटो पेट घटाउन सिट–अप गर्ने कोसिस गर्छ, तर कछुवा झैँ उत्तानो परेर हातखुट्टा फ्याँक्छ। छेउमै चम्किलो गोलभेँडा चम्चामा आफ्नो रूप हेर्दै मिठो हाँसो हाँस्छे।\n\n#TarkariKoKatha #AaluGolbheda #3DMacroStory #FunnyAndTouching #NepaliAnimation"
  },
  {
    act: "act1", who: ["GOLBHEDA", "ALU"], loc: "NANGLO_BASKET", title: "Helping Aalu Up",
    beat: "Golbheda rolls over to push upside-down Aalu upright; he sees his round reflection in the spoon.",
    shot: "Direct continuation from Clip 1 in the same sunlit nanglo basket. Still chuckling kindly, Golbheda rolls over from the steel spoon and gently pushes upside-down Aalu back onto his stubby feet. Aalu wobbles upright, dusts off his skin, peeks into the shiny spoon beside them, and sighs gloomily at his round belly.",
    line: "गोलभेँडा: ल उठ आलु जी, कति कछुवा बन्छौ!|आलु: चम्चामा हेर न… म कस्तो बाङ्गो–टिङ्गो छु।",
    prevLink: "Continues directly from Clip 1 where Aalu is stuck upside-down on his back in the nanglo basket beside Golbheda and the steel spoon.",
    mood: "Sound: gentle push rustle on bamboo, soft wobble thud, sympathetic acoustic chord.",
    cap: "उत्तानो परेको आलुलाई गोलभेँडाले बिस्तारै उठाउँछे—तर चम्चामा आफ्नो गोलो अनुहार देखेर आलु फेरि उदास हुन्छ!\n\nअरूको चमक अगाडि हामी अक्सर आफैँलाई सानो र नराम्रो ठान्छौँ। तर साँचो साथीले कहिल्यै हाँसोमा मात्र छोड्दैन, हात दिएर उठाउँछ।\n\n#HelpingHand #AaluGolbheda #TarkariKoKatha #SelfWorth #NepaliStory"
  },
  {
    act: "act1", who: ["PYAAJ", "ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "Pyaaj's Cheerful Entrance",
    beat: "Gentle Pyaaj hops over to cheer gloomy Aalu up with a promised funny joke.",
    shot: "Same basket, camera drifts slightly wider from Aalu by the spoon. Seeing Aalu gloomy, round purple Pyaaj in his papery tunic and wire-rim spectacles hops cheerfully into frame, adjusting his glasses with a warm smile. Aalu and Golbheda look up curiously, leaning in as Pyaaj raises a finger to begin a joke.",
    line: "प्याज: ए आलु भाइ, किन उदास? ल सुन, म एउटा रमाइलो जोक सुनाउँछु!",
    prevLink: "Continues directly from Clip 2 with Aalu and Golbheda standing beside the steel spoon in the bamboo basket.",
    mood: "Sound: light papery hop, tiny spectacle clink, warm curious woodwind trill.",
    cap: "उदास आलुलाई हँसाउन प्याज दाइ चश्मा मिलाउँदै खुसीसाथ अगाडि आउँछन्—‘ल सुन, म एउटा रमाइलो जोक सुनाउँछु!’\n\nसबैको मुहारमा उज्यालो ल्याउन चाहने प्याज दाइको मन कति सफा छ—तर उनलाई के थाहा, उनको बास्नाले के जादु गर्नेवाला छ!\n\n#PyaajDai #VegetableFriends #TarkariKoKatha #ComedySetup #NepaliAnimation"
  },
  {
    act: "act1", who: ["PYAAJ", "ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "The Cauliflower & Cabbage Joke",
    beat: "Pyaaj tells the complete funny joke and chuckles proudly, waiting for laughs.",
    shot: "Medium macro three-shot in the nanglo basket. Pyaaj delivers the full joke with lively hand gestures, leaning forward on the punchline while Aalu and Golbheda listen intently with hopeful smiles. At the end of his punchline, Pyaaj bursts into a proud, hearty chuckle—causing his papery purple outer layer to wiggle and rustle.",
    line: "प्याज: एकचोटि काउलीले बन्दालाई सोध्यो—तँ किन सधैँ टाउको छोपेर बस्छस्? बन्दाले भन्यो—चिसो लाग्छ नि! हाहा!",
    prevLink: "Continues directly from Clip 3 as Aalu and Golbheda lean in listening to Pyaaj in the bamboo basket.",
    mood: "Sound: cheerful storytelling cadence, crisp papery layer rustle as Pyaaj chuckles.",
    cap: "प्याज दाइले पूरै जोक सुनाएर आफैँ दिल खोलेर हाँसे—‘काउलीले बन्दालाई सोध्यो—चिसो लाग्छ नि! हाहा!’\n\nजोक त साँच्चै रमाइलो थियो… तर हाँस्दाहाँस्दै प्याज दाइको पत्रेदार बोक्रा हल्लियो र हावामा बास्ना फैलिन थाल्यो!\n\n#CauliflowerJoke #PyaajDai #TarkariKoKatha #NepaliHumor #3DMacro"
  },
  {
    act: "act1", who: ["PYAAJ", "ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "The Aroma & Waterfall Tears",
    beat: "Pyaaj's swirling onion aroma makes Aalu and Golbheda sob uncontrollably.",
    shot: "Direct continuation from Pyaaj's chuckle in Clip 4. Faint shimmering purple aroma wisps drift from Pyaaj's rustling tunic straight into Aalu and Golbheda's faces. Both blink twice, their noses twitch, and they suddenly burst into comical waterfall tears soaking the bamboo weave. Poor Pyaaj freezes with hurt, drooping eyes behind his glasses.",
    line: "आलु: जोक त रमाइलो थियो… तर तपाईंको बास्नाले आँसु थामिएन प्याज दाइ!|प्याज: अरे… फेरि म बाट गल्ती भयो कि?",
    prevLink: "Continues directly from Clip 4 right as Pyaaj finishes chuckling and his papery layers rustle in the bamboo basket.",
    mood: "Sound: comical splash of big teardrops, loud sniffles, sympathetic solo ukulele sigh.",
    cap: "जोक त रमाइलो थियो, तर प्याज दाइको बास्नाले आलु र गोलभेँडा भक्कानिएर रुन थाले—अनि बिचरा प्याज दाइ फेरि निराश भए!\n\nकहिलेकाहीँ संसारमा यस्ता मान्छे हुन्छन् जो अरूलाई हँसाउन खोज्दा पनि आफ्नै स्वभावका कारण गलत बुझिन्छन्। तर धैर्य राख्नू, एक दिन यही आँसु आशीर्वाद बन्नेछ।\n\n#OnionTears #PyaajDai #ComedyAndHeart #TarkariKoKatha #NepaliStory"
  },
  {
    act: "act1", who: ["KHURSANI", "ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "Khursani & The Buzzing Fly",
    beat: "Grumpy Khursani marches over at the crying noise—until a fly lands on his nose.",
    shot: "Same wet bamboo basket. Hearing the sobbing, sleek emerald-green Khursani marches out from behind a clay spice jar, scowling with arms crossed. Suddenly a tiny buzzing housefly lands squarely on the tip of Khursani's nose. Aalu and Golbheda stop crying mid-sniffle, eyes wide in terror as Khursani's eyebrows twitch.",
    line: "खुर्सानी: के हल्ला हो यो बिहानै… ए! मेरो नाकमा झिँगा बस्यो कि क्या हो?",
    prevLink: "Continues directly from Clip 5 with tear-soaked Aalu and Golbheda in the bamboo basket as Khursani approaches.",
    mood: "Sound: annoyed tiny footsteps, loud macro fly buzz stopping abruptly, rising tense whistle.",
    cap: "आलु र गोलभेँडाको रोएको आवाज सुनेर रिसाउँदै आएका खुर्सानी भाइको नाकमा अचानक एउटा झिँगा आएर बस्यो!\n\nरोइरहेको आलु र गोलभेँडा सास रोकेर हेर्न थाले—किनकि खुर्सानीको कपाल र आँखीभौँ तातोले काम्न थालिसकेको थियो!\n\n#KhursaniBhai #BuzzingFly #TarkariKoKatha #FunnyBuildUp #3DMacro"
  },
  {
    act: "act1", who: ["KHURSANI", "ALU", "GOLBHEDA"], loc: "NANGLO_BASKET", title: "The Spicy Popcorn Sneeze",
    beat: "Khursani sneezes a tiny spark that pops a corn kernel into a flower for Aalu.",
    shot: "Extreme macro close-up continuing from Clip 6. Bright red heat creeps up Khursani's green body, white steam whistles from his ears, and—ACHOO!—he sneezes a tiny spark onto a stray corn kernel, popping it in slow motion into a fluffy white popcorn flower. Embarrassed, Khursani shyly nudges the popcorn to Aalu; Aalu and Golbheda burst into delighted laughter.",
    line: "खुर्सानी: हाच्छ्युँ! लु… अब रुन बन्द गर्, यो खा!|आलु: वाउ, धन्यवाद खुर्सानी भाइ!",
    prevLink: "Continues directly from Clip 6 with the fly on Khursani's nose as Aalu and Golbheda watch wide-eyed.",
    mood: "Sound: steam kettle whistle, crisp macro POP of corn, warm laughter and guitar chord.",
    cap: "बाहिरबाट पिरो देखिए पनि खुर्सानी भाइको एक हाच्छ्युँले मकैको दाना सेतो पपकर्न फूल बनिदियो—अनि लजाउँदै आलुलाई दिए!\n\nसाँचो साथी त्यो हो जो पिरो स्वभावभित्र पनि तिम्रो आँसु पुछ्ने न्यानो माया लुकाएर राख्छ।\n\n#SpicySneeze #PopcornGift #TrueFriendship #TarkariKoKatha #NepaliAnimation"
  },
  {
    act: "act1", who: ["GOLBHEDA", "ALU"], loc: "NANGLO_BASKET", title: "The Walnut Bump Panic",
    beat: "Laughing Golbheda bumps a walnut and panics over a tiny cheek dimple.",
    shot: "Continuing in the bamboo basket as Aalu nibbles the popcorn. Laughing happily, Golbheda steps backward and bumps her glossy cheek against a giant wrinkled walnut. She freezes, touches a microscopic dimple on her red skin, and gasps in melodramatic horror as if her world has shattered.",
    line: "गोलभेँडा: आैया! हे भगवान्! मेरो अनुहारमा दाग बस्यो, म अब के गरूँ?",
    prevLink: "Continues directly from Clip 7 with Aalu and Golbheda laughing over the popcorn flower in the nanglo basket.",
    mood: "Sound: soft hollow walnut thud, dramatic shocked gasp, quivering string tremolo.",
    cap: "हाँस्दाहाँस्दै पछाडि सरेकी गोलभेँडा ओखरसँग ठोक्किइन् र चम्किलो गालामा सानो दाग देखियो—‘हे भगवान्, मेरो अनुहार बिग्रियो!’\n\nहामी स–साना दाग वा कमजोरी देख्दा कति छिटो आत्तिन्छौँ नि, तर साँचो साथी त्यो बेला चुपचाप नजिक आउँछ।\n\n#WalnutBump #GolbhedaPanic #TarkariKoKatha #MacroComedy #NepaliStory"
  },
  {
    act: "act1", who: ["ALU", "GOLBHEDA", "LASUN"], loc: "NANGLO_BASKET", title: "Aalu's Bandage Gift",
    beat: "Aalu peels his own cheek bandage onto Golbheda's dimple while Lasun Baaje smiles.",
    shot: "Intimate macro three-shot continuing from Clip 8. Wise elder Lasun Baaje watches calmly from the basket rim with his cinnamon staff. Aalu puts down the popcorn, wobbles over to trembling Golbheda, gently peels the tiny crisscross bandage off his own potato cheek, and sticks it tenderly over her dimple. Golbheda stops trembling, touched.",
    line: "आलु: ल, मेरो पट्टी लगाऊ… अब तिमी झन् राम्री देखियौ।|गोलभेँडा: आलु जी… तिमी कति असल छौ!",
    prevLink: "Continues directly from Clip 8 with Golbheda panicking over her cheek dimple beside the walnut.",
    mood: "Sound: soft sticky-tape peel, warm tender acoustic fingerpicking, gentle sigh.",
    cap: "आफ्नो गालाको सानो पट्टी निकालेर जब आलुले गोलभेँडाको गालामा टाँसिदियो—‘अब तिमी झन् राम्री देखियौ!’ लसुन बाजे मुस्कुराए।\n\nप्रेम र हेरचाह भनेको यही हो—आफ्नो सानो चोट बिर्सेर साथीको मनमा मलम लगाइदिनु।\n\n#BandageGift #AaluGolbheda #Heartwarming #TarkariKoKatha #PureLove"
  },
  {
    act: "act1", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "NANGLO_BASKET", title: "Shadow of the Chopping Board",
    beat: "Dusk falls and a giant knife shadow sweeps across the whole basket.",
    shot: "Warm light shifts to dramatic dusk in the same bamboo basket. Suddenly, a colossal dark silhouette of a chef's knife and wooden chopping board falls ominously across all five vegetables as heavy human footsteps thud outside the basket. Golbheda clutches Aalu's arm, Pyaaj holds his glasses, and Khursani clenches his fists, staring up in fear.",
    line: "प्याज: ओहो… भान्सामा चक्कु र अचानो निकालियो कि क्या हो?",
    prevLink: "Continues directly from Clip 9 inside the bamboo nanglo basket as dusk falls and all five vegetables are together.",
    mood: "Sound: heavy distant footsteps, metallic knife ring, tense low cello sustain.",
    cap: "मायालु पल चल्दै गर्दा भान्छामा साँझ पर्‍यो—र नाङ्लोमाथि विशाल चक्कु र अचानोको अँध्यारो छाया खस्यो!\n\nसबैको सास रोकियो—अब के तरकारी बनेर काटिने समय आयो त?\n\n#KnifeShadow #Suspense #TarkariKoKatha #TurningPoint #MacroCinema"
  },
  {
    act: "act1", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "NANGLO_BASKET", title: "The Rooftop Escape Plan",
    beat: "Lasun Baaje points to the moonlight window and Aalu rallies everyone to escape.",
    shot: "Direct continuation in the shadowed basket. Wise Lasun Baaje taps his cinnamon staff and points toward a silver beam of moonlight shining through the open kitchen window high above. Aalu steps bravely in front of his trembling friends, eyes shining with determination, and raises his stubby fist.",
    line: "लसुन बाजे: बाहिर कौसीमा माटो र आकाश छ!|आलु: हामी काटिन होइन, उम्रिन भाग्नेछौँ!",
    prevLink: "Continues directly from Clip 10 with all five vegetables huddled under the giant knife shadow in the nanglo basket.",
    mood: "Sound: gentle staff tap, hopeful rising acoustic guitar and flute swell.",
    cap: "डरको छायामा लसुन बाजेले झ्यालबाहिरको जूनतर्फ देखाए, र आलुले दृढ स्वरमा भन्यो—‘हामी काटिन होइन, छतको माटोमा उम्रिन भाग्नेछौँ!’\n\nपरिस्थिति जतिसुकै अँध्यारो भए पनि बढ्ने हिम्मत छ भने सानो पाइलाले पनि भाग्य बदल्छ।\n\n#EscapePlan #DreamBig #TarkariKoKatha #HopeAndCourage #NepaliStory"
  },

  // Act II: Great Kitchen Escape (12-19)
  {
    act: "act2", who: ["ALU", "GOLBHEDA", "KHURSANI"], loc: "COUNTER_CANYON", title: "Building the Spatula Catapult",
    beat: "The team sets up a wooden spatula seesaw over a ginger root below the high shelf.",
    shot: "Low-angle macro shot on the moonlit kitchen counter outside the basket. Aalu, Golbheda, and Khursani heave a wooden spatula balanced over a round ginger root, aiming toward the high spice-rack ledge. Khursani and Golbheda climb onto the flat spatula end while Aalu backs up, measuring the jump to the handle.",
    line: "खुर्सानी: ठीक छ, तँ त्यताबाट हाम फाल्—हामी माथि पुग्छौँ!",
    prevLink: "Continues from Clip 11 as the vegetables climb out of the bamboo nanglo basket onto the kitchen counter.",
    mood: "Sound: scraping wood on stone counter, determined grunts, rhythmic ticking suspense.",
    cap: "नाङ्लोबाट निस्केर उनीहरूले अदुवामाथि काठको पन्युको गुलेली बनाए—लक्ष्य थियो माथिल्लो मसलाको तखता!\n\nयोजना सानो थियो, तर सबैको विश्वास र टिमवर्क पहाड जत्रो बलियो थियो।\n\n#CatapultPlan #Teamwork #KitchenEscape #TarkariKoKatha #MacroAdventure"
  },
  {
    act: "act2", who: ["ALU", "GOLBHEDA", "KHURSANI"], loc: "COUNTER_CANYON", title: "Launch & Flour Crash",
    beat: "Aalu launches his friends to safety—then rebounds into a bowl of white flour!",
    shot: "Direct continuation from Clip 12. Aalu yells and belly-flops onto the spatula handle, catapulting Golbheda and Khursani cleanly onto the high spice shelf—then the seesaw rebounds and flings Aalu hilariously head-first into an open bowl of white wheat flour, popping up completely white like a powdery ghost as his friends gasp then laugh.",
    line: "आलु: तीन, दुई, एक—उड! ए… म त मैदामा परेँ!",
    prevLink: "Continues directly from Clip 12 as Aalu leaps toward the wooden spatula handle.",
    mood: "Sound: springy wood twang, whoosh through air, soft powdery flour POOF, happy giggles.",
    cap: "साथीहरूलाई उचाइमा पुर्‍याउने आलु आफैँ मैदाको कचौरामा खसेर सेतो भूत बनिदियो!\n\nजिम्मेवारी लिनेहरू कहिलेकाहीँ मैदामा लड्छन्, तर अरूलाई माथि उठाउन सकेकोमा सधैँ मुस्कुराउँछन्।\n\n#FlourCrash #FunnyHero #TarkariKoKatha #MacroComedy #GoogleFlow3D"
  },
  {
    act: "act2", who: ["ALU", "PYAAJ", "GOLBHEDA"], loc: "COUNTER_CANYON", title: "Boarding the Brass Katora Boat",
    beat: "Dusting off flour, they climb into a floating brass bowl at the soapy sink edge.",
    shot: "Macro tracking shot along the edge of the gleaming steel kitchen sink filled with soapy water. Aalu shakes white flour off his sprout leaves and climbs with Golbheda and Pyaaj into a tiny floating brass katora bowl. Pyaaj picks up two cinnamon sticks like oars, peering nervously at the bubbling water ahead.",
    line: "प्याज: सबै समातेर बस है, अब हामी साबुनको सागर तर्दै छौँ!",
    prevLink: "Continues from Clip 13 after Aalu climbs out of the flour bowl and rejoins the group at the sink rim.",
    mood: "Sound: gentle metallic katora bobbing in water, cinnamon sticks clinking, bubbly fizz.",
    cap: "मैदा टक्टक्याउँदै आलु, गोलभेँडा र प्याज दाइ सानो पित्तलको कचौरा डुङ्गामा चढे—अगाडि थियो विशाल साबुनपानीको सिङ्क!\n\nदालचिनीको चप्पु समात्दै प्याज दाइले सबैलाई सम्हालिन भने।\n\n#KatoraBoat #KitchenVoyage #TarkariKoKatha #3DMacro #NepaliStory"
  },
  {
    act: "act2", who: ["ALU", "PYAAJ", "GOLBHEDA"], loc: "COUNTER_CANYON", title: "Sailing Through Soap Bubbles",
    beat: "Pyaaj rows the katora past giant slow-motion iridescent soap bubbles.",
    shot: "Sweeping macro tracking shot gliding beside the floating brass katora in the sink. Pyaaj rows earnestly with cinnamon sticks while Aalu and Golbheda duck past colossal rainbow-iridescent soap bubbles floating past the 24mm lens. One giant bubble pops in crystalline slow motion, spraying tiny sparkles onto Golbheda's dewy skin.",
    line: "गोलभेँडा: आहा! कति राम्रा इन्द्रेणी फोकाहरू!",
    prevLink: "Continues directly from Clip 14 as the brass katora pushes off into the soapy sink water.",
    mood: "Sound: gentle water splashes, magical shimmering bubble pops, dreamy acoustic melody.",
    cap: "सिङ्कको इन्द्रेणी साबुनका फोकाहरूबीच पित्तलको कचौरा तर्दै गर्दा सानो भान्छा पनि जादुमय संसार बन्यो!\n\nडरलाई साहसमा बदल्यो भने जीवनको हरेक बाधा पनि एउटा सुन्दर यात्रा बन्न सक्छ।\n\n#SoapBubbleVoyage #MacroMagic #TarkariKoKatha #CinematicFlow"
  },
  {
    act: "act2", who: ["KHURSANI", "ALU", "GOLBHEDA"], loc: "COUNTER_CANYON", title: "The Rolling Pin Awakens",
    beat: "Landing on the far counter, Khursani bumps a giant wooden rolling pin loose.",
    shot: "Macro shot on the far granite countertop as the vegetables hop off the sink rim. Khursani carelessly leans against a chock holding a colossal wooden belna (rolling pin). The chock slips, and the giant wooden cylinder begins rolling slowly—then faster—straight toward them. All three freeze in wide-eyed shock.",
    line: "खुर्सानी: अरे… यो त गुड्ने पो रहेछ! भाग!",
    prevLink: "Continues from Clip 15 as the vegetables step onto the far countertop from the sink.",
    mood: "Sound: tiny wooden wedge slip, low rumbling wood cylinder accelerating.",
    cap: "सिङ्क तरेर ढुक्क हुन नपाउँदै खुर्सानीको ठक्करले विशाल काठको बेलना हल्लियो—र उनीहरूतिरै गुड्न थाल्यो!\n\nएक पलमै शान्त भान्छामा भूकम्प आए जस्तो हलचल मच्चियो।\n\n#RollingPinAwakens #Oops #TarkariKoKatha #ActionSetup #3DAnimation"
  },
  {
    act: "act2", who: ["ALU", "GOLBHEDA", "KHURSANI"], loc: "COUNTER_CANYON", title: "Rolling Pin Chase & Sponge Dive",
    beat: "Outrunning the thundering rolling pin and diving onto a soft yellow sponge.",
    shot: "Heart-pounding low-angle macro tracking shot sprinting backward ahead of the colossal wooden belna thundering down the counter like an avalanche boulder. Khursani sprints ahead, Aalu grabs Golbheda's tendril hand as she stumbles, and together they leap off the counter edge onto a plush yellow kitchen sponge as the belna crashes past.",
    line: "आलु: मेरो हात कसिलो समात, हामी उफ्रियौँ!",
    prevLink: "Continues directly from Clip 16 with the giant rolling pin accelerating behind them on the counter.",
    mood: "Sound: thundering wooden boulder roar, frantic tiny footsteps, big squishy sponge boing.",
    cap: "पछाडिबाट विशाल बेलना गुड्दै आउँदा आलुले गोलभेँडाको हात एक पल पनि छोडेन—दुवै उफ्रेर नरम स्पन्जमा सुरक्षित अवतरण गरे!\n\nसङ्कटमा साथीको हात थाम्न जान्नेहरू नै असली नायक हुन्।\n\n#RollingPinChase #HoldMyHand #TarkariKoKatha #ActionComedy"
  },
  {
    act: "act2", who: ["LASUN", "PYAAJ", "ALU"], loc: "COUNTER_CANYON", title: "Garlic Braid Zip-Line",
    beat: "Lasun Baaje hooks his staff onto jute twine to zip-line toward the open window.",
    shot: "Dazzling macro crane shot through floating masala dust lit by cool moonlight. Wise Lasun Baaje hooks the crook of his cinnamon-stick staff onto a taut jute twine hanging from a hook down toward the open window sill. Holding onto Lasun Baaje's papery shawl and each other's hands, Pyaaj and Aalu zip-line smoothly toward the starry night.",
    line: "लसुन बाजे: डर नमान, हावा हामीलाई बाहिर लैजानेछ!",
    prevLink: "Continues from Clip 17 as all five gather near the hanging twine above the yellow sponge.",
    mood: "Sound: taut twine hum, rushing cool breeze through window, uplifting flute & guitar.",
    cap: "जूनको उज्यालो र मसलाको धुलोबीच लसुन बाजेको दालचिनीको लौरी नै उनीहरूको आकाशे डोरी बन्यो!\n\nअनुभव र विश्वास मिल्यो भने बन्द झ्याल पनि स्वतन्त्रताको बाटो बनिदिन्छ।\n\n#ZipLineEscape #GarlicElder #TarkariKoKatha #MoonlightFlight"
  },
  {
    act: "act2", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "ROOFTOP_STORM", title: "First Breath of the Open Sky",
    beat: "Reaching the moonlit rooftop parapet overlooking twinkling Kathmandu lights.",
    shot: "Majestic macro pull-back reveal on a mossy brick rooftop parapet. All five tiny vegetables stand side by side looking out over the breathtaking blurred bokeh of distant Kathmandu valley lights. Night breeze flutters Aalu's two green sprout leaves and Lasun Baaje's beard. Golbheda leans happily against Aalu's shoulder.",
    line: "गोलभेँडा: हेर त, कति विशाल आकाश रहेछ!",
    prevLink: "Continues from Clip 18 as they land softly outside the window onto the moonlit brick rooftop parapet.",
    mood: "Sound: cool mountain night wind, distant cricket hum, soaring emotional strings.",
    cap: "नाङ्लोको सानो घेराबाट निस्केर पाँचै जना छतको डिलमा उभिए—अगाडि हजारौँ बत्तीहरूले चम्किएको काठमाडौँ उपत्यका र अनन्त आकाश थियो!\n\nतर स्वतन्त्रतासँगै आकाशमा कालो बादल पनि बिस्तारै मडारिँदै थियो।\n\n#OpenSky #KathmanduNight #TinyHeroes #TarkariKoKatha"
  },

  // Act III: Monsoon Rooftop Crisis (20-27)
  {
    act: "act3", who: ["ALU", "GOLBHEDA", "PYAAJ"], loc: "ROOFTOP_STORM", title: "First Giant Raindrops",
    beat: "Dark monsoon clouds roll in and crystal raindrops slam down like meteors.",
    shot: "Dramatic slow-motion macro storm opening. Lightning flashes across slate-blue clouds over the brick terrace. Gargantuan crystal raindrops begin slamming onto the bricks around the vegetables, exploding into glittering splash crowns as they scatter to dodge the impacts.",
    line: "आलु: ए साथी हो, पानी बर्सिन थाल्यो—छिटो ओत खोजौँ!",
    prevLink: "Continues directly from Clip 19 on the rooftop parapet as dark storm clouds roll over the valley.",
    mood: "Sound: deep thunder roll, resonant liquid booms of giant raindrops.",
    cap: "खुसी धेरै बेर टिकेन—अचानक आकाश गर्जियो र साना तरकारीहरूका लागि पानीका थोपाहरू विशाल ढुङ्गा झैँ बर्सिन थाले!\n\nआँधीको परीक्षा अब सुरु हुँदै थियो।\n\n#MonsoonStorm #MacroRain #TarkariKoKatha #Drama"
  },
  {
    act: "act3", who: ["PYAAJ", "GOLBHEDA", "ALU"], loc: "ROOFTOP_STORM", title: "Pyaaj's Papery Umbrella",
    beat: "Pyaaj peels his own outer papery tunic to shield shivering Golbheda.",
    shot: "Direct continuation in pouring rain. Shivering Golbheda huddles against a brick as giant drops splash beside her. Gentle Pyaaj unbuttons his outer purple papery layer and holds it high like a makeshift umbrella over Golbheda while Aalu braces beside them against the howling wind.",
    line: "प्याज: गोलभेँडा बहिनी, मेरो बोक्राको छातामुनि आऊ!",
    prevLink: "Continues directly from Clip 20 on the rain-lashed brick rooftop.",
    mood: "Sound: steady rain patter on papery skin, howling wind, warm noble cello.",
    cap: "अरूको आँखा रसाउने प्याज दाइको त्यही बाहिरी बोक्रा आज आँधीमा गोलभेँडाको रक्षा गर्ने छाता बन्यो!\n\nसाँचो मित्रता घाममा होइन, झरी र सङ्कटको बीचमा चिनिन्छ।\n\n#OnionUmbrella #SelflessLove #TarkariKoKatha #Monsoon"
  },
  {
    act: "act3", who: ["ALU", "GOLBHEDA", "KHURSANI"], loc: "ROOFTOP_STORM", title: "The Wet Alley Rat Appears",
    beat: "A towering wet rooftop rat corners Aalu and Golbheda in the storm.",
    shot: "Suspenseful low-angle macro shot in rain-slicked shadows. A huge, wet grey alley rat with twitching whiskers steps out behind a stack of bricks, looming menacingly over cornered Aalu and Golbheda. Aalu steps protectively in front of Golbheda, trembling as the rat sniffs closer.",
    line: "गोलभेँडा: आलु… अगाडि हेर त, कत्रो ठुलो मुसो!",
    prevLink: "Continues from Clip 21 in the rain-slicked brick rooftop shadows.",
    mood: "Sound: ominous rat sniffing, thunder crack, tense low string pulse.",
    cap: "झरीको अँध्यारोमा अचानक एउटा विशाल मुसो सामुन्ने आएर उभियो—र आलु डराउँदै भए पनि गोलभेँडाको अगाडि ढाल बनेर उभियो!\n\nसङ्कटमा डर लागे पनि मित्रलाई छोड्नु हुँदैन।\n\n#RatAmbush #Suspense #TarkariKoKatha #3DMacro"
  },
  {
    act: "act3", who: ["KHURSANI", "ALU", "GOLBHEDA"], loc: "ROOFTOP_STORM", title: "Khursani's Fiery Defense",
    beat: "Fearless Khursani puffs scorching chili mist and sends the rat sneezing away.",
    shot: "Direct continuation from Clip 22. Sleek emerald Khursani leaps onto an inverted bottle cap between the rat and his friends, inhales deeply until he glows fiery orange-red, and blows a scorching cloud of chili mist straight at the rat's nose. The giant rat sneezes wildly and scrambles away into the rain.",
    line: "खुर्सानी: मेरा साथीलाई छोएर त हेर्… पिरो के हो देखाइदिन्छु!",
    prevLink: "Continues directly from Clip 22 with the giant wet rat cornering Aalu and Golbheda.",
    mood: "Sound: dramatic steam hiss, huge rat sneeze, triumphant brass chord.",
    cap: "सानो जिउ तर निडर मन—खुर्सानी भाइले आफ्नो पिरो शक्तिले विशाल मुसालाई हाच्छ्युँ गराउँदै भगाइदिए!\n\nआकार सानो भए पनि साहस ठुलो छ भने जत्रोसुकै डरलाई पनि हराउन सकिन्छ।\n\n#FearlessKhursani #TinyHero #TarkariKoKatha #Courage"
  },
  {
    act: "act3", who: ["GOLBHEDA", "ALU"], loc: "ROOFTOP_STORM", title: "Swept Toward the Drain",
    beat: "A torrent of rainwater sweeps Golbheda to the brink of the rooftop drain.",
    shot: "Intense handheld macro shot in pouring rain. A sudden rushing sheet of rainwater sweeps Golbheda off the brick ledge, tumbling her toward a swirling whirlpool at the dark rooftop drainpipe. Without hesitating, Aalu dives into the icy current and catches Golbheda's tiny tendril hand right at the edge.",
    line: "गोलभेँडा: आलु! मेरो हात नछोड है!",
    prevLink: "Continues from Clip 23 as rainwater surges across the brick terrace after the rat flees.",
    mood: "Sound: roaring rushing water torrent, tense heartbeat strings, breathless gasps.",
    cap: "पानीको भेलले गोलभेँडालाई अँध्यारो नालीतिर तान्दा आलुले ज्यानको बाजी लगाएर भेलमा हाम फाल्यो र उनको हात समात्यो!\n\nमायाले थामेको हात त्यति सजिलै छुट्दैन।\n\n#SaveHer #MonsoonCrisis #TarkariKoKatha #Emotional3D"
  },
  {
    act: "act3", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI"], loc: "ROOFTOP_STORM", title: "The Round Potato Saves the Day",
    beat: "Aalu wedges his round belly into the drain like a cork so friends pull Golbheda out.",
    shot: "Heroic macro low-angle shot under flashing lightning, continuing from Clip 24. Feeling his grip slipping, Aalu looks at his plump round belly, smiles bravely, and wedges himself tightly across the drain grate like a sturdy cork—stopping the whirlpool. Pyaaj and Khursani sprint in and pull Golbheda to safety as water batters bruised Aalu.",
    line: "आलु: मेरो गोलो भुँडी आज काम लाग्यो नि! तिमी बाँच्यौ!",
    prevLink: "Continues directly from Clip 24 with Aalu holding Golbheda's hand at the edge of the swirling rooftop drain.",
    mood: "Sound: sudden glug as drain is plugged, swirling water calming, emotional heroic cello.",
    cap: "जुन गोलो पेट देखेर आलु सधैँ आफैँलाई नराम्रो ठान्थ्यो, त्यही गोलो शरीर आज नालीको मुख थुन्ने ढाल बन्यो!\n\nहाम्रा कमजोरी देखिने कुराहरू नै समय आएपछि सबैभन्दा ठुला शक्ति बन्छन्।\n\n#RoundPotatoHero #SelfAcceptance #TarkariKoKatha #HeroicMoment"
  },
  {
    act: "act3", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI"], loc: "ROOFTOP_STORM", title: "Pulling Aalu From the Drain",
    beat: "As the downpour eases, the friends pull battered, muddy Aalu out of the grate.",
    shot: "Direct continuation as lightning fades and rain slows to a drizzle. Golbheda, Pyaaj, and Khursani grab Aalu's stubby root arms together and heave with all their might, popping exhausted, mud-streaked Aalu free from the drain grate. Aalu slumps onto the wet bricks, shivering weakly.",
    line: "गोलभेँडा: आलु… तिमी ठीक त छौ नि? बोल् न!",
    prevLink: "Continues directly from Clip 25 with Aalu wedged in the drain grate after Golbheda is pulled to safety.",
    mood: "Sound: wet suction POP as Aalu is freed, softening drizzle, anxious tender strings.",
    cap: "झरी कम हुँदै जाँदा सबैले मिलेर हिलोमा लतपतिएको र थाकेको आलुलाई नालीबाट बाहिर निकाले!\n\nअरूको लागि आफूलाई जोखिममा पार्ने आलु आज थकित भएर भिजेको इँटामा पल्टियो।\n\n#PullHimOut #TrueFriends #TarkariKoKatha #Emotional"
  },
  {
    act: "act3", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "CLAY_POT", title: "Carry Him to the Cracked Pot",
    beat: "All four friends gently carry exhausted Aalu inside a sheltered cracked flowerpot.",
    shot: "Tender slow tracking shot at pre-dawn mist. Together, Golbheda, Pyaaj, Khursani, and elder Lasun Baaje gently carry bruised, shivering Aalu inside a tilted, cracked terracotta flowerpot packed with soft dark soil beneath a rusty tin awning. They lay him gently on the damp earth, huddling close.",
    line: "लसुन बाजे: अब आराम गर छोरा, तिमीले हामी सबैलाई बचायौ।",
    prevLink: "Continues from Clip 26 as the friends carry exhausted Aalu from the wet bricks into the sheltered terracotta pot.",
    mood: "Sound: soft rain mist on tin roof, quiet exhausted breathing, gentle lullaby piano.",
    cap: "चारै जना साथीहरूले आलुलाई काँधमा बोकेर टिनमुनिको एउटा फुटेको गमलाको नरम माटोमा सुरक्षित सुताए!\n\nबाहिरबाट फुटेको देखिए पनि त्यो गमला भित्रैबाट प्रेमको न्यानो घर बनेको थियो।\n\n#ShelterInStorm #CrackedPot #TarkariKoKatha #HeartTouching"
  },

  // Act IV: The Cracked Pot & Sprout of Hope (28-34)
  {
    act: "act4", who: ["GOLBHEDA", "ALU"], loc: "CLAY_POT", title: "Golbheda's Mint-Leaf Apology",
    beat: "Golbheda wipes Aalu's muddy face with a mint leaf and sees his true beauty.",
    shot: "Ultra-intimate macro close-up inside the quiet pre-dawn flowerpot. Dewdrops glisten on Golbheda's cheek, still wearing Aalu's little bandage. Holding a soft green mint leaf, she gently dabs mud off bruised Aalu's forehead, tears shimmering in her big eyes as she whispers tenderly.",
    line: "गोलभेँडा: तिमी साधारण होइनौ आलु… संसारकै सबैभन्दा सुन्दर मन तिम्रै छ।",
    prevLink: "Continues directly from Clip 27 inside the sheltered cracked flowerpot with Aalu resting on the soft dark soil.",
    mood: "Sound: soft leaf brush, tender whispers, delicate solo acoustic guitar harmonics.",
    cap: "फुटेको गमलाको शान्त बिहानीमा गोलभेँडाले पुदिनाको पातले आलुको हिलो पुछिदिँदै भनिन्—‘संसारकै सबैभन्दा सुन्दर मन तिम्रै छ!’\n\nबाहिरी चमक समयसँगै जान्छ, तर निस्वार्थ प्रेम र साहस सधैँ अमर रहन्छ।\n\n#TrueBeauty #AaluGolbheda #TarkariKoKatha #LoveAndGratitude"
  },
  {
    act: "act4", who: ["PYAAJ", "ALU", "GOLBHEDA"], loc: "CLAY_POT", title: "The Tear That Heals",
    beat: "Pyaaj's warm tear waters the dry earth beside Aalu without hurting anyone.",
    shot: "Poignant macro close-up continuing in the pot. Pyaaj removes his tiny spectacles and wipes his misty eyes. One crystal-clear, warm glowing teardrop falls slowly from his eye and sinks into the dark soil right beside Aalu. Golbheda and Aalu smile warmly and hold Pyaaj's hands—for the first time, nobody cries in pain.",
    line: "प्याज: आज मेरो आँसुले कसैलाई दुखाएन… उल्टो माटो भिजाइदियो!",
    prevLink: "Continues directly from Clip 28 inside the cracked flowerpot as Pyaaj watches Aalu and Golbheda.",
    mood: "Sound: delicate crystalline drop into soil, soft exhale of relief, warm cello & sarangi.",
    cap: "पहिलो पटक प्याज दाइको आँसुले कसैको आँखा पोलेन—आज उनको एक थोपा आँसुले माटोमा जीवन भिजाइदियो!\n\nजुन आँसुले पहिले रुवाउँथ्यो, त्यही आँसु आज नयाँ सिर्जनाको अमृत बन्यो।\n\n#HealingTears #PyaajDai #Acceptance #TarkariKoKatha"
  },
  {
    act: "act4", who: ["LASUN", "ALU", "GOLBHEDA", "PYAAJ", "KHURSANI"], loc: "CLAY_POT", title: "First Sunbeam Through the Crack",
    beat: "A golden sunbeam slices through the crack in the pot, waking the damp soil.",
    shot: "Atmospheric macro push-in inside the terracotta pot. A warm needle-thin golden sunbeam slices through the vertical crack in the clay wall, illuminating floating mist right over the spot where Pyaaj's tear fell. Elder Lasun Baaje taps his cinnamon staff gently onto the warm sunlit earth.",
    line: "लसुन बाजे: हेर नानीहरू… उज्यालो कसरी चिराबाटै भित्र पस्छ!",
    prevLink: "Continues directly from Clip 29 inside the flowerpot as pre-dawn mist turns to early morning.",
    mood: "Sound: gentle wood tap on damp earth, distant dawn birdsong, serene flute melody.",
    cap: "गमलाको सानो चिराबाट बिहानीको पहिलो सुनौलो किरण भित्र पस्दा लसुन बाजेले मुस्कुराउँदै देखाए—उज्यालो सधैँ चिराबाटै आउँछ!\n\n#FirstSunbeam #CrackedPot #TarkariKoKatha #DawnOfHope"
  },
  {
    act: "act4", who: ["LASUN", "ALU", "GOLBHEDA", "PYAAJ", "KHURSANI"], loc: "CLAY_POT", title: "Lasun Baaje's Secret of the Soil",
    beat: "Lasun Baaje reveals that their true destiny is not the kitchen, but growth.",
    shot: "Direct continuation in the golden sunbeam inside the pot. All four younger vegetables gather close around Lasun Baaje. The wise garlic elder gestures calmly at the damp soil and at Aalu's tiny sprout leaves, speaking with warm, reassuring wisdom.",
    line: "लसुन बाजे: बाहिरबाट अँध्यारो लागे पनि माटोमै नयाँ जीवनको बिउ लुकेको हुन्छ।",
    prevLink: "Continues directly from Clip 30 with the golden sunbeam shining on the damp soil inside the flowerpot.",
    mood: "Sound: calm wise voice, gentle breeze through crack, warm acoustic strings.",
    cap: "‘बाहिरबाट सानो र अँध्यारो लागे पनि माटोमै नयाँ जीवन लुकेको हुन्छ!’—लसुन बाजेको कुराले सबैको मनमा आशाको दियो बल्यो।\n\nअन्त्य जस्तो देखिने पल नै प्रायः नयाँ र सुन्दर सुरुवातको ढोका हुँदो रहेछ।\n\n#LasunBaaje #Wisdom #TarkariKoKatha #NewBeginning"
  },
  {
    act: "act4", who: ["ALU", "GOLBHEDA"], loc: "CLAY_POT", title: "The Miracle Green Shoot",
    beat: "A glowing emerald seedling unfurls from the soil where they rested.",
    shot: "Breathtaking continuous macro close-up time-lapse in the sunbeam. Right between Aalu's resting cheek and a single golden tomato seed from Golbheda's bruised dimple, the moist soil parts gently and a luminous emerald-green sprout rises, unfurling two dewy baby leaves straight toward the sunbeam.",
    line: "आलु: हेर गोलभेँडा! हामीबाटै नयाँ मुना पलायो!",
    prevLink: "Continues directly from Clip 31 focusing on the sunlit damp earth between Aalu and Golbheda inside the pot.",
    mood: "Sound: magical subtle chime shimmer, crisp rustle of unfolding leaves, soaring strings.",
    cap: "जहाँ आलुको मुना र गोलभेँडाको गालाको एउटा दाना भिजेको माटोमा मिसियो—त्यहीँबाट हरियो नवजीवन अंकुरायो!\n\nतिमी आफूलाई सानो नठान—तिम्रो भित्र एउटा पूरै बगैँचा उम्रिने शक्ति छ!\n\n#MiracleSprout #GrowthAndHope #MacroTimelapse #TarkariKoKatha"
  },
  {
    act: "act4", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "CLAY_POT", title: "Awe Around the Seedling",
    beat: "All five gaze in silent wonder at the glowing baby sprout bathed in gold.",
    shot: "Intimate macro group shot around the tiny glowing emerald seedling from Clip 32. Khursani's jaw drops in amazement, Pyaaj wipes a happy tear behind his glasses, Golbheda clasps her hands over her heart, and Aalu's big brown eyes reflect the bright green leaves.",
    line: "गोलभेँडा: यो त साँच्चै चमत्कार भयो… हाम्रो नयाँ जीवन!",
    prevLink: "Continues directly from Clip 32 with the newly unfurled emerald seedling glowing in the center of the flowerpot.",
    mood: "Sound: soft amazed gasps, gentle sparkling chime, tender emotional piano.",
    cap: "पाँचै जना साथीहरू सास रोकेर त्यो सानो हरियो मुनालाई हेरिरहे—मानौँ उनीहरूले आफ्नै भविष्य आँखाअगाडि देखे!\n\n#Wonder #NewLife #TarkariKoKatha #3DAnimation"
  },
  {
    act: "act4", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "CLAY_POT", title: "We Are Not Just Food, We Are a Garden",
    beat: "All five join hands around the seedling as bright morning floods the pot.",
    shot: "Direct celebratory continuation. Bright golden morning sunlight floods the top of the cracked flowerpot, illuminating all five vegetables joining hands around the glowing sprout. Khursani pumps his fist, Lasun Baaje nods proudly, and Aalu stands tall with shining eyes.",
    line: "आलु: हामी काटिने तरकारी मात्र होइनौँ… हामी त एउटा बगैँचा हौँ!",
    prevLink: "Continues directly from Clip 33 inside the flowerpot as morning sunlight floods over the seedling and all five friends.",
    mood: "Sound: joyous cheers, warm acoustic strum, rising Himalayan flute & strings.",
    cap: "‘हामी काटिने तरकारी मात्र होइनौँ… हामी त एउटा बगैँचा हौँ!’ आलुको त्यो वाक्यले उनीहरूको भाग्य नै बदलिदियो।\n\nआफ्नो मूल्य अरूको भान्छामा होइन, आफ्नै विकास र सपनाको उचाइमा खोज्नुपर्छ।\n\n#WeAreAGarden #FutureGrowth #TarkariKoKatha #EmpoweringStory"
  },

  // Act V: The Rooftop Garden Family (35-40)
  {
    act: "act5", who: ["ALU", "GOLBHEDA", "PYAAJ"], loc: "SUNRISE_GARDEN", title: "Weeks Later: The Cracked Pot Blooms",
    beat: "Lush potato and tomato vines spill over terracotta pots in golden sunshine.",
    shot: "Lush macro tracking shot gliding along a vibrant rooftop vegetable garden bursting from terracotta pots weeks later. Thick green vines with yellow blossoms spill over the cracked clay rim. Aalu and Golbheda cheerfully tilt a tiny bottle-cap watering can together, pouring sparkling droplets onto the roots as Pyaaj smiles happily.",
    line: "गोलभेँडा: हेर त आलु, हाम्रो फुटेको गमला कति हराभरा भयो!",
    prevLink: "Time jump of a few weeks from Clip 34; the same cracked terracotta pot is now overflowing with lush green vines in morning sunlight.",
    mood: "Sound: sparkling sprinkle of water droplets, cheerful buzzing bees, upbeat folk guitar.",
    cap: "केही हप्तामै त्यो पुरानो फुटेको गमला रित्तो माटोबाट एउटा सुन्दर हरियाली स्वर्गमा बदलियो!\n\nमेहनत र प्रेमले फुटेका भाँडाहरूमा पनि फूल फुलाउन सकिन्छ।\n\n#BloomingGarden #HardWorkAndLove #TarkariKoKatha #FutureGrowth"
  },
  {
    act: "act5", who: ["PYAAJ"], loc: "SUNRISE_GARDEN", title: "Pyaaj's Happy Tears School",
    beat: "Pyaaj teaches a row of adorable wiggling baby green-onion sprouts.",
    shot: "Comical, heartwarming macro shot in the sunlit garden. Wearing his wire-rim spectacles proudly, Pyaaj uses a tiny twig pointer to teach a neat row of cute, wiggling baby green-onion sprouts in a pot, pointing at a leaf-scroll while the tiny sprouts bounce happily.",
    line: "प्याज: ल नानीहरू हो, आजको पाठ—मुस्कान कहिल्यै नछोड्नु!",
    prevLink: "Continues in the sunlit rooftop garden from Clip 35, panning over to a neighboring pot.",
    mood: "Sound: cute tiny giggling sprouts, playful bouncy flute tune, gentle rustling leaves.",
    cap: "आज प्याज दाइ बगैँचाका स–साना हरिया बिरुवाहरूका प्रिय गुरु बनेका छन्!\n\nसही वातावरणमा पुगेपछि पुराना कमजोरीहरू नै नयाँ पुस्ताका लागि शिक्षा बन्छन्।\n\n#HappyTearsSchool #PyaajSir #TarkariKoKatha #FunnyAndCute"
  },
  {
    act: "act5", who: ["KHURSANI"], loc: "SUNRISE_GARDEN", title: "Super-Guard Khursani",
    beat: "Khursani in a rose-petal superhero cape watches proudly over the garden.",
    shot: "Heroic, funny macro shot continuing in the garden. Sleek emerald Khursani stands atop a bright orange marigold flower wearing a tiny superhero cape made from a dried red rose petal. He puffs out his chest proudly as a gentle breeze flutters his petal cape, scanning the garden horizon.",
    line: "खुर्सानी: म पहरेदार हुँदासम्म यो बगैँचामा कसैले आँखा लाउन पाउँदैन!",
    prevLink: "Continues in the sunlit rooftop garden from Clip 36, tilting up to the marigold flower beside Pyaaj's pot.",
    mood: "Sound: crisp petal cape flutter, comical heroic horn fanfare, cheerful breeze.",
    cap: "गुलाबको पातको केप लगाएर सयपत्री फूलमाथि उभिएका खुर्सानी भाइ आज पूरै बगैँचाका सुपरहिरो पहरेदार बनेका छन्!\n\n#SuperKhursani #GardenHero #TarkariKoKatha #MacroComedy"
  },
  {
    act: "act5", who: ["ALU", "GOLBHEDA"], loc: "SUNRISE_GARDEN", title: "The Baby Cherry-Tomato & Baby Spud",
    beat: "Two adorable baby sprouts hop into Aalu and Golbheda's arms.",
    shot: "Sweetest macro shot in golden morning rays. A tiny marble-sized cherry tomato with a mini beret leaf and a tiny round baby potato with one bright sprout leaf bounce clumsily across a soft moss carpet straight into Aalu and Golbheda's arms. They hug them tightly, laughing with glistening happy eyes.",
    line: "गोलभेँडा: आलु जी, यिनीहरू त ठ्याक्कै तिमी र म जस्ता छन्!",
    prevLink: "Continues in the sunlit rooftop garden from Clip 37 beside the blooming tomato and potato vines.",
    mood: "Sound: cute tiny bounces, baby vegetable giggles, warm music-box & acoustic strings.",
    cap: "सुनौलो घाममा जब सानो चेरी गोलभेँडा र एउटै पात भएको सानो आलुको बच्चा उफ्रिँदै आएर उनीहरूको काखमा लुटपुटिए—त्यो पल शब्दमा बयान गर्न नसकिने थियो!\n\nप्रेम र धैर्यले सिञ्चिएको हरेक कथा अन्त्यमा नयाँ जीवनको उत्सव बनेर फुल्छ।\n\n#BabySprouts #LittleFamily #TarkariKoKatha #HeartMelting"
  },
  {
    act: "act5", who: ["LASUN", "ALU", "GOLBHEDA", "PYAAJ", "KHURSANI"], loc: "SUNRISE_GARDEN", title: "Lasun Baaje's Sunrise Blessing",
    beat: "All five toast with dewdrop cups overlooking the Himalayan sunrise.",
    shot: "Radiant wide macro shot atop the terracotta pot rim overlooking misty terraced hills glowing in golden dawn. Floating dandelion seeds drift lazily like golden snow. Elder Lasun Baaje raises his cinnamon staff in blessing while Aalu, Golbheda, Pyaaj, and Khursani clink tiny acorn-cap cups filled with sparkling morning dew.",
    line: "लसुन बाजे: सधैँ यसरी नै सँगै बढ्दै जानू… जय हरियाली!",
    prevLink: "Continues in the sunrise garden from Clip 38 as all five friends gather along the sunlit terracotta pot rim.",
    mood: "Sound: delicate crystalline clink of tiny cups, morning breeze, rich uplifting sarangi & guitar.",
    cap: "झुलिरहेका सेता बुकीका बियाँ र हिमाली सूर्योदयको सामुन्ने सबै साथीहरूले शीतको थोपा भरिएको कप जुधाएर मित्रताको उत्सव मनाए!\n\nसफलता एक्लै होइन, सँगै बढ्दा मात्र वास्तविक खुसी मिल्छ।\n\n#SunriseBlessing #FriendshipToast #TarkariKoKatha #GoldenDawn"
  },
  {
    act: "act5", who: ["ALU", "GOLBHEDA", "PYAAJ", "KHURSANI", "LASUN"], loc: "SUNRISE_GARDEN", title: "Forever Growing Together",
    beat: "Grand crane pull-back from Aalu & Golbheda into the glowing sunrise garden.",
    shot: "Spectacular continuous macro crane pull-back shot continuing from Clip 39. Starting on a close-up of proud Aalu (wearing a tiny daisy flower behind his sprout) and Golbheda holding hands beside Pyaaj, Khursani, and Lasun Baaje, the camera rises smoothly up and back—revealing the entire flourishing rooftop paradise of green vines, blossoms, and golden Kathmandu sunrise sky.",
    line: "आलु: अब हामी कहिल्यै रोकिँदैनौँ… सधैँ यसरी नै बढिरहनेछौँ!",
    prevLink: "Continues directly from Clip 39 on the terracotta pot rim overlooking the sunrise, pulling back smoothly into a wide finale.",
    mood: "Sound: gentle morning birdsong, warm inspiring orchestral swell resolving to a peaceful acoustic chord.",
    cap: "नाङ्लोको सानो कुनाबाट सुरु भएको डर र हीनभावनाको यात्रा आज सूर्यको उज्यालोमा हाँस्ने एउटा विशाल बगैँचामा पुगेर अडियो!\n\nकहिल्यै आफूलाई सानो वा काम नलाग्ने नसम्झनू; तपाईंको भोलि आजभन्दा कयौँ गुणा सुन्दर र हराभरा हुन सक्छ!\n\n#ForeverGrowing #TarkariKoKatha #InspirationalStory #GoogleFlow3D #Nepal"
  }
];

function tarkariPromptFor(i, ar = "9:16", dur = "10s") {
  const c = TARKARI_CLIPS[i];
  if (!c) return "";
  const act = TARKARI_ACTS.find(a => a.id === c.act) || TARKARI_ACTS[1];
  const chars = c.who.map(id => TARKARI_CHARS[id]).join("\n");
  const lines = c.line ? c.line.split("|") : [];
  const cont = c.prevLink
    ? `${c.prevLink} Keep Aalu's two sprout leaves & cheek bandage, Golbheda's calyx beret, Pyaaj's wire-rim glasses, Khursani's curved silhouette, and Lasun Baaje's cinnamon staff identical.`
    : `Continue seamlessly from Clip ${i} ("${TARKARI_CLIPS[i - 1]?.title || ""}").`;
  return [
    `GOOGLE FLOW 3D MACRO ANIMATION PROMPT — TARKARI KO KATHA — CLIP ${i + 1}/${TARKARI_CLIPS.length} (${act.label})`,
    `TITLE: ${c.title}`,
    `CHARACTERS — match reference images exactly:\n${chars}`,
    `LOCATION: ${TARKARI_LOCS[c.loc]}`,
    `VISUAL ACTION & MACRO CAMERA: ${c.shot}`,
    `DIALOGUE (speak in natural conversational Nepali with expressive lip-sync):\n${lines.length ? lines.map(l => "• " + l).join("\n") : "None."}`,
    `COLOR & ATMOSPHERE: ${act.grade}.`,
    `CONTINUITY: ${cont}`,
    `SOUND & FOLEY: ${c.mood}`,
    TARKARI_STYLE,
    TARKARI_AUDIO_RULE,
    `FORMAT: ${ar === "9:16" ? "9:16 vertical macro framing, characters expressive and centered" : "16:9 wide cinematic macro framing"}. Exactly ${dur}, ONE continuous shot with no hard cuts. Hold the final expressive reaction cleanly for the last 1 second.`
  ].join("\n\n");
}

function tarkariCharactersFor(i) {
  const who = Array.isArray(TARKARI_CLIPS[i]?.who) ? TARKARI_CLIPS[i].who : [];
  return who.map(code => ({
    code,
    name: TARKARI_CHAR_NAMES[code] || code,
    refPrompt: `Character reference: full-body 3D macro Pixar-style character turnaround sheet of ${TARKARI_CHARS[code] || code} Plain soft neutral studio background, natural macro rim lighting, ultra-detailed tactile vegetable skin texture, expressive eyes, no text.`
  }));
}
