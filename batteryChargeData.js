/**
 * BATTERY DATA FILE
 * 
 * This file contains all battery definitions for the game.
 * 
 * CHARGE VALUES BY LEVEL:
 * - CHARGE_PER_SECOND_BY_LEVEL: Dictionary mapping level numbers to charge values
 * - Edit this to change charge values for any level
 * - Easy to find and edit specific levels (e.g., level 50 without counting)
 * 
 * BATTERY APPEARANCE DATA:
 * - BATTERY_TYPES: Array of battery type definitions
 * - Each entry has:
 *   - name: Display name for the battery (e.g., "Lamp", "Suitcase", etc.)
 *   - count: Number of sub-types (2 or 3) for that battery
 * - File names are auto-generated from display names
 *   Example: { name: 'Lamp', count: 3 } creates lamp_1.png, lamp_2.png, lamp_3.png
 * 
 * IMPORTANT: Charge values are SEPARATE from battery appearance
 * - You can freely reorder batteries in BATTERY_TYPES without affecting charge values
 * - Charge values are always determined by the player's level, not by battery type
 * 
 * All sprite files should be placed in: graphics/battery/
 * For example: graphics/battery/lamp_1.png, graphics/battery/suitcase_1.png
 * 
 * File names are auto-generated: display name → lowercase → spaces to underscores → add _1, _2, _3
 */

// ==================================================================================
// CHARGE VALUES BY LEVEL
// ==================================================================================
// Dictionary mapping level number to charge per second value
// Edit any level's value directly - easy to find and modify!


// ==================================================================================
// BATTERY APPEARANCE DATA
// ==================================================================================
// Array of battery types in order. Each entry has:
//   - name: Display name for the battery
//   - count: Number of sub-types (2 or 3) - use 2 for faster progression, 3 for more variation
// 
// To reorder batteries: Just rearrange this array!
// To change sub-types: Change count from 3 to 2 (or vice versa)
// 
// Example: Entry 1 is 'Jars' with count 3
//   - Covers levels: 1, 2, 3
//   - Files: jars_1.png, jars_2.png, jars_3.png
// Example: Entry 2 is 'Trump' with count 2
//   - Covers levels: 4, 5
//   - Files: trump_1.png, trump_2.png
var BATTERY_TYPES_RESERVE = [
    { name: 'Socks', count: 3 },
    { name: 'Feather', count: 3 },
    { name: 'Scissor', count: 3 },
    { name: 'Jar', count: 3 },
    { name: 'Jars', count: 3 },
    { name: 'Lamp', count: 3 },
    { name: 'Compass', count: 3 },
    { name: 'Skirt', count: 3 },
    { name: 'Palm', count: 3 },
    { name: 'Book', count: 3 },
    { name: 'Test Tube', count: 3 },
    { name: 'Banana', count: 3 },
    { name: 'Violin', count: 3 },
    { name: 'Spider', count: 3 },
    { name: 'Diaper', count: 3 },
    { name: 'Mask', count: 3 },
    { name: 'Bishop', count: 3 },
    { name: 'Turtle', count: 3 },
    { name: 'Dragon', count: 3 },
    { name: 'Lion', count: 3 },
    { name: 'Rat', count: 3 },
];
var BATTERY_TYPES = [
{ name: 'Battery', count: 3 },        // 1
{ name: 'Star', count: 3 },           // 2
{ name: 'Shield', count: 3 },         // 3
{ name: 'Fire', count: 3 },           // 4
{ name: 'Jug', count: 3 },            // 5
{ name: 'Apple', count: 3 },          // 6
{ name: 'Mango', count: 3 },          // 7
{ name: 'Ghost', count: 3 },          // 8
{ name: 'Camera', count: 3 },         // 9
{ name: 'Clock', count: 3 },          // 10
{ name: 'Suitcase', count: 3 },       // 11
{ name: 'Briefcase', count: 3 },      // 12
{ name: 'Jerrycan', count: 3 },       // 13
{ name: 'Piggy Bank', count: 3 },     // 14
{ name: 'Poop', count: 3 },           // 15
{ name: 'Burger', count: 3 },         // 16
{ name: 'Toilet', count: 3 },         // 17
{ name: 'Snowman', count: 3 },        // 18
{ name: 'Solar', count: 3 },          // 19
{ name: 'Butterfly', count: 3 },      // 20
{ name: 'Dove', count: 3 },           // 21 (Pigeon)
{ name: 'Frog', count: 3 },           // 22
{ name: 'Mouse', count: 3 },          // 23
{ name: 'Rabbit', count: 3 },         // 24
{ name: 'Octopus', count: 3 },        // 25
{ name: 'Eagle', count: 3 },          // 26
{ name: 'Horse Head', count: 3 },     // 27
{ name: 'Dolphin', count: 3 },        // 28
{ name: 'Unicorn', count: 3 },        // 29
{ name: 'Elephant', count: 3 },       // 30
{ name: 'Baby', count: 3 },           // 31
{ name: 'Heart', count: 3 },          // 32
{ name: 'Trump', count: 3 },          // 33
{ name: 'King', count: 3 },           // 34

    // Add more battery types here as needed
    // You can also change 'count: 3' to 'count: 2' for any battery type
];
var CHARGE_PER_SECOND_BY_LEVEL = {
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
    100: 500000000000
};

