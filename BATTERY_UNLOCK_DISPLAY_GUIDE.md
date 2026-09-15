# Battery Unlock Display Feature Guide

## Overview
A **permanent** display above the merge grid shows the highest unlocked battery level with optional crown icon, battery icon, and battery name. The display updates ONLY when a new battery level is unlocked for the first time.

## Features Implemented
✅ **Permanent display** - stays visible, never fades away  
✅ Shows the **highest unlocked battery** level  
✅ Updates **only on first unlock** of each new battery level  
✅ Displays initial battery name when game starts  
✅ Adds "Battery" suffix to display names (e.g., "Suitcase Battery")  
✅ Positioned above merge grid on the left side  
✅ **Hidden during tutorial** - appears below tutorial overlay at start  
✅ **Toggleable elements** - crown and battery icons can be shown/hidden independently  
✅ **Smart positioning** - hidden elements don't leave empty space  
✅ All visual properties and positioning are fully configurable

## How It Works

### Display Logic
1. **Game Start**: Shows the initial battery level (e.g., "Suitcase Battery" if starting at level 16)
2. **First Merge to Level 2**: Updates to show "Battery 2 Battery" (first time unlocking level 2)
3. **Second Merge to Level 2**: NO update (level 2 already unlocked)
4. **Merge to Level 3**: Updates to show "Battery 3 Battery" (first time unlocking level 3)
5. **Upgrade via Ad**: Updates if the upgrade unlocks a NEW highest battery level
6. And so on...

### Example Flow
```
Start:        👑 Suitcase Battery     (level 16 - initial)
Merge 16+16:  👑 Briefcase Battery    (level 17 - NEW highest)
Upgrade All:  👑 Lamp Battery         (level 18 - NEW highest via upgrade button)
Merge 16+16:  👑 Lamp Battery         (NO CHANGE - level 17 already seen)
Merge 18+18:  👑 Battery 25 Battery   (level 19+)
```

### How Updates Trigger
The panel updates when unlocking a **NEW highest level** through:
- ✅ **Merging batteries** in the grid
- ✅ **Upgrade button** (after watching ad) - NEW FIX!
- ⚠️ Panel only updates if the new level is HIGHER than any previously unlocked level

### Battery Display Name + "Battery" Suffix
From **`batteryChargeData.js`**, the display shows `displayName + " Battery"`:
```javascript
{ level: 4, fileName: 'test_tube_1.png', displayName: 'Test Tube' }
// Shows as: "Test Tube Battery"

{ level: 16, fileName: 'suitcase_1.png', displayName: 'Suitcase' }
// Shows as: "Suitcase Battery"
```

## Configuration Options

All settings are in **`config.js`** under the **`BATTERY_UNLOCK_DISPLAY`** section:

### Master Toggle - **CONTROL ENTIRE PANEL**
```javascript
DISPLAY_CROWN_PANEL: true  // Master toggle for entire crown panel (true = show, false = hide everything)
```
- **DISPLAY_CROWN_PANEL**: Master switch that controls the entire panel
  - Set to `false` to completely hide the crown panel (no elements will be created or shown)
  - Set to `true` to show the panel (default) - individual element toggles below still apply
  - **Use this when**: You want to completely disable the feature or test the game without it

### Element Toggles - **SHOW/HIDE ELEMENTS** (only applies if DISPLAY_CROWN_PANEL is true)
```javascript
SHOW_CROWN_ICON: true      // Toggle crown icon visibility (true = show, false = hide)
SHOW_BATTERY_ICON: true    // Toggle battery icon visibility (true = show, false = hide)
```
- **SHOW_CROWN_ICON**: Controls crown icon visibility (👑)
  - Set to `false` to hide crown icon - battery icon (if enabled) will start right after padding
  - Set to `true` to show crown icon (default)
- **SHOW_BATTERY_ICON**: Controls battery sprite icon visibility (🔋)
  - Set to `false` to hide battery sprite - text will start right after crown (if enabled) or padding
  - Set to `true` to show battery sprite icon (default)
- **Smart positioning**: Hidden elements don't leave empty space. The display automatically adjusts layout based on which elements are enabled.

### Icon Configuration
```javascript
CROWN_ICON_SIZE: 32        // Width and height of crown icon (pixels)
BATTERY_ICON_SIZE: 32      // Width and height of battery icon (pixels)
```
- **CROWN_ICON_SIZE**: Controls the size of the battery_crown.png icon
- **BATTERY_ICON_SIZE**: Controls the size of the battery sprite icon (shows actual battery at highest level)
- **Default**: Both 32x32 pixels
- **How to modify**: Change the numbers to make icons larger/smaller

