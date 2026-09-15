# Canal Builder — level format

A note for a tool that generates levels for this game. Everything below is the
format as the game actually reads it today.

## The game in one paragraph

A trenching machine cuts a main canal up the middle of a farm, from the bottom
of the screen to the top. Water follows it, spills into branch canals either
side, and the crops nearest each watered branch grow through five stages. When
every crop has grown, the level is done and the machine moves on to the next
farm stacked above it. Levels are authored as Tiled maps.

## Grid rules

| | |
|---|---|
| Width | **always 22 columns.** Never varies — tile size is derived from it and levels stack flush |
| Height | 6 to 20 rows |
| Tile size | 128 × 128 |
| Main canal | **always columns 10 and 11** (the two centre columns), running the full height |
| Origin | row 0 is the TOP; the machine digs from the bottom row upward |
| Bleed | **columns 0 and 21 must be left empty.** See below |

### The bleed columns

**Leave column 0 and column 21 empty. Nothing that matters may go in them.**

A phone reads the map as **20 columns wide**, trimming one from each side, and
draws the middle 20 across the same screen width. That makes every tile 10%
wider and 21% bigger by area — the farmer, the crops, the machine, the canal and
everything else with it — which is the difference between legible and squinting
on a handset.

Nothing else changes. It is the **same map file** for both: desktop and landscape
draw all 22 columns, and the extra strip at each edge reads as a little more
field. The canal does not move — it centres on `floor(cols / 2)`, so trimming one
column from the left shifts the centre by exactly the same one, and columns 10
and 11 stay the canal on both.

So anything painted in column 0 or 21 — a tree, a fence post, a prop marker — is
simply **not there** for most players, while looking perfectly fine to whoever
authored it on a desktop. That is the only way to get this wrong, and it is why
the rule is a rule rather than a suggestion.

Object markers outside the trimmed grid are dropped rather than clamped, so a
`bridge_main_ew` or a `cow_s` in an edge column vanishes on phones.

(Config: `ROAD.TILEMAP.MOBILE_TRIM`, `COLS: 20`.)

Levels are played in a fixed order and should **grow**. The first levels are
short — 6 to 9 rows with one or two branch runs. Do not open with a 20-row map.
A reasonable ramp is 6, 6, 8, 8, 9, 10, 10, then teens, then 20.

## Layers

Exactly these names, in this order (bottom to top):

```
ground     tile layer   every cell filled — the land
main       tile layer   the main canal, columns 10 and 11 only
branch     tile layer   side canals tapping off the main
crop       tile layer   markers only, never drawn
props      OBJECT layer not tile-based — points placed anywhere
```

- `ground` should be full: gid `1` in every cell.
- `main` must run the full height of the map in both centre columns.
- **`main` and `branch` are separate layers on purpose — do not merge them.**
  A main-canal cell is *dug and then watered*: it carries two sprites, a dry
  trench revealed by the machine and a filled tile revealed by the water behind
  it. A branch cell already exists as a ditch and only ever fills. They are also
  driven differently — the main canal follows the waterline directly, while
  branches spread by a cascade that refuses to enter main cells. Keeping them
  apart also lets Tiled's terrain brush auto-tile branch connections without the
  main canal interfering.
- `branch` runs horizontally off the main canal into the fields.
- `crop` is a **marker layer** — one gid, `129`, in any cell that should grow a
  plant. It is never rendered; the game reads it and plants there. Do not put
  crops on canal cells.
- `props` is a Tiled **object layer** holding point objects, each identified by
  its `name`.

## The .tmj file

Standard Tiled JSON. Three external tilesets, in this order and with these
firstgids:

```json
"tilesets": [
  { "firstgid": 1,   "source": "…/terrain.tsx" },
  { "firstgid": 25,  "source": "…/canal.tsx"   },
  { "firstgid": 129, "source": "…/markers.tsx" }
]
```

Map header: `"orientation": "orthogonal"`, `"renderorder": "right-down"`,
`"infinite": false`, `"tilewidth": 128`, `"tileheight": 128`, `"type": "map"`.

## Canal tile catalogue

A canal tile's gid says which sides it connects to — `n`, `e`, `s`, `w`. Pieces
must connect: a branch running west from the main canal needs the main tile to
open `w`, and each branch tile to open toward its neighbours.

**Main canal, LEFT column (col 10)** — these open `w` to feed branches west:

| connects | gid |
|---|---|
| `n` | 55 |
| `ns` | **57** (straight — the common one) |
| `nsw` | **59** (straight + tap west) |
| `nw` | 61 |
| `s` | 63 |
| `sw` | 65 |

**Main canal, RIGHT column (col 11)** — these open `e` to feed branches east:

| connects | gid |
|---|---|
| `es` | 67 |
| `n` | 69 |
| `ne` | 71 |
| `nes` | **73** (straight + tap east) |
| `ns` | **75** (straight — the common one) |
| `s` | 77 |

**Branch canal** (anywhere outside the centre two columns):

| connects | gid | | connects | gid |
|---|---|---|---|---|
| `ew` | **29** (horizontal run) | | `ns` | 39 |
| `e` | **47** (west end cap) | | `w` | **53** (east end cap) |
| `es` | 25 | | `ne` | 31 |
| `nes` | 33 | | `nesw` | 35 |
| `new` | 37 | | `nsw` | 41 |
| `nw` | 43 | | `sw` | 45 |
| `n` | 49 | | `s` | 51 |

A typical branch running west from the main canal at row `r`: main col 10 gets
gid 59 (`nsw`), then cols 9…1 get gid 29 (`ew`), and the far end col gets gid 47
(`e`). Mirror for east: col 11 gets 73 (`nes`), cols 12…20 get 29, end cap 53.

## Props (object layer)

Point objects, named. Position is in map pixels — a point at tile `(c, r)`'s
centre is `x = (c + 0.5) * 128`, `y = (r + 0.5) * 128`.

| name | what | note |
|---|---|---|
| `bridge_main_ns` / `_ew` | bridge over the main canal | place ON the main columns; `_ns` crosses a horizontal canal, `_ew` a vertical one |
| `bridge_branch_ns` / `_ew` | one-tile bridge over a branch | lets the farmer cross a branch that would otherwise split the field |
| `block` | a mid-level dam | place just ABOVE a branch run so that run waters early |
| `cow_n` / `_s` / `_e` / `_w` | a hand-placed cow | the marked point is the animal's FRONT |

Bridges over the **main** canal use `_ew` when the canal runs vertically (which
it always does), so main bridges are normally `bridge_main_ew`.

## What makes a level good

Width is fixed and the main canal is always centred, so the design space is
**height** and **branch topology**. Vary those deliberately:

- **Steady drip** — a branch on most rows, water spreading evenly up the field.
- **Long haul, big payoff** — no branches for the first half, then a dense block.
- **Asymmetric** — branches on one side only, so the farm reads lopsided.
- **Staged** — two or three branch runs with clear gaps, plus a `block` marker
  above each lower run so the field fills in waves rather than all at once.

Crops should sit near branches (they grow from the nearest watered canal cell),
but not uniformly — leaving some plants two or three tiles from any canal makes
a visible wave as the water arrives.

Leave the two centre columns and one column either side free of crops: that is
the machine's corridor.

## What the tool should do

- Emit **.tmj** so the result opens in Tiled for hand-editing.
- Let the user pick which layer they are editing from a **dropdown** —
  ground / main / branch / crop / props.
- Enforce the invariants: 22 columns, main canal filling columns 10 and 11 for
  the full height, no crops on canal cells.
- Default new levels to a **small** size (6–9 rows). Large maps are for later in
  the sequence.
