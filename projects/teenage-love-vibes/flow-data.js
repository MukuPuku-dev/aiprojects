const TEEN_LOVE_ACTS = [
  { id: "all", label: "All Acts (30)" },
  { id: "act1", label: "Act I · Crush (1–6)", grade: "warm honey-gold morning sunbeams, soft airy lens flare, innocent pastel tones" },
  { id: "act2", label: "Act II · Falling (7–12)", grade: "rich golden-hour amber, warm tungsten fairy lights, glowing skin tones" },
  { id: "act3", label: "Act III · Golden Love (13–18)", grade: "vibrant saturated sunset warmth, sparkling highlights, joyful handheld energy" },
  { id: "act4", label: "Act IV · Breakup (19–24)", grade: "desaturated cold rain-blue, overcast slate shadows, wet asphalt neon reflections" },
  { id: "act5", label: "Act V · Healing (25–30)", grade: "muted misty grey transitioning to quiet golden dawn light, bittersweet clarity" }
];

const TEEN_LOVE_CHARS = {
  AARAV: "AARAV (17): Nepali teenage boy, lean build, soft tousled dark hair falling slightly over expressive warm brown eyes, faint dimple, silver wristwatch on his left wrist; wears a navy-blue college blazer over a crisp white shirt with loosened tie during school scenes, or an olive-green zip hoodie in weekend scenes.",
  AANYA: "AANYA (17): Nepali teenage girl, delicate expressive almond eyes, long wavy dark hair half-tied with a signature pale-pink silk ribbon, small silver jhumka earrings; wears a matching navy college blazer and pleated skirt in school scenes, or a soft cream knitted cardigan over a pastel kurta in weekend scenes."
};

const TEEN_LOVE_LOCS = {
  CLASSROOM: "Sunlit high-school classroom and wooden-railing hallway in Kathmandu valley with tall open windows, dusty sunbeams, wooden desks, and distant hazy hills.",
  BUS_STOP: "A narrow Himalayan hillside road bus stop with corrugated tin roof, fluttering faded prayer flags nearby, wet blacktop, and a local city bus passing.",
  ROOFTOP_TEA: "A cozy brick rooftop chiya stall overlooking terraced rooftops and evening mist, warm string fairy lights, weathered wooden table, and clay tea cups.",
  HILLSIDE: "A quiet pine-lined hillside trail with mossy stone bench, wild white flowers, a clear shallow mountain stream, and sweeping valley sky.",
  STREET_ROOM: "A rain-slicked evening neighborhood lane lit by warm amber streetlights, plus Aanya's quiet moonlit bedroom window with rain streaks on the glass."
};

const TEEN_LOVE_STYLE = "STYLE LOCK — Photorealistic cinematic live-action Nepali teenage romance film shot on 35mm anamorphic cinema lenses, shallow depth of field, natural skin texture, expressive micro-acting. Every shot feels intimate, nostalgic, and authentic—never plastic, never cartoonish, never glossy stock footage. Keep Aarav and Aanya's faces, builds, wristwatch, and pale-pink silk hair ribbon consistent across all clips.";

const TEEN_LOVE_SILENT_RULE = "STRICT DIALOGUELESS & NARRATIONLESS LOCK — ZERO spoken dialogue, ZERO narration, ZERO voice-over, ZERO singing, ZERO mouthing words or lip movement. Nobody speaks a single word. NO on-screen text, NO subtitles, NO captions, NO readable signs, NO logos, NO watermarks. Tell 100% of the story purely through eyes, stolen glances, trembling hands, breathing, body language, props, ambient environmental sounds, and gentle instrumental music.";

