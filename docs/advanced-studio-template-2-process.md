# Advanced Studio Template 2 Creation Process

This document records the first authored version of Template 2. Template 2 is a
durable, standalone `AdvancedStudioProject`; "Executive Signal" is its initial
narrative content, not a separate architecture or runtime mode.

The implementation follows the canonical Template 1 process documented in
`docs/advanced-studio-template-1-process.md`.

## Constraints

- Template 1 authored content remains unchanged.
- Template 2 uses the existing `AdvancedStudioProject` and
  `AdvancedStudioScene` contracts.
- Board, G2, G6, and S2 scenes use the existing renderers and provider registry.
- Camera paths, crossfades, duration calculation, Player preview, Remotion
  composition, and render handoff remain shared.
- Template 2 begins with no `StudioBlock.syntax` overrides.
- No template registry, recipe system, behavior layer, metadata framework, or
  persistence system is introduced.

## Initial Narrative

Title: `Executive Signal`

Premise: turn scattered performance data into a confident growth decision.

The narrative moves from competing signals, through diagnosis and evidence, to a
decision path and operating plan. Provider scenes carry detailed authored data.
Board scenes provide the recurring executive overview and chapter focus.

## Authored Board

The Template 2 Board is an independent `StudioProject` with five blocks:

| Block | Type | Narrative role |
| --- | --- | --- |
| `signal` | `metric` | Establish the executive question |
| `evidence` | `bars` | Focus the available evidence |
| `decision` | `comparison` | Frame the choice |
| `execution` | `process` | Sequence the work |
| `outcome` | `metrics` | Return to measurable lift |

Only the normal Board authoring fields are used: title, subtitle, block type,
block title, geometry, design preset, active block, and semantic animation.

## Scene Plan

Template 2 contains 13 scenes totaling 1,170 frames at the existing 30 fps.
Crossfades do not shorten the project timeline.

| # | Scene ID | Type | Duration | Provider design or Board focus | Camera |
| --- | --- | --- | ---: | --- | --- |
| 1 | `template-2-01-executive-question` | Board | 90 | `signal` | `push-in` |
| 2 | `template-2-02-noisy-signals` | G2 | 90 | `g2-scatter-relationship` | `drift-right` |
| 3 | `template-2-03-signal-system` | G6 | 90 | `g6-central-topic-explainer` | `overview-sweep` |
| 4 | `template-2-04-evidence-focus` | Board | 75 | `evidence` | `push-left` |
| 5 | `template-2-05-constraint-map` | G6 | 90 | `g6-symptom-cause-map` | `diagonal-in` |
| 6 | `template-2-06-operating-lift` | S2 | 105 | `s2-before-after-metrics` | `tilt-down` |
| 7 | `template-2-07-decision-frame` | Board | 75 | `decision` | `snap-focus` |
| 8 | `template-2-08-result-drivers` | G2 | 105 | `g2-monthly-performance` | `rise-up` |
| 9 | `template-2-09-decision-path` | G6 | 90 | `g6-diagnostic-flow` | `push-right` |
| 10 | `template-2-10-execution-sequence` | Board | 75 | `execution` | `pull-back` |
| 11 | `template-2-11-operating-plan` | G6 | 90 | `g6-four-step-process` | `drift-left` |
| 12 | `template-2-12-confidence-threshold` | G2 | 90 | `g2-kpi-sparkline` | `push-in` |
| 13 | `template-2-13-system-overview` | Board | 105 | overview | `overview-sweep` |

## Validation

The existing AntV Studio validation command verifies:

- Template 1's authored source section matches its approved baseline digest.
- Template 2 scene durations and total duration use the canonical duration
  helpers.
- Timed scenes are contiguous and each end frame equals its start plus duration.
- Every infographic design is registered for the scene's provider.
- Every infographic scene satisfies the registered provider-content contract.
- Every non-null Board `activeBlockId` resolves to a block in that scene's Board
  project.
- Template 2 contains no non-empty `StudioBlock.syntax` override.

Visual acceptance additionally requires the actual Advanced Studio Player and
Remotion render to complete with the same project, followed by representative
frame inspection for every scene.

## Syntax Override Decision Gate

Custom Board syntax is not part of this baseline. It may be proposed separately
only when a rendered Board label or value materially conflicts with the
narrative and the conflict cannot reasonably be resolved by changing normal
project data, changing the block's role, or moving detailed evidence to a
registered provider scene.
