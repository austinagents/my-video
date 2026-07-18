import type {AnimationPreset} from "./project";

export type AnimationPresetMetadata = {
  id: AnimationPreset;
  label: string;
  description: string;
};

export const animationPresets: AnimationPresetMetadata[] = [
  {id: "focus", label: "Focus", description: "Zoom and direct attention"},
  {id: "reveal", label: "Reveal", description: "Fade and slide into view"},
  {id: "build", label: "Build", description: "Sequential content build"},
  {id: "trace", label: "Trace", description: "Follow a visual path"},
  {id: "compare", label: "Compare", description: "Highlight two ideas"},
  {id: "count", label: "Count", description: "Emphasize metric data"},
  {id: "spotlight", label: "Spotlight", description: "Dim inactive blocks"},
  {id: "overview", label: "Overview", description: "Return to full board"},
];
