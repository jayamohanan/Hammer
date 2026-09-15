# Battery Customization Guide

## Overview

The battery system now gives you **complete freedom** to name your battery sprite files however you want! No more being restricted to `Battery1.png`, `Battery2.png`, etc.

## How It Works

All battery data is defined in **`batteryChargeData.js`**. This file contains an array of battery objects where you can specify:

- **level**: The battery tier/level (1, 2, 3, etc.)
- **fileName**: The sprite file name (ANY name you want!)
- **displayName**: The name shown to players
- **chargePerMinute**: How much charge this battery produces per minute

## Quick Start Examples

### Example 1: Using a Lamp for Level 1
```javascript
{ 
    level: 1, 
    fileName: 'lamp_1.png', 
    displayName: 'Desk Lamp', 
    chargePerMinute: 5 
}
```
Place your sprite at: `graphics/battery/lamp_1.png`

### Example 2: Using a Suitcase for Level 4
```javascript
{ 
    level: 4, 
    fileName: 'suitcase_1.png', 
    displayName: 'Travel Battery', 
    chargePerMinute: 16 
}
```
Place your sprite at: `graphics/battery/suitcase_1.png`

### Example 3: Using Any Crazy Name
```javascript
{ 
    level: 10, 
    fileName: 'super_awesome_battery_v2_final.png', 
    displayName: 'Mega Battery', 
    chargePerMinute: 192 
}
```
Place your sprite at: `graphics/battery/super_awesome_battery_v2_final.png`

## File Structure

```
Battery-Merge/
├── batteryChargeData.js          ← Edit this to customize batteries
├── graphics/
│   └── battery/                  ← Put your sprite files here
│       ├── lamp_1.png
│       ├── lamp_3.png
│       ├── suitcase_1.png
│       ├── flashlight_blue.png
│       └── ...any other names!
```

## Customizing Batteries

1. **Open** `batteryChargeData.js`
2. **Find** the battery level you want to customize in the `BATTERY_DATA` array
3. **Change** the `fileName` to whatever you want
4. **Change** the `displayName` if desired
5. **Save** the file
6. **Add** your sprite file to `graphics/battery/` with the exact name you specified

## Example: Customizing Level 1-3

Let's say you want to use themed sprites:

```javascript
var BATTERY_DATA = [
    // Level 1: Lamp theme
    { 
        level: 1, 
        fileName: 'lamp_small.png', 
        displayName: 'Small Lamp', 
        chargePerMinute: 5 
    },
    
    // Level 2: Still lamp theme but bigger
    { 
        level: 2, 
        fileName: 'lamp_medium.png', 
        displayName: 'Medium Lamp', 
        chargePerMinute: 7 
    },
    
    // Level 3: Switch to flashlight theme
    { 
        level: 3, 
        fileName: 'flashlight_01.png', 
        displayName: 'Flashlight', 
        chargePerMinute: 11 
    },
    
    // ... rest of your batteries
];
```

Then add these files:
- `graphics/battery/lamp_small.png`
- `graphics/battery/lamp_medium.png`
- `graphics/battery/flashlight_01.png`

## Important Notes

- **File Location**: All battery sprites must be in the `graphics/battery/` folder
- **File Names**: Can be ANYTHING - no rules or restrictions!
- **Display Names**: Can be anything you want to show players
- **Levels**: Should be sequential (1, 2, 3, etc.) but you can skip levels if needed
- **Charge Values**: Can be customized for each battery

## Testing Your Changes

1. Open `index.html` in your browser
2. Check the browser console for any warnings about missing files
3. Play the game and verify your custom sprites appear correctly

## Future: Vehicle Customization

In the future, we may create a similar system for vehicles (`vehicleData.js`) that allows you to customize vehicle sprites with the same freedom!

## Troubleshooting

**Q: My battery sprite isn't showing up**
- Check that the file name in `batteryChargeData.js` exactly matches the file name in `graphics/battery/`
- File names are case-sensitive! `Lamp_1.png` ≠ `lamp_1.png`
- Check the browser console for error messages

**Q: I want to use a different file format (SVG, JPG, etc.)**
- Just change the extension in the `fileName` field: `lamp_1.svg`, `lamp_1.jpg`, etc.
- Make sure the file actually exists in `graphics/battery/`

**Q: Can I skip battery levels?**
- Yes! You don't need to have batteries for every level. The game will only load what you define in `BATTERY_DATA`.
