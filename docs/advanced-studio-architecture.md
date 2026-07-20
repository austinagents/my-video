# Advanced Studio Architecture

This document is a repository-grounded engineering reference for the current Advanced Studio implementation. It documents observed behavior in the codebase as of the current working tree. It does not define a replacement architecture.

Related reference documents:

- `docs/framepoint-core-terminology.md`
- `docs/provider-first-implementation-standard.md`
- `docs/framepoint-system-ownership-map.md`

## 1. High-Level Architecture

Advanced Studio is a React authoring shell and Remotion playback/render path that combines Board scenes with AntV G2, G6, and S2 infographic scenes in one timeline.

The core flow is:

```text
AdvancedStudioProject
  -> AdvancedStudioScene[]
  -> scene.type
  -> scene content contract
  -> provider/design lookup
  -> scene renderer
  -> AdvancedStudioIntegrationProof
  -> Remotion Player preview
  -> /api/render-advanced
  -> Remotion CLI export
```

The Advanced Studio project model is `AdvancedStudioProject` in `src/advanced-studio/scene-contract.ts`. It stores a title and an ordered array of `AdvancedStudioScene` objects. Each scene stores `id`, `type`, `title`, `durationFrames`, `content`, optional `transitionIn`, optional `transitionOut`, optional `cameraPath`, and a legacy `cameraPreset` fallback.

`studio/src/AdvancedStudioApp.tsx` owns the browser UI at `/advanced-studio.html`. It owns local UI state such as selected scene, current frame, playback state, render status, authoring selections, and inspector actions. It does not own provider rendering internals.

`src/advanced-studio/AdvancedStudioIntegrationProof.tsx` owns the Remotion composition used by preview and render. It derives timed scenes, decides which scene layers are visible for a frame, applies transition opacity, applies camera-path transforms, routes each scene to its renderer, and mounts all active scene layers.

Scene type determines the renderer:

- `board` scenes route to `BoardSceneRenderer`.
- `g2`, `g6`, and `s2` scenes route through `InfographicSceneRenderer`, which dispatches to the provider-specific renderer based on the selected AntV design engine.

The AntV provider registry is `antVStudioDesigns` in `src/antv-studio/registry.ts`. It combines `g2Designs`, `s2Designs`, and `g6Designs`. Design IDs are the provider scene composition selectors for infographic scenes.

Preview uses Remotion Player in `studio/src/AdvancedStudioApp.tsx` with `AdvancedStudioIntegrationProof` as the component. Export uses the Vite development middleware endpoint `/api/render-advanced` in `vite.studio.config.ts`, which writes props to `public/advanced-project.json` and runs Remotion CLI against the matching Advanced Studio composition ID.

Ownership boundaries:

| Area | Current owner |
| --- | --- |
| Advanced scene schema | `src/advanced-studio/scene-contract.ts` |
| Default 14-scene project | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` |
| Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` |
| Timeline timing helpers | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` |
| Transition opacity | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` |
| Camera path definitions and transform | `src/advanced-studio/camera-paths.ts` |
| Board semantic motion | `shared/board-motion.ts` |
| Board canvas and block rendering | `shared/Board.tsx`, `shared/AntVBlock.tsx`, `shared/antv/*` |
| AntV design registry | `src/antv-studio/registry.ts` |
| Provider-design compatibility | `src/antv-studio/compatibility.ts`, `AntVStudioDesign.capabilities` |
| G2 design definitions | `src/antv-studio/definitions/g2-designs.ts` |
| G6 design definitions | `src/antv-studio/definitions/g6-designs.ts` |
| S2 design definitions | `src/antv-studio/definitions/s2-designs.ts` |
| G2 provider lifecycle | `src/antv-studio/renderers/G2StudioRenderer.tsx` |
| G6 provider lifecycle | `src/antv-studio/renderers/G6StudioRenderer.tsx` |
| S2 provider lifecycle | `src/antv-studio/renderers/S2StudioRenderer.tsx` |
| Format/layout helper | `src/antv-studio/studio-formats.ts` |
| Remotion composition registration | `src/Composition.tsx`, `src/Root.tsx`, `src/index.ts` |
| Advanced render endpoint | `vite.studio.config.ts` |

## 2. Scene Types

Advanced Studio supports four scene types through `AdvancedStudioSceneType`: `board`, `g2`, `g6`, and `s2`.

### Board

Purpose:

Board scenes present a shared board/canvas made of `StudioBlock` objects. They are used for document-flow, process, proof, decision, and overview sections.

Data contract:

```ts
type BoardSceneContent = {
  project?: StudioProject;
  activeBlockId: string | null;
  animation: AnimationPreset;
};
```

Owner:

- Scene family contract: `src/advanced-studio/scene-contract.ts`
- Board content contract and renderer adapter: `src/advanced-studio/BoardSceneRenderer.tsx`
- Board project/block schema: `shared/project.ts`

Renderer:

