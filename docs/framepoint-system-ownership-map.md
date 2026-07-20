# Framepoint System Ownership Map

## How to Use This Document

This document is the repository-grounded answer key for current Framepoint system ownership.

`docs/framepoint-core-terminology.md` defines the product concepts and maps them to current repository fields. `docs/provider-first-implementation-standard.md` defines the investigation method for future implementation. This ownership map defines who currently owns each function in code, where that ownership is implemented, and where UI, state, Preview, or Render wiring is incomplete.

Use this before adding a new Advanced Studio control. If a row already names an owner, reuse that owner. If a row is marked `Unresolved`, inspect and resolve ownership before implementation.

Allowed status values used here:

`Implemented and canonical`, `Implemented but duplicated`, `Partially implemented`, `UI exposure gap`, `State wiring gap`, `Preview wiring gap`, `Render wiring gap`, `Provider capability available but unwired`, `Provider capability gap`, `Product model gap`, `Legacy`, `Experimental`, `Display only`, `Unresolved`.

## 1. Executive Ownership Summary

| Function Area | Current Owner | Source of Truth | Main Consumers | Status | Notes |
|---|---|---|---|---|---|
| Core Animation Review project model | Shared project schema | `shared/project.ts` (`StudioProject`, `StudioBlock`, `StudioScene`) | `studio/src/App.tsx`, `shared/ExplainerVideo.tsx`, `shared/Board.tsx` | Implemented and canonical | This is the canonical board/object model. |
| Board object geometry | Shared project schema | `shared/project.ts` (`StudioBlock.x/y/width/height`) | `shared/Board.tsx`, `shared/board-motion.ts`, `studio/src/App.tsx` | Implemented and canonical | Board target geometry is explicit in saved block fields. |
| Board visual rendering | Shared board renderer | `shared/Board.tsx`, `shared/AntVBlock.tsx` | Animation Review Preview, Advanced board scenes | Implemented and canonical | Board blocks are rendered through AntV infographic SVG inside the shared board. |
| Board semantic motion | Shared board motion resolver | `shared/board-motion.ts` (`getBoardSemanticMotion`) | `shared/ExplainerVideo.tsx`, `src/advanced-studio/BoardSceneRenderer.tsx` | Implemented and canonical | Focus, Reveal, Count, Spotlight, Overview run here. Build, Trace, Compare are selectable but not distinct. |
| Semantic preset metadata | Shared metadata | `shared/animation-presets.ts` (`animationPresets`) | `studio/src/App.tsx`, `studio/src/AdvancedStudioApp.tsx` | Implemented and canonical | The list contains Focus, Reveal, Build, Trace, Compare, Count, Spotlight, Overview. |
| Animation Review authoring UI | Animation Review Studio | `studio/src/App.tsx` | Browser route served by Vite studio root | Implemented and canonical | Owns block selection, scene creation, design presets, and semantic animation assignment for board scenes. |
| Advanced Studio host shell | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` | `/advanced-studio.html` | Partially implemented | Owns sequencing UI, template browser, inspector, timeline, and render button. |
| Advanced Studio scene contract | Advanced Studio schema | `src/advanced-studio/scene-contract.ts` | Advanced UI, Advanced Remotion composition | Implemented and canonical | Supports `board`, `g2`, `g6`, and `s2`; S2 is not fully exposed in current Advanced UI. |
| Advanced Studio playback composition | Advanced Studio Remotion composition | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | `studio/src/AdvancedStudioApp.tsx`, `src/Composition.tsx`, `/api/render-advanced` | Implemented and canonical | Applies transitions, camera paths, board renderer, and infographic renderer. |
| Camera paths | Advanced Studio camera path registry | `src/advanced-studio/camera-paths.ts` | Advanced composition and timeline label | UI exposure gap | Render path exists, but current source does not expose a verified writer in the inspector. |
| AntV design registry | AntV Studio registry | `src/antv-studio/registry.ts` (`antVStudioDesigns`) | AntV Studio, Advanced template browser, Advanced scene renderer | Implemented and canonical | Registry validates 50 designs: 26 G2, 8 S2, 16 G6. |
| G2 chart templates | AntV G2 + local definitions | `src/antv-studio/definitions/g2-designs.ts`, `src/antv-studio/renderers/G2StudioRenderer.tsx` | AntV Studio, Advanced infographic scenes | Implemented and canonical | Local G2 specs set `animate: false`; Framepoint wrapper animation supplies current proof motion. |
| G6 graph templates | AntV G6 + local definitions | `src/antv-studio/definitions/g6-designs.ts`, `src/antv-studio/renderers/G6StudioRenderer.tsx` | AntV Studio, Advanced infographic scenes | Implemented and canonical | Local G6 configs set `animation: false`; graph lifecycle is provider-owned. |
| S2 table templates | AntV S2 + local definitions | `src/antv-studio/definitions/s2-designs.ts`, `src/antv-studio/renderers/S2StudioRenderer.tsx` | AntV Studio, Advanced renderer contract | UI exposure gap | Registry and renderer exist. Current Advanced UI filters `engineOrder` to G2/G6. |
| AntV template thumbnails | Generated preview assets | `vite.studio.config.ts` (`/antv-studio-previews/`), `output/antv-studio/all/*.png` | Advanced universal template browser | Partially implemented | Browser uses rendered thumbnails when matching files exist. |
| Format and layout | AntV Studio format helper | `src/antv-studio/studio-formats.ts` (`STUDIO_FORMATS`, `getStudioLayout`) | AntV Studio preview, Advanced infographic renderer, Advanced compositions | Implemented and canonical | Portrait, square, and vertical formats are shared. |
| Preview playback | Remotion Player | `@remotion/player`, `studio/src/App.tsx`, `studio/src/AdvancedStudioApp.tsx` | Animation Review, Advanced Studio | Implemented and canonical | Both studios use Remotion Player, but with different components and scene contracts. |
| Final board render | Remotion CLI + ExplainerVideo | `package.json` (`render:explainer`), `vite.studio.config.ts` (`/api/render`), `shared/ExplainerVideo.tsx` | Animation Review render | Implemented and canonical | Writes `public/project.json` then renders `ExplainerVideo`. |
| Final Advanced render | Remotion CLI + Advanced composition | `vite.studio.config.ts` (`/api/render-advanced`), `src/Composition.tsx` | Advanced render button | Partially implemented | Render executes and returns output, but UI does not show last output path. |
| Audio and music lanes | Advanced Studio UI only | `studio/src/AdvancedStudioApp.tsx` timeline markup | Advanced timeline | Display only | No verified project state or render consumer. |
| Export button | Advanced Studio UI only | `studio/src/AdvancedStudioApp.tsx` top bar | User-facing button | Display only | Disabled in source; render button is the working export-like path. |

## 2. End-to-End Function Registry

| Function | Owning Provider/System | Exact Source/API/Symbol | Current Consumer | Status | Ownership Notes |
|---|---|---|---|---|---|
| Board project schema | Shared project contract | `shared/project.ts` (`StudioProject`) | `studio/src/App.tsx`, `shared/ExplainerVideo.tsx` | Implemented and canonical | Do not replace with an Advanced-only board schema. |
| Board object schema | Shared project contract | `shared/project.ts` (`StudioBlock`) | `shared/Board.tsx`, `shared/AntVBlock.tsx`, `studio/src/App.tsx` | Implemented and canonical | Product term: Object. Current implementation term: Block. |
| Board scene schema | Shared project contract | `shared/project.ts` (`StudioScene`) | `studio/src/App.tsx`, `shared/ExplainerVideo.tsx` | Implemented and canonical | Stores `blockId`, `animation`, and `durationSeconds`. |
| Board scene target field | Animation Review scene model | `StudioScene.blockId` | `studio/src/App.tsx` (`applyAnimationPreset`), `shared/ExplainerVideo.tsx` | Implemented and canonical | `overview` writes `null`; target presets write selected block id. |
| Advanced board target field | Advanced board scene content | `src/advanced-studio/BoardSceneRenderer.tsx` (`BoardSceneContent.activeBlockId`) | `studio/src/AdvancedStudioApp.tsx`, Advanced composition | Implemented and canonical | Same meaning as `StudioScene.blockId`, but stored inside Advanced scene content. |
| Advanced scene schema | Advanced Studio contract | `src/advanced-studio/scene-contract.ts` (`AdvancedStudioScene`) | Advanced UI and composition | Implemented and canonical | Supports per-scene content, duration frames, transitions, camera path. |
| Advanced scene families | Advanced Studio contract | `src/advanced-studio/scene-contract.ts` (`AdvancedStudioSceneType`) | Advanced UI and composition | UI exposure gap | Type includes `s2`, but Advanced browser filters to G2/G6. |
| Advanced project duration | Advanced Studio composition helper | `getAdvancedStudioProjectDuration` in `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | Advanced UI timeline, Player duration, render endpoint frame range | Implemented and canonical | Sum of `durationFrames`. |
| Advanced timed scene calculation | Advanced Studio composition helper | `getAdvancedStudioTimedScenes` in `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | Advanced UI, Advanced composition | Implemented and canonical | Derives `startFrame` and `endFrame`. |
| Active scene at frame | Advanced Studio composition helper | `getAdvancedStudioSceneAtFrame` in `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | `studio/src/AdvancedStudioApp.tsx` | Implemented and canonical | UI selection follows playhead through this helper. |
| Animation Review selected block state | Animation Review Studio | `studio/src/App.tsx` (`selectedBlockId`) | Board editor, animation preset assignment, design preset assignment | Implemented and canonical | Editor selection is local state, not a persisted scene target until written to a scene. |
| Animation Review selected scene state | Animation Review Studio | `studio/src/App.tsx` (`selectedSceneId`) | Scene strip and animation assignment | Implemented and canonical | Selecting a scene also selects its target block when present. |
| Advanced selected scene state | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`selectedSceneId`) | Scene browser, inspector, timeline | Implemented and canonical | Selection changes seek the Player to the scene start. |
| Board add block action | Animation Review Studio | `studio/src/App.tsx` (`addBlock`) | Animation Review left add controls | Implemented and canonical | Creates a `StudioBlock` with default dimensions and design preset. |
| Board drag/move action | Animation Review Studio | `studio/src/App.tsx` drag handlers | `shared/Board.tsx` interactive mode | Implemented and canonical | Updates `StudioBlock.x/y` with bounded coordinates. |
| Board design preset metadata | Animation Review Studio | `studio/src/App.tsx` (`designPresets`) | Animation Review inspector | Implemented but duplicated | Type is shared, but the preset list and sizing live in the UI file. |
| Board design preset application | Animation Review Studio | `studio/src/App.tsx` (`applyDesignPreset`) | Animation Review design preset buttons | Implemented and canonical | Updates selected block `designPreset`, `width`, `height`, and clamped position. |
| Board semantic preset metadata | Shared animation metadata | `shared/animation-presets.ts` (`animationPresets`) | Animation Review and Advanced inspector | Implemented and canonical | Shared list prevents duplicated Focus/Reveal/etc. labels. |
| Animation Review semantic preset assignment | Animation Review Studio | `studio/src/App.tsx` (`applyAnimationPreset`) | Animation Review animation preset cards | Implemented and canonical | Updates existing scene or creates a new scene. |
| Advanced board semantic preset assignment | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`AnimationReviewCameraInspector`) | Right inspector Camera tab | Partially implemented | Current source only writes board `content.animation` when type is `board`. |
| Board semantic motion calculation | Shared motion resolver | `shared/board-motion.ts` (`getBoardSemanticMotion`) | `shared/ExplainerVideo.tsx`, `src/advanced-studio/BoardSceneRenderer.tsx` | Implemented and canonical | Single source for target resolution, intro/outro progress, scale, translation, opacity, and dimming. |
| Board Focus behavior | Shared motion resolver | `shared/board-motion.ts` (`semanticFocusAnimations`, `targetScale`) | Animation Review render, Advanced board render | Implemented and canonical | Frames toward the active block and scales. |
| Board Reveal behavior | Shared motion resolver | `shared/board-motion.ts` (`opacity`, focus family transform) | Animation Review render, Advanced board render | Implemented and canonical | Adds fade-in and target framing when a target exists. |
| Board Count behavior | Shared motion resolver | `shared/board-motion.ts` (`targetScale`) | Animation Review render, Advanced board render | Implemented and canonical | Uses distinct semantic scale but no numeric sub-target logic. |
| Board Spotlight behavior | Shared motion resolver + Board dimming | `shared/board-motion.ts` (`dimInactive`), `shared/Board.tsx` | Animation Review render, Advanced board render | Implemented and canonical | Stronger scale and inactive block dimming. |
| Board Overview behavior | Shared motion resolver | `shared/board-motion.ts`, scene target `null` | Animation Review render, Advanced board render | Implemented and canonical | Full board view without target framing. |
| Board Build behavior | Shared preset vocabulary | `shared/animation-presets.ts`, `shared/board-motion.ts` | Animation Review and Advanced board UI | Partially implemented | Selectable vocabulary; no complete distinct renderer behavior in shared motion. |
| Board Trace behavior | Shared preset vocabulary | `shared/animation-presets.ts`, `shared/board-motion.ts` | Animation Review and Advanced board UI | Partially implemented | Selectable vocabulary; no complete distinct renderer behavior in shared motion. |
| Board Compare behavior | Shared preset vocabulary | `shared/animation-presets.ts`, `shared/board-motion.ts` | Animation Review and Advanced board UI | Partially implemented | Selectable vocabulary; no complete distinct renderer behavior in shared motion. |
| Board inactive dimming | Shared Board renderer | `shared/Board.tsx` (`dimInactive`) | `shared/ExplainerVideo.tsx`, Advanced board renderer | Implemented and canonical | Dimming belongs to board renderer, not camera path. |
| Board AntV infographic block rendering | Shared AntV adapter | `shared/AntVBlock.tsx`, `shared/antv/resolve.ts`, `shared/antv/syntax.ts`, `shared/antv/svg.ts` | `shared/Board.tsx` | Implemented and canonical | Uses `@antv/infographic`; strips native SVG animation for deterministic static block rendering. |
| Animation Review Preview | Remotion Player + shared video | `studio/src/App.tsx` (`Player`), `shared/ExplainerVideo.tsx` | Animation Review preview overlay | Implemented and canonical | Consumes saved `StudioProject` directly. |
| Animation Review Render | Vite endpoint + Remotion CLI | `vite.studio.config.ts` (`/api/render`), `package.json` (`render:explainer`) | Animation Review render button | Implemented and canonical | Writes `public/project.json` and renders `ExplainerVideo`. |
| AntV design schema | AntV Studio type contract | `src/antv-studio/types.ts` (`AntVStudioDesign`) | AntV registry, renderers, Advanced template browser | Implemented and canonical | Distinguishes G2, S2, G6 factories. |
| AntV design registry | AntV Studio registry | `src/antv-studio/registry.ts` (`antVStudioDesigns`) | AntV Studio, Advanced template browser, validation script | Implemented and canonical | Validation expects 50 total designs. |
| AntV registry validation | Local validation script | `scripts/validate-antv-studio.mjs` (`validateRegistry`) | `npm run verify:studio` | Implemented and canonical | Checks counts and factory shape. |
| G2 design definitions | AntV G2 local definitions | `src/antv-studio/definitions/g2-designs.ts` (`g2Designs`) | Registry and G2 renderer | Implemented and canonical | 26 designs; each has metadata, content defaults, and factory. |
| G2 renderer lifecycle | AntV G2 renderer | `src/antv-studio/renderers/G2StudioRenderer.tsx` (`Chart`) | AntV Studio preview and Advanced infographic renderer | Implemented and canonical | Creates, renders, verifies, and destroys provider chart. |
| G2 native animation | AntV G2 provider | `src/antv-studio/definitions/g2-designs.ts` (`animate: false`) | G2 renderer | Provider capability available but unwired | Current code deliberately disables provider-native animation. |
| G6 design definitions | AntV G6 local definitions | `src/antv-studio/definitions/g6-designs.ts` (`g6Designs`) | Registry and G6 renderer | Implemented and canonical | 16 designs with metadata and graph factories. |
| G6 renderer lifecycle | AntV G6 renderer | `src/antv-studio/renderers/G6StudioRenderer.tsx` (`Graph`) | AntV Studio preview and Advanced infographic renderer | Implemented and canonical | Creates, renders, updates data, verifies, and destroys graph. |
| G6 native animation | AntV G6 provider | `src/antv-studio/definitions/g6-designs.ts` (`animation: false`) | G6 renderer | Provider capability available but unwired | Current code disables provider graph animation. |
| S2 design definitions | AntV S2 local definitions | `src/antv-studio/definitions/s2-designs.ts` (`s2Designs`) | Registry and S2 renderer | Implemented and canonical | 8 designs with `row-reveal` metadata. |
| S2 renderer lifecycle | AntV S2 renderer | `src/antv-studio/renderers/S2StudioRenderer.tsx` (`TableSheet`) | AntV Studio preview and Advanced infographic renderer | Implemented and canonical | Creates, renders, verifies, and destroys table sheet. |
| S2 Advanced authoring | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`engineOrder`) | Advanced template browser and inspector | UI exposure gap | `engineOrder` is G2/G6 only; S2 is hidden from authoring. |
| AntV Studio preview stage | AntV Studio proof UI | `src/antv-studio/FramepointPreviewStage.tsx` | `src/AntVAnimationProof.tsx` | Implemented and canonical | Owns standalone AntV preview layout and animation proof. |
| AntV Studio wrapper animation | Framepoint wrapper over AntV renderers | `FramepointPreviewStage.tsx` (`animationStyle`) | AntV Studio preview | Implemented but duplicated | Similar logic exists in Advanced `InfographicSceneRenderer`. |
| Advanced infographic wrapper animation | Framepoint wrapper over AntV renderers | `src/advanced-studio/InfographicSceneRenderer.tsx` (`designAnimationStyle`) | Advanced G2/G6/S2 scenes | Implemented but duplicated | Duplicates AntV Studio preview animation mapping. |
| Advanced infographic scene rendering | Advanced infographic renderer | `src/advanced-studio/InfographicSceneRenderer.tsx` | Advanced composition | Implemented and canonical | Chooses renderer by `design.engine`; uses shared format layout. |
| Advanced template browser | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`UniversalTemplateBrowser`) | Left Templates panel | Implemented and canonical | Uses `antVStudioDesigns` filtered to G2/G6 and preview thumbnails. |
| Advanced Scene tab design browser | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`InfographicInspector`) | Right Scene inspector | Implemented but duplicated | Provides a second design browser for selected infographic scene. |
| Advanced apply template action | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`applyDesignToSelectedScene`) | Universal Template Browser | Implemented and canonical | Converts selected scene to selected design engine and content. |
| Advanced camera path registry | Advanced Studio camera system | `src/advanced-studio/camera-paths.ts` (`advancedStudioCameraPaths`) | Advanced composition and timeline label | Implemented and canonical | Contains static, push/pull, drift, rise/settle, tilt, diagonal, orbit, sweep, snap-focus. |
| Advanced camera path transform | Advanced Studio camera system | `cameraPathStyle` in `src/advanced-studio/camera-paths.ts` | `AdvancedStudioIntegrationProof.renderScene` | Implemented and canonical | Applies optional cinematography as an outer wrapper around scene renderer. |
| Advanced camera path assignment UI | Advanced Studio UI | No verified current writer in `studio/src/AdvancedStudioApp.tsx` | Intended inspector Camera tab | UI exposure gap | Timeline reads `scene.cameraPath`, but source inspector currently shows Animation Presets. |
| Legacy camera preset field | Advanced Studio scene contract | `src/advanced-studio/scene-contract.ts` (`cameraPreset?: "push-in"`) | Advanced composition fallback | Legacy | Still consumed as fallback by render and timeline. |
| Advanced transition model | Advanced Studio scene contract | `AdvancedStudioScene.transitionIn/transitionOut` | Timeline chips, `sceneOpacity`, Transition inspector | Implemented and canonical | Current transition behavior is crossfade duration. |
| Advanced transition rendering | Advanced composition | `sceneOpacity` in `AdvancedStudioIntegrationProof.tsx` | Advanced preview and render | Implemented and canonical | Opacity crossfade is computed in composition. |
| Advanced timeline scene segments | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` timeline markup | Advanced UI | Display only | Allows scene selection; no drag/trim/reorder authoring verified in current source. |
| Advanced timeline camera track | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`camera-track`) | Advanced UI | Display only | Displays active camera path label for selected scene. |
| Advanced audio waveform lane | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`waveform`) | Advanced UI | Display only | No audio state or render consumer verified. |
| Advanced music lane | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` (`Upbeat Corporate`) | Advanced UI | Display only | No music state or render consumer verified. |
| Advanced Preview button | Advanced Studio UI + Remotion Player | `studio/src/AdvancedStudioApp.tsx` (`previewSelectedScene`) | Advanced top bar | Implemented and canonical | Seeks to selected scene start and plays. |
| Advanced Player frame sync | Remotion Player | `studio/src/AdvancedStudioApp.tsx` (`playerRef`, event listeners) | Advanced UI state and timeline | Implemented and canonical | Syncs frame and playing state from Player. |
| Advanced Render button | Vite endpoint + Remotion CLI | `studio/src/AdvancedStudioApp.tsx` (`renderAdvanced`), `vite.studio.config.ts` (`/api/render-advanced`) | Advanced top bar | Partially implemented | Render runs, but output path is not surfaced persistently in UI. |
| Advanced Export button | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` top bar | Advanced UI | Display only | Button is disabled. |
| Advanced aspect ratio selector | Shared studio formats | `STUDIO_FORMATS`, `formatOrder` in `studio/src/AdvancedStudioApp.tsx` | Player, render endpoint | Implemented and canonical | Current visible options: portrait, square, vertical. |
| Advanced render composition registry | Remotion composition registry | `src/Composition.tsx` (`AdvancedStudioIntegrationProofPortrait/Square/Vertical`) | `/api/render-advanced` | Implemented and canonical | Composition id chosen by `formatId`. |
| AntV thumbnail serving | Vite middleware | `vite.studio.config.ts` (`/antv-studio-previews/`) | Advanced template browser | Partially implemented | Depends on generated files existing in `output/antv-studio/all`. |
| AntV legacy G2 browser adapter | Local Advanced module | `src/advanced-studio/g2-template-library.ts` | No verified current import | Legacy | Registry-derived but appears superseded by Universal Template Browser. |
| Root Remotion Studio app | Remotion composition registry | `src/index.ts`, `src/Composition.tsx` | Remotion CLI and studio | Implemented and canonical | Entry point for all Remotion compositions. |
| Project persistence | Vite dev middleware | `vite.studio.config.ts` (`/api/project`, `/api/render`, `/api/render-advanced`) | Animation Review save/render, Advanced render | Partially implemented | Animation Review auto-saves; Advanced render writes `public/advanced-project.json` only during render. |
| Undo and redo | None verified | No verified state/history owner | Advanced UI icons were previously present in screenshots; current code not verified as functional | Unresolved | Must not add custom history until owner is chosen. |
| Reset selected scene | Advanced UI need | No verified canonical action in current source | Intended admin workflow | Product model gap | Requires explicit owner and state mutation contract. |
| Duplicate selected scene | Advanced UI need | No verified canonical action in current source | Intended admin workflow | Product model gap | Requires explicit owner and scene id/duration rules. |
| Layer ordering | Board object order and Advanced scene order | `StudioProject.blocks` order, `AdvancedStudioProject.scenes` order | Board renderer, Advanced timeline | Partially implemented | Board order is implicit array order; Advanced scene order exists but timeline editing is limited. |

## 3. Provider Inventory

| Provider/System | Installed Version or Source | Current Integration | Status | Provider-First Notes |
|---|---:|---|---|---|
| AntV G2 | `@antv/g2` `^5.4.8` | `src/antv-studio/renderers/G2StudioRenderer.tsx`, `src/antv-studio/definitions/g2-designs.ts` | Implemented and canonical | Provider owns chart rendering. Current configs set `animate: false`. |
| AntV G6 | `@antv/g6` `^5.1.1` | `src/antv-studio/renderers/G6StudioRenderer.tsx`, `src/antv-studio/definitions/g6-designs.ts` | Implemented and canonical | Provider owns graph rendering and layout execution. Current configs set `animation: false`. |
| AntV S2 | `@antv/s2` `^2.7.2` | `src/antv-studio/renderers/S2StudioRenderer.tsx`, `src/antv-studio/definitions/s2-designs.ts` | UI exposure gap | Provider and registry are present; Advanced UI currently hides S2. |
| AntV Infographic | Package imported from `@antv/infographic` | `shared/AntVBlock.tsx`, `shared/antv/resolve.ts`, proof scripts | Implemented and canonical | Owns SVG infographic generation for board blocks. Runtime board adapter strips native animation. |
| Remotion | `remotion` `4.0.489` | `src/Composition.tsx`, `shared/ExplainerVideo.tsx`, Advanced composition | Implemented and canonical | Owns deterministic frame evaluation and CLI render. |
| Remotion Player | `@remotion/player` `4.0.489` | `studio/src/App.tsx`, `studio/src/AdvancedStudioApp.tsx` | Implemented and canonical | Owns browser playback controls and frame sync. |
| React | `react` `19.2.3`, `react-dom` `19.2.3` | Studio UIs and render components | Implemented and canonical | Owns UI state/render lifecycle. |
| Vite | `vite` `^8.1.4`, `@vitejs/plugin-react` `^6.0.3` | `vite.studio.config.ts` | Implemented and canonical | Owns local app hosting and dev-only render API middleware. |
| TypeScript | `typescript` `5.9.3` | Type checking via `tsc --noEmit` | Implemented and canonical | `npm run verify:studio` is the canonical current verification script. |
| Animation Review Studio | Repository-local system | `studio/src/App.tsx` | Implemented and canonical | Owns mature board authoring behavior. |
| Advanced Studio | Repository-local system | `studio/src/AdvancedStudioApp.tsx`, `src/advanced-studio/*` | Partially implemented | Owns combined sequence shell, not low-level provider behavior. |

## 4. Custom Framepoint Systems

| Custom System | Owner File/Symbol | What It Owns | What It Must Not Own | Status |
|---|---|---|---|---|
| Shared board motion | `shared/board-motion.ts` (`getBoardSemanticMotion`) | Board semantic framing, opacity, dimming flags, target resolution | Camera paths or AntV template animation | Implemented and canonical |
| Shared board renderer | `shared/Board.tsx` (`Board`) | Board coordinate surface, block ordering, inactive dimming, selection chrome | Scene timing or camera paths | Implemented and canonical |
| Shared AntV block adapter | `shared/AntVBlock.tsx`, `shared/antv/*` | Static SVG block generation inside board objects | Advanced AntV G2/G6/S2 scene templates | Implemented and canonical |
| AntV Studio design registry | `src/antv-studio/registry.ts` (`antVStudioDesigns`) | G2/G6/S2 template/design metadata and factories | Scene sequencing or board semantic motion | Implemented and canonical |
| AntV Studio renderer wrappers | `src/antv-studio/renderers/*StudioRenderer.tsx` | Provider lifecycle, readiness, cleanup, errors | Timeline, camera paths, or board motion | Implemented and canonical |
| Studio format/layout helper | `src/antv-studio/studio-formats.ts` | Format dimensions and infographic content layout | Board layout geometry | Implemented and canonical |
| Advanced scene contract | `src/advanced-studio/scene-contract.ts` | Advanced scene family, duration, content, transition, camera fields | Provider registry definitions | Implemented and canonical |
| Advanced composition | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | Scene sequencing, transitions, camera path wrapper, renderer selection | Provider internals or board semantic math | Implemented and canonical |
| Advanced camera paths | `src/advanced-studio/camera-paths.ts` | Optional cinematography transforms | Semantic animation presets | Implemented and canonical |
| Advanced UI shell | `studio/src/AdvancedStudioApp.tsx` | Admin controls, template selection, scene selection, Player controls | Rendering architecture | Partially implemented |

## 5. Field and Naming Map

| Product Meaning | Current Field/Symbol | Owner | Current Consumers | Status | Warning |
|---|---|---|---|---|---|
| Object | `StudioBlock` | `shared/project.ts` | Board, Animation Review, board motion | Implemented and canonical | Product copy may say Object; code says Block. |
| Object geometry | `StudioBlock.x/y/width/height` | `shared/project.ts` | Board renderer and board motion | Implemented and canonical | Do not invent separate geometry for board objects. |
| Board design preset | `StudioBlock.designPreset` | `shared/project.ts` | `studio/src/App.tsx`, `shared/Board.tsx` | Implemented and canonical | This is visual role/layout, not motion. |
| Animation Review scene target | `StudioScene.blockId` | `shared/project.ts` | Animation Review and `ExplainerVideo` | Implemented and canonical | `null` means overview/full board. |
| Advanced board scene target | `BoardSceneContent.activeBlockId` | `src/advanced-studio/BoardSceneRenderer.tsx` | Advanced board renderer and inspector | Implemented and canonical | Equivalent concept to `StudioScene.blockId` inside Advanced scene content. |
| Board semantic motion | `AnimationPreset`, `scene.animation`, `content.animation` | `shared/project.ts`, `shared/animation-presets.ts` | Animation Review, Advanced board scenes | Implemented and canonical | Do not confuse with AntV internal animation. |
| AntV internal template animation | `AntVStudioDesign.animation` | `src/antv-studio/types.ts` | AntV Studio preview and Advanced infographic renderer | Implemented but duplicated | Same field name `animation`, different meaning. |
| Camera motion | `scene.cameraPath` | `src/advanced-studio/scene-contract.ts`, `src/advanced-studio/camera-paths.ts` | Advanced composition and timeline display | UI exposure gap | Optional cinematography, not Semantic Motion. |
| Legacy camera fallback | `scene.cameraPreset` | `src/advanced-studio/scene-contract.ts` | Advanced composition fallback | Legacy | Keep visible in audits until removed from consumers. |
| Scene duration in Animation Review | `StudioScene.durationSeconds` | `shared/project.ts` | `ExplainerVideo` | Implemented and canonical | Converted to frames at 30 fps. |
| Scene duration in Advanced | `AdvancedStudioScene.durationFrames` | `src/advanced-studio/scene-contract.ts` | Advanced UI, Player, render endpoint | Implemented and canonical | Frame-native. |
| Transition | `transitionIn`, `transitionOut` | Advanced scene contract | `sceneOpacity`, inspector, timeline chips | Implemented and canonical | Crossfade only. |
| Format | `StudioFormatId` | `src/antv-studio/studio-formats.ts` | AntV Studio, Advanced, render endpoint | Implemented and canonical | Shared for infographic layouts and Advanced compositions. |
| Preview state | `currentFrame`, `isPlaying`, `playerRef` | `studio/src/AdvancedStudioApp.tsx` | Advanced UI and timeline | Implemented and canonical | UI state, not saved project state. |
| Render status | `renderStatus` | `studio/src/AdvancedStudioApp.tsx` | Advanced render button | Partially implemented | Does not expose last output path in UI. |

## 6. Preview and Render Parity Matrix

| Capability | Authoring Owner | Preview Consumer | Render Consumer | Status | Parity Notes |
|---|---|---|---|---|---|
| Animation Review board scenes | `studio/src/App.tsx` | `shared/ExplainerVideo.tsx` via Remotion Player | `/api/render` -> `ExplainerVideo` | Implemented and canonical | Preview and render share the same component. |
| Animation Review board semantic motion | `studio/src/App.tsx` + `shared/animation-presets.ts` | `getBoardSemanticMotion` inside `ExplainerVideo` | Same `ExplainerVideo` path | Implemented and canonical | Shared resolver guarantees parity for implemented presets. |
| Advanced board scenes | `studio/src/AdvancedStudioApp.tsx` | `AdvancedStudioIntegrationProof` -> `BoardSceneRenderer` | `/api/render-advanced` -> Advanced composition | Implemented and canonical | Uses same Advanced composition for preview and render. |
| Advanced board semantic motion | `AnimationReviewCameraInspector` for board scenes | `BoardSceneRenderer` -> `getBoardSemanticMotion` | Same Advanced composition path | Implemented and canonical | Same helper as Animation Review. |
| Advanced G2 scenes | Universal Template Browser and Infographic Inspector | `InfographicSceneRenderer` -> `G2StudioRenderer` | Same Advanced composition path | Implemented and canonical | Provider config is shared. |
| Advanced G6 scenes | Universal Template Browser and Infographic Inspector | `InfographicSceneRenderer` -> `G6StudioRenderer` | Same Advanced composition path | Implemented and canonical | Provider config is shared. |
| Advanced S2 scenes | Advanced schema only | `InfographicSceneRenderer` can choose S2 when scene exists | Same Advanced composition can choose S2 when scene exists | UI exposure gap | Authoring UI filters out S2, though registry and renderer exist. |
| AntV Studio proof preview | `src/AntVAnimationProof.tsx` | `FramepointPreviewStage` | `AntVAnimationProof` composition in `src/Composition.tsx` | Experimental | Useful proof surface, not the Advanced final sequence path. |
| Advanced camera paths | `scene.cameraPath` contract | `cameraPathStyle` wrapper in Advanced composition | Same Advanced composition path | UI exposure gap | Preview/render consumer exists; current UI writer is not verified. |
| Advanced transitions | Transition inspector | `sceneOpacity` in Advanced composition | Same Advanced composition path | Implemented and canonical | Crossfade parity exists. |
| Advanced render output path | `/api/render-advanced` response | Not surfaced in Player UI | Endpoint returns `output/advanced-studio-${formatId}.mp4` | UI exposure gap | Render completes but last output is hard to discover. |
| Audio waveform | UI markup | No verified audio consumer | No verified render consumer | Display only | Visual placeholder. |
| Music track | UI markup | No verified audio consumer | No verified render consumer | Display only | Visual placeholder. |

## 7. Existing Proofs of Concept

| Proof | Source | What It Proves | Current Consumer | Status |
|---|---|---|---|---|
| Board Focus/Spotlight preview/render | `shared/ExplainerVideo.tsx`, `shared/board-motion.ts`, `shared/Board.tsx` | Semantic board motion can target saved block geometry and dim inactive blocks | Animation Review and Advanced board scenes | Implemented and canonical |
| Animation Review preset assignment | `studio/src/App.tsx` (`applyAnimationPreset`) | Preset click can write target and semantic motion into a scene | Animation Review Studio | Implemented and canonical |
| Shared semantic metadata | `shared/animation-presets.ts` | Preset labels and descriptions can be shared without duplication | Animation Review and Advanced UI | Implemented and canonical |
| Advanced mixed scene sequencing | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | Board and AntV scenes can share one timeline and one Remotion composition | Advanced preview/render | Implemented and canonical |
| Advanced camera path composition | `src/advanced-studio/camera-paths.ts`, `AdvancedStudioIntegrationProof.tsx` | Camera transforms can wrap scene renderers independently of semantic motion | Advanced preview/render | Implemented and canonical |
| AntV registry validation | `scripts/validate-antv-studio.mjs`, `src/antv-studio/registry.ts` | G2/G6/S2 design registry can be validated before build | `npm run verify:studio` | Implemented and canonical |
| AntV renderer lifecycle cleanup | `G2StudioRenderer.tsx`, `G6StudioRenderer.tsx`, `S2StudioRenderer.tsx` | Provider instances are created, rendered, verified, and destroyed | AntV Studio and Advanced infographic scenes | Implemented and canonical |
| AntV rendered thumbnails | `vite.studio.config.ts` preview route and `output/antv-studio/all/*.png` | Template browser can display rendered design previews | Advanced Universal Template Browser | Partially implemented |
| AntV infographic native SVG proof scripts | `scripts/antv-animation-proof.mjs`, `scripts/generate-sequence-animation-proofs.mjs` | Native AntV infographic SVG behavior can be inspected/generated | Proof artifacts only | Experimental |

## 8. Ownership Conflicts and Unknowns

| Conflict or Unknown | Current Evidence | Why It Matters | Status | Required Resolution |
|---|---|---|---|---|
| `animation` means two different things | `shared/project.ts` uses board semantic `AnimationPreset`; `src/antv-studio/types.ts` uses template/internal animation `AnimationPreset` | UI and code can accidentally route board semantic requests into infographic renderer animation | Implemented but duplicated | Keep field interpretation scoped by owner; avoid new generic `animation` controls without owner labels. |
| Advanced Camera tab currently hosts semantic Animation Presets | `studio/src/AdvancedStudioApp.tsx` (`AnimationReviewCameraInspector`) | Terminology conflicts with `scene.cameraPath`, which is actual cinematography | Product model gap | Decide whether tab label, control label, or camera-path UI should change before more controls are added. |
| Camera path has render consumer but no verified current UI writer | `cameraPathStyle` consumes `scene.cameraPath`; current inspector source does not expose path list | Admin cannot test camera paths without state edits or prior defaults | UI exposure gap | Add a UI writer that uses `advancedStudioCameraPaths`, without touching semantic presets. |
| AntV Studio and Advanced duplicate wrapper animation code | `FramepointPreviewStage.animationStyle`; `InfographicSceneRenderer.designAnimationStyle` | Template animation behavior can drift between proof studio and Advanced render | Implemented but duplicated | Extract shared wrapper animation only if future work needs exact parity. |
| S2 exists but is hidden in Advanced UI | `AdvancedStudioSceneType` includes `s2`; registry validates 8 S2 designs; `engineOrder` is G2/G6 | Users cannot author S2 scenes through Advanced despite provider support | UI exposure gap | Add S2 to Advanced filters only when requested. |
| Board complete-scene presets are not normalized | Board source has blocks, design presets, and scenes, but no verified complete Board template browser registry | Universal template browser should not fake board templates | Product model gap | Classify board sources before adding Board to template browser. |
| Audio/music lanes appear functional but have no verified render state | Timeline displays waveform and `Upbeat Corporate`; no project field/render consumer verified | Users may think audio is exported | Display only | Mark as display-only until audio state and Remotion audio source exist. |
| Export button appears in top bar but is disabled | `studio/src/AdvancedStudioApp.tsx` top bar button disabled | User may confuse Render and Export | Display only | Either wire to render/download workflow or keep visibly disabled with admin copy. |
| Render output path is returned but not visible | `/api/render-advanced` returns `output`; `renderAdvanced` only stores status text | Slows export testing | UI exposure gap | Store and display last output path in render status panel. |
| Legacy `cameraPreset` fallback remains active | `scene-contract.ts` defines `cameraPreset?: "push-in"`; Advanced composition reads it | Old state can affect camera behavior | Legacy | Remove only after confirming no saved Advanced project depends on it. |
| Undo/redo ownership is not verified | No canonical history reducer found in audited Advanced source | Implementing custom undo risks duplicating future state owner | Unresolved | Choose state-history owner before implementation. |
| Infographic element targeting is not modeled | G2/G6/S2 content has rows/nodes/edges but no canonical selected visual element target in Advanced scenes | Focus-style semantic object motion cannot target bars/nodes truthfully yet | Product model gap | Add provider-backed element target model only after inspecting AntV hit testing/geometry APIs. |

## 9. Mandatory Lookup Checklist

Before changing Advanced Studio, answer these in order:

1. Name the requested function in Framepoint terminology from `docs/framepoint-core-terminology.md`.
2. Identify whether it is Object layout, Design Preset, Scene Target, Semantic Motion, Camera Motion, Internal Object Animation, Preview, Render, timeline, or project state.
3. Find the owner row in this document.
4. If the owner is `Implemented and canonical`, reuse that source directly.
5. If the status is `Implemented but duplicated`, decide which existing implementation is canonical before editing.
6. If the status is `UI exposure gap`, add only UI/state wiring to the existing owner.
7. If the status is `State wiring gap`, define exactly which existing field must be written.
8. If the status is `Preview wiring gap`, trace the Remotion Player input props and component path before adding UI.
9. If the status is `Render wiring gap`, trace the Vite render endpoint, composition id, props file, and Remotion component before adding UI.
10. If the status is `Provider capability available but unwired`, inspect provider integration and local definitions before adding custom code.
11. If the status is `Product model gap`, do not invent a field silently; document the product decision required.
12. If the status is `Display only`, do not describe it as implemented behavior.
13. If the status is `Legacy`, confirm current consumers before removing it.
14. If the status is `Unresolved`, stop implementation and audit first.
15. Verify that Preview and final Render consume the same state and component path.
16. Verify that Semantic Motion and Camera Motion remain separate nested layers.
17. Verify that AntV renderer-owned behavior is not recreated by a generic wrapper unless no provider or existing Framepoint owner exists.
18. Run `npm run verify:studio` after code changes that affect Advanced Studio, AntV registry, shared board motion, Remotion composition, or render endpoints.

