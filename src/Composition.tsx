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
  productVideoBatch3Duration,
  productVideoBatch4Duration,
  productVideoBatch5Duration,
  productVideoBatch6Duration,
  productVideoBatch7Duration,
  productVideoBatch8Duration,
  productVideoBatch9Duration,
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
const defaultBatch3ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "prism",
};
const defaultBatch4ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "shadow-signature",
};
const defaultBatch5ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "glasshouse",
};
const defaultBatch6ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "motion-control",
};
const defaultBatch7ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "luxury-object",
};
const defaultBatch8ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "angle-study",
};
const defaultBatch9ProductVideoProps: ProductVideoProps = {
  ...defaultProductVideoProps,
  templateId: "curtain-call",
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

      <Composition
        id="AdvancedStudio2ProductBatch3Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch3Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch3ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch3Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch3Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch3ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch3Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch3Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch3ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch4Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch4Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch4ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch4Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch4Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch4ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch4Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch4Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch4ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch5Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch5Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch5ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch5Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch5Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch5ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch5Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch5Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch5ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch6Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch6Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch6ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch6Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch6Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch6ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch6Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch6Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch6ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch7Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch7Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch7ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch7Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch7Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch7ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch7Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch7Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch7ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch8Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch8Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch8ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch8Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch8Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch8ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch8Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch8Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch8ProductVideoProps, formatId: "vertical"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch9Portrait"
        component={ProductVideo}
        durationInFrames={productVideoBatch9Duration}
        fps={productVideoFps}
        width={productVideoFormats.portrait.width}
        height={productVideoFormats.portrait.height}
        defaultProps={defaultBatch9ProductVideoProps}
      />

      <Composition
        id="AdvancedStudio2ProductBatch9Square"
        component={ProductVideo}
        durationInFrames={productVideoBatch9Duration}
        fps={productVideoFps}
        width={productVideoFormats.square.width}
        height={productVideoFormats.square.height}
        defaultProps={{...defaultBatch9ProductVideoProps, formatId: "square"}}
      />

      <Composition
        id="AdvancedStudio2ProductBatch9Vertical"
        component={ProductVideo}
        durationInFrames={productVideoBatch9Duration}
        fps={productVideoFps}
        width={productVideoFormats.vertical.width}
        height={productVideoFormats.vertical.height}
        defaultProps={{...defaultBatch9ProductVideoProps, formatId: "vertical"}}
      />
    </>
  );
};
