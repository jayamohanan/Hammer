// ============================================================================
// HAMMERS — the merge ladder, and what a hammer hits for
// ============================================================================
// Replaces batteryChargeData.js. Batteries are gone: the merge area makes
// HAMMERS, and a hammer in a slot strikes a block in the canal.
//
// ── THE ART ─────────────────────────────────────────────────────────────────
// ONE spritesheet, graphics/tilesheets/hammer.webp — 1280x1280, a 10x10 grid
// of 128px cells, 100 hammers in merge order reading left-to-right, top-to-
// bottom. Hammer N is frame N-1.
//
// That is the whole loader. Batteries were 100+ separate PNGs fetched on demand
// through AssetManager, with a prefetch of the next level so a merge would not
// land on a missing texture. A sheet is one request, resolved before create()
// runs, so none of that machinery has anything left to do.
//
// ── THE NUMBERS ─────────────────────────────────────────────────────────────
// STRIKE POWER, carried over verbatim from the battery charge table, which
// already ran 1..100 — the reason there are exactly 100 hammers. It is the
// damage ONE STRIKE does to a block's strength. Blocks take their strength
// from BLUMGI_HP (blumgiHP.js), so the two tables are what the whole difficulty
// curve is made of.
//
// It climbs x1.5 per level for most of the ladder, the same shape as the block
// strengths it is spent against, so the ratio between them stays roughly flat
// and a level takes about the same number of strikes wherever you are.
// ============================================================================

// Cells in the sheet. Changing the sheet means changing these and nothing else.
var HAMMER_SHEET = {
    KEY:   'hammers',
    FILE:  'graphics/tilesheets/hammer.webp',
    FRAME: 128,     // px, square
    COLS:  10,
    ROWS:  10,
};

var HAMMER_MAX_LEVEL = HAMMER_SHEET.COLS * HAMMER_SHEET.ROWS;   // 100

// Damage one strike does, by hammer level.
var HAMMER_POWER_BY_LEVEL = {
    1: 5,
    2: 7,
    3: 11,
    4: 16,
    5: 25,
    6: 37,
    7: 56,
    8: 85,
    9: 128,
    10: 192,
    11: 288,
    12: 432,
    13: 648,
    14: 973,
    15: 1459,
    16: 2189,
    17: 3284,
    18: 4926,
    19: 7389,
    20: 11084,
    21: 16626,
    22: 24939,
    23: 37409,
    24: 56113,
    25: 84170,
    26: 126000,
    27: 189000,
    28: 284000,
    29: 426000,
    30: 639000,
    31: 959000,
    32: 1000000,
    33: 2000000,
    34: 3000000,
    35: 5000000,
    36: 7000000,
    37: 11000000,
    38: 16000000,
    39: 20000000,
    40: 25000000,
    41: 30000000,
    42: 45000000,
    43: 55000000,
    44: 60000000,
    45: 69000000,
    46: 75000000,
    47: 90000000,
    48: 100000000,
    49: 115000000,
    50: 125000000,
    51: 130000000,
    52: 140000000,
    53: 150000000,
    54: 18000000,
    55: 180000000,
    56: 200000000,
    57: 210000000,
    58: 220000000,
    59: 230000000,
    60: 250000000,
    61: 260000000,
    62: 270000000,
    63: 285000000,
    64: 300000000,
    65: 315000000,
    66: 330000000,
    67: 350000000,
    68: 375000000,
    69: 400000000,
    70: 450000000,
    71: 490000000,
    72: 515000000,
    73: 560000000,
    74: 600000000,
    75: 650000000,
    76: 700000000,
    77: 750000000,
    78: 800000000,
    79: 900000000,
    80: 1000000000,
    81: 2000000000,
    82: 3000000000,
    83: 4000000000,
    84: 5000000000,
    85: 6000000000,
    86: 7000000000,
    87: 8000000000,
    88: 9000000000,
    89: 10000000000,
    90: 10000000000,
    91: 12000000000,
    92: 14000000000,
    93: 16000000000,
    94: 18000000000,
    95: 20000000000,
    96: 25000000000,
    97: 30000000000,
    98: 35000000000,
    99: 40000000000,
    100: 500000000000,
};

// What one strike from this hammer takes off a block.
function getHammerPower(level) {
    return HAMMER_POWER_BY_LEVEL[level] || (level * 5);
}

// Which frame of the sheet draws this hammer. Clamped, so a hammer merged past
// the end of the art keeps the last picture rather than drawing nothing.
function getHammerFrame(level) {
    return Math.max(0, Math.min(HAMMER_MAX_LEVEL, level) - 1);
}

// Kept so the ladder has one place that says where it stops.
function getHighestHammerLevel() { return HAMMER_MAX_LEVEL; }

// ── Compatibility shims ─────────────────────────────────────────────────────
// The scene still speaks of charge in places the rename has not reached yet.
// These keep those call sites working while they are migrated, and are the
// first thing to delete when they are.
function getBatteryChargeValue(level) { return getHammerPower(level); }
function getBatteryIconLevel(level)   { return Math.min(level, HAMMER_MAX_LEVEL); }
function getHighestBatteryLevel()     { return HAMMER_MAX_LEVEL; }

// What the unlock banner calls a hammer. The batteries had 100-odd hand-written
// names ('Lamp', 'Suitcase') because each was its own picture; the hammers are
// one ordered sheet, so the number IS the identity.
function getHammerData(level) {
    return { displayName: `Hammer ${level}`, frame: getHammerFrame(level) };
}
function getBatteryData(level) { return getHammerData(level); }
