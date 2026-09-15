// Helper: convert CSS hex color string to Phaser hex number
function hexColor(cssColor) {
    if (typeof cssColor === 'string' && cssColor.startsWith('#')) {
        return parseInt(cssColor.substring(1), 16);
    }
    return cssColor;
}

var CONFIG = {
    // Quotes are LOAD-BEARING. Phaser passes this straight into a canvas font
    // string, and a family with a space and a digit in it fails to parse
    // unquoted — silently, falling back to the system default with no error.
    FONT_FAMILY: '"Baloo 2", sans-serif',
    FONT_WEIGHT: '600',     // the ONE weight shipped in fonts/. Every label asks
                            // for this rather than 'bold', because 'bold' means
                            // 700 — which is not in the file, so the browser
                            // SYNTHESISES it by smearing the 600 sideways. That
                            // looks worst on small text with a stroke, which is
                            // most of this UI. Ship an 800 file and set this to
                            // '800' if the numbers want more weight.
    TEXT_COLOR: '#1A237E',

    // ── Screen split ──────────────────────────────────────────────────────────
    // Landscape puts the UI (grid, coin, spawn button, battery slots) on the LEFT
    // and the farm on the RIGHT. The farm is what the game is about, so it takes
    // the larger share: the UI needs only the grid panel's width plus margins.
    // Portrait stays a 50/50 top/bottom split — see calculateLayout().
    LAYOUT: {
        LANDSCAPE_SPLIT: 0.4,      // UI's share of the WIDTH; the farm gets the rest
        // The design reference is a 1440×778 MacBook. REF_W is the UI half AT THAT
        // SPLIT, so changing the split alone never resizes the grid: the scale works
        // out to screenWidth/1440 either way (0.5·W/720 === 0.4·W/576).

        PORTRAIT_SPLIT:  0,        // the FARM's share of the HEIGHT — the other way
                                   // round from LANDSCAPE_SPLIT, because in
                                   // portrait the farm is the part that takes the
                                   // named share.
                                   //
                                   // 0 means DERIVE it, which is the default and
                                   // almost certainly what you want. Standing the
                                   // battery on its end beside the grid took the
                                   // case out of the vertical column, leaving only
                                   // coin, panel and button — about 650 design px
                                   // where landscape needs 778. The UI half is then
                                   // sized to that shorter column, which leaves the
                                   // grid at EXACTLY the size it had before and
                                   // hands the whole difference to the farm.
                                   //
                                   // Setting a number overrides that, and then it
                                   // is a real trade. LANDSCAPE_SPLIT spends
                                   // horizontal slack the panel was not using;
                                   // portrait's column has none left, so going past
                                   // the derived value shrinks the merge grid in
                                   // proportion.
        REF_W_PORTRAIT: 720,
        REF_H: 778,
    },

    // Play / pause, top-right of the screen. The icon shows what pressing it
    // will DO — a pause bar while running, a play arrow while stopped — which is
    // the convention every media player uses.
    PAUSE: {
        ENABLED: true,
        SIZE:    44,        // px @ design scale
        MARGIN:  16,        // from the screen's top-right corner, px @ design
        ALPHA:   0.85,
        DEPTH:   100000,    // above everything, including the debug grid
    },

    RESET_PROGRESS: false,
    DEBUG_HALF_LINE: false,  // draw a line splitting partA / partB (vertical in
                             // landscape, horizontal in portrait)
    // White lattice over the farm half, on the TILE boundaries — so it shows
    // where tiles actually are, not just where 22x20 cells would fall. It is
    // world content, so it scrolls with the band and stays welded to the tiles.
    // Columns come from the map's own width; rows are anchored to the map's grid
    // and continued in both directions to fill the visible band.
    DEBUG_GRID: {
        ENABLED: false,
        COLOR:   0xffffff,
        ALPHA:   0.25,     // faint: this has to sit over the art without hiding it
        WIDTH:   1,        // px @ platformScale
        DEPTH:   9000,     // above everything the farm draws
    },
    DEBUG_POWER: true,       // log what the machine is actually delivering, once
                             // a second while it is cutting: hardness of the row
                             // it is in, power from the slots, the two speed
                             // limits, which one is binding, and the strain.
                             // This is the readout for tuning the whole feature
    DEBUG_MAP:  true,        // report, per band, exactly what reached the
                             // renderer from the level's .tmj: which layers were
                             // found and whether they carry anything, which
                             // tilesets resolved to art, which gids could not be
                             // drawn, and how much of the ground on screen is
                             // the MAP versus the filler strip. Errors and
                             // warnings below are logged whatever this is set to
    DEBUG_PERF: true,        // log object / tween / timer / texture counts each
                             // time the world rebases (once per level). Climbing
                             // numbers = something is outliving its band
    // The hammer the run starts on. It was 50 — a dev shortcut for jumping up
    // the battery ladder — which now hands you 125,000,000 damage a strike
    // against a level-1 block of 25, so the first three farms vanish before
    // they are seen. At 1 a strike does 5 and level 1's blocks take 5, 10 and
    // 20 hits. Put it back to 50 to test the art at the top of the sheet.
    BATTERY_START_LEVEL: 1,
    BATTERY_IMAGE_EXTENSIONS: ['svg', 'png', 'jpg', 'webp'],

    // BACKGROUND: {
    //     GRADIENT_START_COLOR: "#79d288",
    //     GRADIENT_END_COLOR: "#79d288",
    // },
     BACKGROUND: {
        GRADIENT_START_COLOR: "#B6915c",
        GRADIENT_END_COLOR: "#B6915c",
    },

    // ── The stage ─────────────────────────────────────────────────────────────
    // The game renders at ONE fixed size, chosen once at boot, and the canvas is
    // scaled by the browser to whatever the window is. Resizing then changes
    // nothing inside the game: no rebuild, no reflow, and so no progress to
    // lose. It replaces a scene restart that reset the run every time the window
    // moved, and it is what shipped Poki games do.
    //
    // The layout is picked from the window's shape at BOOT and never changes
    // again. Squeezing a desktop window tall leaves the game in landscape with
    // bars rather than reflowing into the phone layout — a desktop player
    // narrowing a window has not become a phone.
    //
    // It also settles a question that had no answer before: on-screen tile size
    // used to follow the viewport and ranged 49-131px, so no asset had a
    // provably correct export size. The farm half is now a constant, so a tile
    // is ONE number and every asset can be sized against it exactly.
    STAGE: {
        ENABLED: true,
        // ONLY THE WIDTH IS FIXED. Height is taken from the window's own aspect
        // at boot, so the stage matches the screen exactly and there are no bars
        // to begin with — a fixed 16:9 stage letterboxes on nearly every real
        // phone, none of which are 16:9 any more.
        //
        // Width is the half that must be constant, because tile size is the farm
        // half's width divided by the map's columns. Height is free: the world
        // scrolls vertically, so a taller stage simply shows more of it.
        //
        // The clamps stop a freak window from producing an absurd stage — a very
        // wide-and-short desktop window, or a phone-shaped browser on a monitor.
        // Beyond them you get bars again, which is the correct outcome.
        PORTRAIT:  { W: 1080, H: 1920, MIN_RATIO: 1.30, MAX_RATIO: 2.40 },
        LANDSCAPE: { W: 1920, H: 1080, MIN_RATIO: 0.45, MAX_RATIO: 0.80 },
        // false pins the stage to the H above, ignoring the window's shape.
        DERIVE_HEIGHT: true,
        // FIT      letterboxes: the whole game always visible, bars on a
        //          mismatched aspect, nothing ever cut off.
        // ENVELOP  fills the window and crops the overflow. No bars, but it eats
        //          the edges of a 22-column field — so FIT is the safer default
        //          for a game whose playfield spans the full width.
        MODE: 'FIT',
        // null decides from the window's shape at boot. 'portrait' / 'landscape'
        // pins it, which is how you test one layout on the other device.
        FORCE: null,
    },

    // ── The roster ────────────────────────────────────────────────────────────
    // A strip of slots along the top of the farm, one filling each time a level
    // is finished. It answers a game that otherwise reads as passing through:
    // everything a farm grows is reaped with the farm, so nothing the player
    // earned was ever visible for longer than a level.
    //
    // THE EMPTY SLOTS DO THE WORK. Three filled and two waiting says "two more
    // in this stretch" without a word — which a level number cannot do, because
    // counting up has no end in sight. It is glanceable rather than readable,
    // which matters on a platform where nobody reads.
    ROSTER: {
        ENABLED: true,
        // ...and the same on the roster strip, for the same reason. Scales the
        // slot, which carries its icon and its stroke with it.
        PORTRAIT_SCALE: 1.2,
        SLOTS:   5,          // per block — the unlock ladder runs in fives
        // The stretch of the run you are in, named over the slots. It changes
        // every SLOTS levels, which is what makes it worth reading: a level
        // number counts up forever and says nothing, while a name that holds for
        // five levels and then changes tells you the subject has moved on.
        //
        // Places, not categories — "Vegetable Patch" and "Farmyard" are ground
        // you can picture, where "Basic Crops" would be the developer's word for
        // a tier and would age badly beside them.
        //
        // Farmyard rather than Ranch: a ranch is cattle on open land, and this
        // block has pigs, chickens and rabbits in it.
        // PLAIN NOUNS, no verb. The row filling one slot at a time IS the
        // restoring, so a label that also said "Restored" was either premature —
        // it sits over four empty slots for most of a block — or repeating what
        // the slots are already doing. A noun is true at every moment of the
        // block, and it is one word to translate rather than two.
        BLOCKS: [
            'Vegetables',        // 1-5
            'Livestock',         // 6-10   (no plural: it is already collective)
            'Orchard',           // 11-15
            'Flowers',           // 16-20
        ],
        LABEL_SIZE:  15,     // px at design scale
        // White on a dark outline, not dark on the field. The name sits over
        // open ground whose colour is whatever the level happens to be, and a
        // brown that reads as ink on pale soil reads as a greyed-out label on
        // anything darker. The outline carries the contrast so the fill can stay
        // white over every background.
        LABEL_COLOR:  '#ffffff',
        LABEL_STROKE: '#2b2013',
        LABEL_STROKE_W: 3,   // px at design scale
        LABEL_GAP:   2.5,    // between the name and the slots

        // ── WHAT WAS JUST BROUGHT BACK ──────────────────────────────────────
        // The newest slot's produce, named under it — and only that one. Naming
        // every slot would turn the strip into a list to read; naming the last
        // one makes it a caption on the thing that just happened, and it moves
        // along the row as the block fills.
        PRODUCE: {
            ENABLED: true,
            SIZE:    13,         // px @ design scale, under the block name's 15
            // The same white-on-dark as the block name above it and the level
            // number on the tally cells. It was inverted — dark ink, pale
            // outline — on the reasoning that it sits on open ground rather
            // than over the strip. But it reads as a different KIND of text
            // that way, and it is the same kind: a caption on a roster cell.
            // Legibility over ground is the stroke's job either way.
            COLOR:  '#ffffff',
            STROKE: '#2b2013',
            STROKE_W: 3,
            GAP:     3,          // below the slots
        },

        SIZE:    46,         // slot side, px at design scale
        RADIUS:  12,         // corner rounding, px at design scale. Clamped to
                             // half the side, where the cell becomes a circle.
                             // At GAP 0 the rounding pinches each seam slightly —
                             // the row still reads as one strip, with the cells
                             // legible inside it. Open GAP a little to let them
                             // read as separate rounded tiles instead.
        GAP:     0,          // none — the slots meet, so the row reads as ONE
                             // strip of cells rather than five loose buttons.
                             // Their strokes fall on the same line at each seam,
                             // which is what draws the divider between them
        Y:       12,         // down from the top of the farm half — to the top of
                             // the NAME, with the slots below it. One number
                             // moves the whole block
        // Pale, so a dark icon reads against it — the farm behind is earth and
        // foliage, and a light panel separates the roster from it without a
        // border round the whole thing.
        // Solid, not translucent — the farm scrolls under this strip, and a
        // see-through panel means moving crops and canals read through the
        // slots. An icon has to sit on something still.
        //
        // Waiting and filled differ by SHADE now rather than by opacity: the
        // empty slot is a duller cream, the filled one near-white, so a slot
        // with something in it still looks occupied.
        EMPTY_COLOR: 0xd9d1bf,
        EMPTY_ALPHA: 1,
        FULL_COLOR:  0xfffdf6,
        FULL_ALPHA:  1,
        STROKE_COLOR: 0x5c4a33,
        STROKE_ALPHA: 0.85,
        STROKE_W:     2,
        ICON_FRAC:   0.78,   // icon size inside its slot

        // ── The icon sheets ─────────────────────────────────────────────
        // One sheet per two unlock blocks, so a short session never downloads
        // the icons for a stretch it will not reach — a player who stops at
        // level 5 never pulls the orchard's.
        //
        // Numbered rather than named for their contents, because blocks get
        // rebalanced and the sheet a thing lives in is nobody's business: an
        // icon is found by NAME, and which file holds it falls out of the
        // lists below.
        // EACH SHEET LISTS WHAT IS IN IT, IN THE ORDER IT IS DRAWN — left to
        // right, top to bottom. The position in the list IS the frame number,
        // so nothing here says "12" and nothing has to be renumbered when the
        // artwork changes: insert a name, insert an icon, done.
        //
        // A sheet holds whatever its stretch of the run needs, however many
        // that is — produce icons included. The grid does not have to be ten,
        // and the game works the columns out from the image width and FRAME,
        // so no rows or columns are declared either.
        //
        // Leave a name EMPTY to reserve a blank slot in the middle of a group;
        // the positions after it do not shift.
        SHEETS: [
            { FILE:  'graphics/ui/icons/icons_01.webp',
              ICONS: 'tomato, potato, egg-plant, green-beans, melon,' +
                     'cow, chicken, bunny, sheep, pig,' +
                     'churn, corn, egg, fleece, carrot' },
            { FILE:  'graphics/ui/icons/icons_02.webp',
              ICONS: 'mango, cherry, banana, orange, pomegranate' },
        ],
        FRAME:     48,       // one icon, square. 1.2x the ~40px it draws at

        // ART THAT IS NOT 48px SQUARE, and has no business being squeezed into
        // the grid — a standalone texture in graphics/ui/, by name. Loaded from
        // this table, so an entry here is all a new one needs.
        //
        // EMPTY, and that is the healthy state: every icon lives in a sheet.
        // Kept because the escape hatch is worth having — the checkmark is
        // 64x48 and the bolt 49x80, and art like that should not be padded
        // into a 48px grid to join the club.
        //
        // The sheets are searched FIRST, so moving an icon into a sheet is a
        // matter of adding its name there; an entry left behind here is dead
        // rather than conflicting.
        //
        // Anything in neither falls back to the fruit cropped out of its crop
        // sheet, so an unlock with no icon yet still shows something.
        ICONS: {
        },
        POP_MS:      420,    // the drop-in when a slot fills

        // ── The flight ──────────────────────────────────────────────────
        // The unlocked produce leaves the plant it was found on and travels to
        // its slot. Without that the icon simply appears, and an unlock that
        // appears has no cause — the flight is what says "this came from there".
        //
        // It crosses cameras: the plant is in the scrolling world, the roster is
        // pinned to the screen. The launch point is converted once, at take-off,
        // and the flier is a screen-space object from then on. The plant is not
        // moving by that point, so nothing needs tracking.
        FLY_MS:   900,
        FLY_ARC:  0.45,      // how high it bows, as a fraction of the distance.
                             // An arc reads as carried; a straight line reads as
                             // a UI element sliding
        FLY_TOP:  6,         // the arc's PEAK may come no closer than this to the
                             // top of the screen. The roster is already up there,
                             // so a bow measured off the distance sends the curve
                             // clean off the top — most of the flight would
                             // happen where it cannot be seen
        FLY_FROM: 1.9,       // it starts larger than the slot — near the plant it
                             // is a piece of produce, and becomes an icon on
                             // arrival
        DEPTH:       99000,  // over the world, under the pause button
    },

    // ── Task list ─────────────────────────────────────────────────────────────
    // Every field is a job with a name and a number. A small list sits at the top
    // left of the FARM half showing two of them: the one being dug, and the one
    // after it greyed out. Finishing a field ticks its row, drops it, promotes the
    // next one and brings a fresh one in below — so the player always sees where
    // they are and what is coming, and the level ending gets a beat of its own
    // before the camera moves on.
    TASKS: {
        ENABLED: false,            // hidden for now — the panel, the tick and the
                                   // list shuffle all still work, they just are
                                   // not built. Flip to true to bring it back
                                   // (the level's ending beat comes back with it)
        TOTAL:   65,               // shown as "1/65"; the run's length
        NAMES: [
            "Jenny's Tomatoes", 'Golden Grove', 'Grape Grove', 'Redberry Farm',
            'Crimson Fields', 'Mango Haven', 'Vine Valley',
        ],
        FALLBACK: '<no name>',     // past the end of NAMES

        // Geometry, px at design scale (they ride the layout's uniform scale).
        PAD:      14,              // inset from the farm half's top-left corner
        WIDTH:    250,             // panel width
        ROW_H:    36,
        COUNT_W:  52,              // the "1/65" column
        COUNT_SIZE: 15,
        NAME_SIZE:  17,
        TICK_R:   11,              // tick ring radius
        TICK_W:   2.5,             // ring thickness

        BG_COLOR:  '#14200f',
        BG_ALPHA:  0.42,
        BG_RADIUS: 10,
        TEXT_COLOR: '#ffffff',
        DIM_ALPHA: 0.45,           // the not-yet-started row
        DONE_COLOR: '#8ce87a',     // ring + check once the field is finished

        // The ending beat, in order.
        TICK_MS:  420,             // the check springing in
        HOLD_MS:  320,             // beat before the list moves
        SHIFT_MS: 380,             // row leaving / promoting / new row arriving
        DEPTH:    20,              // over everything in the field
    },

    BUTTON: {
        SPAWN_WIDTH: 250,
        SPAWN_HEIGHT: 90,
        LEVELUP_WIDTH: 180,
        LEVELUP_HEIGHT: 70,
        LEVELUP_COLOR: "#FF6B9D",
        LEVELUP_BORDER_COLOR: "#E91E63",
        LEVELUP_BORDER_WIDTH: 4,
        BOTTOM_PADDING: 70,
        BUTTON_SPACING: 220,
        BATTERY_ICON_WIDTH: 64,
        BATTERY_ICON_HEIGHT: 64,
        BATTERY_ICON_X: -80,
        BATTERY_ICON_Y: 0,
        COIN_TEXT_SIZE: '32px',
        COIN_TEXT_X: 20,
        COIN_TEXT_Y: 0,
        COIN_ICON_WIDTH: 50,
        COIN_ICON_HEIGHT: 50,
        COIN_ICON_X: 80,
        COIN_ICON_Y: 0,
    },

    AD: {
        DURATION: 15,  // Duration of mock ad in seconds (countdown timer)
        OVERLAY_COLOR: "#000000",
        OVERLAY_ALPHA: 1.0,  // Fully opaque - blocks game view completely
        TIMER_TEXT_SIZE: '120px',
        TIMER_TEXT_COLOR: '#FFFFFF',
    },

    MERGE_GRID: {
        PADDING_FROM_BUTTON_TOP: 50,
        // Drop the whole grid block (panel, cells and — in portrait — the coin
        // line above it) by this much, closing the gap over the spawn button.
        // The panel art carries its own baked shadow well below the last row of
        // cells, so it may run into the button: that is fine, the button is
        // drawn at a far higher depth and covers it.
        PANEL_DROP: 30,                // px @ design scale
    },

    BATTERY_UNLOCK_DISPLAY: {
        DISPLAY_CROWN_PANEL: false,    // OFF — the crown + battery-name line above
                                       // the grid is gone. Everything below still
                                       // works if it is ever wanted back
        SHOW_CROWN_ICON: true,
        SHOW_BATTERY_ICON: false,
        CROWN_ICON_SIZE: 32,
        BATTERY_ICON_SIZE: 32,
        TEXT_SIZE: '24px',
        // TEXT_COLOR: '#FFD700',
        TEXT_COLOR: '#000000',
        // TEXT_STROKE_COLOR: '#8B4513',
        TEXT_STROKE_COLOR: '#000000',
        TEXT_STROKE_THICKNESS: 0,
        CROWN_BATTERY_SPACING: 10,
        BATTERY_TEXT_SPACING: 5,
        VERTICAL_OFFSET: 20,
        PADDING_FROM_LEFT: 10,
    },

    COIN_COUNTER: {
        ALIGN_WITH_GRID_ROW: 1,
        PADDING_FROM_SCREEN_RIGHT: 20,
        TEXT_SIZE: '48px',
        TEXT_COLOR: '#f7ca42',
        TEXT_STROKE_COLOR: '#7e5d11',
        TEXT_STROKE_THICKNESS: 6,
        COIN_ICON_WIDTH: 40,
        COIN_ICON_HEIGHT: 40,
        TEXT_ICON_SPACING: 10,
    },

    CELL: {
        SIZE: 130,
        GAP: 4,
        RADIUS: 15,
        EMPTY_BG_COLOR: "#c2d1e0",
        FILLED_BG_COLOR: "#eaf0f6",
        INSET_SHADOW_COLOR: "#364549",
        INSET_BORDER_WIDTH: 3.5,
        // Grain over the flat cell colour. graphics/cell_noise.png is neutral
        // grey with blurred noise, blended over the fill when the cell faces are
        // baked — so this is the same composite you would build in an image
        // editor, except the colour underneath stays a config value and one
        // grain file serves every face. A change here needs a reload.
        NOISE: {
            ENABLED:  true,
            BLEND:    'overlay',       // 'overlay' | 'soft-light' | 'multiply'
            CONTRAST: 2,               // stretch the tile before blending. The
                                       // file is blurred noise spanning only
                                       // ±18% around neutral grey, so without
                                       // this an editor-style 7% alpha lands
                                       // under a level of 255 — invisible
            ALPHA:    0.25,            // strength of the blend, AFTER contrast.
                                       // Felt rather than seen: ~2 levels of 255
                                       // on a light cell
            TILE:     1,               // 1 = tile stretched to the cell.
                                       // 0.5 = blown up 2× → coarser grain
        },
        // LANDSCAPE / DESKTOP figures. A 64px battery in a 130px cell, with the
        // label parked 40px above it — sized by eye against a big screen, where
        // there is room to spare and the cell can breathe.
        BATTERY_DISPLAY_SIZE: 64,
        BATTERY_SCALE: 1.0,
        BATTERY_Y_OFFSET: 5,
        LEVEL_TEXT_SIZE: '11px',
        LEVEL_TEXT_COLOR: '#000000',
        LEVEL_TEXT_Y_OFFSET: -40,

        // ── PORTRAIT: FILL THE CELL ─────────────────────────────────────────
        // The same figures on a phone are a battery half the width of its cell
        // and a label under 8px — legible on a desktop at arm's length and not
        // on a phone at all. The cell itself is not the problem; the content
        // sitting in the middle of it is.
        //
        // So portrait DERIVES all four instead of scaling them: pad the cell top
        // and bottom, give the label its share of what is left, and the battery
        // takes the rest. Nothing is chosen by eye — the cell's own height is
        // the only input, so it stays right at any phone size.
        //
        // The label goes ABOVE the battery, which is the order the desktop
        // offsets already put them in.
        MOBILE: {
            ENABLED:    true,
            // TOP AND BOTTOM PADDING, as a SHARE of the cell — not a fixed
            // number of design pixels.
            //
            // The battery takes the whole remainder, so its edge lands exactly
            // on this line, and the cell draws its own INSET_BORDER_WIDTH (3.5)
            // stroke inside its bounds. A 4px pad therefore left about half a
            // pixel between the battery's ink and that stroke — the padding was
            // being applied and there was nothing to see.
            //
            // A share scales with the cell instead, so the gap reads the same on
            // every device, and PAD_MIN keeps it clear of the border on the
            // smallest one.
            PAD_FRAC:   0.07,   // of the cell's side, each end
            PAD_MIN:    6,      // ...but never less than this, px @ design scale
            GAP:        1,      // between the label and the battery
            TEXT_SHARE: 0.24,   // the label's share of the padded height
            LINE:       1.28,   // font size vs the line box it has to fit — type
                                // is measured with its ascenders and descenders,
                                // so asking for a 20px line means asking for
                                // about 16px of type
            TEXT_SCALE: 0.9,    // ...and then this much of that. LINE is the
                                // arithmetic — what fits — and this is taste:
                                // the label filling its slot exactly reads as
                                // shouting next to the battery. Kept apart so
                                // neither has to pretend to be the other
        },
        DRAGGABLE_BG_COLOR: "#FFFFFF",
        DRAGGABLE_BG_ALPHA: 0,
        GRID_PANEL_PADDING: 14,        // the panel is a drawn rounded square now,
                                       // so this is real padding around the cells
                                       // rather than the old art's baked margin
        GRID_PANEL_COLOR: "#ccd5d7",
        GRID_PANEL_RADIUS: 15,
        GRID_PANEL_BORDER_COLOR: "#364549",
        GRID_PANEL_BORDER_WIDTH: 3,
    },

    SPAWN_ANIMATION: {
        INITIAL_SCALE_X: 1.15,
        INITIAL_SCALE_Y: 0.85,
        STRETCH_SCALE_X: 0.9,
        STRETCH_SCALE_Y: 1.1,
        STRETCH_DURATION: 150,
        BOUNCE_SCALE_X: 1.05,
        BOUNCE_SCALE_Y: 0.975,
        BOUNCE_DURATION: 100,
        SETTLE_DURATION: 80,
    },

    POINTER: {
        TUTORIAL_ENABLED: false,       // set true just before shipping — the start mask +
                                       // spawn-button pointer are off during development
        SCALE: 1,
        FILL_COLOR: "#ffd251",
        STROKE_COLOR: "#6d5727",
        STROKE_WIDTH: 3,
        OFFSET_Y: 20,
        ANIMATION_MOVE_UP: 12,
        ANIMATION_SCALE_DOWN: 0.9,
        ANIMATION_DURATION: 200,
        ANIMATION_YOYO: true,
        ANIMATION_REPEAT: -1,
        TUTORIAL_START_DELAY: 500,
        TUTORIAL_FADE_DURATION: 500,
        TUTORIAL_MASK_COLOR: "#000000",
        TUTORIAL_MASK_OPACITY: 0.75,
    },

    MERGE_TUTORIAL: {
        ENABLED: false,                // set true just before shipping — the swap-to-merge
                                       // hand animation is disabled during development
        POINTER_OFFSET_Y: 50,
        ANIMATION_DURATION: 1000,
        ANIMATION_REPEAT: -1,
        ANIMATION_EASE: 'Sine.easeInOut',
    },

    COIN_REWARD_ANIMATION: {
        COIN_COUNT: 6,
        REWARD_COIN_SIZE: 40,          // Match coin icon size for better visibility
        TOP_SPEED_DURATION: 600,
        SPEED_VARIATION: 0.15,
        STAGGER_DELAY: 50,
        INITIAL_STACK_OFFSET: 0,
        DELAY_BEFORE_FLY: 100,        // ms to wait after gadget disappears before coins fly
        EASE: 'Power2',
    },

        // Platform stripes (top half) with battery slot on left, gadget on right
    // ── Battery slots ─────────────────────────────────────────────────────────
    // Three slots in one battery-shaped case. In LANDSCAPE they sit in the UI
    // half above the grid; in portrait they stay at the foot of the farm half.
    // The slot SIZE is derived, not set: the three take the row's full width
    // less the gaps, capped at ONE GRID CELL — a battery in a slot should look
    // like a battery in a cell. (See createSlots / calculateLayout.)
    PLATFORM: {
        SLOT_SIZE: 130,                // reference slot square (px) — the ratio
                                       // every slot-derived size is measured in
        SLOT_RADIUS: 15,               // corner radius (px)
        CHARGE_RATE_GAP: 10,           // gap (px) between charge-rate label bottom and slot top
        CHARGE_RATE_BOLT_SIZE: 18,     // bolt icon display size (px)

        BATTERY_CASE: {
            ENABLED: true,
            PAD:      8,               // case wall → cell (px @ design)
            STROKE:   4,               // case outline thickness
            RADIUS:   14,              // case corner radius
            DIVIDER_W: 3,
            DIVIDER_INSET: 0.14,       // how far short of each wall a divider
                                       // stops, as a fraction of case height.
                                       // Long enough to divide, never touching —
                                       // a divider that meets the wall reads as
                                       // three boxes instead of one battery
            NODE_W:   14,              // the terminal sticking out on the right
            NODE_H:   0.38,            // as a fraction of the case height
            NODE_GAP: 4,               // gap between the case and its terminal, so
                                       // the node reads as a separate piece
            NODE_RADIUS: 5,
            COLOR:      "#364549",     // outline, dividers and terminal
            FILL_COLOR: "#c2d1e0",     // inside the case
            FILL_ALPHA: 0,             // 0 = the case is an outline only. A wash
                                       // across all three divisions reads as one
                                       // slab; leaving it clear lets an OCCUPIED
                                       // division be the only thing with a
                                       // background, which is the signal
        },

        // The three slots' rates added up, shown beside the battery case. The
        // per-slot numbers say what each cell contributes; this says what the
        // machine is actually being fed, which is the number that decides how
        // fast the ground gives way.
        TOTAL_CHARGE: {
            ENABLED: true,
            GAP:     6,         // out from the case's terminal (px @ design).
                                // Measured from the CAP, not the case, so the
                                // node's own length already sits between the two
                                // — 14 left the figure adrift above the battery
                                // rather than reading as belonging to it
            SIZE:    30,        // font size @ design scale
            COLOR:      '#ffffff',
            STROKE:     '#3a2a00',
            STROKE_W:   4,
            BOLT:     true,     // the charge icon, beside the sum
            // ITS OWN COLOUR, not a fixed tint. The icon is the UNIT on the
            // figure — the "kg" after a weight — so it takes the figure's
            // colour and reads as part of the same number.
            //
            // It was hardcoded yellow, from when the art was a white 64px bolt
            // that needed colouring. Yellow is also the COIN counter's colour
            // (#f7ca42) and nothing else's, so a yellow bolt beside a white
            // charge figure read as the wrong currency.
            //
            // Tint MULTIPLIES: white leaves the art exactly as drawn, which is
            // what you want once the art is the colour it should be.
            BOLT_TINT: 0xffffff,
            BOLT_SIZE: 26,      // its HEIGHT, px @ design scale. The width comes
                                // from the art's own aspect, so a redrawn bolt of
                                // any proportion drops in without a number
                                // changing — and never gets squashed into a
                                // square it was not drawn as
            BOLT_GAP:  4,       // between the figure and the icon
            PULSE:   1.18,      // grows this much on each battery tick, in step
                                // with the individual battery icons — the whole
                                // supply chain flashing on the same beat
        },
        // The rate on each slot. Was black type on a white outline — the one
        // place in the game that ran that way round — which put it at odds with
        // the sum beside it and with every other readout. White on dark, like
        // the rest.
        SLOT_RATE: {
            COLOR:    '#ffffff',
            STROKE:   '#3a2a00',
            STROKE_W: 3,
            // NO BOLT ON EACH SLOT. Three of them beside three numbers said the
            // same word three times, and the icon is not what distinguishes one
            // battery's rate from another's — the number is. It belongs on the
            // SUM instead, where it names the figure that matters and appears
            // once.
            BOLT: false,
            BOLT_TINT: 0xffffff,   // as above — multiplies, so white is 'as drawn'
        },
        SLOT_LABEL_W: 46,              // width reserved for a charge-rate label
                                       // (px @ design). PORTRAIT ONLY: the
                                       // battery stands on end there, so the
                                       // labels cannot sit above their cells —
                                       // above is the next cell — and go beside
                                       // them instead, between the battery and
                                       // the grid panel. Raising this makes the
                                       // portrait slots smaller, not the margin
                                       // wider: the margin is fixed by the panel
        // WHICH MARGIN THE BATTERY STANDS IN, portrait only. The panel is
        // square-ish and the half is full width, so there is dead space on both
        // sides; this picks one. The charge-rate labels follow it — they always
        // sit between the battery and the panel, never out at the screen edge
        // where there is no room for them.
        PORTRAIT_SIDE: 'right',        // 'right' | 'left'
        // The gap between the panel and the battery, as a fraction of a CELL —
        // so it reads as a proper break at any size, the way the gaps inside the
        // grid do. A design-px figure would shrink against the cell on the very
        // phones where the margin is tightest.
        //
        // It comes straight out of the slot: the margin holds this gap, the
        // battery and the labels, and only the battery can give.
        PORTRAIT_PANEL_GAP: 0.25,      // of a cell
        SLOT_ROW_EDGE_PAD: 12,         // least margin each side of the battery,
                                       // which is centred on the half (px @ design)

        // A ghost of the trencher laid inside the battery case — the batteries
        // and the machine they drive read as one object. Same two sprites and
        // same spacing as the field rig (ROAD.TUNNEL.TRENCHER), turned a quarter
        // turn right and scaled so the whole rig spans the case's width.
        TRENCHER_DECO: {
            ENABLED:  true,
            ALPHA:    0.4,
            ANGLE:    -90,             // quarter-turn LEFT: the rig's nose (north
                                       // in the field) points away from the
                                       // terminal, so the belt sits at the
                                       // terminal end. Both the sprites and which
                                       // part is where follow this one number
            LEN_FRAC: 0.64,            // rig length as a fraction of the case width
            DEPTH:    2.7,             // under the case outline (2.8) and the
                                       // occupied divisions (3)
        },

        // Battery icons pulse once per charge tick — the same tick that arms the
        // machine's work burst, which is what makes the two read as one system.
        BATTERY_PULSE_SCALE: 0.6,      // scale the icon springs to
        BATTERY_PULSE_DURATION: 80,    // ms, one way
    },

    // ===================================================================
    // CAR + INCLINE (right-half pivot: batteries charge a car that climbs)
    // ===================================================================

    // ===================================================================
    // ROAD (right-half pivot: congested traffic above the battery slots)
    // ===================================================================
    // Vertical roads running from just above the 3 battery slots up off the top
    // of the screen, laid out side by side. Cars follow the one ahead in their
    // lane so they bunch up like real traffic instead of overlapping, and are
    // recycled through a shared pool once they leave the road.
    //
    // Framed from 4.5× the height of the first pass: every on-screen size and speed
    // below is scaled down to match, so the road reads as thinner and the cars
    // smaller/slower without the traffic behaviour changing. Note this is a
    // hand-scaled framing, not a camera — these numbers are the only "zoom" there
    // is. The road's LENGTH is not part of it: top and bottom are pinned to partB
    // and the battery slots, so zooming out shrinks the scenery and reveals more
    // straight road rather than shortening it. STRIPE_WIDTH is deliberately held
    // back from scaling (see below).
    // ── The land in partB, and the canal being dug up the middle of it ────
    // Batteries power one boring machine. It parks at the head of the canal
    // already built at the foot of the band and digs upward through the green
    // land; water follows it up the cut. When it reaches the top of the band
    // the next band is generated above and the camera rides up to it.
    ROAD: {
        ENABLED: true,             // master switch — when true, partB shows the land

        BOTTOM_MARGIN: 0,          // gap left below the land band (px @ platformScale).
                                   // The band is the whole farm half in landscape;
                                   // in portrait the slots at the foot of the half
                                   // are subtracted first, and this is on top of that
        LAND_COLOR:   0x8ed04f,    // the green ground the channel is cut through

        // ── Tile map (authored in Tiled) ───────────────────────────────────
        // The landscape band is drawn from a Tiled level: one SPRITESHEET of
        // 128px frames, placed on a grid. The .tmj stores the grid of gids
        // (tile numbers); TILES below gives each gid its meaning, since a bare
        // spritesheet carries no per-tile data.
        TILEMAP: {
            ENABLED: true,

            // ── THE LEVEL ROTATION — edit this list ───────────────────────
            // One entry per level, in PLAY ORDER; the run loops at the end.
            // FILE is the Tiled map. Anything else on the entry is that level's
            // own data — see PONDS below.
            //
            // Maps may have different row counts. A band is always the full
            // height of the farm half; a map with fewer rows is anchored to the
            // BOTTOM of its band and the strip left above it is filled with
            // plain ground, so short levels read as a field with open land
            // beyond it rather than leaving a hole between levels.
            // ── THE RUNNING ORDER ────────────────────────────────────────
            // Lives in levels.js, where each level binds its MAP to its CROP in
            // one object. They used to be two lists matched by index that
            // wrapped at different lengths, so the pairing drifted every time
            // round and no one could say what a level was without counting
            // entries in two places.
            LEVELS: LEVEL_DATA.LEVELS,
            FILE:   (LEVEL_DATA.LEVELS[0] || {}).FILE,   // fallback map

            // ── Markers ──────────────────────────────────────────────────
            // A map that references MARKER_TILESET is painting MARKERS: tiles
            // that mean something to the code and are never drawn. What they
            // mean comes from their POSITION in that sheet (0 = first tile,
            // reading left to right, top to bottom), NOT from their gid — gids
            // shift whenever any earlier tileset changes size, positions never
            // do. The sheet is found by name in the map, so its firstgid is
            // whatever Tiled made it.
            //
            // APPEND ONLY: add new markers at the end of markers.tsx. Inserting
            // or reordering re-numbers everything after it.
            // ── The canal's mouth ────────────────────────────────────────
            // The FIRST level's bottom row meets the lake, and a straight canal
            // piece stops there like a cut pipe. These swap it for the flared
            // pair — the left turning west to north, the right east to north —
            // so the channel reads as drawing out of the water.
            //
            // Done by SUBSTITUTING TILE IDS as the map is read, rather than
            // authoring it into the map: every level shares the pool of maps and
            // the rotation wraps, so the same file is level 1 and later level 8.
            // Painting the flare in would put a lake mouth in the middle of the
            // run. Swapping on load keeps it to the one level that touches water.
            //
            // Keys are TILES ids, the same numbers as the table above.
            MOUTH_TILES: {
                ENABLED: true,
                ROWS: 1,                       // rows up from the bottom
                SWAP: { 33: 101, 51: 103 },    // straight -> flared, left and right
            },

            MARKER_TILESET: 'markers.tsx',
            MARKERS: [
                'crop',        // 0
                'pond_a',      // 1
                'pond_b',      // 2
            ],

            // ── Props ───────────────────────────────────────────────────────
            // Scenery that is PLACED rather than painted: one cow, one well, one
            // farmhouse. These live on a Tiled OBJECT layer, not a tile layer —
            // you drop a point and type its name, and that name is the whole
            // identity. Nothing here needs a marker tile, so the marker sheet
            // stops growing every time a new kind of thing exists.
            //
            // ADDING A PROP IS A LINE IN THIS TABLE. Drop the art in, add an
            // entry, place a point named the same. There is no code to write:
            // one builder walks the layer and looks every name up here, so a
            // well or a haystack takes the same path a cow does.
            //
            // Two rules decide where the art lands:
            //
            //   ORIGIN — which point of the sprite sits on the marked spot. For
            //   the cows this is THE EDGE THE ANIMAL FACES, so the body always
            //   trails behind the point: a south cow stands above its marker, a
            //   north cow below it. West is east mirrored, which keeps the anchor
            //   on the same edge of the ANIMAL rather than jumping to its other
            //   side. The vertical half is the feet wherever there is a choice.
            //
            //   FACE — the direction it looks, as a grid step. The points are
            //   placed ON THE BOUNDARY between the prop and the tile it faces,
            //   so stepping half a tile that way lands squarely in that tile —
            //   one formula for all four facings, and no special cases.
            //
            //   SIZE — height in tiles, the same convention the farmer uses. It
            //   is in TILES and not pixels because a tile is 33-105 device px
            //   depending on the screen, and a prop measured in pixels would be
            //   a different size on every phone. Sprites drawn at one scale must
            //   keep their pixel heights in proportion here or they stop looking
            //   like the same herd: the cows are 190px and 127px tall, so 2.1 and
            //   1.4 tiles. Change one, scale the rest by the same ratio.
            PROPS: {
                ENABLED: true,
                LAYER: 'props',              // the Tiled object layer they sit on
                // GROUND NOTHING MAY USE. A rectangle drawn on the props layer
                // and given this name takes every tile it covers out of play:
                // no animal spawns there, none wanders in, and the farmer will
                // not walk through it on his way anywhere.
                //
                // Not tied to a species or a level — a map that wants a corner
                // kept clear draws the box and the level obeys it, whatever it
                // is farming. Draw as many as the map needs.
                FORBIDDEN: 'forbidden',
                // Cattle wait for their field. A cow stands at the edge of the
                // tile it is looking at and only appears once THAT tile is fully
                // grown, so the herd arrives as the reward for finishing a
                // stretch of farm rather than sitting on bare soil from the
                // start. A prop facing a tile with nothing planted in it — or
                // any prop with no FACE at all — simply shows at once, so this
                // can never silently swallow a well or a farmhouse.
                REVEAL_STAGE: 5,             // 0 = always visible
                FADE_MS: 450,
                RISE_TILES: 0.15,            // small settle as it fades in

                // How far the cut must pass a main-canal bridge before its deck
                // drops in, under TUNNEL.LEVEL_MODE 'FOLLOW'. The item's own
                // AFTER_DIG_TILES is the 'DAM' figure — see the bridges below
                // for why the two modes cannot share one number.
                FOLLOW_CLEAR_TILES: 0.5,

                // ── Grazing ─────────────────────────────────────────────
                // A prop with an EAT image alternates between the two. Two
                // drawings are plenty; what sells it is the TIMING, so the two
                // holds are wildly uneven and both are re-rolled every cycle. A
                // steady flip between two frames reads as a mechanism, and a
                // herd flipping together reads as one animation played nine
                // times — so each animal also starts at its own point in the
                // cycle. Same reasoning as the crops' growMul.
                GRAZE: {
                    ENABLED: true,
                    DOWN_MS: [4200, 9500],   // head down, cropping grass
                    UP_MS:   [900,  2300],   // head up, looking around — rarer
                },
                // A BRIDGE IS GROUND, not an object standing on it — so it is
                // given a flat DEPTH and never sorts by position. Whoever walks
                // over it passes above it, always, the same way they pass over
                // the soil and the ditch.
                //
                // Which flat depth depends on the water it crosses, and the two
                // canals are drawn in different bands: BRANCH water sits at 1.55
                // down in the terrain band, while the MAIN canal's is at 3.10,
                // above everything that sorts by position. So a branch bridge
                // can sit just over its stream at 1.60 and still be under every
                // actor, while a main bridge has to clear 3.10 and ends up above
                // them. That costs nothing in practice: the main canal's columns
                // are the machine's corridor and the farmer is barred from them,
                // so nobody ever stands on a main bridge to be hidden by it.
                ITEMS: {
                    // ── Bridges ─────────────────────────────────────────
                    // SIZE is height in tiles and SIZE_W is width in tiles, and
                    // a bridge uses whichever one runs ALONG its span: _ns lies
                    // north-south across a horizontal canal so its length is its
                    // height, _ew lies east-west so its length is its width. The
                    // other dimension follows from the art.
                    //
                    // Two tiles for a main-canal crossing (the main canal is two
                    // columns wide) and one for a branch, which is what the 256px
                    // art gives at full size and half size respectively.
                    //
                    // Pivoted at the CENTRE, unlike everything else here: a
                    // bridge is placed by where it crosses, not by where it
                    // stands, so the marker is the middle of the span.
                    //
                    // WALKABLE lifts the farmer's ban on the canal cell the
                    // marker sits in — that is the whole point of a bridge.
                    //
                    // HOW MUCH CLEARANCE A BRIDGE WAITS FOR IS THE MODE'S, NOT
                    // THE BRIDGE'S. The clearance exists so a deck is not
                    // dropped on top of the machine, and how much is needed
                    // depends entirely on where the machine will be:
                    //
                    //   DAM     — the rig drives 3.5 tiles PAST the level and
                    //             keeps going, so a deck laid the moment the
                    //             blade drew level would land under the belt.
                    //             AFTER_DIG_TILES (4) is that clearance.
                    //
                    //   FOLLOW  — the rig stops on the boundary and the water
                    //             is already at its heel. There is no overrun to
                    //             wait out, and on a six-row map a four-tile
                    //             wait is longer than the whole dig — the bridge
                    //             simply never appeared. PROPS.FOLLOW_CLEAR_TILES
                    //             (0.5) lets it drop in as the cut passes.
                    //
                    // AFTER_DIG_TILES holds a bridge back until the cut has run
                    // that far past it. A main-canal bridge cannot stand before
                    // the canal it crosses has been dug, and the clearance is
                    // the rig's own length behind its blade — the same number
                    // and the same reason as the dams'. It then drops in from
                    // above exactly as the wall does. Branch bridges have no
                    // such entry: their canals are drawn with the level.
                    // ── Buildings ───────────────────────────────────────
                    // A barn: the one thing that says "ranch" rather than
                    // "field" at a glance, and the only prop on a level tall
                    // enough to break its horizon.
                    //
                    // SIZE is its HEIGHT in tiles and the width follows the
                    // art's own aspect (323x381), so it can be redrawn at any
                    // proportion without a number changing here.
                    //
                    // ORIGIN [0.5, 1] anchors it by its BOTTOM CENTRE — the
                    // marker is the point the building stands on, which is what
                    // a point on a map means for anything with a footprint. It
                    // also makes the depth right for free: with the origin at
                    // the foot, the y it sorts on IS the ground it occupies, so
                    // a cow in front of the barn draws over it and one behind
                    // does not.
                    barn:             { FILE: 'graphics/animals/cow/barn.webp', SIZE: 3.4, ORIGIN: [0.5, 1] },
                    // The chicken block's building. Well under the barn on
                    // purpose: the size difference is most of what says one
                    // holds cattle and the other holds birds.
                    coop:             { FILE: 'graphics/animals/chicken/coop.png', SIZE: 1.4, ORIGIN: [0.5, 1] },
                    // Where the fleece comes off. SIZE is the HEIGHT, and this
                    // art is WIDER than it is tall (290x258) where the barn is
                    // taller than wide — so matching the barn's number would
                    // measure the shed's short side against the barn's long one
                    // and draw a building two tiles high. At 2.8 it comes out
                    // about as wide as the barn and lower, which is what a
                    // shearing shed is beside a cattle barn: long, not tall.
                    shearing_shed:    { FILE: 'graphics/animals/sheep/shearing_shed.webp', SIZE: 5, ORIGIN: [0.5, 1] },
                    // The smallest building in the set. The art is wider than
                    // tall and SIZE is the HEIGHT, so this reads lower than the
                    // number suggests: 1.6 stands it a little above the hen
                    // coop and half again as wide, which is what a hutch is.
                    hutch:            { FILE: 'graphics/animals/bunny/hutch.webp', SIZE: 4, ORIGIN: [0.5, 1] },

                    bridge_main_ns:   { FILE: 'graphics/bridge/bridge_main_ns.webp', SIZE:   2, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 3.15, AFTER_DIG_TILES: 4 },
                    bridge_main_ew:   { FILE: 'graphics/bridge/bridge_main_ew.webp', SIZE_W: 2, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 3.15, AFTER_DIG_TILES: 4 },
                    // A ONE-TILE BRIDGE HAS ITS OWN ART at half the size, and
                    // has to. Drawn from the two-tile file it would be squeezed
                    // 2.4x, and the GPU minifies by reading four texels per
                    // screen pixel however many actually fall there — at 2.4x
                    // that is four out of six, and WHICH four moves with the
                    // sprite, so the planks crawled whenever the camera did. At
                    // 1.2x the four samples cover the footprint and it sits
                    // still. The same rule holds for any art added later:
                    // anything drawn below about 1.5x its source will crawl.
                    bridge_branch_ns: { FILE: 'graphics/bridge/bridge_branch_ns.webp', SIZE:   1, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 1.60 },
                    bridge_branch_ew: { FILE: 'graphics/bridge/bridge_branch_ew.webp', SIZE_W: 1, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 1.60 },
                    bridge_minor_ns:  { FILE: 'graphics/bridge/bridge_branch_ns.webp', SIZE:   1, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 1.60 },
                    bridge_minor_ew:  { FILE: 'graphics/bridge/bridge_branch_ew.webp', SIZE_W: 1, ORIGIN: [0.5, 0.5], WALKABLE: true, DEPTH: 1.60 },

                    // HAND-PLACED ANIMALS BORROW THE SPECIES' ART rather than
                    // naming files of their own, so a cow is described once and
                    // changing its sheets does not leave these behind. What
                    // stays here is what only a placed marker has: the anchor,
                    // which puts the animal's FRONT on the marked point, and the
                    // tile it faces for the reveal.
                    cow_n: { SPECIES: 'cow', FACING: 'n', ORIGIN: [0.5, 0], FACE: [ 0, -1] },
                    cow_s: { SPECIES: 'cow', FACING: 's', ORIGIN: [0.5, 1], FACE: [ 0,  1] },
                    cow_e: { SPECIES: 'cow', FACING: 'e', ORIGIN: [1,   1], FACE: [ 1,  0] },
                    cow_w: { SPECIES: 'cow', FACING: 'w', ORIGIN: [0,   1], FACE: [-1,  0] },
                },
            },
            POND_LAYER: 'pond',            // the ponds' layer. Read BOTH ways: as an
                                           // OBJECT layer of rectangles (the way
                                           // props and ranches are authored), and
                                           // as a tile layer of painted markers
                                           // (how ponds were done first). A map
                                           // may use either; objects are the way
                                           // to author a new one
            // WHICH ART A POND USES. An object's NAME picks it — a rectangle
            // called `pond2` draws pond2 — and a plain `pond` takes the first
            // entry here. The names are the DRY art; the water and flow versions
            // are derived from it by suffix, so one name gives all three.
            //
            // Everything listed is loaded, because an object layer names its art
            // inside the MAP and the loader would otherwise have to parse every
            // level to find out what to fetch. Six 256px files is 1.2MB of
            // texture, which is not worth a scan.
            POND_ART: ['pond1', 'pond2'],

            // ── MUD ─────────────────────────────────────────────────────────
            // Drawn wherever a rectangle named `mud` sits on the map's `mud`
            // object layer. Rectangles that touch or overlap merge into one
            // wallow, so any shape can be built from boxes.
            //
            // mud.webp is SIX pieces in one row, the same six and the same order
            // the tilled soil uses, each drawn with a ragged bank on the sides
            // that meet ground:
            //   0 none (inner)  1 n  2 n+e  3 n+s  4 n+e+s  5 all four (lone)
            // Each cell looks at its four neighbours, picks the piece, and turns
            // it to face the right way, so six drawings cover all sixteen cases.
            //
            // Its own sheet rather than a row on terrain.webp, because it is not
            // wanted on every level — and a level that has none never loads it
            // once loading goes per-level.
            MUD: {
                ENABLED: true,
                LAYER:   'mud',
                KEY:     'mud_sheet',
                DEPTH:   1.45,     // on the ground and the soil overlays (1.40-1.44),
                                   // under the dry branch canals (1.5)
            },
            POND_DIR:   'graphics/pond/',  // where the pond art lives

            // ── Filling a pond ───────────────────────────────────────────
            // A level names the DRY art (PONDS above); the filled version is the
            // same file with WATER_SUFFIX in place of DRY_SUFFIX, so one name
            // covers both. The water appears when the trench draws level with
            // the pond's middle row, starts at START of full size and grows one
            // step per STEP_MS until it fills the bed.
            POND_FILL: {
                DRY_SUFFIX:   '_dry',
                WATER_SUFFIX: '_water',
                START:    0.1,     // size it appears at, as a fraction of full
                FILL_MS:  10000,   // centre to banks, one continuous spread
                // The water arrives at a steady rate, so the AREA grows evenly
                // and the shoreline is its square root — fast at first, slowing
                // as each further ring of bank takes longer to reach. That is
                // what makes it read as water rather than a growing picture, and
                // why there is no bounce here: an overshoot would be the pond
                // spilling past its banks and sucking back.
                // The inflow's shape. Thin water spreads across the bed easily,
                // so the area grows at a steady rate up to AREA_KNEE; past that
                // the banks are met and further water adds DEPTH rather than
                // ground, so the last of the area arrives slowly.
                AREA_KNEE:  0.8,      // area covered before it starts to slow
                TAIL_POWER: 2,        // how hard the tail slows (2 = quadratic).
                                      // The knee's moment in time is derived from
                                      // these two so the pace changes smoothly —
                                      // there is no third number to keep in sync

                // Shallow to deep. SHALLOW_COLOR is the colour the water ART is
                // painted at — a tint can only darken, so the art has to start
                // as the lightest state it will ever have. The code multiplies it
                // down toward DEEP_COLOR as the pond fills; red falls fastest,
                // which is what depth does to light.
                SHALLOW_COLOR: '#85C0B2',   // what pondN_water.png was exported at
                DEEP_COLOR:    '#2B8C9E',   // where it lands, full
                TINT_RATE:     3,     // how sharply it gets there. Absorption is
                                      // exponential, so the shift is quick early
                                      // and asymptotic late — higher = deep sooner

                // Thin water is see-through: the bed shows through the first
                // shallow spread and is buried as the pond deepens. Ease-out, so
                // most of the opacity arrives early and the last of it creeps —
                // the pond has settled visually before it stops spreading.
                ALPHA_FROM:  0.05,    // opacity when the water first appears
                ALPHA_POWER: 3,       // 1 = linear, 3 = ease-out cubic, higher =
                                      // opaque sooner
                DEPTH:    1.46,    // on the dry bed (1.45), under the canal

                // ── The flow over it ─────────────────────────────────────
                // <pond>_flow.png, run outward from the centre on a loop while
                // the pond is filling: water still arriving. Greyscale art, so
                // it takes the water's colour. It stops when the pond is full —
                // a still pond should be still.
                FLOW: {
                    ENABLED:  true,
                    SUFFIX:   '_flow',
                    RINGS:    2,       // copies, evenly spread around the cycle,
                                       // so one leaves the centre as another
                                       // reaches the bank
                    CYCLE_MS: 3200,    // centre to bank, one ring
                    START:    0.05,    // size it leaves the centre at
                    ALPHA:    0.5,     // at mid-journey; it swells from nothing
                                       // and is spent by the time it arrives
                                       // Once the pond is full, rings already on
                                       // their way finish the journey and are not
                                       // sent out again — their own alpha curve
                                       // takes them to nothing at the bank, so
                                       // nothing is ever cut off mid-water.
                    DEPTH_OFFSET: 0.005,   // just over the water
                },
            },
            SHEET:   'graphics/tilesheets/canals.webp',

            // ── Which Tiled tileset is which texture ──────────────────────
            // A map records its tilesets by FILE NAME and firstgid; the .tsx
            // itself is never loaded, so this table is how the game learns what
            // art a tileset stands for. Keyed by the .tsx's file name.
            //
            //   IMAGE — load this sheet under KEY. Omit it to reuse a sheet some
            //           other entry already loaded (two tilesets, same art).
            //   KEY   — the texture to draw that tileset's tiles from.
            //   CANAL — true if its tiles carry canal MEANINGS (see TILES).
            //
            // A tileset with NO entry here is never drawn: markers, decor sheets
            // used only in the editor, and anything left over. That is why a
            // redundant tileset costs nothing — it simply is not listed.
            //
            // Order does not matter, here or in Tiled: a gid is resolved against
            // whichever tileset's range contains it, in that map, by name.
            TILESETS: {
                'canal.tsx':   { IMAGE: 'graphics/tilesheets/canals.webp',
                                 KEY: 'canal_sheet', CANAL: true },
                // Same art as canal.tsx (byte-identical file), so it reuses that
                // texture rather than costing a second 6.8 MB upload. Give it its
                // own IMAGE the day the two sheets actually differ.
                'copy.tsx':    { KEY: 'canal_sheet', CANAL: true },
                'terrain.tsx': { IMAGE: 'graphics/tilesheets/terrain.webp',
                                 KEY: 'terrain' },
                // Paddock fencing, painted INSIDE a level — not the run of poles
                // at a level's boundary, which is its own sprite (FENCE).
                'fence.tsx':   { IMAGE: 'graphics/tilesheets/fence.webp',
                                 KEY: 'fence_sheet' },
                // Mud. No map paints with it — the game lays it from rectangles
                // on the `mud` object layer — but listing it here is what gets
                // it loaded on the 128px grid AND extruded like every other
                // sheet, so its ragged edges never pick up a seam line.
                'mud.tsx':     { IMAGE: 'graphics/tilesheets/mud.webp',
                                 KEY: 'mud_sheet' },
            },
            FRAME:   128,           // frame size in the sheet
            SHEET_PAD: 2,           // EXTRUSION, in px, added around every frame
                                    // of every tile sheet at load. 0 disables.
                                    //
                                    // Why it is needed: slicing tells the GPU
                                    // which texels a frame owns, but sampling
                                    // INTERPOLATES, so at a frame's outer edge it
                                    // reaches into whatever sits next to it in
                                    // the sheet. Where a transparent edge touches
                                    // a solid one — the "ne" variants do exactly
                                    // this — that shows as a line along an edge
                                    // that should be empty.
                                    //
                                    // A transparent gap is NOT the fix: then the
                                    // sampler pulls in transparency and every
                                    // tile gets a faint fading border instead.
                                    // The gutter is filled with a COPY of each
                                    // frame's own edge pixels, so whatever the
                                    // sampler reaches for is what was already
                                    // there and nothing changes.
                                    //
                                    // Frame NUMBERING is unaffected — Phaser is
                                    // told the margin and spacing — so every
                                    // frame index in this file stays correct.
                                    // 2 rather than 1: the tiles are rotated and
                                    // drawn at a non-integer scale, so one pixel
                                    // of headroom is not quite enough.
            // ── A NARROWER FIELD ON PHONES (a trial) ────────────────────
            // The tile is the farm's width over the map's column count, so
            // dropping two columns makes every tile 10% wider and 21% bigger by
            // area — art, crops, the machine and the canal all with it.
            //
            // Rather than re-authoring eleven maps to find out whether that
            // reads better on a phone, the OUTER COLUMNS ARE SIMPLY IGNORED:
            // the map is read as if it were COLS wide, trimming evenly from
            // each side, and everything downstream sees a narrower grid and
            // never knows. Rows are untouched.
            //
            // The canal does not move. It centres on floor(cols/2) and the trim
            // takes one column off each side, so both shift by one together and
            // land on the same tiles they always did.
            //
            // PORTRAIT ONLY, and a trial: if 20 is the answer, the maps should
            // be authored at 20 and this should go, because a map whose edge
            // columns are silently discarded is a trap for whoever paints one.
            MOBILE_TRIM: {
                ENABLED: true,
                COLS:    20,        // what a phone reads the map as
            },
            MAIN_TILES: 2,          // the main canal is this many tiles wide

            // ── What the ground costs ───────────────────────────────────────
            // How much work a level's ground takes to cut through. This is the
            // difficulty curve, and every number in it is DERIVED, not chosen:
            // it is Blumgi Merge's combined monster HP per level, verbatim.
            //
            // A x1.18 "pooling correction" used to be applied here and has been
            // DISCARDED. The reasoning was that their level ends when the
            // slowest of three independent fights ends (a maximum) while ours
            // ends when one machine finishes the total (an average), so pooling
            // is more forgiving. True, but it made our numbers stop matching the
            // sheet, which is not worth 15% of duration. Levels now run at about
            // 0.85x Blumgi's, and COST_SCALE is the knob if that wants changing.
            //
            // Per-tile hardness is this divided by the map's row count. Nothing
            // authors it and nothing stores it.
            // Work per level, and how it divides along one — levels.js.
            LEVEL_COST: LEVEL_DATA.COST,
            COST_SCALE: LEVEL_DATA.COST_SCALE,
            STRETCHES:  LEVEL_DATA.STRETCHES,

            // ══ THE BLOCKS ══════════════════════════════════════════════
            // What the game is now about. The canal is BUILT — fully drawn from
            // the first frame — and what stops the water is a set of walls
            // standing in it. Three per level, broken by three hammers.
            //
            // This replaces the trencher entirely. The old model had a machine
            // CUT the canal and the water follow the blade, so progress was a
            // distance and the batteries bought speed. Now the canal is a given,
            // progress is three strengths falling to zero, and the hammers buy
            // damage. LEVEL_COST above no longer drives anything — block
            // strengths come from BLUMGI_HP instead, which is the same sheet
            // split three ways rather than summed.
            //
            // ── WHY THREE, AND WHY IN PARALLEL ──────────────────────────
            // Blumgi Merge's level is three independent fights that end when the
            // SLOWEST finishes. Three blocks, each with its own hammer and its
            // own strength, reproduces that exactly — which is why the three HP
            // columns are the right source and the summed total is not.
            //
            // The SLOTS are the binding: slot 1 hammers block1, slot 2 block2,
            // slot 3 block3. Left slot to the lowest block, in the order the
            // water meets them. An empty slot means its block is not being hit
            // at all, so leaving one empty stalls that fight and nothing else.
            BLOCKS: {
                ENABLED: true,
                LAYER:   'block',       // the Tiled object layer they live on
                // Markers are named for their number: block1, block2, block3.
                // The digits are read off the end, so the prefix can be
                // anything consistent.
                PREFIX:  'block',

                // ── Strength ────────────────────────────────────────────
                // From BLUMGI_HP (blumgiHP.js): block1 takes HP1, block2 HP2,
                // block3 HP3, for this level's row. The table is 64 rows and
                // the level rotation wraps, so the row wraps with it.
                //
                // STRENGTH_SCALE multiplies all three, the way COST_SCALE used
                // to multiply the total — the one knob for making the whole game
                // faster or slower without touching a ratio anywhere.
                STRENGTH_SCALE: 1,
                // What a level falls back to if BLUMGI_HP has no row for it.
                FALLBACK: [100, 200, 400],

                // ── The art ─────────────────────────────────────────────
                // graphics/block.png — the wall that used to dam the canal in
                // the old water-holding mode, which nothing draws any more. It
                // is already the right thing: a slab lying across the channel,
                // drawn at the seam between the two main columns.
                KEY:      'block',
                WIDTH:    1.62,     // tiles across. 2.0 is the full width of the
                                    // main canal exactly, so this is ~19% under
                                    // it and the slab sits well inside the
                                    // channel with bank showing either side.
                                    // Height follows the art's aspect ratio, so
                                    // it comes down in proportion on its own.
                // ── WHERE THE SLAB SITS, AND WHERE THE WATER STOPS ──
                // ONE POINT DOES BOTH, and that is the whole reason these two
                // numbers are next to each other. The marker in the map is the
                // sprite's PIVOT and it is also the waterline — so the art and
                // the water cannot drift apart, whatever the slab is redrawn to
                // look like.
                //
                // The art is a horizontal slab with a shadow cast below it, so
                // its bottom edge is shadow rather than wall. Pinning the water
                // to the bottom of the sprite left it stopping at the shadow —
                // short of anything solid, with a visible gap between the water
                // and the thing supposedly holding it.
                //
                // 0.25 puts the pivot a quarter of the way down from the TOP,
                // which is in the slab's face. The water comes up to there, so
                // the lower three quarters — shadow and most of the wall — is
                // under water and the face stands proud of it. That reads as
                // water pressing against a wall instead of stopping near one.
                ORIGIN_Y: 0.25,     // pivot, as a fraction down the sprite
                STOP_GAP: 0,        // tiles held back from the pivot. Zero: the
                                    // marker IS the waterline. Raise it only to
                                    // pull the water off the slab deliberately
                // ── UNDER THE WATER, OVER THE DRY TRENCH ────────────
                // The canal's bands are: dug trench 3.03, water 3.10, foam and
                // shimmer just above that, main bridge 3.15.
                //
                // 3.06 puts the slab BETWEEN the trench and the water, which is
                // the only place it can sit and read correctly at both ends. Its
                // lower three quarters are below the waterline, so the water
                // draws OVER them and the slab is genuinely submerged; its face,
                // which stands in a cell the water has not filled, draws over
                // the dry trench behind it.
                //
                // It was 3.11 — one hundredth above the water — and that put the
                // whole slab in front, so the part that should have been under
                // water sat on top of it looking dry and pasted on.
                DEPTH:    3.06,

                // ── Taking damage ───────────────────────────────────────
                // A FLASH, AND NOTHING THAT MOVES. The slab used to sink into
                // the channel and jolt sideways on every hit; that is how a
                // crate answers a blow, and it made a wall wedged across a canal
                // read as light and loose. It is meant to be immovable until it
                // breaks, so it does not budge.
                //
                // The flash is a placeholder for a CRACK OVERLAY advancing with
                // the damage — which also carries how far along you are, which
                // no amount of shaking can.
                HIT_MS:     90,     // how long the flash holds
                HIT_TINT:   0xffd8c0,

                // How broken it looks on the way down, as a tint from whole to
                // nearly-destroyed. Strength is a number in the hundreds of
                // billions; the only honest way to show it is a bar and a tint.
                DAMAGE_TINT: 0x8a6a55,

                // ── Breaking ────────────────────────────────────────────
                BREAK_MS:      420,   // the shatter
                BREAK_RISE:    0.5,   // tiles the pieces fly up
                BREAK_SPIN:    0.6,   // radians they turn through
                SHARDS:        7,     // pieces the slab comes apart into

                // THE WATER WAITS FOR ALL OF THAT. Held for BREAK_MS plus this,
                // so the shatter plays out completely before the canal moves.
                // Without the hold the water climbed on the frame the last blow
                // landed and ran up through the shards while they were still in
                // the air — break and release became one muddled event instead
                // of cause and effect.
                //
                // Raise it to put a beat between the wall going and the water
                // coming; 0 releases the moment the last shard fades.
                RELEASE_DELAY_MS: 0,

                // ── The strength readout ────────────────────────────────
                // Over each block: a bar and the number still to go. This is the
                // player's only view of progress, so it is not optional.
                // The bar is OFF and the figure stays — see _buildBlockBar.
                // A strength of 27,900,000,000 moves a bar by nothing per hit;
                // the number moves every time.
                BAR: {
                    ENABLED:  false,   // the green fill
                    TEXT:     true,    // the figure still to go
                    W:        1.8,     // tiles
                    H:        0.17,
                    Y:        -0.62,   // tiles above the block's centre
                    BG:       0x2b1c12,
                    FILL:     0x6fd44f,
                    LOW:      0xd4543f,  // once it is nearly through
                    LOW_AT:   0.25,
                    RADIUS:   0.05,
                    TEXT_SIZE: 17,
                    TEXT_COLOR:  '#ffffff',
                    TEXT_STROKE: '#1d2b16',
                    TEXT_STROKE_W: 4,
                    // OVER THE ACTORS — see HAMMER.DEPTH below for why 6.
                    // A strength readout hidden behind a mango tree is no
                    // readout, and it is the only view of progress there is.
                    DEPTH:    6.2,
                },
            },

            // ══ HAMMERING ═══════════════════════════════════════════════
            // The hammer in a slot does not travel to its block — it appears
            // BESIDE it and swings, the way a Minecraft block is mined: the tool
            // hangs at the edge of the target, rocks back, and comes down.
            //
            // One strike per RATE_MS, each taking the hammer's full strike power
            // off the block. Damage is dealt at the moment of IMPACT, not at the
            // start of the swing, so the number and the picture agree.
            HAMMER: {
                ENABLED:  true,
                RATE_MS:  1000,    // THE BEAT: one cycle a second, and one
                                   // hammer's full strike power per cycle. This
                                   // is the battery tick's beat, kept because
                                   // the whole economy was tuned as
                                   // damage-per-second — changing it changes the
                                   // difficulty of every level at once

                // ── BLOWS PER BEAT ─────────────────────────────────────
                // The beat carries SEVERAL swings and only one of them scores.
                // Damage per second is unchanged: STRIKES does not multiply what
                // a hammer does, it only divides the beat into more of them.
                //
                // A single 90ms swing in a 1000ms beat left the hammer still for
                // 91% of the time, reading as frozen-and-twitching rather than
                // working. Minecraft decouples the swing from the damage tick —
                // the pickaxe swings steadily while the crack advances on its
                // own clock — and this is that in the small.
                STRIKES:    2,     // blows in one beat
                DAMAGE_ON:  2,     // which one takes the strength off. Last, so
                                   // the cycle builds to it
                GAP_MS:     240,   // between blows. Must stay comfortably above
                                   // STRIKE_MS or a blow lands while the last is
                                   // still swinging and is dropped
                SIZE:     2.0,     // the hammer's drawn box, in tiles, square —
                                   // the sheet's frames are 128x128, so a square
                                   // box keeps the art's own proportions.
                                   //
                                   // The VISIBLE hammer is smaller than this in
                                   // both directions, because the art is drawn
                                   // on the diagonal: the box holds a head-to-
                                   // handle length of about 2 tiles laid corner
                                   // to corner, so it stands nearer 1.4 tiles
                                   // wide and tall on screen. Against a 1.9-tile
                                   // farmer and a 1.62-tile block, that reads as
                                   // a two-handed tool rather than a mallet
                SIDE_X:   1.35,    // tiles from the canal seam it stands at.
                                   // It alternates sides per block so three
                                   // hammers up one canal do not form a column
                Y:        -0.15,   // tiles above the block's centre

                // ── The swing: THE BLOW ONLY ────────────────────────
                // The hammer RESTS WOUND BACK and the only thing animated is
                // the strike coming down. On impact it returns to the start
                // position in the same frame, untweened, and waits there for the
                // next beat. The raise is never shown.
                //
                // At one strike a second a visible wind-up would fill most of
                // the gap between blows, so the tool would spend longer drawing
                // back than striking — which reads as hesitating rather than
                // working. Without it the impact lands on the beat and the pause
                // sits after the blow, where a pause belongs.
                // ── WHERE IT SITS, AND HOW FAR IT SWINGS ───────────────
                // The art is drawn on the diagonal — head north-east, handle
                // south-west — and REST_DEG 0 means it HANGS EXACTLY AS DRAWN,
                // head up toward the block, with the swing arcing down from
                // there. Anything else parks the hammer at a pose nobody drew.
                //
                // It used to rest at -100, wound back past the drawing's own
                // angle so that the resting hammer looked wrong and only the
                // moment of impact looked right. Resting at the art's alignment
                // inverts that: the pose you see for most of the second is the
                // one the artist actually made.
                //
                // THE ARC IS THE DIFFERENCE BETWEEN THESE TWO, so with the rest
                // at 0 the whole 65 degrees is carry-through past the drawing —
                // the head comes down onto the block and follows through, rather
                // than stopping on contact, which reads as the tool being placed
                // against the block rather than swung at it.
                REST_DEG:      0,   // WHERE IT RESTS between blows: the art's
                                    // own alignment, the pose as drawn
                WIND_DEG:    -85,   // ...and how far back of that the swing
                                    // STARTS. Applied as a TELEPORT on the frame
                                    // the strike begins — the hammer is never
                                    // seen travelling to it — so the arc gets 25
                                    // extra degrees for no time and no visible
                                    // wind-up. Tweening into it would put the
                                    // raise back, which is what made the swing
                                    // read as hesitating
                STRIKE_DEG:   65,   // ...and where it is at impact.
                                    // THE ARC IS -85 TO 65, so 150 degrees.
                                    //
                                    // The extra swing was taken off the WIND end
                                    // and not this one on purpose: this is where
                                    // the head meets the block, so moving it
                                    // moves the point of contact. The wind end
                                    // is a teleport nobody sees, so it can be
                                    // pushed as far back as the arc wants for
                                    // free
                STRIKE_MS:   110,   // the whole of the visible swing. Must stay
                                    // well under GAP_MS

                // ── WHAT IT HITS FOR ───────────────────────────────────
                // The hammer's strike power, written at its PIVOT — the one
                // point on a swinging tool that stays put. It is a separate
                // object rather than a child of the sprite, so it never turns
                // or travels with the blow; anywhere else on the hammer a figure
                // would be sweeping 150 degrees twice a second and unreadable.
                //
                // This is the other half of the block's own figure. The block
                // says how much is left, the hammer says how fast it is coming
                // off, and between them a player can see whether a slot is worth
                // upgrading without doing any arithmetic.
                POWER: {
                    ENABLED:  true,
                    SIZE:     18,
                    COLOR:    '#ffffff',
                    STROKE:   '#1d2b16',
                    STROKE_W: 4,
                    X:        0,      // tiles from the pivot
                    Y:        0.12,   // ...and below it, clear of the handle
                },

                // ── THE GRIP ───────────────────────────────────────────
                // Where the hand is on the sprite, as a fraction of the frame —
                // the point the swing rotates about. The handle is south-west,
                // so it is low and to the left. Mirrored automatically for the
                // hammers on the other side; see _buildBlockHammer for why that
                // mirroring is not optional.
                PIVOT_X:    0.18,
                PIVOT_Y:    0.85,

                // ── OVER EVERYTHING ────────────────────────────────────
                // The hammer draws above the crops, the trees, the farmer and
                // the herd — over the whole world, not sorted into it.
                //
                // It is not a thing standing in the field; it is the player's
                // action made visible, and it must be legible wherever the block
                // happens to sit. An orchard is the case that settles it: a
                // mango is two tiles wide and drawn at twice the farmer's
                // height, so a block anywhere near one would be hammered by a
                // tool that spends most of its swing behind leaves.
                //
                // WHY 6. Actors do not have one depth — _yDepth sorts them by
                // world position from a base of 4, a thousandth per tile, and
                // the world climbs, so they drift DOWNWARD from 4 as it goes
                // up. 6 clears that base by 2, which is 2000 tiles of world:
                // far more than a run reaches before the depth origin rebases.
                // Anything that must stay above the hammer goes above 6 too —
                // the strength bar is at 6.2 for exactly that reason.
                DEPTH:        6,

                // ── Impact: two effects, doing different jobs ──────────
                // SPARKS are a flash of light at the contact point, gone in a
                // third of a second. DEBRIS are chips with weight that arc out
                // and fall, and outlive the blow. Together they read as the head
                // striking (the flash) and taking something off (the chips);
                // either alone reads as half of that.
                SPARKS:       6,
                SPARK_MS:     320,
                SPARK_SPREAD: 0.45,  // tiles
                SPARK_COLOR:  0xffe08a,

                // Chips knocked off the slab. Thrown on a real arc — up and
                // out, then down past where they started — because a chip
                // travelling in a straight line is indistinguishable from a
                // spark and the two effects then say the same thing twice.
                DEBRIS: {
                    ENABLED: true,
                    COUNT:   5,      // per blow, scoring or not
                    MS:      520,    // flight time; outlasts the 110ms swing on
                                     // purpose, so chips from one blow are still
                                     // falling as the next lands
                    SIZE:    0.21,   // tiles, before a per-chip random 0.6-1.4x.
                                     // 3x the original 0.07: at that size the
                                     // chips were correct but incidental, read
                                     // as grit, and the blow's whole visible
                                     // result was a tint flash. These are chunks
                                     // coming off a wall and are meant to be the
                                     // thing you watch
                    SPREAD:  0.8,    // tiles out from the contact point
                    RISE:    0.45,   // tiles up at the top of the arc
                    FALL:    0.5,    // tiles below the start where they land
                    // Stone, in four shades so a burst is not one flat colour.
                    COLORS:  [0x8a6a55, 0x6f5442, 0xa3836b, 0x5a4535],
                },

                // The damage number that flies off the block on each hit.
                DROP: {
                    ENABLED: true,
                    SIZE:    19,
                    COLOR:   '#ffd9d0',
                    STROKE:  '#1d2b16',
                    STROKE_W: 4,
                    RISE:    0.55,   // tiles
                    MS:      620,
                },
            },

            // A temporary wall across the main canal — a water blocker.
            //
            // It appears when the CUT REACHES IT, not when the level is built:
            // until then there is nothing to block. One goes in at the level's
            // far edge the moment the dig finishes, immediately before the flood
            // is released, so the water arrives to find it standing.
            //
            // The point of it is the plan for LONG levels: two or three walls
            // part-way up, so each stretch fills as it is cut instead of the
            // whole canal waiting for the end. That turns one long wait into
            // several visible payoffs. Only the end wall exists today.
            //
            // Authored against a 256px (two tile) canal, so it takes the SAME
            // scale the 128px tiles take: whatever a tile is on screen, divided
            // by FRAME. At 449x226 that puts it 3.5 tiles wide — the two canal
            // columns plus about three quarters of a tile onto each bank.
            // ── The fence ───────────────────────────────────────────────────
            // A run of close-set wooden poles marking where one farm ends and
            // the next begins. graphics/fence-pole.webp is one long horizontal
            // strip of poles, no rails.
            //
            // It sits on a level's FLOOR — the boundary it shares with the level
            // below — and is drawn in TWO pieces with a gap in the middle, so the
            // machine drives through rather than over it. The gap is the canal's
            // own columns plus GAP_COLS either side, the same span the farmer is
            // kept out of, so both read as "the machine's corridor".
            //
            // Never on the first level: below that is the lake, not a farm.
            // ── Dimming the neighbours ──────────────────────────────────────
            // Three or four farms are on screen at once, which without this reads
            // as one continuous strip of land the machine crawls up — no level
            // ever looks like a level, let alone like one being FINISHED. So
            // every farm but the one being dug is laid under a dark sheet: the
            // work has a place, and finishing it visibly moves that place on.
            //
            // Only the current one is clear, and that is the whole trick. Fading
            // each finished farm a little more would wash the stack out and say
            // nothing about where the work is; held to one, it reads as focus.
            // The same argument the fence's own focus is built on.
            //
            // THE LIGHT FOLLOWS COMPLETION, NOT THE MACHINE. A farm stays lit
            // until every crop on it has reached its last stage — which is the
            // level actually being finished, not the rig walking out of it. The
            // machine is free to cut the next field meanwhile, in shade: what the
            // player is being asked to watch is the field coming in, and moving
            // the light with the rig would take their eye off it at exactly the
            // moment it pays off.
            //
            // Free at runtime: alpha is a per-vertex value, so a see-through
            // sprite costs exactly what a solid one does.
            DIM: {
                ENABLED: true,
                ALPHA:   0.42,       // how dark a neighbour goes. 0 = off
                COLOR:   0x0a1a10,   // a cold green-black, so dimmed fields read
                                     // as being in shade rather than greyed out
                FADE_MS: 420,        // handover cross-fade

                // ── WHAT THE SHADE COVERS ───────────────────────────────
                // THE WHOLE BAND, edge to edge — and it sorts by DEPTH rather
                // than being cut short.
                //
                // The problem it solves: everything standing on the boundary at
                // a band's foot belongs to the level BELOW — the shared fence,
                // that level's top-row crops, its farmer, its tally — and all of
                // them are taller than the tile they stand in, so they reach up
                // into this band and were being shaded with it.
                //
                // Stopping the rectangle short of the boundary fixed that but
                // cost the bottom two rows of every shaded level, which is a lot
                // of unshaded farm on a short one.
                //
                // So the shade sits at the depth of its own band's FLOOR
                // instead. Actors sort by world Y, and Y grows downward, so
                // anything rooted inside the band sorts under the shade and
                // anything rooted at or below its floor sorts over it — which is
                // precisely the difference between "this level's" and "the level
                // below's", stated exactly rather than approximated by a margin.
                //
                // DEPTH below is the FLOOR under that: the shade must still
                // clear every ground item (the canal band tops out at 3.15), so
                // a band drawn near the top of the world takes this instead of
                // its own smaller figure.
                // ABOVE EVERYTHING IN THE WORLD, actors included. The shade
                // falls on the whole farm — its crops, its animals, its farmer —
                // or the field dims while the things living in it stay lit,
                // which reads as a bug rather than as distance.
                //
                // A FLOOR, NOT THE DEPTH. Each band's shade takes the depth of
                // its own floor (see _buildDim), which is what separates "this
                // level's things" from "the level below's" exactly. That figure
                // sorts from 4 at the world's foot and falls by a thousandth a
                // tile as the run climbs, so this is the point below which it
                // may not go: 3.5 still clears every ground item, the highest
                // being the main bridge at 3.15.
                //
                // It was 4.5 — above the whole actor band — back when the shade
                // was a flat depth for every level and the sparing was done by
                // cutting the rectangle short instead.
                DEPTH:   3.5,
            },

            // ── Animal farms ────────────────────────────────────────────────
            // Some levels are ranches. Rather than placing every animal by hand
            // the way the cow_* markers do, a ranch declares a SPECIES and a
            // COUNT in levels.js and the herd is scattered for you.
            //
            // WHERE they stand is anywhere that is not canal. Nothing has to be
            // drawn on the map — a count is enough — and when there are places
            // the herd must keep out of (a farmhouse's footprint, a yard) those
            // become one more reason to reject a cell, alongside the ditch.
            //
            // WHEN they appear is the water. Each animal watches ITS OWN nearest
            // canal cell, exactly as a crop does, so the herd fills in behind
            // the water as it spreads rather than arriving on one signal — and
            // an unwatered field stays empty. A ranch is restored by the same
            // act that grows a farm.
            //
            // Positions and facings come from the CELL HASH rather than
            // Math.random. Nothing rebuilds a level today, so this is not
            // required; it costs nothing and means a level restored from a save
            // comes back with the herd it had, with no positions written down.
            ANIMALS: {
                ENABLED: true,
                AT:   0.15,             // canal fill fraction that counts as watered
                                        // — the same threshold the crops use
                // THEY POP UP rather than descend. Scaling from nothing, about
                // the feet — the origin is the feet, so it grows out of the
                // ground it will stand on — reads as an animal arriving. Sliding
                // down into place read as one being dropped there.
                FADE_MS:  380,
                POP_FROM: 0.35,             // scale it starts at. 1 = no pop
                POP_EASE: 'Back.easeOut',   // overshoots a little and settles
                // ── Placed herds ────────────────────────────────────────
                // A ranch may be SCATTERED (a count, positions chosen for you)
                // or PLACED (a point per animal, painted on the map). Placed is
                // for the ones that have to stand somewhere in particular; the
                // level says which by giving COUNT or not.
                //
                // Points go on their own object layer and are named for the way
                // the animal looks — `cow_e`, or just `_e` to take the level's
                // own species. The count is however many points there are.
                LAYER: 'ranch',
                // WHERE A PLACED POINT SITS ON THE ANIMAL: the edge it faces.
                // `cow_e` puts the cow's east edge on the point, `cow_s` its
                // south edge, so the body always trails behind the mark and
                // never crosses it. Marking a spot beside a fence or a ditch
                // therefore keeps the animal out of it.
                //
                // The vertical half is the FEET wherever the facing leaves a
                // choice, so the animal stands on the ground plane it was marked
                // in. North is the exception by construction — its leading edge
                // is its top, so it stands below its own mark.
                //
                // Same convention as the hand-placed cow_* props markers, which
                // is deliberate: one rule for placing an animal, however it was
                // placed.
                FACE_ORIGIN: { n: [0.5, 0], s: [0.5, 1], e: [1, 1], w: [0, 1] },

                // ── Fences ──────────────────────────────────────────────
                // An upright structure painted as tiles, which animals and the
                // farmer pass BEHIND or IN FRONT of by their Y — unlike the
                // ground and the ditches, which are always underfoot. It is a
                // normal tile layer; what makes it upright is that each tile
                // sorts from the line it stands on rather than taking a flat
                // depth.
                //
                // HEIGHT lets a fence stand taller than the cell it occupies —
                // the art is anchored to the BOTTOM of its tile and rises out of
                // it, which is what a post does.
                // Both spellings: the config said 'fences' and the maps say
                // 'fence'. First match wins, the same way the crop layer accepts
                // either — a layer name is not worth a migration.
                FENCE_LAYER:  ['fence', 'fences'],
                // Upright, so it sorts by world Y like an actor rather than
                // lying flat with the ground: an animal in front of a rail draws
                // over it, one behind it does not. The bias lifts it a hair off
                // whatever shares its row.
                FENCE_BIAS:   -0.0004,

                // ── WHAT AN ANIMAL PRODUCES ─────────────────────────────
                // A ranch level had nothing to gather: grass is pasture, so it
                // greens up and stops, while a crop level ripens, is walked, is
                // tallied and ticks. This gives the herd the same beat — the
                // animal is both the reward in the roster AND the source of the
                // level's produce.
                //
                // IT IS LEFT WHERE THE ANIMAL STOOD, not carried. That is the
                // whole reason this needs no new machinery: a churn on the grass
                // is a yield in a cell, indistinguishable from a fruit as far as
                // the harvest run is concerned — same nearest-first targeting,
                // same reach, same MAX_HOLD clock, same flight to the tally. The
                // cow may wander off; the milk stays.
                //
                // ONE PER ANIMAL, so the tally's count is simply the herd size
                // and is known before a drop has happened.
                PRODUCE: {
                    ENABLED:  true,
                    // WHAT each species leaves is on the species itself, in
                    // SPECIES.<name>.PRODUCE — a churn is 0.93 tiles and an egg
                    // is 0.34, and neither number means anything to the other
                    // animal. What is shared is WHEN and HOW it appears.
                    SIZE:     0.62,        // fallback height, in tiles, for a
                                           // species that names no size of its
                                           // own. The width follows the art
                    AFTER_MS: [3000, 14000],  // once it has appeared and grazed a
                                              // while. Spread wide: a herd that
                                              // yields together reads as a
                                              // machine, not as animals
                    POP_MS:   320,
                    POP_FROM: 0.4,
                    // OVER THE ANIMAL, not under it. An animal sorts at
                    // _yDepth(y) with no bias, and the churn is dropped at the
                    // animal's own feet — so anything negative put it behind a
                    // cow standing on the exact same spot, which is every churn
                    // at the moment it appears. It only becomes visible once the
                    // cow wanders off, which is far too late to read as being
                    // produced.
                    //
                    // Depth is still by world Y, so a cow standing lower in the
                    // field still draws over a churn higher up. This only settles
                    // ties, and a tie means "the animal that just left it".
                    BIAS:     0.0006,
                },
                FENCE_HEIGHT: 1,        // in tiles; 1.5 for a tall fence

                // ── Wandering ───────────────────────────────────────────
                // SOME of the herd walks about. Not all of it: a field where
                // every animal is on the move reads as agitated, and one where
                // none are reads as a diorama. A minority wandering while the
                // rest graze is what looks like livestock.
                //
                // Which ones is decided by the CELL HASH, so a given animal is
                // either a wanderer or not and stays that way.
                //
                // A species can only wander if its facings name a WALK frame —
                // cows have no walk art, so they stand still and nothing has to
                // say so anywhere.
                MOVE: {
                    ENABLED:  true,
                    FRACTION: 0.45,          // share of the herd that ever moves
                    SPEED:    0.45,          // tiles per second — an amble
                    WALK_FPS: 5,             // the two walk frames alternating
                    PAUSE_MS: [4000, 15000], // stood still between trips
                    TRIP_TILES: [1, 3.5],    // how far one trip goes
                    SWAY: 0.6,               // how hard it knocks a plant it
                                             // passes, against the farmer's 1.
                                             // A pig shouldering through a crop
                                             // is not a person walking through
                                             // it, and the field should say so
                    // Facing follows the direction of travel, split at the
                    // diagonals: within 45 degrees of straight up it faces
                    // north, and so round. Comparing the two distances is the
                    // same test and needs no angles.
                },

                // A last nudge on top of the water's own spread, so two animals
                // sharing a canal cell still arrive a beat apart. Same reasoning
                // as the crops' watering stagger.
                STAGGER_MS: [0, 1600],

                // A SPECIES gathers everything one animal needs: a drawing per
                // facing, its second drawing for grazing, and how tall it stands
                // in TILES. Adding pigs is a block like this one plus a line in
                // levels.js — no code.
                //
                // Every facing is anchored at its FEET, unlike the hand-placed
                // cow_* markers where the anchor encodes which way the animal
                // looks. A scattered animal simply stands on its cell.
                SPECIES: {
                    // A species may keep its facings as SEPARATE IMAGES (the
                    // cow) or as SPRITESHEETS with frame numbers (the pig). The
                    // pig's two sheets have different frame sizes — front and
                    // back share a silhouette, the side view does not — and one
                    // padded sheet would waste 46% of its pixels on empty
                    // columns, so they stay two.
                    //
                    // Each row runs walk1, walk2, eat. Only walk1 (standing) and
                    // eat are used: nothing walks yet, so frame 2 of every row
                    // is spare and waiting for that.
                    pig: {
                        SHEETS: {
                            ns: { FILE: 'graphics/animals/pig/pig_ns.webp', FRAME_W: 77,  FRAME_H: 96 },
                            e:  { FILE: 'graphics/animals/pig/pig_e.webp',  FRAME_W: 128, FRAME_H: 82 },
                        },
                        // pig_ns is two rows of three, counted left to right and
                        // top to bottom: north is 0-2, south is 3-5.
                        //
                        // SIZE is height in tiles. The side view is 82px where
                        // the front is 96, so its size is that same fraction of
                        // the front's — otherwise the same animal changes size
                        // when it turns.
                        FACINGS: {
                            n: { SHEET: 'ns', IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.30 },
                            s: { SHEET: 'ns', IDLE: 3, WALK: 4, EAT: 5, SIZE: 1.30 },
                            e: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.11 },
                            w: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.11, FLIP: true },
                        },
                    },
                    // The side view is 60 tall where the front is 64, so its SIZE
                    // is that same fraction of the front's — otherwise the sheep
                    // would change height as it turned.
                    sheep: {
                        // WHAT SHEARING LEAVES ON THE GRASS. The art is wider
                        // than it is tall (72x50), and SIZE is the HEIGHT — so
                        // 0.68 lays it out just under a tile across, about as
                        // wide as the sheep it came off. Any taller and a fleece
                        // starts reading as a second animal.
                        PRODUCE: { NAME: 'fleece', FILE: 'graphics/animals/sheep/fleece.png',
                                   SIZE: 0.68 },
                        SHEETS: {
                            ns: { FILE: 'graphics/animals/sheep/sheep_ns.webp', FRAME_W: 48, FRAME_H: 64 },
                            e:  { FILE: 'graphics/animals/sheep/sheep_e.webp',  FRAME_W: 64, FRAME_H: 60 },
                        },
                        FACINGS: {
                            n: { SHEET: 'ns', IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.00 },
                            s: { SHEET: 'ns', IDLE: 3, WALK: 4, EAT: 5, SIZE: 1.00 },
                            e: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 0.94 },
                            w: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 0.94, FLIP: true },
                        },
                    },

                    // The _ns sheet is 120px across three columns, so a frame is
                    // 40 wide and not the 30 the art is drawn in — there is a
                    // little empty room either side of the animal. Frame size is
                    // the CELL the sheet is cut on, not the ink inside it.
                    bunny: {
                        SHEETS: {
                            ns: { FILE: 'graphics/animals/bunny/bunny_ns.webp', FRAME_W: 40, FRAME_H: 64 },
                            e:  { FILE: 'graphics/animals/bunny/bunny_e.webp',  FRAME_W: 64, FRAME_H: 64 },
                        },
                        // Both sheets are 64 tall, so both facings take the same
                        // SIZE and the animal keeps its height as it turns.
                        
                       
                         FACINGS: {
                            n: { SHEET: 'ns', IDLE: 0, WALK: 1, EAT: 2, SIZE: 1 },
                            s: { SHEET: 'ns', IDLE: 3, WALK: 4, EAT: 5, SIZE: 1 },
                            e: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1 },
                            w: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1, FLIP: true },
                        },
                    },

                    // Only a SIDE view exists, so only east and west are listed
                    // and west is east mirrored. Nothing else has to be said:
                    // when a chicken walks north or south the turn finds no pose
                    // for it and it keeps the facing it had — which is what the
                    // farmer does on a straight vertical walk too, and reads as
                    // an animal that simply has not turned.
                    chicken: {
                        // 0.68 rather than the honest 0.34: an egg that size
                        // beside a hen is right and unreadable — 17px lost among
                        // a hundred corn plants. Produce has to be findable, and
                        // the player is looking for it.
                        PRODUCE: { NAME: 'egg', FILE: 'graphics/animals/chicken/egg.png',
                                   SIZE: 0.68 },
                        SHEETS: {
                            e: { FILE: 'graphics/animals/chicken/chicken_e.webp', FRAME_W: 100, FRAME_H: 100 },
                        },
                        // SIZE is a starting guess — tune by eye. It fights
                        // itself a little: a believable chicken is under a tile
                        // tall, but the frame is 100px, so at that size it is
                        // squeezed past 2x and can shimmer while walking. Being
                        // small and round it hides that far better than the
                        // bridge's planks did; if it does show, re-export the
                        // sheet at 48px frames rather than growing the bird.
                        FACINGS: {
                            e: { SHEET: 'e', IDLE: 0, WALK: 1, EAT: 2, SIZE: 0.85 },
                            w: { SHEET: 'e', IDLE: 0, WALK: 1, EAT: 2, SIZE: 0.85, FLIP: true },
                        },
                        // IT SCATTERS WHEN THE FARMER COMES CLOSE. The one bit of
                        // behaviour that makes a hen a hen rather than a small
                        // cow — and it makes the gathering run lively, since the
                        // eggs he is walking to are exactly where the birds sat.
                        //
                        // It runs to somewhere it could have wandered anyway:
                        // its own farm's rows, the columns a phone draws, never
                        // the ditch. Scattering never takes it anywhere the
                        // farmer could not follow.
                        FLEE: {
                            RADIUS:      1.5,         // tiles — how close is too close
                            DIST:        [1.4, 2.6],  // tiles — how far it bolts
                            SPEED_MUL:   4,           // against its amble; a hen
                                                      // that walks away is not
                                                      // startled
                            COOLDOWN_MS: 700,         // before it can bolt again,
                                                      // so a farmer standing near
                                                      // does not make it vibrate
                        },
                    },
                    cow: {
                        // WHAT IT LEAVES. Named, sized and pathed per species,
                        // because a churn and an egg are nothing alike: one is
                        // nearly as tall as the cow that made it, the other sits
                        // under a hen. Only the TIMING is shared (PRODUCE above).
                        PRODUCE: { NAME: 'churn', FILE: 'graphics/animals/cow/churn.png',
                                   SIZE: 0.93 },
                        SHEETS: {
                            ns: { FILE: 'graphics/animals/cow/cow_ns.webp', FRAME_W: 57,  FRAME_H: 114 },
                            e:  { FILE: 'graphics/animals/cow/cow_e.webp',  FRAME_W: 128, FRAME_H: 84  },
                        },
                        // Two rows of three: north is 0-2, south is 3-5, each
                        // running idle, walk, eat. The side view is 84px where
                        // the front is 114, so its SIZE is that same fraction —
                        // otherwise the animal changes size when it turns.
                        //
                        // Both land at about 1.1x downscale, which is as close
                        // to the display size as art gets.
                        FACINGS: {
                            n: { SHEET: 'ns', IDLE: 0, WALK: 1, EAT: 2, SIZE: 2.00 },
                            s: { SHEET: 'ns', IDLE: 3, WALK: 4, EAT: 5, SIZE: 2.00 },
                            e: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.47 },
                            w: { SHEET: 'e',  IDLE: 0, WALK: 1, EAT: 2, SIZE: 1.47, FLIP: true },
                        },
                    },
                },
            },

            FENCE: {
                ENABLED: true,
                FILE:  'graphics/fence-pole.webp',
                GAP_COLS: 1,        // columns kept clear either side of the canal
                Y:     0,           // nudge off the boundary line, in tiles
                // Once the machine is working the level above it, its own fence
                // is behind the action and only in the way — so it goes
                // see-through and stays that way.
                FADED_ALPHA: 0.1,   // 1 = solid, 0 = invisible. Nearly gone: the
                                    // fence stands on the boundary at the foot
                                    // of the lit farm, right across its bottom
                                    // row of crops, and once the level above it
                                    // is being dug it has no job left but to
                                    // obstruct that row. A trace is kept rather
                                    // than none at all, so the boundary is still
                                    // legible as a line between two farms
                FADE_MS:     300,
                // UNDER ITS OWN BAND'S SHADE, by a hair — the shades now sort by
                // the depth of their band's floor, and a fence stands exactly on
                // one of those lines. Left at zero it tied with the shade and
                // won, which meant EVERY boundary's fence stayed lit: level 1
                // in focus, and the fence between 2 and 3 was bright too.
                //
                // Only the fence at the lit level's own top is raised over its
                // shade, by _focusDim. This is the figure the rest sit at.
                SHADE_BIAS: 0.0002,
                DEPTH_BIAS: 0,      // none needed. Depth comes from world Y, and
                                    // the fence stands on the boundary line, so
                                    // a crop rooted below it is already nearer
                                    // the camera and a crop rooted above it is
                                    // already further. Any bias here overrides
                                    // that — at 0.0008 it beat a crop half a tile
                                    // below, which is what hid them
            },

            // ── The farmer ──────────────────────────────────────────────────
            // Somebody lives here. One per level, wandering the crops, so the
            // irrigation reads as being FOR someone rather than happening to an
            // empty field.
            //
            // graphics/farmers.webp is 768x128 — six 128px frames in one row:
            //   0,1  idle (a two-frame breathe)
            //   2-5  walk, drawn facing RIGHT
            // Every frame faces the camera. Direction is read from travel and
            // shown by mirroring, so walking up or down uses the same cycle —
            // there is no separate vertical pose and none is needed.
            FARMER: {
                ENABLED: true,
                // ── The rotation ────────────────────────────────────────
                // Different farms, different farmers. One sheet per farmer in
                // DIR, named here in PLAY ORDER, wrapping at the end — level 1
                // gets the first, level 2 the second, and so on. Add a sheet and
                // its name here; nothing else needs to know.
                //
                // Each is one row of FRAMES square frames:
                //   0        idle — a STILL pose, not a loop
                //   1 .. 4   the walk cycle, drawn facing RIGHT
                DIR:    'graphics/farmers/',
                CYCLE:  ['farmer1', 'farmer2'],
                EXT:    '.webp',
                FRAMES: 5,
                // ── WHEN HE TURNS UP ────────────────────────────────────
                // Levels are built several ahead of the machine, so without
                // this a farmer is already standing in a field the player has
                // not reached — three farms up the screen, tending crops that
                // are still seeds in ground nobody has watered.
                //
                // He walks on once HIS OWN level is being dug, which is the
                // moment that farm becomes the one being played.
                REVEAL: {
                    AFTER_TILES: 0.5,   // how far into the level the blade must
                                        // be. Not 0: the handover itself would
                                        // then pop him in, and a beat later
                                        // reads as him coming out to the field
                                        // rather than being switched on with it
                    FADE_MS:  380,
                    POP_FROM: 0.35,     // scale he swells from
                    POP_EASE: 'Back.easeOut',
                },
                // ── THE FIELD IS IN ─────────────────────────────────────
                // Every plant on his farm has reached its last stage, and he
                // jumps for it. Squash, launch, stretch, land — the whole shape
                // of the move is squash-and-stretch, so it reads as delight
                // rather than as a sprite being moved up and down.
                //
                // Volume is conserved on both halves: what he loses in height he
                // gains in width and the other way about. Without that he simply
                // gets shorter and taller, which reads as a scaling bug.
                CHEER: {
                    ENABLED: true,
                    HOPS:     2,        // one is a hiccup; three is a dance
                    SQUASH:   0.18,     // compression before the launch
                    STRETCH:  0.16,     // how far he draws out in the air
                    RISE:     0.55,     // apex, in tile heights
                    DIP_MS:   130,      // the crouch
                    UP_MS:    190,      // ...and the launch off it
                    DOWN_MS:  170,
                    LAND_MS:  110,      // the give in his knees on landing
                    GAP_MS:    60,      // between hops
                },
                // ── GATHERING THE FIELD ─────────────────────────────────
                // He harvests BY PASSING, not by stopping: everything within
                // REACH comes off as he goes, so a row is cleared by walking
                // down it rather than by a visit to each plant. Standing at
                // every one would take a minute of real time on a full field.
                //
                // HE WALKS. However far it is, if it is on his side of the
                // canal he walks to it — the walk is the work, and a distance
                // rule that jumped him across his own field would throw that
                // away for the sake of a few seconds.
                //
                // THE CANAL HE CROSSES BY BRIDGE. A field split by the main
                // channel is crossed where the map says it can be: he walks to
                // the near end of the deck, straight over it, and on to the
                // fruit. Two legs, never one diagonal — a straight line to the
                // far side leaves the deck and crosses open water.
                //
                // Branch and minor ditches he just walks. They are a stride wide
                // and stepping one is not worth a mechanism.
                //
                // A map with NO bridge over the main falls back to the leap
                // below. Not every level has been given one yet, and a farmer
                // who cannot reach the far side strands fruit there — which now
                // holds the level open, since the roster waits on the field
                // being picked.
                HARVEST: {
                    ENABLED:  true,
                    // HOW LONG RIPE FRUIT MAY STAND. The moment the oldest
                    // crosses this, the round is on — and it is on for
                    // everything ripe, both sides, however recently it bore.
                    //
                    // A CLOCK, NOT A COUNT. This was "wait until four are ready",
                    // and a count has to be rescued from itself at every turn: a
                    // half with three plants waits forever on a fourth that is
                    // never coming, so it needed a per-side tally, and a tail
                    // exemption, and a rule for the far side — each one a way for
                    // the field to stall and the level to hang. Time arrives on
                    // its own and none of that is needed.
                    //
                    // It gates the PICKING as well as the walking, in-reach
                    // included. Otherwise a farmer who happened to be standing
                    // beside the first plant to ripen took it the instant it
                    // bore, and the rule meant nothing to whoever was in the
                    // right place.
                    //
                    // The one exemption is the end of the field: with nothing
                    // still to ripen the hold buys nothing, so the last of the
                    // crop is taken at once rather than holding the level open
                    // for five more seconds.
                    MAX_HOLD_MS: 5000,
                    REACH:    1.15,   // tiles — what comes off in passing
                    SPEED_MUL: 2.4,   // faster than his wander; he has a job on
                    // ONCE THE FIELD CANNOT GET ANY RIPER, he stops pacing
                    // himself. When the canal is cut through, the water has
                    // finished spreading and every plant is grown, picking is
                    // the only thing left between here and the next level — and
                    // unlike the dig and the flood, it is not something the
                    // player is watching happen, it is something they are
                    // waiting out.
                    //
                    // His WALK only. The pick, the fruit's rise and its flight
                    // to the tally keep their own timing: those are the beats
                    // that read as the reward, and speeding them up would take
                    // the payoff away rather than shorten the wait.
                    RUSH_MUL: 2,
                    // A crossing that has not finished in this long is not
                    // going to. He gives up on the deck and jumps, because the
                    // roster waits on the field being picked and a farmer stuck
                    // part way over halts the game, not just himself.
                    CROSS_TIMEOUT_MS: 8000,
                    // ── The leap ────────────────────────────────────────
                    JUMP_MS:     520, // bank to bank
                    JUMP_RISE:   1.1, // apex above the banks, in tiles
                    CROUCH_MS:    90, // the gather before he pushes off
                    LAND_MS:      90, // the give in his knees, and back up
                    JUMP_SQUASH: 0.14,
                    JUMP_STRETCH: 0.12,
                },
                // ── HE PAYS FOR THE HARVEST ─────────────────────────────
                // The coin economy already existed and had no earning side: the
                // counter, the icon and the flight were all built, coins were
                // spent on batteries, and nothing ever put one in. This is the
                // other half.
                //
                // THE FARMER PAYS, at the end, for the field he gathered — not
                // the player per fruit. We dig the canal; the produce is his,
                // and what we are owed is settled once the farm is restored.
                //
                // FLAT, FOR NOW. A field-size rate was tried and did not track
                // progression at all: level 10 paid less than level 7 for being
                // a smaller farm, while the dig cost between them had gone up
                // forty times. One number a level says the same thing without
                // pretending to a curve it does not have.
                //
                // When coins have to buy something that scales, this wants to
                // become a column beside COST in levels.js — or a fraction of
                // it, so the reward follows the difficulty with no second table
                // to keep in step.
                PAY: {
                    ENABLED:   true,
                    AMOUNT:    1000,  // per level, whatever it grew
                    PER_CROP:  0,     // ...plus this for each plant gathered
                    DELAY_MS:  250,   // after the cheer, before the coins fly
                },

                // ── AND HE LEAVES ───────────────────────────────────────
                // The field is gathered and celebrated; there is nothing left
                // for him to do in it. He walks off the side he is standing on
                // and out of the map, rather than wandering a finished farm
                // while the machine works two levels above.
                //
                // Off the SIDE, not the bottom: the sides are the only edges the
                // player is not looking at — the farm scrolls upward, so leaving
                // downward would walk him back through the level and leaving
                // upward would take him into the next one.
                LEAVE: {
                    ENABLED:   true,
                    DELAY_MS:  700,   // a beat after the cheer, so the two read
                                      // as finishing and then going, not as one
                                      // move. Long enough, too, that the coins
                                      // are away before he is: he is paid where
                                      // he stood in the field, not halfway off
                                      // the edge of it
                    SPEED_MUL: 2.0,   // twice his wander; his day is over and
                                      // there is nothing to watch him do on the
                                      // way out
                    MARGIN:    1.5,   // tiles past the map edge before he is
                                      // taken off — clear of the widest sprite
                },
                // ── BREATHING ───────────────────────────────────────────
                // There is one idle frame, so a standing farmer is a still
                // image — and a still image beside a field of swaying crops and
                // wandering animals reads as a bug. A slow squash and stretch
                // gives him a pulse without a second drawing.
                //
                // Volume is conserved, and the sideways half is smaller than the
                // vertical: a chest rises more than it widens. He is anchored
                // near his feet (origin y 0.85), so this settles into the ground
                // rather than bobbing off it.
                IDLE_BREATH: {
                    ENABLED: true,
                    HZ:      0.55,   // a slow breath, not a pant
                    AMOUNT:  0.03,   // 3% taller at the top of it
                    SIDE:    0.6,    // how much of that goes sideways
                },
                SIZE:  1.9,         // height as a fraction of a tile
                IDLE_FRAME: 0,      // standing still is a STILL POSE, not a
                                    // loop — this frame is held. Frame 1 unused
                WALK_FPS: 8,
                SPEED: 1.1,         // tiles/sec
                CROP_SEEK: 0.85,    // how often he heads for a CROP rather than
                                    // wandering. He is looking after the field,
                                    // so most trips should have a reason
                CROP_PAUSE_MUL: 1.7,// and he lingers this much longer once he is
                                    // standing among them
                STOP_MIN_STAGE: 2,  // he will WALK across a crop at any stage but
                                    // only STOP on one that has got going. A seed
                                    // is a bare patch of soil — standing on it
                                    // looks like trampling it. Once watered and
                                    // growing there is a plant to tend, so he can
                                    // settle there
                PAUSE_MS: [1800, 6500],   // he mostly stands still; this is the
                                          // wait between walks, weighted long
                TRIP_TILES: [1.5, 5],     // how far he goes when he does move
                ROW_INSET: 0.5,     // tiles kept clear at the TOP and BOTTOM of
                                    // his level, so he cannot reach either
                                    // boundary. Half a tile puts his limit on the
                                    // CENTRE of the first and last rows — far
                                    // enough back from the fence standing on the
                                    // floor that he never walks through it, which
                                    // a solid fence should not allow
                EDGE_COLS: 1,       // columns kept clear at each side of the map
                MACHINE_COLS: 1,    // columns kept clear either side of the canal
                                    // for the trencher. With the canal's own two
                                    // that is the four middle columns
            },

            // The work left in this level, shown over the machine and counting
            // down as the batteries chew through it. It includes the overrun —
            // the 3.5 tiles into the level above — because that is genuinely
            // part of what this dig has to pay for.
            POWER_LABEL: {
                ENABLED: true,
                // Beside the DIG LINE, out to its left, rather than over the
                // machine. The cut line is where the work is actually happening
                // and where the eye already is; parked over the control unit the
                // number rode ahead of it, on the ground still to be cut.
                // Right-aligned, so it grows away from the rig instead of into it.
                X:       0.4,       // clear of the rig's left flank, in rig widths
                Y:       0,         // off the dig line, in tiles (+ is down)
                SIZE:    26,        // font size @ design scale
                COLOR:      '#ffffff',
                STROKE:     '#1d2b16',
                STROKE_W:   5,
                // ABOVE EVERYTHING IN THE WORLD, the dim included. It is a
                // readout, not a thing in the field: a number the player has to
                // be able to read at any moment, so nothing may pass in front of
                // it and no shade may fall on it.
                //
                // It was 3.2 — "over the machine and its spoil" — which was true
                // until the actor band moved from 3 to 4 to lift animals over
                // the main canal. Crops have been drawn across it since.
                DEPTH:   4.6,

                // ONLY ON THE LIT FARM. The rig no longer waits for a field to
                // come in, so it spends most of its time cutting the level
                // ABOVE the one being watched — and a number ticking down in a
                // shaded field pulls the eye off the farm the beat belongs to.
                // Worse, it is the only thing on screen that moves during the
                // completion, so it wins.
                //
                // It fades rather than blinks, on the dim's own timing, so the
                // readout arrives with the light on its level.
                ONLY_WHEN_LIT: true,

                // AND IT ARRIVES AT THE LEVEL'S FULL PRICE, then runs down to
                // what is actually left. By the time a farm takes the light the
                // rig has usually been cutting it for a while unseen — the
                // readout would otherwise fade in at 1600 for a level that costs
                // 2000, and 1600 means nothing on its own. Showing 2000 first
                // and running it down says both things at once: what this level
                // is worth, and how much of it is already done.
                CATCHUP_MS: 1100,

                // ── THE HIT, spelled out ────────────────────────────────
                // The number drops once a second and the label pulses, but the
                // drop itself is never shown: the player sees 2.5K become 2.45K
                // and has to do the subtraction to know what a second of charge
                // is worth. This floats the difference — "-50" — up off the
                // readout and fades it, so the delivery is legible as an amount
                // and not just as movement.
                //
                // DOWNWARD. A number being taken away should fall, not rise —
                // and the readout sits on the dig line with the machine's work
                // above it, so up is where the eye already is.
                DROP: {
                    ENABLED: true,
                    SIZE:     20,       // font size @ design scale; under the
                                        // readout's 26 — it is the annotation,
                                        // not the figure
                    COLOR:   '#ffd9d0', // warm, and only ever negative
                    STROKE:  '#1d2b16',
                    STROKE_W: 4,
                    RISE:    -1.1,      // how far it floats, in tiles. NEGATIVE
                                        // is downward — the sign is the
                                        // direction, so one number moves it
                                        // either way
                    DX:      -0.25,     // sideways lean, in tiles
                    MS:       780,
                    HOLD:     0.25,     // share of MS at full opacity before it
                                        // starts to go — long enough to read
                                        // while it is still beside the figure
                },
            },

            BLOCK: {
                // DAM MODE ONLY. Walls exist to hold water back, and under
                // FOLLOW nothing is being held — a dam with nothing to dam is
                // scenery standing in the channel for no reason — so
                // TUNNEL.LEVEL_MODE takes them off screen on its own and this
                // flag is not consulted.
                //
                // Inside DAM mode it still switches BOTH off: the wall dropped
                // at each level's far edge, and the mid-level dams raised from
                // `block` points on the props layer. Those markers can stay
                // painted in the maps either way; they are simply not read.
                ENABLED: true,
                FILE:  'graphics/block.png',
                // Which point ON THE ART lands on the level boundary. Not the
                // centre: the wall's waterline sits high in the image, so this
                // is the pivot that puts the line where the water is actually
                // stopped. Measured from the top-left of the sprite, 0..1.
                ORIGIN_X: 0.5,
                ORIGIN_Y: 0.25,
                Y:     0,        // nudge off the boundary line, in tiles
                // ── Mid-level dams ──────────────────────────────────────
                // A point named MID_MARKER on the props layer is a place to dam
                // the main canal PART WAY up, so the branches below it fill
                // while the machine is still working above. Without it a level's
                // whole field waits on the last tile of the dig, which is a long
                // time to look at dry soil on the taller maps.
                //
                // CLEAR_TILES is why it does not appear the instant the blade
                // draws level with it: the rig is longer than its cut line, so a
                // wall dropped there would land on top of the machine. It waits
                // until the cut has run this far past, which is roughly the
                // length of the rig behind the blade.
                MID_MARKER:  'block',
                CLEAR_TILES: 4,
                DEPTH: 3.09,     // UNDER the canal's water (3.10). The wall is
                                 // set into the channel, not laid across the top
                                 // of it, so the water rises against its face and
                                 // laps over it — which is what a dam holding
                                 // water looks like. Drawn above it instead, the
                                 // wall reads as a plank dropped on the surface.
                                 // Still above the machine (3.04-3.07), so the
                                 // rig passes behind it rather than through it
                // DROPPED INTO PLACE, not blinked into existence. It starts
                // slightly high and slightly LARGER, then settles down to its
                // resting position and to full size. Bigger reads as nearer the
                // camera, so shrinking as it descends is the whole illusion —
                // the wall comes down out of the air and into the channel.
                DROP_MS:    340,    // longer, because it now falls further
                DROP_RISE:  1.3,    // how far above its resting place it starts,
                                    // in tiles
                DROP_SCALE: 1.45,   // and how much larger — i.e. how far toward
                                    // the camera. Rise and scale have to climb
                                    // together: more height with the same size
                                    // reads as a slide down the screen, and more
                                    // size without the height reads as a zoom.
                                    // It is the two moving in step that makes it
                                    // a descent
                DROP_EASE:  'Back.easeIn',   // gathers speed downward and lands
                                    // with a slight overshoot into the floor,
                                    // which is what sells the weight

                // Pulling one out is what lets the water through. A wall is
                // removed the instant the level ABOVE it is about to flood — so
                // the water does not merely appear beyond the boundary, it goes
                // because the thing stopping it was taken away.
                REMOVE_MS:   300,   // the placement run BACKWARDS — it rises the
                                    // same distance it fell and swells by the
                                    // same amount, withdrawing toward the camera
                                    // exactly as it descended away from it.
                                    // Height and swell are taken from DROP_RISE
                                    // and DROP_SCALE above rather than repeated,
                                    // so the two halves can never drift apart
                REMOVE_EASE: 'Back.easeOut',   // the mirror of the drop's easeIn:
                                    // it leaves quickly and slows, where the drop
                                    // gathered speed on the way down
            },

            // ── Terrain sheet ───────────────────────────────────────────────
            // Everything that is NOT a canal piece: the plain ground, the flat
            // water the flow head is drawn from, and the two growth overlays.
            // The canal sheet now carries only canal tiles (gid <= 53); nothing
            // reads past that. The sheet is 768x640 = 6 columns x 5 rows of
            // 128px frames, so a frame index is (row-1) * 6 + (col-1) and each
            // ROW after the first is exactly the six edge variants one layer
            // needs, in the CROP_OVERLAY_EDGES order: inner, n, ne, ns, nes,
            // nesw — everything else reached by rotating those.
            //
            //   row 1  the plain ground, and the flat water
            //   row 2  TILLED soil, dry      — the worked patch a seed sits in
            //   row 3  TILLED soil, watered  — the same shapes, darker
            //   row 4  damp overlay
            //   row 5  mossy overlay
            //
            // Rows 3-5 each moved down by one when the tilled row was inserted;
            // every frame number below is measured from this list, so the list
            // is the thing to correct if the sheet changes again.
            TERRAIN: 'graphics/tilesheets/terrain.webp',
            TERRAIN_GROUND: 0,      // row 1, col 1 — the field's base tile, dry
            TERRAIN_WATER:  1,      // row 1, col 2 — flat water; the flow head
            // Row 1, col 3 — the SAME bare ground as col 1, damp. Not the tilled
            // pair below: this is the field itself, unworked, with water in it.
            //
            // The whole field turns, not only the patches under the plants. With
            // just the patches darkening the picture said "the plants were
            // watered"; with the field turning it says "the land got water",
            // which is the thing the machine is actually doing. It also gives a
            // level with few crops something to show for being dug.
            TERRAIN_GROUND_DAMP: 2,
                                    // and its foam blobs are cut from this
            TERRAIN_TILLED:     6,  // row 2, col 1 — DRY tilled soil, and the
                                    // first of that row's six edge variants
            TERRAIN_GROUND_WET: 12, // row 3, col 1 — the SAME tilled shapes,
                                    // watered. Dry and wet share an edge variant
                                    // index, so wetting a patch is this row's
                                    // base plus the offset the dry tile already
                                    // chose — no second mask, no re-cut

            // ── Watered ground ──────────────────────────────────────────────
            // Irrigation should be VISIBLE in the soil, not only in the ditch:
            // as the canal fills, the land it feeds darkens tile by tile, so
            // the wet colour spreads outward from the water instead of the
            // field staying uniformly dry around a full canal.
            //
            // Only PLANTED cells wet — the ones marked on the CROPS layer. Bare
            // land is not being irrigated, so the wet colour ends up marking the
            // worked field exactly, and its outline is the crop patch's outline.
            //
            // Each planted tile is bound at build time to its NEAREST canal
            // cell(s) by Manhattan distance — all of them at that distance, not
            // just the first found — and turns the moment ANY of them wets, so
            // a tile lying between two ditches turns for whichever fills first
            // rather than waiting on one arbitrary winner.
            //
            // The wet tile is drawn with a RAGGED edge on every side facing land
            // that is still dry and a straight one where the wet region carries
            // on, and that mask is RE-CUT as neighbours catch up — an early tile
            // starts as a lone ragged patch and its sides straighten one by one.
            // Deciding the mask once at build would draw the finished patch's
            // outline from the first moment and the spread would read as a hard
            // square block growing.
            // The watering itself, played at the plant's base the moment its
            // canal arrives: a short splash that hands over to the damp soil
            // partway through, so the ground does not simply change colour on a
            // timer — you see the water land on it. One row of 128px frames.
            PLANT_WATER: {
                ENABLED: true,
                FILE:    'graphics/plant-water.png',
                FRAMES:  8,
                FPS:     6,     // halved from 12 — the whole splash now runs
                                // ~1.3s instead of ~0.67s
                SIZE:    1,     // width as a fraction of a tile
                Y:       0,     // offset from the cell centre, in tiles (+ is down)
                ANGLE_STEP: 0, // each splash is turned this many degrees further
                                // than the one before it — spawn 1 at 0, spawn 2
                                // at 45, and so on, wrapping at 360. Successive
                                // plants therefore never show the same splash
                                // twice in a row, from ONE 8-frame sheet.
                                //
                                // Free: a sprite's angle is one value in a
                                // transform that is computed either way, so this
                                // costs nothing per frame and does not break
                                // batching. The splash's content reaches 71px
                                // from the frame centre against a 90px corner,
                                // so it cannot clip or spill at any angle.
                                //
                                // 0 turns it off. Note the art is a splash at the
                                // stem, not a symmetrical burst — past about 20
                                // degrees the water starts to read as falling
                                // sideways, so judge it on screen.
                DAMP_AT: 4,     // 1-based frame the ground turns damp on. The
                                // splash has landed by here but is still playing,
                                // so the soil darkens UNDER the water rather than
                                // after it — the two read as one event
            },

            GROUND_WET: {
                ENABLED: true,
                AT:      0.15,      // canal fill fraction that counts as "the
                                    // water has arrived" — the same threshold
                                    // the crops start growing on (CROP_WET), so
                                    // soil and plant react to the same moment
                FADE_MS: 450,       // cross-fade into the wet tile. 0 = a hard
                                    // swap, which pops: a whole neighbourhood of
                                    // tiles can cross AT on the same frame
                // A whole row of plants shares one canal cell, so without this
                // they all take their splash on the SAME FRAME — a rank of
                // identical animations in lockstep, which reads as a mechanism
                // rather than as water spreading through soil. Each plant waits
                // its own moment inside this window first.
                //
                // The wait comes from the CELL'S HASH, not Math.random(): the
                // scene is rebuilt on every resize, and a true random would deal
                // the field a different order each time. This way a plant always
                // takes its turn at the same point.
                STAGGER_MS: [0, 700],

                // ── The field behind the patches ────────────────────────
                // Bare ground turns too, but AFTER the plant it surrounds and
                // more gently. Both used to key off the same canal threshold, so
                // they fired on one beat and the big quiet change competed with
                // the small loud one that actually matters.
                //
                // Sequenced instead: the plant's own soil turns under its splash,
                // then the field washes in behind it. The plant is the event; the
                // field is the aftermath.
                BARE: {
                    ENABLED:    true,
                    DELAY_MS:   [500, 1400],  // after its canal fills — well past
                                              // the plant's own moment
                    FADE_MS:    900,          // slower than the patches' 450, so
                                              // it reads as a wash and not a swap

                    // ── HOW FAR THE DAMP REACHES ────────────────────────
                    // The whole field — but never all at once, and that
                    // distinction is the whole of it.
                    //
                    // A field that turns wholesale says nothing about where the
                    // water went: the far corners change colour on the same beat
                    // as the bank, and the colour stops meaning "the water
                    // reached here" and starts meaning "the level is done". So
                    // the damp SPREADS. Every tile takes the canal cell nearest
                    // it and waits SPREAD_MS for each tile of ground between
                    // them, and the wash rolls out of each ditch as that ditch
                    // fills — the far corner is still dry while the bank turns,
                    // and arrives in its own time.
                    //
                    // Rings are in TILES, measured as a square ring (diagonals
                    // included, so a corner does not stay dry between two damp
                    // neighbours). Inside a ring there is no spread delay: the
                    // bank and the ground a plant is watered on turn with the
                    // water itself, because they ARE where the water got to.
                    CANAL_RING: 1,            // banks: the ditch's own margin
                    CROP_RING:  1,            // the ground each plant is watered on
                    WHOLE_FIELD: true,        // past the rings, keep going
                    SPREAD_MS:   110,         // per tile of ground from the ditch
                },
            },

            // ── THE LEVEL'S TALLY ───────────────────────────────────────────
            // What this farm is FOR, said in the farm itself: one cell per crop
            // it grows, its icon, and how many are still standing. Each produce
            // gathered flies here and knocks the number down — the Candy Crush
            // target counter, in world space.
            //
            // It is the same object as the roster strip at the top of the screen
            // and answers a different question. The roster is the RUN: what you
            // have restored so far, one slot a level, and it stays. This is the
            // LEVEL: what is left to do here, and it goes when the level does.
            //
            // ON THE BOUNDARY ABOVE THE FIELD, over the fence — outside the farm
            // it counts, so it never sits on the crops it is about. Left-aligned,
            // because the right of that line is where the machine climbs out.
            GOALS: {
                ENABLED:   true,
                // BIGGER ON A PHONE. Everything here is sized in TILES, and a
                // portrait tile is the smaller of the two (49px against 52) on a
                // screen held much further from the eye than a desktop one — so
                // a cell that reads at a glance on a monitor is a smudge on a
                // phone. Landscape is left alone.
                PORTRAIT_SCALE: 1.2,
                SIZE:      1.05,     // cell side, in tiles
                GAP:       0.08,     // between cells, in tiles
                MARGIN:    0.5,      // from the map's left edge, in tiles
                LIFT:      0.35,     // clear of the boundary line, in tiles
                // ...unless that would put it off the top of the screen. A tall
                // level nearly fills the view, so its top boundary sits at the
                // very edge and anything ABOVE that line — which the tally is,
                // by design — falls outside it. On a 20-row map the block was 72
                // px past the top and simply never seen.
                //
                // Pushed down into the field in that case, by the least that
                // brings it back. Short levels are untouched: they have a screen
                // of room above them.
                SCREEN_MARGIN: 0.25, // least clearance from the top, in tiles
                COLOR:      0xfffdf6, ALPHA: 0.9,
                DONE_COLOR: 0xc9d8b6,          // when its last one is in
                STROKE_COLOR: 0x5c4a33, STROKE_ALPHA: 0.85, STROKE_W: 2,
                RADIUS:    0.18,     // corner rounding, as a share of the side
                ICON_FRAC: 0.62,     // icon size inside the cell
                ICON_Y:   -0.10,     // ...nudged up, to leave room for the count
                COUNT_SIZE: 15,      // px @ design scale
                COUNT_COLOR: '#3a2c1c',
                COUNT_Y:   0.30,     // below the icon, in cell heights
                DEPTH:     4.2,      // over the fence and the actors, under the
                                     // dim — a dimmed level's tally should dim
                                     // with it
                // The produce's flight, after it has risen off the plant.
                FLY_MS:    620,
                FLY_ARC:   0.28,     // bow, as a share of the distance
                FLY_TO:    0.55,     // the size it shrinks to, against the cell
                POP:       1.22,     // the cell's kick as one lands
                POP_MS:    180,

                // ── DONE ────────────────────────────────────────────────
                // At zero the count goes and a tick takes its place. "0" is a
                // number the player still has to read and compare; a tick is a
                // state they can see without counting.
                //
                // ART, now that there is some. It was two drawn strokes while
                // there was no file for it; a drawing beats a construction —
                // it can have weight, a shadow, a shape that is not two
                // rectangles — and it costs one small texture.
                //
                // FIT, NOT STRETCH. The art is 64x48, so it is not square and a
                // square box would squash it. SIZE is the share of the cell it
                // may occupy, and the wider side takes that, the other following
                // the art's own aspect.
                TICK: {
                    FILE:   'graphics/ui/checkmark.png',
                    SIZE:    0.79,     // the tick's width, as a share of the cell
                    Y:      -0.04,     // nudge, in cell heights
                    POP_MS:  260,      // it swells in over the icon
                },
                FADE_MS:   420,      // when the level is done and it goes

                // ── THE LEVEL'S NUMBER ──────────────────────────────────
                // How far you have come, which nothing else on screen says. The
                // roster gives position WITHIN a block — five slots, filling —
                // and the block name says what the block is; neither counts.
                //
                // ABOVE THE TALLY, on its left, over the same left margin the
                // cells start from — so the name of the thing sits over the
                // thing, and the two read as one block belonging to this farm
                // rather than as two marks at opposite ends of a line.
                //
                // It comes up and goes with the light, like the tally, so only
                // ever one is on screen.
                NUMBER: {
                    ENABLED: true,
                    PREFIX: 'Level ',   // the word, in one place — empty it and
                                        // a bare numeral is left
                    SIZE:    15,        // px @ design scale
                    COLOR:  '#ffffff',
                    STROKE: '#2b2013',
                    STROKE_W: 4,
                    GAP:     0.12,      // above the cells, in tiles
                    ALPHA:   0.95,
                },
            },

            // ── The harvest ─────────────────────────────────────────────────
            // Stage 5 is the FRUIT LAID OVER the stage-4 plant, drawn as its own
            // sprite for exactly this reason: the fruit can be taken and the
            // plant left standing. Picking it is that sprite coming off.
            //
            // BOTH KINDS OF YIELD. A fruit crop hangs its produce on the plant
            // at the last stage and picking it is that sprite leaving. A ROOT
            // keeps its yield underground and draws nothing until it is pulled —
            // its art is the last frame of the sheet, the vegetable out of the
            // ground — so the pick is what creates it. Either way the plant
            // stays standing and the field does not go bare.
            //
            // It runs when the FIELD is in, not when each plant reaches stage 5.
            // Per-plant, the first fruit would be picked while the last was
            // still a seed and the farm would never once be seen fruited — and
            // the roster icon, which flies off a plant, would be leaving a bare
            // one. The field ripens, the farmer jumps, then he walks it and
            // takes the fruit off as he goes (FARMER.HARVEST).
            CROP_HARVEST: {
                ENABLED:   true,
                // A fruit is not picked the instant it appears — but nothing
                // here enforces that any more. FARMER.HARVEST.MAX_HOLD_MS does
                // it from the other end: a fruit stands until the oldest on the
                // farm has waited its five seconds, which is the same delay
                // expressed once, in the place that decides when he works.
                RISE:      1.2,        // how far it lifts, in tiles. Well clear
                                       // of the plant it came off: at half a
                                       // tile the yield fades out still level
                                       // with the leaves it was hanging in, so
                                       // it reads as dissolving rather than as
                                       // being carried away
                DRIFT:     0.18,       // sideways wander, in tiles — a pick is
                                       // never straight up
                POP:       1.25,       // it swells as it comes free, then goes
                MS:        520,
                EASE:     'Sine.easeOut',
                SHAKE:     0.7,        // how hard the plant is knocked as its
                                       // fruit comes off, against CROP_SWAY's
                                       // LEAN_DEG. 0 leaves the plant still
            },

            // ── Crops ───────────────────────────────────────────────────────
            // A crop grows on every cell marked on the map's crop layer. Its
            // seed shows from the start; when the water reaches that cell's
            // NEAREST canal cell it grows through the stages, one every
            // CROP_GROW_MS. Art is one sheet per crop, a single row of frames
            // CROP_FRAME_W wide, sliced at build.
            //
            // WHICH crop a level grows is not here — it is bound to the level
            // itself in levels.js. Everything below is how a crop BEHAVES, and
            // applies to all of them.

            // WHICH CROP GROWS WHERE is no longer a list of its own — it is
            // a property of each level in levels.js. Nothing here needs to know
            // the running order any more.

            // ── How a sheet is read ─────────────────────────────────────────
            // Every frame is CROP_FRAME_W wide by the sheet's full height, so the
            // NUMBER of frames varies per crop and is counted from the image
            // rather than assumed. What those frames mean depends on the crop's
            // class:
            //
            //   normal   [growth x4][fruit]
            //            The fruit is its OWN frame now, not baked into a copy of
            //            stage 4. At the last stage it is drawn OVER the stage-4
            //            body instead of replacing it — which is what makes a
            //            harvest possible later: the fruit can be taken away and
            //            leave the plant standing.
            //
            //   trellis  [growth][fruit][support]      hops, green-beans
            //            The support is the LAST frame and is drawn BEHIND the
            //            plant, once, and never touched again. It used to be
            //            baked into every stage, so the stakes sprang and
            //            stretched along with the plant at each stage change —
            //            a fixed structure has no business doing that.
            //
            //   root     [growth x5][harvest]          carrot
            //            Only the leaves show while it grows; the root is buried.
            //            The extra frame is the vegetable ALONE, for showing what
            //            was pulled up. It is never drawn during growth.
            //
            // Growth frames are whatever is left after the class's extra frames
            // are taken off the end, so a crop with five distinct bodies and one
            // with four both work: the last stage simply reuses the last body it
            // has. Adding a beetroot means dropping in a sheet and tagging it
            // 'root' — no code, and no per-crop frame table.
            CROP_FRAME_W: 128,
            // Where the sheets live and how each one's frames are read — the
            // crop LIBRARY in levels.js. A dictionary, not a running order.
            CROP_DIR:   LEVEL_DATA.CROP_LIBRARY.DIR,
            CROP_EXT:   LEVEL_DATA.CROP_LIBRARY.EXT,
            CROP_CLASS:  LEVEL_DATA.CROP_LIBRARY.CLASS,
            // What each class changes — size, tilled patch, sway, stage spread.
            // Asked for by trait, never by class name, so a new class is data.
            CROP_TRAITS: LEVEL_DATA.CROP_LIBRARY.CLASS_TRAITS,
            CROP_SCALE:  LEVEL_DATA.CROP_LIBRARY.SCALE,
            // Where the extra pieces sit against the plant's own depth. The
            // support must be behind it and the fruit in front, and both are
            // hairline offsets so nothing else in the depth band is disturbed.
            CROP_SUPPORT_BIAS: -0.0003,
            CROP_FRUIT_BIAS:    0.0003,
            CROP:         'tomato',      // last-resort crop, if no level names one
            // How big each stage stands, as a multiple of one tile. A mature
            // plant confined to its own cell — leaves stopping dead on the tile
            // boundary — reads as a diagram rather than a field, so the last two
            // stages spill over their neighbours the way real foliage does.
            //
            // Scaling rather than re-drawing wider costs nothing: the art is
            // 128px drawn at roughly half that, so 1.2x is still downsampling and
            // nothing softens. The stem is anchored at the plant's base, so the
            // extra size grows UP and OUT from where it is rooted rather than
            // moving the plant.
            // Vegetables only. A crop of CLASS 'tree' ignores this and stands
            // the same size at every stage.
            CROP_STAGE_SCALE: [1, 1, 1, 1.3, 1.3],
            CROP_STAGES:  5,
            CROP_GROW_MS: 1000,     // time between growth stages
            CROP_WET:     0.15,     // canal-cell fill fraction that counts as "watered"

            // A patch of worked soil under each plant (graphics/plant-base.png),
            // centred on the stem base and drawn UNDER the plant — and under
            // every other plant too, so a base can never cover the crop in front
            // of it.
            // The worked patch a plant stands in. It is a FULL TILE from the
            // terrain sheet's tilled row, not a small stamp — so the patch is
            // cut to the shape of the planted area, ragged where it meets bare
            // ground and straight where the next planted cell carries it on.
            // The mask is fixed at build: tilling happens before any water, and
            // the patch's outline never changes afterwards — only its colour,
            // when the water arrives.
            // ── PASTURE ─────────────────────────────────────────────────────
            // Grass is not a crop in the way the others are, and the difference
            // is worth drawing: it is turf, not a worked plot.
            //
            // NO TILLED PATCH. The brown furrowed square under every plant is
            // the loudest "vegetable plot" signal the game has, and a pasture
            // has none of it. Turning it off is what makes a cow level read as
            // grazing land the moment it is watered, before a single animal
            // appears — and it keeps a potato field under a pig farm looking
            // properly cultivated, which it should, because it is.
            //
            // SCATTERED, NOT PLANTED. Other crops sit dead centre in their cell,
            // which is right for rows someone dug. Grass grows where it lands,
            // so it is offset within its cell — and some cells carry TWO, so the
            // sward thickens and thins instead of reading as a grid at one
            // plant per square.
            PASTURE: {
                JITTER: 0.32,    // offset from the cell's centre, in tiles, each
                                 // axis. Past ~0.4 plants start crossing into
                                 // neighbouring cells and the field loses its
                                 // shape entirely
                EXTRA:  0.2,     // this share again, dropped into cells that
                                 // already have one — 20% more plants, gathered
                                 // into clumps rather than spread evenly
            },

            CROP_BASE: {
                ENABLED: true,
                ALPHA:   1,
            },

            // ── Per-plant variation ──────────────────────────────────────
            // One crop sheet stamped across a field reads as wallpaper. These
            // break that up WITHOUT moving anything: a plant stays dead centre
            // in its cell, so the rows stay ruler-straight. Every value is drawn
            // from a hash of the cell, not Math.random(), so the field looks
            // identical each time the scene is rebuilt (it rebuilds on every
            // window resize).
            CROP_VARY: {
                FLIP:      true,    // mirror half the plants. Safe for this art —
                                    // its shadow is centred under the stem, so a
                                    // flip does not light it from the wrong side.
                                    // Re-check that before swapping the art
                SCALE_VAR: 0.04,    // ± size spread. Applied to the plant's CACHED
                                    // scale, so the stage-change spring settles
                                    // back to this plant's size, not a shared one
                GROW_VAR:  0.18,    // ± spread on how long each stage takes. The
                                    // strongest of the three: a patch that hits
                                    // every stage in lockstep is what really
                                    // reads as stamped
                ROT_DEG:   0,       // ± tilt about the stem base. 2-3 is plenty
                                    // if the field still looks too regular
            },
            // Each new stage after the seed springs up instead of popping in:
            // the frame swaps, then y-scale eases from CROP_POP_FROM to full.
            // Sprites are bottom-anchored, so this reads as growing upward.
            CROP_POP_FROM: 0.9,     // starting y-scale fraction (1 = no animation)
            CROP_POP_MS:   260,     // spring duration
            // ── Brushing past ───────────────────────────────────────────
            // A plant rocks when the farmer walks through its cell. It is a
            // damped spring on the sprite's ANGLE, and it is close to free:
            // rotation is recomputed every frame anyway, unlike depth, which
            // dirties the whole display list and forces a re-sort.
            //
            // It pivots at the stem base because that is already the sprite's
            // origin (CROP_STEM_Y), so the plant bends where it meets the soil
            // instead of spinning about its middle.
            //
            // Tuned in real units rather than raw spring constants: HZ is how
            // fast it wobbles, DAMP is how quickly that dies away (below 1 it
            // oscillates; at 1 it just returns), and LEAN_DEG is how far it goes
            // over on the first swing.
            CROP_SWAY: {
                ENABLED:   true,
                LEAN_DEG:  11,      // peak lean at the moment of contact
                HZ:        2.2,     // wobbles per second
                DAMP:      0.32,    // 0 = rings forever, 1 = no overshoot
                MIN_STAGE: 2,       // never a seed — it is a dot on the soil

                // HOW a crop shakes is its class's business — a stem BENDS, a
                // tree SQUASHES (see CLASS_TRAITS in levels.js). Both ride the
                // same spring, so HZ and DAMP still decide how it rings; these
                // two only give the squash its shape.
                //
                // WHY A TREE DOES NOT BEND. Bending rotates the sprite about the
                // stem origin, and the art's shadow lies BELOW that origin and
                // spreads wide — so a small angle swings the shadow's far edge a
                // long way and the tree reads as lifting off the ground. Scaling
                // about the same point barely moves it: the shadow sits close to
                // the origin, while the canopy is the whole frame away from it
                // and does all the moving. It is also the truer motion — a
                // picked tree shakes its canopy, it does not tip over.
                SQUASH_PCT:  9,     // peak shortening, as a % of the plant's height
                SQUASH_WIDE: 0.55,  // how much of that goes sideways. 0 = pure squash
            },
            // Where the plant's STEM meets the ground, as a fraction of the
            // frame height. Not 1: the art carries a blurred elliptical shadow
            // below the stem, so the stem base sits 230px down a 256px frame
            // with the shadow filling the rest. This is the sprite's origin, so
            // it is the stem — not the frame's bottom edge — that lands on the
            // cell centre, and the growth spring pins there too.
            CROP_STEM_Y: 230 / 256,
            // The ground under a plant changes as it matures. Each entry ADDS a
            // transparent perlin overlay on top of the map's own ground tile —
            // nothing is replaced and nothing is removed, so by the last stage a
            // cell is ground + damp + grass, all three visible. `frame` is a
            // tilesheet FRAME index (not a map gid); the key is the crop stage
            // that adds it. Cells with no crop are never touched.
            //
            // Blend modes differ on purpose:
            //   MULTIPLY for damp — wet soil is the SAME soil darkened, so
            //     multiplying keeps the ground's grain showing through and
            //     adapts to whatever ground tile sits below it
            //   NORMAL for grass — grass is new material lying on the soil,
            //     not a darkening of it, so it should cover rather than tint
            // Frames are on the TERRAIN sheet, not the canal one. `frame` is the
            // FIRST of six consecutive edge variants — see CROP_OVERLAY_EDGES.
            CROP_OVERLAY_ENABLED: false,
                                    // TEMPORARILY OFF — the damp and mossy
                                    // patches are hidden while the watered
                                    // GROUND tile (GROUND_WET) is being judged
                                    // on its own; the two were stacking on the
                                    // same cells. The definitions below are kept
                                    // intact: flip this back to true to restore
                                    // them exactly as they were.
            CROP_OVERLAY: {
                2: { frame: 18, blend: 'MULTIPLY', alpha: 1 },   // damp  — row 4
                4: { frame: 24, blend: 'NORMAL',   alpha: 1 },   // mossy — row 5
            },
            // Each overlay is drawn with a RAGGED edge where it borders bare
            // ground and a straight one where it meets another overlay cell, so
            // a patch gets an organic outline and a seamless interior. The six
            // variants run left to right from the base frame; this lists which
            // sides each draws ragged, as an N/E/S/W bitmask (N=1 E=2 S=4 W=8):
            //   inner=0  n=1  ne=3  ns=5  nes=7  nesw=15
            // All 16 possible situations are covered by ROTATING one of these.
            // No flipped versions are needed, and a flip would mirror the
            // organic noise into a visible reflection.
            CROP_OVERLAY_EDGES: [0, 1, 3, 5, 7, 15],
                                    // (the flow head's water now comes from
                                    // TERRAIN_WATER above, not the canal sheet)
            SPLIT_AT:     0.6,     // how far the water must get into a junction
                                    // tile before a side branch starts, as a
                                    // fraction of the tile.
                                    //
                                    // 0.5 is the tile's CENTRE, where every arm
                                    // of a canal piece meets — the floor for this
                                    // value, not a preference. Below it the next
                                    // cell starts while the arm feeding it is
                                    // still dry, leaving a gap of unwatered
                                    // channel between the two: most visible on a
                                    // bend, whose only exit counts as a side arm
                                    // and so always fires early.
                                    //
                                    // Above 0.5 the arm is already wet and the
                                    // branch simply waits, which reads as the
                                    // water taking a moment to turn. 0.75 is
                                    // three quarters across — arm well filled
                                    // before anything leaves it.
                                    //
                                    // It was 0.3 while the head existed: the head
                                    // bulged ahead of the revealed edge, so at 0.3
                                    // the VISIBLE front was already near the
                                    // centre. With the head gone the crop line is
                                    // the front, and the threshold has to match
                                    // the geometry.
            // ── Bank shimmer ────────────────────────────────────────────────
            // Once a cell has finished filling, a few small light streaks sit
            // just inside the water at its edges and slowly fade up and down.
            // It is the settled water's only animation and it does most of the
            // work of making a still canal look alive — cheap, because the
            // streaks never move: only their brightness changes.
            MARK_ENABLED: false,    // TEMPORARILY OFF — the streaks read as white
                                    // lines lying across the water rather than
                                    // as glints in it. Everything below is left
                                    // tuned as it was, so this is the only line
                                    // to change to bring them back.
            // Two rows of streaks per bank. The outer row sits against the
            // water's edge and carries the effect; the inner row is a sparse
            // scatter a little further in, which stops the outer one reading as
            // a line ruled down the bank. Each entry: how far out as a fraction
            // of the channel's half width (1 = on the water's edge, 0 = the
            // centreline), the chance any one arm-side gets a streak, and the
            // streak's size as fractions of a tile.
            // Insets leave clear water on BOTH sides of each row: the outer row
            // stands off the bank rather than hugging it, and the inner row
            // stands off the outer one. Streaks touching the bank read as an
            // edging painted on the canal instead of light floating on it.
            // Insets are measured to the streak's CENTRE, so its own thickness
            // eats into the gaps either side of it. Budget across the channel's
            // half width (0.225 tile), from the bank inward:
            //   bank → 0.030 clear → row 1 (0.055 thick) → 0.040 clear →
            //   row 2 (0.045 thick) → the rest is open water to the centreline
            // Thin rows are what make room for the gaps to be visible at all —
            // there is only ~10px of half-channel on screen to work with.
            MARK_LAYERS: [
                { inset: 0.74, chance: 0.34, len: 0.60, thick: 0.055 },
                { inset: 0.34, chance: 0.13, len: 0.36, thick: 0.045 },
            ],
            // STEPPED, not smooth. Every value below snaps between a handful of
            // fixed states and holds, the way a hand-drawn pixel animation
            // cycles frames — no easing, no interpolation. Brightness, drift and
            // colour each run their own cycle at their own rate, so a streak
            // rarely changes two things at once and the field never falls into
            // a visible rhythm.
            MARK_MIN:     0.15,     // dimmest state — never fully off
            MARK_MAX:     0.70,     // brightest state
            MARK_LEVELS:  4,        // how many brightness states to snap between
            // Cycle times are for a WHOLE cycle, and a cycle is several steps —
            // brightness at 4 levels is 6 steps up and back, so a 5s cycle
            // holds each state for a bit over 800ms. That slowness is the
            // point: a stepped animation that changes quickly reads as flicker.
            MARK_MS_MIN:  4000,     // time for one full brightness cycle,
            MARK_MS_MAX:  7000,     // randomised per streak
            MARK_FADE_MS: 500,      // ease-in when a cell first settles (the one
                                    // deliberately smooth part — a streak that
                                    // popped into existence would read as a bug)
            MARK_DRIFT:   0.03,     // lateral travel ALONG the bank, fraction of
                                    // a tile — the extreme of the jump, not a
                                    // smooth slide
            MARK_DRIFT_STEPS: 3,    // discrete positions: back, centre, forward
            MARK_DRIFT_MS: 6000,    // one full drift cycle, per streak ±25%
            // Snaps between these in order and back again. Never pure white —
            // that reads as UI rather than as light on water.
            MARK_COLORS: [0xeaf6fb, 0xbfe8f7, 0x9fdcf2],
            MARK_COLOR_MS: 7500,    // colour cycle, deliberately out of step
                                    // with the brightness so they never align
            // Measured off the art, NOT the same as CHANNEL_FRAC below: the
            // painted water spans ~0.45 of a tile in a branch tile, and the
            // main canal's outer water edge sits ~0.19 tile from each of its
            // two columns' centres. Streaks are placed against these.
            MARK_CHAN:    0.45,     // painted branch water width, tile fraction
            MARK_MAIN:    0.19,     // main canal outer edge, from cell centre
            CHANNEL_FRAC: 0.5,      // water-channel width as a fraction of a tile
                                    // (the gap between the banks in the art). The
                                    // head is sized to this so it fits the walls;
                                    // the 2-wide main gets (mainW-1+frac) tiles,
                                    // since only its two OUTER walls eat in
            HEAD_FIT: 0.94,         // head width × this, so it sits just inside the
                                    // banks and the art's white waterline still
                                    // shows around it
            HEAD_LEN: 0,            // the head's WATER bulge (the body behind the
                                    // foam), measured ALONG the flow, as a fraction
                                    // of the channel width. Across the channel it
                                    // always spans the full width — this only
                                    // shortens how far it reaches forward, i.e. how
                                    // far the drawn front runs ahead of the water
                                    // that has actually been revealed
            // The front is TWO rounded clusters, both drawn BEHIND the revealed
            // water tile (depths 1.525 / 1.53 vs the tile's 1.55), so each is
            // clipped by the tile and only the part poking past its straight
            // crop edge is seen:
            //   • white blobs  — the foam crest, straddling the reveal edge so
            //     half sits on revealed water and half runs ahead of it
            //   • water blobs  — the same cluster copied FOAM_WATER_BACK behind
            //     the white one, so a curved water edge shows between the foam
            //     and the tile instead of the tile's straight cut
            // Opacity of the moving front. The trencher's belt sits just under
            // these (see TUNNEL.TRENCHER depths), so knocking them back lets
            // the machine read THROUGH the water rolling over it. Applied when
            // a pooled sprite is first created — like FOAM_ABOVE, a change
            // takes a reload, so the display list is never dirtied per frame.
            // Where the MAIN canal's water sits in the stack. Above the crops
            // (~3.02) so the trencher can be drawn over the whole field and
            // still run under its own water. Branch water is unaffected — it
            // stays down in the ground layers, where a leaf overhanging a ditch
            // is meant to cover it.
            MAIN_DRY_DEPTH:   3.03, // the dug trench, before water. It used to sit
                                    // down at 1.52 with the ground and branches,
                                    // which was fine until South Lake: the lake's
                                    // basin covers everything below it, so the
                                    // trench cut through the lake's top row was
                                    // buried. It now sits just ABOVE the basin
                                    // (3.02) and just BELOW the torn lip (3.04)
                                    // and the machine — the trench is in the
                                    // ground, the machine rides over it.
                                    //
                                    // Safe above the crops for the same reason
                                    // MAIN_WATER_DEPTH already is: crop art is one
                                    // tile wide and a main cell's neighbours along
                                    // the canal are canal too, so no plant ever
                                    // overlaps one.
            MAIN_WATER_DEPTH: 3.10,

            // The moving front. OFF: the water is simply the tile art being
            // uncovered, which follows every bend in the channel because it IS
            // the channel. The head was a sprite laid across the front, so a
            // tile where the channel turns had it lying over a bank — the turn
            // happens inside the tile and the head has no way to know.
            HEAD_ENABLED: false,

            HEAD_ALPHA:  0.75,      // the head — the water tongue at the front
            CREST_ALPHA: 0.75,      // the foam crest blobs (white + water copy)
            FOAM_ABOVE: false,      // draw the crest ABOVE the revealed tile
                                    // (1.56/1.565) instead of below it
                                    // (1.525/1.53). Above, the whole blob shows
                                    // and rides over the revealed water instead
                                    // of being cut by its straight edge
            FOAM_WATER: true,       // draw the trailing water-textured copy
            FOAM_WATER_BACK: 0.0625, // how far behind the white cluster it sits.
                                    // Smaller = the water copy rides further
                                    // forward over the white one, leaving a
                                    // thinner rim of foam showing at the crest
            // Crest shape, all in units of the channel width. The leading tip
            // sits FOAM_FWD + FOAM_ARC + FOAM_ACROSS*FOAM_LONG/2 ahead of the
            // revealed water edge.
            FOAM_LONG:   2.0,       // blob stretch ALONG the flow (NOT across —
                                    // that is FOAM_ACROSS). Long enough that the
                                    // blob's tail always runs back UNDER the
                                    // revealed tile: as the crest animates, a
                                    // short blob leaves a bare gap between itself
                                    // and the tile edge and the front breaks into
                                    // pieces. With the tail buried there is no
                                    // gap to see and the front reads as one mass
            FOAM_ARC:    0.30,      // depth of the forward bow at the channel
                                    // centre — this is the arc itself, keep it
            FOAM_FWD:   -0.40,      // whole cluster shifted ahead of the edge.
                                    // NEGATIVE pulls it back. Holds the leading
                                    // tip at 0.40*chW: the blob grew by 0.25 at
                                    // BOTH ends, so this cancels the forward half
                                    // and spends the whole gain on the buried tail
            FOAM_ACROSS: 0.5,       // blob diameter across the channel
            FOAM_EDGE_CALM: 1,      // how much the churn is damped toward the two
                                    // banks. 1 = the outermost blobs never move
                                    // or shrink, so the foam stays welded to both
                                    // walls while the middle still churns.
                                    // 0 = every blob animates equally (old look,
                                    // where the ends pull back off the wall and
                                    // the water looks briefly detached from it)
            FOAM_SPREAD: 0.35,      // how far out the outermost blob centres sit
                                    // from the channel centre. Raise it if the
                                    // foam still fails to reach the walls
            FLOW_OFFSET: 1,         // the water-FILLED version of a tile sits this
                                    // many frames after it in the sheet (dry then
                                    // wet, left→right, top→bottom)
            FLOW_SPEED: 60,         // branch-water speed (px/s @ platformScale).
                                    // 0 = match the main canal (WATER.MIN_SPEED).
                                    // Doubled from 30: a branch is a narrow ditch
                                    // off a full canal, so it should fill quicker
                                    // than the main run, not at the same pace.
                                    // Independent of the main canal's speed on
                                    // purpose — set to 0 to re-couple them.
            END_FILL: 0.8,          // a dead-end tile's channel closes inside it,
                                    // so water fills only this fraction of the
                                    // tile (up to the closing), not the full edge
            HEAD_END_STOP: 0.5,     // on a dead-end tile the head stops at this
                                    // fraction (its foam would otherwise bulge
                                    // over the rounded closing); the water still
                                    // fills quietly on to END_FILL

            // Layer order in the .tmj, bottom to top. Every level map carries
            // these four, named exactly this. GROUND and BRANCH are drawn as
            // soon as the band is built; MAIN is held back and revealed as the
            // auger digs. CROPS is a MARKER layer — never drawn, it only says
            // which cells grow a crop, one plant at each marked cell's centre.
            // Any gid works as the marker (only non-zero is tested).
            GROUND_LAYER: 'ground',        // plain land, under everything
            BRANCH_LAYER: 'branch',        // dry branch canals (always shown)
            MAIN_LAYER: 'main',            // main canal, revealed as it's dug
            CROPS_LAYER: ['crop', 'crops'],// marker only — where crops spawn.
                                           // A LIST because the maps disagree:
                                           // the Tiled project was rebuilt and
                                           // names it "crop", while the earlier
                                           // maps still in the rotation say
                                           // "crops". First match wins, so both
                                           // load. Any layer name here may be a
                                           // list; a plain string still works.

            // gid → meaning. The gid is the number Tiled shows when you hover a
            // tile. conn = open edges (any of n/e/s/w). main = 'L'/'R' half of
            // the 2-wide main canal (main-canal tiles only). Tiles with no entry
            // (e.g. grass 55) are treated as non-canal.
            TILES: {
                // gid → what that canal piece IS. The key is the tile's position
                // in the canal sheet counting from 1 — which is also the gid Tiled
                // shows when that sheet is first in a map — so the same entry
                // serves any sheet holding this art, wherever its gids start.
                //
                // conn = the edges the channel opens onto, so the flood knows
                // where water can leave. main = which half of the two-cell main
                // canal: L is the west half, R the east.
                //
                // Taken from the sheet's own tile names: the letters after the
                // last underscore ARE the openings, which is why every entry here
                // matches its comment. Only DRY tiles are listed — each one's
                // water twin is the very next frame (FLOW_OFFSET), so it needs no
                // entry of its own.
                //
                // Sizes: main is two cells across, branch one, minor one with a
                // half-width channel. The flood treats branch and minor alike;
                // only main is special, because the dig runs down it.
                // ── branch — one cell wide ──────────────────────────────
                1:  { conn: 'es' },              // branch_es
                3:  { conn: 'esw' },             // branch_esw
                5:  { conn: 'ew' },              // branch_ew
                7:  { conn: 'ne' },              // branch_ne
                9:  { conn: 'nes' },             // branch_nes
                11: { conn: 'nesw' },            // branch_nesw
                13: { conn: 'new' },             // branch_new
                15: { conn: 'ns' },              // branch_ns
                17: { conn: 'nsw' },             // branch_nsw
                19: { conn: 'nw' },              // branch_nw
                21: { conn: 'sw' },              // branch_sw
                23: { conn: 'e' },               // branch_e
                25: { conn: 'n' },               // branch_n
                27: { conn: 's' },               // branch_s
                29: { conn: 'w' },               // branch_w
                // ── main — two cells wide, L is the west half and R the east 
                31: { conn: 'n', main: 'L' },    // main_e_n
                33: { conn: 'ns', main: 'L' },   // main_e_ns
                35: { conn: 'nsw', main: 'L' },  // main_e_nsw
                37: { conn: 'nw', main: 'L' },   // main_e_nw
                39: { conn: 's', main: 'L' },    // main_e_s
                41: { conn: 'sw', main: 'L' },   // main_e_sw
                43: { conn: 'es', main: 'R' },   // main_w_es
                45: { conn: 'n', main: 'R' },    // main_w_n
                47: { conn: 'ne', main: 'R' },   // main_w_ne
                49: { conn: 'nes', main: 'R' },  // main_w_nes
                51: { conn: 'ns', main: 'R' },   // main_w_ns
                53: { conn: 's', main: 'R' },    // main_w_s
                // ── where two sizes meet ────────────────────────────────
                55: { conn: 'nsw', main: 'L' },  // MainV2MinorH_Dry_e_nsw
                57: { conn: 'nes', main: 'R' },  // MainV2MinorH_Dry_w_nes
                59: { conn: 'nsw' },             // BranchV2MinorH_Dry_nsw
                61: { conn: 'nes' },             // BranchV2MinorH_Dry_nes
                63: { conn: 'nesw' },            // BranchV2MinorH_Dry_nesw
                65: { conn: 'new' },             // BranchH2MinorV_Dry_new
                67: { conn: 'esw' },             // BranchH2MinorV_Dry_esw
                69: { conn: 'nesw' },            // BranchH2MinorV_Dry_nesw
                // ── minor — one cell, half-width channel ────────────────
                71: { conn: 'e' },               // minor_e
                73: { conn: 'w' },               // minor_w
                75: { conn: 's' },               // minor_s
                77: { conn: 'n' },               // minor_n
                79: { conn: 'es' },              // minor_es
                81: { conn: 'ew' },              // minor_ew
                83: { conn: 'esw' },             // minor_esw
                85: { conn: 'sw' },              // minor_sw
                87: { conn: 'ns' },              // minor_ns
                89: { conn: 'nes' },             // minor_nes
                91: { conn: 'nesw' },            // minor_nesw
                93: { conn: 'nsw' },             // minor_nsw
                95: { conn: 'ne' },              // minor_ne
                97: { conn: 'new' },             // minor_new
                99: { conn: 'nw' },
                // A FLARED PAIR — canal.tsx's newest tiles. The left turns from
                // west to north, the right from east to north, so a channel drawn
                // with them opens out rather than stopping at a square edge.
                //
                // Nothing paints them yet. They are described anyway because an
                // UNDESCRIBED canal tile fails silently: it draws, and then the
                // water refuses to enter it with no error anywhere.
                //
                // `main` is documentation here as everywhere — only `conn` is
                // read — but it records which half of a two-wide channel each is.
                101: { conn: 'nw', main: 'L' },
                103: { conn: 'ne', main: 'R' },              // minor_nw
            },
        },

        // ── South Lake ────────────────────────────────────────────────────
        // The world's one water source, at the very bottom of level 1. Only its
        // NORTH BANK is drawn — the water runs off the bottom and sides of the
        // frame, which is what says "this is big" without drawing any of it.
        //
        // Two images, same size, exactly overlaid: the dry basin (bank + floor)
        // and the water alone. The machine is sandwiched BETWEEN them, so its
        // belt sits in the basin with water drawn over it — dipped in the lake,
        // ready to cut inland.
        //
        // The dig starts START_ROW tiles below the lake's top edge, so the
        // machine begins on the bank and level 1's first canal tile lands on the
        // lake's top row — the canal is joined to the lake, not merely near it.
        LAKE: {
            // BUILT FROM TILES out of the terrain sheet, which is loaded anyway,
            // so the lake costs no texture memory at all. It used to be two 22x7
            // paintings — the basin and the water — worth about 19MB between
            // them, for something on screen only while the first level is.
            //
            // SEVEN ROWS, and the last one is shared. Six are open water running
            // off the foot of the screen; the seventh is LEVEL 1'S OWN BOTTOM
            // ROW, where the lake and the farm meet. On that row three things
            // stack over the level's ground: the bank, then the machine, then
            // the water's edge — so the rig starts its first trench standing on
            // the shore with the shallows washing over its feet.
            //
            // That stack is the whole reason the bank and the edge are separate
            // tiles. One tile could not have the machine inside it.
            ENABLED: true,
            ROWS:      7,      // total height in tiles, the shared row included
            START_ROW: 1,      // the overlap with level 1 — 1 makes that seventh
                               // row the shared one, and is also where the dig
                               // line lands, since the dig starts at the grid's
                               // bottom edge
            // Frames in the terrain sheet's first row.
            WATER_FRAME: 1,    // col 2 — open water
            BANK_FRAME:  3,    // col 4 — the shore
            EDGE_FRAME:  4,    // col 5 — the water's edge, laid over the shore
            // The six open rows overlap nothing, so one depth does. The shared
            // row's two tiles STRADDLE THE MACHINE (3.05-3.07): the bank passes
            // under it, the edge over it.
            DEPTH:      3.11,
            BANK_DEPTH: 3.00,
            // THE EDGE GOES BETWEEN THE TRENCH AND ITS WATER, which is the one
            // place that satisfies everything at once:
            //
            //   3.00  bank            the shore
            //   3.03  canal DRY       the cut, over the bank but UNDER the lake
            //   3.05  machine         standing in its cut
            //   3.08  lake EDGE       shallows washing over the rig and the dry
            //                         trench — so the mouth reads as under water
            //   3.10  canal WATER     over the lake: the canal's own water is
            //                         what joins the two, so it must not be
            //                         washed out by the thing it joins to
            //
            // The dry mouth therefore lies beneath the lake until the water
            // reaches it, and surfaces as it fills — which is the reveal doing
            // the work rather than a depth trick.
            EDGE_DEPTH: 3.08,
            // HOW SOLID THE WATER IS, ROW BY ROW from the shore down. One
            // entry per row, listed rather than derived: a curve would have to
            // be described by numbers that are harder to read than the four
            // values themselves, and these get retuned by eye.
            //
            // THINNEST AT THE BANK, thickening with depth. The shore row lies
            // over the bank tile, so the ground reads through it the way the
            // canal's water reads its trench, and the bed appears to fall away
            // as the water closes over it.
            //
            // Rows past the end of the list are left exactly as the sprite was
            // drawn, so the open water is fully solid.
            ROW_ALPHA: [0.8, 0.85, 0.9, 0.95],

            // ── LILIES ON THE LAKE ──────────────────────────────────────
            // COMPOSED, not scattered. The canal's lilies (ROAD.LILY) are
            // placed by rule as the water reaches each stretch, which suits a
            // ditch — one pad here, a clump there, nobody looking. The lake is
            // the opening shot and holds still, so its pads are arranged in
            // Tiled and read back exactly as drawn: clusters, a flower on a
            // particular pad, clear water where the canal mouth opens. None of
            // that is expressible as a scatter rule.
            //
            // The map carries everything. Each object's SIZE is its scale (a
            // 180px object off a 128px tile is 1.4x, authored by dragging), and
            // the LAYER ORDER is the draw order — pads under flowers — so
            // neither needs a number here.
            LILIES: {
                ENABLED: true,
                MAP:     'maps/lily/lily.tmj',
                SHEET:   'graphics/tilesheets/lily.webp',
                FRAME:   128,        // one cell of the sheet, 3 across
                DEPTH:   3.13,       // over the lake's water (3.11)
                LAYER_STEP: 0.005,   // each object layer above the one before

                // ── THE SWELL ───────────────────────────────────────────
                // Water is never still, and a pond of pads holding position
                // exactly is the one thing that says "picture" rather than
                // "lake". They rock about where they were placed — never away
                // from it: the whole travel is AMP of a tile, about four pixels,
                // which is a nudge and not a drift.
                //
                // ALL AS ONE. Every pad and every flower takes the same offset
                // on the same frame — it is the whole surface lifting, not each
                // lily bobbing on its own errand. It also holds a flower and the
                // pad beneath it exactly together, which nothing else has to
                // arrange: they are separate objects that simply never move
                // apart.
                //
                // TWO RHYTHMS is what keeps that from being a metronome. At HZ
                // alone the motion is a pure sine and the eye has the loop in
                // about four seconds; a second, quieter one at an unrelated rate
                // makes the swing wander and the pair only realign every seven.
                SWAY: {
                    ENABLED: true,
                    HZ:      0.26,     // the slow swell
                    HZ2:     0.41,     // the second rhythm over it
                    MIX:     0.28,     // how much of the motion is the second one
                    DIR_DEG: 14,       // which way the water is moving
                    AMP:     0.09,     // travel, in tiles — a nudge, not a drift
                    TILT:    1.7,      // degrees of roll at the extremes
                },
            },
        },

        // ── The channel ───────────────────────────────────────────────────
        CANAL: {
            WIDTH:       40.8,     // channel width (px @ platformScale)
            HEAD_OFFSET: 108,      // the built canal's head — where the machine
                                   // parks and the dig starts — sits this far
                                   // above the band's centre line
        },

        TUNNEL: {
            ENABLED: true,

            // ── Digging ───────────────────────────────────────────────────
            // ── Power delivery ────────────────────────────────────────────
            // Charge is POWER now, not distance. It used to convert straight to
            // pixels at a flat rate, which meant nothing resisted it and dig
            // speed tracked the battery ladder up forever — 1.7 tiles/sec at
            // battery 3, 223 at battery 15, an 8-row level cut in 0.04s.
            //
            // Two limits now decide how fast the machine moves, and it obeys
            // whichever is tighter:
            //
            //   ENERGY      power / hardness  — you cannot cut faster than the
            //               batteries can pay for
            //   MECHANICAL  MAX_SPEED — the machine cannot travel
            //               faster than that, however much power you feed it
            //
            // They are blended smoothly rather than hard-clamped, so approaching
            // the machine's limit reads as bogging down rather than hitting a
            // wall. Travel is never set anywhere: the belt cuts, and the machine
            // advances into what it cleared.
            //
            // Because hardness and power BOTH grow x1.5 per level, the ratio
            // between them barely moves — so speed lives in a narrow band across
            // all 65 levels with no per-level tuning at all.
            POWER: {
                // TRAVEL CAP and BELT LOOK are separate numbers, because one
                // constant cannot serve both. Tie the belt's cycles-per-tile to
                // the cap and you must choose: a high cap (so the economy, not
                // the machine, decides speed) or a busy-looking belt. Making
                // each cycle carry half a tile gave the cap but left the belt
                // turning twice per tile — a crawl, so the ground looked as
                // though it were being cut by the rig reversing into it.
                MAX_SPEED:       6,     // travel ceiling, tiles/sec. Exists only
                                        // to stop the absurd (the old model
                                        // reached 223 t/s), so it sits well above
                                        // what power normally buys and almost
                                        // never binds
                BELT_CYCLES:     10,    // the belt runs at this, cycles/sec, and
                                        // nothing changes it. Ten cycles of five
                                        // frames is 50fps — the rate the art was
                                        // calibrated at.
                                        //
                                        // Deliberately CONSTANT. Ground hardness
                                        // is told entirely through how fast the
                                        // machine travels: soft ground and it
                                        // moves off, hard ground and it barely
                                        // creeps while the belt keeps chewing at
                                        // the same rate. One signal, unambiguous.
                                        // A belt that also slowed down said the
                                        // same thing twice and made neither
                                        // reading clean.
                                        //
                                        // Ceiling is 12 (60fps, the render rate);
                                        // past that it skips frames and can
                                        // appear to run backwards
                PULSE_DEPTH:     0,     // OFF. Speed used to swing +/-40% across
                                        // every second so the battery tick could
                                        // be felt. At the speeds the game is
                                        // actually played at that read as the
                                        // machine stuttering rather than surging,
                                        // and a trencher should grind steadily.
                                        // Raise it (0.1 is subtle) to bring the
                                        // pulse back; the machinery is intact and
                                        // distance per second is unaffected
                                        // either way
                SHAKE_MAX:       0,     // OFF. Horizontal shudder at full strain
                                        // (px @ platformScale). It oscillated at
                                        // 4-6Hz, which on a rig this size read as
                                        // the machine swinging side to side
                                        // rather than as effort — a trencher
                                        // tracks straight even when it is
                                        // fighting. Raise it to bring it back;
                                        // SPRITES ONLY either way, never the
                                        // reveal line, which the cut edge, the
                                        // spoil and the water all hang off
                EASY_SPEED:      1.2,   // the pace a machine with power to spare
                                        // settles at, in tiles/sec. Strain is
                                        // measured against THIS, not against
                                        // MAX_SPEED — that cap is deliberately
                                        // far above normal play, so measuring
                                        // against it pinned strain near 1 forever
                                        // and the rig shook at full amplitude the
                                        // entire game
                WHEEL_TILES_PER_TURN: 0.6,  // ground covered per full wheel
                                        // rotation. The wheels are driven by
                                        // DISTANCE, not by a clock, so they can
                                        // never appear to slide at any speed
                SPOIL_MIN:       0.25,  // spoil thrown at a standstill, as a
                                        // fraction of the configured rate — the
                                        // rest scales with how hard it is working
            },
            // ══ HOW A LEVEL GETS ITS WATER ══════════════════════════════
            // ONE SWITCH, TWO WHOLE REGIMES. These are not independent knobs
            // that happen to sit near each other — each mode's parts exist
            // because of the other parts, and mixing them gives behaviour
            // neither design asked for.
            //
            // 'DAM'  (the original) — the trench is cut DRY. The machine must
            //        drive clear of the level before the level can end, because
            //        a stopper is dropped on the boundary to hold the water and
            //        a wall cannot be placed through the belt. So: overrun the
            //        level by OVERRUN_TILES, get the belt out, drop the wall,
            //        pull the wall below, and the whole length floods at once.
            //        The overrun IS the belt clearance — that is the only reason
            //        the number exists.
            //
            // 'FOLLOW' (current) — the water runs up the cut behind the blade
            //        from the first tile. Nothing is being held, so there is
            //        nothing to place a wall for, so the belt never has to get
            //        out of the way. A level is dug the moment the water reaches
            //        its far edge, with the belt still standing in it. No
            //        stopper, no mid-level dams, no overrun.
            //
            // Mixing them is what the game was doing: FOLLOW's water with DAM's
            // overrun, so the machine drove 3.5 tiles of clearance for a wall
            // that was never placed, while the finished water sat waiting at the
            // boundary. That dead stretch was the only thing the overrun bought.
            //
            // Switching to DAM restores all of it together — the held water, the
            // boundary wall, the mid-level dams, and the overrun everywhere it
            // is spent (finish line, dry cells above the map, the next level's
            // starting position, its cost span, its work budget). Those cannot
            // be set apart: a machine credited with ground it never cut would
            // start the next level inside solid earth.
            LEVEL_MODE: 'FOLLOW',     // 'FOLLOW' | 'DAM'
            OVERRUN_TILES: 3.5,    // DAM MODE ONLY — ignored under FOLLOW.
                                   // Keep cutting this far PAST the level's last
                                   // row before the level counts as dug. The belt
                                   // straddles the cut line — 40% ahead of it,
                                   // 60% trailing — so stopping the line on the
                                   // boundary leaves most of the machine still
                                   // standing on the level it has just finished.
                                   // This carries it fully clear, which is what
                                   // lets the wall go in behind it.
                                   //
                                   // DIG distance only. The canal, the water, the
                                   // lilies and the reveal all still measure to
                                   // the level's own edge, so the overrun floods
                                   // nothing and costs the player nothing — the
                                   // machine simply drives out.
            MARGIN: 9,             // loose ground the bore takes beyond the channel
                                   // on each side (px @ platformScale)

            // ── The torn lip at the dig line ──────────────────────────────
            // graphics/cut-edge.png: flat along the bottom, broken along the top.
            // Its foot rides the reveal line and its ragged top overhangs the
            // ground still to be dug, so the cut never reads as a ruled edge —
            // while the reveal underneath stays a straight crop, which is what
            // the machine's whole position is measured from.
            CUT_EDGE: {
                ENABLED: true,
                SWAP_MS: 125,       // how often the lip changes shape WHILE the
                                    // machine is cutting. It freezes on its last
                                    // shape the moment the machine stops, so a
                                    // stalled dig has a still edge
                WIDTH_TILES: 2,     // the main canal's full 2-tile width
                HEIGHT_TILES: 0.52, // its OWN number, in tiles — otherwise
                                    // narrowing the lip flattens it to a line.
                                    // 0.52 is the thickness it had at full width.
                                    // Remove it to follow the art's aspect
                ALPHA:   1,
                Y_OFFSET: 0,       // nudge along the line, in tiles (+ = down)
                DEPTH:   2.16,     // over the ground and its cracks, under the rig
            },

            // ── The trencher ──────────────────────────────────────────────
            // A heavy trenching machine, drawn as TWO sprites that move as one
            // rig: the trenching unit (the spiked belt) straddles the reveal
            // line at the FRONT, the control unit trails behind it. They are
            // separate only so each part's AI-drawn frames stay coherent on
            // their own — never move one without the other.
            //
            // The machine works BACKWARDS: it drives up-screen with the control
            // unit LEADING, dragging the belt behind it — so along the canal the
            // belt is the part nearest the finished trench and the control unit
            // is the part farthest from it, out over untouched ground. Its
            // displacement is the reveal line's, nothing else — see
            // _updateTunnel.
            //
            // SIZING: one ratio does everything. The BELT's width maps onto
            // BELT_TILES tile widths; every other number below is source px of
            // the same art, scaled by that same ratio — so the two parts keep
            // their authored proportions and spacing at any tile size. At 1.5
            // the control unit comes out ≈2.28 tiles wide (396/260 × 1.5).
            TRENCHER: {
                FRAMES:     5,     // frames per part (belt1..5 / control_unit1..5)
                BELT_W:     260,   // trenching-unit art size (source px)
                BELT_H:     794,
                CTRL_W:     396,   // control-unit art size (source px)
                CTRL_H:     492,
                CTRL_GAP:   566,   // belt centre → control centre, AHEAD of the
                                   // belt (source px, same ratio as the sizes):
                                   // the control unit leads, the belt trails at
                                   // the trench it is cutting
                BELT_TILES: 1.9,   // belt width in tile widths — the scale anchor
                                   // (the trenching unit spans 1.5 tiles; every
                                   //  other dimension follows from this)
                AHEAD_FRAC: 0.4,   // fraction of the belt's height sitting AHEAD
                                   // of the reveal line (uncut side); the other
                                   // 0.6 trails over the open trench
                BELT_FPS:   50,    // belt cycle speed  (calibrate)
                CTRL_FPS:   12,    // control-unit (wheel) cycle speed. The rig
                                   // travels at whatever the batteries pay for,
                                   // so this is what sets how far the wheels
                                   // appear to turn per px of travel
                FLIP_Y:     false, // the dig runs UP the screen; flip both parts
                                   // if the art is drawn facing the other way
                                   // (flips the pair together — the offsets are
                                   //  measured from the reveal line either way)

                // ── Shadow ────────────────────────────────────────────────
                // graphics/trencher/shadow.png is ONE shadow for the whole rig,
                // authored in the same source-px space as the two parts, so it
                // needs no size of its own — it rides the same ratio as
                // everything else. It never animates; it just travels with the
                // machine.
                // The shadow is pinned by its TOP-LEFT corner to the control
                // unit's top-left corner. Its lean is drawn into the art, so no
                // offset is needed — these two are a correction to the art if it
                // ever sits a pixel out, not part of the placement.
                // The width the shadow was AUTHORED at, in the same source-px
                // space as BELT_W and CTRL_W. The FILE is smaller than this on
                // purpose: the art is pure blur — the sharpest alpha step in it
                // is 6/255 — so it carries no detail above a ~20px feature and
                // is exported at 40%, which costs 2.1MB less GPU memory and
                // cannot be seen. Upscaling a gradient reintroduces only the
                // softness it already had.
                //
                // Placement stays in AUTHORED space and the export ratio is
                // divided out here, so re-exporting at another size needs no
                // other change — only this number moves if the art is ever
                // redrawn larger.
                SHADOW_SRC_W: 510,
                SHADOW_OFF_X: 0,
                SHADOW_OFF_Y: 0,
                SHADOW_ALPHA: 1,   // the art carries its own softness; this is
                                   // just a global knock-back if it reads heavy
                DEPTH_SHADOW: 3.05,   // under both parts, over the crops

                // ── Water vs. the machine ─────────────────────────────────
                // The canal water follows the trencher and washes OVER the
                // belt: the belt is down IN the trench it is cutting, so the
                // filling water covers its trailing end rather than the belt
                // sitting on top of a dry-looking canal.
                WATER_OVER: 0.52,  // how far up the belt the waterline is let
                                   // come, as a fraction of the belt's height
                                   // measured from its REAR edge. 0 = water
                                   // stops at the belt's back edge; (1 -
                                   // AHEAD_FRAC) = water right up to the
                                   // reveal line
                                   //
                                   // THE DITCH BEHIND THE BLADE IS AT FULL DEPTH,
                                   // so it holds water to the brim, and the belt
                                   // is a ramp lying IN that water rather than a
                                   // wall holding it back. At 0.35 the water
                                   // stopped a tile and a half short of the cut
                                   // for no reason the trench could give.
                                   //
                                   // Not the full 0.6 though: the waterline is
                                   // hard-clamped at the blade and can never
                                   // cross onto uncut ground, so a target sitting
                                   // exactly there IS the clamp — the water pins
                                   // against it and every surge is absorbed by
                                   // the wall instead of sloshing. This leaves a
                                   // few tenths of a tile of headroom for the
                                   // spring to move in, which is also about where
                                   // the ditch stops being full depth and starts
                                   // ramping up to the surface.
                // Draw order: the machine sits ABOVE every ground element — the
                // canal tiles, the crops and their soil patches (which reach
                // ~3.02) — and BELOW the main canal's water, which was raised to
                // TILEMAP.MAIN_WATER_DEPTH to make both true at once. So the
                // whole rig travels over the field, and the water it lets in
                // still washes over the belt behind it. Both parts sit in the
                // same band; the belt stays just above the control unit.
                DEPTH_BELT: 3.07,
                DEPTH_CTRL: 3.06,
            },

            // (the last dry stretch is flooded by the water's own flow — see
            //  WATER.FLOW_TAU / MIN_SPEED, not a timed animation)

            // ── Colours ───────────────────────────────────────────────────
            // (machine look comes from graphics/trencher/)
            CUT_COLOR:     0x84694a,  // raw soil exposed in the cut under the
                                      // machine, before the water reaches it
            // ── Spoil thrown clear ────────────────────────────────────────
            // The belt carries what it digs up out of the hole and flings it to
            // both sides. Two flat fans from the belt's lower end, each grain
            // gone before it lands — no heap, because a growing ridge would
            // either bury the canal it frames or need authoring per tile.
            // ── Spoil thrown clear ────────────────────────────────────────
            // The belt carries what it digs out of the hole and flings it to both
            // sides. Two PARTICLE EMITTERS, one per side — not a sprite per grain:
            // at this density the emitter is the difference between a smooth frame
            // and a stuttering one on a budget phone.
            //
            // What makes it read as sand rather than smoke: it is thrown (speed +
            // gravity, so it arcs), it barely shrinks, it holds opacity until it
            // lands, and it never grows. Only DUST grows — see FACE below.
            SPRAY: {
                ENABLED:  true,
                QUANTITY: 3,       // grains per side, per emission
                EVERY_MS: 60,      // and how often — density is these two
                SPEED_MIN: 90,     // how hard it is thrown (px/s @ platformScale)
                SPEED_MAX: 260,
                GRAVITY:  420,     // the drop that turns a throw into an arc
                LIFE_MIN: 320,     // ms in the air
                LIFE_MAX: 620,
                OFFSET_Y: -12,     // from the CUT LINE, in the direction the rig
                                   // travels (negative = toward uncut ground)
                OFFSET_X: 0.22,    // out from centre, in rig widths
                SIZE:     2.0,     // grain scale against the debris texture
                SHRINK:   0.85,    // barely: sand does not shrink in flight
                DEPTH:    3.04,    // UNDER the machine (3.05–3.07), over the crops
            },

            // Grit and haze at the cutting face itself, falling back into the
            // trench rather than being thrown clear of it.
            FACE: {
                CHIPS: false,      // OFF. Grit thrown straight up the middle at
                                   // the cut line, from the same debris texture
                                   // as the two side sprays — so it read as a
                                   // third spray fired at the camera rather than
                                   // as material coming off the face. The sides
                                   // already say the trench is being emptied.
                                   // The dust haze below is unaffected
                QUANTITY: 2,
                EVERY_MS: 45,
                SPEED_MIN: 20,
                SPEED_MAX: 90,
                GRAVITY:  260,
                SIZE:     1.1,
                DUST_EVERY_MS: 110,
                DUST_ALPHA: 0.45,
            },

            DEBRIS_COLORS: [0x6e4a21, 0xa97537],
                                      // spoil chip tints across the spray: the
                                      // first (dominant) fills the middle, the
                                      // last shades the chips at both ends
            CHIP_SIZE:     10,        // base size of a spoil chip (px). Chunky
                                      // squares — bumped up to read clearly
            DUST_COLOR:    0xa89878,  // soft dust cloud drifting off the cut

            // Cracks in the ground revealed just ahead of the blade. The pattern
            // is FIXED to the column; a short window near the face reveals it,
            // thick at the face and fading out over LEN.
            CRACK: {
                ENABLED: true,
                LEN:     52,          // reveal window ahead of the face (px @ platformScale)
                WIDTH:   0.5,         // crack spread as a fraction of the belt width
                LINES:   2,           // number of main cracks down the column
                COLOR:   0x3c2c1a,    // dark earth in the split
                ALPHA:   0.6,         // opacity at the face (fades to 0 over LEN)
                THICKNESS: 2,         // line thickness at the face (px @ platformScale)
            },
        },

        // ── The world scrolls; it no longer jumps ─────────────────────────
        // Levels are stacked FLUSH: each one's floor is the one below it's top,
        // and a band is exactly its own map — never a screen height. That is
        // what removes the strip of filler ground that used to sit between
        // levels, and what stops the machine being teleported to a fresh dig
        // site: the next level's canal begins exactly where the last one ended,
        // so the rig simply keeps cutting.
        //
        // Finished levels are NOT torn down when the next begins. They stay on
        // screen, watered and grown, and are only released once they have
        // scrolled clear below — so the player sees the stack of fields they
        // have already brought in.
        ENDLESS: {
            ENABLED: true,
            // The camera holds still until the machine leaves a band of the
            // view, then eases up to put it back. A camera welded to the rig
            // would always be looking at bare soil and never at the crops
            // coming in behind it.
            // What waits for a finished field to come in — the machine, the
            // camera, or neither.
            //
            // The machine stopping wastes time but keeps it on screen. The
            // camera stopping wastes nothing but lets the rig climb out of the
            // top: a level needs about 10s to flood and grow, and at 1.8 tiles
            // a second the machine covers 18 tiles in that time against 6.7
            // tiles of headroom. It leaves the view after under four seconds.
            //
            // THE MACHINE DOES NOT WAIT. It was held so the completion beat
            // would not play behind a rig that had already left — but holding it
            // spends the player's charge on standing still, and charge is the
            // one thing they actually supply. Now it digs on, off the top of the
            // frame if the batteries keep coming.
            //
            // WHAT WAITS INSTEAD IS THE WATER (QUEUE_WATER below). That was the
            // real reason to hold the rig: dry cut hurts nothing, but water
            // reaching the next field starts its crops, and two farms coming in
            // at once means watching neither. So the blade runs free and the
            // canal behind it stays dry until the farm below is finished.
            //
            // The camera does not follow the machine at all any more — see
            // _followMachine — so neither of these decides framing.
            HOLD_MACHINE_FOR_CROPS: false,  // the rig digs on
            HOLD_CAMERA_FOR_CROPS:  true,   // (the view is the level's regardless)

            // Each level's water is dammed until the level below it has finished
            // being watched. Off, the canals fill as they are cut and farms
            // complete on top of one another.
            QUEUE_WATER: true,

            // ── MOVING ON ───────────────────────────────────────────────
            // When the farm is finished — gathered, tallied, its icon in the
            // roster — the camera climbs and settles the NEXT level in the
            // middle of the screen before the machine is let go.
            //
            // It happens while the rig is still parked, which is what makes it
            // possible at all: the camera may normally never outrun the machine,
            // because a camera climbing faster than the rig drags the world down
            // and reads as the dig reversing. With nothing moving there is
            // nothing to contradict, so this is the one glide the camera gets.
            //
            // The pan is also the punctuation. One farm ends, the view moves to
            // the next, and only then does the digging start again — instead of
            // the machine setting off while the eye is still on the old field.
            FOCUS_NEXT:  true,
            FOCUS_LERP:  1.8,      // how hard it eases onto the new field
            FOCUS_NEAR:  6,        // px from centred that counts as arrived
            FOCUS_MAX_MS: 2500,    // ...and a ceiling, so a pan that cannot
                                   // reach its mark can never hold the handover
            HOLD_EDGE:   0.08,     // ...unless the machine is about to leave.
                                   // The hold is SOFT: the camera stays on the
                                   // finished field for as long as it can, then
                                   // gives way once the rig reaches this fraction
                                   // of the view from the top.
                                   //
                                   // Without this the camera falls behind by
                                   // however far the machine got — twelve tiles
                                   // is typical — and catching up afterwards
                                   // drags the whole world down the screen, which
                                   // reads as the MACHINE reversing. A camera
                                   // that never falls behind has nothing to catch
                                   // up on

            FOLLOW_TOP:  0.34,     // machine may climb to this fraction of the
                                   // view before the camera answers
            CATCHUP:     1.15,     // the camera may never travel faster than this
                                   // multiple of the MACHINE's own speed.
                                   //
                                   // This is what stops the rig appearing to
                                   // reverse. A camera moving up drags the world
                                   // down the screen, so any time it outruns the
                                   // machine the machine looks like it is going
                                   // backwards — most obviously after a hold,
                                   // when it had a quarter of a screen of framing
                                   // to reclaim and sprinted to get it. Capped
                                   // just above the machine's pace, it reclaims
                                   // the framing over several seconds and the rig
                                   // never visibly loses ground
            FOLLOW_LERP: 2.2,      // how fast it closes on that, per second.
                                   // Low: the answer should read as the camera
                                   // catching up, not as a snap
            FILL_AHEAD:  0.75,     // keep this many view-heights of world BUILT
                                   // above the camera. Levels are shorter than
                                   // the screen, so without this the viewport is
                                   // mostly empty: the next level used to appear
                                   // only when the last one finished. The world
                                   // is continuous, so it has to exist before
                                   // the player can see it
            KEEP_BELOW:  0.6,      // release a finished level once its top edge
                                   // is this many view-heights below the camera.
                                   // Generous — it is cheaper to hold a band a
                                   // moment longer than to have one vanish in
                                   // view
        },

        WATER: {
            // WHETHER THE WATER WAITS is no longer set here — it is one half of
            // TUNNEL.LEVEL_MODE, because it cannot be chosen independently of
            // the stopper and the overrun that a held flood needs. DAM holds the
            // water to the end of the dig; FOLLOW runs it up the cut LAG behind
            // the blade. Everything below is how the water BEHAVES once it is
            // moving, and applies to both.
            // ── ARRIVING TOGETHER ─────────────────────────────────────────
            // The hold-back (TRENCHER.WATER_OVER, scaled by LAG) exists because
            // the ground under the blade is not cut yet — water cannot sit on
            // soil the machine has not opened. At the level's far edge that
            // reason runs out: the blade stops there, so everything behind it IS
            // cut, and the canal should stand full to the brim.
            //
            // So the hold-back tapers to nothing over the last CLOSE_TILES of
            // the dig. The blade slows into the boundary with the water gaining
            // on it, and the two arrive at the edge together — the machine stops
            // because there is no more level to cut, and the water stops for the
            // same reason, not because it was told to wait.
            //
            // Without this the level ends with the water a half tile short and a
            // separate flood step to close it: two different motions for what
            // should be one arrival.
            CLOSE_TILES: 1.5,      // over how many tiles the hold-back unwinds
            // HOW SOLID THE CANAL'S WATER IS. The water tile is a layer of its
            // own over the dry cut, so lowering this lets the trench show
            // through and the channel reads shallow rather than filled.
            //
            // Free: alpha is a per-vertex value in the same batch, so a
            // see-through tile costs exactly what an opaque one does.
            //
            // Two things to weigh. What shows through is CHURNED SOIL, not a
            // riverbed — too low and it reads as a failure to draw rather than
            // as shallow water. And FLOW_UV is already laid over this at its own
            // alpha, so thinning both stacks two partial layers and the motion
            // muddies rather than deepens.
            CANAL_ALPHA: 0.8,

            COLOR:      0x2f8fd0,  // the canal surface
            EDGE_COLOR: 0x7fd4f0,  // brighter shallows along each bank — a lit
                                   // rim that separates water from the earth wall
            EDGE_WIDTH: 2,         // width of that rim (px @ platformScale)
            LAG:        1.0,       // how much dry cut the blade keeps open ahead of
                                   // the water, in machine lengths. This is a LIMIT,
                                   // not a leash: 1 = the rig works on dry soil
            // HOW FAST THE MAIN WATERLINE MAY TRAVEL, in tiles a second.
            //
            // Only ever binds on the CATCH-UP. Each level's water is dammed
            // while the farm below is being watched (ENDLESS.QUEUE_WATER) and
            // the blade digs on regardless, so when the dam lifts the spring is
            // looking at a gap most of a level wide — and a spring pulled that
            // far snaps. It closed ten tiles in 0.4s at a peak of 33 tiles a
            // second, which reads as a cut rather than as water arriving.
            //
            // At 6 the same ten tiles take about 1.7s: unmistakably water
            // running up a ditch rather than a line being redrawn. Normal
            // following never comes near it, so the spring's own feel — the
            // slosh, the overshoot — is untouched.
            //
            // BRANCHES ARE NOT AFFECTED. They fill by their own cascade off the
            // main cells, nothing to do with this line.
            MAX_SPEED:  6,         // tiles/s
            FLOOD_SPEED: 140,      // the FINAL flood's speed (px/s @ platformScale),
                                   // flat from the mouth to the wall. Flat because
                                   // the target does not move: a gap-closing
                                   // chase would start fast and crawl the last
                                   // fifth, which reads as the water losing
                                   // interest. Also makes a long level flood at
                                   // the same speed as a short one, where the
                                   // chase made longer levels start faster
            // ── The waterline's momentum ──────────────────────────────────
            // Chasing the blade by closing a fraction of the gap each frame is
            // smooth, monotonic and dead — the water reads as a strip towed
            // along behind the rig. Water has weight: it should fall behind a
            // surge, run up after it, pass the mark and settle back.
            //
            // So the waterline is a DAMPED SPRING pulled toward its resting
            // distance behind the blade, the same integration the crops' sway
            // uses — struck there, driven here. It may briefly move BACKWARD as
            // the spring pulls it in; that slosh is the point of it.
            //
            // Nothing is drawn for this. The tile reveal and the head bulge both
            // read the waterline and nothing else, so they bounce together for
            // free.
            //
            // Tuned in real units: HZ is how fast it bounces, DAMP how quickly
            // that dies away — below 1 it overshoots, at 1 it merely settles.
            SPRING: {
                ENABLED: true,     // false = the old fraction-of-the-gap chase,
                                   // which is what FLOW_TAU below drives
                HZ:      0.9,      // bounces per second. Slow, because this is a
                                   // heavy body of water and not a twig
                DAMP:    0.45,     // ~two visible bounces before it settles.
                                   // 0.25 rings longer, 0.8 nearly kills it

                // A SPRING ONLY RINGS WHEN SOMETHING DISTURBS IT, and a machine
                // climbing at a steady pace never does — the water just settles
                // into a smooth trailing lag, which is the very thing this was
                // meant to fix. Real water does not advance smoothly: it finds a
                // little room, spills forward, and rocks back.
                //
                // So the line is nudged forward every so often, always forward
                // and only when there is room ahead of it. That keeps it alive
                // while following, and it falls quiet on its own when the water
                // catches up and the machine stops.
                NUDGE_TILES: 0.07,          // how far one surge carries it — the
                                            // distance REACHED, not a velocity
                NUDGE_MS:   [260, 620],     // irregular on purpose: an even beat
                                            // reads as a pulse rather than water
            },
            // ── Water hitting something ───────────────────────────────────
            // A front running to the end of a ditch, or two fronts meeting head
            // on, are moments the player should feel — a branch finishing is a
            // small piece of progress, and it used to read as nothing at all.
            // A ring pops out of the impact point and fades.
            //
            // A RING, not a disc: a ring spreads the way a ripple does, where a
            // disc reads as a blob dropped on the water.
            //
            // COLOUR is where the obvious choice is wrong. The canal is 0x2f8fd0
            // and a ring in that same blue is invisible on it. This is the lit
            // shallows colour from EDGE_COLOR below — still water, but it reads.
            HIT: {
                ENABLED: true,
                COLOR:   0x7fd4f0,
                ON_END:  true,     // a front reaching a dead-end stub. Common —
                                   // one per branch tip, so a dozen on a map with
                                   // a branch on every row
                ON_MEET: true,     // two fronts meeting HEAD ON. Rare, and only
                                   // head on: water joining settled water or
                                   // merging at a junction happens constantly and
                                   // is not an event
                // Ring diameter in TILES, not pixels — everything else in the
                // world is authored in tiles and this should not be the odd one.
                FROM:    0.25,
                TO:      1.15,
                MS:      380,
                // Two rings, the second a moment later and fainter. One ring is
                // a pop; two is a ripple.
                RINGS:   2,
                GAP_MS:  120,
                FADE:    0.85,     // the trailing ring's share of the alpha
            },
            FLOW_TAU:   2.25,      // seconds for the level to close most of the gap
                                   // to that limit. This is what stops the water
                                   // reading as a strip towed by the auger — it
                                   // lingers behind a lurch and keeps creeping up
                                   // the cut after the machine has gone quiet.
                                   // Higher = lazier, more obviously flowing.
                                   //
                                   // With AFTER_DIG the flood is released against
                                   // the WHOLE level at once, so the gap is a full
                                   // band and this constant alone sets the pace:
                                   // speed starts at roughly (band length / TAU).
                                   // That is why it read as a surge. 2.25 is 0.9
                                   // x2.5, i.e. 40% of the old speed.
            MIN_SPEED:  12,        // steady creep floor (px/s @ platformScale). The
                                   // exponential chase above would crawl to a halt
                                   // as it closes the last of the gap — this keeps
                                   // the final run to the mouth moving at the same
                                   // pace it had while chasing the blade.
                                   // Scaled with FLOW_TAU so the tail slows by the
                                   // same 40%, otherwise the run would decelerate
                                   // into the mouth and then speed back up.
            FRONT:      12,        // length of the wavering leading edge
                                   // (px @ platformScale)
            FRONT_COLS: 7,         // fingers across that edge — each on its own
                                   // phase, so the front never repeats a shape
            FOAM_CAPS:  false,     // draw the blocky white caps on the finger tips.
                                   // Off: the main canal's front is left to the
                                   // rounded foam blobs of the tilemap head, so
                                   // there is no squared-off white tip
            FOAM:       4,         // white cap on the tip of each finger
                                   // (px @ platformScale) — blocky, following the
                                   // same columns as the front itself
            FOAM_COLOR: 0xdcf2fb,  // bluish white — white tinted toward the shallow
                                   // water (EDGE_COLOR), so the foam sits in the
                                   // water's palette rather than reading as pure white
            FOAM_ALPHA: 0.9,
        },

        // ── Lily pads ─────────────────────────────────────────────────────────
        // A few clusters of pads resting on the finished main canal. They never
        // travel — the water is a still channel, not a river — they only breathe:
        // a slow turn, a barely-there rock in place and an optional size pulse,
        // each pad on its own phase so the group never moves as one. That is what
        // sells "floating on water that is alive" without anything drifting.
        //
        // They appear only AFTER the water has passed, never on dry ground: a
        // main-canal cluster waits until the waterline is REVEAL_LAG past it, a
        // branch one until its own cell has filled.
        //
        // WHERE THE WATER IS. The main canal is two columns meeting at a shared
        // seam, and each of those tiles is MAIN_WATER water measured from that
        // seam outwards — the rest of the tile, on its OUTER side, is bank. So
        // the open water is one band straddling the seam, MAIN_WATER of a tile
        // to each side of it. A branch is a single tile with BRANCH_WATER of its
        // width running down its middle. Pads are pushed out toward a bank
        // (BANK_BIAS) rather than sitting on the centre line — pads gather at
        // the edges of real water, and the middle stays clear.
        LILY: {
            ENABLED: true,
            MAIN_WATER:   0.72,    // water share of ONE main tile, from the seam out
            BRANCH_WATER: 0.32,    // water share of a branch tile, centred
            BANK_BIAS:    0.85,    // how far toward the bank a cluster sits: 0 = on
                                   // the centre line, 1 = pad edge touching the bank
            CLUSTERS_MIN: 2,       // lilies on the MAIN canal per stretch
            CLUSTERS_MAX: 3,
            // The art comes in two kinds: lily1/lily2 are single pads, lily3/
            // lily4 are ready-made clumps. Nothing is assembled from singles —
            // each lily is ONE image. Singles are randomly rotated; clumps are
            // placed as drawn. A clump is COMBO_SCALE wider, being several
            // pads' worth of art in the one picture.
            COMBO_CHANCE: 0.45,    // odds a lily is a clump rather than a single
            COMBO_SCALE:  1.4,     // clump width vs. a single's
            SIZE:         0.67,    // single-pad width as a fraction of a tile
                                   // (height follows — the art keeps its aspect)
            SIZE_VAR:     0,       // ± random size spread per lily. 0 = every
                                   // lily of a kind is exactly this size
            MIN_GAP:      0.12,    // least spacing between lilies along the canal,
                                   // as a fraction of the stretch's length
            SPAN:        [0.08, 0.9],  // where clusters may sit along the stretch
            REVEAL_LAG:   1.2,     // how far past a cluster the waterline must be
                                   // before it appears, in tiles
            FADE_MS:      520,     // fade-in once revealed
            POP_FROM:     0.55,    // it pops in rather than appearing: starts this
            POP_MS:       620,     // size and springs up to full over POP_MS
            POP_EASE:     'Back.easeOut',   // the small overshoot at the end
            DEPTH:        1.57,    // above the water (1.55) and its head (1.56)

            // ── Branches ─────────────────────────────────────────────────────
            // One lily per branch, on a random cell of it. A branch channel is
            // barely a third of a tile wide, so it gets its own smaller size —
            // the main-canal size would not fit — and singles only: a clump is
            // wider than the whole branch channel.
            BRANCH:       false,   // OFF: a branch channel is a third of a tile
                                   // wide, so a pad in one is too small to read.
                                   // Set true to put them back — the placement
                                   // below still works
            BRANCH_SIZE:  0.24,    // single-pad width as a fraction of a tile
            BRANCH_COMBO: false,   // allow clumps in branches (they will overhang)

            // ── The breathing ────────────────────────────────────────────────
            // The whole point of the pads: still water reads as dead, so they
            // must never come to rest. All of these run forever, yoyoing, each
            // with its own duration and a random start delay so no two pads move
            // together. The lily stays where it was put — it wanders about that
            // spot, it does not travel.
            ROCK_DEG:     11,      // rock about the pad's own centre (degrees)
            ROCK_MS:     [1700, 2600],   // one way; randomised per pad
            DRIFT:        0.13,    // wander WITH and AGAINST the flow, as a
                                   // fraction of a tile — the give and take of
                                   // the current pushing at the pad
            DRIFT_CROSS:  0.05,    // the smaller sway across the channel. Kept
                                   // under DRIFT so the motion reads as being
                                   // along the water, not random jitter, and
                                   // capped at run time by the room the bank
                                   // leaves — a branch pad has almost none
            DRIFT_MS:    [1500, 2300],   // the two axes run at different rates on
                                   // purpose, so the path never repeats itself
            SCALE_AMP:    0.06,    // size pulse (0 = off) — the swell passing
                                   // under
            SCALE_MS:    [1300, 2100],
        },
    },
};

