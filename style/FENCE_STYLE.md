# Fence art style lock

Wooden fencing that borders the fields. Companion to [TILE_STYLE.md](TILE_STYLE.md) — that
file owns the shared style lock and palette; this one owns everything wood.

> **Maintenance rule:** same as TILE_STYLE — this file is the source of truth for fence art.
> It is only edited with the owner's explicit permission; a style change agreed in chat lands
> here in the same breath.

**Current style:** three-quarter top-down (Stardew Valley), smooth / painterly, 128×128 tiles,
muted weathered pine.

---

## 1. The wood

**Describe the material, don't just list hexes.** Image models follow *"weathered pine"* and
*"honey oak"* far more reliably than they follow `#b49c74`. The hexes are for hand-correction
and for keeping the game's own colours in sync — the prompt should carry both, with the words
doing the real work.

| Role | Hex | Notes |
|---|---|---|
| wood | `#b49c74` | muted honey-oak mid-tone, 30% saturation |
| wood highlight | `#d2c4a7` | soft beige, never a warm orange glint |
| dark wood | `#7a6348` | medium brown shadow |

The failure mode is **orange**. A model asked for "wooden fence" defaults to a saturated
red-brown that reads as mahogany or fresh-cut cedar and fights the field. Low saturation is
what makes it read as farm timber that has sat in the sun for years.

Note `#7a6348` sits close to the tilled soil `#84694a`. That is fine — it is the shadow side
only, a small area, and the `#b49c74` mid-tone is well clear of both soil and grass.

---

## 2. Two orientations, never one rotated

A fence is a **standing** object, so the three-quarter view treats its two runs completely
differently. This is the whole reason there are two sets and not one tile rotated 90°:

| Run | What the camera sees | Tiles seamlessly |
|---|---|---|
| **East-west** (along a row) | the fence **face on** — full height, posts and rails square to the viewer | left ↔ right |
| **North-south** (along a column) | the fence **end on**, running away from the camera — mostly the **top edges** of the rails as a narrow band, with the posts still standing upright | top ↔ bottom |

Rotating the east-west tile 90° gives rails lying flat on the ground like planks. It always
reads as wrong. Draw both.

### The pole goes on the leading edge, not the centre

Each tile is **one pole plus the rails running off it to the far edge** — pole at the left
with rails running right, pole at the top with the band running down.

This puts a **post on every tile seam**. Where two tiles meet, the rails from one arrive at the
next one's pole, so any misalignment is hidden behind a post instead of showing as a step in
the middle of a rail. Rail seams are the thing models get wrong most often, and this is the
most forgiving arrangement available. A centred post would leave the join out in the open.

**End caps are flips, not art.** The last tile of a run is the same tile mirrored — rails
arriving from the left into a pole on the right. Tiled flips tiles for free, and the style
lock's flat even lighting with no cast shadows means a flip is visually identical. Do not ask
the model for a mirrored version; it only risks a mismatched pair.

So the whole fence is **two generated tiles**: one face-on, one end-on.

**Corners:** two runs meeting need the face-on rails turning into the receding band. Draw one;
the other three are flips.

---

## 3. The prompt — both tiles in one sheet

Generate both in **one image**. Per TILE_STYLE section 6, models hold style far better within
a single generation — and here it is essential, because the face-on and end-on runs must read
as the same fence. Generated separately, wood tone and post thickness drift.

Two cells side by side is a 2:1 canvas (~2048×1024), which every model handles. Downscale and
slice to two 128×128 tiles.

Keep the ask small on purpose: image models lose count and detail past four or five subjects,
and each extra cell splits the same fixed canvas. Two cells means maximum pixels per tile on
the art whose seams matter most.

