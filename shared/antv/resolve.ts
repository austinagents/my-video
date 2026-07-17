import {getTemplates} from "@antv/infographic";
import type {
  BlockType,
  DesignPreset,
  StudioBlock,
} from "../project";

const available = getTemplates();
const availableSet = new Set(available);

const choose = (...names: string[]): string => {
  for (const name of names) {
    if (availableSet.has(name)) {
      return name;
    }
  }

  for (const name of names) {
    const match = available.find((template) =>
      template.startsWith(name),
    );

    if (match) {
      return match;
    }
  }

  return (
    available.find((template) => template === "list-grid-simple") ??
    available[0]
  );
};

const templateMap: Record<
  BlockType,
  Partial<Record<DesignPreset, string[]>>
> = {
  metric: {
    hero: [
      "list-grid-badge-card",
      "list-grid-compact-card",
      "list-grid-simple",
    ],
    data: [
      "list-grid-progress-card",
      "list-grid-badge-card",
      "list-grid-compact-card",
    ],
    summary: [
      "list-grid-compact-card",
      "list-grid-badge-card",
    ],
    supporting: [
      "list-grid-compact-card",
      "list-grid-simple",
    ],
  },

  objective: {
    hero: [
      "list-grid-icon-badge",
      "list-grid-badge-card",
      "list-grid-simple",
    ],
    supporting: [
      "list-grid-badge-card",
      "list-grid-compact-card",
      "list-grid-simple",
    ],
    data: [
      "list-grid-progress-card",
      "list-grid-badge-card",
    ],
  },

  donut: {
    hero: [
      "chart-pie-donut-compact-card",
      "chart-pie-donut-pill-badge",
      "chart-pie-donut-plain-text",
    ],
    data: [
      "chart-pie-donut-compact-card",
      "chart-pie-compact-card",
      "chart-pie-donut-plain-text",
    ],
    supporting: [
      "chart-pie-donut-plain-text",
      "chart-pie-plain-text",
    ],
    editorial: [
      "chart-pie-donut-pill-badge",
      "chart-pie-donut-compact-card",
    ],
  },

  timeline: {
    hero: [
      "sequence-horizontal-zigzag-simple",
      "sequence-horizontal-zigzag-plain-text",
      "sequence-steps-simple",
    ],
    process: [
      "sequence-steps-simple",
      "sequence-snake-steps-simple",
      "list-row-simple-horizontal-arrow",
    ],
    supporting: [
      "sequence-steps-simple",
      "sequence-timeline-simple",
    ],
    technical: [
      "sequence-horizontal-zigzag-underline-text",
      "sequence-timeline-plain-text",
    ],
    balanced: [
      "sequence-steps-simple",
      "sequence-snake-steps-pill-badge",
    ],
    editorial: [
      "sequence-horizontal-zigzag-simple-illus",
      "sequence-horizontal-zigzag-simple",
    ],
  },

  process: {
    hero: [
      "sequence-color-snake-steps-simple-illus",
      "sequence-snake-steps-simple-illus",
      "sequence-snake-steps-simple",
    ],
    process: [
      "sequence-steps-simple",
      "sequence-snake-steps-simple",
      "list-row-simple-horizontal-arrow",
    ],
    supporting: [
      "sequence-steps-simple",
      "list-row-simple-horizontal-arrow",
    ],
    data: [
      "sequence-steps-badge-card",
      "sequence-snake-steps-compact-card",
    ],
    technical: [
      "sequence-horizontal-zigzag-underline-text",
      "sequence-timeline-plain-text",
    ],
  },

  funnel: {
    hero: [
      "sequence-funnel-simple",
      "sequence-pyramid-simple",
    ],
    supporting: [
      "sequence-funnel-simple",
      "list-pyramid-compact-card",
    ],
    data: [
      "sequence-funnel-simple",
      "list-pyramid-badge-card",
    ],
    summary: [
      "list-pyramid-compact-card",
      "sequence-funnel-simple",
    ],
  },

  bars: {
    hero: [
      "chart-bar-plain-text",
      "chart-column-simple",
    ],
    data: [
      "chart-bar-plain-text",
      "chart-column-simple",
    ],
    supporting: [
      "chart-bar-plain-text",
      "chart-column-simple",
    ],
    summary: [
      "chart-bar-plain-text",
      "chart-column-simple",
    ],
  },

  metrics: {
    hero: [
      "list-grid-progress-card",
      "list-grid-compact-card",
    ],
    data: [
      "list-grid-progress-card",
      "list-grid-compact-card",
    ],
    summary: [
      "list-grid-compact-card",
      "list-grid-badge-card",
      "list-grid-simple",
    ],
    supporting: [
      "list-grid-compact-card",
      "list-grid-simple",
    ],
  },

  comparison: {
    hero: [
      "compare-binary-horizontal-compact-card-vs",
      "compare-binary-horizontal-badge-card-vs",
      "compare-binary-horizontal-simple-vs",
    ],
    supporting: [
      "compare-binary-horizontal-simple-vs",
      "compare-binary-horizontal-underline-text-vs",
    ],
    data: [
      "compare-binary-horizontal-compact-card-vs",
      "compare-binary-horizontal-badge-card-vs",
    ],
    technical: [
      "compare-binary-horizontal-underline-text-fold",
      "compare-binary-horizontal-simple-fold",
    ],
    editorial: [
      "compare-swot",
      "compare-binary-horizontal-badge-card-vs",
    ],
  },

  hierarchy: {
    hero: [
      "compare-hierarchy-row-letter-card-compact-card",
      "compare-hierarchy-row-letter-card-rounded-rect-node",
      "compare-hierarchy-left-right-circle-node-pill-badge",
    ],
    supporting: [
      "compare-hierarchy-left-right-circle-node-plain-text",
      "compare-hierarchy-left-right-circle-node-pill-badge",
    ],
    data: [
      "compare-hierarchy-row-letter-card-compact-card",
      "compare-hierarchy-left-right-circle-node-pill-badge",
    ],
    technical: [
      "compare-hierarchy-row-letter-card-rounded-rect-node",
      "compare-hierarchy-left-right-circle-node-plain-text",
    ],
  },
};

