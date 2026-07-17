export type BlockType =
  | "metric"
  | "donut"
  | "objective"
  | "timeline"
  | "funnel"
  | "bars"
  | "metrics"
  | "comparison"
  | "hierarchy"
  | "process";

export type DesignPreset =
  | "hero"
  | "supporting"
  | "data"
  | "process"
  | "summary"
  | "technical"
  | "balanced"
  | "editorial";

export type AnimationPreset =
  | "focus"
  | "reveal"
  | "build"
  | "trace"
  | "compare"
  | "count"
  | "spotlight"
  | "overview";

export type StudioBlock = {
  id: string;
  type: BlockType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  designPreset: DesignPreset;

  /**
   * Optional AntV overrides.
   * Normal blocks rely on the internal resolver and syntax builder.
   */
  template?: string;
  theme?: "light" | "dark" | "hand-drawn";
  syntax?: string;
  data?: Record<string, unknown>;
};

export type StudioScene = {
  id: string;
  blockId: string | null;
  title: string;
  animation: AnimationPreset;
  durationSeconds: number;
};

export type StudioProject = {
  title: string;
  subtitle: string;
  blocks: StudioBlock[];
  scenes: StudioScene[];
};

export const blockDefinitions: Array<{
  type: BlockType;
  title: string;
  description: string;
}> = [
  {
    type: "timeline",
    title: "Timeline",
    description: "Show events in chronological order",
  },
  {
    type: "funnel",
    title: "Funnel",
    description: "Visualize stages in a process",
  },
  {
    type: "comparison",
    title: "Comparison",
    description: "Compare two or more options",
  },
  {
    type: "donut",
    title: "Pie / Donut",
    description: "Show proportions and percentages",
  },
  {
    type: "hierarchy",
    title: "Hierarchy",
    description: "Display structure and relationships",
  },
  {
    type: "process",
    title: "Process",
    description: "Show a step-by-step explanation",
  },
  {
    type: "metric",
    title: "KPI / Metric",
    description: "Highlight an important number",
  },
  {
    type: "bars",
    title: "Bar Chart",
    description: "Compare measurable performance",
  },
];

export const defaultProject: StudioProject = {
  title: "MARKETING STRATEGY",
  subtitle: "A data-driven approach to sustainable growth",
  blocks: [
    {
      id: "budget",
      type: "metric",
      title: "ANNUAL BUDGET",
      x: 35,
      y: 122,
      width: 190,
      height: 180,
      designPreset: "hero",
    },
    {
      id: "allocation",
      type: "donut",
      title: "BUDGET ALLOCATION",
      x: 240,
      y: 122,
      width: 470,
      height: 180,
      designPreset: "data",
    },
    {
      id: "objective",
      type: "objective",
      title: "KEY OBJECTIVE",
      x: 725,
      y: 122,
      width: 240,
      height: 180,
      designPreset: "supporting",
    },
    {
      id: "campaign",
      type: "timeline",
      title: "CAMPAIGN TIMELINE",
      x: 35,
      y: 318,
      width: 930,
      height: 145,
      designPreset: "process",
    },
    {
      id: "journey",
      type: "funnel",
      title: "CUSTOMER JOURNEY",
      x: 35,
      y: 479,
      width: 280,
      height: 125,
      designPreset: "supporting",
    },
    {
      id: "performance",
      type: "bars",
      title: "CHANNEL PERFORMANCE",
      x: 330,
      y: 479,
      width: 340,
      height: 125,
      designPreset: "data",
    },
    {
      id: "metrics",
      type: "metrics",
      title: "KEY METRICS",
      x: 685,
      y: 479,
      width: 280,
      height: 125,
      designPreset: "summary",
    },
  ],
  scenes: [
    {
      id: "scene-1",
      blockId: "budget",
      title: "Research & Budget",
      animation: "focus",
      durationSeconds: 4,
    },
    {
      id: "scene-2",
      blockId: "journey",
      title: "Funnel Journey",
      animation: "reveal",
      durationSeconds: 4.5,
    },
    {
      id: "scene-3",
      blockId: "performance",
      title: "Channel Metrics",
      animation: "build",
      durationSeconds: 4,
    },
    {
      id: "scene-4",
      blockId: "objective",
      title: "Key Objective",
      animation: "spotlight",
      durationSeconds: 3.5,
    },
    {
      id: "scene-5",
      blockId: null,
      title: "Full Overview",
      animation: "overview",
      durationSeconds: 4,
    },
  ],
};
