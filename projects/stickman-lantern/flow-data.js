const STICKMAN_META = {
  niche: "Survival & Adventure (Visual-Only Stickman Saga)",
  title: "The Last Lantern",
  nepaliTitle: "अन्तिम लालटिन",
  durationLabel: "10m 40s (64 scenes × 10s)",
  aspect: "16:9",
  narration: "No (100% visual storytelling, zero voiceover, zero dialogue, zero on-screen text)",
  styleName: "Classic 2D Stickman Cartoon with Atmospheric Ink-Wash Cinematic Lighting"
};

const STICKMAN_ACTS = [
  { id: "all", label: "All Acts (64)" },
  { id: "act1", label: "Act I · The Dimmed Village (1–10)", grade: "cold misty charcoal-grey dusk pierced by one warm golden-amber lantern glow, soft ink-wash shadows" },
  { id: "act2", label: "Act II · Ash Forest & Broken Bridge (11–21)", grade: "deep indigo twilight forest, swirling glowing embers, eerie pale-cyan fireflies and sharp amber lantern highlights" },
  { id: "act3", label: "Act III · Clockwork Spire & Storm (22–33)", grade: "stormy slate-blue lightning flashes, wet metallic brass highlights, dramatic rim-lit silhouettes" },
  { id: "act4", label: "Act IV · Sunken Glass City (34–45)", grade: "crystalline midnight teal, refracted prism reflections, menacing violet glow from the Shadow King" },
  { id: "act5", label: "Act V · The Ember Within (46–55)", grade: "near-total ink blackness ignited by a roaring crimson-gold scarf torch and dazzling prismatic white light bursts" },
  { id: "act6", label: "Act VI · Dawn Over the Valley (56–64)", grade: "radiant golden-peach sunrise breaking through clearing mist, lush warm daylight and hopeful horizon glow" }
];

const STICKMAN_CHARS = {
  KIRAN: "KIRAN (Main Stickman Hero): Classic 2D stickman cartoon character with clean bold ink-black line art, expressive white circular eyes with dynamic pupils and brow lines, slender proportions, wearing a flowing bright crimson-red scarf trailing behind his neck and carrying a small vintage brass oil lantern glowing warm golden-amber in his right hand.",
  PIP: "PIP (Small Stickman Companion): Smaller, younger 2D stickman cartoon character with clean ink-black line art, big curious expressive eyes, wearing an oversized pale sky-blue hooded tunic and carrying a tiny carved wooden flute tied to a waist string.",
  OWL: "CLOCKWORK OWL (Mechanical Companion): Small stylized 2D cartoon brass-and-ink mechanical owl with clean dark outlines, glowing warm-gold circular lens eyes, and delicate hinged brass wing feathers that click open.",
  SHADOW_KING: "SHADOW KING (Antagonist): Towering colossal 2D ink-silhouette stickman entity twice the height of normal stickmen, jagged smoky cloak edges, crown-like twin ink horns, and menacing glowing violet eyes."
};

const STICKMAN_CHAR_NAMES = {
  KIRAN: "Kiran",
  PIP: "Pip",
  OWL: "Clockwork Owl",
  SHADOW_KING: "Shadow King"
};

const STICKMAN_LOCS = {
  VILLAGE: "Quiet hillside stickman village painted in crisp 2D ink-wash silhouettes: crooked timber houses, stone well, wooden cart, cobblestones, shrouded in cold grey mist.",
  ASH_FOREST: "Dense 2D illustrated whispering ash forest with towering twisted black-ink trunks, glowing cyan fireflies, mossy boulders, and a rickety rope suspension bridge over a deep foggy chasm.",
  CLOCKWORK_SPIRE: "Inside and atop a towering abandoned 2D illustrated stone-and-brass clockwork watermill spire filled with giant rotating gears, swinging pendulums, and storm-lashed balconies.",
  GLASS_CITY: "Ancient sunken 2D illustrated city of translucent teal glass domes, arched bridges, towering crystal prism spire, and dark violet shadow pools.",
  SUNRISE_VALLEY: "Wide panoramic 2D illustrated valley overlook bathed in warm golden-peach sunrise light as mist clears over the revived village below."
};

const STICKMAN_MASTER_STYLE = "MASTER STYLE LOCK — Classic 2D Stickman Cartoon animation blended with atmospheric hand-painted ink-wash cinematic backgrounds in 16:9 widescreen. Clean bold black ink line art for characters, super-expressive eyes and readable silhouette body language, smooth frame-by-frame 2D motion, high contrast between dark cool backgrounds and warm golden lantern light. Preserve exact character designs (Kiran's crimson scarf & golden lantern, Pip's pale-blue tunic, Clockwork Owl's brass wings, Shadow King's violet eyes).";

const STICKMAN_SILENT_RULE = "VISUAL-ONLY & PACING LOCK — NARRATION = NO. ZERO spoken dialogue, ZERO voice-over, ZERO narration, ZERO sound-effect text bubbles, ZERO subtitles, ZERO on-screen text or watermarks. Tell 100% of the story through expressive 2D stickman posture, eye movements, gesture acting, light vs. shadow, and rich ambient foley + instrumental score. Exactly 10 seconds per clip with 0.5s opening settle and 1.0s held ending frame for seamless CapCut concatenation.";

