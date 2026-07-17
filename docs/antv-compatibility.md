# AntV Infographic Compatibility Layer

**Project:** Framepoint Animation Pipeline  
**Library:** @antv/infographic  
**Pinned Version:** 0.2.19  
**Status:** Production Baseline  
**Last Verified:** 2026-07-17

---

# Purpose

This document defines the compatibility contract between AntV Infographic and
Framepoint's deterministic Remotion renderer.

The purpose of the compatibility layer is to transform AntV-generated SVG
animations into deterministic frame-driven animations suitable for video export.

AntV itself is not a video rendering engine. It generates animated SVG using
SMIL animation elements. Browsers evaluate these animations against wall-clock
time, while Remotion requires every visual state to be derived solely from the
current frame.

This compatibility layer bridges those two execution models.

---

# Version Contract

The compatibility layer is validated only against:

```

@antv/infographic 0.2.19

```

The dependency is intentionally pinned.

Do not upgrade AntV without rerunning the validation process described in this
document.

---

# AntV Rendering Architecture

Official AntV rendering pipeline:

```

Syntax
↓

Template
↓

Structure

↓

Runtime

↓

SVG

```

Framepoint consumes only the final SVG output.

No internal AntV rendering logic is modified.

---

# Registry Inventory

Verified inventory:

| Item | Count |
|------|------:|
| Templates | 276 |
| Structures | 42 |
| Templates with unknown structures | 0 |
| Structures without templates | 0 |

Templates are declarative configuration.

Structures contain rendering logic.

Multiple templates frequently map to a single rendering implementation.

---

# Animation Inventory

Source inspection found native SVG animation in only two structures.

## relation-dagre-flow

Uses:

```

<animate
attributeName="stroke-dashoffset"
...
repeatCount="indefinite"
/>

```

---

## sequence-interaction

Uses:

```

<animate
attributeName="stroke-dashoffset"
from="10"
to="0"
dur="1s"
repeatCount="indefinite"
/>

```

---

No additional animation primitives were found in structure implementations.

General SVG utilities expose support for additional SMIL attributes
(`keyTimes`, `keySplines`, etc.), but these are not currently emitted by the
built-in structures in version 0.2.19.

---

# Supported Animation Primitive

Currently supported:

- stroke-dashoffset animation

The adapter converts this wall-clock animation into deterministic
frame-based interpolation.

---

# Determinism

The compatibility layer intentionally replaces browser timing with
Remotion timing.

Rendering is driven exclusively by:

```

useCurrentFrame()

```

No wall-clock timing is used during video rendering.

This guarantees:

- deterministic exports
- identical repeated renders
- stable distributed rendering
- reproducible video frames

---

# Validation Completed

The following behaviors have been verified.

✓ AntV SSR rendering

```

renderToString()

```

✓ Browser SVG playback

✓ SVG transformation

✓ Remotion playback

✓ Deterministic duplicate-frame rendering

✓ MP4 export

✓ relation-dagre-flow animation

Native source inspection confirms the same animation primitive is used by
sequence-interaction.

---

# Upgrade Procedure

When upgrading AntV:

1. Pin the new version.
2. Rebuild registry inventory.
3. Scan source for animation primitives.
4. Verify supported structures.
5. Run deterministic rendering tests.
6. Compare browser playback with exported video.
7. Update this document.

Do not assume animation serialization remains unchanged between versions.

---

# Design Principles

The compatibility layer intentionally does **not**:

- modify AntV rendering
- patch AntV internals
- rewrite templates
- depend on browser animation timing

The compatibility layer only translates AntV SVG animation into deterministic
frame evaluation.

---

# Future Compatibility

If future AntV releases introduce additional SVG animation elements
(for example `animateTransform`, `animateMotion`, or keyframe-based SMIL),
support should be added to the adapter only after:

1. Source inspection
2. Browser validation
3. Deterministic Remotion validation

Each new primitive should be documented here.

---

# Current Compatibility Summary

| Feature | Status |
|----------|--------|
| SSR Rendering | ✅ |
| SVG Export | ✅ |
| Deterministic Rendering | ✅ |
| Browser Parity | ✅ |
| MP4 Export | ✅ |
| stroke-dashoffset | ✅ |
| animateTransform | Not currently emitted |
| animateMotion | Not observed |
| SMIL keyframe animations | Not observed |

---

This document represents the validated compatibility baseline for
Framepoint's AntV integration.