- Advanced wrapper: `BoardSceneRenderer`
- Canvas renderer: `Board`
- Block renderer: `AntVBlock`

Editable properties currently exposed:

- Scene type in the Scene inspector.
- Scene title in the Scene inspector.
- For Board semantic animation, the Camera tab currently exposes shared animation presets for Board scenes.
- Higher-level authoring controls can apply Board `project`, Board `animation`, `cameraPath`, and transitions to the selected scene by writing existing scene fields.

Animation ownership:

- Semantic motion is owned by `shared/board-motion.ts`.
- Inactive-object dimming is applied by `shared/Board.tsx`.
- Board block internal AntV infographic SVG generation is owned by `shared/AntVBlock.tsx` and `shared/antv/*`.

Camera ownership:

- `scene.cameraPath` is stored on the Advanced scene.
- Camera presets and transforms are owned by `src/advanced-studio/camera-paths.ts`.
- The transform is applied by `renderScene` in `AdvancedStudioIntegrationProof`.

Transition ownership:

- `transitionIn` and `transitionOut` are stored on the Advanced scene.
- Crossfade opacity is calculated by `sceneOpacity` in `AdvancedStudioIntegrationProof`.

### G2

Purpose:

G2 scenes render chart-based infographic scenes such as donut breakdowns, funnels, trend lines, area charts, radar charts, and scatter charts.

Data contract:

G2 scenes use `AdvancedStudioInfographicContent`:

```ts
type AdvancedStudioInfographicContent = {
  designId: string;
  content?: StudioContent;
  controls?: StudioControls;
};
```

`StudioContent.rows` supplies chart rows. `StudioContent.nodes` and `StudioContent.edges` are not the primary G2 data path.

Owner:

- Scene content contract: `src/advanced-studio/scene-contract.ts`
- Design registry: `src/antv-studio/registry.ts`
- G2 design definitions: `src/antv-studio/definitions/g2-designs.ts`

Renderer:

- `InfographicSceneRenderer` selects the design, validates design/content compatibility, and applies wrapper animation.
- `G2StudioRenderer` creates an AntV `Chart`, calls the design `createOptions` factory, applies `chart.options`, renders, validates that a canvas or SVG root exists, and cleans up provider instances.

Editable properties currently exposed:

- Scene title.
- Scene type.
- Design selection through the Advanced Studio template browser or infographic inspector.
- Content rows and controls through the infographic inspector where wired.
- Higher-level authoring controls can apply a different `designId`, `cameraPath`, and transitions by writing existing scene fields.

Animation ownership:

- Provider-native G2 chart animation is currently disabled by local G2 specs through `animate: false`.
- Current visible provider animation for Advanced scenes is wrapper animation owned by `InfographicSceneRenderer.designAnimationStyle`, selected from `AntVStudioDesign.animation`.

Camera ownership:

- Same Advanced camera path owner as other scene types.

Transition ownership:

- Same Advanced transition owner as other scene types.

### G6

Purpose:

G6 scenes render graph-based infographic scenes such as radial explainers, resource flows, decision trees, snake processes, force-layout concept maps, and other graph layouts.

Data contract:

G6 scenes use `AdvancedStudioInfographicContent`. Generic graph designs use `StudioContent.nodes` and `StudioContent.edges`:

```ts
type StudioNode = {
  id: string;
  label: string;
  value?: number;
  group?: string;
  parentId?: string;
};

type StudioEdge = {
  source: string;
  target: string;
  label?: string;
  value?: number;
};
```

Hierarchy/tree designs use explicit provider-native hierarchy data under `StudioContent.providerData`:

```ts
type StudioJsonValue =
  | string
  | number
  | boolean
  | null
  | StudioJsonValue[]
  | {[key: string]: StudioJsonValue};

type G6HierarchyNode = {
  id: string;
  label: string;
  children?: G6HierarchyNode[];
  value?: number;
  category?: string;
  metadata?: Record<string, StudioJsonValue>;
};

type G6HierarchyData = {
  kind: "g6-hierarchy";
  root: G6HierarchyNode;
};
```

The hierarchy contract is distinct from generic graph content. Generic `nodes` and `edges` are not silently converted into hierarchy data.

Owner:

- Scene content contract: `src/advanced-studio/scene-contract.ts`
- Design registry: `src/antv-studio/registry.ts`
- G6 design definitions and graph-data conversion: `src/antv-studio/definitions/g6-designs.ts`
- G6 hierarchy compatibility validation: `src/antv-studio/compatibility.ts`

Renderer:

- `InfographicSceneRenderer` selects the design, validates design/content compatibility, and applies wrapper animation.
- `G6StudioRenderer` creates an AntV `Graph`, obtains config from `design.createGraphConfig`, calls `graph.setData`, renders, validates canvas/SVG output, and cleans up provider instances.

Editable properties currently exposed:

