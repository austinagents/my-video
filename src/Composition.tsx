import React from "react";
import {Composition} from "remotion";
import {ExplainerVideo} from "../shared/ExplainerVideo";
import {defaultProject} from "../shared/project";
import {AntVAnimationProof} from "./AntVAnimationProof";
import {
  AdvancedStudioIntegrationProof,
  advancedStudioIntegrationProofDuration,
  advancedStudioIntegrationFps,
  advancedStudioIntegrationFormats,
} from "./advanced-studio/AdvancedStudioIntegrationProof";
import {
  ProductVideo,
  productVideoBatch2Duration,
  productVideoDuration,
  productVideoFormats,
  productVideoFps,
  type ProductVideoProps,
} from "./advanced-studio2/ProductVideo";

const totalFrames = Math.round(
  defaultProject.scenes.reduce(
    (sum, scene) => sum + scene.durationSeconds,
    0,
  ) * 30,
);
const advancedStudioMaxFrames = advancedStudioIntegrationProofDuration;
const defaultProductVideoProps: ProductVideoProps = {
  templateId: "obsidian",
  imageSrc: "",
  productName: "Aurelia One",
  formatId: "portrait",
};
const defaultBatch2ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "eclipse",
};

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

      <Composition
        id="AdvancedStudioIntegrationProofPortrait"
        component={AdvancedStudioIntegrationProof}
        durationInFrames={advancedStudioMaxFrames}
        fps={advancedStudioIntegrationFps}
        width={advancedStudioIntegrationFormats.portrait.width}
        height={advancedStudioIntegrationFormats.portrait.height}
        defaultProps={{formatId: "portrait"}}
      />

      <Composition
        id="AdvancedStudioIntegrationProofSquare"
        component={AdvancedStudioIntegrationProof}
        durationInFrames={advancedStudioMaxFrames}
        fps={advancedStudioIntegrationFps}
        width={advancedStudioIntegrationFormats.square.width}
        height={advancedStudioIntegrationFormats.square.height}
        defaultProps={{formatId: "square"}}
      />

      <Composition
        id="AdvancedStudioIntegrationProofVertical"
        component={AdvancedStudioIntegrationProof}
        durationInFrames={advancedStudioMaxFrames}
        fps={advancedStudioIntegrationFps}
        width={advancedStudioIntegrationFormats.vertical.width}
        height={advancedStudioIntegrationFormats.vertical.height}
        defaultProps={{formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductPortrait"
        component={ProductVideo}
        durationInFrames={productVideoDuration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductSquare"
        component={ProductVideo}
        durationInFrames={productVideoDuration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductVertical"
        component={ProductVideo}
        durationInFrames={productVideoDuration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch2Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch2Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch2ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch2Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch2Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch2ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch2Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch2Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch2ProductVideoProps, formatId: "vertical"}}
      />
    </>
  );
};
