import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {antVStudioDesigns} from "../antv-studio/registry";
import {STUDIO_FORMATS, type StudioFormatId} from "../antv-studio/studio-formats";
import {studioTheme} from "../antv-studio/theme";
import type {G2StudioDesign} from "../antv-studio/types";
import {
  BoardSceneRenderer,
  type BoardSceneContent,
} from "./BoardSceneRenderer";
import {
  InfographicSceneRenderer,
  type InfographicSceneContent,
} from "./InfographicSceneRenderer";
import type {AdvancedStudioScene, SceneBounds} from "./scene-contract";

const fps = 30;
const transitionFrames = 18;

const selectedDesign = antVStudioDesigns.find(
  (design): design is G2StudioDesign =>
    design.engine === "g2" && design.id === "g2-revenue-ranking",
);

if (!selectedDesign) {
  throw new Error("AdvancedStudioIntegrationProof requires g2-revenue-ranking.");
}

const scenes: AdvancedStudioScene[] = [
  {
    id: "board-hook",
    type: "board",
    durationFrames: 120,
    content: {
      activeBlockId: "budget",
      animation: "focus",
    },
    transitionOut: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
  },
  {
    id: "infographic-revenue-ranking",
    type: "infographic",
    durationFrames: 150,
    content: {
      design: selectedDesign,
    },
    transitionIn: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
    transitionOut: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
    cameraPreset: "push-in",
  },
  {
    id: "board-cta",
    type: "board",
    durationFrames: 90,
    content: {
      activeBlockId: null,
      animation: "overview",
    },
    transitionIn: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
  },
];

export const advancedStudioIntegrationProofDuration = scenes.reduce(
  (sum, scene) => sum + scene.durationFrames,
  0,
);

export type AdvancedStudioTimedScene = AdvancedStudioScene & {
  startFrame: number;
  endFrame: number;
};

export const advancedStudioIntegrationScenes = scenes;

export const advancedStudioIntegrationTimedScenes =
  scenes.reduce<AdvancedStudioTimedScene[]>((items, scene) => {
    const startFrame = items.at(-1)?.endFrame ?? 0;
    items.push({
      ...scene,
      startFrame,
      endFrame: startFrame + scene.durationFrames,
    });
    return items;
  }, []);

export const getAdvancedStudioSceneAtFrame = (frame: number) =>
  advancedStudioIntegrationTimedScenes.find(
    (scene) => frame >= scene.startFrame && frame < scene.endFrame,
  ) ?? advancedStudioIntegrationTimedScenes.at(-1);

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const sceneOpacity = (scene: AdvancedStudioTimedScene, frame: number) => {
  let opacity = 1;

  if (scene.transitionIn && frame < scene.startFrame) {
    opacity *= interpolate(
      frame,
      [
        scene.startFrame - scene.transitionIn.durationFrames,
        scene.startFrame,
      ],
      [0, 1],
      clamp,
    );
  }

  if (scene.transitionOut && frame >= scene.endFrame - scene.transitionOut.durationFrames) {
    opacity *= interpolate(
      frame,
      [
        scene.endFrame - scene.transitionOut.durationFrames,
        scene.endFrame,
      ],
      [1, 0],
      clamp,
    );
  }

  return opacity;
};

const shouldRenderScene = (scene: AdvancedStudioTimedScene, frame: number) => {
  const visibleStart =
    scene.startFrame - (scene.transitionIn?.durationFrames ?? 0);
  return frame >= visibleStart && frame < scene.endFrame;
};

const cameraStyle = (
  scene: AdvancedStudioTimedScene,
  progress: number,
): React.CSSProperties => {
  if (scene.cameraPreset !== "push-in") {
    return {};
  }

  const eased = Easing.out(Easing.cubic)(progress);
  const scale = interpolate(eased, [0, 1], [1, 1.08], clamp);
  const translateY = interpolate(eased, [0, 1], [0, -18], clamp);

  return {
    transform: `translateY(${translateY}px) scale(${scale})`,
    transformOrigin: "center center",
  };
};

const renderScene = ({
  scene,
  formatId,
  frame,
  fpsValue,
  bounds,
  onReady,
  onError,
}: {
  scene: AdvancedStudioTimedScene;
  formatId: StudioFormatId;
  frame: number;
  fpsValue: number;
  bounds: SceneBounds;
  onReady: (id: string) => void;
  onError: (id: string, message: string) => void;
}) => {
  const format = STUDIO_FORMATS[formatId];
  const localFrame = Math.max(
    0,
    Math.min(scene.durationFrames, frame - scene.startFrame),
  );
  const progress = scene.durationFrames <= 0 ? 1 : localFrame / scene.durationFrames;
  const rendererProps = {
    sceneId: scene.id,
    format,
    fps: fpsValue,
    absoluteFrame: frame,
    localFrame,
    durationFrames: scene.durationFrames,
    progress,
    bounds,
    content: scene.content,
    onReady: () => onReady(scene.id),
    onError: (message: string) => onError(scene.id, message),
  };

  if (scene.type === "infographic") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          ...cameraStyle(scene, progress),
        }}
      >
        <InfographicSceneRenderer
          {...rendererProps}
          content={scene.content as InfographicSceneContent}
        />
      </div>
    );
  }

  return (
    <BoardSceneRenderer
      {...rendererProps}
      content={scene.content as BoardSceneContent}
    />
  );
};

export const AdvancedStudioIntegrationProof: React.FC<{
  formatId?: StudioFormatId;
}> = ({formatId = "portrait"}) => {
  const frame = useCurrentFrame();
  const {fps: fpsValue} = useVideoConfig();
  const format = STUDIO_FORMATS[formatId];
  const [readyScenes, setReadyScenes] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const bounds = React.useMemo<SceneBounds>(
    () => ({
      x: 0,
      y: 0,
      width: format.width,
      height: format.height,
    }),
    [format.height, format.width],
  );

  const markReady = React.useCallback((id: string) => {
    setReadyScenes((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  const markError = React.useCallback((id: string, message: string) => {
    setErrors((current) => ({...current, [id]: message}));
  }, []);

  const renderedScenes = advancedStudioIntegrationTimedScenes.filter((scene) =>
    shouldRenderScene(scene, frame),
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #202735 0%, #0a0d12 72%)",
        color: "#ffffff",
        overflow: "hidden",
      }}
    >
      {renderedScenes.map((scene) => {
        const opacity = sceneOpacity(scene, frame);
        return (
          <div
            key={scene.id}
            data-advanced-scene-layer={scene.id}
            data-scene-ready={readyScenes.has(scene.id)}
            style={{
              position: "absolute",
              inset: 0,
              opacity,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {renderScene({
              scene,
              formatId,
              frame,
              fpsValue,
              bounds,
              onReady: markReady,
              onError: markError,
            })}
          </div>
        );
      })}

      {Object.entries(errors).map(([sceneId, message]) => (
        <div
          key={sceneId}
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            bottom: 40,
            padding: 18,
            borderRadius: 8,
            background: "rgba(0,0,0,0.72)",
            border: `1px solid ${studioTheme.danger}`,
            color: studioTheme.danger,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 22,
          }}
        >
          {sceneId}: {message}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export const advancedStudioIntegrationFormats = STUDIO_FORMATS;
export const advancedStudioIntegrationFps = fps;
