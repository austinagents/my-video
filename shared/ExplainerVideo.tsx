import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {Board} from "./Board";
import {getBoardSemanticMotion} from "./board-motion";
import type {StudioProject, StudioScene} from "./project";

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

  const motion = getBoardSemanticMotion({
    project,
    activeBlockId: scene.blockId,
    animation: scene.animation,
    frame,
    sceneStartFrame: sceneStart,
    sceneEndFrame: sceneEnd,
    fps,
  });

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
        style={motion.style}
      >
        <Board
          project={project}
          activeBlockId={motion.activeBlockId}
          dimInactive={motion.dimInactive}
        />
      </div>
    </AbsoluteFill>
  );
};
