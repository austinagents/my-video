import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {antVStudioDesigns} from "../antv-studio/registry";
import {cloneContent} from "../antv-studio/sample-content";
import {
  getStudioLayout,
  STUDIO_FORMATS,
  type StudioFormatId,
} from "../antv-studio/studio-formats";
import {defaultControls} from "../antv-studio/theme";
import {studioTheme} from "../antv-studio/theme";
import {getBoardSemanticMotion} from "../../shared/board-motion";
import type {AntVEngine, AntVStudioDesign} from "../antv-studio/types";
import {
  BoardSceneRenderer,
  type BoardSceneContent,
} from "./BoardSceneRenderer";
import {
  InfographicSceneRenderer,
  type InfographicSceneContent,
} from "./InfographicSceneRenderer";
import {cameraPathStyle} from "./camera-paths";
import type {
  AdvancedStudioInfographicContent,
  AdvancedStudioProject,
  AdvancedStudioScene,
  AdvancedStudioTimedScene,
  SceneBounds,
} from "./scene-contract";

const fps = 30;
const transitionFrames = 18;

const findDesign = (designId: string, engine?: AntVEngine) =>
  antVStudioDesigns.find(
    (design) => design.id === designId && (!engine || design.engine === engine),
  );

const requireDesign = (designId: string, engine?: AntVEngine) => {
  const design = findDesign(designId, engine);
  if (!design) {
    throw new Error(`Advanced Studio requires registered design ${designId}.`);
  }
  return design;
};

const revenueRankingDesign = requireDesign("g2-revenue-ranking", "g2");

export const createAdvancedStudioInfographicContent = (
  design: AntVStudioDesign,
): AdvancedStudioInfographicContent => ({
  designId: design.id,
  content: cloneContent(design.defaultContent),
  controls: defaultControls,
});

const scenes: AdvancedStudioScene[] = [
  {
    id: "board-hook",
    type: "board",
    title: "Budget Focus",
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
    type: "g2",
    title: "Revenue Ranking",
    durationFrames: 150,
    content: createAdvancedStudioInfographicContent(revenueRankingDesign),
    transitionIn: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
    transitionOut: {
      preset: "crossfade",
      durationFrames: transitionFrames,
    },
    cameraPath: {
      preset: "push-in",
    },
  },
  {
    id: "board-cta",
    type: "board",
    title: "Overview / CTA",
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

export const advancedStudioDefaultProject: AdvancedStudioProject = {
  title: "Advanced Studio Proof",
  scenes,
};

export const getAdvancedStudioProjectDuration = (
  project: AdvancedStudioProject,
) => project.scenes.reduce((sum, scene) => sum + scene.durationFrames, 0);

export const getAdvancedStudioTimedScenes = (
  project: AdvancedStudioProject,
) =>
  project.scenes.reduce<AdvancedStudioTimedScene[]>((items, scene) => {
    const startFrame = items.at(-1)?.endFrame ?? 0;
    items.push({
      ...scene,
      startFrame,
      endFrame: startFrame + scene.durationFrames,
    });
    return items;
  }, []);

export const advancedStudioIntegrationProofDuration =
  getAdvancedStudioProjectDuration(advancedStudioDefaultProject);

export const advancedStudioIntegrationTimedScenes =
  getAdvancedStudioTimedScenes(advancedStudioDefaultProject);

export const advancedStudioIntegrationScenes = scenes;

export const getAdvancedStudioSceneAtFrame = (
  frame: number,
  project: AdvancedStudioProject = advancedStudioDefaultProject,
) => {
  const timedScenes = getAdvancedStudioTimedScenes(project);
  return timedScenes.find(
    (scene) => frame >= scene.startFrame && frame < scene.endFrame,
  ) ?? timedScenes.at(-1);
};

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

const infographicCanvasObjectFocusStyle = ({
  scene,
  bounds,
  format,
  localFrame,
  fpsValue,
}: {
  scene: AdvancedStudioTimedScene;
  bounds: SceneBounds;
  format: (typeof STUDIO_FORMATS)[StudioFormatId];
  localFrame: number;
  fpsValue: number;
}): React.CSSProperties => {
  const content = scene.content as AdvancedStudioInfographicContent;
  if (content.objectMotion !== "focus") return {};

  const layout = getStudioLayout(format, bounds.width, bounds.height);
  return getBoardSemanticMotion({
    activeTarget: {
      id: `${scene.id}-infographic-canvas-object`,
      x: layout.contentLeft,
      y: layout.contentTop,
      width: layout.contentWidth,
      height: layout.contentHeight,
    },
    animation: "focus",
    frame: localFrame,
    sceneStartFrame: 0,
    sceneEndFrame: scene.durationFrames,
    fps: fpsValue,
    viewportWidth: bounds.width,
    viewportHeight: bounds.height,
  }).style;
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

  const pathStyle = cameraPathStyle(
    scene.cameraPath?.preset ?? scene.cameraPreset ?? "static",
    progress,
  );

  if (scene.type === "g2" || scene.type === "g6" || scene.type === "s2") {
    const content = scene.content as AdvancedStudioInfographicContent;
    const design = requireDesign(content.designId, scene.type);
    const infographicContent: InfographicSceneContent = {
      design,
      content: content.content,
      controls: content.controls,
    };
    const focusStyle = infographicCanvasObjectFocusStyle({
      scene,
      bounds,
      format,
      localFrame,
      fpsValue,
    });
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          ...pathStyle,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...focusStyle,
          }}
        >
          <InfographicSceneRenderer
            {...rendererProps}
            content={infographicContent}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        ...pathStyle,
      }}
    >
      <BoardSceneRenderer
        {...rendererProps}
        content={scene.content as BoardSceneContent}
      />
    </div>
  );
};

export const AdvancedStudioIntegrationProof: React.FC<{
  formatId?: StudioFormatId;
  project?: AdvancedStudioProject;
}> = ({formatId = "portrait", project = advancedStudioDefaultProject}) => {
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

  const timedScenes = React.useMemo(
    () => getAdvancedStudioTimedScenes(project),
    [project],
  );
  const renderedScenes = timedScenes.filter((scene) =>
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
