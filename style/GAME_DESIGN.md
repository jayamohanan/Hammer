## Game Concept

I’m creating a battery merge game inspired by *Bloomy Merge*, a successful casual merge game where players merge items to create stronger units that are then used to fight enemies. My version uses a similar merge-game loop, but with a different theme: **using stored energy to bring water back to a drought-stricken region.**

### Core Game Setup

The game is designed for a landscape screen divided into two sections:

* **Left 40%:** The battery-merging area.

  * A 3×3 merge grid where players combine batteries to create increasingly powerful batteries.
  * Three battery slots where the player places their strongest batteries.
* **Right 60%:** The game world.

  * A farm, forest, settlement, or other establishment occupies the area.
  * A trenching machine operates through the center of this section.
  * The machine automatically constructs a **vertical main canal running from south to north**.

The player does not directly control the trenching machine. Their only task is to **merge batteries and place the strongest batteries into the three power slots**.

The more powerful the batteries, the more efficiently the machine works. Stronger batteries make the trencher move faster and complete the canal more quickly. With no batteries installed, the machine stops.

The core gameplay loop is:

**Merge batteries → create stronger batteries → power the trencher → construct the canal → deliver water → restore the environment.**

---

## The Universal Canal System

An important feature of the game is that **every level uses the same basic canal-construction structure**.

Each level contains one **vertical main canal that must be constructed by the trenching machine**.

The trenching machine itself is identical across all levels:

* It always starts at the southern end of the level.
* It always travels straight from south to north.
* It always travels through the **center of the playable right-hand section**.
* It always constructs the main canal as it moves.
* The player never controls its direction.
* The machine's speed is determined by the batteries powering it.

This creates a consistent visual and mechanical element throughout the entire game.

### What Changes Between Levels

The **canal is the constant**. The **establishment surrounding it changes**.

The farms, forests, ponds, villages, animal areas, and other environments are already laid out when the level begins. The player is not designing the canal network.

Instead, the level designer has already created the environment's water infrastructure:

* Side-branch canals are already positioned.
* Ponds are already present but may be dry.
* Irrigation channels are already laid out.
* Reservoirs and water bodies are already positioned.
* The player simply needs to construct the central main canal.

As the trenching machine progresses northward, the newly constructed main canal intersects these existing branches and water systems.

Once water reaches a branch, pond, reservoir, or other connected feature, it begins receiving water automatically.

Therefore, the player's job is not **"decide where to dig."**

It is:

> **"Provide enough energy to build the canal that connects the existing water infrastructure."**

This keeps the game extremely simple and suitable for a casual merge-game audience.

---

## The Continuous World

The entire game takes place in one continuous world rather than separate scenes.

The world represents a drought-stricken country or region containing many different establishments that depend on water.

The first level might be a tomato farm. The trenching machine begins at the southern end and travels north through the center of the farm.

Once it reaches the northern end, the camera smoothly pans northward. The next area is revealed, with the same trenching machine appearing near the bottom of the screen.

The machine then begins constructing the same central vertical canal through the next establishment.

This continues throughout the game.

The player therefore feels as though they are **traveling progressively northward through one enormous drought-stricken country**, rather than loading individual levels.

---

## Environmental Restoration

Each level has a different establishment and a different visual payoff when water reaches it.

The environment starts in a dry or damaged state. As the central canal is constructed and water reaches the pre-built side branches, ponds, fields, or reservoirs, the establishment begins recovering.

For example:

**Tomato farm**

Dry soil → irrigation receives water → plants grow → tomatoes appear.

**Mango orchard**

Wilted trees → roots receive water → leaves return → mangoes appear.

**Animal ranch**

Dry pasture → water trough fills → animals drink → grass grows.

**Forest**

Dry forest floor → ponds and streams fill → grass appears → vegetation returns → animals and birds return.

**Burned forest**

Burned landscape → water reaches the area → new vegetation appears → forest begins recovering.

The restoration process can use multiple sprite stages so that the transformation happens gradually rather than instantly.

For crops:

**Seed → Sprout → Young Plant → Mature Plant → Fruiting Plant**

---

## The Purpose of the Canal

The canal is essentially the **physical representation of the player's progress**.

The player does not directly grow crops, fill ponds, or revive forests. They provide the energy that allows the trenching machine to build the infrastructure necessary for those things to happen.

The chain of cause and effect is:

**Battery power → Trencher moves → Main canal is constructed → Water reaches branches → Water reaches establishment → Environment recovers**

This gives every battery merge a visible consequence in the world.

A stronger battery does not simply produce a higher number. It means:

**The canal gets built faster → water arrives sooner → the environment recovers sooner.**

---

## Level Structure

Every level follows the same basic structure:

1. The player enters a new establishment.
2. The environment is in a dry, damaged, or inactive state.
3. The trenching machine is positioned at the southern end.
4. The player powers the machine with batteries.
5. The machine travels straight north through the center.
6. It constructs the main vertical canal.
7. The main canal intersects the pre-built side branches.
8. Water begins flowing through those branches.
9. Connected ponds, fields, reservoirs, or other systems receive water.
10. The establishment progressively transforms.
11. The machine reaches the northern end.
12. The establishment is considered restored.
13. The camera pans north.
14. The next establishment is revealed.
15. The same process begins again.

The **mechanic stays constant while the environment and restoration payoff change**.

This allows the game to remain simple to understand while continually providing new visual experiences.

---

## The Overall Game Fantasy

The game is ultimately about **bringing life back to a drought-stricken country**.

The player starts with a dry, lifeless landscape. Their batteries provide the energy required to build the infrastructure that carries water from the lake in the south.

As the player progresses northward, they gradually restore the entire region.

The progression can therefore be thought of as:

**Energy → Infrastructure → Water → Life**

Early in the game, the player simply sees crops growing.

Later, they see animals returning, ponds filling, forests recovering, villages becoming active, and entire ecosystems coming back to life.

The long-term fantasy is not simply to build canals.

It is to **restore an entire country, one canal at a time.**