const fallbackByType: Record<BlockType, string[]> = {
  metric: [
    "list-grid-badge-card",
    "list-grid-compact-card",
    "list-grid-simple",
  ],
  objective: [
    "list-grid-badge-card",
    "list-grid-compact-card",
    "list-grid-simple",
  ],
  donut: [
    "chart-pie-donut-compact-card",
    "chart-pie-donut-plain-text",
  ],
  timeline: [
    "sequence-steps-simple",
    "list-row-simple-horizontal-arrow",
    "sequence-timeline-simple",
  ],
  process: [
    "sequence-steps-simple",
    "sequence-snake-steps-simple",
  ],
  funnel: [
    "sequence-funnel-simple",
    "sequence-pyramid-simple",
  ],
  bars: [
    "chart-bar-plain-text",
    "chart-column-simple",
  ],
  metrics: [
    "list-grid-compact-card",
    "list-grid-badge-card",
    "list-grid-simple",
  ],
  comparison: [
    "compare-binary-horizontal-simple-vs",
    "compare-binary-horizontal-compact-card-vs",
  ],
  hierarchy: [
    "compare-hierarchy-left-right-circle-node-plain-text",
    "compare-hierarchy-row-letter-card-compact-card",
  ],
};

export type ResolvedAntVBlock = {
  template: string;
  padding: number;
  internalWidth: number;
  internalHeight: number;
};

export const resolveAntVBlock = (
  block: StudioBlock,
): ResolvedAntVBlock => {
  const preferred =
    templateMap[block.type]?.[block.designPreset] ??
    fallbackByType[block.type];

  const padding =
    block.designPreset === "hero"
      ? 12
      : block.designPreset === "editorial"
        ? 14
        : block.designPreset === "technical"
          ? 7
          : 9;

  /*
   * AntV receives a larger internal drawing surface.
   * The generated SVG is then fitted deterministically into the editor block.
   * This prevents microscopic text and template-dependent sizing.
   */
  const internalWidth = Math.max(
    720,
    Math.round(block.width * 2.5),
  );

  const internalHeight = Math.max(
    360,
    Math.round(block.height * 2.5),
  );

  return {
    template: choose(...preferred),
    padding,
    internalWidth,
    internalHeight,
  };
};
