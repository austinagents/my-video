# Provider-First Implementation Standard

This standard is mandatory for all future Framepoint Studio, Advanced Studio, Animation Review, renderer, motion, preview, and export work.

It exists because this project has repeatedly created new logic for behavior that was already provided by an existing system. Custom logic is the final option, not the default.

## Core Rule

For every requested function, behavior, control, renderer feature, or workflow:

1. Identify the provider or system that owns the function.
2. Inspect what that provider or system already exposes.
3. Verify whether the requested behavior already exists.
4. Reuse the existing capability when available.
5. Only create custom logic after proving that no existing provider, renderer, registry, shared resolver, or project implementation already provides the required behavior.

Default assumption:

The required capability probably already exists somewhere in the current provider stack or repository.

The burden of proof is on creating new logic.

## What Counts as a Provider or Owning System

A provider may be:

- an external library
- a rendering framework
- a visualization system
- a project registry
- a shared resolver
- an existing studio implementation
- a native platform API
- a current renderer
- a canonical scene or project model

Current examples include:

- AntV G2
- AntV G6
- AntV S2
- Remotion
- React
- existing Animation Review Studio behavior
- shared board motion
- Advanced Studio camera paths
- design registries
- scene contracts
- template registries
- preview composition
- render composition

Do not treat only third-party libraries as providers.

Existing project systems also count as providers and sources of truth.

## Mandatory Function Ownership Audit

Before implementing any function, identify:

| Function | Owning Provider/System | Existing API or Symbol | Current Consumer | Verified Capability | Gap |
|---|---|---|---|---|---|

Every implementation task must answer:

- What system owns this behavior?
- What exact file, API, registry, type, resolver, or renderer exposes it?
- Where is it already used?
- Is there an existing proof of concept?
- Does the requested behavior already exist fully?
- Does it exist partially?
- Is the gap in authoring, state, wiring, preview, or rendering?
- Is custom logic actually necessary?

Do not start implementation until this ownership audit is complete.

## Provider Capability Check

For every provider involved, inspect:

- official API or documentation where available
- current repository integration
- existing types
- registries
- presets
- renderer props
- callbacks
- animation configuration
- layout metadata
- target metadata
- preview behavior
- render behavior
- working examples already present in the repository

Do not assume a provider lacks a feature because the current UI does not expose it.

A missing UI control is not proof of a missing provider capability.

A missing wiring path is not proof that new rendering logic is required.

## Existing Proof of Concept Rule

Before creating new behavior, search the repository for an existing proof of concept.

Examples:

- Animation Review Scene 4 for Spotlight
- `getBoardSemanticMotion` for board framing and dimming
- `Board` for inactive-object treatment
- AntV design animation metadata for infographic animation
- `InfographicSceneRenderer` for renderer-owned animation
- `camera-paths.ts` for optional cinematography
- `ExplainerVideo` for Preview and Render scene consumption

If a working proof exists:

- reuse it
- extract it only if necessary
- wire it into the new authoring surface
- do not recreate it independently

The working implementation is stronger evidence than a proposed abstraction.

## No-Invention Rule

Do not invent:

- new animation behavior
- new target models
- new motion resolvers
- new layout calculations
- new metadata
- new wrapper transforms
- new scene fields
- new registries
- new fallback behavior
- new provider abstractions

unless all of the following are true:

1. The owning provider or current system has been identified.
2. Its existing capabilities have been inspected.
3. The repository has been searched for an existing implementation.
4. The requested behavior is confirmed absent.
5. The gap is documented precisely.
6. The new logic has a clearly defined owner.
7. Preview and final Render will consume the same result.
8. The change does not create a parallel source of truth.

"Easier to implement" is not sufficient justification for custom logic.

## Multi-Provider Functions

Some functions may involve multiple systems.

For those, document responsibility explicitly.

Example:

```text
Spotlight on a Board scene

Scene contract
- stores the target and semantic preset

Animation Review authoring
- allows the user to select the block and preset

shared/board-motion.ts
- resolves framing, translation, scale, and dimInactive

shared/Board.tsx
- applies inactive-object dimming

Remotion Preview/Render
- evaluates the scene over time
```

Do not collapse multi-provider behavior into one improvised wrapper.

