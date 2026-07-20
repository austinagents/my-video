import type {G2Spec} from "@antv/g2";
import type {GraphOptions} from "@antv/g6";
import type {S2DataConfig, S2Options} from "@antv/s2";

export type AntVEngine = "g2" | "s2" | "g6";

export type SupportedIndustry =
  | "Realtor"
  | "Attorney"
  | "Dentist"
  | "Med Spa"
  | "Chiropractor"
  | "Personal Trainer";

export type AnimationPreset =
  | "grow-up"
  | "grow-right"
  | "radial-reveal"
  | "fade-scale"
  | "top-down-tree"
  | "path-style-reveal"
  | "row-reveal";

export type ProviderDataContract =
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

export type ProviderStructure =
  | "rows"
  | "cartesian-series"
  | "polar-series"
  | "point-series"
  | "generic-graph"
  | "dag"
  | "hierarchy"
  | "tree"
  | "flat-table"
  | "scorecard-table"
  | "pivot-table";

export type ProviderAspectRatio = "portrait" | "square" | "vertical";

export type StudioRowField =
  | "id"
  | "label"
  | "value"
  | "group"
  | "secondaryValue"
  | "target";

export type StudioNodeField = "id" | "label" | "group" | "parentId" | "value";

export type StudioEdgeField = "source" | "target" | "label" | "value";

export type ProviderDesignRequiredFields = {
  rows?: StudioRowField[];
  nodes?: StudioNodeField[];
  edges?: StudioEdgeField[];
};

export type ProviderDesignContentLimits = {
  minRows?: number;
  maxRows?: number;
  minNodes?: number;
  maxNodes?: number;
  minEdges?: number;
  maxEdges?: number;
};

export type ProviderAdapterStatus =
  | "generic-content"
  | "requires-native-contract";

export type ProviderDesignCapability = {
  dataContract: ProviderDataContract;
  requiredFields: ProviderDesignRequiredFields;
  optionalFields?: ProviderDesignRequiredFields;
  structures: ProviderStructure[];
  layouts: string[];
  animationModes: AnimationPreset[];
  aspectRatios: ProviderAspectRatio[];
  contentLimits?: ProviderDesignContentLimits;
  adapter: ProviderAdapterStatus;
  notes?: string[];
};

export type StudioRow = {
  id: string;
  label: string;
  value: number;
  group?: string;
  secondaryValue?: number;
  target?: number;
};

export type StudioNode = {
  id: string;
  label: string;
  value?: number;
  group?: string;
  parentId?: string;
};

export type StudioEdge = {
  source: string;
  target: string;
  label?: string;
  value?: number;
};

export type StudioContent = {
  title: string;
  subtitle?: string;
  rows: StudioRow[];
  nodes?: StudioNode[];
  edges?: StudioEdge[];
};

export type StudioControls = {
  showLabels: boolean;
  showLegend: boolean;
  compact: boolean;
  orientation: "portrait" | "landscape";
};

export type FactoryContext = {
  content: StudioContent;
  controls: StudioControls;
  width: number;
  height: number;
};

type BaseDesign = {
  id: string;
  name: string;
  category: string;
  description: string;
  industryExample: SupportedIndustry;
  defaultContent: StudioContent;
  animation: AnimationPreset;
  supportsAddRemove?: boolean;
  supportsSubtitle?: boolean;
  capabilities: ProviderDesignCapability;
};

export type G2StudioDesign = BaseDesign & {
  engine: "g2";
  createOptions: (context: FactoryContext) => G2Spec;
};

export type S2StudioDesign = BaseDesign & {
  engine: "s2";
  createSheetConfig: (context: FactoryContext) => {
    dataCfg: S2DataConfig;
    options: S2Options;
  };
};

export type G6StudioDesign = BaseDesign & {
  engine: "g6";
  createGraphConfig: (context: FactoryContext) => GraphOptions;
};

export type AntVStudioDesign =
  | G2StudioDesign
  | S2StudioDesign
  | G6StudioDesign;

export type RenderStatus = "idle" | "loading" | "ready" | "error";