- Scene title.
- Scene type.
- Design selection through Advanced UI surfaces where the selected design engine is G6.
- Node and edge content through infographic content state where wired.
- Hierarchy content is typed in the provider-native content contract but is not exposed as raw G6 configuration in the current UI.
- Higher-level authoring controls can apply a different `designId`, `cameraPath`, and transitions by writing existing scene fields.

Animation ownership:

- G6 graph configs set provider `animation: false`.
- Current visible provider animation is wrapper animation owned by `InfographicSceneRenderer.designAnimationStyle`, selected from `AntVStudioDesign.animation`.

Camera ownership:

- Same Advanced camera path owner as other scene types.

Transition ownership:

- Same Advanced transition owner as other scene types.

Common failure modes:

- Some G6 layouts require a specific graph structure beyond generic `nodes` and `edges`.
- Current hierarchy/tree-compatible G6 designs use the provider-native hierarchy contract and adapter.
- A safe G6 design switch must preserve compatibility between the design's layout contract and the scene's content structure. Compatibility is represented by provider-design capability metadata and validated before provider renderer execution.

### S2

Purpose:

S2 scenes render scorecards and table-like infographic scenes.

Data contract:

S2 scenes use `AdvancedStudioInfographicContent`. The meaningful provider data is `StudioContent.rows`; S2 design definitions map rows into table data and columns.

Owner:

- Scene content contract: `src/advanced-studio/scene-contract.ts`
- Design registry: `src/antv-studio/registry.ts`
- S2 design definitions: `src/antv-studio/definitions/s2-designs.ts`

Renderer:

- `InfographicSceneRenderer` selects the design, validates design/content compatibility, and applies wrapper animation.
- `S2StudioRenderer` creates an AntV S2 `TableSheet`, obtains `dataCfg` and `options` from `design.createSheetConfig`, renders, validates canvas output, and cleans up provider instances.

Editable properties currently exposed:

- Existing scene content can render as S2.
- The ownership map records an Advanced UI exposure gap: S2 exists in the schema, registry, and renderer, but the current Advanced template browser has historically filtered authoring to G2/G6 in some paths.
- Higher-level authoring controls can apply S2 `designId`, `cameraPath`, and transitions to an existing S2 scene by writing existing scene fields.

Animation ownership:

- S2 designs use the `row-reveal` animation metadata.
- Current visible provider animation is wrapper animation owned by `InfographicSceneRenderer.designAnimationStyle`.

Camera ownership:

- Same Advanced camera path owner as other scene types.

Transition ownership:

- Same Advanced transition owner as other scene types.

## 3. Rendering Ownership

Rendering is intentionally split by layer because each layer answers a different question and has a different source of truth.

| Concern | Owner | Current implementation | Why separate |
| --- | --- | --- | --- |
| Scene composition | Advanced scene data | `AdvancedStudioScene.content`, Board `project`, infographic `designId` | Composition defines what appears before motion is applied. |
| Content | Scene content model | Board block titles/types; `StudioContent.rows/nodes/edges` | Content should survive design/camera/transition changes. |
| Timing | Advanced timeline helpers | `durationFrames`, `getAdvancedStudioTimedScenes`, `getAdvancedStudioProjectDuration` | Timing controls scene order and frame ranges independently of rendering providers. |
| Timeline | Advanced Studio composition/UI | Timed scenes in `AdvancedStudioIntegrationProof`; timeline UI in `AdvancedStudioApp` | The timeline sequences scenes; it does not render provider internals. |
| Camera | Advanced camera system | `cameraPathStyle` in `camera-paths.ts` | Camera is whole-scene cinematography around the completed scene. |
| Transitions | Advanced composition | `sceneOpacity` crossfade calculation | Transitions blend scene layers and are separate from scene contents. |
| Semantic motion | Shared Board motion resolver | `getBoardSemanticMotion` | Semantic motion targets Board objects and is not the same as whole-scene camera motion. |
| Provider animation | AntV design metadata + Advanced wrapper | `AntVStudioDesign.animation`, `designAnimationStyle` | Internal chart/graph/table reveal is selected by design metadata. |
| Provider compatibility | AntV design metadata + compatibility validator | `AntVStudioDesign.capabilities`, `validateStudioDesignCompatibility` | Provider designs declare required data structures so incompatible scene/design pairs can be rejected before renderer execution. |
| Provider rendering | AntV renderers | G2 `Chart`, G6 `Graph`, S2 `TableSheet` | Provider renderers own provider lifecycle and output validation. |
| Preview | Remotion Player | `Player` in `AdvancedStudioApp` | Preview evaluates the same composition as render in the browser. |
| Export | Vite middleware + Remotion CLI | `/api/render-advanced` | Export serializes project props and invokes Remotion CLI. |

The separation prevents camera movement from replacing semantic motion, prevents inspector UI from becoming a renderer, and keeps provider-specific concerns inside their provider owners.

## 4. Board

The Board system is inherited from the shared Animation Review architecture.

### Board project

A Board scene contains a `StudioProject` through `BoardSceneContent.project`. If no project is provided, `BoardSceneRenderer` falls back to `defaultProject`.