// [act, who, loc, title, pacing, intensity, camMove, beat, visual, animAction, prevLink, transition, foley]
const RAW_STICKMAN_SCENES = [
  // ACT I — THE DIMMED VILLAGE (1-10)
  ["act1", ["KIRAN"], "VILLAGE", "Awakening in Silence", "Slow", "Low", "Slow push-in",
    "Kiran wakes on cold cobblestones as the village sky dims to dusk.",
    "Wide 16:9 2D composition of empty mist-choked ink-wash village; Kiran sits up slowly at center-left, crimson scarf draped over shoulders, staring at his faint lantern.",
    "Kiran blinks awake, rubs his eyes, pushes himself up shakily, and looks left and right at the eerily silent dark village.",
    "Opening shot; establish Kiran's clean 2D stickman design, crimson scarf, and faint golden lantern.", "Match cut closer to the lantern.",
    "Foley: hollow dusk wind, faint distant cricket stopping, soft lonely piano note."],

  ["act1", ["KIRAN"], "VILLAGE", "The Last Flickering Ember", "Slow", "Low", "Macro dolly-in",
    "Kiran cups his hands around his lantern to save its tiny dying flame.",
    "Close-up of Kiran kneeling on cobblestones, cupping both stick-hands around the glass lantern containing one trembling golden spark.",
    "Kiran inhales sharply as wind threatens the flame, shields it tenderly with his scarf edge, and breathes a tiny sigh of relief as the amber glow steadies.",
    "Continues directly from Scene 1 with Kiran kneeling on the dark village street.", "Hard cut to wide village square.",
    "Foley: soft match-like ember crackle, gentle exhale, warm cello drone."],

  ["act1", ["KIRAN"], "VILLAGE", "Statues in the Square", "Slow", "Medium", "Slow lateral pan",
    "Kiran discovers his fellow stickmen villagers frozen into grey stone statues.",
    "Medium-wide 16:9 frame of the cobblestone square lined with frozen grey-ink stickman statues locked mid-step; Kiran walks past them holding his lantern high.",
    "Kiran walks slowly from left to right, lifting his lantern toward a frozen baker and child statue; his eyes widen in horrified realization and his shoulders slump.",
    "Continues from Scene 2 as Kiran walks into the village square with his glowing lantern.", "Pan ends on a creeping dark wisp.",
    "Foley: slow echoing footsteps on stone, eerie metallic hum, melancholic piano."],

  ["act1", ["KIRAN"], "VILLAGE", "Touch of the Cold Stone", "Slow", "Medium", "Gentle push-in",
    "Kiran touches a frozen friend's shoulder and feels icy dust crumble.",
    "Over-the-shoulder medium shot of Kiran reaching one trembling hand toward a frozen stickman elder statue as warm lantern light illuminates grey stone cracks.",
    "Kiran gently places his hand on the statue's shoulder; a tiny puff of cold ash drifts off, and Kiran pulls his hand back, clutching his crimson scarf tightly.",
    "Continues directly from Scene 3 in the village square.", "Tilt down toward the dark alley shadow.",
    "Foley: dry stone scrape, soft ash puff, mournful low strings."],

  ["act1", ["KIRAN"], "VILLAGE", "The Creeping Shadow Wisps", "Medium", "High", "Quick whip-pan",
    "Snakelike black-ink shadow wisps slither across the walls toward Kiran.",
    "Low-angle 16:9 shot in a narrow cobblestone alley; swirling black-ink tendrils with faint violet glints creep down timber walls toward Kiran at center.",
    "Kiran spins around startled, holds his lantern forward like a shield; the bright golden light hisses against the tendrils, forcing them to recoil slightly.",
    "Continues from Scene 4 as Kiran notices movement in the alley behind him.", "Match cut to Kiran backing toward a cart.",
    "Foley: sinister shadowy hiss, bright lantern flare whoosh, tense staccato strings."],

  ["act1", ["KIRAN", "PIP"], "VILLAGE", "Eyes Under the Fallen Cart", "Slow", "Medium", "Low tilt-down",
    "Kiran spots a pair of huge frightened eyes hiding beneath an overturned cart.",
    "Medium shot beside an overturned wooden cart in the alley; warm lantern light spills underneath revealing Pip's tiny pale-blue stickman silhouette trembling.",
    "Kiran kneels slowly and lowers the lantern; Pip flinches back clutching a small wooden flute, then peeks out cautiously at Kiran's gentle outstretched hand.",
    "Continues from Scene 5 as Kiran backs beside the overturned wooden cart.", "Smooth cut to Pip stepping out.",
    "Foley: creak of wooden cart wheel, quiet frightened gasp, tender solo flute note."],

  ["act1", ["KIRAN", "PIP"], "VILLAGE", "The Bond of the Scarf", "Slow", "Low", "Static medium close",
    "Kiran adjusts Pip's hood and shares the lantern's warmth.",
    "Warm two-shot illuminated solely by the golden lantern between Kiran and little Pip on the dark cobblestones.",
    "Pip steps out shyly; Kiran pats Pip's pale-blue hood, checks Pip's wooden flute, and taps the lantern glass playfully to coax a tiny hopeful smile from Pip.",
    "Continues directly from Scene 6 in the alley.", "Dissolve/cut to high rooftop view.",
    "Foley: soft cloth rustle, gentle tap on glass, warm acoustic guitar harmonic."],

  ["act1", ["KIRAN", "PIP"], "VILLAGE", "The Distant Violet Beacon", "Slow", "Medium", "Crane tilt-up",
    "From a ridge above the village, they see a menacing violet beam piercing the horizon.",
    "Wide 16:9 vista from the village stone arch; Kiran and Pip stand in silhouette bottom-left looking toward a distant jagged violet pillar of light rising from a sunken valley.",
    "Kiran points toward the distant violet beam; wind ripples Kiran's crimson scarf toward the horizon while Pip grips the back of Kiran's hand tightly.",
    "Continues from Scene 7 as Kiran leads Pip up to the village gate arch.", "Cut to them leaving the gate.",
    "Foley: rising night wind, distant ominous thunder-hum, resolute string chord."],

  ["act1", ["KIRAN", "PIP"], "VILLAGE", "Shadow Hounds at the Gate", "Fast", "High", "Tracking backward",
    "Two ink-black Shadow Hounds leap from the mist, forcing Kiran and Pip to sprint.",
    "Dynamic wide action shot at the village stone gate; two sleek four-legged ink hounds with glowing violet eyes lunge out of the fog behind Kiran and Pip.",
    "Kiran grabs Pip's hand and sprints full-speed toward the forest treeline, swinging the lantern behind him to ward off the snapping hounds.",
    "Continues directly from Scene 8 at the village gate arch.", "Cut on motion into the dark forest.",
    "Foley: snarling ink-hound growls, rapid stickman footsteps, driving percussion pulse."],

  ["act1", ["KIRAN", "PIP"], "ASH_FOREST", "Into the Whispering Ash Forest", "Medium", "High", "Fast follow pan",
    "They plunge past the treeline into towering black-ink trunks as hounds prowl behind.",
    "Wide 16:9 depth shot inside the Ash Forest; giant crooked ink trees frame Kiran and Pip ducking behind a mossy boulder while violet-eyed hounds prowl the mist.",
    "Kiran pulls Pip behind the boulder, covers the lantern slightly with his scarf to hide its glare, and both hold their breath as the hounds sweep past.",
    "Continues directly from Scene 9 as they cross from the village gate into the Ash Forest.", "Slow fade-out of hounds into Act II.",
    "Foley: snapping twigs, heavy hound panting fading away, tense heartbeats."],

  // ACT II — ASH FOREST & BROKEN BRIDGE (11-21)
  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "The Firefly Trail", "Slow", "Low", "Floating glide",
    "Pale-cyan fireflies drift out of hollow logs, guiding their path forward.",
    "Enchanting 16:9 wide shot in deep indigo twilight; pale-cyan fireflies swirl gently around Kiran and Pip walking along a mossy forest path.",
    "Pip reaches out joyfully to touch a glowing cyan firefly hovering near his nose; Kiran smiles softly and follows the winding firefly trail deeper into the woods.",
    "Continues from Scene 10 as they emerge safely from behind the mossy boulder.", "Pan smoothly onto the chasm edge.",
    "Foley: delicate magical shimmer chimes, soft moss footsteps, gentle kalimba."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "The Broken Rope Bridge", "Slow", "Medium", "Crane reveal",
    "The fireflies lead to a deep fog-filled canyon with a half-snapped rope bridge.",
    "Dramatic 16:9 wide shot at a rocky cliff edge; a rickety wooden-plank rope bridge stretches across a bottomless misty chasm, with three middle planks missing.",
    "Kiran stops abruptly at the edge, kicks a tiny pebble that vanishes into the mist, and looks across to the far cliff in quiet worry while Pip peeks nervously over.",
    "Continues directly from Scene 11 arriving at the canyon rim.", "Cut to close-up of bridge ropes.",
    "Foley: pebble clattering into deep echo, hollow canyon wind, low bassoon."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "Testing the Rotting Planks", "Medium", "Medium", "Low side track",
    "Kiran steps carefully onto the swaying bridge, testing each creaking plank.",
    "Medium tracking shot on the swaying rope bridge over swirling fog; Kiran inches forward holding the frayed rope while Pip waits anxiously on the ledge.",
    "Kiran taps one plank with his foot—it snaps and tumbles into the abyss! Kiran freezes mid-air gripping the rope, then signals Pip carefully.",
    "Continues directly from Scene 12 at the start of the rope bridge.", "Quick cut to Pip's worried face.",
    "Foley: sharp wood SNAP, creaking taut hemp ropes, sudden orchestral sting."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "Howls in the Mist Behind", "Fast", "High", "Whip-pan back",
    "The Shadow Hounds catch their scent and burst onto the cliff behind Pip.",
    "Tense wide shot looking back toward the forest cliff; two violet-eyed Shadow Hounds emerge snarling from the fog right behind panicked Pip at the bridge entrance.",
    "Pip gasps and sprints onto the swaying bridge toward Kiran as the hounds charge onto the wooden planks behind them, snapping ropes violently.",
    "Continues directly from Scene 13 with Kiran halfway across the bridge and Pip at the entrance.", "Cut to frantic mid-bridge gap.",
    "Foley: echoing hound howls, frantic running thuds on wood, fast rhythmic drums."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "The Leap Across the Gap", "Fast", "High", "Slow-mo apex pan",
    "Kiran catches Pip mid-air across the missing planks as the bridge begins to tear.",
    "Dramatic side-view 16:9 shot over the chasm gap; Pip leaps with arms outstretched while Kiran leans far back from the intact half, grabbing Pip's hand.",
    "Pip launches across the missing planks in slow-motion; Kiran catches Pip's wrist firmly, swinging him safely onto the far planks just as a main rope snaps behind the hounds.",
    "Continues directly from Scene 14 at the missing-plank gap.", "Cut to bridge collapsing behind them.",
    "Foley: rushing wind whoosh, dramatic rope snap, triumphant cymbal swell."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "Collapse of the Chasm Bridge", "Fast", "High", "Tilt-down pull-back",
    "The broken bridge plummets into the fog with the hounds while Kiran and Pip climb up.",
    "Wide 16:9 shot of the far cliff edge; Kiran hauls Pip up onto solid rock as the entire wooden bridge tears loose and plunges with the Shadow Hounds into the mist.",
    "Kiran pulls Pip onto the rocks; both collapse panting as the distant crash echoes from below, then bump fists in shaky relief.",
    "Continues directly from Scene 15 at the far cliff edge.", "Cut to resting by a rock.",
    "Foley: thunderous rope tear and distant bridge crash, heavy panting, soft sigh."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "The Lantern Runs Low", "Slow", "Medium", "Close-up push-in",
    "After the chase, Kiran sees the lantern's oil is nearly empty and Pip is shivering.",
    "Intimate macro two-shot beside a shelter rock; Kiran tilts the lantern showing just a drop of golden oil left while cold fog makes Pip shiver.",
    "Kiran notices Pip trembling in his thin pale-blue tunic; without hesitating, Kiran unwinds half of his long crimson scarf and wraps it warmly around Pip's shoulders.",
    "Continues directly from Scene 16 beside the far canyon rock.", "Cut to Pip's grateful eyes.",
    "Foley: soft wool scarf wrap, gentle wind whistle, tender solo piano chord."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "Flute Song in the Dark", "Slow", "Low", "Slow orbit pan",
    "Pip plays a soft, wordless melody on his wooden flute to lift Kiran's spirit.",
    "Poignant medium shot on the misty ridge; Pip lifts his tiny carved wooden flute to his lips as soft golden lantern light dances across both stickmen.",
    "Pip plays a gentle, brave melody; musical fireflies drift near the flute, and Kiran's drooping shoulders straighten with renewed courage.",
    "Continues directly from Scene 17 on the misty ridge.", "Tilt up toward dark mountains.",
    "Foley: pure warm bamboo flute melody (live acoustic), gentle firefly shimmer."],

  ["act2", ["KIRAN", "PIP"], "ASH_FOREST", "Footsteps Through Ash Dunes", "Medium", "Low", "Wide tracking left-to-right",
    "Side by side in shared crimson scarf, they trek up the steep ash ridge.",
    "Cinematic 16:9 silhouette wide shot of a steep grey ash ridge against a dark indigo sky; Kiran and Pip trudge steadily uphill together.",
    "Both stickmen lean forward climbing into the wind, Kiran holding the dim lantern ahead while Pip keeps step closely beside him.",
    "Continues from Scene 18 as they leave the ridge campsite.", "Match cut to towering spire silhouette.",
    "Foley: rhythmic crunch of ash underfoot, rising wind, steady walking bass."],

  ["act2", ["KIRAN", "PIP"], "CLOCKWORK_SPIRE", "Silhouette of the Clockwork Spire", "Slow", "Medium", "Low tilt-up reveal",
    "Through parting fog rises an ancient abandoned stone-and-brass Clockwork Spire.",
    "Epic 16:9 low-angle wide shot revealing a colossal crumbling clockwork watermill tower silhouetted by distant lightning, with tiny Kiran and Pip at its base.",
    "Kiran and Pip tilt their heads all the way up in awe as giant rusted exterior waterwheels creak slowly in the rising storm wind.",
    "Continues directly from Scene 19 arriving at the foot of the Clockwork Spire.", "Push-in toward arched wooden doorway.",
    "Foley: deep metallic gear groan, distant storm rumble, awe-inspiring brass chord."],

  ["act2", ["KIRAN", "PIP"], "CLOCKWORK_SPIRE", "Stepping Inside the Gear Hall", "Slow", "Medium", "Push-in through doorway",
    "They push open the heavy iron-studded door into a cavern of giant shadows and brass gears.",
    "Symmetrical wide 16:9 frame looking from behind Kiran and Pip as they push open tall doors into a vast dark clockwork hall illuminated by their amber lantern.",
    "Kiran nudges the heavy door open; dust cascades down, and they step cautiously inside as distant thunder booms outside.",
    "Continues directly from Scene 20 at the Clockwork Spire entrance.", "Hold on spinning shadows inside.",
    "Foley: heavy door groan, cascading dust, echoing hall clock-ticks."],

  // ACT III — CLOCKWORK SPIRE & STORM (22-33)
  ["act3", ["KIRAN", "PIP"], "CLOCKWORK_SPIRE", "Awakening the Ancient Gears", "Medium", "Medium", "Wide vertical pan",
    "Lightning strikes the spire's roof, suddenly jolting the rusted gears back into motion.",
    "Wide vertical 16:9 interior shot of towering brass cogs and hanging chains; a bright blue lightning bolt strikes the spire outside, flooding the hall in electric light.",
    "Massive gears shudder and begin grinding into motion around Kiran and Pip; both jump backward in surprise as pendulums start swinging overhead.",
    "Continues directly from Scene 21 inside the Clockwork Hall.", "Cut to close-up of swinging pendulum.",
    "Foley: thunder crack, colossal metallic clank, rhythmic giant clockwork ticking."],

  ["act3", ["KIRAN", "PIP"], "CLOCKWORK_SPIRE", "Leaping Across Turning Cogs", "Fast", "High", "Dynamic side track",
    "Kiran and Pip time their leaps from one rotating brass gear tooth to the next.",
    "Dynamic 16:9 action frame showing two interlocking giant spinning brass gears; Kiran and Pip crouch on the rim ready to jump across.",
    "Kiran counts three fingers, grabs Pip's hand, and both leap cleanly onto the ascending gear tooth, riding it upward toward the high rafters.",
    "Continues directly from Scene 22 as the gears spin smoothly.", "Tilt upward following the rising gear.",
    "Foley: rhythmic clanking gear teeth, agile stickman hops, energetic marimba & drums."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "Trapped Under the Pendulum", "Medium", "High", "Close-up push-in",
    "On the high rafters, they find a tiny brass Clockwork Owl pinned beneath a fallen iron rod.",
    "Medium close-up on a brass catwalk illuminated by storm flashes; the little Clockwork Owl struggles weakly with one wing trapped under a rusted rod.",
    "Pip points excitedly and rushes over; Kiran braces his stickman shoulders under the heavy rod, straining until it rolls aside and frees the little brass Owl.",
    "Continues directly from Scene 23 reaching the high rafter catwalk.", "Hold on Owl blinking awake.",
    "Foley: faint mechanical chirp, metallic scrape as rod lifts, warm harp glissando."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "The Owl Spreads Brass Wings", "Slow", "Low", "Gentle orbit",
    "The rescued Clockwork Owl clicks its wings open and perches proudly on Kiran's shoulder.",
    "Warm medium three-shot on the rafter; the golden-eyed Clockwork Owl unfolds hinged brass feathers, tilts its head curiously at Pip, and hops onto Kiran's scarfed shoulder.",
    "The Owl clicks politely, wipes dust off its brass beak, and whistles a tiny mechanical trill that makes Pip giggle.",
    "Continues directly from Scene 24 on the high Clockwork catwalk.", "Pan toward storm-lit balcony exit.",
    "Foley: crisp clockwork wing clicks, cute mechanical owl hoot, light playful strings."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "A Crack of Storm Light", "Fast", "High", "Whip-pan to window",
    "Gale-force rain shatters a stained-glass spire window, threatening to douse the lantern.",
    "Dramatic wide interior shot; a gust of storm wind and rain blasts inward through a high arched window, knocking Pip off balance toward a spinning gear.",
    "Kiran lunges forward to catch Pip's hood just in time while the Clockwork Owl spreads its brass wings to shield the flickering lantern glass.",
    "Continues directly from Scene 25 near the spire's upper balcony.", "Cut to them ducking into a stone alcove.",
    "Foley: shattering glass, howling storm gale, frantic grab, dramatic brass hit."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "Escalating Gear Collapse", "Fast", "High", "Fast tracking shot",
    "Overloaded by the storm, the giant central axle snaps—they sprint for the cliff tunnel!",
    "High-energy 16:9 action shot; sparks shower from snapping brass chains behind Kiran, Pip, and the flying Clockwork Owl sprinting across a narrow catwalk.",
    "Kiran carries Pip piggyback while the Owl flies ahead pointing toward a dark cliffside exit tunnel; they dive inside just as the walkway behind collapses.",
    "Continues directly from Scene 26 escaping the upper clockwork balcony.", "Cut to dark cave mouth.",
    "Foley: snapping chains, roaring metal collapse, rushing footsteps into cave."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "Shelter in the Hollow Cave", "Slow", "Low", "Slow push-in",
    "Exhausted inside a dry cliff cave overlooking the storm, they catch their breath.",
    "Quiet 16:9 silhouette-and-amber shot inside a rocky cliff alcove; rain pours outside the cave mouth while Kiran, Pip, and the Owl huddle around the dying lantern.",
    "Kiran slumps back against the stone wall panting; Pip leans his head softly against Kiran's arm, and the Owl tucks its wings beside the faint ember.",
    "Continues directly from Scene 27 inside the cliffside cave.", "Match cut closer to the lantern.",
    "Foley: steady rain curtain outside cave, soft exhausted breathing, gentle solo cello."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "One Drop of Oil Left", "Slow", "Medium", "Macro close-up",
    "The lantern coughs and dims to a microscopic pinpoint spark—just enough to see by.",
    "Extreme close-up of the brass lantern glass; the flame shrinks to a tiny trembling pinprick of gold reflected in Kiran's worried eyes.",
    "Kiran taps the glass gently; the spark flickers weakly, casting long trembling shadows across the damp cave walls.",
    "Continues directly from Scene 28 inside the dark cave.", "Slow pan to the Owl looking out.",
    "Foley: faint sputtering wick hiss, quiet anxious heartbeat, sparse piano notes."],

  ["act3", ["KIRAN", "PIP", "OWL"], "CLOCKWORK_SPIRE", "The Owl's Scouting Flight", "Medium", "Medium", "Follow pan out cave",
    "The Clockwork Owl launches into the clearing mist to find a way down to the Sun Core.",
    "Medium-wide shot at the cave mouth as rain slows to mist; the Clockwork Owl hops to the ledge, flashes its golden lens eyes, and glides out over the cliff.",
    "Kiran nods encouragingly; the Owl spreads its brass wings, vanishes into the blue mist, and leaves Kiran and Pip watching anxiously.",
    "Continues directly from Scene 29 at the cave ledge.", "Cut to wide cliff overlook as mist parts.",
    "Foley: crisp wing-launch click, mist wind rushing, hopeful rising woodwind."],

  ["act3", ["OWL", "KIRAN", "PIP"], "GLASS_CITY", "Revealing the Sunken Glass City", "Slow", "Medium", "Sweeping aerial crane",
    "The Owl returns leading Kiran and Pip to a cliff overlooking a breathtaking sunken crystal city.",
    "Majestic 16:9 wide shot from a rocky cliff edge; far below in a misty crater lies an ancient city of translucent teal glass domes and a dark prism spire emitting a violet beam.",
    "The Clockwork Owl lands back on Kiran's shoulder pointing with its wing; Kiran and Pip gasp in amazement at the vast sunken glass city below.",
    "Continues directly from Scene 30 as the Owl guides them out onto the cliff overlook.", "Hold on the glowing crystal spire below.",
    "Foley: deep crystalline wind chime resonance, awe-filled strings swell."],

  ["act3", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "Descending the Crystal Staircase", "Medium", "Low", "Slow tilt-down follow",
    "Holding hands, Kiran and Pip descend a narrow winding crystal stair down into the city.",
    "High-angle 16:9 shot looking down spiral translucent glass steps cut into the cliff; tiny Kiran and Pip descend carefully guided by the hovering Owl.",
    "They step carefully down the slick glass stairs, steadying each other at each turn as teal reflections shimmer around their stick legs.",
    "Continues directly from Scene 31 descending from the cliff overlook.", "Match cut to street level in Glass City.",
    "Foley: delicate glass-tapping footsteps, quiet wind chime echo, mysterious marimba."],

  ["act3", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "Silent Streets of Glass", "Slow", "Medium", "Tracking wide shot",
    "Inside the sunken city, every surface reflects their tiny golden ember a hundred times.",
    "Mesmerizing 16:9 tracking shot along an arched glass avenue; Kiran's tiny lantern flame reflects infinitely across mirrored pillars while eerie shadow pools ripple nearby.",
    "Kiran, Pip, and the Owl tiptoe past frozen crystal arches, glancing nervously at dark shadow ripples sliding along the floor.",
    "Continues directly from Scene 32 arriving at the Glass City avenue.", "Hold as a colossal shadow falls over them.",
    "Foley: echoing glass chimes, soft cautious steps, ominous low synth & bass rumble."],

  // ACT IV — SUNKEN GLASS CITY (34-45)
  ["act4", ["SHADOW_KING", "KIRAN", "PIP"], "GLASS_CITY", "Throne of the Shadow King", "Slow", "High", "Low tilt-up reveal",
    "At the central plaza, the towering Shadow King guards the imprisoned Sun Core crystal.",
    "Monumental 16:9 wide shot inside the glass cathedral plaza; the colossal horned Shadow King looms over a glowing golden Sun Core locked inside a dark violet prism cage.",
    "Kiran and Pip crouch behind a low glass balustrade in the foreground, staring up in shock as the Shadow King's glowing violet eyes scan the plaza slowly.",
    "Continues directly from Scene 33 peering into the central Glass City plaza.", "Cut to close-up of Kiran whispering a plan.",
    "Foley: deep vibrating bass hum, crackling violet prism energy, tense silence."],

  ["act4", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "The Silent Diversion Plan", "Slow", "Medium", "Close three-shot",
    "Without speaking a word, Kiran draws a quick plan in dust for Pip and the Owl.",
    "Tight low-lit close-up behind the glass balustrade; Kiran traces two quick lines on the dusty glass floor, points up at a hanging glass chime, and looks at Pip and the Owl.",
    "Pip nods bravely clutching a tiny pebble; the Clockwork Owl clicks silently and lifts off toward the high rafters while Kiran crouches ready to sprint.",
    "Continues directly from Scene 34 behind the glass balustrade.", "Cut to Pip sneaking left.",
    "Foley: soft finger-tracing on glass, determined tiny clicks, sneaky pizzicato strings."],

  ["act4", ["PIP"], "GLASS_CITY", "Pip's Pebble Echo", "Medium", "Medium", "Tracking Pip",
    "Pip creeps to the far pillar and flicks a pebble against a giant hanging crystal chime.",
    "Medium shot of little Pip crouching behind a glowing teal pillar; he aims carefully and flicks a small pebble across the open floor.",
    "The pebble strikes a tall hanging crystal chime with a ringing musical note; Pip ducks swiftly back behind the pillar as violet shadow guards turn toward the sound.",
    "Continues directly from Scene 35 at the far pillar.", "Whip-pan across plaza to Shadow King turning.",
    "Foley: crisp crystal chime *DING*, echoing ripples, heavy turning shadow whoosh."],

  ["act4", ["SHADOW_KING", "PIP"], "GLASS_CITY", "The Giant Turns Away", "Medium", "High", "Slow pan across plaza",
    "Distracted by the ringing crystal chime, the Shadow King strides away from the Sun Core.",
    "Wide 16:9 shot of the cathedral plaza; the colossal Shadow King turns his horned head toward the ringing pillar on the left, leaving the violet Sun Core cage momentarily unguarded on the right.",
    "Heavy dark-ink footsteps shake the floor as the Shadow King stalks toward Pip's pillar; Pip holds his breath tightly behind the glass.",
    "Continues directly from Scene 36 as the Shadow King investigates the chime.", "Quick cut to Kiran sprinting right.",
    "Foley: booming giant footsteps, tense rising strings, rapid heartbeat pulse."],

  ["act4", ["KIRAN", "OWL"], "GLASS_CITY", "Dash for the Sun Core", "Fast", "High", "Fast side track",
    "Kiran sprints across the open glass floor while the Owl drops from above onto the lock.",
    "Dynamic fast-tracking shot; Kiran dashes swiftly across the gleaming floor with crimson scarf streaming while the Clockwork Owl swoops down onto the dark prism cage latch.",
    "Kiran slides cleanly up to the Sun Core cage; the Owl pries at the dark crystal lock with its brass beak as golden light leaks from the cracks.",
    "Continues directly from Scene 37 as Kiran reaches the unguarded Sun Core cage.", "Cut to Shadow King spotting them!",
    "Foley: swift sliding footsteps on glass, metallic beak prying, bright crystal crackle."],

  ["act4", ["SHADOW_KING", "KIRAN", "PIP"], "GLASS_CITY", "Spotted by Violet Eyes", "Fast", "High", "Snap zoom-out",
    "The Shadow King whips around, roaring silently as dark tentacles erupt across the plaza!",
    "Shocking wide 16:9 frame; the Shadow King spins around, his violet eyes flaring intensely as giant jagged ink tendrils burst out across the floor toward Kiran.",
    "Kiran grabs Pip who sprints back to join him; both dodge backward as a massive ink tendril slams down, shattering glass tiles right beside them.",
    "Continues directly from Scene 38 at the Sun Core cage.", "Cut on impact into acrobatic chase.",
    "Foley: thunderous glass shatter, deep roaring shadow-blast, explosive action percussion."],

  ["act4", ["KIRAN", "PIP", "SHADOW_KING"], "GLASS_CITY", "Acrobatic Glass-Roof Chase", "Fast", "High", "Fast horizontal track",
    "Kiran leaps across arched glass bridges, flipping over sweeping shadow blades.",
    "High-octane 16:9 side-scrolling stickman action shot; Kiran vaults over a sweeping black-ink blade, catches Pip by the hand, and slides down an arched crystal bridge.",
    "Fluid classic stickman martial acrobatics: Kiran wall-kicks off a glass spire, spins mid-air, and lands on a raised platform still gripping his golden lantern.",
    "Continues directly from Scene 39 racing onto the high glass bridges.", "Match cut to cornered spire balcony.",
    "Foley: rapid whooshing leaps, shattering crystal shards, adrenaline-fueled orchestral action."],

  ["act4", ["KIRAN", "OWL", "SHADOW_KING"], "GLASS_CITY", "The Owl's Brave Sacrifice", "Fast", "High", "Close-up impact",
    "When a shadow wave strikes toward Pip, the Clockwork Owl dives in front and takes the hit.",
    "Dramatic medium shot on the crystal balcony; a jagged ink spike shoots toward Pip, and the little brass Clockwork Owl intercepts it mid-air in a burst of golden sparks.",
    "The Owl deflects the spike away from Pip, loses three brass wing feathers, and tumbles clattering onto the glass tiles beside Kiran's feet.",
    "Continues directly from Scene 40 on the raised crystal balcony.", "Cut to Pip cradling the Owl.",
    "Foley: sharp metallic clang, shower of brass sparks, heartbreaking mechanical wind-down."],

  ["act4", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "Fallen Brass Feathers", "Slow", "High", "Close-up push-in",
    "Pip cradles the silent Clockwork Owl as Kiran stands furiously between them and the giant.",
    "Emotional close-up; Pip hugs the motionless brass Owl to his chest, tears welling in his big stickman eyes, while Kiran steps in front trembling with fierce resolve.",
    "Kiran lowers his head, grips his crimson scarf and lantern tightly, and turns back to face the looming Shadow King alone.",
    "Continues directly from Scene 41 on the crystal balcony.", "Tilt up to the Shadow King towering over Kiran.",
    "Foley: soft dying tick of the Owl, silent tear drop, deep tragic cello swell."],

  ["act4", ["KIRAN", "SHADOW_KING"], "GLASS_CITY", "Stickman Staff Duel", "Fast", "High", "Dynamic wide battle",
    "Snatching a fallen glass spear, Kiran clashes against the colossal Shadow King's ink blade.",
    "Epic 16:9 stickman duel silhouette; tiny agile Kiran wielding a gleaming glass staff & lantern leaps against the giant Shadow King's sweeping dark-ink sword.",
    "Kiran parries three colossal strikes in rapid succession, sparks and amber light flashing on every clash, before flipping onto the giant's arm.",
    "Continues directly from Scene 42 on the glass balcony.", "Cut to Shadow King's giant fist slamming down.",
    "Foley: ringing crystal-on-shadow clashes, nimble acrobatic whooshes, intense epic drums."],

  ["act4", ["KIRAN", "SHADOW_KING"], "GLASS_CITY", "The Lantern Shatters", "Fast", "High", "Slow-motion impact",
    "A massive shadow strike knocks Kiran back—shattering the brass lantern glass!",
    "Shocking slow-motion macro 16:9 shot; the Shadow King's giant ink fist slams Kiran against a pillar, sending his brass lantern flying and shattering on the glass floor.",
    "Kiran hits the stone hard and slumps down; the lantern shatters into pieces, its tiny ember rolling away across the dark tiles until darkness swallows the frame.",
    "Continues directly from Scene 43 as the giant strikes Kiran down.", "Fade quickly into pitch darkness.",
    "Foley: devastating impact thud, slow-motion glass shatter, sudden dead silence."],

  ["act4", ["KIRAN", "PIP", "SHADOW_KING"], "GLASS_CITY", "Swallowed by Darkness", "Slow", "High", "Pull-back into black",
    "The Shadow King laughs silently as pitch darkness blankets the sunken plaza.",
    "Bleak wide 16:9 shot; only the Shadow King's two glowing violet eyes remain visible above fallen Kiran and weeping Pip huddled over the broken lantern.",
    "Kiran lies motionless in the dark; Pip crawls weakly over and places his small hand gently over Kiran's chest beside the crimson scarf.",
    "Continues directly from Scene 44 in the dark Glass City plaza.", "Hold in deep darkness into Act V.",
    "Foley: chilling empty wind, faint quiet sob from Pip, lone deep piano bass note."],

  // ACT V — THE EMBER WITHIN (46-55)
  ["act5", ["KIRAN", "PIP"], "GLASS_CITY", "Warmth Under the Scarf", "Slow", "Medium", "Macro close-up",
    "In total darkness, Pip's flute melody wakes a tiny spark still glowing inside Kiran's heart.",
    "Pitch-black 16:9 macro frame; Pip lifts his wooden flute shakily with tears on his face and blows one trembling, brave soft note beside fallen Kiran.",
    "At the single flute note, a faint warm golden pulse glows softly beneath the crimson scarf on Kiran's chest; Kiran's closed eyes twitch open.",
    "Continues directly from Scene 45 in the dark plaza.", "Cut closer to Kiran's hand reaching for the last spark.",
    "Foley: single trembling bamboo flute note, faint warm heartbeat thump, soft chime."],

  ["act5", ["KIRAN", "PIP"], "GLASS_CITY", "The Crimson Scarf Torch", "Medium", "High", "Low-angle push-in",
    "Kiran wraps his crimson scarf around a broken wooden staff and ignites it from the last ember!",
    "Dramatic low-angle 16:9 shot; Kiran rises slowly to his feet, wraps his bright crimson scarf tightly around the wooden staff tip, and touches it to the last dying spark.",
    "WHOOSH! The scarf-wrapped staff ignites into a roaring golden-crimson torch, flooding Kiran and Pip's faces with brilliant warm hero light!",
    "Continues directly from Scene 46 as Kiran stands up in the dark.", "Cut to Shadow King recoiling from the blaze.",
    "Foley: roaring torch ignition WHOOSH, determined breath, triumphant rising brass."],

  ["act5", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "The Owl Sparks Back to Life", "Medium", "Medium", "Tight three-shot",
    "The brilliant golden torchlight recharges the Clockwork Owl's solar eyes—it clicks awake!",
    "Warm close-up illuminated by the roaring scarf torch; Pip holds the Clockwork Owl close to the bright golden flame.",
    "Warm golden light reflects off the Owl's brass lenses; with a crisp *CLICK-WHIRR*, its golden eyes glow bright again and it hops eagerly onto Kiran's torch staff!",
    "Continues directly from Scene 47 beside the roaring golden torch.", "Pan up toward the Sun Core spire.",
    "Foley: crisp mechanical winding clicks, bright joyful owl chime, hopeful string swell."],

  ["act5", ["KIRAN", "SHADOW_KING"], "GLASS_CITY", "Charging the Giant", "Fast", "High", "Fast low tracking",
    "Wielding the blazing crimson torch, Kiran charges straight through swirling shadow tendrils!",
    "Electrifying 16:9 action wide shot; Kiran sprints straight toward the towering Shadow King, leaving a trail of golden sparks as the blazing torch slices through ink tendrils.",
    "Every dark tendril that touches Kiran's golden blaze dissolves into harmless mist; Kiran leaps off a shattered pillar straight toward the Sun Core prism!",
    "Continues directly from Scene 48 charging across the plaza.", "Cut to Pip and Owl assisting.",
    "Foley: blazing fire whooshes, sizzling dissolving shadows, pounding heroic drums."],

  ["act5", ["PIP", "OWL", "SHADOW_KING"], "GLASS_CITY", "Flute Resonance & Wing Strike", "Fast", "High", "Upward tilt",
    "Pip plays a clear piercing flute note as the Owl dives to crack the violet prism cage.",
    "Dynamic 16:9 shot; Pip stands bravely blowing a bright steady flute note while the Clockwork Owl dives like a golden arrow straight at the violet lock of the Sun Core.",
    "The resonant sound wave makes the crystal prison vibrate; the Owl strikes the lock cleanly with its brass talons, splitting a jagged crack across the violet prism!",
    "Continues directly from Scene 49 in the central cathedral plaza.", "Match cut to Kiran leaping toward the crack.",
    "Foley: clear high flute resonance, crystalline hum vibrating, sharp metal-on-crystal crack."],

  ["act5", ["KIRAN", "SHADOW_KING"], "GLASS_CITY", "The Final Torch Strike", "Fast", "High", "Slow-mo impact push-in",
    "Kiran plunges his blazing crimson-gold torch directly into the cracked Sun Core prism!",
    "Climactic 16:9 slow-motion frame; airborne Kiran drives the roaring golden torch straight into the glowing crack of the dark violet cage as the Shadow King reaches out too late.",
    "At contact, blinding white-and-gold light fractures through every inch of the dark prism in spiderweb rays as the Shadow King shields his eyes.",
    "Continues directly from Scene 50 as Kiran reaches the cracked Sun Core prism.", "Explode into pure white-gold light.",
    "Foley: soaring orchestral crescendo, deep crystal tension building to a deafening chime."],

  ["act5", ["KIRAN", "PIP", "OWL", "SHADOW_KING"], "GLASS_CITY", "Shattering the Dark Prism", "Fast", "High", "360 pull-back",
    "The dark cage explodes into pure golden sunlight—dissolving the Shadow King into morning mist!",
    "Spectacular 16:9 shockwave frame; radiant golden sunlight erupts outward from the freed Sun Core, turning the giant Shadow King's ink cloak into drifting harmless mist.",
    "Kiran lands gracefully catching Pip and the Owl in a shield hug as waves of warm golden sunlight wash over the entire sunken city.",
    "Continues directly from Scene 51 as the prism shatters.", "Dissolve into rising golden sphere.",
    "Foley: triumphant crystal explosion, warm rushing wind of light, full choir-like string chord."],

  ["act5", ["KIRAN", "PIP", "OWL"], "GLASS_CITY", "Ascent of the Sun Core", "Slow", "Medium", "Vertical crane tilt-up",
    "The freed Sun Core floats steadily upward out of the crater, banishing the eternal dusk.",
    "Breathtaking 16:9 low-angle shot; Kiran, Pip, and the Owl stand together on the glass plaza looking up as the radiant golden Sun Core rises smoothly into the sky.",
    "Warm golden light paints their stickman silhouettes; Kiran's charred crimson scarf flutters softly in the warm ascending breeze.",
    "Continues directly from Scene 52 looking up from the sunlit plaza.", "Match cut to sunlight sweeping over hills.",
    "Foley: majestic ascending harmonic shimmer, gentle warm wind, uplifting melody."],

  ["act5", ["KIRAN", "PIP", "OWL"], "SUNRISE_VALLEY", "Light Sweeps the Ash Forest", "Slow", "Medium", "Wide sweeping pan",
    "A wave of golden sunrise sweeps across the Ash Forest and canyon, turning ash into green shoots.",
    "Panoramic 16:9 landscape shot; a brilliant wave of golden dawn light races across the dark Ash Forest, instantly sprouting tiny green leaves along the twisted branches.",
    "Birds and golden butterflies flutter into the sky as the dark mist evaporates, while Kiran, Pip, and the Owl watch from the valley ridge.",
    "Continues from Scene 53 as the Sun Core rises high above the valley.", "Cut back to the village square.",
    "Foley: sweeping wind of warmth, birdsong returning, joyful acoustic guitar & strings."],

  ["act5", ["KIRAN", "PIP"], "VILLAGE", "Return to the Village Ridge", "Slow", "Low", "Tracking follow",
    "Kiran and Pip walk back through the village stone arch bathed in warm morning light.",
    "Hopeful 16:9 wide shot at the stone village gate; Kiran (with his half crimson scarf) and Pip (wearing the other half) walk side by side into the sunlit village.",
    "Both pause beneath the stone arch, looking toward the cobblestone square where the frozen statues still stand, waiting for the rising sun.",
    "Continues from Scene 54 arriving back at the village gate.", "Push-in toward the stone statues.",
    "Foley: warm morning footsteps, distant rooster crow, tender hopeful piano."],

  // ACT VI — DAWN OVER THE VALLEY (56-64)
  ["act6", ["KIRAN", "PIP"], "VILLAGE", "Golden Rays Touch the Stone", "Slow", "Medium", "Slow dolly-in",
    "First warm sunlight sweeps across the cobblestones, cracking the grey stone off the villagers.",
    "Cinematic 16:9 medium shot in the village square; warm golden rays slide across the frozen baker and elder statues, illuminating hairline golden cracks.",
    "As warm light touches them, the grey stone shells shimmer and flake away into harmless golden dust, revealing living black-ink stickman villagers blinking awake!",
    "Continues directly from Scene 55 inside the sunlit village square.", "Cut to villagers waking up.",
    "Foley: delicate crystalline cracking, soft sparkling dust, emotional rising strings."],

  ["act6", ["KIRAN", "PIP"], "VILLAGE", "The Village Awakens", "Medium", "Medium", "Wide joyful pan",
    "Villagers stretch, hug each other in wonder, and turn toward Kiran and Pip at the gate.",
    "Warm joyful 16:9 wide shot of the bustling cobblestone square; stickman villagers look at their hands in amazement and notice Kiran and Pip standing bathed in dawn light.",
    "A baker drops his cap in joy; a mother stickman gasps spotting Pip safe and sound, rushing forward with open arms.",
    "Continues directly from Scene 56 in the awakened village square.", "Cut to emotional reunion.",
    "Foley: joyful murmured gasps, happy running footsteps, warm uplifting music swell."],

  ["act6", ["PIP", "KIRAN"], "VILLAGE", "Pip's Reunion", "Slow", "Medium", "Gentle orbit",
    "Pip runs into his mother's arms while glancing back gratefully at Kiran.",
    "Heartwarming 16:9 medium shot; little Pip runs across the cobblestones into the arms of a weeping, smiling stickman mother wearing a pale-blue apron.",
    "Pip hugs his mother tightly, then turns back with bright eyes, removes Kiran's crimson scarf half—no, Kiran smiles and shakes his head, signaling Pip to keep it.",
    "Continues directly from Scene 57 in the center of the square.", "Pan slightly toward Kiran and the Owl.",
    "Foley: warm emotional hug rustle, soft happy flute trill, gentle cello harmony."],

  ["act6", ["KIRAN", "OWL"], "VILLAGE", "Salute to the Little Hero", "Slow", "Low", "Medium push-in",
    "The villagers gather in a circle, bowing warmly to humble Kiran as the Owl chirps proudly.",
    "Warm 16:9 medium shot; surrounding stickman villagers clap gently and bow respectfully toward Kiran while the repaired brass Clockwork Owl perches on his shoulder.",
    "Kiran blushes modestly, rubs the back of his stickman head shyly, and lifts the remaining brass handle of his old lantern with a gentle smile.",
    "Continues directly from Scene 58 in the village square.", "Cut to Kiran walking up the hill.",
    "Foley: warm rhythmic clapping, cheerful mechanical owl chirp, gentle acoustic guitar."],

  ["act6", ["KIRAN", "PIP", "OWL"], "VILLAGE", "Repairing the Lantern Together", "Slow", "Low", "Static warm two-shot",
    "Sitting on the village fountain steps, Kiran, Pip, and the village blacksmith fit new glass to the lantern.",
    "Cozy golden-morning medium shot on stone fountain steps; a friendly village stickman hands Kiran a fresh gleaming lantern glass cylinder.",
    "Kiran fits the new glass cleanly into the brass frame; Pip plays a cheerful little flute tune while the Owl clicks in rhythm on the fountain edge.",
    "Continues from Scene 59 on the sunlit village fountain steps.", "Cut to them walking toward the valley hill.",
    "Foley: gentle glass clink, cheerful flute melody, light ticking rhythm."],

  ["act6", ["KIRAN", "PIP", "OWL"], "SUNRISE_VALLEY", "Walking Up to the Sunrise Overlook", "Slow", "Low", "Tracking from behind",
    "Kiran, Pip, and the Owl walk up the grassy hill overlooking the whole bright valley.",
    "Wide 16:9 tracking shot from behind Kiran and Pip walking hand-in-hand up a sunlit green path toward the hilltop overlooking the village.",
    "Both walk at an easy, unhurried pace while the Clockwork Owl circles playfully overhead in the golden morning sky.",
    "Continues from Scene 60 walking out onto the sunlit valley hill.", "Arrive at hilltop overlook.",
    "Foley: soft grass footsteps, morning breeze, warm uplifting sarangi & acoustic guitar."],

  ["act6", ["KIRAN", "PIP", "OWL"], "SUNRISE_VALLEY", "Playing the Dawn Song", "Slow", "Low", "Gentle push-in",
    "At the hilltop, Pip plays a bright dawn melody as butterflies and sunbeams fill the frame.",
    "Medium 16:9 golden-hour shot on the grassy hilltop; Pip sits on a warm rock playing his wooden flute while Kiran rests his new lantern beside them.",
    "Golden butterflies drift around Pip's flute; Kiran leans back smiling peacefully at the bright sunlit village and healed glass valley far below.",
    "Continues directly from Scene 61 at the hilltop overlook.", "Hold and widen slowly.",
    "Foley: serene uplifting bamboo flute solo, warm morning birdsong, gentle breeze."],

  ["act6", ["KIRAN", "PIP", "OWL"], "SUNRISE_VALLEY", "The Crimson Scarves in the Wind", "Slow", "Low", "Close-up to medium pull",
    "Wind catches both halves of the crimson scarf—on Kiran and Pip—fluttering together.",
    "Poetic 16:9 medium close-up from behind Kiran and Pip sitting side by side on the hilltop, both wearing matching halves of the crimson scarf.",
    "Warm morning breeze lifts both crimson scarf tails side by side against the glowing golden sun; Kiran places a gentle hand on Pip's shoulder as the Owl settles between them.",
    "Continues directly from Scene 62 on the hilltop rock.", "Seamless pull-back into grand finale.",
    "Foley: soft fluttering cloth in breeze, swelling warm strings, peaceful chime."],

  ["act6", ["KIRAN", "PIP", "OWL"], "SUNRISE_VALLEY", "Forever Shining", "Slow", "Low", "Grand crane pull-back",
    "Final sweeping 16:9 crane pull-back from the hilltop trio into the endless golden horizon.",
    "Spectacular 16:9 finale crane shot pulling smoothly up and back from Kiran, Pip, and the Clockwork Owl silhouetted against the radiant rising sun, revealing the entire thriving valley and revived village below.",
    "The three small silhouettes sit calmly watching the dawn as the camera glides skyward into warm golden clouds, holding the final tranquil frame cleanly.",
    "Continues directly from Scene 63 pulling back smoothly into a grand widescreen ending.", "Fade gracefully to end title in CapCut.",
    "Foley: soaring resolving orchestral & flute chord fading softly into peaceful morning birdsong."]
];

