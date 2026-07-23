# Advanced Studio Template 1 Creation Process

This document reconstructs how the approved Advanced Studio Template 1 baseline
was created. It uses only repository evidence: current code, git history, commit
diffs, markdown documentation, scripts, and render paths.

Status labels:

- Confirmed: directly present in repository code, docs, or git history.
- Inference: supported by repository evidence, but not explicitly documented as
  an author instruction or decision rationale.
- Unproven: not recoverable from repository evidence.

## Summary

Confirmed: Template 1 is the original authored `advancedStudioDefaultProject`
defined in `src/advanced-studio/AdvancedStudioIntegrationProof.tsx`.

Confirmed: Commit `a7be383269ef6bf964351e0147aacf8c8d6a704c`,
`Create first cinematic style recreation in Advanced Studio`, changed
`src/advanced-studio/AdvancedStudioIntegrationProof.tsx` from a 3-scene
Board/G2/Board integration proof into the 14-scene cinematic baseline.

Confirmed: The supporting Advanced Studio shell was introduced earlier in commit
`64ae98a758a549b666a81ad38d43a0910a2bb11f`:
`Build unified Advanced Studio editor shell`. That commit added the scene
contract, Board renderer adapter, infographic renderer adapter, Advanced Studio
HTML route, app shell, Vite route, and Remotion composition registrations.

Unproven: The repository does not contain the external human brief, prompt, or
source asset that led to the specific "document flow" narrative. The recoverable
source content is the authored data that appears in the `a7be383` diff and the
current `advancedStudioDefaultProject`.

## Evidence Files

Confirmed current code evidence:

- `src/advanced-studio/AdvancedStudioIntegrationProof.tsx`
- `src/advanced-studio/scene-contract.ts`
- `src/advanced-studio/BoardSceneRenderer.tsx`
- `src/advanced-studio/InfographicSceneRenderer.tsx`
- `src/advanced-studio/camera-paths.ts`
- `src/Composition.tsx`
- `studio/src/AdvancedStudioApp.tsx`
- `vite.studio.config.ts`
- `scripts/validate-antv-studio.mjs`
- `package.json`

Confirmed markdown evidence:

- `docs/advanced-studio-architecture.md`
- `docs/advanced-studio-provider-integration.md`
- `docs/framepoint-system-ownership-map.md`
- `docs/provider-first-implementation-standard.md`
- `docs/advanced-studio-template-system.md`

Confirmed history evidence:

- `64ae98a758a549b666a81ad38d43a0910a2bb11f`
- `45c6917`
- `80c1a26`
- `df405b0`
- `a7be383269ef6bf964351e0147aacf8c8d6a704c`
- `97d0385`
- `dacaa47`
- `ae706d0`

## 1. Content Analysis

Confirmed: Template 1's recoverable source content is a code-authored Board
project named `DOCUMENT FLOW` with subtitle `A concise visual argument, built
one proof point at a time`. The current definition is in
`src/advanced-studio/AdvancedStudioIntegrationProof.tsx`, lines 78-154.

Confirmed: The Board content model contains seven blocks:

- `hook`: `OPEN WITH ONE CLAIM`
- `structure`: `STRUCTURE THE IDEA`
- `proof`: `SHOW THE PROOF`
- `path`: `MOVE THROUGH THE PATH`
- `friction`: `REMOVE FRICTION`
- `decision`: `MAKE THE DECISION SIMPLE`
- `close`: `END WITH ACTION`

Confirmed: The authored infographic content is embedded per scene through
`createReferenceInfographicContent` in
`src/advanced-studio/AdvancedStudioIntegrationProof.tsx`, lines 69-76, and the
scene array in lines 161-461.

Unproven: No repository markdown or commit message contains a fuller external
brief. The phrase "document flow" and the authored scene copy are the only
durable source content recovered from the repository.

## 2. Scene Planning

Confirmed: Commit `64ae98a` created the initial Advanced Studio proof as three
scenes:

- Board hook
- G2 revenue ranking infographic
- Board call to action

Confirmed: Commit `a7be383` replaced that with the current 14-scene cinematic
style sequence. The commit diff shows the old scene IDs `board-hook`,
`infographic-revenue-ranking`, and `board-cta` being replaced by the
`style-01-*` through `style-14-*` sequence.

Confirmed current 14-scene plan:

