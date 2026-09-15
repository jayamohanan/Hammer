# Tile art style lock

Prompt headers for generating tile art (Gemini / ChatGPT). Copy the blocks verbatim.

> **Maintenance rule:** this file is the single source of truth for the art style.
> It is only edited with the owner's explicit permission — if a chat discussion
> changes the style, the change lands here in the same breath, not just in the chat.

**Current style:** three-quarter top-down (Stardew Valley), smooth / painterly,
square axis-aligned grid, 128×128 export.

---

## 1. Style lock — paste at the top of EVERY prompt

```
Three-quarter top-down view, camera roughly 60 degrees above the horizon,
in the style of Stardew Valley. The ground plane is seen from above on a
square axis-aligned grid — NOT isometric, no diagonal or diamond tiles,
no rotation. Objects standing on the ground are drawn facing the viewer
with visible height.
Cozy 2D farming game art. Smooth painterly finish, soft clean edges,
subtle shading — not pixel art. Flat even lighting, no cast shadows from
off-screen, no vignette, no gradient across the tile. Clean readable
shapes with light texture detail. 

One square tile filling the entire
frame edge to edge — no border, no frame, no padding, no drop shadow
crossing the edge.
Palette limited to: grass #8ed04f, dark grass #6ea83a, tilled soil
#84694a, dark soil #5f4a33, water #2f8fd0, shallow water #7fd4f0,
stone #9a9a90, wood #b49c74, dark wood #7a6348. No text, no labels,
no watermark, no UI elements.
```

The palette hexes are the game's own colours — `LAND_COLOR`, `WATER.COLOR`,
`WATER.EDGE_COLOR`, `TUNNEL.CUT_COLOR` in [config.js](../config.js). Keep them in sync.

**Wood** is deliberately low-saturation (~30%) muted honey-oak, not a warm
red-brown — see [FENCE_STYLE.md](FENCE_STYLE.md), which owns all timber art and
the reasoning behind those two hexes.

---

## 2. Append ONE of these, depending on the tile's job

### 2a. Ground tile — grass, soil, canal beds (these butt against neighbours)

```
Seamlessly tileable: the left edge must match the right edge and the top
must match the bottom when repeated. Opaque, fills the whole frame.
```

### 2b. Object sprite — crops, props (these sit ON a ground tile)

```
Character-facing view with visible height. Subject stands on the bottom
edge of the frame, taller than wide, with a soft shadow ellipse at its
base. Centered horizontally, nothing touching the left or right edges.
Fully transparent background, PNG with alpha.
```

---

## 3. Canal tiles — two layers, both revealed continuously

A canal is **two separate tile layers stacked**, and the game reveals each with a growing
mask — so a channel is uncovered smoothly as the auger and the water move through it, **not
popped in one whole tile at a time.** Even a single cell shows partially while the blade is
crossing it.

| Layer | Tile | Revealed by | Shows |
|---|---|---|---|
| **Ditch** | `main_*`, `ditch_*` | the **dig** mask (grows with the auger) | dry trench — banks, depth, floor |
| **Water** | `water.png` | the **flow** mask (grows with the waterline, lags the blade) | the blue, tiled along the channel |

So the ditch tile is the "dug but dry" state; the water tile is drawn on top and chases it.
The gap between the two fronts is the freshly-dug dry stretch under the machine.

### The DRY rule still holds — for the ditch layer

**Ditch tiles carry no blue, ever.** The water is its own tile on its own layer. If a ditch
tile had water painted in, every channel would look full before it was dug or flooded, and
both masks would have nothing to reveal. Ditch = dry trench; blue = the water tile.

### Continuous reveal → two art requirements

1. **Seamless along the channel.** A straight run is several cells of the same tile stacked,
   revealed gradually across the boundary — so a `main_ns` above another `main_ns` must line
   up exactly (channel walls continuous top edge → bottom edge). Same for the `water` tile:
   it is tiled along the channel and must repeat with no seam.
2. **Depth, not a flat stripe.** The whole reason these are tiles now: show the trench cut
   *into* the land. Visible banks, a darker floor than the rim, and a strip of ground on each
   side of the channel — so the auger reads as carving a real ditch, not recolouring a band.

Suffix for a ditch tile (append to the ground-tile suffix):

```
A dry empty irrigation ditch cut into the soil, seen in three-quarter
view so the trench has visible depth. Banks of raised soil run along the
channel with a darker floor between them; plain ground shows on each side
of the channel. Damp dark soil, completely dry — no water anywhere.
```

Suffix for the `water.png` tile (this one IS water):

```
A seamless tiling water surface texture, top-down, gentle ripples and a
few soft light glints. Mid blue #2f8fd0 with shallow highlights #7fd4f0.
No banks, no soil, no edges — only water, edge to edge, tileable in both
directions.
```

**Channel width must match the code**, centred and running edge to edge. Two widths only:

| Class | Width (fraction of tile) | Used by |
|---|---|---|
| **Main canal** | 0.85 | the `main_*` tiles (the dug column) |
| **Branch** (sub / sub-sub) | 0.42 | the `ditch_*` tiles and the narrow stubs on main junctions |

If the drawn channel is off-centre or the wrong width, the water tile will overhang its banks.

---

## 4. Crops — soil tile + plant overlay

One seamless `soil.png` reused by every crop, plus a transparent plant sprite per crop per
growth stage. Never bake soil and plants into one image — that would need a seam-matched
soil per crop and triple the full-size art.

Stardew read: soil covers the whole tile, **3–4 distinct countable plants** on it — not a
dense wall of grain.

```
graphics/tiles/soil.png              ← one, reused by every crop
graphics/crops/<crop>_seed.png       ← transparent overlay
graphics/crops/<crop>_mid.png
graphics/crops/<crop>_grown.png
```