The correct integration preserves each provider's responsibility and composes the outputs intentionally.

## Semantic Motion vs Camera Motion

Semantic Motion and Camera Motion are separate systems.

Semantic Motion answers:

```text
What should this scene communicate or emphasize?
```

Examples:

- Focus
- Reveal
- Build
- Trace
- Compare
- Count
- Spotlight
- Overview

Camera Motion answers:

```text
How should the completed scene framing move?
```

Examples:

- Static
- Push In
- Pull Back
- Drift
- Tilt
- Orbit

Rules:

- Do not implement Semantic Motion by adding a generic camera transform.
- Do not implement Camera Motion by changing semantic scene behavior.
- Do not use `cameraPath` as a substitute for `AnimationPreset`.
- Do not use wrapper transforms to fake Focus, Spotlight, Reveal, Count, or other semantic behavior when a shared resolver already owns the behavior.
- Keep semantic transforms and camera transforms on separate nested layers when both are present.

## Internal Object Animation

Internal Object Animation belongs to the object renderer.

Examples:

- AntV chart bar growth
- G2 reveal behavior
- G6 node or path reveal
- S2 row reveal
- chart count-up
- graph traversal
- staged template build

Rules:

- Do not recreate renderer-owned animation outside the renderer.
- Do not use a generic CSS transform as a substitute for renderer-aware behavior.
- If a Semantic Motion preset needs internal object animation, inspect the renderer and provider first.
- If the renderer does not expose the needed control, document the gap before adding new behavior.

## Preview and Render Parity

Every authoring control must be consumed by both Preview and final Render.

Before adding a control, verify:

- where the selected value is stored
- how the Remotion Player receives it
- how final render receives it
- whether preview and render use the same component path
- whether timing and frame progress are calculated from the same scene contract

Do not add controls that only affect the editor chrome unless the feature is explicitly editor-only.

If Preview and Render disagree, treat it as a parity defect.

## Minimum Implementation Report

Every implementation report must include:

- provider or owning system used
- existing symbols reused
- proof of concept found
- exact gap filled
- files changed
- state fields written
- preview path
- render path
- verification performed
- custom logic added, if any, with justification
- systems intentionally not changed

If the report cannot explain why custom logic was necessary, the change should be considered suspect.

## Approved Custom Logic Criteria

Custom logic is allowed only when it is:

- scoped to a documented gap
- owned by a clearly named module
- compatible with the existing scene contract
- consumed by Preview and Render
- isolated from unrelated systems
- backed by a narrow verification checklist
- not duplicating a provider capability
- not creating a second source of truth

Custom logic must be named according to the layer it actually belongs to:

- semantic scene behavior
- camera motion
- internal object animation
- layout
- target resolution
- preview state
- render state

Do not use vague names such as `motion`, `animation`, or `effect` without layer context.

## Stop Conditions

Stop before implementation if:

- the owning provider is unknown
- the requested layer is ambiguous
- the behavior may already exist but has not been inspected
- Preview and Render consumption is unclear
- the change would introduce a parallel resolver or registry
- the implementation requires guessed geometry
- the implementation relies on an inaccessible reference artifact
- the UI label and state field would describe different concepts

When a stop condition is hit, report the ambiguity and the smallest audit needed to unblock implementation.

## Practical Decision Tree

```text
Is this about how a scene communicates emphasis?
-> Semantic Motion
-> Check Animation Review, AnimationPreset, shared board motion, scene target fields.

Is this about optional whole-scene cinematography?
-> Camera Motion
-> Check cameraPath and camera-paths.ts.

Is this animation inside a chart, graph, table, or SVG renderer?
-> Internal Object Animation
-> Check AntV, renderer props, design animation metadata, and provider APIs.

Is this about visual arrangement or style?
-> Design Preset or Template
-> Check registries, design definitions, layout helpers, and renderer options.

Is this about playback or output?
-> Preview or Render
-> Check Remotion Player, composition, props, and render command.

Unsure?
-> Stop. Identify the owning layer before implementing.
```

## Non-Negotiable Rule

Do not create new behavior until the existing provider stack has been inspected and ruled out.

Provider-first is not a preference. It is the implementation standard.
