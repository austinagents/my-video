import React from "react";
import {Easing, interpolate} from "remotion";
import {Board} from "../../shared/Board";
import {defaultProject} from "../../shared/project";
import type {AnimationPreset, StudioProject} from "../../shared/project";
import type {SceneRendererProps} from "./scene-contract";

export type BoardSceneContent = {
  project?: StudioProject;
  activeBlockId: string | null;
  animation: AnimationPreset;
};

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

export const BoardSceneRenderer: React.FC<
  SceneRendererProps<BoardSceneContent>
> = ({
  localFrame,
  durationFrames,
  fps,
  progress,
  bounds,
  content,
  onReady,
}) => {
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  const project = content.project ?? defaultProject;
  const activeBlock =
    content.activeBlockId === null
      ? null
      : project.blocks.find((block) => block.id === content.activeBlockId) ??
        null;

  const boardWidth = 1000;
  const boardHeight = 640;
  const fit = Math.min(bounds.width / boardWidth, bounds.height / boardHeight);
  const intro = interpolate(
    localFrame,
    [0, Math.round(fps * 0.55)],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );
  const outro = interpolate(
    localFrame,
    [durationFrames - Math.round(fps * 0.35), durationFrames],
    [1, 0.98],
    clamp,
  );

  const shouldFocus =
    activeBlock &&
    ["focus", "spotlight", "count", "reveal"].includes(content.animation);
  const targetScale =
    content.animation === "spotlight"
      ? 1.14
      : content.animation === "focus"
        ? 1.1
        : shouldFocus
          ? 1.05
          : 1;
  const cameraScale = interpolate(intro, [0, 1], [1, targetScale]) * outro;
  const blockCenterX = activeBlock
    ? activeBlock.x + activeBlock.width / 2
    : boardWidth / 2;
  const blockCenterY = activeBlock
    ? activeBlock.y + activeBlock.height / 2
    : boardHeight / 2;
  const targetX = shouldFocus ? (boardWidth / 2 - blockCenterX) * 0.24 : 0;
  const targetY = shouldFocus ? (boardHeight / 2 - blockCenterY) * 0.24 : 0;
  const translateX = interpolate(intro, [0, 1], [0, targetX]);
  const translateY = interpolate(intro, [0, 1], [0, targetY]);
  const softEntrance = interpolate(progress, [0, 0.12, 1], [0.98, 1, 1], clamp);

  return (
    <div
      style={{
        position: "absolute",
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          transform: `
            translate(${translateX * fit}px, ${translateY * fit}px)
            scale(${fit * cameraScale * softEntrance})
          `,
          transformOrigin: "center center",
        }}
      >
        <Board
          project={project}
          activeBlockId={activeBlock?.id ?? null}
          dimInactive={content.animation === "spotlight"}
        />
      </div>
    </div>
  );
};