// ==================================================================================
// HELPER FUNCTIONS - Used by the game code
// ==================================================================================

// Build a lookup table: level → { batteryType, positionInType }
var LEVEL_TO_BATTERY_INFO = {};
(function() {
    let currentLevel = 1;
    BATTERY_TYPES.forEach((batteryType, index) => {
        for (let i = 1; i <= batteryType.count; i++) {
            LEVEL_TO_BATTERY_INFO[currentLevel] = {
                name: batteryType.name,
                position: i,
                typeIndex: index + 1
            };
            currentLevel++;
        }
    });
})();

// Helper function to convert display name to file name base
function displayNameToFileBase(displayName) {
    return displayName.toLowerCase().replace(/ /g, '_');
}

// Get battery info for a level
function getBatteryInfo(level) {
    return LEVEL_TO_BATTERY_INFO[level] || null;
}

// Get battery display name by level
function getBatteryDisplayName(level) {
    const info = getBatteryInfo(level);
    return info ? info.name : `Battery ${level}`;
}

// Get battery file name by level (auto-generated from display name)
function getBatteryFileName(level) {
    const info = getBatteryInfo(level);
    if (!info) return `battery_${level}.png`;
    
    const fileBase = displayNameToFileBase(info.name);
    return `${fileBase}_${info.position}.png`;
}

// Get battery data by level (returns object with fileName and displayName)
function getBatteryData(level) {
    const info = getBatteryInfo(level);
    if (!info) {
        return { fileName: `battery_${level}.png`, displayName: `Battery ${level}` };
    }
    
    const displayName = info.name;
    const fileBase = displayNameToFileBase(info.name);
    const fileName = `${fileBase}_${info.position}.png`;
    return { fileName, displayName };
}

// Get charge value for a battery level
function getBatteryChargeValue(level) {
    return CHARGE_PER_SECOND_BY_LEVEL[level] || (level * 5); // Fallback for undefined levels
}

// Get the highest available battery level
function getHighestBatteryLevel() {
    return Math.max(...Object.keys(LEVEL_TO_BATTERY_INFO).map(Number));
}

// Get all battery levels that have data defined
function getAllBatteryLevels() {
    return Object.keys(LEVEL_TO_BATTERY_INFO).map(Number).sort((a, b) => a - b);
}
// function loadBatteryImageIfNeeded(scene, level) {
//     const key = `battery${level}`;
//     if (scene.textures.exists(key)) return; // already loaded, skip
    
//     const batteryData = getBatteryData(level);
//     if (!batteryData) return;
    
