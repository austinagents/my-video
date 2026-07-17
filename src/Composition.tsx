import React from "react";
import {Composition} from "remotion";
import {ExplainerVideo} from "../shared/ExplainerVideo";
import {defaultProject} from "../shared/project";
import {AntVAnimationProof} from "./AntVAnimationProof";

const totalFrames = Math.round(
  defaultProject.scenes.reduce(
    (sum, scene) => sum + scene.durationSeconds,
    0,
  ) * 30,
);

export const MyComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="ExplainerVideo"
        component={ExplainerVideo}
        durationInFrames={totalFrames}
        fps={30}
        width={1536}
        height={1024}
        defaultProps={defaultProject}
      />

      <Composition
        id="AntVAnimationProof"
        component={AntVAnimationProof}
        durationInFrames={90}
        fps={30}
        width={1000}
        height={800}
      />
    </>
  );
};