| # | Scene ID | Type | Title | Duration | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | `style-01-cold-open` | Board | `Cold Open Claim` | 90 | `AdvancedStudioIntegrationProof.tsx` lines 162-176 |
| 2 | `style-02-editor-setup` | Board | `Explain the Structure` | 90 | lines 177-192 |
| 3 | `style-03-cause-map` | G6 | `Why the Message Fails` | 90 | lines 193-226 |
| 4 | `style-04-source-breakdown` | G2 | `Attention Split` | 75 | lines 227-246 |
| 5 | `style-05-proof-spotlight` | Board | `Proof Spotlight` | 75 | lines 247-262 |
| 6 | `style-06-scorecard-cutaway` | S2 | `Evidence Scorecard` | 105 | lines 263-282 |
| 7 | `style-07-path-reveal` | Board | `Move Through the Path` | 90 | lines 283-298 |
| 8 | `style-08-funnel` | G2 | `Compression Funnel` | 90 | lines 299-318 |
| 9 | `style-09-resource-flow` | G6 | `Visual Flow` | 90 | lines 319-352 |
| 10 | `style-10-trend-rise` | G2 | `Momentum Build` | 105 | lines 353-374 |
| 11 | `style-11-decision-focus` | Board | `Decision Focus` | 75 | lines 375-390 |
| 12 | `style-12-kpi-punch` | G2 | `Performance Punch` | 90 | lines 391-411 |
| 13 | `style-13-decision-tree` | G6 | `Choose the Next Step` | 90 | lines 412-445 |
| 14 | `style-14-final-overview` | Board | `Final Overview` | 105 | lines 446-460 |

Inference: The narrative arc is:

1. Open with a single claim.
2. Explain the structure.
3. Diagnose why messages fail.
4. Quantify the Attention Split.
5. Spotlight proof.
6. Show a compact evidence scorecard.
7. Reveal the path.
8. Compress a document into claim/proof/action.
9. Show visual flow.
10. Build momentum.
11. Focus decision.
12. Punch the KPI.
13. Choose the next step.
14. Return to final overview.

This arc is inferred from scene IDs, scene titles, Board block titles, subtitles,
rows, nodes, and edges. It is not written as a planning rationale in existing
markdown.

## 3. Provider And Design Selection

Confirmed: Current architecture says scene type determines renderer:
`board` scenes route to `BoardSceneRenderer`; `g2`, `g6`, and `s2` scenes route
through `InfographicSceneRenderer` and then provider-specific renderers. See
`docs/advanced-studio-architecture.md`, lines 36-41.

Confirmed: Template 1 selects registered AntV designs by ID in
`src/advanced-studio/AdvancedStudioIntegrationProof.tsx`, lines 52-59:

- G2 `g2-donut-breakdown`
- G2 `g2-conversion-funnel`
- G2 `g2-smooth-trend`
- G2 `g2-kpi-sparkline`
- G6 `g6-why-it-happens`
- G6 `g6-resource-flow`
- G6 `g6-decision-tree`
- S2 `s2-monthly-scorecard`

Confirmed: The selected G2 designs exist in
`src/antv-studio/definitions/g2-designs.ts`:

- `g2-smooth-trend`, lines 339-348
- `g2-donut-breakdown`, lines 372-382
- `g2-conversion-funnel`, lines 428-437
- `g2-kpi-sparkline`, lines 472-480

Confirmed: The selected G6 designs exist in
`src/antv-studio/definitions/g6-designs.ts`:

- `g6-why-it-happens`, lines 265-277
- `g6-decision-tree`, lines 367-379
- `g6-resource-flow`, lines 471-483

Confirmed: The selected S2 design exists in
`src/antv-studio/definitions/s2-designs.ts`, lines 130-145.

Inference: Board scenes were selected where the narrative needed canvas-level
composition over the same `DOCUMENT FLOW` block map. G2 scenes were selected for
row-based quantitative charts. G6 scenes were selected for node/edge
relationships. S2 was selected for a compact scorecard table. This is supported
by scene content shapes and provider contracts, but the repository does not
contain an explicit author rationale for each choice.

## 4. Scene Composition Assembly

Confirmed: Board composition is assembled as a `StudioProject` named
`styleReferenceBoardProject` in `AdvancedStudioIntegrationProof.tsx`, lines
78-154. Each Board scene references that project and sets `activeBlockId` plus
`animation` in lines 167-171, 182-186, 252-256, 288-292, 380-384, and 451-455.

Confirmed: Board rendering is handled by `BoardSceneRenderer`, which resolves
`project`, calls `getBoardSemanticMotion`, and renders `Board`; see
`src/advanced-studio/BoardSceneRenderer.tsx`, lines 28-63.

Confirmed: Infographic scenes are assembled with:

- `designId`
- authored `StudioContent`
- `defaultControls`