`StudioProject` contains:

- `title`
- `subtitle`
- `blocks`
- `scenes`

Advanced board scenes primarily use `project.blocks`; their own Advanced scene object supplies the Advanced timeline fields.

### Blocks and objects

Product term: Object.

Implementation term: `StudioBlock`.

`StudioBlock` stores:

- `id`
- `type`
- `title`
- `x`
- `y`
- `width`
- `height`
- `designPreset`
- optional AntV override fields: `template`, `theme`, `syntax`, `data`

`Board` renders a fixed 1000 by 640 board surface. It maps over `project.blocks`, places each block absolutely using its geometry, applies selected/dimmed styling when requested, and renders each block through `AntVBlock`.

### Semantic motion

`BoardSceneRenderer` calls `getBoardSemanticMotion` with the Board project, `activeBlockId`, `animation`, local frame, duration, fps, and output scale.

`getBoardSemanticMotion` resolves:

- active block
- active block ID
- whether inactive blocks should dim
- opacity
- transform
- React style

Implemented distinct behavior includes:

- `focus`: target framing with scale around `1.12`
- `spotlight`: stronger target framing with scale around `1.18` and inactive dimming
- `count`: target framing with scale around `1.09`
- `reveal`: reveal opacity plus focus-family framing when a target exists
- `overview`: full-board behavior when target is null

`build`, `trace`, and `compare` are part of the shared preset vocabulary, but the ownership map notes that they do not currently have complete distinct renderer behavior in the shared board-motion path.

### Layouts

Board layout is currently the block geometry stored in `StudioProject.blocks`. There is no separate Board layout registry in the audited implementation.

When a higher-level authoring feature changes Board composition, it does so by writing Board project data. The Board renderer still consumes `StudioProject.blocks`; the authoring feature does not become a separate Board renderer.

### Editable vs generated fields

Editable/persisted fields:

- Block geometry and design preset when written into `StudioProject.blocks`
- Scene target through `BoardSceneContent.activeBlockId`
- Semantic preset through `BoardSceneContent.animation`
- Scene camera/transition/timing through `AdvancedStudioScene`

Generated/render-time fields:

- Board semantic transform and dimming from `getBoardSemanticMotion`
- AntV block render input from `resolveAntVRenderInput`
- AntV syntax from `buildAntVSyntax` unless `block.syntax` is explicitly provided
- Static SVG preparation from `prepareStaticSvg`

## 5. G2

G2 scenes are AntV chart scenes.

### Design registry

G2 designs live in `src/antv-studio/definitions/g2-designs.ts` and are exported as `g2Designs`. They are included in `antVStudioDesigns` through `src/antv-studio/registry.ts`.

Each G2 design has:

- `engine: "g2"`
- `id`
- `name`
- `category`
- `description`
- `industryExample`
- `animation`
- `defaultContent`
- `createOptions`

The registry validation currently expects 26 G2 designs.

### Design IDs

`AdvancedStudioInfographicContent.designId` selects the design. `AdvancedStudioIntegrationProof.renderScene` calls `requireDesign(content.designId, scene.type)` to retrieve a registered design matching the scene engine.

The default 14-scene project uses these G2 designs:

- `g2-donut-breakdown`
- `g2-conversion-funnel`
- `g2-smooth-trend`
- `g2-kpi-sparkline`

### Provider animation

Local G2 specs set `animate: false` in the shared base options. Current Advanced-visible animation comes from `AntVStudioDesign.animation` interpreted by `InfographicSceneRenderer.designAnimationStyle`, not provider-native G2 animation.

### Supported layouts

Supported visual forms are the registered G2 design factories. Examples include:

- donut/theta interval
- transposed interval funnel/ranked bars
- smooth line
- area chart
- sparkline line
- polar/radial chart variants
- point/scatter relationship maps

These forms are not selected by a generic layout field. They are selected by `designId`.

### Rendering pipeline

```text
AdvancedStudioScene(type: "g2")
  -> AdvancedStudioInfographicContent.designId
  -> antVStudioDesigns lookup
  -> InfographicSceneRenderer
  -> designAnimationStyle
  -> G2StudioRenderer
  -> design.createOptions({content, controls, width, height})
  -> new Chart(...)
  -> chart.options(...)
  -> chart.render()
```

## 6. G6

G6 scenes are AntV graph scenes.

### Graph structures

The local G6 definition helper supports two data paths:

- Generic graph: converts `StudioContent.nodes` and `StudioContent.edges` into AntV G6 `GraphData`.
- Hierarchy/tree: converts `StudioContent.providerData.kind === "g6-hierarchy"` into AntV G6 `GraphData` with node `children` ID arrays and generated parent-child edges.

Nodes are mapped into rectangular G6 nodes with label and style data. Edges are mapped into line edges with source, target, optional label, arrow, and style.

The generic conversion remains edge-list oriented. It does not automatically transform edge lists into tree-specific provider shapes.

### Layouts

G6 design definitions select a G6 layout inside each design factory. Current registered examples include:

- radial
- circular
- force
- dagre top-bottom
- dagre left-right
- snake
- fishbone
- compact-box

The layout is owned by the G6 design definition. Scene data selects the design by `designId`; it does not directly provide a layout field.

### Tree handling

Some registered designs use layouts that are compatible with generic nodes and edges. Hierarchy/tree layouts require `StudioContent.providerData.kind === "g6-hierarchy"` and are validated before provider rendering.

Current hierarchy-backed registered designs include:

- `g6-fishbone`
- `g6-compact-box-tree`

### Provider animation

G6 graph configs set `animation: false`. Current Advanced-visible animation comes from `AntVStudioDesign.animation` interpreted by `InfographicSceneRenderer.designAnimationStyle`.

### Render flow

```text
AdvancedStudioScene(type: "g6")
  -> AdvancedStudioInfographicContent.designId
  -> antVStudioDesigns lookup
  -> InfographicSceneRenderer
  -> designAnimationStyle
  -> G6StudioRenderer
  -> design.createGraphConfig({content, controls, width, height})
  -> new Graph(...)
  -> graph.setData(config.data)
  -> graph.render()
```

## 7. S2

S2 scenes are AntV table and scorecard scenes.

### Scorecard/table layouts

S2 designs live in `src/antv-studio/definitions/s2-designs.ts` and are exported as `s2Designs`. Each design is created through the local `make` helper, which supplies metadata, default content, `animation: "row-reveal"`, and a `createSheetConfig` factory.

The `tableConfig` helper maps `StudioContent.rows` into S2 table data. It creates fields such as:

- `item`
- `value`
- `rank`
- `group`
- `secondaryValue`
- `target`

Each S2 design chooses which columns appear and how their headers are named.

### Design ownership

S2 static composition is selected by `designId`, not by a separate generic table layout field. The S2 design owns column selection and table config.

### Provider animation

S2 designs use `row-reveal` metadata. The current Advanced visible animation is produced by `InfographicSceneRenderer.designAnimationStyle`, which applies opacity, clipping, and translation based on design animation metadata.

## 8. Template Architecture

A Scene Template is a complete reusable scene composition concept. In Advanced Studio architecture, templates belong above scene data and below the authoring UI: they select or write scene-owned fields, then the normal render pipeline consumes those fields.

Templates interact with rendering by configuring existing owners:

- Board scene templates configure Board project data and Board semantic motion fields.
- Infographic scene templates configure provider design selection and provider-compatible content.
- Motion-oriented template choices configure existing camera path and transition fields.
- Preview and export do not render templates directly. They render the resulting `AdvancedStudioProject`.

Current behavior-template implementation details live in `docs/advanced-studio-template-system.md`.

## 9. Current Limitations

Observed limitations from the current implementation:

- Provider animation is design-owned. Infographic scenes do not expose a separate per-scene provider animation field; animation metadata comes from the selected `AntVStudioDesign.animation`.
- Provider-native G2 and G6 animation is disabled in current local definitions. Current Advanced-visible infographic animation is wrapper animation in `InfographicSceneRenderer`.
- Some provider designs require data structures that not every scene can satisfy. Design selection is constrained by provider layout/data compatibility.
- Compatibility metadata now prevents known incompatible design/content combinations from reaching provider renderer execution, but provider-native data adapters for hierarchy, pivot, layered, and compound structures are still not implemented.
- Board layouts are stored as block geometry inside `StudioProject.blocks`. There is no separate canonical Board layout registry in the audited implementation.
- S2 provider support exists in schema, registry, and renderer. The ownership map records current Advanced UI exposure gaps around S2 authoring surfaces.
- Audio and music lanes in Advanced Studio are display-only in the audited implementation. No project state or render consumer is documented for them.
- The Export button is display-only/disabled in the ownership map. The working export-like path is the Render button calling `/api/render-advanced`.
- Render output path is returned by the endpoint and held in UI state, but historical audits note discoverability issues around output path visibility.
- The `animation` term is overloaded: Board semantic motion uses `shared/project.ts` `AnimationPreset`; AntV internal/wrapper animation uses `src/antv-studio/types.ts` `AnimationPreset`.
- Legacy `cameraPreset` remains in the Advanced scene contract and is still read as a fallback.

## 10. True Scene Templates

Conceptually, a true Scene Template would define a complete reusable static scene composition and its compatible behavior choices while preserving the ownership boundaries documented here.

Within the current architecture, a true Scene Template must still hand off to canonical owners:

- Board composition remains Board project/block data rendered by `Board`.
- G2/G6/S2 visual composition remains provider design and provider-compatible content rendered by AntV renderers.
- Camera remains `cameraPath` interpreted by `cameraPathStyle`.
- Transitions remain `transitionIn` and `transitionOut` interpreted by `sceneOpacity`.
- Board semantic motion remains `content.animation` interpreted by `getBoardSemanticMotion`.
- Preview and export remain consumers of the resulting `AdvancedStudioProject`.