//     scene.load.image(key, `graphics/battery/${batteryData.fileName}`);
//     scene.load.start(); // fires instantly, non-blocking
// }


// function loadBatteryImageIfNeeded(scene, level, callback) {
//     const key = `battery${level}`;
    
//     // Already loaded - call callback immediately
//     if (scene.textures.exists(key)) {
//         if (callback) callback();
//         return;
//     }
    
//     const batteryData = getBatteryData(level);
//     if (!batteryData) {
//         if (callback) callback();
//         return;
//     }
    
//     // Listen for this specific texture to finish loading
//     scene.load.once(`filecomplete-image-${key}`, () => {
//         if (callback) callback();
//     });
    
//     scene.load.image(key, `graphics/battery/${batteryData.fileName}`);
//     scene.load.start();
// }

// Create lookup tables for legacy compatibility
var BATTERY_DATA_BY_LEVEL = {};
var BATTERY_CHARGE_TABLE = {}; // Legacy compatibility

// Populate legacy lookup tables
Object.keys(LEVEL_TO_BATTERY_INFO).forEach(level => {
    level = Number(level);
    BATTERY_DATA_BY_LEVEL[level] = getBatteryData(level);
    BATTERY_CHARGE_TABLE[level] = CHARGE_PER_SECOND_BY_LEVEL[level] || (level * 5);
});

// ==================================================================================
// EXAMPLES OF HOW THE NEW SYSTEM WORKS
// ==================================================================================
// 
// BATTERY_TYPES is a simple array with index and count:
//   Index 1: { name: 'Jars', count: 3 } → Levels 1, 2, 3 (jars_1.png, jars_2.png, jars_3.png)
//   Index 2: { name: 'Trump', count: 3 } → Levels 4, 5, 6 (trump_1.png, trump_2.png, trump_3.png)
//   Index 3: { name: 'Banana', count: 3 } → Levels 7, 8, 9 (banana_1.png, banana_2.png, banana_3.png)
//
// If you change count to 2:
//   Index 2: { name: 'Trump', count: 2 } → Levels 4, 5 (trump_1.png, trump_2.png)
//   Index 3: { name: 'Banana', count: 3 } → Levels 6, 7, 8 (banana_1.png, banana_2.png, banana_3.png)
//
// EXAMPLE 1: Level 1
//   - Battery Type: Entry 1 in BATTERY_TYPES ('Jars')
//   - Display Name: "Jars"
//   - File Name: "jars_1.png" (position 1 of 3)
//   - Charge: 5 (from CHARGE_PER_SECOND_BY_LEVEL[1])
//
// EXAMPLE 2: Level 6
//   - Battery Type: Entry 2 in BATTERY_TYPES ('Trump')
//   - Display Name: "Trump"
//   - File Name: "trump_3.png" (position 3 of 3)
//   - Charge: 37 (from CHARGE_PER_SECOND_BY_LEVEL[6])
//
// EXAMPLE 3: Level 19
//   - Battery Type: Entry 7 in BATTERY_TYPES ('Spider Web')
//   - Display Name: "Spider Web"
//   - File Name: "spider_web_1.png" (spaces→underscores, position 1)
//   - Charge: 7389 (from CHARGE_PER_SECOND_BY_LEVEL[19])
//
// TO REORDER BATTERIES:
// Just rearrange entries in BATTERY_TYPES array!
// Example: Swap entries 1 and 2 to put Trump before Jars
//
// TO CHANGE SUB-TYPE COUNT:
// Change 'count: 3' to 'count: 2' for faster progression
// Example: { name: 'Trump', count: 2 } means only trump_1.png and trump_2.png
//
// TO REMOVE BATTERIES TO FIT 100 LEVELS:
// Delete entries from BATTERY_TYPES or adjust their counts
//
// TO CHANGE CHARGE VALUES:
// Edit CHARGE_PER_SECOND_BY_LEVEL - e.g., to change level 50: just find "50:" and edit the value!