The helper is `createReferenceInfographicContent` in
`AdvancedStudioIntegrationProof.tsx`, lines 69-76.

Confirmed: Infographic title/subtitle shell and renderer dispatch are handled by
`InfographicSceneRenderer`. It renders title/subtitle from content at
`src/advanced-studio/InfographicSceneRenderer.tsx`, lines 162-183, then dispatches
by `design.engine` to G2/G6/S2 renderers in lines 200-236.

## 5. Camera

Confirmed: The initial Advanced Studio proof in `64ae98a` had only a hardcoded
`push-in` camera style inside `AdvancedStudioIntegrationProof.tsx`.

Confirmed: Commit `45c6917` added `src/advanced-studio/camera-paths.ts`.
Current camera presets are defined in `camera-paths.ts`, lines 3-20 and 35-189.
The transform function `cameraPathStyle` is lines 197-214.

Confirmed: Template 1 scenes assign `cameraPath.preset` directly in
`AdvancedStudioIntegrationProof.tsx`, lines 173-175, 189-191, 223-225, 243-245,
259-260, 279-280, 295-296, 315-316, 349-350, 371-372, 387-388, 408-409,
442-443, and 457-458.

Confirmed: The Remotion composition applies camera transforms around both Board
and infographic renderers through `cameraPathStyle` in
`AdvancedStudioIntegrationProof.tsx`, lines 611-614 and 640-669.

Inference: Camera motion was created as per-scene cinematic direction by choosing
from the camera-path registry. The exact human reason for each chosen preset is
not documented.

## 6. Transitions

Confirmed: Template 1 uses only crossfade transitions. The shared helper is
`crossfade(durationFrames = transitionFrames)` in
`AdvancedStudioIntegrationProof.tsx`, lines 156-159. The default
`transitionFrames` is 18 at line 37, while Template 1 scenes mostly use explicit
10- or 12-frame values.

Confirmed: Transition opacity is computed in `sceneOpacity` in
`AdvancedStudioIntegrationProof.tsx`, lines 538-566. Scene visibility accounts
for transition-in overlap in lines 568-572.

Inference: Crossfades were chosen as the only proven transition primitive already
supported by the Advanced scene contract. The repository does not contain a
separate transition-design rationale.

## 7. Timing And Pacing

Confirmed: The project uses 30 fps. `fps` is set to 30 in
`AdvancedStudioIntegrationProof.tsx`, line 36, and exported as
`advancedStudioIntegrationFps` at the end of the file. Remotion compositions use
that value in `src/Composition.tsx`, lines 47, 57, and 67.

Confirmed: Scene durations are frame-native on `AdvancedStudioScene` through
`durationFrames`; see `src/advanced-studio/scene-contract.ts`, lines 39-57.

Confirmed: Template 1 duration is the sum of scene durations through
`getAdvancedStudioProjectDuration` in `AdvancedStudioIntegrationProof.tsx`, lines
468-470. Timed scenes are derived in lines 472-483.

Confirmed: Commit `a7be383` changed `src/Composition.tsx` so
`advancedStudioMaxFrames` uses `advancedStudioIntegrationProofDuration` instead
of a fixed 1800-frame placeholder.

Inference: Pacing was authored directly by assigning `durationFrames` per scene:
75, 90, and 105-frame beats. The repository does not document why individual
beats received those exact durations.

## 8. Preview And Render Verification

Confirmed: Advanced Studio preview uses Remotion Player with
`AdvancedStudioIntegrationProof` in `studio/src/AdvancedStudioApp.tsx`. Current
architecture documents this at `docs/advanced-studio-architecture.md`, lines
32-43.

Confirmed: Advanced Studio Remotion compositions are registered in
`src/Composition.tsx`, lines 43-71:

- `AdvancedStudioIntegrationProofPortrait`
- `AdvancedStudioIntegrationProofSquare`
- `AdvancedStudioIntegrationProofVertical`

Confirmed: `/api/render-advanced` in `vite.studio.config.ts`, lines 134-212,
writes `public/advanced-project.json` and runs `npx remotion render` against the
format-specific Advanced Studio composition ID.

Confirmed: `package.json`, lines 37-45, provides relevant scripts:

- `npm run studio`
- `npm run studio:build`
- `npm run verify:studio`

Confirmed: `scripts/validate-antv-studio.mjs`, lines 24-49, validates registry
counts and each design factory. Later lines validate provider compatibility
sentinels.

Confirmed current verification path:

- `npm run verify:studio` runs registry validation, `tsc --noEmit`, and Vite
  studio build.
