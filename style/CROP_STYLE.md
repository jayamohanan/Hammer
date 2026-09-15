# Crop art style & prompt

Growth-stage art for the crops that fill the fields between the canals. Companion to
[TILE_STYLE.md](TILE_STYLE.md) — same game look (three-quarter Stardew view, painterly, the
shared palette), applied to plants instead of ground/canal tiles.

> **Maintenance rule:** this file is the source of truth for crop art. Edit it only with the
> owner's explicit permission; if a chat discussion changes the crop style, the change lands
> here in the same breath.

**Current style:** casual, iconic, *communicative not realistic* (Monkey Mart-style — a crop
reads as a clear little symbol, fruit shown boldly on top even if that's not botanically
where it grows, because it has to read from a near-top-down view). Smooth / painterly, not
pixel art. 128×128 tiles.

---

## 1. The five stages

The game grows each crop through five stages as water reaches it. To keep art cheap, **the
final stage is not its own plant** — it's the grown plant with a separate fruit sprite laid
on top.

| Stage | What it is | Art |
|---|---|---|
| 1 seed | ~3 small seeds on a patch of soil — simple dots, **distinct per crop** | own sprite |
| 2 sprout | two tiny leaves poking from the soil | own sprite |
| 3 young | small leafy bush, no fruit | own sprite |
| 4 grown | full leafy plant, **no fruit** — the finished plant | own sprite |
| 5 fruiting | stage 4 **+ a fruit cluster on top** | grown sprite + **fruit** sprite |

So each crop needs **4 plant sprites + 1 fruit cluster** (5 pieces), and the game composites
the last stage as "draw grown plant, then draw fruit on top."

The **seed** is deliberately minimal — like Stardew's little seed pips but smooth, not pixel:
just a few small rounded dots. Give each crop its **own** seed look (colour/shape hint) so
they're not all the same generic dots.

## 2. Sizing

- Stages 1–3 and the fruit: authored in a **1-tile-wide** cell.
- A grown plant may run tall — cut stage 3 to **1 wide × 2 tall** if needed; place the fruit
  near its top.
- The **fruit cluster** is small (it sits on the plant's top) — roughly half a tile, centred,
  no shadow.
- One plant per sprite — **not** a group. (The field look — 4 or 8 per tile — is assembled
  later in Figma / the game, not baked into the art.)

---

## 3. The prompt — 👇 COPY THE WHOLE BOX BELOW 👇

**This is the only thing you paste into ChatGPT / Gemini.** Copy everything between the two
``` fence lines below — the entire block, top to bottom. Sections 1, 2, 4, 5 of this document
are notes *about* the prompt, **not** part of it; don't paste those.

Per crop, edit **one word only**: the crop name on the second line (`tomato` here). Everything
else refers back to it, so there's nothing else to change.

```
Create a 2D game sprite sheet: ONE <crop> plant shown at five growth
stages, laid out in a single row, for a casual top-down farming game.

THE CROP FOR THIS IMAGE IS:  tomato
(everything below refers to that crop — the plant, the fruit, the leaves.)

Three-quarter top-down view, camera roughly 60 degrees above the horizon,
in the style of Stardew Valley. The ground plane is seen from above on a
square axis-aligned grid — NOT isometric, no diagonal or diamond tiles,
no rotation. Objects standing on the ground are drawn facing the viewer
with visible height.
Cozy 2D farming game art. Smooth painterly finish, soft clean edges,
subtle shading — not pixel art. Flat even lighting, no cast shadows from
off-screen, no vignette, no gradient across the frame. Clean readable
shapes with light texture detail. No text, no labels, no watermark, no
UI elements, fully transparent background (PNG with alpha).

Simple, iconic, chunky and readable — NOT realistic, NOT botanical. Think
casual mobile farm game (Monkey Mart): the plant is a clear little symbol,
a few big rounded shapes, bold outline, no fine detail.

Draw FIVE items in a row, left to right, evenly spaced, each in its own
equal cell with a transparent gap between them:

Cell 1 — just seeds: about 3 small rounded seeds resting on a little patch
  of tilled soil. Very simple, not detailed — smooth little dots, NOT pixel
  art. Give the seeds a colour/shape that hints at THIS crop, so different
  crops have different-looking seeds. Occupies the lower part of the cell.
Cell 2 — a tiny sprout: two small leaves poking from a little mound of
  tilled soil, occupying the lower third of its cell.
Cell 3 — a young plant of the crop: a small leafy bush, no fruit, about
  half the cell height.
Cell 4 — a fully grown plant of the crop: full leafy body, NO fruit,
  filling most of the cell height. This is the finished plant.
Cell 5 — ONLY the fruit of the crop, no plant and no leaves: a small
  cluster of 3 or 4 ripe fruits bunched together (like a hand of bananas),
  bold and clearly readable, on a fully transparent background. Sized and
  positioned to sit ON TOP of the grown plant in cell 4.

Cells 2–4 are the same plant, same style, outline weight and green tones,
standing on a common bottom line with a small soft shadow ellipse under
each. Cell 1 is seeds on soil; cell 5 is the fruit alone, centered, no
shadow.
```

### Notes on the prompt

- **Purpose first.** The opening line states what's being made before any detail, so the
  model frames the rest around it. Keep it to one sentence.
- **Crop named once.** The second line is the only per-crop edit; the body says "the crop /
  the plant / the fruit."
- **Root crops** (carrot, potato): the "fruit on top" idea still works — show the root
  half-pulled from the soil with its top poking up, so it reads from above.
- **Neon fruit?** The palette line doesn't cover fruit colours (deliberately — let the model
  pick natural ones). If a crop comes out too saturated, add *"muted, slightly desaturated
  colours."*

---

## 4. Keeping crops consistent with each other

Different crops are separate generations, so they drift unless anchored:

1. **Anchor image.** Once one crop sheet looks right, attach it to every later crop prompt
   with *"match the style, outline weight, foliage tone and scale of the attached image
   exactly."* Reuse the **same** anchor for all crops — don't chain.
2. **Fruit scale.** Add *"the fruit cluster matches the size it would appear at on the plant
   in cell 3"* — otherwise the fruit often comes out oversized and needs rescaling.

---

## 5. Files

Slice the sheet into five PNGs per crop:

```
graphics/crops/<crop>_1.png     ← seed
graphics/crops/<crop>_2.png     ← sprout
graphics/crops/<crop>_3.png     ← young
graphics/crops/<crop>_4.png     ← grown (no fruit)
graphics/crops/<crop>_fruit.png ← fruit cluster (laid over _4 for the last stage)
```

---

## Decision log

| Date | Decision |
|---|---|
| 2026-08-02 | Casual / communicative crop style (Monkey Mart), not realistic — fruit shown boldly on top so it reads from above |
| 2026-08-02 | 5 stages = seed + 3 plant sprites + 1 fruit cluster; last stage = grown plant + fruit overlay (no separate final plant) |
| 2026-08-02 | Seed stage added first — ~3 simple smooth dots (Stardew-ish but not pixel), distinct per crop |
| 2026-08-02 | One plant per sprite; field grouping assembled later, not baked in |
| 2026-08-02 | Crop named once at the top of the prompt; purpose stated on line 1 |