### Text Configuration
```javascript
TEXT_SIZE: '20px'                    // Font size for battery display name
TEXT_COLOR: '#FFD700'                 // Gold color for text
TEXT_STROKE_COLOR: '#8B4513'          // Brown outline color for text
TEXT_STROKE_THICKNESS: 4              // Outline thickness (pixels)
```
- **TEXT_SIZE**: Controls the font size of the display name (includes "Battery" suffix)
- **TEXT_COLOR**: Main text color (hex format)
- **TEXT_STROKE_COLOR**: Outline/stroke color for better visibility
- **TEXT_STROKE_THICKNESS**: How thick the outline is (higher = bolder)

### Layout Configuration - **KEY POSITIONING CONTROLS**
```javascript
CROWN_BATTERY_SPACING: 8       // Spacing between crown icon and battery icon (pixels)
BATTERY_TEXT_SPACING: 5        // Spacing between battery icon and text (pixels)
VERTICAL_OFFSET: 3             // Distance from grid panel top edge (pixels)
PADDING_FROM_LEFT: 10          // Distance from grid panel left edge (pixels)
```
- **CROWN_BATTERY_SPACING**: Horizontal gap between crown icon and battery icon
- **BATTERY_TEXT_SPACING**: Horizontal gap between battery icon and display name text (smaller gap)
- **VERTICAL_OFFSET**: Vertical position above grid panel
  - **Increase** to move display **UP** (away from grid)
  - **Decrease** to move display **DOWN** (closer to grid)
  - Example: `VERTICAL_OFFSET: 50` moves it much higher
- **PADDING_FROM_LEFT**: Horizontal position from left edge of grid panel
  - **Increase** to move display **RIGHT** (away from left edge)
  - **Decrease** to move display **LEFT** (closer to left edge)
  - Example: `PADDING_FROM_LEFT: 40` moves it further right

## Visual Layout
```
👑 🔋 Suitcase Battery  (permanent unlock display - left side)
                                          1000 💰  (coin counter - right side)
        ┌────────────────────────────┐
        │  [🔋]  [🔋]  [🔋]          │
        │  [🔋]  [🔋]  [🔋]   Grid   │
        │  [🔋]  [🔋]  [🔋]          │
        └────────────────────────────┘
                  [ SPAWN ]
```

- Coin counter positioned on the RIGHT above grid panel
- Unlock display on the LEFT side above grid panel
- **Layout**: Crown icon (32x32) → Gap → Battery icon (32x32) → Small gap → Display name
- Crown icon shows achievement status
- Battery icon shows the actual sprite of the highest unlocked battery
- Display name with "Battery" suffix
- **PERMANENT** - never fades or disappears
- Positioned using padding from left edge of grid panel

## Quick Customization Examples

### Completely disable the crown panel
```javascript
DISPLAY_CROWN_PANEL: false  // Hides entire panel (master toggle)
```
Result: Panel is not created at all - no elements, no processing, completely disabled

### Hide crown icon (show only battery icon + text)
```javascript
DISPLAY_CROWN_PANEL: true   // Panel enabled (default: true)
SHOW_CROWN_ICON: false      // No crown
SHOW_BATTERY_ICON: true     // Keep battery icon
```
Result: `🔋 Suitcase Battery` (no empty space where crown was)

### Hide battery icon (show only crown + text)
```javascript
DISPLAY_CROWN_PANEL: true   // Panel enabled (default: true)
SHOW_CROWN_ICON: true       // Keep crown
SHOW_BATTERY_ICON: false    // No battery sprite
```
Result: `👑 Suitcase Battery` (no empty space where battery icon was)

### Show only text (no icons)
```javascript
DISPLAY_CROWN_PANEL: true   // Panel enabled (default: true)
SHOW_CROWN_ICON: false      // No crown
SHOW_BATTERY_ICON: false    // No battery icon
```
Result: `Suitcase Battery` (text starts right after padding)

### Make icons bigger
```javascript
CROWN_ICON_SIZE: 48       // Larger crown (default: 32)
BATTERY_ICON_SIZE: 48     // Larger battery icon (default: 32)
```

### Move display higher above grid
```javascript
VERTICAL_OFFSET: 50  // Move up (default: 3)
```