// -------------------------------------------------------------------
// Battery image helpers
// -------------------------------------------------------------------

var BATTERY_IMAGE_PATHS = {};

function checkFileExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload  = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// async function initBatteryImagePaths() {
//     if (typeof BATTERY_TYPES === 'undefined' || !BATTERY_TYPES) {
//         console.error('BATTERY_TYPES not found! Make sure batteryChargeData.js is loaded first.');
//         return;
//     }
    
//     // Get all battery levels from the new system
//     const highestLevel = getHighestBatteryLevel();
    
//     for (let level = 1; level <= highestLevel; level++) {
//         const batteryData = getBatteryData(level);
//         if (!batteryData) continue;
        
//         const path = `graphics/battery/${batteryData.fileName}`;
//         const ok = await checkFileExists(path);
        
//         if (ok) {
//             BATTERY_IMAGE_PATHS[level] = path;
//         } else {
//             console.warn(`Battery image not found: ${path} for level ${level} (${batteryData.displayName})`);
//         }
//     }
//     console.log(`Loaded ${Object.keys(BATTERY_IMAGE_PATHS).length} battery sprites`);
// }
async function initBatteryImagePaths() {
    if (typeof BATTERY_TYPES === 'undefined' || !BATTERY_TYPES) {
        console.error('BATTERY_TYPES not found! Make sure batteryChargeData.js is loaded first.');
        return;
    }
    
    // Build paths directly from BATTERY_TYPES - no network probing needed
    const highestLevel = getHighestBatteryLevel();
    
    for (let level = 1; level <= highestLevel; level++) {
        const batteryData = getBatteryData(level);
        if (!batteryData) continue;
        BATTERY_IMAGE_PATHS[level] = `graphics/battery/${batteryData.fileName}`;
    }
    
    console.log(`Registered ${Object.keys(BATTERY_IMAGE_PATHS).length} battery sprites`);
}