```
Create a 2D game tile sheet: TWO tiles of ONE wooden farm fence, side by
side, for a casual top-down farming game. One tile shows the fence
running left-to-right, the other shows the SAME fence running away from
the camera.

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

THE WOOD — this matters as much as the shapes:
Light weathered pine fence. Muted honey-brown wood, matte finish, soft
desaturated colours. Lightly weathered farm timber that has stood in the
sun for years — dry and sun-bleached, not freshly cut, not varnished.
Keep saturation LOW. Soft beige highlights and medium brown shadows.
NO warm orange highlights. Avoid red, mahogany, cherry, orange and amber
wood tones entirely.
Wood #b49c74, highlight #d2c4a7, shadow #7a6348. Ground colours if any
show: grass #8ed04f, dark grass #6ea83a.

Simple, iconic, chunky and readable — NOT realistic. A few big rounded
wooden shapes, bold outline, light wood grain only, no fine detail,
no nails, no knots, no rope.

Draw TWO items side by side, each in its own equal square cell with a
transparent gap between them:

Cell 1 — SIDE-ON: the fence seen FACE ON, square to the viewer. ONE
  vertical wooden post standing flush against the LEFT edge of the cell,
  with two horizontal rails running from that post all the way to the
  RIGHT edge. The post is at the left end only — there is no post at the
  right, the rails simply run off that edge.
Cell 2 — END-ON: the SAME fence turned to run AWAY from the viewer, into
  the distance. This is NOT cell 1 rotated — it is a different viewpoint
  of the fence, not the same image turned. Because it recedes, the rails
  are seen from ABOVE at a steep angle: they read as a NARROW VERTICAL
  BAND of their own top surfaces, about one fifth of the tile wide,
  centred horizontally. ONE upright post stands at the TOP edge of the
  cell, and the band runs from it down to the BOTTOM edge. The post is
  at the top end only.

SEAMS — critical, these tiles repeat in a grid so each one's far edge
meets the next one's post:
- Cell 1: the rails must leave the RIGHT edge at exactly the same height
  and thickness as they meet the post on the left, so that when the tile
  repeats the rails run into the next post cleanly, with no step and no
  change in rail spacing.
- Cell 2: the band must leave the BOTTOM edge at exactly the same
  horizontal position and width as it has at the post, so stacked tiles
  line up with no sideways shift.

Both cells are ONE fence: identical wood tone, rail thickness, post
thickness, outline weight and shading. The side-on fence stands in the
lower part of its cell, occupying roughly the lower 60% of the cell
height, and must not touch the top edge. Each post has a small soft
shadow ellipse at its base.
```

---

## 4. Notes on the prompt

- **The wood block sits above the shapes on purpose.** Colour is the thing models get wrong
  first and most often here, so it is stated before any geometry and carries both descriptive
  words and hexes.
- **`no rotation` in the style lock can fight cell 3.** That line exists to stop isometric
  grids, but a model may read it as "don't turn the fence". Cell 3 pushes back explicitly. If
  it still returns planks lying flat on the ground, strengthen it — describe cell 3 alone,
  with no mention of cell 1.
- **Expect to fix seams by hand.** Models do not produce truly tileable output. The post on
  the leading edge buys a lot of forgiveness here — a rail that arrives slightly high still
  meets a post rather than another rail — but the rail height at the far edge is still worth
  checking against the post.
- **If posts look too dense** at actual size, don't regenerate. Erase the post from a copy of
  the accepted tile in any image editor: the rails are already at exactly the right edge
  heights, so a rails-only variant made that way is guaranteed to match. Alternating it with
  the posted tile halves the post spacing.
- **Feed an accepted sheet back as a reference** on every later wood prompt (gates, posts,
  crates) — the strongest consistency lever available.

---

## Decision log

| Date | Decision |
|---|---|
| 2026-08-07 | Fence art split out of TILE_STYLE into this file; TILE_STYLE keeps the shared style lock and palette |
| 2026-08-07 | Wood is **muted weathered pine**, saturation ~30% — `#b49c74` / `#d2c4a7` / `#7a6348`. Explicitly banned: red, mahogany, cherry, orange, amber, warm orange highlights |
| 2026-08-07 | Material described in **words** ("weathered pine", "honey oak", "matte", "desaturated") as well as hexes — models follow descriptive language far more reliably than hex values |
| 2026-08-07 | Fences are **two separate sets, not one tile rotated**: east-west face on, north-south end on as a narrow band of the rails' top surfaces |
| 2026-08-07 | Each tile is **one pole on the leading edge + rails running to the far edge**, so a post lands on every tile seam and hides rail misalignment. A centred post would leave the join exposed |
| 2026-08-07 | **Two generated tiles total** (one face-on, one end-on). End caps are Tiled flips, not art — flat even lighting makes a mirror identical. Rails-only variants, if ever needed, are made by erasing the post from the accepted tile, never regenerated |
| 2026-08-07 | Corners: draw one, flip for the other three |
