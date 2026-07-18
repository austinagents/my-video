# Framepoint Core Terminology
Product terms may be simpler than repository field names, but the mapping must stay explicit.
## 1. Object
An Object is the selectable visual item placed on the board or canvas.
Current Animation Review implementation term: `StudioBlock`.
Current block fields include `id`, `x`, `y`, `width`, `height`, and `designPreset`.
Current source: `shared/project.ts`.
Examples grounded in this workflow: KPI/metric blocks, charts, timelines, funnels, comparisons, hierarchy/process blocks, and infographics.
`Object` is the product term. `Block` is the current Animation Review implementation term.
## 2. Design Preset
A Design Preset changes the selected Object's visual role, layout, hierarchy, or styling.
Current implementation:
- Type: `DesignPreset`
- Application function: `applyDesignPreset`
- Stored on: `StudioBlock.designPreset`
Current sources: `shared/project.ts`, `studio/src/App.tsx`.
A Design Preset changes how an Object looks or is arranged. It does not define motion over time.
## 3. Scene Target
The Scene Target is the Object that a semantic scene behavior operates on.
Current fields:
- Animation Review: `scene.blockId`
- Advanced Studio board scenes: `content.activeBlockId`
Do not present `targetObjectId` as implemented.
The current editor selection is not automatically the Scene Target unless its stable identifier is persisted into the Scene.
## 4. Semantic Motion
Semantic Motion defines how a Scene presents or emphasizes its Scene Target over time.
Current implementation term: `AnimationPreset`.
Current fields:
- Animation Review: `scene.animation`
- Advanced board scenes: `content.animation`
Current preset vocabulary: Focus, Reveal, Build, Trace, Compare, Count, Spotlight, Overview.
Semantic Motion answers: "What should this Scene communicate or emphasize?"
It may control board framing, scale, translation, opacity, inactive-object dimming, or internal renderer behavior where supported.
Do not rename current repository fields. `Semantic Motion` maps to existing `AnimationPreset` and `animation` fields.
Not every current preset has unique complete runtime behavior.
### Focus
Focus directs attention toward the Scene Target while retaining surrounding context.
Current behavior: frames toward the active block, scales approximately `1.12`, and does not dim inactive Objects.
Current source: `shared/board-motion.ts`.
### Spotlight
Spotlight more strongly isolates the Scene Target.
Current behavior: frames toward the active block, scales approximately `1.18`, and enables inactive-object dimming.
Current sources: `shared/board-motion.ts`, `shared/Board.tsx`.
The primary distinction between Focus and Spotlight is inactive-object dimming, along with stronger framing. Do not treat them as synonyms.
Reveal currently has distinct opacity behavior and shares focus-family framing when a target exists. Count has a distinct scale value.
Build, Trace, and Compare are selectable vocabulary but do not currently have complete distinct renderer behavior in the shared board-motion path.
Overview clears the target and returns to the full board.
## 5. Camera Motion
Camera Motion is optional cinematography applied around the Scene.
Current Advanced Studio field: `scene.cameraPath`.
Current implementation: `src/advanced-studio/camera-paths.ts`.
Examples: Push In, Pull Back, Drift, Tilt, Orbit.
Camera Motion answers: "How should the completed Scene framing move?"
Camera Motion is separate from Semantic Motion. A Scene may combine both:
```text
Scene = Scene Target + Semantic Motion + duration + optional Camera Motion
```
Example: Scene Target is Key Objective, Semantic Motion is Spotlight, and Camera Motion is slow Push In.
Spotlight determines semantic emphasis and inactive Object dimming. Push In adds optional cinematography around that completed scene behavior.
Do not describe Semantic Motion and Camera Motion as one single scene selection in the current implementation.
They are two composable motion layers within one Scene.
## 6. Scene
A Scene is a saved authored unit of time in the video.
Animation Review scenes reference Scene Target through `blockId`, Semantic Motion through `animation`, plus duration and scene metadata.
Animation Review Object state remains primarily in `project.blocks`.
Advanced Studio scenes may contain scene-specific `content`, `durationFrames`, transitions, and optional `cameraPath`.
Do not state that every Scene contains a full copy of the Object state.
Truthful conceptual model:
```text
Scene = Scene Target + Semantic Motion + duration + optional Camera Motion + optional transition
```
## 7. Internal Object Animation
Internal Object Animation is animation occurring inside an Object's renderer.
Examples grounded in the repository: AntV chart growth, `grow-up`, `grow-right`, graph or infographic renderer animation.
Current sources: `src/antv-studio/types.ts`, `src/advanced-studio/InfographicSceneRenderer.tsx`.
Internal Object Animation is not a separate top-level authoring system. It is renderer behavior that may be coordinated with Semantic Motion.
Example: Semantic Motion is Build; Internal Object Animation is chart bars growing sequentially.
The current field name `animation` is overloaded:
- Semantic board animation in `shared/project.ts`
- AntV/internal template animation in `src/antv-studio/types.ts`
Always interpret `animation` in context.
## 8. Preview
Preview is the rendered playback of the authored Scene or sequence.
Current Animation Review Preview: Remotion `Player` with composition component `ExplainerVideo`.
Current sources: `studio/src/App.tsx`, `shared/ExplainerVideo.tsx`.
Preview is not the same as the live editor canvas. The editor canvas may include selection state, editing controls, local UI zoom, handles, and authoring chrome.
Preview renders saved project state, saved Scene Target, saved Semantic Motion, current playback frame, and Remotion scene sequencing.
A visual mismatch between editor and Preview is a Preview/render-parity issue, not automatically a terminology or motion-model issue.
## 9. Render
Render is the final deterministic video output.
Current render command: `render:explainer`.
Current composition: `ExplainerVideo`.
Current project input: `public/project.json`.
Current sources: `package.json`, `src/Composition.tsx`.
Preview and final Render should preserve the same Scene Target, Semantic Motion, Camera Motion, timing, Object layout, and Object state.
## 10. Quick Decision Tree
```text
Does the request change how the Object looks or is arranged? -> Design Preset
Does the request change how the Scene presents or emphasizes the target? -> Semantic Motion
Does the request add optional whole-scene cinematography? -> Camera Motion
Does animation occur inside a chart, graph, or infographic renderer? -> Internal Object Animation
Does playback differ from the editor? -> Preview or Render parity issue
Unsure which applies? -> Stop and identify the layer before implementing.
```
## 11. Current Field Mapping
| Product Term | Current Repository Term or Field | Source | Notes |
| --- | --- | --- | --- |
| Object | `StudioBlock` | `shared/project.ts` | Animation Review implementation term |
| Design Preset | `DesignPreset`, `StudioBlock.designPreset` | `shared/project.ts`, `studio/src/App.tsx` | Object visual role/layout |
| Scene Target | `scene.blockId` | `shared/project.ts` | Animation Review persisted target |
| Scene Target | `content.activeBlockId` | `src/advanced-studio/BoardSceneRenderer.tsx` | Advanced board scene target |
| Semantic Motion | `AnimationPreset`, `scene.animation`, `content.animation` | `shared/project.ts`, `src/advanced-studio/BoardSceneRenderer.tsx` | Board semantic behavior |
| Camera Motion | `scene.cameraPath` | `src/advanced-studio/camera-paths.ts` | Optional Advanced Studio cinematography |
| Legacy camera fallback | `cameraPreset` | `src/advanced-studio/scene-contract.ts` | Legacy/fallback behavior |
| Internal Object Animation | AntV `animation` | `src/antv-studio/types.ts` | Template renderer behavior |
| Preview | Remotion `Player` + `ExplainerVideo` | `studio/src/App.tsx`, `shared/ExplainerVideo.tsx` | Rendered playback |
| Render | `render:explainer` | `package.json`, `src/Composition.tsx` | Final Remotion output |
Naming warnings: `targetObjectId`, `motionPreset`, and `objectMotion` are not currently implemented in the clean repository.
`animation` is overloaded and must always be interpreted in context.
`cameraPath` is not a replacement for semantic scene behavior.
`cameraPreset` should be identified as legacy or fallback behavior where used.
## 12. Core Implementation Rules
- Preserve Semantic Motion and Camera Motion as separate composable fields.
- Do not use Camera Motion as a replacement for Focus, Spotlight, Reveal, or other semantic behavior.
- Every target-based Semantic Motion must operate on a persisted Scene Target.
- Focus and Spotlight must remain distinct.
- Internal Object Animation remains owned by the Object renderer.
- Do not introduce a new motion resolver when an existing shared resolver already owns the behavior.
- Do not describe future identifiers or behavior as currently implemented.
- Treat editor-to-Preview mismatch as a separate parity problem.
- Product terminology may be simpler than repository field names, but the mapping must remain explicit.
- Stop implementation when the requested motion layer is ambiguous.
