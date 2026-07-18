import React from "react";
import {getBoardSemanticMotion} from "../../shared/board-motion";
import {Board} from "../../shared/Board";
import {defaultProject} from "../../shared/project";
import type {AnimationPreset, StudioProject} from "../../shared/project";
import type {SceneRendererProps} from "./scene-contract";

export type BoardSceneContent = {
  project?: StudioProject;
  activeBlockId: string | null;
  animation: AnimationPreset;
};

export const BoardSceneRenderer: React.FC<
  SceneRendererProps<BoardSceneContent>
> = ({
  localFrame,
  durationFrames,
  fps,
  bounds,
  content,
  onReady,
}) => {
  React.useEffect(() => {
    onReady?.();
  }, [onReady]);

  const project = content.project ?? defaultProject;
  const boardWidth = 1000;
  const boardHeight = 640;
  const fit = Math.min(bounds.width / boardWidth, bounds.height / boardHeight);
  const motion = getBoardSemanticMotion({
    project,
    activeBlockId: content.activeBlockId,
    animation: content.animation,
    frame: localFrame,
    sceneStartFrame: 0,
    sceneEndFrame: durationFrames,
    fps,
    outputScale: fit,
  });

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
        style={motion.style}
      >
        <Board
          project={project}
          activeBlockId={motion.activeBlockId}
          dimInactive={motion.dimInactive}
        />
      </div>
    </div>
  );
};
