# Advanced Studio Provider Integration

This document audits the current AntV G2, G6, and S2 integration and defines the provider-native expansion path for Advanced Studio.

Scope:

- Advanced Studio is the internal template-authoring system.
- The Board is the scene-composition engine.
- G2, G6, and S2 are specialized renderers available to Board-oriented scene composition.
- Framepoint users should not see provider terminology or raw provider options.
- Provider designs are not interchangeable skins. Different provider capabilities require different native data contracts.

## Phase 1 Audit

### Current-State Architecture Map

```text
AdvancedStudioProject
  -> AdvancedStudioScene
  -> scene.type: board | g2 | g6 | s2
  -> scene.content
     -> BoardSceneContent
     -> AdvancedStudioInfographicContent
  -> designId lookup for infographic scenes
  -> AntVStudioDesign
  -> InfographicSceneRenderer
  -> G2StudioRenderer | G6StudioRenderer | S2StudioRenderer
  -> AntV provider instance
  -> Remotion Player preview or Remotion CLI render
```

Current owners:

| Area | Owner | File |
| --- | --- | --- |
| Advanced scene schema | Advanced Studio scene contract | `src/advanced-studio/scene-contract.ts` |
| Default Advanced project | Advanced Studio integration proof | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` |
| Advanced UI mutation paths | Advanced Studio UI | `studio/src/AdvancedStudioApp.tsx` |
| Infographic wrapper layout and animation | Advanced infographic renderer | `src/advanced-studio/InfographicSceneRenderer.tsx` |
| G2 provider definitions | AntV Studio G2 registry | `src/antv-studio/definitions/g2-designs.ts` |
| G6 provider definitions | AntV Studio G6 registry | `src/antv-studio/definitions/g6-designs.ts` |
| S2 provider definitions | AntV Studio S2 registry | `src/antv-studio/definitions/s2-designs.ts` |
| Provider registry | AntV Studio registry | `src/antv-studio/registry.ts` |
| Provider render lifecycle | AntV renderer wrappers | `src/antv-studio/renderers/*StudioRenderer.tsx` |
| Board scene composition | Shared Board project/block model | `shared/project.ts`, `shared/Board.tsx` |
| Board semantic motion | Shared Board motion resolver | `shared/board-motion.ts` |
| Camera | Advanced camera path registry | `src/advanced-studio/camera-paths.ts` |
| Transitions | Advanced Remotion composition | `src/advanced-studio/AdvancedStudioIntegrationProof.tsx` |
| Preview/export | Remotion Player and Vite render endpoint | `studio/src/AdvancedStudioApp.tsx`, `vite.studio.config.ts`, `src/Composition.tsx` |

### Current Integration Surface

#### G2

Current scene data contract:

- `AdvancedStudioInfographicContent.designId`
- optional `content: StudioContent`
- optional `controls: StudioControls`
- `StudioContent.rows` is the current data path.
- `StudioContent.nodes` and `StudioContent.edges` exist on the shared content type but are not the primary G2 contract.

Current adapter:

- `InfographicSceneRenderer` clones scene content or design default content, computes layout using `getStudioLayout`, applies wrapper animation through `designAnimationStyle`, and dispatches to `G2StudioRenderer`.
- `G2StudioRenderer` creates `new Chart({container, width, height, autoFit: false})`, calls `design.createOptions({content, controls, width, height})`, applies `chart.options(options)`, renders, verifies canvas/SVG output, and destroys on cleanup.

Registered designs:

- 26 G2 designs registered through `g2Designs`.
- Current categories include Ranking, Comparison, Breakdown, Trend, KPI, Funnel, and Relationship.
- Current marks/forms include interval bars/columns, stacked intervals, normalized intervals, line, smooth line, area, stacked area, theta interval donut/pie/gauge, polar interval rose, polar line radar, and point/scatter.

Provider APIs currently used:

- `Chart` constructor.
- `chart.options`.
- `chart.render`.
- `chart.destroy`.
- G2 spec fields used by design factories: `type`, `data`, `encode`, `coordinate`, `transform`, `shape`, `style`, `labels`, `axis`, `legend`, `scale`, `padding`, `theme`, `viewStyle`, `animate: false`.

Provider capabilities currently unused or only minimally used:

- layered marks
- multiple views
- facets
- annotations
- reference lines
- reference regions
- explicit thresholds
- callouts beyond basic labels
- custom shapes beyond built-in shape names
- advanced scale domains and encodings
- provider-native animation
- interaction state as authored animation
- explicit composition grammar beyond one primary mark per design factory

Animation ownership:

- G2 provider-native animation is disabled by `animate: false`.
- Visible Advanced animation is wrapper-owned through `AntVStudioDesign.animation` and `InfographicSceneRenderer.designAnimationStyle`.

Layout ownership:

- Shell layout is `getStudioLayout`.
- Chart composition/layout is design-owned through `createOptions`.

Styling ownership:

- Shared studio theme owns palette and base styles.
- Each G2 design factory owns mark-specific style choices.

Interaction capabilities relevant to authored video:

- Hover, select, active/inactive states, brushing, tooltips, legends, and guide interactions could become authored emphasis states, but current runtime video disables interaction and does not translate interaction state into scene behavior.

Current compatibility assumptions:

- Rows exist.
- Row `label` and numeric `value` exist.
- Some designs read `group`, `secondaryValue`, or `target`, but most tolerate missing optional fields because factories or provider behavior fall back implicitly.

Current fallback/error behavior:

- Factory/render errors are caught in `G2StudioRenderer` and shown as provider error text.
- There is no pre-render compatibility check in the current implementation.

#### G6

Current scene data contract:

- `AdvancedStudioInfographicContent.designId`
- optional `content: StudioContent`
- optional `controls: StudioControls`
- `StudioContent.nodes` and `StudioContent.edges` are the generic graph data path.
- `StudioContent.providerData.kind === "g6-hierarchy"` is the provider-native hierarchy/tree data path.

Current adapter:

- `InfographicSceneRenderer` dispatches to `G6StudioRenderer`.
- `G6StudioRenderer` creates `new Graph({...config, container})`, then on updates calls `design.createGraphConfig`, `graph.setData(config.data ?? {})`, and `graph.render`.
- `g6-designs.ts` converts generic `StudioNode[]` and `StudioEdge[]` into G6 `GraphData` through `dataFrom`.
- `g6-designs.ts` converts `G6HierarchyData` into G6 `GraphData` through hierarchy adaptation that emits node `children` ID arrays and generated parent-child edges.

Registered designs:

- 17 G6 designs registered through `g6Designs`.
- Current layout families include radial, circular, force, dagre left-right, dagre top-bottom, snake, fishbone, and compact-box.

Provider APIs currently used:

- `Graph` constructor.
- `graph.setData`.
- `graph.render`.
- `graph.destroy`.
- G6 config fields: `data`, `layout`, `node`, `edge`, `behaviors: []`, `plugins: []`, `animation: false`.

Provider capabilities currently unused or only minimally used:

- tree-family layouts beyond the currently registered fishbone and compact-box designs
- combo/group nodes
- compound graphs
- custom nodes
- custom edges
- ports
- edge routing beyond default line edges
- graph transforms
- node/edge states
- clustering/community data beyond using `group` as style data
- layout-specific validation
- provider-native animation
- behaviors converted into authored camera or semantic animation

Animation ownership:

- G6 provider animation is disabled by `animation: false`.
- Visible Advanced animation is wrapper-owned through `AntVStudioDesign.animation` and `InfographicSceneRenderer.designAnimationStyle`.

Layout ownership:

- G6 design definitions own layout selection.
- Current scene data does not declare layout.

Styling ownership:

- `dataFrom` owns generic node and edge style mapping.
- Design definitions own layout choice but not per-design node shape/styling beyond the shared generic adapter.

Interaction capabilities relevant to authored video:

- Drag, zoom, focus, collapse/expand, hover, selection, path highlight, neighborhood highlight, combo expansion, and layout transitions could become authored semantic/camera beats, but current video render disables behaviors and does not use interaction state.

Current compatibility assumptions:

- Generic graph designs use `nodes` and `edges`.
- Hierarchy/tree designs require explicit `providerData.kind === "g6-hierarchy"`.
- Edge endpoints exist.
- Generic graph data is not silently converted into hierarchy data.

Current fallback/error behavior:

- Provider errors are caught in `G6StudioRenderer` and shown as provider error text.
- Compatibility validation rejects known incompatible design/content pairs before provider render execution.
- Fishbone with generic graph content now returns a precise compatibility error instead of reaching AntV's `Tree structure not found for treeKey: tree` failure.

#### S2

Current scene data contract:

- `AdvancedStudioInfographicContent.designId`
- optional `content: StudioContent`
- optional `controls: StudioControls`
- `StudioContent.rows` is the current data path.

Current adapter:

- `InfographicSceneRenderer` dispatches to `S2StudioRenderer`.
- `S2StudioRenderer` creates `new TableSheet(container, config.dataCfg, config.options)`, then on updates calls `sheet.setDataCfg`, `sheet.setOptions`, and `sheet.render(true)`.
- `s2-designs.ts` maps generic `StudioRow[]` into flat table records through `tableConfig`.

Registered designs:

- 8 S2 designs registered through `s2Designs`.
- Current categories include Comparison Table, Scorecard, Campaign Table, and Leaderboard.

Provider APIs currently used:

- `TableSheet`.
- `setDataCfg`.
- `setOptions`.
- `render(true)`.
- `destroy`.
- S2 config fields used: `dataCfg.data`, `dataCfg.fields.columns`, `dataCfg.meta`, `options.width`, `options.height`, `tooltip: null`, disabled interaction flags, series number disabled, compact style config.

Provider capabilities currently unused or only minimally used:

- pivot tables
- cross tables
- hierarchical dimensions
- totals and subtotals
- frozen rows/columns
- custom cells
- conditional formatting
- annotations
- value formatting beyond raw field values
- richer themes
- advanced layout controls
- interaction states translated into authored animation
- provider-native animation

Animation ownership:

- S2 designs set `animation: "row-reveal"`.
- Visible Advanced animation is wrapper-owned through `InfographicSceneRenderer.designAnimationStyle`.

Layout ownership:

- S2 design definitions own column selection and table config.
- `getStudioLayout` owns outer title/content bounds.

Styling ownership:

- `tableConfig` owns generic table styles.
- Shared studio theme owns colors.

Interaction capabilities relevant to authored video:

- Cell selection, row/column hover, sort/filter affordances, drill, hierarchy expand/collapse, and scroll/freeze states could become authored video emphasis states, but current runtime disables interactions and has no authored state model.

Current compatibility assumptions:

- Rows exist.
- Row `label` and numeric `value` exist.
- Missing `secondaryValue`, `target`, and `group` can be derived by `tableConfig`.

Current fallback/error behavior:

- Provider errors are caught in `S2StudioRenderer` and shown as provider error text after renderer execution.
- There is no pre-render compatibility check in the current implementation.

## Provider Capability-Gap Matrix

| Capability | G2 supported by provider | Current G2 usage | G6 supported by provider | Current G6 usage | S2 supported by provider | Current S2 usage |
| --- | --- | --- | --- | --- | --- | --- |
| Generic tabular rows | Yes | Primary contract | Not primary | Unused | Yes | Primary contract |
| Generic graph nodes/edges | Not primary | Unused | Yes | Primary contract | Not primary | Unused |
| Native hierarchy/tree | Limited through chart transforms, not current path | Unused | Yes | Supported for explicit G6 hierarchy data by fishbone and compact-box designs | Yes through hierarchical dimensions | Unused |
| DAG/layout graph | Not primary | Unused | Yes | Used through dagre layouts over generic data | Not primary | Unused |
| Layered marks | Yes | Unused | Not applicable | Unused | Not applicable | Unused |
| Multi-view/facets | Yes | Unused | Not applicable | Unused | Pivot/cross-sheet equivalent | Unused |
| Coordinate systems | Yes | Theta, polar, transpose used | Layout coordinate systems used by layouts | Used indirectly | Table layout modes | Compact flat table only |
| Transforms | Yes | stackY, normalizeY, dodgeX used | Graph transforms available | Unused | Data transforms possible before sheet config | Simple row mapping only |
| Scales | Yes | Color palette only | Style mapping only | Minimal | Themes/meta formatting | Minimal |
| Axes/legends | Yes | Basic axes/legend toggles | Labels on nodes/edges | Basic labels | Headers/meta | Basic columns |
| Annotations/callouts | Yes | Unused | Labels only | Basic labels | Annotations/custom cells possible | Unused |
| Reference lines/regions/thresholds | Yes | Unused | Not native chart concept | Unused | Conditional formatting possible | Unused |
| Custom shapes/cells/nodes/edges | Yes | Unused | Yes | Unused | Yes | Unused |
| States/interactions as authored animation | Yes | Unused | Yes | Unused | Yes | Unused |
| Provider-native animation | Yes | Disabled | Yes | Disabled | Limited/provider/UI dependent | Not used directly |

## Compatibility Model

A provider design must declare enough metadata to answer:

- Which provider owns it.
- Which data contract it requires.
- Which content fields are required.
- Which content fields are optional.
- Which layouts it uses.
- Whether it requires rows, generic graph, DAG, hierarchy/tree, pivot fields, layered marks, or another structure.
- Which animation modes are supported.
- Which aspect ratios are supported.
- Which content limits exist.
- Whether the current scene can safely use it.
- Why it is incompatible when it cannot.

Compatibility must be checked before provider renderer execution. Renderer crashes are not an acceptable discovery mechanism.

Minimum metadata required in Phase 2:

```ts
type ProviderDataContract =
  | "tabular-rows"
  | "g2-cartesian-series"
  | "g2-polar-series"
  | "g2-point-series"
  | "g6-generic-graph"
  | "g6-dag"
  | "g6-hierarchy-tree"
  | "s2-flat-table"
  | "s2-scorecard-table"
  | "s2-pivot-table";

type ProviderDesignCapability = {
  dataContract: ProviderDataContract;
  requiredFields: {
    rows?: Array<"id" | "label" | "value" | "group" | "secondaryValue" | "target">;
    nodes?: Array<"id" | "label" | "group" | "parentId">;
    edges?: Array<"source" | "target" | "label" | "value">;
    hierarchyNodes?: Array<"id" | "label" | "value" | "category" | "metadata" | "children">;
  };
  optionalFields?: same shape;
  structures: string[];
  layouts: string[];
  animationModes: AnimationPreset[];
  aspectRatios: Array<"portrait" | "square" | "vertical">;
  contentLimits?: {
    minRows?: number;
    maxRows?: number;
    minNodes?: number;
    maxNodes?: number;
    minEdges?: number;
    maxEdges?: number;
    minHierarchyNodes?: number;
    maxHierarchyNodes?: number;
  };
  adapter: "generic-content" | "provider-native-content" | "requires-native-contract";
  notes?: string[];
};
```

Phase 2 compatibility checks:

- Design engine must match scene type.
- Required rows/nodes/edges must exist.
- Required fields must exist and be type-compatible enough for the current adapters.
- G6 edges must reference existing node IDs.
- G6 hierarchy/tree designs require `StudioContent.providerData.kind === "g6-hierarchy"`.
- G6 hierarchy content must include a root node, stable unique IDs, labels, valid child arrays, and no cycles.
- G6 generic graph designs reject hierarchy content unless they explicitly declare hierarchy support.
- Content limits should be enforced where declared.
- The validator should return a structured result, not throw for normal incompatibility.

## Proposed Provider-Native Scene Contracts

The current `StudioContent` shape should remain backward-compatible. Provider-native expansion should separate narrative content, structured provider data, visual design, authored behavior, and renderer implementation.

Small clean contract families to support future maximum capability:

### Shared layers

Narrative content:

```ts
type SceneNarrative = {
  title: string;
  subtitle?: string;
  emphasis?: string[];
};
```

Authored behavior:

```ts
type AuthoredSceneBehavior = {
  cameraPath?: AdvancedStudioScene["cameraPath"];
  transitionIn?: AdvancedStudioScene["transitionIn"];
  transitionOut?: AdvancedStudioScene["transitionOut"];
  semanticMotion?: string;
  providerAnimation?: string;
};
```

Provider design selection:

```ts
type ProviderDesignSelection = {
  designId: string;
};
```

### G2 native contracts

Cartesian series:

```ts
type G2CartesianSeriesData = {
  xField: string;
  yField: string;
  seriesField?: string;
  rows: Array<Record<string, string | number | boolean | null>>;
};
```

Polar series:

```ts
type G2PolarSeriesData = {
  angleField: string;
  radiusField?: string;
  colorField?: string;
  rows: Array<Record<string, string | number | boolean | null>>;
};
```

Layered mark composition:

```ts
type G2LayeredMarkData = {
  layers: Array<{
    mark: "interval" | "line" | "area" | "point" | "text";
    encode: Record<string, string>;
    rows: Array<Record<string, string | number | boolean | null>>;
  }>;
};
```

Multi-view composition:

```ts
type G2MultiViewData = {
  views: Array<{
    id: string;
    title?: string;
    data: G2CartesianSeriesData | G2PolarSeriesData | G2LayeredMarkData;
  }>;
};
```

### G6 native contracts

Generic graph:

```ts
type G6GenericGraphData = {
  nodes: Array<{id: string; label: string; group?: string; value?: number}>;
  edges: Array<{source: string; target: string; label?: string; value?: number}>;
};
```

Hierarchy/tree:

```ts
type StudioJsonValue =
  | string
  | number
  | boolean
  | null
  | StudioJsonValue[]
  | {[key: string]: StudioJsonValue};

type G6HierarchyTreeData = {
  kind: "g6-hierarchy";
  root: {
    id: string;
    label: string;
    children?: G6HierarchyTreeData["root"][];
    value?: number;
    category?: string;
    metadata?: Record<string, StudioJsonValue>;
  };
};
```

DAG:

```ts
type G6DagData = {
  nodes: Array<{id: string; label: string; rank?: number; group?: string}>;
  edges: Array<{source: string; target: string; label?: string}>;
};
```

Clustered/compound graph:

```ts
type G6ClusteredGraphData = {
  nodes: Array<{id: string; label: string; clusterId?: string; parentId?: string}>;
  edges: Array<{source: string; target: string; label?: string}>;
  clusters?: Array<{id: string; label: string}>;
  combos?: Array<{id: string; label: string; parentId?: string}>;
};
```

### S2 native contracts

Flat table:

```ts
type S2FlatTableData = {
  rows: Array<Record<string, string | number | boolean | null>>;
  columns: Array<{field: string; label: string; valueType?: "text" | "number" | "currency" | "percent"}>;
};
```

Pivot table:

```ts
type S2PivotTableData = {
  rows: string[];
  columns: string[];
  values: string[];
  records: Array<Record<string, string | number | boolean | null>>;
};
```

Hierarchical table:

```ts
type S2HierarchicalTableData = {
  hierarchyField: string;
  valueFields: string[];
  rows: Array<Record<string, string | number | boolean | null> & {parentId?: string}>;
};
```

## Board/Provider Relationship

Current evidence:

- Board scenes already render specialized visual blocks through `AntVBlock`, which adapts `StudioBlock` into AntV Infographic SVG.
- Advanced infographic scenes currently exist as standalone scene types: `g2`, `g6`, and `s2`.
- `AdvancedStudioIntegrationProof.renderScene` routes standalone provider scene types to `InfographicSceneRenderer`.
- Board scenes route to `BoardSceneRenderer`, which renders the shared `Board`.

Decision supported by current code:

- Provider scenes should support both paths during migration.
- Standalone provider scene types should remain because they are already part of `AdvancedStudioSceneType`, the default 14-scene project, preview, and render.
- Board provider blocks should become the long-term composition path where justified because product direction says the Board is the scene-composition engine.
- Unification should not happen in Phase 2 because current Board blocks use `@antv/infographic`, not G2/G6/S2 design contracts, and no Board provider-block schema currently exists for G2/G6/S2 native data.

Target conceptual relationship:

```text
Board scene graph
  -> provider block
  -> provider-native scene contract
  -> compatible registered design
  -> G2 / G6 / S2 renderer
  -> Remotion frame rendering
```

Phase 2 should prepare validation and compatibility metadata that both standalone provider scenes and future Board provider blocks can reuse.

## Maximum-Integration Roadmap

### Phase A: Compatibility metadata and validation

Files affected:

- `src/antv-studio/types.ts`
- `src/antv-studio/registry.ts`
- `src/antv-studio/definitions/g2-designs.ts`
- `src/antv-studio/definitions/g6-designs.ts`
- `src/antv-studio/definitions/s2-designs.ts`
- `src/antv-studio/compatibility.ts`
- `src/advanced-studio/AdvancedStudioIntegrationProof.tsx`
- `studio/src/AdvancedStudioApp.tsx`
- `scripts/validate-antv-studio.mjs`

Schema changes:

- Add provider-design capability metadata to `AntVStudioDesign`.
- No `AdvancedStudioScene` schema change.

Migration risk:

- Low if metadata is added to existing designs without changing factories.
- Main risk is over-strict validation rejecting currently working scenes.

Backward compatibility:

- Keep `StudioContent` as the accepted content shape.
- Preserve existing design IDs.
- Mark unsupported native-contract designs as incompatible before render rather than removing them.

Validation/tests:

- Registry validation checks capabilities metadata.
- Compatibility validation checks existing default project and template-applied scenes.
- `npm run verify:studio`.

Capability unlocked:

- Safe selection and render-time rejection before provider crashes.

### Phase B: Provider-native data contracts and adapters

Files affected:

- `src/advanced-studio/scene-contract.ts`
- `src/antv-studio/types.ts`
- new or extended provider adapter files
- G2/G6/S2 design definitions
- Advanced UI content editor paths

Schema changes:

- Add typed provider-native content payloads while preserving legacy `StudioContent`.

Migration risk:

- Medium. Requires adapters and content editors to choose the right contract.

Backward compatibility:

- Existing scenes keep `StudioContent`.
- New provider-native fields are optional and versioned.

Validation/tests:

- Unit-level compatibility checks for every contract family.
- Render smoke tests for legacy and native content.

Capability unlocked:

- Provider-native structures without raw AntV options in scene data.

### Phase C: Expanded G2 design families

Files affected:

- G2 definitions and G2 adapters.
- Provider-native G2 contract types.
- Design registry validation.

Schema changes:

- Use G2 cartesian, polar, layered, and multi-view data contracts.

Migration risk:

- Medium. G2 specs can be safe if generated by design factories.

Backward compatibility:

- Existing row-based G2 designs remain.

Validation/tests:

- Factory validation by design family.
- Compatibility tests for field requirements.

Capability unlocked:

- layered marks, multi-view charts, annotations, callouts, thresholds, reference regions, and richer authored chart animation states.

### Phase D: Expanded G6 design families

Files affected:

- G6 definitions and G6 adapters.
- Provider-native G6 contract types.
- Compatibility validator.

Schema changes:

- Add hierarchy/tree, DAG, clustered/compound graph contracts.

Migration risk:

- Medium to high. Layout-specific data requirements are stricter than current generic graph data.

Backward compatibility:

- Existing generic graph designs continue using nodes/edges.

Validation/tests:

- Tree, DAG, and generic graph validators.
- Explicit fishbone/hierarchy compatibility tests.

Capability unlocked:

- safe tree/fishbone/hierarchy layouts, clusters, combo/group nodes, custom nodes/edges, edge routing, and authored graph states.

### Phase E: Expanded S2 design families

Files affected:

- S2 definitions and S2 adapters.
- Provider-native S2 contract types.
- Advanced content editor.

Schema changes:

- Add flat, pivot, and hierarchical table contracts.

Migration risk:

- Medium. Pivot/hierarchy authoring must avoid exposing provider terminology to Framepoint users.

Backward compatibility:

- Existing row-based scorecards remain.

Validation/tests:

- Column/value field validation.
- Render smoke tests for flat and pivot examples.

Capability unlocked:

- pivot tables, cross tables, hierarchy, totals/subtotals, conditional formatting, frozen rows/columns, custom cells, and formatted values.

### Phase F: Board/provider unification where justified

Files affected:

- `shared/project.ts`
- Board block schema and renderer adapters
- Advanced scene contract if Board provider blocks become persistent scene content
- Advanced UI authoring surfaces

Schema changes:

- Add Board provider-block definitions only after ownership and migration are explicit.

Migration risk:

- High. Board currently renders `@antv/infographic` blocks, not G2/G6/S2 native scenes.

Backward compatibility:

- Standalone provider scenes remain during migration.
- Existing Board blocks remain unchanged.

Validation/tests:

- Board render parity tests.
- Provider block compatibility tests.
- Advanced preview/export parity.

Capability unlocked:

- Provider scenes participate in Board composition as first-class objects.

### Phase G: Product-concept authoring UI

Files affected:

- `studio/src/AdvancedStudioApp.tsx`
- provider content editors
- template authoring UI

Schema changes:

- Depends on Phase B/F contracts.

Migration risk:

- Medium. UI must hide provider terminology while preserving capability selection.

Backward compatibility:

- Existing design browser remains internal/admin-only until replaced.

Validation/tests:

- Interaction tests for safe design selection and content editing.

Capability unlocked:

- Authors select business/narrative concepts rather than raw G2/G6/S2 options.

## Phase 2 Foundation Plan

Implement only Phase A.

Planned implementation:

1. Add provider-design capability metadata types to `src/antv-studio/types.ts`.
2. Attach capabilities to all existing G2/G6/S2 designs without changing their rendering factories.
3. Add `src/antv-studio/compatibility.ts` with structured validation results.
4. Update registry validation to require capability metadata and to run compatibility checks for currently supported adapter paths.
5. Add pre-render validation in the Advanced infographic render path.
6. Add renderer-level validation in provider renderer wrappers so direct AntV Studio renderer use also avoids provider execution for incompatible designs.
7. Add Advanced UI design-application guards so design browser/template application does not silently create incompatible scene/design/content combinations.
8. Preserve every existing valid design ID, project scene, scene duration, camera path, transition, Board motion, and Remotion timeline.
9. Update durable architecture docs only for the new compatibility ownership boundary.
10. Update template docs only for the changed compatibility behavior.

Rollback plan:

- Remove the compatibility metadata field from design construction.
- Remove compatibility validation imports/calls from renderers and Advanced UI.
- Remove `src/antv-studio/compatibility.ts`.
- Revert doc updates.
- Because no scene schema migration is planned for Phase A, rollback does not require project data migration.

Phase 2 risks:

- Over-strict validation could reject a currently working design. Mitigation: Phase 2 requires only minimal fields for current generic adapters.
- Under-strict validation could miss provider-native incompatibility. Mitigation: mark known unsupported native-contract designs as requiring native adapters.
- Duplicate validation in Advanced wrapper and provider renderers could drift. Mitigation: use one shared compatibility helper.

Expected new capability unlocked:

- The architecture can safely represent provider design requirements and reject incompatible design/content combinations before provider renderer execution.
- Future provider-native structures have a clear metadata and validation location.

Capabilities still blocked after Phase 2 foundation:

- New G2 layered/multi-view contracts.
- G6 combo/compound graph adapters.
- S2 pivot/hierarchy adapters.
- Board provider-block unification.
- Product-concept authoring UI over provider-native contracts.

## Phase 2 Foundation Implemented

Implemented foundation:

- `AntVStudioDesign` now carries `capabilities` metadata.
- Existing G2/G6/S2 registered designs now receive capability metadata without changing their render factories.
- `validateStudioDesignCompatibility` provides one structured compatibility check for UI, registry validation, preview, render, and provider renderer wrappers.
- Advanced preview/render validates infographic scene content before mounting a provider renderer.
- G2/G6/S2 renderer wrappers validate compatibility before provider execution.
- Advanced UI design application validates compatibility before mutating scene state.
- Registry validation requires capability metadata and includes the G6 fishbone mismatch as a sentinel rejection.

Not implemented in Phase 2:

- No provider-native scene schema was added to `AdvancedStudioScene`.
- No new G2/G6/S2 designs were added.
- No G6 tree/fishbone adapter was added.

## Phase B G6 Hierarchy Foundation Implemented

Implemented G6 hierarchy foundation:

- `StudioContent.providerData` can now carry explicit provider-native G6 hierarchy content through `G6HierarchyData`.
- `G6HierarchyData.kind` is `"g6-hierarchy"` and its `root` is made of serializable `G6HierarchyNode` objects.
- `G6HierarchyNode` stores stable `id`, `label`, optional `children`, optional `value`, optional `category`, and optional serializable `metadata`.
- Generic graph content remains `StudioContent.nodes` and `StudioContent.edges`.
- Generic graph content and hierarchy content are explicitly distinguishable. The generic adapter does not silently convert nodes/edges into hierarchy data.
- `validateStudioDesignCompatibility` validates hierarchy root presence, valid child arrays, required labels, unique IDs, cycle-free hierarchy shape, hierarchy content limits, and design/content contract compatibility before provider render execution.
- `g6-designs.ts` adapts `G6HierarchyData` into AntV G6 `GraphData` with node `children` ID arrays and generated parent-child edges.
- `g6-fishbone` now uses real hierarchy default content and `provider-native-content` adapter metadata.
- `g6-compact-box-tree` proves the same hierarchy contract can support a second installed G6 tree-family layout.

Current G6 hierarchy compatibility rules:

- A design with `dataContract: "g6-hierarchy-tree"` requires `StudioContent.providerData.kind === "g6-hierarchy"`.
- A hierarchy node must include a non-empty `id` and `label`.
- Hierarchy IDs must be unique.
- `children`, when present, must be an array.
- Cycles are rejected before the provider renderer is asked to render.
- Generic graph-only G6 designs reject hierarchy content unless they explicitly declare hierarchy support.
- Existing generic graph scenes remain valid through the existing `nodes`/`edges` adapter path.

Layouts now unlocked by the current hierarchy contract:

- fishbone through `g6-fishbone`
- compact-box through `g6-compact-box-tree`

Capabilities still blocked after G6 Phase B:

- G6 combo/group nodes.
- G6 compound graphs.
- G6 clustered graph-native contracts.
- G6 custom node and custom edge families.
- G6 ports and explicit edge routing contracts.
- G6 provider-native animation and interaction-state-to-authored-animation translation.
- G2 layered/multi-view contracts.
- S2 pivot/hierarchy adapters.
- Board provider-block unification.

Unchanged after G6 Phase B:

- No S2 pivot/hierarchy adapter was added.
- No Board provider-block unification was added.
- No raw AntV configuration was exposed in UI.
