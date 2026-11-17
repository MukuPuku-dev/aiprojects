const KITAAB_CATS = [
  { id: "all", label: "सबै पानाहरू (All 30)" },
  { id: "kitab", label: "जिन्दगीको किताब · Quiet Privacy" },
  { id: "ekant", label: "मौनता र शान्ति · Solitude & Peace" },
  { id: "samjhana", label: "अधुरो सम्झना · Unspoken Memories" },
  { id: "aash", label: "आत्मबल र आशा · Healing & Dawn" }
];

const KITAAB_STYLE_LOCK = "Warm golden-hour sunset lifestyle photography in the misty hills of Nepal, shot on 50mm f/1.8 prime lens, soft natural sunlight glowing over distant layered mountain ridges, tactile cozy textures (chunky knit sweater, open paper book, weathered stone ledge, ceramic tea mug, small green leaf sprig), rich amber and dusky twilight palette, subtle 35mm film grain. Leave clean, uncluttered warm glowing sky in the upper-right / upper-third area for dark Devanagari calligraphy. Photorealistic, calm, deeply soulful, with NO UI icons, NO search bars, and NO watermarks.";

const KITAAB_ITEMS = [
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Warm golden-hour sunset from a quiet stone terrace overlooking misty Nepali hills with a glowing orange sun low on the horizon. Back-three-quarter view of a young Nepali woman with dark hair in a cozy cream cable-knit sweater reading an open hardcover book on her lap; beside her on a weathered wooden table rest another closed book with a fresh green sprig and a botanical ceramic tea mug. Clean warm golden-peach sky filling the upper right.",
    quote: "केही पानाहरू बन्द नै रहन देऊ,\nयो जिन्दगीको किताब सबैले\nबुझ्न जरुरी छैन ।",
    hl: "जिन्दगीको किताब",
    ul: "जरुरी छैन",
    tags: "#LifeIsABook #UnspokenFeelings #KeepSomeThingsPrivate #JindagiKoKitaab #NepaliQuotes #HeartTouching",
    story: "जीवनको हरेक अध्याय सबैका अगाडि खोलेर राखिदिनुपर्छ भन्ने हुँदैन। कतिपय पीडा, कतिपय सङ्घर्ष अनि कतिपय मौन आँसुहरू यस्ता हुन्छन्, जसलाई शब्दमा उतारे पनि अगाडिको मान्छेले केवल कहानी जस्तो मात्रै सुन्छ—तर त्यो भोगाइको गहिराइ कहिल्यै महसुस गर्न सक्दैन।\n\nमान्छेहरूले किताबको आवरण हेरेरै सम्पूर्ण कथाको अनुमान लगाउँछन्, तर कुन पाना कति भारी छ, कुन वाक्य लेख्दा हात कति काँपेको थियो भन्ने कुरा लेखकबाहेक अरू कसैलाई थाहा हुँदैन। जहाँ बुझ्ने मन नै हुँदैन, त्यहाँ आफ्नो हृदयको पाना पल्टाएर देखाउनु केवल आफ्नै भावनालाई सस्तो बनाउनु मात्र हो।\n\nत्यसैले केही कुराहरू आफैँभित्र सुरक्षित राख्नु कमजोरी होइन, बरु आत्मसम्मान हो। जुन दिन कोही तिम्रो मौनता पढ्न सक्ने मान्छे आउँछ, उसले नपल्टाइएका पानाहरूको अर्थ पनि बिना शब्द बुझिदिनेछ।"
  },
  {
    cat: "ekant",
    mood: "sunset",
    scene: "Golden sunset light streaming onto a wooden hill-house balcony overlooking blue terraced valleys. A young woman seen from the side in a warm oatmeal cardigan holding a steaming clay tea cup with both hands, an open notebook resting on the wooden railing with dried wildflowers beside it, expansive glowing amber sky above the distant hills.",
    quote: "सबैलाई खुशी पार्दा पार्दै,\nआफ्नै मनसँग कुरा गर्न\nकहिलेकाहीँ बिर्सिइन्छ ।",
    hl: "आफ्नै मनसँग",
    ul: "बिर्सिइन्छ",
    tags: "#SelfCare #QuietMoments #LifeLessons #NepaliThoughts #InnerPeace #Solitude",
    story: "अरूको मुहारमा मुस्कान सजाउन खोज्दाखोज्दै हामी कहिलेकाहीँ आफ्नै भित्री संसार कति रित्तो भइसक्यो भनेर हेर्नै बिर्सन्छौँ। कसैको चित्त नदुखोस् भनेर हरेक पटक 'ठीक छ' भनिदिँदा, आफ्नै छातीभित्र थुप्रिएका थकान र गुनासाहरूले बोल्ने ठाउँ नै पाउँदैनन्।\n\nदिनभरि भीडमा हाँसेर साँझ घर फर्केपछि जब एक कप चिया हातमा लिएर चुपचाप आकाश हेरिन्छ, बल्ल महसुस हुन्छ—दुनियाँलाई त समय दिइयो, तर आफूलाई सुन्ने फुर्सद कहिल्यै निकालिएन। हामी पनि त सुनेर, बुझेर अनि थोरै फुर्सद पाएर हल्का हुन चाहन्छौँ नि!\n\nआज साँझ अलिकति स्वार्थी भएर आफैँसँग बस। अरू सबैका अपेक्षा एकछिन बाहिर राख र आफ्नै मनलाई सोध—तिमीलाई साँच्चै के चाहिएको छ? किनकि तिम्रो आफ्नै शान्ति बिना अरू कोही कहिल्यै पूर्ण हुन सक्दैन।"
  },
  {
    cat: "samjhana",
    mood: "mist",
    scene: "Soft twilight dusk beside an old carved wooden window overlooking misty pine mountains. Close back-shoulder framing of a person in a dark wool shawl turning a thick journal page gently, a warm amber table lamp glowing nearby, and open dusk sky across the upper third.",
    quote: "कतिपय मान्छेहरू जीवनबाट जान्छन्,\nतर तिनका यादहरू पानाभरि\nमसी जस्तै बस्छन् ।",
    hl: "मसी जस्तै",
    ul: "यादहरू पानाभरि",
    tags: "#UnspokenFeelings #MemoriesRemain #LifeIsABook #DeepLines #NepaliQuotes #HeartTouching",
    story: "समयले मान्छेलाई अगाडि त बढाउँछ, तर मनको कुनामा बसेका पुराना स्मृतिहरू कहिल्यै पूरै मेटिँदैनन्। कतिपय नामहरू फोनको सम्पर्क सूचीबाट त हटाइन्छन्, तर बिहानको चिसो हावा चल्दा वा पुरानो गीत बज्दा तिनै अनुहारहरू ताजा भएर सामुन्ने उभिन्छन्।\n\nअचम्म लाग्छ—जुन मान्छेसँग आज एक शब्द बोल्ने अधिकार पनि बाँकी छैन, ऊ अझै पनि हाम्रा हरेक साना बानी, चिया खाने तरिका अनि डायरीका खाली कुनाहरूमा कतै न कतै जिउँदै बसिरहेको हुन्छ। जानु त शरीर मात्र गएको रहेछ, छोडिएका भावनाहरू त आज पनि उस्तै छन्।\n\nतर अब ती यादहरूसँग झगडा गर्न छोडिदिएँ। जीवनको किताबमा ती पानाहरू पनि आवश्यक थिए—किनकि तिनैले मलाई गहिराइमा महसुस गर्न र साँचो अनि अस्थायी बीचको फरक चिन्न सिकाए।"
  },
  {
    cat: "aash",
    mood: "dawn",
    scene: "First golden dawn rays breaking over layered Himalayan foothills as morning mist lifts from the valley. An open hardcover book lying on a rustic stone parapet beside a warm ceramic mug and a fallen rhododendron petal, soft dawn golden sky taking up the upper half of the frame.",
    quote: "अँध्यारो जति नै गहिरो भए पनि,\nहरेक रातपछि एक नयाँ\nबिहानी लेखिएकै हुन्छ ।",
    hl: "नयाँ बिहानी",
    ul: "लेखिएकै हुन्छ",
    tags: "#NewBeginnings #Hope #HealingJourney #NepaliMotivation #SunriseVibes #LifeGoesOn",
    story: "दुःखको रात चल्दै गर्दा लाग्छ—सायद अब घाम कहिल्यै उदाउने छैन, सायद मेरो भाग्यमा सधैँ यस्तै सन्नाटा र आँसु मात्र लेखिएको छ। जब चारैतिर बाटाहरू बन्द देखिन्छन्, मनको धैर्य पनि बिस्तारै टुट्न थाल्छ।\n\nतर प्रकृतिको नियम कति सुन्दर छ—जतिसुकै लामो र चिसो रात भए पनि उसले बिहानीको उज्यालोलाई कहिल्यै रोक्न सक्दैन। तिमीले हिजो भोगेका सारा पीडा, अपमान र असफलताहरू तिम्रो कथाको अन्त्य होइनन्; ती त केवल एउटा कठिन परिच्छेद मात्र हुन्।\n\nआफ्नो आँसु पुछ र झ्याल खोलेर बाहिर हेर—पहाडको कुहिरो बिस्तारै हट्दैछ। आजको दिनले तिमीलाई हिजोको भन्दा अझ बलियो र शान्त बनाएर नयाँ सुरुवातका लागि पर्खिरहेको छ।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Warm late-afternoon sunlight across a quiet wooden rooftop desk in a Nepali hill town. Hands in a cream knit sweater gently resting on a closed leather-bound diary tied with a twine ribbon, warm tea cup beside it, expansive burnt-orange sunset clouds in the upper half.",
    quote: "मुस्कान देखेर हालखबर नसोध,\nकतिपय घाउहरू बाहिर होइन\nभित्रै गहिरा हुन्छन् ।",
    hl: "भित्रै गहिरा",
    ul: "मुस्कान देखेर",
    tags: "#HiddenPain #KeepSomeThingsPrivate #SilentStrength #NepaliShayari #UnspokenFeelings",
    story: "संसारले केवल त्यति मात्र देख्छ जति हामी अनुहारमा देखाउँछौँ। यदि कसैले मीठो मुस्कान दिएर सहजै बोलिरहेको छ भने मान्छेहरू ढुक्क भइहाल्छन्—'यसको जीवनमा त सबै ठीक रहेछ!' तर त्यो मुस्कान पछाडि कति रातको अनिद्रा र कति दबाइएका सुस्केराहरू लुकेका छन्, त्यो कसैले खोज्दैन।\n\nकहिलेकाहीँ हामी पीडा लुकाउन होइन, अरूलाई आफ्नो बोझ नबनाउन पनि हाँसिदिन्छौँ। किनकि हर कोहीसँग मन खोलेर रुन सकिँदैन, र हर कोहीले तिम्रो कोमलताको कदर गर्न पनि जान्दैन।\n\nत्यसैले यदि तिम्रो नजिकको कोही आजकल अलि बढी शान्त र सधैँ मुस्कुराइरहने भएको छ भने, उसलाई एक पटक साँच्चै प्रेमले सोध्नू—'तिम्रो मन त ठीक छ नि?' कहिलेकाहीँ एक सानो अपनापनले कसैको पूरै संसार जोगिन सक्छ।"
  },
  {
    cat: "ekant",
    mood: "mist",
    scene: "Peaceful golden-blue dusk on a quiet hill porch during light evening mist. A young man in a dark olive knit pullover sitting quietly on wooden steps looking at distant valley lights, an open book resting beside him, calm wide dusk sky above for typography.",
    quote: "भीडमा हराउनुभन्दा त बरु,\nआफ्नै एकान्तमा शान्त भएर\nबाँच्नु नै बेस हुन्छ ।",
    hl: "आफ्नै एकान्तमा",
    ul: "शान्त भएर",
    tags: "#PeaceOfMind #Solitude #NepaliQuotes #CalmSoul #IntrovertLife #LifeIsABook",
    story: "पहिले त लाग्थ्यो धेरै साथी, ठूलो भीड अनि हरेक जमघटमा उपस्थित हुनु नै रमाइलो जीवन हो। तर समयसँगै थाहा पाइयो—भीड जति ठूलो हुन्छ, त्यहाँ देखावटी र स्वार्थको आवाज पनि उति नै चर्को हुँदो रहेछ।\n\nजब तिमी त्यस्तो सम्बन्धमा बस्छौ जहाँ तिम्रो कुरा सुनिँदैन, जहाँ तिम्रो उपस्थिति केवल औपचारिकता मात्र बन्छ, तब सयौँ मान्छेको बीचमा उभिएर पनि मन झन् धेरै एक्लो हुन्छ। त्यसको तुलनामा एउटा शान्त कोठा, एक कप तातो चिया र आफ्नै किताबसँगको एकान्त कति पवित्र र विश्रामदायी लाग्छ!\n\nएक्लै बस्नुको अर्थ संसारसँग रिसाउनु होइन; यसको अर्थ आफूलाई नबुझ्ने हल्लाहरूबाट टाढा रहेर आफ्नो आत्माको आवाज सुन्न सिक्नु हो।"
  },
  {
    cat: "samjhana",
    mood: "sunset",
    scene: "Soft sunset glow filtering onto an open vintage book resting on a rustic stone bench overlooking terraced valleys, wind gently lifting one page, a single wild crimson blossom resting near the spine, expansive warm golden-amber sky across the upper frame.",
    quote: "कहीँ न कहीँ मन अड्किएकै छ,\nनत्र हरेक सुन्दर साँझमा\nयो आँखा किन भरिन्थ्यो र ।",
    hl: "आँखा किन भरिन्थ्यो",
    ul: "मन अड्किएकै",
    tags: "#HeartTouching #MissingSomeone #NepaliLines #EveningVibes #UnspokenLove",
    story: "दिनभरि त काम, जिम्मेवारी अनि दौडधुपमा मन कतै अल्झिन्छ, समय बितेको पत्तो हुँदैन। तर जब साँझ पर्दै जान्छ र आकाशको रङ हल्का रातो–पहेँलो हुँदै अँध्यारोमा मिसिन थाल्छ, तब मनको कुनै कुनाबाट अचानक एउटा चिनजानको शून्यता उक्लिएर आँखाको डिलसम्म आइपुग्छ।\n\nहामी जतिसुकै 'म अगाडि बढिसकेँ' भनेर दुनियाँलाई देखाए पनि, साँझको शान्त हावा चल्दा कतै न कतै एउटा अधुरो बात, एउटा छुटेको हात अनि सँगै देखिएको सानो सपना याद आइहाल्छ। र त्यो पलमा कसैलाई दोष दिन मन लाग्दैन—बस चुपचाप आकाश हेरेर सुस्केरा हाल्न मन लाग्छ।\n\nसायद साँचो लगाव यस्तै हुँदो रहेछ—ऊ समयसँगै झर्दैन, बरु शान्त साँझ बनेर जीवनभर मनमा छाइरहन्छ।"
  },
  {
    cat: "kitab",
    mood: "window",
    scene: "Warm golden hour light slanted through a wooden veranda frame; a young woman in a mustard-cream knit sweater holding a pen over a cream journal while gazing toward distant sunset mountains, ceramic mug of steaming chiya beside her, wide warm sunset sky in upper right.",
    quote: "बोल्दा बोल्दै थाकिसकेका मान्छेहरू,\nअन्ततः एक दिन चुपचाप\nमौनता रोज्न बाध्य हुन्छन् ।",
    hl: "मौनता रोज्न",
    ul: "थाकिसकेका मान्छेहरू",
    tags: "#SilentHeart #KeepSomeThingsPrivate #NepaliThoughts #EmotionalQuotes #LifeLessons",
    story: "कोही मान्छे एक्कासि चुप लागेको हुँदैन। ऊ चुप लाग्नुअघि उसले हजार पटक सम्झाउने कोसिस गरेको हुन्छ, काँपेको स्वरमा आफ्नो चित्त दुखेको कुरा बताएको हुन्छ अनि हरेक चोटि 'सायद अब त बुझ्लान् नि' भनेर आशा राखेको हुन्छ।\n\nतर जब बारम्बार आफ्ना भावनाहरूलाई हल्का ठट्टा वा झर्कोको विषय बनाइन्छ, तब मान्छे भित्रैबाट थाक्न थाल्छ। उसलाई लाग्छ—जहाँ शब्दको कुनै मूल्य नै छैन, त्यहाँ चिच्याएर वा रोएर आफैँलाई किन थप चोट दिनु?\n\nत्यहीँबाट सुरु हुन्छ त्यो गहिरो मौनता—जसमा न अब कुनै गुनासो बाँकी रहन्छ, न त फर्काएर सोध्ने रहर नै। जब कोही धेरै बोल्ने मान्छे अचानक शान्त हुन थाल्छ, बुझ्नू कि उसले अब कसैबाट केही आशा गर्न छोडिसक्यो।"
  },
  {
    cat: "aash",
    mood: "sunset",
    scene: "Warm glowing sunset over green Nepali hills seen from a wooden tea terrace. Close framing from behind of hands holding a warm earthenware mug of tea beside an open book, soft amber sunlight glowing through steam, clear bright sunset sky above.",
    quote: "जे गयो, त्यसलाई जाने देऊ,\nअब जे आउनेछ त्यसलाई\nमुस्कुराएर स्वागत गर ।",
    hl: "मुस्कुराएर स्वागत",
    ul: "जाने देऊ",
    tags: "#LetGo #MoveForward #PositiveNepali #LifeIsABook #HealingVibes #Peace",
    story: "हामी प्रायः बितेका कुराहरूको भारी बोकेर भोलिको बाटो हिँड्न खोज्छौँ। हिजो कसले छोड्यो, कहाँ गल्ती भयो, के अधुरो रह्यो—यी सबै प्रश्नहरूमा अल्झिँदा आज हातमा भएको सुन्दर समय पनि हातबाट चिप्लिँदै जान्छ।\n\nकिताबको एउटै पानामा सधैँ अड्किएर बस्ने हो भने अगाडिका राम्रा कथाहरू कहिल्यै पढ्न पाइँदैन। जे तिम्रो लागि बनेको थिएन, उसलाई जति समातेर राख्न खोजे पनि समयले एक दिन लगिछाड्छ। बरू खुल्ला हात र शान्त मनले विदाइ दिन सिक।\n\nजब तिमी पुरानो पीडाबाट हात खाली गर्छौ, तब मात्र जीवनले तिमीलाई नयाँ खुसी, साँचो साथ अनि सफा बिहानी थमाउन सक्छ।"
  },
  {
    cat: "ekant",
    mood: "dawn",
    scene: "Crisp golden morning light on an attic window seat overlooking misty hills and terracotta roofs. A young woman in a soft grey-cream knit sweater sitting cross-legged with an open book, warm tea cup on the sill, spacious pale-gold morning sky across the top.",
    quote: "सबैको नजरमा राम्रो बन्न खोज्दा,\nआफ्नै नजरमा गिरिने डर\nसधैँभरि लागिरहन्छ ।",
    hl: "आफ्नै नजरमा",
    ul: "राम्रो बन्न खोज्दा",
    tags: "#SelfRespect #BeYourself #NepaliQuotes #LifeWisdom #TruthOfLife",
    story: "मान्छेको सबैभन्दा ठूलो बन्धन हो—'अरूले के भन्लान्?' यही सोचले हामी कैयौँ पटक आफ्नो इच्छा, आफ्नो सत्य अनि आफ्नो आत्मसम्मानलाई समेत कुल्चिएर अरूको ताली बटुल्न खोज्छौँ।\n\nतर दुनियाँ यति चञ्चल छ कि तिमीले जतिसुकै राम्रो गरे पनि कसै न कसैलाई तिम्रो काममा खोट देखिइनै हाल्छ। आज ताली बजाउने हातहरू भोलि तिम्रो सानो असफलतामै औँला उठाउन पछि पर्दैनन्। अरूलाई खुशी राख्न आफ्नै आत्माको विरुद्ध जानु जीवनको सबैभन्दा महँगो भूल हो।\n\nअरूको प्रमाणपत्र नखोज; राति सुत्ने बेला ऐना अगाडि उभिँदा यदि तिमी आफ्नै आँखामा इमानदारीका साथ हेर्न सक्छौ भने, त्यही नै तिम्रो सबैभन्दा ठूलो जित हो।"
  },
  {
    cat: "samjhana",
    mood: "sunset",
    scene: "Warm golden dusk along a rustic hillside stone parapet. A cozy scarf draped over the back of a wooden chair beside an open notebook with a silver pen and ceramic tea mug, glowing sunset horizon in the distance and smooth amber sky on upper right.",
    quote: "समयले मान्छे मात्र होइन,\nमनका कतिपय गहिरा वाचाहरू पनि\nचुपचाप बदलिदिँदो रहेछ ।",
    hl: "गहिरा वाचाहरू",
    ul: "चुपचाप बदलिदिँदो",
    tags: "#ChangingTimes #BrokenPromises #NepaliShayari #UnspokenFeelings #LifeReality",
    story: "कुनै बेला यस्ता वाचाहरू गरिन्छन् कि लाग्छ—संसारै उल्टिए पनि यी शब्दहरू कहिल्यै फेरिने छैनन्। 'सधैँ यस्तै रहन्छौँ', 'कहिल्यै हात छोड्दैनौँ' भन्ने वाक्यहरू त्यो बेला कति साँचो र अटल लाग्छन् नि!\n\nतर समयको बगैँचामा मौसम बदलिन धेरै बेर लाग्दैन रहेछ। न त कसैले झगडा गर्छ, न ठूलो कारण हुन्छ—बस बिस्तारै प्राथमिकताहरू फेरिन्छन्, कुराकानी घट्दै जान्छ अनि हिजोसम्म ज्यान भन्दा प्यारो लाग्ने मान्छे भोलि केवल परिचित नाम मात्र बनिदिन्छ।\n\nत्यो देखेर मन त दुख्छ, तर यसैबाट जीवनको एउटा अमूल्य सत्य सिकिन्छ—मान्छेका शब्दमा होइन, समयको कसीमा खरो उत्रने साथमा मात्र भर पर्नू।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Back-three-quarter golden hour silhouette of a Nepali woman with windblown loose hair reading a thick hardcover novel on a wooden ridge-top bench, warm sweater catching sunset rim light, teacup beside her, broad orange-gold sky open on upper right.",
    quote: "मेरो कथा सुनेर हाँस्नेहरू धेरै छन्,\nतर त्यो पाना पल्टाएर रुने\nकोही एक जना पनि छैन ।",
    hl: "पाना पल्टाएर",
    ul: "कोही एक जना",
    tags: "#LifeIsABook #DeepFeelings #NepaliQuotes #LonelyTruth #HeartTouching",
    story: "आफ्नो कमजोरी वा दुःख अरुका अगाडि राख्दा एक अजीब डर लाग्छ—कतै मेरो पीडा अरूको चिया गफको रमाइलो विषय मात्र त बन्दैन? किनकि संसारमा पीडा सुन्ने कान धेरै छन्, तर त्यसलाई आफ्नै ठानेर महसुस गर्ने हृदय विरलै पाइन्छ।\n\nजब हामी कसैलाई विश्वास गरेर मनको व्यथा सुनाउँछौँ, धेरैले सहानुभूतिका दुई शब्द बोल्छन् अनि बाहिर निस्कनासाथ त्यो कुरालाई बिर्सिन्छन् वा मजाक बनाइदिन्छन्। चोट जसलाई लागेको हुन्छ, रातभरि छटपटी पनि उसैलाई मात्र हुन्छ।\n\nत्यसैले अब म आफ्नो कथा दुनियाँको चौतारीमा सुनाउँदै हिँड्दिनँ। मेरो आँसु, मेरो हिम्मत अनि मेरो सङ्घर्षको साक्षी म आफैँ काफी छु।"
  },
  {
    cat: "aash",
    mood: "dawn",
    scene: "Golden sunrise light touching mist-covered valley terraces, foreground showing an open sketchbook and a steaming brass-rimmed tea cup on a wooden veranda rail, gentle warm leaves in corner, expansive luminous sunrise sky above.",
    quote: "जसले तिमीलाई एक्लै छोडेर गयो,\nउसैले त तिमीलाई आफ्नै\nभरमा उभिन सिकायो ।",
    hl: "आफ्नै भरमा",
    ul: "एक्लै छोडेर",
    tags: "#SelfGrowth #Strength #LifeLessons #NepaliMotivation #Healing #Independent",
    story: "जसले बीच बाटोमा हात छोड्छ, सुरुमा ऊ प्रति मनमा ठूलो गुनासो र पीडा आउँछ। लाग्छ—अब म एक्लै यो कठिन बाटो कसरी पार गरौँला? कसैको सहारा बिना त पाइला चाल्न पनि गाह्रो होला जस्तो लाग्छ।\n\nतर जब आँसु पुछेर बिस्तारै हिँड्न थालिन्छ, अनि बल्ल आफ्नो भित्र लुकेको अद्भुत शक्तिको पहिचान हुन्छ। तिमीले थाहा पाउँछौ कि तिमी जति कमजोर ठान्थ्यौ, त्यति कमजोर रहेनछौ। एक्लै लड्दालड्दै तिमीले त्यस्तो आत्मविश्वास कमाउँछौ, जुन कसैको सहारामा बसेर कहिल्यै मिल्दैनथ्यो।\n\nकहिलेकाहीँ कसैको जानु नै तिम्रो जीवनको सबैभन्दा ठूलो वरदान बन्छ—किनकि त्यही रिक्तताले तिमीलाई आफैँसँग भेटाउँछ।"
  },
  {
    cat: "ekant",
    mood: "sunset",
    scene: "Atmospheric dusk portrait from behind of a thoughtful woman in a soft beige wool sweater standing near a stone terrace overlooking glowing evening hills, holding a closed hardcover book against her chest, vast soft pastel twilight sky above.",
    quote: "कम बोल्नु र टाढा बस्नु,\nकहिलेकाहीँ अहङ्कार होइन\nआफ्नो शान्ति जोगाउने तरिका हो ।",
    hl: "शान्ति जोगाउने",
    ul: "कम बोल्नु",
    tags: "#ProtectYourPeace #Solitude #NepaliQuotes #CalmMind #KeepSomeThingsPrivate",
    story: "मान्छेहरू जब तिमी पहिले जस्तो हर बहस र हर जमघटमा सहभागी हुँदैनौ, तब तुरुन्तै अड्कल काट्छन्—'अचेल त ठूलो मान्छे भएछ, घमण्ड बढेछ!' तिनले यो देख्दैनन् कि तिमी घमण्डी भएका होइनौ, बरु व्यर्थको कोलाहलबाट थाकेर शान्तिको खोजीमा निस्केका हौ।\n\nहरेक कुराको सफाइ दिइरहनु, नचाहिएका विवादमा अल्झिनु अनि गलत मान्छेहरूसँग ऊर्जा खर्चनुले भित्रको कोमलता समाप्त पारिदिन्छ। त्यसैले परिपक्व मान्छेले जवाफ दिनुभन्दा दूरी बनाउनु नै उचित ठान्छ।\n\nतिमीलाई जे ठिक लाग्छ त्यही गर, किनकि तिम्रो मानसिक शान्तिको मूल्य अरू कसैको गलत बुझाइभन्दा हजार गुणा ठूलो छ।"
  },
  {
    cat: "samjhana",
    mood: "window",
    scene: "Moody late-evening golden light beside rain-speckled wooden window panes, warm ceramic mug and an open diary with a pressed dried flower inside, subtle glowing dusk reflection over hills outside, clean soft twilight sky area.",
    quote: "कतिपय अधुरा कुराहरू नै,\nजीवनभर सबैभन्दा मिठो\nकविता बनेर रहन्छन् ।",
    hl: "मिठो कविता",
    ul: "अधुरा कुराहरू",
    tags: "#IncompleteLove #UnspokenFeelings #NepaliPoetry #HeartTouching #Memories",
    story: "हामी सधैँ पूर्णतामा मात्र खुसी खोज्छौँ, तर कहिलेकाहीँ जीवनका सबैभन्दा गहिरा भावनाहरू अधुरोपनमै सुरक्षित रहन्छन्। जति कुराहरू भन्न पाइएनन्, जति भेटहरू समय अभावमा छुटिदिए, तिनै अपूरा पलहरू वर्षौँपछि सम्झँदा हृदयमा एउटा न्यानो धुन बनेर बजिरहन्छन्।\n\nयदि हरेक कथाको अन्त्य सोचे जस्तै सजिलो भइदिएको भए, सायद मान्छेले प्रतीक्षा र सम्झनाको मूल्य नै बुझ्ने थिएन। अधुरा रहेका सपनाहरूले नै हामीलाई संवेदनशील र गहिरो बनाइदिन्छन्।\n\nकतिपय मान्छे र कतिपय पलहरू जीवनमा हात समाउन होइन, हृदयको पानामा एक अमिट कविता बनेर लेखिन आउँदा रहेछन्।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Serene sunset over terraced Nepali valley; close over-the-shoulder shot of a man in a warm earthy knit cardigan reading an open book on a wooden hillside veranda bench beside a clay tea cup, golden sunflare and wide clean amber sky on upper right.",
    quote: "जिन्दगीको किताबमा सबै पाना,\nअरूलाई पढ्न दिन मिल्दैन\nकेही गोप्य नै राम्रा हुन्छन् ।",
    hl: "गोप्य नै राम्रा",
    ul: "जिन्दगीको किताबमा",
    tags: "#LifeIsABook #KeepSomeThingsPrivate #NepaliThoughts #QuietWisdom #Soulful",
    story: "आजको जमानामा सबै कुरा दुनियाँलाई देखाउने होड चलेको छ—खुसी भए पनि, दुखी भए पनि। तर जति धेरै तिमी आफ्नो निजी जीवनलाई अरूको नजर अगाडि खोल्दै जान्छौ, उति नै तिम्रो भित्री शान्ति अरूको टिप्पणीमा निर्भर हुँदै जान्छ।\n\nआफ्ना सपना, आफ्ना कमजोरी अनि आफ्नो परिवारका साना कुराहरू आफ्नै दायराभित्र सुरक्षित राख्नु एउटा ठूलो कला हो। संसारमा सबै मान्छे तिम्रो शुभचिन्तक हुँदैनन्; कतिपय त केवल तिम्रो कमजोरी खोज्न नै नजिक आएका हुन्छन्।\n\nत्यसैले केही पानाहरू आफैँसँग राख—जहाँ केवल तिमी र तिम्रो ईश्वर मात्र पढ्न सकून्। त्यही गोप्यतामा नै जीवनको असली सौन्दर्य लुकेको हुन्छ।"
  },
  {
    cat: "ekant",
    mood: "mist",
    scene: "Soft misty golden dusk overlooking rolling hills and scattered village lights beginning to glow far below. A young woman wrapped in a cream pashmina shawl sitting quietly with an open notebook on a stone ledge, teacup beside her, clean open sunset-mist sky above.",
    quote: "बाहिर जतिसुकै आवाज भए पनि,\nअसली उत्तर त केवल\nआफ्नै मौनतामा भेटिन्छ ।",
    hl: "आफ्नै मौनतामा",
    ul: "असली उत्तर",
    tags: "#InnerVoice #Silence #NepaliQuotes #PeacefulMind #DeepMeaning",
    story: "जब जीवनमा कुनै ठूलो अन्योल आउँछ, हामी हतारिएर दश जना मान्छेसँग सल्लाह माग्न पुग्छौँ। तर हरेक मान्छेले तिम्रो परिस्थिति होइन, आफ्नै डर र अनुभवको आधारमा मात्र बाटो देखाइदिन्छ। त्यसैले सल्लाह जति थपिन्छ, मन झन् अलमलिन्छ।\n\nतर जब तिमी एकछिन फोन बन्द गरेर, आँखा चिम्लेर आफ्नै मनको गहिराइमा पस्छौ, तब बाहिरको हल्ला शान्त हुन्छ र भित्रबाट एउटा स्पष्ट आवाज आउँछ। त्यो आवाजले कहिल्यै ढाँट्दैन—त्यसलाई सधैँ थाहा हुन्छ तिम्रो लागि के सही हो र के गलत।\n\nदिनमा कम्तीमा दश मिनेट मौन भएर आफैँलाई सुन; तिम्रा धेरैजसो प्रश्नहरूको उत्तर अरू कसैसँग होइन, तिमीभित्रै छ।"
  },
  {
    cat: "aash",
    mood: "sunset",
    scene: "Warm glowing sunset sky over hill ridges; cozy balcony wooden table foreground with an open book, reading glasses resting on the page, steaming mug of milk tea, small green twig, calm golden-peach sky filling upper half.",
    quote: "समय लाग्छ तर ठीक हुन्छ,\nटुटेका पानाहरू पनि एक दिन\nफेरि सुन्दर कथा बन्छन् ।",
    hl: "फेरि सुन्दर कथा",
    ul: "समय लाग्छ",
    tags: "#HealingTakesTime #Hope #LifeIsABook #NepaliQuotes #StayStrong",
    story: "चोट लागेको भोलिपल्टै निको भइहालोस् भन्ने हामी चाहन्छौँ, तर मनको घाउ शरीरको घाउ जस्तो छिटो सुक्दैन रहेछ। कति दिन त सास फेर्न पनि भारी लाग्छ, कति रात निद्रा नपरेरै बित्छन्। त्यो बेला लाग्छ—म कहिल्यै पहिले जस्तो बन्न सक्दिनँ।\n\nतर समयसँग एक अचम्मको औषधि हुँदो रहेछ। उसले एक्कासि चमत्कार त गर्दैन, तर हरेक दिन अलिकति धैर्य, अलिकति नयाँ बुझाइ अनि थोरै मुस्कान थप्दै जान्छ। र एक दिन अचानक फर्केर हेर्दा तिमीले देख्नेछौ—जुन पीडाले हिजो तिमीलाई तोडेको थियो, आज त्यही पीडा तिम्रो सबैभन्दा प्रेरणादायी कथा बनिसकेको छ।\n\nआफैँलाई हतार नगर; ठीक हुन समय लाग्छ, तर तिमी पक्कै ठीक हुनेछौ।"
  },
  {
    cat: "samjhana",
    mood: "sunset",
    scene: "Golden sunset silhouette from behind of a woman in an oversized cream knit sweater holding an open book near her lap on a hill terrace, warm sunlight catching loose strands of hair, tea mug on stone railing, expansive warm orange sky.",
    quote: "जसलाई मुटुदेखि चाहियो,\nउसलाई कहिल्यै भुल्न नसकिँदो रहेछ\nमात्र चुप बस्न सिकिँदो रहेछ ।",
    hl: "चुप बस्न",
    ul: "भुल्न नसकिँदो",
    tags: "#UnspokenFeelings #TrueLove #NepaliShayari #SilentLove #HeartTouching",
    story: "धेरैले सोध्छन्—'त्यति धेरै समय भइसक्यो, अझै बिर्सिन सकेनौ?' सायद बिर्सिन नसक्नु नै साँचो प्रेमको स्वभाव हो कि! किनकि दिमागमा राखेको कुरा त समयसँगै हराउँछ, तर जुन मान्छे हृदयको धड्कनमा बसेको हुन्छ, ऊ कहिल्यै पूर्ण रूपमा हट्दैन।\n\nफरक यति मात्र आउँछ कि पहिले याद आउँदा तुरुन्तै म्यासेज लेखिन्थ्यो, फोन घुमाइन्थ्यो वा आँखाबाट आँसु बग्थ्यो। आज पनि याद त उति नै आउँछ, तर अब हामीले त्यो यादलाई ओठमै रोकेर मुस्कुराउन अनि चुपचाप आफ्नो काममा फर्कन सिकिसकेका हुन्छौँ।\n\nभुल्नु त सम्भव नहोला, तर कसैको यादलाई कसैमाथि बोझ नबनाई शान्तसँग समालेर राख्नु नै प्रेमको परिपक्व रूप हो।"
  },
  {
    cat: "kitab",
    mood: "window",
    scene: "Warm golden afternoon window light over an old wooden study table in Nepal. An open hardcover Nepali journal with soft pages fluttering slightly, steaming cup of tea on a saucer, misty green hills outside the window, open light space at top.",
    quote: "अरूले के सोच्लान् भन्ने डरले,\nआफ्नै जिन्दगीको कथा\nअरूको हातमा नलेख्नू ।",
    hl: "जिन्दगीको कथा",
    ul: "अरूको हातमा",
    tags: "#WriteYourOwnStory #LifeIsABook #Freedom #NepaliQuotes #SelfWorth",
    story: "यो जीवन तिम्रो हो—यसमा आउने सुख, दुःख, थकान अनि खुसी सबै तिमीले नै भोग्नुपर्छ। तैपनि अचम्म के छ भने, हामी अक्सर आफ्नो जीवनका ठूला निर्णयहरू अरुका आँखा र सल्लाहमा छोडिदिन्छौँ।\n\nसमाज, छिमेकी वा छिनभरको चिनजानका मान्छेहरूले के भन्लान् भनेर जब तिमी आफ्नो रहर र सपना मारिदिन्छौ, तब वर्षौँपछि फर्केर हेर्दा केवल पछुतो मात्र हात लाग्छ। तिम्रो कथा बिग्रियो भने कसैले आएर सच्याइदिँदैन, र राम्रो भयो भने पनि तिम्रो मेहनतको हिस्सा कसैले बाँड्दैन।\n\nत्यसैले कलम आफ्नै हातमा लेऊ। गल्ती भए पनि आफ्नै निर्णयबाट होस्, ताकि भोलि गर्वका साथ भन्न सकियोस्—यो किताब मैले आफ्नै मर्जीले लेखेको हुँ।"
  },
  {
    cat: "ekant",
    mood: "dawn",
    scene: "Serene misty morning on a rustic hill balcony; warm sweater sleeves holding an open hardcover book, delicate rising steam from a ceramic tea cup nearby, distant soft hills bathed in pale peach dawn light, clean empty upper sky.",
    quote: "कुनै दिन बिना कारण नै,\nमन हल्का र आँखा शान्त लाग्छ\nसायद त्यही नै परिपक्वता हो ।",
    hl: "आँखा शान्त",
    ul: "परिपक्वता हो",
    tags: "#InnerCalm #Maturity #PeacefulSoul #MorningThoughts #NepaliQuotes",
    story: "जीवनको एउटा उमेर यस्तो थियो जब स–साना कुरामा मन आत्तिन्थ्यो—कसैको एउटा रुखो शब्दले दिनभरि मुड बिग्रिन्थ्यो, कसैको बेवास्ताले रातभरि निद्रा लाग्दैनथ्यो। हर प्रतिक्रियामा मन चञ्चल भइरहन्थ्यो।\n\nतर धेरै चोट, धेरै अनुभव अनि धेरै एकान्त सँगै बिताएपछि बिस्तारै एउटा अद्भुत शान्ति आउँदो रहेछ। आजकल न कसैसँग धेरै अपेक्षा छ, न त हर कुरामा प्रमाणित गर्ने हतार नै। कोही आयो भने स्वागत छ, कोही गयो भने पनि मनमा कुनै कटुता छैन।\n\nजब बाहिरको आँधीले भित्रको शान्ति हल्लाउन छोड्छ, बुझ्नू तिमी अब जीवन बुझ्न थालेका छौ।"
  },
  {
    cat: "samjhana",
    mood: "sunset",
    scene: "Golden sunset horizon with warm orange rays catching the edge of an open book held by someone sitting on a terrace wall, dark cozy sweater, distant mountain ridges glowing amber, clean warm twilight sky above.",
    quote: "तिमीले छोडेर गएको खालीपन,\nअरू हजार मान्छे आए पनि\nभरिँदैन रहेछ नि ।",
    hl: "खालीपन",
    ul: "भरिँदैन रहेछ",
    tags: "#UnspokenFeelings #MissingYou #NepaliQuotes #DeepLove #HeartBreak",
    story: "मान्छेहरूले भन्छन्—'संसारमा कोही नहुँदैमा केही रोकिँदैन, एउटा गयो भने अर्को आउँछ।' तर हृदय कुनै पसलको सामान होइन जहाँ एउटाको ठाउँ तुरुन्तै अर्कोले भर्न सकोस्। हर मान्छेको जीवनमा आउने एक खास भूमिका हुन्छ, जुन अरू कसैले कहिल्यै निभाउन सक्दैन।\n\nतिमी गएपछि जीवन त रोकिएन—बिहान हुन्छ, काम चल्छ, साथीभाइसँग हाँसो पनि चल्छ। तर दिनको कुनै न कुनै शान्त कुनामा त्यो खास अनुपस्थिति अझै उस्तै ताजा महसुस हुन्छ। हजारौँ मान्छेको बीचमा उभिँदा पनि आँखाले उही एउटा चिनजानको मुस्कान खोजिरहन्छ।\n\nकेही स्थानहरू यति गहिरा हुन्छन् कि ती सधैँका लागि खाली रहँदा नै तिनको शोभा रहिरहन्छ।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Golden hour balcony in the hills; a cream knit sleeve resting beside a closed dark-brown cloth book and a botanical ceramic tea cup on a wooden table, soft warm sunbeams and open orange-gold sky in upper two-thirds.",
    quote: "चुपचाप सहेको पीडा र थकान,\nएक दिन मान्छेको आँखामा\nगहिरो समझदारी बनेर देखिन्छ ।",
    hl: "गहिरो समझदारी",
    ul: "चुपचाप सहेको",
    tags: "#SilentStrength #KeepSomeThingsPrivate #Wisdom #NepaliQuotes #LifeIsABook",
    story: "जसले जीवनमा धेरै कठिनाइहरू चुपचाप झेलेको हुन्छ, उसको बोलीमा कम र आँखामा धेरै गहिराइ देखिन्छ। ऊ स–साना कुरामा रिसाउँदैन, अरूको पीडामा हाँस्दैन, र कसैको आवरण हेरेर हतारमा फैसला गर्दैन।\n\nमान्छेलाई लाग्छ ऊ जन्मजातै यति शान्त र समझदार थियो होला। तर उसले भित्रभित्रै कति तुफान पचाएर त्यो शान्ति कमाएको छ भन्ने कुरा केवल उसकै सिरानी र उसकै डायरीलाई मात्र थाहा हुन्छ। हरेक चोटले हामीलाई कमजोर मात्र बनाउँदैन; यदि सही तरिकाले स्वीकार गर्न सकियो भने, त्यही चोटले हामीलाई संसारकै सबैभन्दा दयालु र बलियो मान्छे बनाइदिन्छ।\n\nतिम्रो मौन सङ्घर्ष खेर जाँदैन; एक दिन त्यही नै तिम्रो व्यक्तित्वको सबैभन्दा उज्यालो पहिचान बन्नेछ।"
  },
  {
    cat: "aash",
    mood: "dawn",
    scene: "Soft pastel sunrise over terraced hills with morning mist; back view of a young woman in a knitted beige cardigan reading a book while sipping tea from a ceramic cup on a stone veranda, calm wide glowing sky.",
    quote: "अधुरै रह्यो भनेर नरोऊ मन,\nशायद तिम्रो किताबमा अझै\nउज्यालो अध्याय बाँकी नै छ ।",
    hl: "उज्यालो अध्याय",
    ul: "नरोऊ मन",
    tags: "#NewChapter #HopeInLife #LifeIsABook #NepaliQuotes #HeartTouching",
    story: "कुनै एउटा सपना टुट्दा वा कुनै एउटा साथ छुट्दा लाग्छ—अब त मेरो पूरै किताब नै समाप्त भयो, अब अगाडि पढ्न लायक केही बाँकी नै छैन। तर हामीले केवल एक चौथाइ पाना मात्र पढेका हुन्छौँ र पूरा कथा त्यहीँ सकिएको ठान्छौँ।\n\nईश्वरको कलममा अझै कति सुन्दर भेट, कति न्यानो साथ अनि कति मुस्कुराउने कारणहरू लेखिएका छन् भन्ने कुरा हामीलाई अहिले थाहा हुँदैन। आज जे टुट्यो, सायद भोलिको अझ बलियो र सफा सुरुवातका लागि ठाउँ खाली भएको होला।\n\nत्यसैले आँसु पुछेर अर्को पाना पल्टाऊ; तिम्रो जीवनको सबैभन्दा सुन्दर अध्याय अझै लेखिन बाँकी नै छ।"
  },
  {
    cat: "ekant",
    mood: "mist",
    scene: "Warm lamp-lit dusk on a rustic hillside terrace, distant fog hugging green valleys, an open hardcover book lying flat on a dark wooden table beside a warm mug and olive leaves, serene muted twilight sky above.",
    quote: "जति बुझ्न खोजेँ यो दुनियाँलाई,\nउति नै आफ्नै मौनता अझ\nप्यारो लाग्दै गयो मलाई ।",
    hl: "प्यारो लाग्दै",
    ul: "यो दुनियाँलाई",
    tags: "#Solitude #DeepThoughts #NepaliQuotes #KeepSomeThingsPrivate #CalmLife",
    story: "सानोमा लाग्थ्यो—मान्छेहरू जस्ता देखिन्छन्, भित्रबाट पनि त्यस्तै होलान्। तर जति धेरै संसारसँग ठोक्किँदै गइयो, उति नै थाहा पाइयो कि यहाँ हर कोही आफ्नो स्वार्थको चश्माले सम्बन्ध नाप्दो रहेछ।\n\nअघिपछि प्रशंसा गर्नेहरू पछाडि फर्किनासाथ कुरा काट्न पछि पर्दैनन्, र आवश्यकता पर्दा नजिक आउनेहरू काम सकिनासाथ अपरिचित जस्तै बनिदिन्छन्। यस्तो दोहोरो दुनियाँमा घुलमिल हुनुभन्दा आफ्नै किताब, आफ्नै चिया र आफ्नै शान्त कोठासँग मित्रता गाँस्नु कति सुरक्षित र सुखद लाग्छ!\n\nमौनतामा न कुनै छल हुन्छ, न कसैबाट धोका पाउने डर—यहाँ केवल साँचो शान्ति मात्र बस्छ।"
  },
  {
    cat: "samjhana",
    mood: "sunset",
    scene: "Golden hour sunset reflecting on a glass window beside a cozy reading corner; open book, dried marigold petal bookmark, ceramic tea mug, glowing sunset mountains visible outside, uncluttered golden sky in upper right.",
    quote: "कहिलेकाहीँ शब्दले होइन,\nमौनताले नै मनका सारा कुरा\nस्पष्ट भनिदिएको हुन्छ ।",
    hl: "मौनताले नै",
    ul: "सारा कुरा",
    tags: "#UnspokenFeelings #SilenceSpeaks #NepaliLines #DeepEmotions #HeartTouching",
    story: "हरेक कुरा भन्नका लागि आवाज नै चाहिन्छ भन्ने छैन। जब कसैको मन गहिराइमा दुख्छ वा कसैलाई साँच्चै प्रेम गरिन्छ, तब ओठका शब्दहरू साना र अपर्याप्त लाग्न थाल्छन्। त्यो बेला आँखाको एक हेराइ र केही सेकेन्डको मौनताले हजार पृष्ठको निबन्धभन्दा धेरै कुरा भनिदिन्छ।\n\nकहिलेकाहीँ फोनमा कसैले केही नबोली केवल लामो सास फेर्दा पनि उता के बितिरहेको छ भन्ने महसुस हुन्छ। र कहिलेकाहीँ नबोली हिँडिदिनु नै सबैभन्दा चर्को उत्तर भइदिन्छ।\n\nत्यसैले शब्दहरू मात्र सुन्ने बानी नबसाल; मान्छेको चुपचापपनभित्र लुकेको सन्देश पढ्न सिक्दा मात्र सम्बन्धको असली भाषा बुझिन्छ।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Warm sunset over peaceful Nepali hills; side-back view of a young woman in a soft beige sweater sitting by a rustic wooden parapet with an open diary in one hand and a tea cup nearby, calm glowing dusk sky filling upper half.",
    quote: "सबैसँग मनको ढोका नखोल,\nयहाँ पाहुना बनेर आएकाहरू\nघरै खाली पारेर जान्छन् ।",
    hl: "मनको ढोका",
    ul: "सबैसँग",
    tags: "#KeepSomeThingsPrivate #Boundaries #LifeIsABook #NepaliQuotes #Wisdom",
    story: "हाम्रो सानो एउटा कमजोरी हुन्छ—जो कोही अलि मिठो बोलिदिन्छ, हामी तुरुन्तै उसलाई आफ्नो मनको सबैभन्दा भित्री कोठासम्म पुर्‍याइदिन्छौँ। उसलाई आफ्ना सारा गोप्य कुरा, पीडा अनि सपना सुम्पिदिन्छौँ।\n\nतर सबै मान्छे तिम्रो मनमा सधैँ बस्न आएका हुँदैनन्। कोही केवल समय बिताउन, कोही तिम्रो कमजोरी जान्न त कोही एक छिनको सहारा खोज्न मात्र आएका हुन्छन्। र जब ती जान्छन्, तब तिम्रो विश्वास र शान्तिसमेत आफैँसँग लिएर जान्छन्।\n\nदयालु बन्नू, मिठो बोल्नू, तर आफ्नो हृदयको ढोका केवल उसैका लागि खोल्नू जसले भित्रको पवित्रताको सम्मान गर्न जान्दछ।"
  },
  {
    cat: "aash",
    mood: "dawn",
    scene: "Soft early morning golden sun rays across a hill veranda; two worn hardcover books stacked on a wooden bench with a fresh white jasmine sprig on top and a warm tea mug, clean luminous dawn sky above.",
    quote: "हिजोको गल्तीमा अड्किनुभन्दा,\nआजको दिनलाई अझै सुन्दर\nबनाउनु नै बुद्धिमानी हो ।",
    hl: "अझै सुन्दर",
    ul: "गल्तीमा अड्किनुभन्दा",
    tags: "#NewDay #LifeWisdom #PositiveThinking #NepaliQuotes #MoveForward",
    story: "मान्छे भएर जन्मिएपछि कहिले निर्णय गलत हुन्छ, कहिले मान्छे चिन्न गल्ती हुन्छ, त कहिले समयको सदुपयोग गर्न चुकिन्छ। तर गल्ती गर्नुभन्दा पनि ठूलो भूल हो—त्यही गल्तीलाई लिएर जीवनभर आफैँलाई दोष दिइरहनु।\n\nबितेको समयलाई फर्काउन त कसैले सक्दैन, तर हिजोको गल्तीबाट सिकेको पाठ प्रयोग गरेर आज र भोलिलाई पक्कै उज्यालो बनाउन सकिन्छ। किताबको एक पानामा मसी पोतियो भन्दैमा पूरै किताब फालिँदैन; बरु अर्को पाना अझ सफा अक्षरले लेखिन्छ।\n\nआफैँलाई माफ गर र आजको दिनलाई नयाँ आशाको साथ सुरु गर; तिम्रो हिम्मत नै तिम्रो सबैभन्दा राम्रो साथी हो।"
  },
  {
    cat: "ekant",
    mood: "sunset",
    scene: "Quiet golden-amber sunset silhouette of misty Himalayan hills, wooden balcony foreground with a ceramic mug of tea, an open journal pinned by a smooth river stone against the breeze, vast warm peach sky above.",
    quote: "कोही सुन्ने नभए पनि के भयो,\nआकाश र यी पहाडहरूले त\nचुपचाप सबै बुझिरहन्छन् ।",
    hl: "चुपचाप सबै",
    ul: "पहाडहरूले त",
    tags: "#NaturePeace #Solitude #NepaliHills #QuietEvening #UnspokenFeelings",
    story: "कहिलेकाहीँ छाती यति भारी हुन्छ कि कसैलाई सुनाउन मन लाग्छ, तर वरिपरि कोही त्यस्तो भेटिँदैन जसले बिना सल्लाह र बिना तुलना केवल चुपचाप सुनिदेओस्। मान्छेहरू सँग कुरा गर्दा आधा कुरा त भन्नै नसकिने जस्तो लाग्छ।\n\nत्यस्तो बेला साँझ पख कौसीमा निस्केर खुला आकाश र शान्त पहाडतर्फ हेर्दा एउटा अचम्मको राहत मिल्छ। प्रकृतिले कहिल्यै तिम्रो गल्ती खोज्दैन, कहिल्यै हाँस्दैन, बरु चिसो हावाको झोँका पठाएर तिम्रो मनको सारा भारी आफैँमा समेटिदिन्छ।\n\nएक्लै महसुस हुँदा आकाशतिर हेर्नू; कहिलेकाहीँ शब्द नबोल्ने संसारले नै मान्छेको मन सबैभन्दा राम्ररी बुझिदिन्छ।"
  },
  {
    cat: "kitab",
    mood: "sunset",
    scene: "Warm glowing sunset across layered Nepali valley ridges; back-angle portrait of a woman in an oatmeal knit cardigan gently closing an old hardcover book on a stone terrace with a steaming ceramic mug beside her, soft golden sky filling upper right.",
    quote: "यो जिन्दगीको किताबमा म,\nअझै पनि आफैँलाई चिन्ने\nखोजीमै अल्झिरहेको छु ।",
    hl: "आफैँलाई चिन्ने",
    ul: "खोजीमै",
    tags: "#LifeIsABook #SelfDiscovery #NepaliQuotes #DeepLife #KeepSomeThingsPrivate",
    story: "हामी सानैदेखि अरूलाई चिन्न, अरूको मन बुझ्न अनि दुनियाँलाई प्रमाणित गर्नमै सारा उमेर खर्चिदिन्छौँ। कति मान्छेको पछाडि दौडन्छौँ, कति भूमिकाहरू निभाउँछौँ—तर कहिल्यै फुर्सद निकालेर सोध्दैनौँ कि आखिर म स्वयम् को हुँ र मेरो मनलाई साँचो खुसी केले दिन्छ?\n\nजब जीवनका धेरै पानाहरू पल्टिँदै जान्छन् र अनेकौँ रङहरू ओइलाउँछन्, तब बल्ल एउटा अनौठो यात्रा सुरु हुन्छ—आफैँभित्र फर्किने यात्रा। त्यसपछि न अरूको प्रशंसाको भोक रहन्छ, न कसैसँग तुलना गर्ने रहर नै।\n\nयो जिन्दगीको किताब बाहिर अरूलाई देखाउन होइन, भित्र बसेको आफ्नो साँचो स्वरूप भेट्नका लागि लेखिएको रहेछ।"
  }
];

