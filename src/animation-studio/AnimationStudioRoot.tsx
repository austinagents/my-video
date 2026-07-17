import React from "react";
import {Composition} from "remotion";
import {AntVAnimationProof} from "../AntVAnimationProof";

export const AnimationStudioRoot: React.FC = () => {
  return (
    <>
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
