// ============================================================================
// BLUMGI MERGE — PER-LEVEL ENEMY HP  (REFERENCE DATA — NOT LOADED, NOT USED)
// ============================================================================
// The source table our difficulty curve was derived from, transcribed verbatim
// from Blumgi Merge's sheet. 64 levels, three monsters each, plus their total.
//
// NOTHING READS THIS FILE. It is not in index.html and defines one global that
// no other file mentions. It is here so the numbers are not lost — the three
// per-monster columns had been thrown away once already, and only their summed
// TOTAL survived into LEVEL_DATA.COST (levels.js), with the ratio between them
// flattened into one averaged triple, STRETCHES [0.28, 0.33, 0.39].
//
// To use it: add a <script> for it in index.html BEFORE config.js, the way
// levels.js and batteryChargeData.js are loaded.
//
// ── WHY THREE VALUES MIGHT MATTER ───────────────────────────────────────────
// In Blumgi a level is three INDEPENDENT fights and ends when the slowest
// finishes — a maximum. Ours is one machine cutting one total — an average.
// That difference is why a x1.18 "pooling correction" was once applied to the
// totals and then discarded (see changes.md). Anything that wants to model the
// three fights properly, rather than approximate them with a fixed 28/33/39
// split, needs these columns rather than the total.
//
// ── WHAT IS IN HERE, INCLUDING THE ODDITIES ─────────────────────────────────
// Transcribed AS IS. Every row's three values sum to its stated total — that
// much is checked — but the curve itself is not clean, and these are Blumgi's
// own irregularities, not transcription errors. Do not "fix" them silently:
//
//   TOTAL DIPS BELOW THE PREVIOUS LEVEL at levels 6, 13, 26, 29 and 63.
//   Two are dramatic — level 29 falls to 225,000,000 from level 28's
//   5,000,000,000 (a 22x drop), and level 63 to 1.125e12 from 22.5e12 (20x).
//   Both look like deliberate breather levels or sheet errors; either way they
//   are in the source, and level 29's dip is already present in COST[] today.
//
//   HP3 < HP2 at levels 25 and 39, where the third monster is weaker than the
//   second. Level 39's three values also sum to exactly level 38's total.
//
// ── HOW IT DIFFERS FROM THE COST CURVE IN USE ───────────────────────────────
// LEVEL_DATA.COST does NOT currently match this sheet's Total column, though
// its comment says "verbatim". Levels 13-20, 23, 26-32, 34-38 and 40-64 agree.
// These do not:
//
//   lvl  1    100  vs      175      lvl 11   1200000  vs   2250000
//   lvl  2    350  vs      900      lvl 12   4500000  vs   6000000
//   lvl  3   1800  vs     4000      lvl 21  1.500e9   vs   1.450e9
//   lvl  4   8000  vs    11250      lvl 22  1.800e9   vs   1.840e9
//   lvl  5  22500  vs    21000      lvl 24  3.100e9   vs   3.600e9
//   lvl  6  42000  vs     7500      lvl 25  3.400e9   vs   3.800e9
//   lvl  7  15000  vs    47500      lvl 33  9.000e9   vs   9.100e9
//   lvl  8  95000  vs   115000      lvl 39  1.950e10  vs   1.820e10
//   lvl  9 230000  vs   450000
//
// The early levels diverge most, which is where COST[] was most likely hand-
// tuned for our own opening rather than mis-transcribed. COST[] also has 65
// entries to this sheet's 64: its last value repeats level 64's.
//
// NONE OF THAT IS RESOLVED HERE. This file only records what the sheet says;
// changing the curve in play is a separate decision.
// ============================================================================

