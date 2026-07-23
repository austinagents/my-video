import type React from "react";
import {Easing, interpolate} from "remotion";
import type {AnimationPreset, StudioBlock, StudioProject} from "./project";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const semanticFocusAnimations: AnimationPreset[] = [
  "focus",
  "spotlight",
  "count",
  "reveal",
];

export type BoardSemanticMotionInput = {
  project: StudioProject;
  activeBlockId: string | null;
  animation: AnimationPreset;
  frame: number;
  sceneStartFrame: number;
  sceneEndFrame: number;
  fps: number;
  outputScale?: number;
};

export type BoardSemanticMotion = {
  activeBlock: StudioBlock | null;
  activeBlockId: string | null;
  dimInactive: boolean;
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  transform: string;
  style: React.CSSProperties;
};

export const getBoardSemanticMotion = ({
  project,
  activeBlockId,
  animation,
  frame,
  sceneStartFrame,
  sceneEndFrame,
  fps,
  outputScale = 1,
}: BoardSemanticMotionInput): BoardSemanticMotion => {
  const activeBlock =
    activeBlockId === null
      ? null
      : project.blocks.find((block) => block.id === activeBlockId) ?? null;

  const intro = interpolate(
    frame,
    [sceneStartFrame, sceneStartFrame + Math.round(fps * 0.55)],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );

  const outro = interpolate(
    frame,
    [sceneEndFrame - Math.round(fps * 0.35), sceneEndFrame],
    [1, 0.96],
    clamp,
  );

  const shouldFocus =
    Boolean(activeBlock) && semanticFocusAnimations.includes(animation);

  const targetScale =
    animation === "spotlight"
      ? 1.18
      : animation === "focus"
        ? 1.12
        : animation === "count"
          ? 1.09
          : shouldFocus
            ? 1.06
            : 1;

  const scale = interpolate(intro, [0, 1], [1, targetScale]) * outro;
  const boardCenterX = 500;
  const boardCenterY = 320;
  const blockCenterX = activeBlock
    ? activeBlock.x + activeBlock.width / 2
    : boardCenterX;
  const blockCenterY = activeBlock
    ? activeBlock.y + activeBlock.height / 2
    : boardCenterY;
  const targetX = shouldFocus ? (boardCenterX - blockCenterX) * 0.32 : 0;
  const targetY = shouldFocus ? (boardCenterY - blockCenterY) * 0.32 : 0;
  const translateX = interpolate(intro, [0, 1], [0, targetX]);
  const translateY = interpolate(intro, [0, 1], [0, targetY]);
  const opacity =
    animation === "reveal"
      ? interpolate(intro, [0, 1], [0.3, 1])
      : 1;
  const transform = `
    translate(${translateX * outputScale}px, ${translateY * outputScale}px)
    scale(${scale * outputScale})
  `;

  return {
    activeBlock,
    activeBlockId: activeBlock?.id ?? null,
    dimInactive: animation === "spotlight",
    opacity,
    translateX,
    translateY,
    scale,
    transform,
    style: {
      opacity,
      transform,
      transformOrigin: "center center",
    },
  };
};
