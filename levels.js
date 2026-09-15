// ============================================================================
// LEVELS — what the game IS, level by level
// ============================================================================
// Split out of config.js, which holds how things BEHAVE. The test for whether
// something belongs here: does it change when you add a level or a crop, or
// when you tune how something feels? Growth speed, sway, dim alpha and camera
// follow are tuning and stay in config.js. The running order of the farms is
// content and lives here.
//
// ── WHAT A LEVEL IS ─────────────────────────────────────────────────────────
// One object per level, holding its map and its crop together.
//
// They used to be two things in two places: an entry in LEVELS naming a map,
// and a position in CROP_CYCLE naming a crop. They were matched by INDEX and
// wrapped SEPARATELY — 7 maps against 11 crops meant the pairing drifted every
// time round, so the same field grew something different on each pass and no
// one could say what a level was without counting entries in two lists.
//
// Now one line is one level and they cannot come apart.
//
//   FILE   path to the Tiled .tmj — field layout, canals, crop cells, props
//   CROPS  what each MARKER on the map's crops layer grows:
//
//            CROPS: { 1: 'tomato', 2: 'potato' }
//
//          The key is the marker's number in markers.tsx, counted from 1 — the
//          same number you paint with in Tiled. A cell painted with marker 2
//          grows what 2 names here; a marker the level does not name grows
//          nothing and says so in the console.
//
//          This is how a level holds MORE THAN ONE crop: the field is mixed by
//          painting, and which patch is which is decided here rather than in
//          the map. The HIGHEST marker a level names is treated as its own
//          crop — the one it adds to what came before — so that is what flies
//          to the roster when it is finished.
//   CROP   ONE crop, grown by EVERY marker the map paints — 1, 2, 3, whatever
//          is there. Not shorthand for marker 1: a map already drawn with
//          several markers would then come up with most of its field bare for
//          saying nothing wrong. So a level names markers only when it wants
//          variety, and until it does, whatever is painted grows its crop.
//          Ignored when CROPS is present.
//   RANCH  optional: makes this level an animal farm. Two kinds:
//
//            { SPECIES: 'pig', COUNT: 8 }   scattered — eight of them, put
//                                           anywhere that is not canal
//            { SPECIES: 'cow' }             placed — one per point on the map's
//                                           'ranch' object layer, named for the
//                                           way it faces (`cow_e`, or `_e` to
//                                           take this level's species)
//
//          COUNT is what tells them apart: with it the herd is scattered,
//          without it the map is asked. Either way each animal walks on as the
//          water reaches the cell it stands on, so the herd fills in behind the
//          flood. The species is a block in ANIMALS.SPECIES (config.js).
//   COST   optional: work to cut this level, overriding COST[] by position
//   PONDS  optional: marker id -> pond art, for maps painting pond markers
//
// The key names are the ones the code already reads, so binding the crop in
// costs nothing elsewhere — map loading, pond art and the debug report are
// untouched.
//
// Loaded BEFORE config.js (see index.html), which reads LEVEL_DATA below.
// ============================================================================