const STICKMAN_CLIPS = RAW_STICKMAN_SCENES.map(([act, who, loc, title, pacing, intensity, camMove, beat, visual, animAction, prevLink, transition, foley], idx) => {
  const num = idx + 1;
  const charList = who.map(c => STICKMAN_CHAR_NAMES[c] || c).join(" & ");
  const actObj = STICKMAN_ACTS.find(a => a.id === act) || STICKMAN_ACTS[1];

  const storyboardPrompt = [
    `GOOGLE FLOW STORYBOARD IMAGE PROMPT — "THE LAST LANTERN" — SCENE ${num}/${RAW_STICKMAN_SCENES.length} (${actObj.label})`,
    `CHARACTER CONSISTENCY: Keep approved character designs strictly consistent — ${who.map(c => STICKMAN_CHARS[c]).join(" ")}`,
    `ENVIRONMENT: ${STICKMAN_LOCS[loc]}`,
    `SCENE COMPOSITION (${camMove}): ${visual}`,
    `LIGHTING & MOOD: ${actObj.grade}.`,
    `CONTINUITY: ${prevLink}`,
    `${STICKMAN_MASTER_STYLE}`,
    `ASPECT RATIO: 16:9 widescreen cinematic frame. Clean illustration with ZERO text, ZERO speech bubbles, ZERO watermarks.`
  ].join("\n\n");

  const animationPrompt = [
    `GOOGLE FLOW IMAGE-TO-VIDEO ANIMATION PROMPT — "THE LAST LANTERN" — SCENE ${num}/${RAW_STICKMAN_SCENES.length}`,
    `TITLE: ${title} (${pacing} pacing · ${intensity} intensity · 10s)`,
    `STARTING VISUAL CONTEXT: Based on the approved Scene ${num} storyboard composition (${visual}) in ${STICKMAN_LOCS[loc]}`,
    `CHARACTERS — preserve exact approved designs:\n${who.map(c => STICKMAN_CHARS[c]).join("\n")}`,
    `CHARACTER & ENVIRONMENT MOTION: ${animAction}`,
    `CAMERA MOVEMENT: ${camMove} (smooth 16:9 widescreen 2D animation motion).`,
    `COLOR & LIGHTING: ${actObj.grade}.`,
    `CONTINUITY & TRANSITION: ${prevLink} Next scene bridge: ${transition}`,
    `SOUND DESIGN: ${foley}`,
    `${STICKMAN_MASTER_STYLE}`,
    `${STICKMAN_SILENT_RULE}`,
    `FORMAT: 16:9 wide YouTube cinematic framing. Exactly 10 seconds, ONE continuous shot with no hard cuts. Hold the final pose cleanly for the last 1 second.`
  ].join("\n\n");

  const cap = `${title} — "${STICKMAN_META.nepaliTitle}" (Scene ${num}/64)\n\n${beat} (${charList})\n\nएउटा सानो लालटिनको उज्यालो बोकेर अँध्यारो संसारमा आशा खोज्दै निस्किएका सानो स्टिकम्यान किरण, पिप र घडीको उल्लूको मर्मस्पर्शी यात्रा—जहाँ हरेक पाइलामा साहस, मित्रता र भित्री उज्यालोको कथा बुनिएको छ।\n\n#TheLastLantern #StickmanAnimation #VisualStorytelling #2DAnimation #NoNarration #10MinuteStory`;

  return {
    num,
    act,
    who,
    loc,
    title,
    pacing,
    intensity,
    camMove,
    beat,
    visual,
    animAction,
    prevLink,
    transition,
    foley,
    storyboardPrompt,
    animationPrompt,
    cap
  };
});