const TEEN_LOVE_CLIPS = [
  // Act I: Crush (1-6)
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "CLASSROOM", title: "The Window Breeze & Fallen Page",
    beat: "Secret first notice — fingers brush over a fallen notebook page.",
    shot: "Warm afternoon breeze blows a loose notebook page off Aanya's wooden desk onto the floor beside Aarav. Both bend down simultaneously; their fingers accidentally brush on the paper. Aanya pulls her hand back shyly, tucking hair behind her ear; Aarav freezes mid-breath, holding the page as golden dust motes float between them. Slow push-in from hands to their startled eyes.",
    mood: "Sound: crisp breeze, rustling paper, soft solo acoustic guitar harmonic, quiet heartbeat hush.",
    cap: "त्यो एक सेकेन्डको छुवाइ, जसमा एक शब्द पनि नबोली मनको पहिलो पन्ना खुल्यो।\n\nकक्षाकोठाको झ्यालबाट छिरेको हावाले त केवल कापीको एउटा पाना मात्रै खसालेको थियो, तर त्यो पाना समात्ने निहुँमा दुई अन्जान हातहरू जब हल्का ठोक्किए, समय मानौँ त्यहीँ रोकियो। न कसैको नाम थाहा थियो, न मनको भाषा—तर लाजले कानको पछाडि कपाल सार्दै झुकिएका आँखाहरूले भित्रै एउटा नमीठो कम्पन छोडिदिए।\n\nमान्छेलाई लाग्छ प्रेम ठूलो घोषणा वा लामा गफबाट सुरु हुन्छ; तर सत्य त के हो भने जीवनको सबैभन्दा मीठो कथा त यस्तै एक सेकेन्डको संयोग, रोकिएको सास अनि काँपेका औँलाहरूबाट लेखिन थाल्छ। आज उसले पाना त फिर्ता पायो, तर त्यो पानासँगै आफ्नो चञ्चल मन पनि त्यही बेन्चमा छोडेर गयो।\n\n#TeenageLove #FirstCrush #NepaliLoveStory #SilentCinema #SchoolMemories #माया"
  },
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "CLASSROOM", title: "Corridor Slow-Motion Eye Lock",
    beat: "Passing in a busy hallway and looking back at the exact same second.",
    shot: "Crowded school corridor between classes; background students drift in soft bokeh blur. Aarav and Aanya walk in opposite directions. As they cross paths, their eyes lock briefly; three steps past, both turn their heads back at the exact same moment and catch each other looking. Both snap forward smiling secretly to themselves. Smooth dolly tracking shot.",
    mood: "Sound: muffled distant hallway footsteps fading into warm dreamy piano chords.",
    cap: "भीडको बीचमा हजारौँ अनुहार थिए, तर दुवैको नजरले ठीक त्यही एक सेकेन्डमा एकअर्कालाई खोजिरह्यो।\n\nकलेजको व्यस्त करिडोरमा घण्टीको आवाज र साथीहरूको हल्लाखल्ला चलिरहँदा पनि जब दुई मान्छे विपरीत दिशाबाट नजिक आउँछन्, बाहिरी संसार अचानक धमिलो बनिदिन्छ। तीन पाइला अगाडि बढिसकेपछि मनले मान्दैन र चुपचाप पछाडि फर्केर हेर्न मन लाग्छ—त्यही आशामा कि शायद ऊ पनि हेर्दैछ कि!\n\nर जब ठीक त्यही पलमा उताबाट पनि पछाडि फर्केका आँखाहरूसँग आँखा जुध्छन् नि, त्यो पक्डिँदा आउने लजाएको मुस्कान संसारकै सबैभन्दा निश्चल खुसी हुँदो रहेछ। कसैले कसैलाई बोलाएन, कसैले हात हल्लाएन, तर दुवैले आ–आफ्नो बाटो हिँड्दा ओठमा त्यही लुकाइएको मुस्कान दिनभर बोकेर हिँडिरहे।\n\n#SchoolCrush #EyeContact #TeenageVibes #SilentLove #NepaliStory #FirstLove"
  },
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "BUS_STOP", title: "One Umbrella, One Soaked Shoulder",
    beat: "Quiet protection in a sudden monsoon shower.",
    shot: "Sudden afternoon rain traps Aanya under the narrow tin bus shelter without an umbrella, hugging her books. Aarav steps up silently and holds his black umbrella over her head, deliberately angling it so she stays completely dry while his own left shoulder and hair get soaked. Aanya notices his wet blazer and looks up at him with wide, softened eyes. Intimate medium two-shot.",
    mood: "Sound: steady rain patter on umbrella canopy and tin roof, gentle melancholic cello swell.",
    cap: "आफ्नो कुम पुरै भिज्दा पनि छाता उतै ढल्काइदिनु—पहिलो मायाको भाषा यति नै निस्वार्थ हुँदो रहेछ।\n\nअचानक बर्सिएको साँझको झरीमा किताब छातीमा च्यापेर बस स्टपमा चिसिएर उभिरहँदा कसैले एक शब्द नसोधी टाउकोमाथि छाता ओढाइदिन्छ भने मन सिसा झैँ पग्लिन्छ। केटाले कहिल्यै भन्दैन 'म तिम्रो ख्याल राख्छु' भनेर, ऊ त केवल आफ्नो देब्रे कुम र कपाल पानीमा छोडिदिन्छ ताकि छेउमा उभिएकी मान्छेका किताब र परेलीमा एक थोपा पानी नपरोस्।\n\nजब उनले अचानक छेउमा फर्केर उसको निथ्रुक्क भिजेको कोट देखिन्, त्यो एक हेराइमा धन्यवादभन्दा धेरै गहिरो केही लुकेको थियो। झरी त बाहिर परिरहेको थियो, तर त्यो सानो छातामुनि दुई अपरिचित हृदयको बीचमा एउटा न्यानो संसार बिस्तारै जन्मिसकेको थियो।\n\n#RainyDayLove #TeenageRomance #UnspokenFeelings #NepaliLove #MonsoonVibes"
  },
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "CLASSROOM", title: "Margin Sketch Caught",
    beat: "Caught drawing her in the corner of his notebook.",
    shot: "Quiet library corner by the sunlit window. Close-up over Aarav's shoulder as his pencil shades a delicate sketch of Aanya's profile with her pink ribbon in his notebook margin. He glances across the wooden table—Aanya has lowered her textbook and is watching him with a knowing, gentle smile. Embarrassed, Aarav slams the notebook shut as a blush creeps up his neck.",
    mood: "Sound: soft pencil scratching on paper stopping abruptly, delicate music-box chime.",
    cap: "पुस्तकको कुनामा कोरिएको एउटा सानो चित्रले जब मनको सबैभन्दा ठुलो गोप्य रहस्य खोलिदिन्छ!\n\nपढ्न भनेर खोलिएका किताबका पानाहरूबीच मन भने अर्कै अनुहारमा अल्झिएको हुन्छ। पुस्तकालयको शान्त कुनामा झ्यालबाट आएको घाममा सिसाकलमले उसकै कपालको गुलाबी रिबन र अनुहार कोर्दै गर्दा लाग्छ—कसैले देख्ने छैन होला। तर जसै आँखा उचालेर टेबुलपारि हेरिन्छ, सामुन्ने उही अनुहार हल्का मुस्कुराउँदै चुपचाप हेरिरहेको भेटिन्छ।\n\nत्यो बेला हतारमा कापी बन्द गर्दा मुटु यति जोरले धड्किन्छ कि लाग्छ पूरा हलले सुन्दैछ। अनि अनुहारमा चढेको त्यो लाली र झुकिएको नजर देखेर उता पनि एक प्यारो मुस्कान फुल्छ—मानौँ त्यो अधुरो स्केचले कहिल्यै बोल्न नसकिने कुरा क्षणभरमै भनिदियो।\n\n#NotebookSketch #LibraryCrush #TeenageFeelings #SilentRomance #FirstLoveVibes"
  },
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "The Dropped Pink Ribbon",
    beat: "Chasing after her just to return a ribbon and keep the moment alive.",
    shot: "Aanya walks down stone hillside steps after school; her pale-pink silk ribbon slips from her hair onto the steps without her noticing. Aarav spots it, picks it up carefully, and sprints down the steps to catch up before the corner gate. Breathless, he holds the ribbon out on his open palm; Aanya touches her loose hair in surprise, smiles warmly, and takes it while their hands linger.",
    mood: "Sound: quick running footsteps on stone, wind in pine needles, uplifting soft piano arpeggio.",
    cap: "कहिलेकाहीँ खसेको एउटा रिबन फिर्ता गर्नु केवल बहाना हुन्छ—त्यो मान्छेसँग दुई पल अझै नजिक उभिन पाउन।\n\nछुट्टीपछिको ओरालो बाटोमा हिँड्दै गर्दा कपालबाट खुस्केर ढुङ्गाको सिँढीमा खसेको हल्का गुलाबी रिबनले एउटा पूरै कथा जोडिदिन्छ। धुलो टक्टक्याएर सास फुल्ने गरी दौडेर अगाडि आउँदै हत्केलामा त्यो रिबन राखिदिँदा उसको आँखामा केवल वस्तु फिर्ता गर्ने हतार मात्र हुँदैन, बरु 'एकछिन रोक न' भन्ने मौन आग्रह लुकेको हुन्छ।\n\nजब उनले आश्चर्य मान्दै खुल्ला कपाल छोएर त्यो रिबन समात्छिन् र हात एक सेकेन्ड त्यही हत्केलामा अडिन्छ, त्यो हल्का चिसो रेशमी रिबनमा दुवैको कोमल विश्वास बाँधिन थाल्छ। युवावस्थाका यस्ता स–साना दौडाइ र थर्थराएका हातहरू जीवनभरका सबैभन्दा उज्याला सम्झना बनिदिन्छन्।\n\n#PinkRibbon #TeenageStory #InnocentLove #NepaliYouth #SilentFilm"
  },
  {
    act: "act1", who: ["AARAV", "AANYA"], loc: "BUS_STOP", title: "One Wired Earbud Offered",
    beat: "Sharing music on a golden-hour window seat.",
    shot: "Inside a gently swaying local bus at golden hour, warm sunlight striping Aanya's cream cardigan and Aarav's olive hoodie. Aanya wears one white wired earbud and shyly holds out the second earbud toward Aarav, seated beside her. Aarav carefully places it in his ear; both stare straight ahead out the window as identical shy smiles bloom on their faces. Close-up two-shot.",
    mood: "Sound: low warm bus hum, muffled click of earbud, warm lo-fi nostalgic synth pad.",
    cap: "एउटै गीत, एउटै इयरफोन अनि एउटै झ्यालबाहिरको साँझ—एक शब्द नबोली पनि मन एउटै लयमा नाच्न थाल्यो।\n\nसाँझको हल्लिने बसको पछाडिको सिटमा घामको सुन्तले किरण अनुहारमा परिरहँदा जब छेउबाट कसैले चुपचाप अर्को इयरफोन हाततिर बढाइदिन्छ नि, त्यो बेला संसारको सारा कोलाहल थामिन्छ। तारले जोडिएका दुई कानहरू मात्र होइन, त्यो एउटा गीतको धुनभित्र दुई अनभिज्ञ मनहरू एकअर्काको सास सुन्न थाल्छन्।\n\nदुवै जना अगाडि बाटोतिर हेर्दैछन्, एकअर्कातिर फर्केका पनि छैनन्, तर झ्यालको सिसामा देखिने प्रतिबिम्बमा उस्तै लजालु मुस्कान चुपचाप मुस्कुराइरहेको छ। किशोर उमेरको माया यस्तै हुन्छ—सजिलो, लजालु, र एउटा तीन मिनेटको गीत भरिमै पूरा जिन्दगी बुन्न सक्ने।\n\n#BusWindow #SharingMusic #TeenageLoveVibes #CrushToLove #SilentStorytelling"
  },

  // Act II: Falling in Love (7-12)
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "Steam Between Two Clay Cups",
    beat: "Growing closeness — pinky fingers resting inches apart.",
    shot: "Dusk at the brick rooftop chiya stall beneath glowing fairy lights. Two steaming clay cups sit on the weathered wooden table. Extreme close-up of Aarav's and Aanya's hands resting palm-down on the table, pinky fingers barely an inch apart, twitching slightly as neither dares to bridge the gap yet, while steam curls upward past their smiling faces in soft background blur.",
    mood: "Sound: evening city crickets, clink of clay cup, gentle heartbeat-tempo felt piano.",
    cap: "टेबुलमा दुई कप तातो चिया र दुई हातहरूबीचको एक इन्च दूरी—तर त्यो एक इन्च पार गर्न पूरा हिम्मत चाहिएको थियो।\n\nसाँझको सानो छतको चिया पसलमा झुन्डिएका पहेँला बत्तीहरूमुनि चियाको बाफ जसरी आकाशतिर उड्दैछ, उस्तै गरी दुई किशोर मनभित्रको धुकधुकी पनि बढ्दैछ। टेबुलमा राखिएका हातहरू एक इन्चको दूरीमा छन्; कान्छी औँला हल्का चल्मलाउँछन् तर अझै छुने आँट आइसकेको छैन।\n\nप्रेममा स्वीकृतिभन्दा पहिलेको त्यो पर्खाइ कति मीठो हुँदो रहेछ! न बोल्ने आँट छ, न हात हटाउने मन। केवल चियाको न्यानोपन र त्यो एक इन्च खाली ठाउँमा लुकेको हजारौँ नभनिएका भावनाहरूले त्यो साँझलाई जीवनभर नबिर्सिने बनाइदियो।\n\n#RooftopChiya #AlmostHoldingHands #FallingInLove #NepaliRomance #TeenageLove"
  },
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "Fingers Intertwined",
    beat: "The unspoken confession — holding hands for the first time.",
    shot: "Direct continuation on the rooftop wooden table under warm amber light. Aarav slowly shifts his hand until his pinky hooks around Aanya's; she doesn't pull away. Slowly he slides his palm over hers and she turns her hand to intertwine their fingers tightly. Camera tilts smoothly up from their locked hands to Aanya resting her cheek gently against his shoulder, eyes glowing.",
    mood: "Sound: distant evening breeze, warm string swell rising tenderly.",
    cap: "जब कान्छी औँलामा औँला बेरिए र हात पछाडि हटेन—त्यही मौनतामा सबैभन्दा ठुलो स्वीकारोक्ति लेखियो।\n\nपहिले डर लाग्थ्यो—कतै हात छुँदा ऊ रिसाउने पो हो कि, कतै हात तान्ने पो हो कि भनेर। तर जब बिस्तारै काँपेका औँलाहरूले अर्को हातको न्यानोपन भेटे र उताबाट झन् कसिलो गरी हत्केला पक्रियो नि, त्यो एक पलमा वर्षौँको धुकधुकी शान्त भयो।\n\nकुनै 'आई लभ यू' भन्नु परेन, कुनै कसम खानु परेन; उनको टाउको बिस्तारै उसको काँधमा आएर अडिनु नै संसारको सबैभन्दा सुरक्षित घर भेटिए झैँ थियो। पहिलो पटक कसैको हात यसरी थाम्दा मान्छेलाई लाग्छ—अब जीवनमा जस्तोसुकै आँधी आए पनि यिनै औँलाहरूले कहिल्यै छोड्ने छैनन्।\n\n#FirstHold #IntertwinedFingers #SilentConfession #PureLove #TeenageVibes"
  },
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "STREET_ROOM", title: "Sparkler Light in Her Eyes",
    beat: "Seeing the whole world glow in her laughter.",
    shot: "Warm festive evening lane strung with golden fairy lights. Aanya holds a crackling handheld sparkler, spinning slowly in her cream cardigan with pure joy as golden sparks reflect in her eyes. Aarav stands three steps back holding a sparkler that has already burned down, completely mesmerized watching only her face in slow motion. Shallow-depth bokeh portrait.",
    mood: "Sound: delicate fizzing crackle of sparkler fading under soaring romantic strings.",
    cap: "हाथको झिल्का त कैले निभिसक्यो, तर तिम्रो आँखामा चम्किएको उज्यालो हेर्दाहेर्दै म आफैँ हराइसकेँ।\n\nतिहारको जस्तो झिलिमिली साँझमा चारैतिर रङ्गीन बत्ती र झिल्झिले बलेका छन्, तर एक जना मान्छे त्यस्तो हुन्छ जसको पूरा संसार नै केवल सामुन्ने हाँसिरहेकी एउटी मान्छेको अनुहारमा सीमित हुन्छ। उनको निश्चल हाँसोमा सुनौला झिल्काहरू प्रतिबिम्बित हुँदा समय नै स्लो मोसनमा चल्न थाल्छ।\n\nआफ्नो हातको बत्ती निभेर अँध्यारो भइसक्दा पनि उसलाई कुनै प्रवाह छैन, किनकि उसको लागि उज्यालो त्यो झिल्का होइन—उही मान्छे बनिसकेकी थिई। साँचो मायामा कसैलाई यति एकोहोरो हेरिरहन मन लाग्छ कि संसारको सारा सौन्दर्य एउटै अनुहारमा समेटिए झैँ लाग्छ।\n\n#SparklerNights #SeeingTheWorldInHer #TeenageLove #NepaliFestiveVibes #HeartTouching"
  },
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "The Pink Ribbon Tied on His Wrist",
    beat: "A silent promise tied beside his silver watch.",
    shot: "Sitting side by side on the mossy stone hillside bench overlooking misty green valleys. Aanya unties the pale-pink silk ribbon from her hair, gently lifts Aarav's left wrist next to his silver wristwatch, and ties the ribbon into a neat bow around his wrist. She pats the knot softly and looks up through her lashes; Aarav curls his fingers around hers with tender pride.",
    mood: "Sound: rustle of silk ribbon, soft mountain wind, warm acoustic fingerpicking.",
    cap: "एउटा सानो गुलाबी रिबन नाडीमा बाँधिएको के थियो—त्यसमा हजारौँ नभनिएका वाचा र विश्वास बाँधिए।\n\nडाँडाको चिसो हावा चलिरहेको शान्त बेन्चमा बसेर जब उनले आफ्नो कपालको प्रिय रिबन खोलिन् र उसको घडीको छेवैमा नाडीमा बाँधिदिइन्, त्यो केवल सजावटको धागो थिएन। त्यो त 'म तिम्रो हरेक समय र पलसँग जोडिन चाहन्छु' भन्ने एउटा निश्चल हस्ताक्षर थियो।\n\nउसले नाडीमा बाँधिएको त्यो गाँठोलाई हीरा जस्तै जतनले हेर्दै उनका हात कसिलो समात्यो। किशोर प्रेम कति सस्तो चिजमा अडिन्छ नि है—कुनै महँगो उपहार होइन, बस एकअर्काको सम्झना बोक्ने एउटा सानो कपडाको टुक्रा नै जीवनभरको सम्पत्ति लाग्दो रहेछ।\n\n#PromiseRibbon #LittlePromises #TeenageLoveStory #SilentCinema #ForeverVibes"
  },
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "Foreheads Resting at Sunset",
    beat: "Pure quiet intimacy without a single word.",
    shot: "Golden sunset under a blooming hillside tree, backlit hair glowing in honey light. Aarav reaches up slowly and tucks a windblown strand of hair behind Aanya's ear, his fingertips lingering on her cheek. Aanya leans into his palm and closes her eyes; Aarav gently rests his forehead against hers as both breathe slowly in stillness. Close-up profile silhouette.",
    mood: "Sound: gentle rustle of leaves, warm breathing silence, lush emotional piano and violin.",
    cap: "जब निधारमा निधार अडिन्छ र आँखा बन्द हुन्छन्, त्यो मौनतामा शब्दभन्दा धेरै ठूलो प्रेम सास फेर्छ।\n\nअस्ताउँदै गरेको घामको सुनौलो किरणले कपाल र पातहरू चम्किरहेका बेला हावाले गालामा झारेको कपाल कानपछाडि सारिदिनु, र अर्कोले आँखा चिम्लेर त्यो हत्केलाको न्यानोमा आफूलाई सुम्पिनु—यसभन्दा शान्त स्वर्ग अरू कहाँ होला र?\n\nन त्यहाँ कुनै डर थियो, न भोलिको चिन्ता; केवल दुई जनाको एकनासको श्वासप्रश्वास र सामीप्यको अद्भुत शान्ति थियो। त्यो एक क्षणले सिखायो कि संसारका सबैभन्दा गहिरा भावनाहरू आवाजमा होइन, कसैको काख र निधारको न्यानो स्पर्शमा बाँचिरहेका हुन्छन्।\n\n#SunsetLove #PureIntimacy #SilentRomance #TeenageLove #HeartTouchingStory"
  },
  {
    act: "act2", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "Bicycle Ride into Dusk",
    beat: "Carefree teenage freedom on two wheels.",
    shot: "Aarav pedals an old vintage bicycle down a winding hillside road bathed in rose-gold sunset light; Aanya sits sideways on the rear carrier, wrapping both arms securely around his waist and resting her cheek lightly against his back, her pale hair streaming behind them. Smooth tracking side-shot as they glide toward the horizon.",
    mood: "Sound: whirring bicycle chain and spokes, wind rushing past, joyful nostalgic indie guitar.",
    cap: "एउटा पुरानो साइकल, ओरालो बाटो अनि कम्मरमा बेरिएका हातहरू—लाग्थ्यो यो साँझ कहिल्यै नसकियोस्।\n\nन महँगो गाडी चाहिएको थियो, न पाँचतारे रेस्टुरेन्ट; एउटा पुरानो साइकलको पछाडिको क्यारियरमा बसेर उसको ढाडमा गाला अड्याउन पाउनु नै त्यो उमेरको सबैभन्दा ठूलो विलासिता थियो। साँझको हावाले कपाल उडाइरहँदा र साइकलको पाङ्ग्रा गुँजिरहँदा लाग्थ्यो—पूरा ब्रह्माण्ड नै हामी दुईका लागि मात्र रोकिएको छ।\n\nत्यो बेला भविष्यको कुनै हिसाब किताब थिएन, बिछोडको त कल्पना पनि थिएन। केवल त्यो सडक कहिल्यै नटुङ्गियोस् अनि कम्मरमा कस्सिएका ती हातहरू जन्मौँजन्म उस्तै रहुन् भन्ने एउटै कामना मनमा चलिरहन्थ्यो।\n\n#BicycleMemories #GoldenDays #CarefreeYouth #TeenageLoveVibes #NepaliMemories"
  },

  // Act III: Golden Days of Young Love (13-18)
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "Spinning in the Sun-Shower",
    beat: "Dancing recklessly in warm summer rain.",
    shot: "Warm golden sun-shower rain glistens across the rooftop. Aanya throws her head back laughing in the rain, grabs both of Aarav's hands, and pulls him out from under the shelter to spin together in circles, droplets glittering in the sunlight around them. Both collapse breathless against the parapet wall laughing silently eye-to-eye. Energetic handheld circular shot.",
    mood: "Sound: sparkling summer rainfall, splashing footsteps, warm euphoric instrumental melody.",
    cap: "घाम लाग्दालाग्दै परेको झरीमा दुनियाँ बिर्सेर फनफनी घुम्दा लाग्थ्यो—समयले हामीलाई कहिल्यै छुने छैन।\n\nप्रेम आफ्नो शिखरमा हुँदा मान्छे सानो बच्चा जस्तै निर्दोष बनिदिन्छ—भिजिने वा बिरामी परिने कुनै प्रवाह नगरी अर्काको हात तानेर खुलेको आकाशमुनि नाच्न मन लाग्छ। घामका थोपाहरू पानीमा टल्किरहँदा आँखामा आँखा जुधाएर बिनाकारण हाँस्नुको मजा शब्दमा कसरी अट्ला र!\n\nआज पछाडि फर्केर हेर्दा लाग्छ—जीवनका ती केही सेकेन्डहरूमा हामी साँच्चै अमर थियौँ। पछि जे जति आँसु बगे पनि, त्यो घाम–पानीमा मुस्कुराएको तिमी र म सधैँ उही छतमा ताजा भएर बाँचिरहनेछौँ।\n\n#SunShower #DancingInTheRain #GoldenLove #TeenageMemories #HappyTimes"
  },
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "Instant Camera Cheek Kiss",
    beat: "Capturing a frozen second of pure happiness.",
    shot: "Sitting close on the wooden hillside bench overlooking bright valley clouds. Aarav holds up a vintage instant camera at arm's length for a self-portrait; right as his finger presses the shutter, Aanya turns and plants a quick, playful kiss on his cheek. The flash pops, Aarav looks over in stunned delight, and both watch the white photo print slowly emerge.",
    mood: "Sound: mechanical shutter click and film motor whirr, playful warm ukulele & piano.",
    cap: "क्यामेराको एउटा फ्ल्यासमा जीवनको सबैभन्दा निश्छल सेकेन्ड सदाका लागि कैद भयो!\n\nफोटो खिच्न क्यामेरा उचालेको बेला ठिक बटन थिच्ने सेकेन्डमा गालामा परेको त्यो आकस्मिक चुम्बनले मान्छेलाई छक्क मात्र पार्दैन, भित्रको मुटु नै एक क्षण उफ्रिन्छ। त्यो अचम्म, त्यो लाज अनि हातमा निस्कँदै गरेको त्यो सानो कागजको फोटोमा फुलेका दुवैको मुस्कान कुनै चलचित्रभन्दा कम थिएन।\n\nफोटो खिच्दा कसले पो सोचेको हुन्छ र—भोलि मान्छे जीवनबाट टाढा भएपछि त्यही एउटा सानो तस्बिर नै रातको अँध्यारोमा मुटुमा टाँसेर रुनको लागि बाँकी रहनेछ भनेर! त्यो सेकेन्ड त उतिखेरै बित्यो, तर त्यो कागज अझै जिउँदो भएर बोलिरहन्छ।\n\n#PolaroidMemory #CheekKiss #FrozenMoment #TeenageLoveStory #Bittersweet"
  },
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "BUS_STOP", title: "Shielding Her Eyes on the Bus",
    beat: "Small silent gestures of tenderness.",
    shot: "Inside the quiet morning bus, Aanya sleeps peacefully with her head resting on Aarav's olive-hoodie shoulder, her hand curled near his silver watch and pink wrist ribbon. Harsh sunbeams sweep through the bus window onto her closed eyelids. Without waking her, Aarav gently raises his free hand like a shade to block the sunlight from her face and watches her sleep fondly.",
    mood: "Sound: rhythmic soft bus rumble, warm gentle ambient piano chords.",
    cap: "माया ठूलो उपहारमा होइन, सुतिरहेकी मान्छेको आँखामा घाम नपरोस् भनेर बिस्तारै हातले छाया पारिदिनुमा हुन्छ।\n\nबिहानको यात्रामा काँधमा टाउको अड्याएर निदाएकी ऊ कति निश्चिन्त देखिन्थिई—मानौँ यो काँधमा अडेस लागेपछि उसलाई संसारको कुनै घाम, हुरी वा डरले छुनै सक्दैन। झ्यालबाट एक्कासि चर्को घाम उनको बन्द परेलीमा पर्न थाल्दा उसले न त सिसा तान्यो न उनलाई उठायो; बरु चुपचाप आफ्नो अर्को हात उचालेर आँखामाथि छाया बनाइदियो।\n\nहाम्रो जीवनमा साँचो माया देखाउने अवसर सधैँ ठूला घटनामा आउँदैनन्; यस्तै साना–साना कोमल व्यवहारले बताउँछ कि कसैको नजरमा तिम्रो निद्रा र आराम कति मूल्यवान् छ। ऊ सुतिरहेकी थिई, र ऊ उनैलाई हेरेर आफ्नो हरेक थकान भुलिरहेको थियो।\n\n#LittleThingsInLove #GentleCare #BusJourney #TeenageRomance #SilentLove"
  },
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "Two Paper Boats Drifting Together",
    beat: "Two little paper boats sailing side by side.",
    shot: "Crouching together on smooth river stones beside the clear shallow mountain stream. Aarav and Aanya each hold a crisp folded white paper boat. On a shared nod, they lower both boats into the sparkling current simultaneously. The camera follows low over the water as the two paper boats drift side by side, gently bumping together around mossy pebbles.",
    mood: "Sound: clear babbling mountain stream, gentle acoustic guitar duet.",
    cap: "खोलाको सङ्लो पानीमा सँगै छोडिएका ती दुई कागजका डुङ्गाहरू, जो कहिल्यै अलग नहुने रहरमा बग्दै गए।\n\nसानो खोल्साको किनारमा ढुङ्गामा बसेर एउटै कापीको पानाबाट पट्याइएका दुई सेता डुङ्गा पानीमा छोड्दा बाल्यकाल र जवानी एकै ठाउँमा मिसिएका थिए। पानीको छालसँगै जब दुवै डुङ्गा एकअर्कासँग ठोक्किँदै सँगसँगै बग्न थाले, दुवैको अनुहारमा अनौठो जितको खुसी देखियो—मानौँ पानीले पनि हाम्रो साथ स्वीकार्यो।\n\nतर त्यस बेला कसलाई पो थाहा थियो र कि कागजको डुङ्गा अनि समयको धार कति कमजोर र अप्रत्याशित हुन्छन्! सङ्लो पानी त अझै उस्तै बग्छ होला त्यो पहाडमा, बस आज त्यहाँ दुई डुङ्गा एकसाथ तैरिन छोडिसके।\n\n#PaperBoats #StreamSide #YoungLoveMemories #TeenageVibes #Innocence"
  },
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "One Scarf for Two in Morning Mist",
    beat: "Sharing warmth in cold winter mist.",
    shot: "Chilly misty morning on the pine trail; faint visible breath in the crisp air. Aanya shivers slightly, rubbing her hands together. Aarav unwinds his long warm plaid wool scarf from his neck and loops the other half snugly around Aanya's neck, gently tugging the ends until they stand nose-to-nose inside the same scarf, grinning shyly.",
    mood: "Sound: crisp morning breeze in pines, soft cloth rustle, tender warm string melody.",
    cap: "पुस–माघको कठ्याङ्ग्रिने बिहानीमा एउटै गलबन्दीभित्र अडिएका दुई अनुहार—जाडो बाहिर थियो, भित्र त बस न्यानो माया!\n\nहुस्सुले ढाकेको सल्लाघारीको चिसो बिहानीमा जब उनको हात काँप्न थाले, उसले एक पल नसोची आफ्नो गलाको तातो गलबन्दी आधा निकालेर उनको गलामा बेरिदियो। र जब गलबन्दीको दुवै छेउ हल्का तानियो, दुई चिसिएका नाक र मुस्कुराएका ओठहरू एक कदमको दूरीमा नजिक आए।\n\nमायाले मौसम नै बदलिदिन्छ भन्छन् नि, साँच्चै रहेछ—चिसो सिरेटो चलिरहँदा पनि त्यो एउटै ऊनीको धागोभित्र दुई मुटु यति तातो भएर धड्किरहेका थिए कि लाग्थ्यो त्यो हुस्सुभित्र पूरा संसार सुरक्षित छ।\n\n#WinterRomance #OneScarfTwoHearts #MorningMist #TeenageLove #NepaliHills"
  },
  {
    act: "act3", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "The Origami Ring at Sunset",
    beat: "A tiny folded paper ring worth more than gold.",
    shot: "At the rooftop parapet under a blazing apricot sunset. Aarav carefully takes a tiny folded paper ring from his blazer pocket, lifts Aanya's left hand, and slips it onto her ring finger. Aanya gasps quietly, holds her hand up against the glowing sunset sky to admire the humble paper ring, then wraps her arms tightly around Aarav's neck.",
    mood: "Sound: gentle evening wind, soaring nostalgic piano & strings peak.",
    cap: "सुन–चाँदीको कहाँ थियो र त्यो, केवल एउटा पट्याइएको कागजको औँठी—तर त्यसको मोल सारा संसारभन्दा माथि थियो!\n\nकमाउने उमेर थिएन, हातमा ठूलो रित्तो खल्तीबाहेक केही थिएन; तर मनमा भने उनलाई जीवनभर आफ्नो बनाउने अथाह सपना थियो। त्यसैले पकेटबाट जतनले झिकेको त्यो सानो कागजको औँठी जब उसले औँलामा पहिराइदियो, उनको आँखामा देखिएको चमक कुनै हिराको औँठीले पनि किन्न सक्दैनथ्यो।\n\nअस्ताउँदो रातो घामतर्फ हात उचालेर त्यो कागजको औँठी हेर्दाहेर्दै जब उनले हतारमा गलामा अँगालो हालिन् नि, त्यो बेला दुवैलाई लागेको थियो—हाम्रो संसार यति सानो, शुद्ध र अनन्त छ कि अब केही कुराले हामीलाई अलग पार्न सक्दैन।\n\n#PaperRing #TeenagePromises #PureLove #GoldenHourRomance #HeartMelting"
  },

  // Act IV: Cracks, Distance & Breakup (19-24)
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "Two Cold Cups of Chiya",
    beat: "The first crack — waiting beside an empty chair.",
    shot: "Overcast twilight at the rooftop chiya stall; muted blue shadows replace the warm lights. Aarav sits alone at the weathered wooden table in front of two untouched clay cups whose steam has completely vanished. He checks his silver wristwatch—with the faded pink ribbon still tied beside it—glances toward the empty staircase door, and slowly lowers his eyes.",
    mood: "Sound: cold wind humming across empty rooftop, slow hollow ticking, sparse minor piano.",
    cap: "चिया त सेलायो नै, तर सँगै बितेका वर्षौँको न्यानोपन पनि त्यो खाली कुर्सीमै बिस्तारै चिसिन थाल्यो।\n\nउही पुरानो छत, उही काठको टेबुल अनि उही दुई कप माटाको चिया—तर आज वातावरणमा त्यो पहिलेको सुनौलो उज्यालो छैन। घडीको सुई घुमिरहँदा नाडीमा बाँधिएको फिक्का भइसकेको गुलाबी रिबनतिर हेरेर छतको ढोकातिर आँखा तानिँदा आज त्यहाँ कोही उक्लिरहेको देखिँदैन।\n\nसम्बन्ध एकैदिनमा झर्याम्म टुट्दैन रहेछ; ऊ त पहिले यस्तै एक–एक गर्दै टारिएका भेटघाट, बाफ उडेर चिसिएका चिया र जवाफ नआउने प्रतीक्षाबाट भित्रभित्रै कमजोर हुँदै जाँदो रहेछ। कसैले आउँछु भनेर नआउँदाको चिसोपन कपको चियाभन्दा धेरै चिसो हुँदो रहेछ।\n\n#ColdTea #WaitingInVain #DistanceBegins #Heartbreak #TeenageLoveEnding"
  },
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "HILLSIDE", title: "Walking Together, Worlds Apart",
    beat: "Walking side by side while the gap grows wider.",
    shot: "Grey overcast pine trail. Aarav and Aanya walk side by side, yet a noticeable cold gap separates them, eyes fixed straight ahead instead of on each other. Halfway down the trail, Aarav reaches sideways to gently take her hand; Aanya glances down at his reaching fingers, hesitates, and quietly slips both hands deep into her cardigan pockets. Aarav's hand drops empty.",
    mood: "Sound: heavy footsteps on damp pine needles, cold wind, lonely cello drone.",
    cap: "पहिले एउटै गलबन्दीमा अट्ने दुई मान्छे, आज छेउछेउ हिँड्दा पनि बीचमा एउटा सिङ्गो महासागर जस्तो दूरी छ।\n\nकतै झगडा भएको आवाज छैन, कसैले गाली गरेको पनि छैन; बस आँखाहरू अब एकअर्कालाई खोज्दैनन्, बरु भुइँ र अगाडिको बाटोमा टाँसिएका छन्। हिँड्दाहिँड्दै जब उसले बानी अनुसार बिस्तारै हात समात्न औँला बढायो नि, त्यो हातलाई एक सेकेन्ड हेरेर उनले चुपचाप दुवै हात आफ्नै स्वेटरको खल्तीभित्र लुकाइदिइन्।\n\nहावामै रित्तो भएर तल झरेको त्यो हातको पीडा कसैलाई सुनाएर बुझाउन सकिँदैन। एउटै बाटोमा सँगै हिँड्नु र साँच्चै साथमा हुनुमा कति आकाश–पातालको फरक हुन्छ भन्ने कुरा त्यो दिन सल्लाघारीको चिसो हावाले सिकाइदियो।\n\n#GrowingApart #EmptyHand #SilentHeartbreak #TeenageBreakup #EmotionalScene"
  },
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "STREET_ROOM", title: "The Unanswered Call in the Rain",
    beat: "Waiting in the rain while she turns the phone away.",
    shot: "Split-mood visual parallel via slow pan or window-to-street composition: outside under the pouring bus shelter, drenched Aarav clutches his phone to his ear staring anxiously down the empty road; inside her dimly lit bedroom, Aanya sits by the rain-streaked glass, looks down at her vibrating phone screen glowing in the dark, wipes a tear, and turns the phone face-down on the desk.",
    mood: "Sound: heavy drumming rain, muffled phone vibration on wood, aching slow piano notes.",
    cap: "पानीमा भिजेर 'एक पटक मात्र आवाज सुनूँ' भन्ने तड्प, अनि कोठाभित्र रोएरै फोन घोप्ट्याउनु पर्ने बाध्यता!\n\nजीवनका मोडहरू सधैँ कोही खराब भएकै कारण मात्र छुट्दैनन् रहेछन्; कहिलेकाहीँ दुवै जनाको आँखामा आँसु हुँदाहुँदै पनि परिस्थिति र चिसिएको विश्वासले बीचमा अग्लो पर्खाल खडा गरिदिन्छ। बाहिर बस स्टपमा निथ्रुक्क भिजेर रिङ गइरहेको फोन कानमा टाँसेर ऊ बाटो हेरिरहेछ—सायद आज सबै ठीक होला कि भन्ने अन्तिम आशामा।\n\nर उता बन्द कोठाको अँध्यारोमा झ्यालको झरी हेर्दै रोइरहेकी उनले काँपेको हातले बजिरहेको फोन स्क्रिन घोप्ट्याएर राख्छिन्। त्यो नउठेको कल केवल रिंगटोन थिएन—त्यो दुई जनाको टुट्दै गरेको संसारको अन्तिम चीत्कार थियो।\n\n#UnansweredCall #RainyHeartbreak #SilentTears #TeenageLoveStory #Broken"
  },
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "STREET_ROOM", title: "Silent Plea Under the Streetlight",
    beat: "The final argument without a single spoken word.",
    shot: "Night rain beneath an amber streetlight casting long wet shadows on asphalt. Aarav catches up to Aanya, gently gripping her shoulders with desperation and pleading eyes. Aanya looks up at him through streaming tears, trembles, slowly lifts his hands off her shoulders, shakes her head 'no' softly, and takes one decisive step backward into the cold shadow.",
    mood: "Sound: pouring rain on pavement, ragged breath, dramatic heartbreaking violin swell.",
    cap: "न कोही चिल्लायो, न एक शब्द बोलियो—बस झरीमुनि दुई जोडी आँखाहरूले 'अब सकियो' भनेर स्वीकार्न बाध्य भए।\n\nसडक बत्तीको पहेँलो उज्यालोमा पानीका थोपाहरू खसिरहँदा उसले रोक्ने अन्तिम कोसिसमा काँध समात्यो; उसका आँखामा केवल एउटै मौन बिन्ती थियो—'हामी अझै सम्हाल्न सक्छौँ नि, नजाऊ न!' तर आँसुले धमिलिएका उनका आँखामा आज उत्तर होइन, केवल थाकेको एउटा लाचारी थियो।\n\nजब उनले काँपिरहेका हातहरूले बिस्तारै उसको हात आफ्नो काँधबाट हटाइन् र अँध्यारोतर्फ एक पाइला पछाडि सरिन् नि, त्यो एक पाइलाले सिङ्गो मुटुलाई हजार टुक्रा पारिदियो। प्रेममा सबैभन्दा गाह्रो क्षण त्यो होइन जब मान्छे रिसाएर कराउँछ—सबैभन्दा दर्दनाक त त्यो पल हो जब ऊ रोएरै चुपचाप पछाडि सर्छ।\n\n#BreakupInRain #SilentPlea #LettingGoHurts #NepaliSadStory #TeenageLove"
  },
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "STREET_ROOM", title: "Untying the Pink Ribbon",
    beat: "Giving back the symbol of every promise.",
    shot: "Extreme close-up under cold streetlight rain. Raindrops slide down Aanya's pale-pink hair ribbon tied on Aarav's wrist beside his silver watch. With trembling fingers, Aanya slowly unties the knot she once made. She slides the wet pink ribbon and the damp origami paper ring off her finger, places both gently into Aarav's open palm, folds his fingers closed over them, and walks out of frame.",
    mood: "Sound: pouring rain, soft gasp, a single shattering low piano chord ringing out.",
    cap: "जुन हातले रहरै रहरमा नाडीमा वाचा बाँधेको थियो, आज त्यही काँपेको हातले झरीमा त्यो गाँठो खोलेर फिर्ता गर्यो।\n\nवर्षौँसम्म पानी, घाम र समय सहेर नाडीमा टिकिरहेको त्यो गुलाबी रिबन र औँलाको त्यो सानो कागजको औँठी आज भिजेका छन्। जब उनले बिस्तारै त्यो गाँठो फुकाइन्, लाग्यो नाडीको धागो होइन, छातीभित्रको सास नै कोही उखेलिरहेको छ।\n\nउसको खुल्ला हत्केलामा त्यो भिजेको रिबन र कागजको औँठी राखेर जब उनले उसका औँलाहरू मुठी पारेर बन्द गरिदिइन् अनि अँध्यारो सडकतिर लागिन्—त्यो मुठीभित्र आज प्रेम होइन, केवल अतीतको चिसो लास बाँकी थियो।\n\n#ReturningMemories #PinkRibbon #HeartShattering #BreakupScene #SilentPain"
  },
  {
    act: "act4", who: ["AARAV", "AANYA"], loc: "BUS_STOP", title: "Red Taillights in the Rain",
    beat: "Watching them disappear into the rainy night.",
    shot: "Aanya sits inside the departing night bus looking back through the rain-streaked rear window, resting her palm against the cold glass as silent tears fall down her cheeks. Outside on the glistening wet street, Aarav stands completely motionless in the downpour clutching the wet ribbon in his fist as the bus pulls away and its red taillights blur into bokeh.",
    mood: "Sound: heavy bus engine fading into distance, steady rain, mournful solo cello.",
    cap: "रातो बत्तीहरू झरीमा धमिलो हुँदै हराए, र एउटै सहरभित्र दुई मान्छे सधैँका लागि अन्जान बन्न सुरु गरे।\n\nजुन बसको सिटमा कहिल्यै एउटै इयरफोन बाँडेर सुनौलो साँझ हेरेका थियौँ, आज त्यही बसको पछाडिको सिसामा चिसो हत्केला अड्याएर उनी रुँदै टाढिँदै छिन्। र बाहिर त्यही बस स्टपमा जहाँ कहिल्यै एउटा छाताले दुवैलाई जोगाएको थियो, आज निथ्रुक्क भिजेर मुठीमा भिजेको रिबन च्यापेर ऊ एक्लै उभिइरहेछ।\n\nबस अगाडि बढ्यो, सडकको रातो बत्ती पानीका थोपाहरूमा घुल्दै गायब भयो, तर त्यो बिदाइको सन्नाटा आजसम्म मनको कुनामा रोकिएकै छ। केही बिछोड यस्ता हुन्छन् जसमा न कसैले पछाडि बोलाउन सक्छ, न कोही फर्केर आउन नै मिल्छ।\n\n#RedTaillights #LastGoodbye #BusInTheRain #TeenageHeartbreak #EmotionalEnding"
  },

  // Act V: Heartbreak, Echoes & Healing (25-30)
  {
    act: "act5", who: ["AARAV"], loc: "CLASSROOM", title: "The Empty Desk Next to Him",
    beat: "Returning to the room where everything started, now empty.",
    shot: "Cold grey morning inside the quiet classroom; pale light replaces the old golden sunbeams. Aarav sits at his wooden desk and stares sideways at the empty chair and desk beside him where Aanya used to sit. Slowly he lowers his forehead onto his folded arms on the desk, shoulders tightening quietly in the stillness. Slow pull-back through the empty desks.",
    mood: "Sound: faint distant clock ticking, hollow room tone, sparse melancholic piano.",
    cap: "सबैभन्दा धेरै पिडा मान्छे जाँदा होइन, जहाँबाट कथा सुरु भएको थियो त्यही खाली बेन्च देख्दा हुँदो रहेछ।\n\nकक्षाकोठा उही छ, झ्यालबाट छिर्ने उज्यालो पनि उही छ, केवल आज छेउको डेस्क खाली छ—जहाँ कहिल्यै कापीको पाना खस्दा दुई हात ठोक्किएका थिए। दिनभर हल्ला र पढाइ चले पनि आँखा भने बारम्बार त्यही रित्तो कुर्सीमा गएर अड्किन्छन्।\n\nजब सबै बाहिर निस्कन्छन् र कोठा सुनसान हुन्छ, तब टाउको डेस्कमा अड्याएर चुपचाप सास फेर्नुको भार केवल त्यही मान्छेले बुझ्छ जसले आफ्नो पहिलो साँचो प्रेम त्यहीँ गुमाएको हुन्छ। अब न त्यो हाँसो फर्किन्छ, न त्यो रिबन देखिनेछ—बस स्मृतिहरू मात्र भित्तामा टाँसिएका छन्।\n\n#EmptyDesk #MissingYou #SchoolMemories #AfterBreakup #SilentGrief"
  },
  {
    act: "act5", who: ["AARAV"], loc: "HILLSIDE", title: "One Paper Boat Sinking in the Rain",
    beat: "What used to float together now drifts alone.",
    shot: "Low close-up at the rain-swollen hillside stream. Aarav drops a single folded paper boat onto the dark rushing water—no second boat beside it. The solitary boat spins against a wet mossy stone, fills slowly with muddy rainwater, crumples, and sinks beneath the surface ripples while rain rings splash over it.",
    mood: "Sound: rushing rain-swollen water, heavy rain droplets, delicate fading music-box theme.",
    cap: "पहिले तिम्रो र मेरो दुई डुङ्गा सँगै तैरिएका थिए, आज एक्लो डुङ्गा त खोलाको सानो भुमरीमै डुबेर बिलायो।\n\nत्यही पहाडी खोला, तर आज मौसम बदलिएको छ—पानी धमिलो छ र आकाश खनिने गरी झरी परिरहेको छ। आज हातमा दोस्रो डुङ्गा छैन, छेउमा मुस्कुराउँदै 'हेर न' भन्ने कोही छैन। एक्लै छोडिएको त्यो कागजको डुङ्गा ढुङ्गामा ठोक्किएर भिज्दै जाँदा लाग्यो, मेरो हृदयको सारा रहर पनि त्यही पानीभित्र गलिरहेको छ।\n\nकहिलेकाहीँ जीवनमा सँगै देखिएको सपना एक जना छुट्टिएपछि एक्लै बोकेर पार लगाउन कति असम्भव हुँदो रहेछ! डुङ्गा त डुब्यो, तर किनारमा बसेर हेर्ने आँखाले बल्ल सिक्यो—कागजका वाचाहरू तुफान थेग्न सक्दा रहेनछन्।\n\n#SolitaryBoat #SinkingMemories #RainyGrief #BrokenDreams #SilentFilm"
  },
  {
    act: "act5", who: ["AARAV"], loc: "STREET_ROOM", title: "Closing the Keepsake Box",
    beat: "Packing away a whole chapter of teenage love.",
    shot: "Quiet midnight desk lit by a single warm lamp. Aarav carefully places the dried pale-pink ribbon, the instant camera photo of Aanya kissing his cheek, the white wired earbuds, and the origami paper ring inside a small wooden keepsake box. A single tear drops onto the wood lid before he gently closes the brass latch and exhales.",
    mood: "Sound: soft click of wooden box latch, quiet night breeze, gentle nostalgic piano.",
    cap: "एउटा सिङ्गो प्रेमकथा सानो काठको बाकसमा थन्क्याइयो—फाल्न नसकिएका, तर अब बोक्न पनि नसकिने चिनोहरू!\n\nसुकेको गुलाबी रिबन, त्यो अचम्म मानिएको पोलाराइड फोटो, पुरानो सेतो इयरफोन अनि कागजको सानो औँठी—ती सस्ता वस्तुहरूमा कसैको जीवनको सबैभन्दा महँगो दुई वर्ष कैद थियो। मध्यरातको पहेँलो बत्तीमुनि बसेर ती एक–एक चिनो बाकसमा राख्दा हरेक चिजले आफ्नो पुरानो दिन सम्झाउँदै मन चिरिरह्यो।\n\nबाकसको ढक्कनमा एउटा तातो थोपा आँसु खस्यो र ताला बिस्तारै बन्द भयो। सधैँभरि घाउ खोतलेर रुन सकिन्न रहेछ प्रिय—कहिलेकाहीँ अगाडि बढ्नको लागि प्रेमलाई घृणा नगरी सम्मानपूर्वक एउटा बन्द बाकसमा सुरक्षित राख्नु नै उत्तम बाटो हुँदो रहेछ।\n\n#KeepsakeBox #Closure #TeenageLoveChapter #MovingOn #MemoriesLocked"
  },
  {
    act: "act5", who: ["AARAV", "AANYA"], loc: "ROOFTOP_TEA", title: "Fleeting Ghost at the Tea Stall",
    beat: "Muscle memory — still expecting them across the table.",
    shot: "Aarav sits alone at the rooftop chiya table at dusk with one clay cup. Across from him in the empty chair, a soft warm-lit memory apparition of Aanya laughing in her cream cardigan gently fades into focus; Aarav smiles faintly with aching eyes, blinks once, and the chair is completely empty again in cool blue dusk.",
    mood: "Sound: soft evening wind, brief echo of warm string chord fading into silence.",
    cap: "साँझ पर्दा आज पनि आँखा झिम्क्याउँदा लाग्छ—ऊ अझै त्यही पारिपट्टिको कुर्सीमा बसेर मुस्कुराउँदै छे!\n\nपुरानो ठाउँमा एक्लै जाँदाको सबैभन्दा अनौठो पीडा यही हो—दिमागलाई थाहा हुन्छ कि ऊ आउँदिन, तर मनको बानीले अझै चियाको बाफमा उसैको हाँसो खोजिरहन्छ। एक पलको लागि भान हुन्छ मानौँ ऊ क्रिम रङको स्वेटर लगाएर छेउमा हाँस्दै गफ गर्दैछे।\n\nअनायासै ओठमा एउटा सानो उदास मुस्कान फुल्छ, तर जसै परेली एक पटक झिम्किन्छ नि, त्यो सुनौलो छाया चिसो नीलो साँझमा बिलाउँछ र सामुन्ने फेरि त्यही रित्तो काठको कुर्सी मात्र बाँकी रहन्छ। बानी बदल्न वर्षौँ लाग्दो रहेछ, चाहे सम्बन्ध एक साँझमै किन नछुटोस्।\n\n#PhantomMemory #EmptyChair #MissingSomeone #NepaliStory #SilentPain"
  },
  {
    act: "act5", who: ["AARAV", "AANYA"], loc: "STREET_ROOM", title: "Passing as Strangers in Autumn",
    beat: "Months later — forgiving without stopping.",
    shot: "Months later on a crisp golden-autumn neighborhood lane as dry leaves drift across the road. Aarav and Aanya walk in opposite directions in casual autumn coats. As they cross paths, both recognize each other and pause three steps apart, glancing back simultaneously—no anger left, only a gentle, bittersweet forgiving nod and faint sad smile before both turn and walk forward.",
    mood: "Sound: crisp dry leaves crunching underfoot, warm bittersweet strings & piano.",
    cap: "महिनाैँपछि फेरि त्यही बाटोमा भेट भयो—न आँखामा रिस बाँकी थियो, न रोक्ने हक नै; बस एक शान्त मुस्कानले माफी साटासाट भयो।\n\nशरद ऋतुका सुकेका पातहरू उडिरहेको बाटोमा जब पहिलो पटक करिडोरमा जस्तै फेरि विपरीत दिशाबाट पाइलाहरू मिले, आज त्यो पुरानो छटपटी थिएन। तीन पाइला पर पुगेर दुवैले एउटै समयमा पछाडि फर्केर हेरे—तर आज दुवैलाई थाहा थियो कि अब फर्कन मिल्दैन।\n\nर पनि त्यो हेराइमा कुनै घृणा थिएन; मात्र एउटा मीठो–तीतो कृतज्ञता र शान्त स्वीकृति थियो—'तिम्रो जीवन राम्रो होस्, म ठीक छु!' यति भन्न न ओठ चल्यो न आवाज निस्कियो, तर एक हल्का शिर झुकाइ र उदास मुस्कानले वर्षौँको भारी हल्का पारिदियो।\n\n#PassingAsStrangers #QuietForgiveness #AutumnVibes #BittersweetClosure #TeenageLove"
  },
  {
    act: "act5", who: ["AARAV"], loc: "HILLSIDE", title: "Releasing the Ribbon to the Sunrise Wind",
    beat: "Letting go with peace at dawn.",
    shot: "Clear golden sunrise atop the hillside overlooking sunlit mist below. Aarav stands facing the warm morning light, opens his closed fist, and holds the pale-pink silk ribbon up into the breeze. He watches calmly as the wind lifts the ribbon from his fingertips and carries it high into the glowing golden sky. He lowers his hand, closes his eyes breathing in the dawn, and opens them with a quiet, peaceful half-smile. Slow pull-back, final held wide frame.",
    mood: "Sound: fresh morning wind, distant dawn birdsong, warm resolving major piano & cello chord.",
    cap: "जसलाई मुठीमा कसेर राख्दा सास फेर्न गाह्रो हुन्थ्यो, आज बिहानीको हावामा खुल्ला हात छोडिदिँदा मन चरा झैँ हलुका भयो।\n\nबिहानीको सुनौलो घाम डाँडाभरि पोतिँदै गर्दा त्यो पुरानो हल्का गुलाबी रिबन हातमा लिएर आज आँसु बगेन। बरु लामो सास फेरेर जब मुठी खोलियो र पहाडको ताजा हावाले त्यो रिबन औँलाबाट उडाएर उज्यालो आकाशतर्फ लग्यो नि, लाग्यो यो केवल एउटा कपडा उडेको होइन—मेरो मनको सारा पीडा, पर्खाइ र गुनासो पनि मुक्त भयो।\n\nकिशोर उमेरको त्यो पहिलो माया कहिल्यै मर्दैन; ऊ त हामीलाई कोमल, गहिरो र बलियो मान्छे बनाएर जीवनको एक कुनामा सधैँ उज्यालो बनेर बसिदिन्छ। धन्यवाद ती हरेक पलहरूको लागि—अब तिमी पनि खुसी रहनू, र म पनि यो नयाँ बिहानीमा आफ्नै पखेटा लिएर अघि बढेँ।\n\n#LettingGoWithPeace #SunriseHealing #FirstLoveFinale #TeenageLoveVibes #SilentCinema"
  }
];

