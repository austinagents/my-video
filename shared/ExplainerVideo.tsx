import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Board} from "./Board";
import type {StudioProject, StudioScene} from "./project";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const getSceneAtFrame = (
  scenes: StudioScene[],
  frame: number,
  fps: number,
) => {
  let cursor = 0;

  for (const scene of scenes) {
    const duration = Math.round(scene.durationSeconds * fps);
    const end = cursor + duration;

    if (frame < end) {
      return {
        scene,
        sceneStart: cursor,
        sceneEnd: end,
      };
    }

    cursor = end;
  }

  const scene = scenes[scenes.length - 1];

  return {
    scene,
    sceneStart: Math.max(0, cursor - scene.durationSeconds * fps),
    sceneEnd: cursor,
  };
};

export const ExplainerVideo: React.FC<StudioProject> = (project) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const {scene, sceneStart, sceneEnd} = getSceneAtFrame(
    project.scenes,
    frame,
    fps,
  );

  const activeBlock =
    scene.blockId === null
      ? null
      : project.blocks.find((block) => block.id === scene.blockId) ?? null;

  const intro = interpolate(
    frame,
    [sceneStart, sceneStart + Math.round(fps * 0.55)],
    [0, 1],
    {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    },
  );

  const outro = interpolate(
    frame,
    [sceneEnd - Math.round(fps * 0.35), sceneEnd],
    [1, 0.96],
    clamp,
  );

  const shouldFocus =
    activeBlock &&
    ["focus", "spotlight", "count", "reveal"].includes(scene.animation);

  const targetScale =
    scene.animation === "spotlight"
      ? 1.18
      : scene.animation === "focus"
        ? 1.12
        : scene.animation === "count"
          ? 1.09
          : shouldFocus
            ? 1.06
            : 1;

  const scale = interpolate(intro, [0, 1], [1, targetScale]);

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

  const boardOpacity =
    scene.animation === "reveal"
      ? interpolate(intro, [0, 1], [0.3, 1])
      : 1;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 44%,#eff4fa 0%,#dfe7f0 100%)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          opacity: boardOpacity,
          transform: `
            translate(${translateX}px, ${translateY}px)
            scale(${scale * outro})
          `,
          transformOrigin: "center center",
        }}
      >
        <Board
          project={project}
          activeBlockId={activeBlock?.id ?? null}
          dimInactive={scene.animation === "spotlight"}
        />
      </div>
    </AbsoluteFill>
  );
};