const LEVEL_DATA = {

    // ── THE RUNNING ORDER ───────────────────────────────────────────────────
    // Entry 1 is level 1. The list WRAPS: with seven entries, level 8 is entry
    // 1 again — the same map growing the same crop, which is now a property of
    // the pair rather than an accident of two lists sliding past each other.
    //
    // Adding a level: one line. Reordering: move the line, and its crop travels
    // with it.
    LEVELS: [



        // Levels 1-3 paint markers 1, 1-2 and 1-2-3 — each field carries what
        // the ones before it grew, plus its own. The last one named is the new
        // one, and the one that reaches the roster.
         { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },
        { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },
        { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },
        { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },

 
 
 
 
 
 
 
        //orchard levels
        { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },
        { FILE: 'maps/levels/orchard/orchard_02.tmj', CROPS: { 1: 'mango', 2:"cherry" } },
        { FILE: 'maps/levels/orchard/orchard_03.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana" } },
        { FILE: 'maps/levels/orchard/orchard_04.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana", 4:"orange" } },
        { FILE: 'maps/levels/orchard/orchard_05.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana", 4:"orange", 5:"pomegranate" } },


        { FILE: 'maps/levels/vegetable/vegetable_01.tmj', CROPS: { 1: 'tomato' } },
        { FILE: 'maps/levels/livestock/livestock_bunny.tmj', CROPS: { 1: 'carrot' }, RANCH: { SPECIES: 'bunny', COUNT:40} },

                { FILE: 'maps/levels/vegetable/vegetable_05.tmj', CROPS: {1: 'tomato', 2: 'potato', 3: 'egg-plant', 4: 'green-beans', 5: 'melon' } },

        { FILE: 'maps/levels/livestock/livestock_sheep.tmj', CROPS: { 1: 'grass' }, RANCH: { SPECIES: 'sheep', COUNT:60} },


        //vegetable levels
        { FILE: 'maps/levels/vegetable/vegetable_01.tmj', CROPS: { 1: 'tomato' } },
        { FILE: 'maps/levels/vegetable/vegetable_02.tmj', CROPS: { 1: 'tomato', 2: 'potato' } },
        { FILE: 'maps/levels/vegetable/vegetable_03.tmj', CROPS: {  1: 'tomato', 2: 'potato', 3: 'egg-plant' }},
        { FILE: 'maps/levels/vegetable/vegetable_04.tmj', CROPS:  {1: 'tomato', 2: 'potato', 3: 'egg-plant', 4: 'green-beans' } },
        { FILE: 'maps/levels/vegetable/vegetable_05.tmj', CROPS: {1: 'tomato', 2: 'potato', 3: 'egg-plant', 4: 'green-beans', 5: 'melon' } },

        //livestock levels
        { FILE: 'maps/levels/livestock/livestock_chicken.tmj', CROPS: { 1: 'corn' }, RANCH: { SPECIES: 'chicken', COUNT:100} },
        { FILE: 'maps/levels/livestock/livestock_cow.tmj', CROPS: { 1: 'grass' }, RANCH: { SPECIES: 'cow',} },
        { FILE: 'maps/levels/livestock/livestock_pig.tmj', CROPS: { 1: 'potato' }, RANCH: { SPECIES: 'pig', COUNT:30} },

        //orchard levels
        { FILE: 'maps/levels/orchard/orchard_01.tmj', CROPS: { 1: 'mango' } },
        { FILE: 'maps/levels/orchard/orchard_02.tmj', CROPS: { 1: 'mango', 2:"cherry" } },
        { FILE: 'maps/levels/orchard/orchard_03.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana" } },
        { FILE: 'maps/levels/orchard/orchard_04.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana", 4:"orange" } },
        { FILE: 'maps/levels/orchard/orchard_05.tmj', CROPS: { 1: 'mango', 2:"cherry", 3:"banana", 4:"orange", 5:"pomegranate" } },


        { FILE: 'maps/levels/livestock/livestock_chicken.tmj', CROPS: { 1: 'corn' }, RANCH: { SPECIES: 'chicken', COUNT:100} },
        { FILE: 'maps/levels/livestock/livestock_cow.tmj', CROPS: { 1: 'grass' }, RANCH: { SPECIES: 'cow',} },
        
        


        
        // An animal farm — nothing to draw on the map, just:
        //   { FILE: '…', CROP: 'grass', RANCH: { SPECIES: 'cow', COUNT: 8 } },
        // Unused sheets, ready to pair: melon, potato, grape.
        // A level that paints pond markers names its art here:
        //   { FILE: '…', CROP: 'melon', PONDS: { 1: 'pond1_dry' } },
    ],

    // ── CROP LIBRARY ────────────────────────────────────────────────────────
    // What a crop NAME means. Levels reference names; this says where the sheet
    // lives and how its frames are read. Not level-ordered — a dictionary.
    //
    // CLASS decides how the frames after the growth run are interpreted:
    //   trellis  last frame is the SUPPORT, drawn behind and never animated
    //   root     last frame is the pulled vegetable, for harvest; no fruit
    //   pasture  turf, not a plot: NO tilled patch under it, no fruit and
    //            nothing to harvest — the animal grazing it is the yield. Its
    //            plants are also scattered within their cells and clumped,
    //            rather than one dead centre in each (TILEMAP.PASTURE)
    //   (unset)  normal — last frame is the fruit, drawn over the final body
    CROP_LIBRARY: {
        DIR: 'graphics/crops/',
        EXT: '.png',
        CLASS: {
            'hops':        'trellis',
            'green-beans': 'trellis',
            'carrot':      'root',
            'potato':      'root',
            // Feed crops. A potato under a pig farm is still a potato — worked
            // ground, pulled at harvest — so only the grasses are pasture.
            'grass':       'pasture',
            'grass2':      'pasture',
            'grass3':      'pasture',
            'grass4':      'pasture',

            // Orchard. A tree's SHEET is laid out like any other fruiting crop —
            // four bodies and a fruit — so the class changes nothing about how
            // the frames are read. What it carries is everything a tree does
            // DIFFERENTLY from a plant: no tilled patch under it, no stage
            // spread at maturity, and no sway when someone walks past. See
            // _cropLayout in game.js for the frame side, and SCALE below for
            // how big each one draws.
            'mango':       'tree',
            'cherry':      'tree',
            'banana':      'tree',
            'orange':      'tree',
            'pomegranate': 'tree',
        },

        // ── WHAT A CLASS DOES ───────────────────────────────────────────────
        // Everything a class changes about a crop, declared once. Nothing in
        // the game asks "is this a tree" — it asks what the crop's class says
        // about the one trait it cares about, and a class that says nothing
        // gets the default in the asking code.
        //
        // THIS IS WHAT MAKES A NEW CROP ONE LINE. Adding a peach means naming
        // its class above and nothing else: it picks up the size, the bare
        // ground and the stillness from here, because those belong to trees
        // rather than to any particular tree.
        //
        //   TILLED        a worked-soil patch under the plant. Off for turf,
        //                 which is not worked ground, and for trees, which are
        //                 perennial — and whose canopy hides the patch anyway.
        //   SWAY          rocks when the farmer brushes past. A stem bends; a
        //                 trunk does not. Trees still shake when picked — that
        //                 is a separate force and asks for it explicitly.
        //   STAGE_SPREAD  widens at maturity (CROP_STAGE_SCALE). It exists so a
        //                 mature vegetable can spill past its own cell. A tree
        //                 is already several tiles wide, and spreading it
        //                 further mostly swells the fruit, which reads as the
        //                 camera moving in.
        //   SHAKE         what the pick's shake looks like: 'bend' rotates the
        //                 plant about its stem, 'squash' compresses it in place.
        //                 A tree squashes because its shadow sits under the
        //                 pivot and is wide, so rotating swings the shadow.
        //   SCATTER       planted off the cell centre, and sometimes twice, so
        //                 the field has no rows. Right for turf, which nobody
        //                 sowed in lines; wrong for anything someone planted.
        //   SCALE         drawn size in tiles-per-frame-width. The per-crop
        //                 SCALE table below overrides it for one odd variety.
        CLASS_TRAITS: {
            pasture: { TILLED: false, SCATTER: true },
            tree:    { TILLED: false, SWAY: false, STAGE_SPREAD: false, SCALE: 2.0,
                       SHAKE: 'squash' },
        },

        // ── HOW BIG IT GROWS ────────────────────────────────────────────────
        // A multiplier on the plant's drawn size. 1 — the default — makes a
        // crop exactly one tile wide before the growth stages scale it.
        //
        // WHY TREES NEED IT. A crop sheet's frame WIDTH is mapped to one tile
        // whatever its pixel size, so every crop ends up the same size on screen
        // and drawing a tree bigger inside its frame changes nothing. With the
        // farmer a fixed 1.9 tiles on every farm, an orchard came out the same
        // height as a tomato patch and read as a field of bushes.
        //
        // 2.0 IS THE CEILING FOR THE EXISTING ART, and it is not arbitrary: the
        // growth stages multiply this by 1.3 at maturity, so 2.0 draws a
        // 128x256 frame at exactly 128x256 — its native pixels, nothing
        // stretched. Anything above starts upscaling and the tree goes soft.
        //
        // At that size the frame stands 5.2 tiles tall against a 1.9-tile
        // farmer, so how tall the TREE looks is down to how much of the frame
        // the drawing fills. Fill the frame and it reads at roughly twice his
        // height, which is what an orchard wants.
        //
        // For anything bigger the frames have to be re-exported at 256 wide;
        // then a scale of 3 draws at 186px from 256 and is still downsampled.
        // PER-CROP OVERRIDES ONLY. A class already carries the size its crops
        // normally draw at — trees take 2.0 from CLASS_TRAITS — so this table
        // is for the one variety that breaks its class's rule, a dwarf apple
        // among standards. Empty is the healthy state.
        SCALE: {
        },
    },

    // ── COST CURVE ──────────────────────────────────────────────────────────
    // Work to cut each level, by position in the running order. Taken from
    // Blumgi Merge's Total HP column verbatim. A Level may name its own COST to
    // break the curve; otherwise it takes the entry at its index.
    //
    // Per-tile hardness is this divided by the map's row count, so a short map
    // is harder per tile than a long one of the same cost. Nothing authors that
    // and nothing stores it.
    COST: [
        100, 350, 1800, 8000, 22500,                   // 1-5
        42000, 15000, 95000, 230000, 600000,           // 6-10
        1200000, 4500000, 5600000, 11800000, 27900000, // 11-15
        58500000, 135000000, 225000000, 450000000, 750000000, // 16-20
        1500000000, 1800000000, 2400000000, 3100000000, 3400000000, // 21-25
        3600000000, 4200000000, 5000000000, 225000000, 6500000000, // 26-30
        7200000000, 7900000000, 9000000000, 9800000000, 11300000000, // 31-35
        13800000000, 15900000000, 18200000000, 19500000000, 22500000000, // 36-40
        27000000000, 75000000000, 120000000000, 180000000000, 240000000000, // 41-45
        285000000000, 390000000000, 480000000000, 675000000000, 900000000000, // 46-50
        1350000000000, 1850000000000, 2650000000000, 3750000000000, 5250000000000, // 51-55
        6750000000000, 8250000000000, 10500000000000, 13500000000000, 16500000000000, // 56-60
        20500000000000, 22500000000000, 1125000000000, 27000000000000, 27000000000000, // 61-65
    ],

    // Multiplies the whole column. Dormant at 1. Rescaling preserves every
    // ratio, so the numbers can move off Blumgi's literal values at any point
    // without re-testing balance — it changes the display, nothing else.
    COST_SCALE: 1,

    // How a level's cost divides ALONG the level: a soft opening, a medium
    // middle, a hard final third. Taken from the split between Blumgi's three
    // monsters, which is stable across their whole table (level 1 is 20/30/50,
    // level 65 is 30/33/37, average 28/33/39). Keeps the texture of their
    // three-monster structure inside our one-machine model — the rig visibly
    // labours as a level closes.
    STRETCHES: [0.28, 0.33, 0.39],
};

// Say so loudly if a level is half-defined. Both halves are needed to build
// anything, and a missing crop in particular fails as a silently bare field.
for (let i = 0; i < LEVEL_DATA.LEVELS.length; i++) {
    const lv = LEVEL_DATA.LEVELS[i];
    const grows = lv.CROPS ? Object.keys(lv.CROPS).length : (lv.CROP ? 1 : 0);
    if (!lv.FILE || !grows) {
        console.error(`[levels] entry ${i + 1} is incomplete — ` +
            `map=${lv.FILE || '(none)'} crops=${grows || '(none)'}. ` +
            `A level needs a map and at least one crop.`);
    }
}
