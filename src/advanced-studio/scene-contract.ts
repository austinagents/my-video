import type {StudioFormat} from "../antv-studio/studio-formats";

export type SceneBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SceneRendererProps<TContent = unknown> = {
  sceneId: string;
  format: StudioFormat;
  fps: number;
  absoluteFrame: number;
  localFrame: number;
  durationFrames: number;
  progress: number;
  bounds: SceneBounds;
  content: TContent;
  onReady?: () => void;
  onError?: (message: string) => void;
};

export type AdvancedStudioScene = {
  id: string;
  type: "board" | "infographic";
  durationFrames: number;
  content: unknown;
  transitionIn?: {
    preset: "crossfade";
    durationFrames: number;
  };
  transitionOut?: {
    preset: "crossfade";
    durationFrames: number;
  };
  cameraPreset?: "push-in";
};
