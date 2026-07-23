# Advanced Studio Reference Sheet

## What Advanced Studio Is

Advanced Studio is a scene-based video editor built on Remotion. An authored
project is previewed in the Studio Player and sent through the same composition
for final rendering. Template 1 and Template 2 are complete projects that share
one architecture; they are not separate rendering systems.

## The Core Model

- **Project (`AdvancedStudioProject`)**: a title and an ordered list of scenes.
- **Scene (`AdvancedStudioScene`)**: a type, title, duration, content, camera,
  and optional crossfade.
- **Project duration**: the sum of all scene durations. Crossfades do not shorten
  the timeline.
- **Scene timing**: each scene starts when the previous scene ends.

## The Four Scene Types

| Scene type | Best use | Rendering owner |
| --- | --- | --- |
| **Board** | Spatial overview, chapter focus, process, comparison, summary | `BoardSceneRenderer` → `Board` |
| **G2** | Charts, trends, rankings, KPIs, quantitative comparisons | Registered G2 design → G2 renderer |
| **G6** | Networks, flows, causes, trees, decision paths | Registered G6 design → G6 renderer |
| **S2** | Tables, scorecards, before/after metrics | Registered S2 design → S2 renderer |

Provider-first means a G2, G6, or S2 scene should use an existing registered
design and its content contract. Template code chooses the design and supplies
data; it does not recreate provider behavior.

## How a Frame Is Rendered

`AdvancedStudioProject` → canonical scene timing → active scene → camera and
crossfade → Board or infographic renderer → Remotion Player or final render.

Preview and final render receive the same project. A preview/render difference
is therefore usually caused by readiness, provider layout behavior, or timing—not
by a separate preview composition.

## Board Authoring

A Board project controls its title, subtitle, blocks, and layout. Each block has
a type, title, position, size, and design preset. A Board scene selects an active
block and semantic motion such as focus, spotlight, reveal, count, or overview.

Normal Board generation currently supplies fixed sample labels and values for
each block type. `StudioBlock.syntax` is a supported escape hatch, but it should
only be considered when normal Board authoring cannot solve a proven content
conflict.

## Motion

- **Camera path** moves the complete scene; it does not own chart or Board
  semantics.
- **Board semantic motion** controls focus and emphasis inside the Board.
- **Provider design motion** reveals the infographic content.
- **Transition** is currently a crossfade between adjacent scenes.

When reporting a motion problem, identify whether the unwanted movement comes
from the camera, Board semantics, provider layout, or transition.

## Templates

- **Template 1** is the approved original baseline and must remain unchanged
  unless explicitly authorized.
- **Template 2** is a second standalone authored project. “Executive Signal” is
  its initial narrative, not a new architecture.

A new template should normally be data-only authoring: scenes, durations,
registered designs, provider content, Board layout, cameras, and crossfades.

## Useful Task Language

- **Content change**: copy, values, nodes, edges, rows, or Board titles.
- **Design selection**: choose a different registered G2/G6/S2 design.
- **Layout problem**: content is clipped, sparse, crowded, unstable, or poorly
  fitted to portrait/square/vertical.
- **Provider problem**: the registered design itself behaves incorrectly across
  projects.
- **Camera problem**: the whole scene moves or scales incorrectly.
- **Timing problem**: scene length, start frame, project duration, or crossfade.
- **Parity problem**: the same frame differs between Player and final render.
- **Architecture change**: modifies a contract, renderer, provider, composition,
  registry structure, or render handoff. This requires evidence and approval.

For visual bugs, the most useful report is:
**template + scene title + frame + format + screenshot + expected behavior**.

## Default Development Rules

Preserve Template 1. Prefer authored data and registered providers. Strengthen
existing contracts before adding systems. Keep runtime changes minimal. Do not
fix unrelated technical debt automatically. Validate durations, provider
compatibility, Board references, Player behavior, final render, typecheck, build,
and `git diff --check`.