function loadBatteryImagesFromCache(scene) {
    for (const level in BATTERY_IMAGE_PATHS) {
        const path = BATTERY_IMAGE_PATHS[level];
        if (path) scene.load.image(`battery${level}`, path);
    }
}

function getBatteryIconLevel(level) {
    const highest = getHighestBatteryLevel();
    return Math.min(level, highest);
}

// ===================================================================
// SPRITE SIZE QUICK REFERENCE
// ===================================================================
// Grid & Batteries:
//   • Grid cell (empty/filled):        130 × 130 px  (CELL.SIZE)
//   • Battery sprite in grid cell:      64 × 64 px   (CELL.BATTERY_DISPLAY_SIZE)
//   • Battery level text offset:        -40 px Y     (CELL.LEVEL_TEXT_Y_OFFSET)
//
// Platform/Charger System:
//   • Charger slot (battery holder):   130 × 130 px  (PLATFORM.SLOT_SIZE) — same as grid cell
//   • Debug rect (max gadget area):    170 × 113 px  (PLATFORM.DEBUG_RECT_WIDTH × WIDTH/ASPECT_RATIO, 3:2)
//   • Tooth area (toothbrush level):   200 × 80 px   (PLATFORM.TOOTH_AREA_WIDTH × WIDTH/ASPECT_RATIO, 2.5:1)
//   • Gadget sprite (within debug):    auto-sized    (aspect ratio preserved, centered horizontally, touching bottom)
//   • Socket (on slot):                 40 × 40 px   (PLATFORM.SOCKET_SIZE)
//   • Plug (on wire):                   28 × 28 px   (PLATFORM.PLUG_SIZE)
//   • Platform stripe height:           18 px        (PLATFORM.STRIPE_HEIGHT)
//
// Meter (analog gauge):
//   • Meter radius:                     62 px        (PLATFORM.METER_RADIUS)
//   • Meter diameter (approx):         124 px        (2 × radius)
//
// UI Elements:
//   • Button battery icon:              64 × 64 px   (BUTTON.BATTERY_ICON_WIDTH/HEIGHT)
//   • Button coin icon:                 50 × 50 px   (BUTTON.COIN_ICON_WIDTH/HEIGHT)
//   • Coin counter icon:                40 × 40 px   (COIN_COUNTER.COIN_ICON_WIDTH/HEIGHT)
//   • Reward coin (animation):          32 × 32 px   (COIN_REWARD_ANIMATION.REWARD_COIN_SIZE)
//   • Crown icon (unlock display):      32 × 32 px   (BATTERY_UNLOCK_DISPLAY.CROWN_ICON_SIZE)
//   • Spawn button:                    250 × 90 px   (BUTTON.SPAWN_WIDTH/HEIGHT)
//   • Level-up button:                 180 × 70 px   (BUTTON.LEVELUP_WIDTH/HEIGHT)
// ===================================================================