function kitaabCleanPromptFor(item, aspect = "9:16") {
  const num = item.num || 1;
  return [
    `GOOGLE FLOW / IMAGEN PHOTO PROMPT — जिन्दगीको किताब #${num}`,
    `SCENE: ${item.scene}`,
    `STYLE & ATMOSPHERE: ${KITAAB_STYLE_LOCK}`,
    `STRICT TEXT-FREE COMPOSITION: Do NOT render any text, letters, search bars, UI buttons, logos, or watermarks inside the photograph. Keep clean, uncluttered golden-hour sky in the upper right / upper third so crisp Nepali Devanagari quote typography can be overlaid afterward.`,
    `ASPECT RATIO: ${aspect} warm golden-hour lifestyle photograph.`
  ].join("\n\n");
}

function kitaabPosterPromptFor(item, aspect = "9:16") {
  const num = item.num || 1;
  return [
    `GOOGLE FLOW / IMAGEN COMPLETE QUOTE POSTER — जिन्दगीको किताब #${num}`,
    `SCENE: ${item.scene}`,
    `STYLE & ATMOSPHERE: ${KITAAB_STYLE_LOCK}`,
    `SKY TYPOGRAPHY OVERLAY (UPPER RIGHT / UPPER THIRD): Over the clean warm golden-peach sunset sky, render crisp, legible Nepali Devanagari bookish serif/sans typography centered-right in dark charcoal brown-black ink (#1d1712):\n${item.quote}${item.hl ? `\nHighlight the exact phrase "${item.hl}" in warm burnt-terracotta orange (#a84a18).` : ""}${item.ul ? `\nDraw a subtle hand-drawn curved black ink brush underline stroke beneath "${item.ul}".` : ""}`,
    `CLEAN FRAME: Zero UI chrome, zero search bar, zero navigation buttons, zero watermarks. Only the serene golden-hour photograph and the clean Nepali quote in the sky.`,
    `ASPECT RATIO: ${aspect} viral Nepali social quote photo.`
  ].join("\n\n");
}

function kitaabShortCaptionFor(item) {
  const line = item.quote.replace(/\s*\n\s*/g, " ").trim();
  const tags = item.tags || "#LifeIsABook #UnspokenFeelings #KeepSomeThingsPrivate";
  return `${line}\n${tags}`;
}

function kitaabCaptionFor(item) {
  const line = item.quote.replace(/\s*\n\s*/g, " ").trim();
  const body = item.story ? `\n\n${item.story}` : "";
  const tags = item.tags || "#LifeIsABook #UnspokenFeelings #KeepSomeThingsPrivate #NepaliQuotes";
  return `${line}${body}\n\n${tags}`;
}