const STICKMAN_CAPCUT_GUIDE = {
  importOrder: [
    "1. Character turnaround reference sheets (Kiran, Pip, Clockwork Owl, Shadow King)",
    "2. Storyboard scene still frames (optional thumbnails / freeze-frame bridges)",
    "3. All 64 generated 10-second 16:9 Flow video clips (day-01.mp4 through day-64.mp4)",
    "4. Ambient sound beds (wind, forest crickets, rainstorm, city crystal hum, dawn birds)",
    "5. Macro & 2D foley SFX (footsteps, lantern flicker, flute notes, gear ticks, glass shatter)",
    "6. Instrumental music tracks (melancholic piano/cello for Act I & IV, driving drums for Act II–IV, soaring flute/strings for Act V–VI)"
  ],
  transitions: [
    "Within the same location (e.g., Scenes 1→2, 3→4, 14→15, 22→23): direct hard cut or 0.15s–0.2s quick cross-dissolve trimming 0.3s of static hold so motion flows continuously.",
    "Between Acts (10→11, 21→22, 33→34, 45→46, 55→56): 0.6s–0.8s Dip to Black (or Dip to White-Gold between Scene 51→52) accompanied by a musical swell or ambient shift.",
    "End Finale (Scene 64): 1.5s slow Fade to Black as the final flute & birdsong chord rings out."
  ],
  textOverlays: [
    "00:00–00:04 (Scene 1 opening): Minimalist fade-in title card — 'THE LAST LANTERN' (small subtle subtitle: 'A Visual Story · No Words Needed').",
    "Optional Act dividers (very brief 2s lower-third fade): Act I–VI titles if desired, or keep 100% text-free for pure silent cinema immersion.",
    "End Screen (last 10s after Scene 64): Clean Subscribe & Next Story end-screen cards."
  ],
  exportSettings: {
    resolution: "1920×1080 (1080p Full HD) or 3840×2160 (4K UHD) at 16:9",
    frameRate: "30 fps (or 60 fps with optical flow smoothing if desired)",
    bitrate: "Recommended High (20–35 Mbps for 1080p, 45–65 Mbps for 4K)",
    format: "MP4 (H.264 / HEVC)"
  }
};