// [ HP1, HP2, HP3, TOTAL ] per level. Index 0 is level 1.
var BLUMGI_HP = [
    /*  1 */ [           25,            50,            100,            175],
    /*  2 */ [          150,           250,            500,            900],
    /*  3 */ [          750,          1250,           2000,           4000],
    /*  4 */ [         2500,          3750,           5000,          11250],
    /*  5 */ [         5000,          6000,          10000,          21000],
    /*  6 */ [         2500,          2500,           2500,           7500],
    /*  7 */ [         7500,         15000,          25000,          47500],
    /*  8 */ [        25000,         40000,          50000,         115000],
    /*  9 */ [       150000,        150000,         150000,         450000],
    /* 10 */ [       150000,        200000,         250000,         600000],
    /* 11 */ [       500000,        750000,        1000000,        2250000],
    /* 12 */ [      1500000,       2000000,        2500000,        6000000],
    /* 13 */ [      1800000,       1900000,        1900000,        5600000],
    /* 14 */ [      3500000,       4000000,        4300000,       11800000],
    /* 15 */ [      9000000,       9300000,        9600000,       27900000],
    /* 16 */ [     19000000,      19500000,       20000000,       58500000],
    /* 17 */ [     40000000,      45000000,       50000000,      135000000],
    /* 18 */ [     50000000,      75000000,      100000000,      225000000],
    /* 19 */ [    100000000,     150000000,      200000000,      450000000],
    /* 20 */ [    200000000,     250000000,      300000000,      750000000],
    /* 21 */ [    400000000,     500000000,      550000000,     1450000000],
    /* 22 */ [    550000000,     600000000,      690000000,     1840000000],
    /* 23 */ [    700000000,     800000000,      900000000,     2400000000],
    /* 24 */ [   1200000000,    1200000000,     1200000000,     3600000000],
    /* 25 */ [   1300000000,    1300000000,     1200000000,     3800000000],
    /* 26 */ [   1100000000,    1200000000,     1300000000,     3600000000],
    /* 27 */ [   1300000000,    1400000000,     1500000000,     4200000000],
    /* 28 */ [   1500000000,    1700000000,     1800000000,     5000000000],
    /* 29 */ [     50000000,      75000000,      100000000,      225000000],
    /* 30 */ [   2000000000,    2200000000,     2300000000,     6500000000],
    /* 31 */ [   2200000000,    2400000000,     2600000000,     7200000000],
    /* 32 */ [   2500000000,    2600000000,     2800000000,     7900000000],
    /* 33 */ [   2900000000,    3000000000,     3200000000,     9100000000],
    /* 34 */ [   3000000000,    3300000000,     3500000000,     9800000000],
    /* 35 */ [   3500000000,    3800000000,     4000000000,    11300000000],
    /* 36 */ [   4300000000,    4600000000,     4900000000,    13800000000],
    /* 37 */ [   5000000000,    5300000000,     5600000000,    15900000000],
    /* 38 */ [   5600000000,    6100000000,     6500000000,    18200000000],
    /* 39 */ [   6000000000,    6500000000,     5700000000,    18200000000],
    /* 40 */ [   7000000000,    7500000000,     8000000000,    22500000000],
    /* 41 */ [   8000000000,    9000000000,    10000000000,    27000000000],
    /* 42 */ [  20000000000,   25000000000,    30000000000,    75000000000],
    /* 43 */ [  30000000000,   40000000000,    50000000000,   120000000000],
    /* 44 */ [  50000000000,   60000000000,    70000000000,   180000000000],
    /* 45 */ [  70000000000,   80000000000,    90000000000,   240000000000],
    /* 46 */ [  90000000000,   95000000000,   100000000000,   285000000000],
    /* 47 */ [ 120000000000,  130000000000,   140000000000,   390000000000],
    /* 48 */ [ 140000000000,  160000000000,   180000000000,   480000000000],
    /* 49 */ [ 200000000000,  225000000000,   250000000000,   675000000000],
    /* 50 */ [ 250000000000,  300000000000,   350000000000,   900000000000],
    /* 51 */ [ 400000000000,  450000000000,   500000000000,  1350000000000],
    /* 52 */ [ 500000000000,  600000000000,   750000000000,  1850000000000],
    /* 53 */ [ 750000000000,  900000000000,  1000000000000,  2650000000000],
    /* 54 */ [1000000000000, 1250000000000,  1500000000000,  3750000000000],
    /* 55 */ [1500000000000, 1750000000000,  2000000000000,  5250000000000],
    /* 56 */ [2000000000000, 2250000000000,  2500000000000,  6750000000000],
    /* 57 */ [2500000000000, 2750000000000,  3000000000000,  8250000000000],
    /* 58 */ [3000000000000, 3500000000000,  4000000000000, 10500000000000],
    /* 59 */ [4000000000000, 4500000000000,  5000000000000, 13500000000000],
    /* 60 */ [5000000000000, 5500000000000,  6000000000000, 16500000000000],
    /* 61 */ [6000000000000, 7000000000000,  7500000000000, 20500000000000],
    /* 62 */ [7000000000000, 7500000000000,  8000000000000, 22500000000000],
    /* 63 */ [ 250000000000,  375000000000,   500000000000,  1125000000000],
    /* 64 */ [8000000000000, 9000000000000, 10000000000000, 27000000000000],
];

// Just the Total column, for comparison against LEVEL_DATA.COST.
var BLUMGI_HP_TOTAL = BLUMGI_HP.map(r => r[3]);