Current behavior-template implementation details are documented in `docs/advanced-studio-template-system.md`.

## 11. File Map

| File | Purpose | Responsibilities | Major exports |
| --- | --- | --- | --- |
| `src/advanced-studio/scene-contract.ts` | Advanced scene schema | Defines scene types, scene content shape, transitions, camera path field, timed scenes, and project shape | `SceneBounds`, `SceneRendererProps`, `AdvancedStudioSceneType`, `AdvancedStudioInfographicContent`, `AdvancedStudioScene`, `AdvancedStudioTimedScene`, `AdvancedStudioProject`, `isInfographicSceneType` |
| `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` | Advanced Remotion composition and default 14-scene sequence | Defines default project, scene timing helpers, scene opacity, scene visibility, render routing, camera wrapping, and composition component | `createAdvancedStudioInfographicContent`, `advancedStudioDefaultProject`, `getAdvancedStudioProjectDuration`, `getAdvancedStudioTimedScenes`, `advancedStudioIntegrationProofDuration`, `advancedStudioIntegrationTimedScenes`, `advancedStudioIntegrationScenes`, `getAdvancedStudioSceneAtFrame`, `AdvancedStudioIntegrationProof`, `advancedStudioIntegrationFormats`, `advancedStudioIntegrationFps` |
| `src/advanced-studio/BoardSceneRenderer.tsx` | Advanced Board scene renderer adapter | Converts Advanced Board scene content into shared Board rendering and shared semantic motion | `BoardSceneContent`, `BoardSceneRenderer` |
| `src/advanced-studio/InfographicSceneRenderer.tsx` | Advanced infographic scene renderer | Applies title/subtitle shell, format layout, design wrapper animation, provider renderer dispatch, render readiness/error handling | `InfographicSceneContent`, `InfographicSceneRenderer` |
| `src/advanced-studio/camera-paths.ts` | Advanced camera system | Defines camera path presets and computes frame-progress transform style | `AdvancedStudioCameraPathPreset`, `CameraPathPoint`, `AdvancedStudioCameraPath`, `advancedStudioCameraPaths`, `getAdvancedStudioCameraPath`, `cameraPathStyle` |
| `studio/src/AdvancedStudioApp.tsx` | Advanced Studio browser UI | Owns project UI state, selected scene, Remotion Player preview, inspector, template/design browser, render button, and authoring orchestration | `AdvancedStudioApp` |
| `studio/src/advanced-main.tsx` | Advanced Studio browser entry point | Mounts `AdvancedStudioApp` and Advanced Studio CSS | none beyond module side effect |
| `studio/advanced-studio.html` | Advanced Studio HTML route | Provides the DOM root for `/advanced-studio.html` | none |
| `studio/src/advanced-studio.css` | Advanced Studio styling | UI layout, panels, inspector, timeline, and authoring controls | none |
| `shared/project.ts` | Shared Board/Animation Review project schema | Defines Board block/object types, design presets, semantic animation presets, scenes, and default project | `BlockType`, `DesignPreset`, `AnimationPreset`, `StudioBlock`, `StudioScene`, `StudioProject`, `blockDefinitions`, `defaultProject` |
| `shared/Board.tsx` | Shared Board canvas renderer | Renders fixed board surface, project title/subtitle, blocks, selection chrome, dimming, and block placement | `Board` |
| `shared/board-motion.ts` | Shared Board semantic motion resolver | Resolves target block, focus/spotlight/reveal/count/overview transforms, opacity, and dimming flags | `BoardSemanticMotionInput`, `BoardSemanticMotion`, `getBoardSemanticMotion` |
| `shared/AntVBlock.tsx` | Board block AntV adapter | Resolves AntV render input, invokes `@antv/infographic`, prepares static SVG, handles render errors | `AntVBlock` |
| `shared/antv/resolve.ts` | Board block template resolver | Maps block type and design preset to AntV infographic template names, padding, and internal dimensions | `ResolvedAntVBlock`, `resolveAntVBlock` |
| `shared/antv/input.ts` | Board block render input builder | Combines resolved template and generated syntax for `AntVBlock` | `AntVRenderInput`, `resolveAntVRenderInput` |
| `shared/antv/syntax.ts` | Board block syntax generation | Generates AntV infographic syntax by block type when explicit syntax is absent | `buildAntVSyntax` |
| `shared/antv/svg.ts` | Static SVG preparation | Prepares provider SVG for deterministic Board block display | `prepareStaticSvg` |
| `src/antv-studio/types.ts` | AntV Studio type contract | Defines design, content, row, node, edge, G6 hierarchy, controls, factory, and render status types | `AntVEngine`, `AnimationPreset`, `StudioRow`, `StudioNode`, `StudioEdge`, `G6HierarchyNode`, `G6HierarchyData`, `StudioContent`, `StudioControls`, `FactoryContext`, `G2StudioDesign`, `S2StudioDesign`, `G6StudioDesign`, `AntVStudioDesign`, `RenderStatus` |
| `src/antv-studio/registry.ts` | AntV design registry | Combines G2/S2/G6 designs and validates registry shape/counts | `antVStudioDesigns`, `categories`, `getDesignCounts`, `validateRegistry` |
| `src/antv-studio/compatibility.ts` | Provider compatibility validator | Validates registered design capability metadata against scene content before provider renderer execution | `ProviderCompatibilityResult`, `validateStudioDesignCompatibility`, `formatCompatibilityError` |
| `src/antv-studio/definitions/g2-designs.ts` | G2 design definitions | Defines G2 chart designs and `createOptions` factories | `g2Designs` |
| `src/antv-studio/definitions/g6-designs.ts` | G6 design definitions | Defines graph data conversion, G6 graph designs, layouts, and `createGraphConfig` factories | `g6Designs` |
| `src/antv-studio/definitions/s2-designs.ts` | S2 design definitions | Defines S2 table/scorecard designs and `createSheetConfig` factories | `s2Designs`, `s2ThemeNote` |
| `src/antv-studio/renderers/G2StudioRenderer.tsx` | G2 provider renderer | Manages AntV G2 `Chart` lifecycle, rendering, readiness, errors, cleanup | `G2StudioRenderer` |
| `src/antv-studio/renderers/G6StudioRenderer.tsx` | G6 provider renderer | Manages AntV G6 `Graph` lifecycle, data updates, rendering, readiness, errors, cleanup | `G6StudioRenderer` |
| `src/antv-studio/renderers/S2StudioRenderer.tsx` | S2 provider renderer | Manages AntV S2 `TableSheet` lifecycle, config updates, rendering, readiness, errors, cleanup | `S2StudioRenderer` |
| `src/antv-studio/studio-formats.ts` | Format and layout helper | Defines portrait/square/vertical formats and computes infographic title/content layout | `StudioFormatId`, `StudioFormat`, `STUDIO_FORMATS`, `STUDIO_FORMAT_ORDER`, `StudioLayout`, `getStudioLayout` |
| `src/Composition.tsx` | Remotion composition registration | Registers Animation Review, AntV proof, and Advanced Studio compositions | `MyComposition` |
| `src/Root.tsx` | Remotion root component | Returns `MyComposition` | `RemotionRoot` |
| `src/index.ts` | Remotion entry point | Calls `registerRoot(RemotionRoot)` | none beyond registration |
| `vite.studio.config.ts` | Studio Vite config and dev middleware | Serves studio routes, template preview assets, save/render APIs, Advanced render endpoint | default Vite config |
| `package.json` | Scripts and dependencies | Defines render and verification scripts, package dependencies | script entries |