---

## 5. Output spec

- **128 × 128 PNG.** A tile draws at ~47 CSS px, doubled on retina — 64 would go soft.
- Generate at 1024² and downscale; downscaling hides a lot of sloppiness.
- Object sprites are taller than wide — 128 × ~176 — anchored at the bottom.
- Ground tiles → `graphics/tiles/`, crops → `graphics/crops/`, named exactly as the tile key.

---

## 6. Two tricks that matter more than prompt wording

1. **Generate the set as one sheet, then slice.** Ask for "a 4×3 grid of separate square
   tiles on one image, thin white gridlines between them", listing the subjects. Models hold
   style far better *within* one image than across separate generations.
2. **Feed an accepted tile back as a reference image** on every later prompt — "match the
   style, palette and detail level of this image exactly". This is the strongest consistency
   lever available.

Expect to fix seams and re-centre ditches by hand. Models do not produce truly tileable
output or exact channel widths.

---

## 7. Starter set — level 1

Naming is `<class>_<edges>`, edges in NESW order (`n` top, `e` right, `s` bottom, `w` left) —
the same letters the game turns into the `conn` bitmask.

`graphics/tiles/` — **ground**

| File | Subject (after the style block + ground suffix) |
|---|---|
| `grass.png` | plain grass field |
| `soil.png` | freshly tilled farm soil, faint horizontal furrows |
| `water.png` | seamless water surface — the water-tile suffix above (this one is blue) |

`graphics/tiles/` — **main canal** (0.85 wide vertical channel with depth + side land; the dug
column. All DRY, seamless top↔bottom so a run stacks cleanly):

| File | Connections | Subject |
|---|---|---|
| `main_ns_a.png` | N+S | straight main channel, variation A |
| `main_ns_b.png` | N+S | straight main channel, variation B — different floor detail (pebbles / ripple marks) for variety along a long run |
| `main_nse.png` | N+S+E | main channel with a **narrow (0.42) branch stub** reaching the right edge |
| `main_nsw.png` | N+S+W | same, stub reaching the left edge |
| `main_nsew.png` | all | 4-way junction — main channel with narrow branch stubs to **both** left and right |

`graphics/tiles/` — **branch ditches** (0.42 wide, pre-built sub / sub-sub; DRY). The full
Wang set — every combination of open edges, so the autotiler always has a piece:

| File | Connections | Shape |
|---|---|---|
| `ditch_ew.png` | E+W | straight horizontal `═══` |
| `ditch_ns.png` | N+S | straight vertical |
| `ditch_es.png` | E+S | corner `╔` |
| `ditch_sw.png` | S+W | corner `╗` |
| `ditch_ne.png` | N+E | corner `╚` |
| `ditch_nw.png` | N+W | corner `╝` |
| `ditch_ews.png` | E+W+S | T, arm down `╦` |
| `ditch_ewn.png` | E+W+N | T, arm up `╩` |
| `ditch_nse.png` | N+S+E | T, arm right `╠` |
| `ditch_nsw.png` | N+S+W | T, arm left `╣` |
| `ditch_nsew.png` | all | 4-way cross `╬` |
| `ditch_n.png` | N | end cap, opens up |
| `ditch_e.png` | E | end cap, opens right |
| `ditch_s.png` | S | end cap, opens down |
| `ditch_w.png` | W | end cap, opens left |

Corners and the 4 end caps let sub-canals bend and dead-end anywhere — more level variety.
Mirror/rotate pairs (`ditch_es`↔`ditch_sw`, the four ends) can be flipped in code instead of
drawn separately, if you'd rather author fewer.

`graphics/crops/`

| File | Subject (after the style block + object suffix) |
|---|---|
| `wheat_seed.png` | 4 tiny green sprouts just breaking through, loose square arrangement |
| `wheat_mid.png` | 4 half-grown green wheat plants |
| `wheat_grown.png` | 4 mature golden wheat plants, heavy heads |

Mirror pieces are flipped in code, not generated.

---

## 8. Still to redraw

`graphics/auger.png` is a **true top-down** view (tip and spiral seen from directly above)
and does not match the three-quarter style. It needs a front-facing rig. The spiral's
scrolling-UV rotation trick still works, so only the image changes — the slice fractions
in `_makeTunnelTextures()` ([game.js](../game.js)) may need re-measuring against the new art.

---

## Decision log

| Date | Decision |
|---|---|
| 2026-07-23 | Three-quarter Stardew view, **not** isometric — grid stays square and axis-aligned |
| 2026-07-23 | Smooth / painterly, not pixel art — renderer stays `antialias: true, pixelArt: false` |
| 2026-07-23 | Crops split: one shared soil tile + transparent plant overlays per stage |
| 2026-07-23 | Ditch tiles always dry; water is its own tile on a separate layer |
| 2026-07-23 | Grid 15 × 11, square tiles, 128×128 export |
| 2026-07-24 | Everything is tiles, incl. the **main canal** (dug column) and **water**; both revealed continuously by a growing mask, not tile-by-tile |
| 2026-07-24 | Main canal is 5 tiles: `main_ns` ×2 variations, `main_nse`, `main_nsw`, `main_nsew` (junction stubs are branch-width 0.42) |
| 2026-07-24 | Two channel widths only: main 0.85, branch 0.42 (sub and sub-sub share a width) |
| 2026-07-24 | Full branch Wang set incl. 4 corners + 4 end caps (15 pieces) for level variety |
| 2026-08-07 | Palette gains **wood #b49c74 / dark wood #7a6348** — muted honey-oak at ~30% saturation, NOT a warm red-brown |
| 2026-08-07 | All fence/timber art moved to [FENCE_STYLE.md](FENCE_STYLE.md); this file keeps the shared style lock and palette |