### Move display further right
```javascript
PADDING_FROM_LEFT: 40  // Move away from left edge (default: 10)
```

### Adjust spacing between elements
```javascript
CROWN_BATTERY_SPACING: 12  // More space between crown and battery (default: 8)
BATTERY_TEXT_SPACING: 8    // More space between battery and text (default: 5)
### Make text bigger and bolder
```javascript
TEXT_SIZE: '24px'              // Increase font size
TEXT_STROKE_THICKNESS: 6       // Thicker outline
```

### More spacing between icon and text
```javascript
BATTERY_TEXT_SPACING: 10  // More gap between battery and text (default: 5)
```

### Change text color to bright yellow
```javascript
TEXT_COLOR: '#FFFF00'         // Bright yellow
TEXT_STROKE_COLOR: '#FF6600'  // Orange outline
```

## Technical Details

### Tutorial Behavior
- **Display depth**: Set to depth 10 (same as coin display)
- **Tutorial overlay depth**: Set to depth 99
- **Result**: During tutorial, the unlock display is **hidden behind the tutorial mask**
- **After tutorial**: Display becomes visible when overlay fades away
- ⚠️ **Important for new elements**: Any new UI elements added above the grid should use depth ≤ 10 to stay below the tutorial overlay

### Files Modified
1. **`config.js`**: 
   - Updated `BATTERY_UNLOCK_DISPLAY` configuration section
   - Added `DISPLAY_CROWN_PANEL` master toggle
   - Added `SHOW_CROWN_ICON` and `SHOW_BATTERY_ICON` element toggles
   - Added `BATTERY_ICON_SIZE` configuration
   - Renamed `ICON_TEXT_SPACING` to `CROWN_BATTERY_SPACING` and `BATTERY_TEXT_SPACING`
   - Added `PADDING_FROM_LEFT` (replaced `HORIZONTAL_OFFSET`)
   - Removed animation configs (display is now permanent)
   
2. **`game.js`**: 
   - Added `highestUnlockedBatteryLevel` tracking
   - Added `unlockDisplayBatteryIcon` property for battery icon sprite
   - Created `createBatteryUnlockDisplay()` method with:
     - Master toggle check (early return if disabled)
     - Conditional element creation based on toggles
   - **Smart positioning**: Elements are positioned dynamically - hidden elements don't leave gaps
   - Created `updateBatteryUnlockDisplay()` method with:
     - Panel existence check (for master toggle)
     - Updates text and battery icon texture when new level unlocked
   - Created `showBatteryUnlockDisplay()` method with:
     - Panel existence check (for master toggle)
     - Only triggers on NEW highest level
   - Updated `levelUpAll()` method (upgrade button) to call `showBatteryUnlockDisplay()` - **NEW FIX**
   - Automatically adds " Battery" suffix to display names
   - **Depth management**: Set to depth 10 to stay below tutorial overlay (99)
   - Display is created once and persists throughout the game

### Asset Required
- **`graphics/battery_crown.png`**: Crown icon (already exists in your project)
- **Battery sprites**: Uses the same battery sprites from the game grid

### Display Logic Flow
1. **Game starts** → Creates permanent display with initial battery level (conditionally includes crown + battery icon + text based on toggles)
2. **Merge occurs** OR **Upgrade button clicked** → Checks if result is higher than `highestUnlockedBatteryLevel`
3. **If higher** → Updates display text and battery icon texture to match new level
4. **If not higher** → No change to display

### Behavior Examples
- Start at level 16: Shows "👑 🔋(suitcase) Suitcase Battery"
- Merge to level 17 (first time): Updates to "👑 🔋(briefcase) Briefcase Battery"
- Upgrade all batteries (reaches level 18): Updates to "👑 🔋(lamp) Lamp Battery" - **NEW!**
- Merge to level 17 again: NO change (already unlocked)
- Merge to level 18: NO change (already unlocked via upgrade)

**Note**: The battery icon (🔋) changes to show the actual battery sprite for each level!

## Testing Tips
1. Start the game → should see initial battery name (e.g., "Suitcase Battery")
2. Merge two batteries → display updates if new highest level
3. Merge same level again → display should NOT change
4. Adjust `VERTICAL_OFFSET` and `HORIZONTAL_OFFSET` in config to reposition
5. The display persists and never fades away

---

**Note**: The display now shows ONLY when unlocking a NEW highest battery level for the first time. It's permanent and always visible, showing your current best battery achievement with the " Battery" suffix automatically added.