function teenLovePromptFor(i, ar = "9:16", dur = "10s") {
  const c = TEEN_LOVE_CLIPS[i];
  const act = TEEN_LOVE_ACTS.find(a => a.id === c.act) || TEEN_LOVE_ACTS[1];
  const chars = c.who.map(id => TEEN_LOVE_CHARS[id]).join("\n");
  const cont = i === 0
    ? "Opening clip of the series; establish Aarav, Aanya, the sunlit classroom, and natural visual chemistry."
    : `Continue emotional arc seamlessly after Clip ${i} ("${TEEN_LOVE_CLIPS[i - 1].title}"); keep character faces, builds, and key props (pale-pink ribbon, silver watch) consistent.`;
  return [
    `GOOGLE FLOW SILENT CINEMA PROMPT — TEENAGE LOVE VIBES — CLIP ${i + 1}/30 (${act.label})`,
    `TITLE: ${c.title}`,
    `CHARACTERS:\n${chars}`,
    `LOCATION: ${TEEN_LOVE_LOCS[c.loc]}`,
    `VISUAL ACTION & CAMERA: ${c.shot}`,
    `COLOR & ATMOSPHERE: ${act.grade}.`,
    `CONTINUITY: ${cont}`,
    `SOUND & MUSIC: ${c.mood} Instrumental music and natural ambient foley ONLY.`,
    TEEN_LOVE_STYLE,
    TEEN_LOVE_SILENT_RULE,
    `FORMAT: ${ar === "9:16" ? "9:16 vertical, intimate eye-level portrait framing" : "16:9 wide cinematic framing"}. Exactly ${dur}, ONE continuous shot with no hard cuts. Hold the final emotional expression cleanly for the last 1 second.`
  ].join("\n\n");
}

const TEEN_LOVE_CHAR_NAMES = { AARAV: "Aarav", AANYA: "Aanya" };
function teenLoveCharactersFor(i) {
  const who = Array.isArray(TEEN_LOVE_CLIPS[i]?.who) ? TEEN_LOVE_CLIPS[i].who : [];
  return who.map(code => ({
    code,
    name: TEEN_LOVE_CHAR_NAMES[code] || code,
    refPrompt: `Character reference: full-body front three-quarter portrait sheet of ${TEEN_LOVE_CHARS[code] || code} Plain soft neutral background, natural daylight, photorealistic 35mm film aesthetic, no text.`
  }));
}
