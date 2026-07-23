# Advanced Studio Baseline

Advanced Studio currently has one approved baseline: the original
`advancedStudioDefaultProject` in
`src/advanced-studio/AdvancedStudioIntegrationProof.tsx`.

The baseline path is:

- `advancedStudioDefaultProject`
- `AdvancedStudioIntegrationProof`
- Board scenes through `BoardSceneRenderer`
- G2/G6/S2 scenes through `InfographicSceneRenderer` and provider renderers
- camera via `scene.cameraPath`
- transitions via `transitionIn` and `transitionOut`
- preview through Remotion Player
- render through `/api/render-advanced`

No additional Advanced Studio template system is currently approved.

Future reusable-generation work must follow the provider-first and ownership
paths documented in:

- `docs/provider-first-implementation-standard.md`
- `docs/framepoint-system-ownership-map.md`
- `docs/advanced-studio-architecture.md`
- `docs/advanced-studio-provider-integration.md`

Future work must preserve the baseline semantic content unless an approved
implementation gate explicitly authorizes semantic generation changes.