## 12. Architecture Diagram

Project to renderer:

```text
AdvancedStudioProject
  |
  v
AdvancedStudioScene[]
  |
  v
getAdvancedStudioTimedScenes(project)
  |
  v
AdvancedStudioIntegrationProof
  |
  +-- sceneOpacity(scene, frame)
  |
  +-- cameraPathStyle(scene.cameraPath, progress)
  |
  +-- scene.type === "board"
  |     |
  |     v
  |   BoardSceneRenderer
  |     |
  |     +-- getBoardSemanticMotion(...)
  |     |
  |     v
  |   Board
  |     |
  |     v
  |   AntVBlock -> @antv/infographic -> static SVG
  |
  +-- scene.type === "g2"
  |     |
  |     v
  |   requireDesign(designId, "g2")
  |     |
  |     v
  |   InfographicSceneRenderer -> G2StudioRenderer -> @antv/g2 Chart
  |
  +-- scene.type === "g6"
  |     |
  |     v
  |   requireDesign(designId, "g6")
  |     |
  |     v
  |   InfographicSceneRenderer -> G6StudioRenderer -> @antv/g6 Graph
  |
  +-- scene.type === "s2"
        |
        v
      requireDesign(designId, "s2")
        |
        v
      InfographicSceneRenderer -> S2StudioRenderer -> @antv/s2 TableSheet
```

Preview/export:

```text
AdvancedStudioApp
  |
  +-- Remotion Player
  |     |
  |     v
  |   AdvancedStudioIntegrationProof
  |
  +-- Render button
        |
        v
      POST /api/render-advanced
        |
        v
      public/advanced-project.json
        |
        v
      remotion render src/index.ts AdvancedStudioIntegrationProof{Format}
        |
        v
      output/advanced-studio-{formatId}.mp4
```

Template to render:

```text
Template authoring control
  |
  v
Scene template selection
  |
  v
Existing scene fields
  |
  +-- Board project/content fields
  +-- Infographic design/content fields
  +-- cameraPath
  +-- transitionIn/transitionOut
  |
  v
AdvancedStudioProject state
  |
  v
AdvancedStudioIntegrationProof preview/render path
```

## 13. Glossary

Advanced Studio:

The browser authoring surface at `/advanced-studio.html`, implemented by `studio/src/AdvancedStudioApp.tsx`, and the associated Advanced Remotion composition in `src/advanced-studio/AdvancedStudioIntegrationProof.tsx`.

Animation Review:

The earlier/shared Board-focused studio surface implemented by `studio/src/App.tsx` and shared Board systems. Advanced Studio reuses Board rendering and semantic motion from this system.

Animation Preset:

An overloaded implementation term. In `shared/project.ts`, it means Board semantic motion such as `focus`, `reveal`, `count`, `spotlight`, and `overview`. In `src/antv-studio/types.ts`, it means AntV design wrapper animation such as `grow-up`, `grow-right`, `radial-reveal`, `fade-scale`, `top-down-tree`, `path-style-reveal`, and `row-reveal`.

Behavior Template:

A template-oriented authoring control that applies a bundled scene behavior or composition choice by writing existing scene-owned fields. Current implementation-specific details live in `docs/advanced-studio-template-system.md`.

Board:

The shared 1000 by 640 canvas renderer in `shared/Board.tsx`. It displays a `StudioProject` title, subtitle, and ordered `StudioBlock` objects.

Board Project:

The `StudioProject` data structure used by Board scenes. It contains title, subtitle, blocks, and Animation Review scenes. Advanced board scenes use it primarily for block composition.

Camera Path:

An Advanced Studio cinematography preset stored on `AdvancedStudioScene.cameraPath`. Preset definitions and transform calculation live in `src/advanced-studio/camera-paths.ts`.

Composition:

In Remotion, a registered renderable video component. Advanced Studio registers portrait, square, and vertical compositions in `src/Composition.tsx`.

Content:

The factual or narrative data shown by a scene. Board content includes block titles/types and Board project data. Infographic content includes `StudioContent.title`, optional subtitle, rows, nodes, and edges.

Design:

An AntV Studio registered design from `antVStudioDesigns`. It has an engine, ID, metadata, default content, animation metadata, and a provider factory.

Design ID:

The string stored in `AdvancedStudioInfographicContent.designId`. It selects the G2/G6/S2 design used for an infographic scene.

Design Preset:

The Board object visual role stored on `StudioBlock.designPreset`, such as `hero`, `data`, `process`, `technical`, `balanced`, `editorial`, or `summary`.

Export:

The final video render path. In Advanced Studio, the working path is the Render button that posts to `/api/render-advanced` and invokes Remotion CLI.

G2:

AntV's chart provider used for chart-based Advanced infographic scenes. Local design definitions live in `src/antv-studio/definitions/g2-designs.ts`.

G6:

AntV's graph provider used for graph-based Advanced infographic scenes. Local design definitions live in `src/antv-studio/definitions/g6-designs.ts`. Current G6 scene content supports generic graph data through `nodes`/`edges` and hierarchy/tree data through `StudioContent.providerData.kind === "g6-hierarchy"`.

Object:

Product term for a selectable visual item on the Board. Current implementation term is `StudioBlock`.

Provider:

An owning rendering system or repository subsystem. Current providers include AntV G2, G6, S2, AntV Infographic, Remotion, shared Board motion, camera paths, scene contracts, and design registries.

Provider Animation:

Infographic reveal behavior selected by `AntVStudioDesign.animation` and currently applied by `InfographicSceneRenderer.designAnimationStyle`. This is distinct from Board semantic motion.

Preview:

Browser playback using Remotion Player in `studio/src/AdvancedStudioApp.tsx`. It renders `AdvancedStudioIntegrationProof` with the current project state.

Project:

For Advanced Studio, `AdvancedStudioProject`: title plus ordered `AdvancedStudioScene[]`. For Board, `StudioProject`: title, subtitle, blocks, and Animation Review scenes.

Renderer:

A React component or provider wrapper that turns scene data into visible output. Advanced renderers include `BoardSceneRenderer`, `InfographicSceneRenderer`, `G2StudioRenderer`, `G6StudioRenderer`, and `S2StudioRenderer`.

Scene:

A saved authored unit of time. In Advanced Studio, `AdvancedStudioScene` stores scene type, title, duration, content, optional transitions, and optional camera path.

Scene Template:

A complete reusable scene composition concept. In this architecture, a scene template must still hand off to Board, provider design, camera, transition, semantic motion, preview, and export owners rather than rendering directly.

Semantic Motion:

Board-specific meaning-driven motion that emphasizes a scene target. Implemented by `getBoardSemanticMotion`; stored in Advanced Board scenes as `content.animation`.

Studio Block:

Implementation term for a Board object. Defined in `shared/project.ts`.

Timeline:

The ordered frame sequence derived from `AdvancedStudioProject.scenes`. Timing is frame-native through `durationFrames`; start/end frames are derived by `getAdvancedStudioTimedScenes`.

Transition:

An Advanced scene crossfade described by `transitionIn` or `transitionOut`. The current transition schema supports only `preset: "crossfade"` and `durationFrames`; render opacity is calculated by `sceneOpacity`.
