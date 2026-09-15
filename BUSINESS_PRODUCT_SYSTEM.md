# Business and Product System Documentation

## Overview
Each level can now have its own business building sprite (e.g., pizza shop, library) and collectible product items (e.g., pizza, books).

**Key Files:**
- `catalogData.js` - Central catalog of all businesses and products (add new items here)
- `config.js` - References the catalog arrays
- `game.js` - Loads and displays businesses and products based on level data
- `levels.json` - Specifies which business and product to use per level

## What Was Fixed
1. **Parking Area Cleanup**: Fixed issue where parking areas from previous levels were not removed when spawning new levels. Old parking elements, business sprites, and product sprites are now properly destroyed when loading a new level.

## Implementation Details

### 1. Configuration (catalogData.js)
**NEW: Separate catalog file for easier management**

All businesses and products are now defined in `catalogData.js` (instead of `config.js`) to keep things organized as you scale to 50+ entries:

```javascript
var CATALOG = {
    BUSINESSES: [
        {
            label: "pizza_shop",
            fileName: "pizza_shop.png"
            // spriteKey is auto-generated from fileName (removes extension)
            // Result: spriteKey = "pizza_shop"
        },
        {
            label: "library",
            fileName: "library.png"
        }
    ],
    
    PRODUCTS: [
        {
            label: "pizza",
            fileName: "pizza.png"
        },
        {
            label: "book",
            fileName: "book.png"
        }
    ]
};
```

**Why no spriteKey?** The sprite key is automatically derived from the filename (removes the extension), so you only need to specify the `fileName`. This reduces redundancy and makes it simpler to add new items.

The catalog is then referenced in `config.js`:
```javascript
BUSINESSES: CATALOG.BUSINESSES,
PRODUCTS: CATALOG.PRODUCTS,
```

### 2. Level Data (levels.json)
Each level now has two new properties:
- `business`: Label of the business to display (e.g., "pizza_shop", "library")
- `product`: Label of the collectible product (e.g., "pizza", "book")

All current levels default to:
```json
{
  "business": "pizza_shop",
  "product": "pizza"
}
```

### 3. Game Code Changes
- **Scene Properties**: Added tracking properties for business and product sprites
- **Preload**: Business and product images are loaded dynamically from CONFIG
- **Load Level**: Calls `spawnBusinessAndProducts()` to create level-specific sprites
- **Clear Parking Area**: Destroys business and product sprites when loading new levels
- **Create Products**: Uses the current level's product sprite instead of always using pizza

## How to Add New Businesses and Products

### Adding a New Business:
1. Add business sprite image to `graphics/businesses/` folder
2. Add entry to `CATALOG.BUSINESSES` in `catalogData.js`:
```javascript
{
    label: "bookstore",
    fileName: "bookstore.png"
    // spriteKey will auto-generate as "bookstore"
}
```

### Adding a New Product:
1. Add product sprite image to `graphics/products/` folder
2. Add entry to `CATALOG.PRODUCTS` in `catalogData.js`:
```javascript
{
    label: "newspaper",
    fileName: "newspaper.png"
    // spriteKey will auto-generate as "newspaper"
}
```

**Note:** The `spriteKey` is automatically generated from the filename by removing the extension. You don't need to specify it unless you want a different key than the filename.

### Using in Levels:
In `levels.json`, set the business and product for any level:
```json
{
  "grid": { ... },
  "parking": { ... },
  "road": { ... },
  "cars": [ ... ],
  "business": "library",
  "product": "book"
}
```

## Current Assets
- **Business Sprites**: `pizza_shop.png`, `library.png` (in graphics/businesses/)
- **Product Sprites**: `pizza.png`, `book.png` (in graphics/products/)

Note: `book.png` is currently a placeholder (copy of pizza.png). Replace it with an actual book sprite when available.

## Testing
1. Start the game and complete level 1 with pizza shop
2. Progress to level 2 - verify the pizza shop from level 1 is removed
3. Verify products (pizzas) display correctly on the counter
4. To test different businesses/products, edit a level in levels.json to use "library" and "book"

## Future Enhancements
- Add more business types (cafe, gas station, etc.)
- Add more product types (coffee, fuel, etc.)
- Different product positioning based on business type
- Animated business sprites
- Sound effects per business/product type