function stickmanPromptFor(i, ar = "16:9", dur = "10s") {
  const c = STICKMAN_CLIPS[i];
  if (!c) return "";
  const actObj = STICKMAN_ACTS.find(a => a.id === c.act) || STICKMAN_ACTS[1];
  return [
    `GOOGLE FLOW 2D STICKMAN ANIMATION PROMPT — "THE LAST LANTERN" — SCENE ${c.num}/${STICKMAN_CLIPS.length} (${actObj.label})`,
    `TITLE: ${c.title} (${c.pacing} pacing · ${c.intensity} intensity)`,
    `CHARACTERS — keep approved designs strictly consistent:\n${c.who.map(code => STICKMAN_CHARS[code]).join("\n")}`,
    `ENVIRONMENT: ${STICKMAN_LOCS[c.loc]}`,
    `STARTING VISUAL CONTEXT: ${c.visual}`,
    `CHARACTER & ENVIRONMENT ACTION: ${c.animAction}`,
    `CAMERA MOVEMENT: ${c.camMove}`,
    `COLOR & LIGHTING: ${actObj.grade}.`,
    `CONTINUITY & TRANSITION: ${c.prevLink} Transition out: ${c.transition}`,
    `SOUND & MUSIC MOOD: ${c.foley}`,
    STICKMAN_MASTER_STYLE,
    STICKMAN_SILENT_RULE,
    `FORMAT: ${ar === "9:16" ? "9:16 vertical framing" : "16:9 wide YouTube cinematic framing"}. Exactly ${dur}, ONE continuous shot with no hard cuts. Hold the final pose cleanly for the last 1 second.`
  ].join("\n\n");
}

function stickmanCharactersFor(i) {
  const who = Array.isArray(STICKMAN_CLIPS[i]?.who) ? STICKMAN_CLIPS[i].who : [];
  return who.map(code => ({
    code,
    name: STICKMAN_CHAR_NAMES[code] || code,
    refPrompt: `Character reference: clean full-body 2D stickman cartoon turnaround character sheet of ${STICKMAN_CHARS[code] || code} Plain clean white/light neutral background for easy referencing, ultra-sharp black ink outlines, clear silhouette, expression range chart, no text.`
  }));
}