- A bounded Remotion render can target
  `AdvancedStudioIntegrationProofPortrait` through `npx remotion render`.

Unproven: The original exact preview sessions or rendered artifact produced
during commit `a7be383` are not recorded in git.

## 9. Chronological Reconstruction

Confirmed sequence:

1. `b63cbc7` built the interactive AntV Studio foundation.
2. `22bdf1b` proved deterministic AntV SVG animation in Remotion.
3. `64ae98a` built the unified Advanced Studio editor shell and introduced the
   first 3-scene Advanced Studio proof.
4. `45c6917` integrated Advanced Studio updates, including camera path support
   and render endpoint work.
5. `80c1a26` shared Board animation semantics across studios through shared
   board motion infrastructure.
6. `df405b0` corrected Board animation preset behavior.
7. `a7be383` created the first cinematic style recreation: the 14-scene Template
   1 baseline.
8. `97d0385` added provider capability and compatibility foundation after the
   Template 1 baseline existed.
9. `dacaa47` added native G6 hierarchy support after the Template 1 baseline
   existed.
10. `ae706d0` removed the rejected follow-on template implementation and restored
    the single approved baseline state.

## 10. Explicitly Documented Versus Recovered

Explicitly documented:

- Advanced Studio combines Board scenes with AntV G2/G6/S2 scenes in one
  timeline: `docs/advanced-studio-architecture.md`, lines 11-43.
- Default 14-scene project ownership:
  `docs/advanced-studio-architecture.md`, lines 45-67.
- Provider ownership and provider-first constraints:
  `docs/advanced-studio-provider-integration.md`, lines 5-11, and
  `docs/provider-first-implementation-standard.md`, lines 7-21.
- Current single-baseline status:
  `docs/advanced-studio-template-system.md`, lines 3-18.

Recovered from code/history:

- The original 3-scene proof introduced in `64ae98a`.
- The replacement 14-scene authored sequence introduced in `a7be383`.
- The exact Board block geometry, scene titles, subtitles, rows, nodes, edges,
  camera presets, transition durations, and timing.
- The fact that Template 1 was authored directly into
  `advancedStudioDefaultProject`, not generated from a documented planner.

Unproven:

- The external brief, if any.
- The human decision rationale for each scene type and each exact duration.
- The exact manual preview/render artifacts from the creation commit.

## 11. Repeatable Workflow For The Next Approved Baseline

Inference: This workflow is derived future guidance based on the repository
evidence above. It is not evidence that Template 1 originally followed a formal
written creation process. It does not approve a new template architecture or a
parallel project replacement system.

1. Content analysis

   Start with a durable brief or content source. Store the source or cite it in
   markdown before implementation. Template 1 lacks this recoverable source, so
   future work must not repeat that gap.

2. Scene planning

   Create an ordered scene plan before code changes. The plan must list scene ID,
   scene title, narrative role, scene type, duration, provider/design ID when
   applicable, Board target when applicable, camera path, and transition.

3. Provider/design selection

   Choose Board for canvas-level composition, G2 for row-based quantitative
   charts, G6 for graph/node-edge relationships, and S2 for tabular scorecards.
   Use registered provider designs from `antVStudioDesigns` and verify
   compatibility before rendering.

4. Scene composition

   Assemble Board scenes as `BoardSceneContent` over a `StudioProject`. Assemble
   infographic scenes as `AdvancedStudioInfographicContent` with `designId`,
   `StudioContent`, and controls. Do not replace semantic content through a
   presentation-only variation.

5. Camera

   Select from `advancedStudioCameraPaths`. Add new camera presets only when the
   existing registry cannot express the needed movement and the ownership audit
   supports adding one.

6. Transitions

   Use the existing crossfade transition model unless a documented provider or
   Remotion-owned transition path is added and verified.

7. Timing

   Assign `durationFrames` in the scene plan. Verify total duration through
   `getAdvancedStudioProjectDuration` and Remotion composition duration.

8. Preview/render verification

   Run `npm run verify:studio`, `npm run studio:build`, and a Remotion render
   smoke against the appropriate `AdvancedStudioIntegrationProof*` composition.
   Verify Board, G2, G6, and S2 scenes are covered by the tested frame range.

9. Documentation

   Record the source content, scene plan, provider selection, composition
   choices, camera, transitions, timing, and verification results in markdown
   before treating the result as a reusable baseline.

10. Commit boundary

   Keep shared infrastructure separate from authored baseline content. Do not
   introduce a new template system unless a separate approved architecture
   document and acceptance tests exist first.
