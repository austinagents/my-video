# Advanced Studio Baseline

Advanced Studio currently has two canonical authored project baselines:

- Template 1: `advancedStudioDefaultProject` in
  `src/advanced-studio/AdvancedStudioIntegrationProof.tsx`
- Template 2: `advancedStudioTemplate2Project` in
  `src/advanced-studio/template-2-project.ts`

Both projects use the same baseline path:

- a complete `AdvancedStudioProject`
- `AdvancedStudioIntegrationProof`
- Board scenes through `BoardSceneRenderer`
- G2/G6/S2 scenes through `InfographicSceneRenderer` and provider renderers
- camera via `scene.cameraPath`
- transitions via `transitionIn` and `transitionOut`
- preview through Remotion Player
- render through `/api/render-advanced`

The Advanced Studio UI may load either complete authored project. This selection
does not add a template registry or alter scene behavior.

Template 1's creation process is documented in
`docs/advanced-studio-template-1-process.md`. Template 2's initial authored
process is documented in `docs/advanced-studio-template-2-process.md`.

No additional Advanced Studio template system is approved.

Future reusable-generation work must follow the provider-first and ownership
paths documented in:

- `docs/provider-first-implementation-standard.md`
- `docs/framepoint-system-ownership-map.md`
- `docs/advanced-studio-architecture.md`
- `docs/advanced-studio-provider-integration.md`

Future work must preserve the baseline semantic content unless an approved
implementation gate explicitly authorizes semantic generation changes.
