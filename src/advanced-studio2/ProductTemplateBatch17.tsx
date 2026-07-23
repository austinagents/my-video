import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {getProductTemplate} from "./product-templates";
import type {ProductVideoProps} from "./ProductVideo";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const range = (
  frame: number,
  input: [number, number] | [number, number, number, number],
  output: [number, number] | [number, number, number, number],
) => interpolate(frame, input, output, clamp);

const useScene = (props: ProductVideoProps) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const template = getProductTemplate(props.templateId);
  return {
    frame,
    width,
    height,
    vertical: height / width > 1.55,
    compact: height / width < 1.15,
    template,
    accent: props.accent || template.accent,
    eyebrow: props.eyebrow || template.eyebrow,
    headline: props.headline || template.headline,
    subheadline: props.subheadline || template.subheadline,
    cta: props.cta || template.cta,
  };
};

type Scene = ReturnType<typeof useScene>;

const Material: React.FC<{src?: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? (
    <Img
      src={staticFile(src.replace(/^\/+/, ""))}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: 0.12,
        mixBlendMode: "multiply",
        ...style,
      }}
    />
  ) : null;

const Product: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) =>
  src ? (
    <Img src={src} style={{width: "100%", height: "100%", objectFit: "contain", ...style}} />
  ) : (
    <div style={{width: "100%", height: "100%", display: "grid", placeItems: "center", opacity: 0.35}}>
      UPLOAD PRODUCT
    </div>
  );

const Copy: React.FC<{
  scene: Scene;
  light?: boolean;
  centered?: boolean;
  style?: React.CSSProperties;
}> = ({scene, light = false, centered = false, style}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: centered ? "center" : "flex-start",
      textAlign: centered ? "center" : "left",
      color: light ? "#fff" : scene.template.foreground,
      ...style,
    }}
  >
    <span style={{color: scene.accent, fontSize: 15, fontWeight: 950, letterSpacing: 4}}>
      {scene.eyebrow}
    </span>
    <strong
      style={{
        maxWidth: 760,
        marginTop: 20,
        fontSize: scene.vertical ? 82 : scene.compact ? 60 : 70,
        lineHeight: 0.87,
        letterSpacing: -3,
      }}
    >
      {scene.headline}
    </strong>
    <span
      style={{
        maxWidth: 590,
        marginTop: 22,
        color: light ? "#d8d8d2" : scene.template.muted,
        fontSize: 17,
        lineHeight: 1.4,
      }}
    >
      {scene.subheadline}
    </span>
    <b style={{marginTop: 24, color: scene.accent, fontSize: 15}}>{scene.cta} →</b>
  </div>
);

const Palindrome: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const mirroredFrame = scene.frame <= 150 ? scene.frame : 300 - scene.frame;
  const motion = range(mirroredFrame, [0, 150], [0, 1]);
  return (
    <AbsoluteFill style={{background: scene.template.background, color: "#fff", overflow: "hidden"}}>
      <Material src={props.polyHavenTexture?.localSrc} />
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${50 + Math.cos(index * Math.PI / 2) * motion * 36}%`,
            top: `${48 + Math.sin(index * Math.PI / 2) * motion * 30}%`,
            width: 90 + index * 16,
            height: 90 + index * 16,
            border: `2px solid ${index % 2 ? scene.accent : "#ffffff55"}`,
            transform: `translate(-50%, -50%) rotate(${motion * (index % 2 ? 90 : -90)}deg)`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: scene.vertical ? "17% 13% 25%" : "13% 31% 13%",
          zIndex: 2,
          transform: `scale(${0.78 + motion * 0.22})`,
        }}
      >
        <Product
          src={props.imageSrc}
          style={{filter: `drop-shadow(0 0 ${motion * 38}px ${scene.accent}88)`}}
        />
      </div>
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: scene.accent,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        {scene.frame <= 150 ? "FORWARD / 01" : "REVERSE / 02"}
      </span>
      <div
        style={{
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: "5%",
          zIndex: 3,
          opacity: range(mirroredFrame, [95, 140], [0, 1]),
        }}
      >
        <Copy scene={scene} light centered />
      </div>
    </AbsoluteFill>
  );
};

const TheCallback: React.FC<ProductVideoProps> = (props) => {
  const scene = useScene(props);
  const develop = range(scene.frame, [35, 210], [0, 1]);
  const resolve = range(scene.frame, [210, 260], [0, 1]);
  const productInset = scene.vertical
    ? {top: 16, right: 11, bottom: 26, left: 11}
    : {top: 12, right: 28, bottom: 12, left: 28};
  const edge = 7;
  return (
    <AbsoluteFill
      style={{background: scene.template.background, color: scene.template.foreground, overflow: "hidden"}}
    >
      <Material src={props.polyHavenTexture?.localSrc} />
      <div
        style={{
          position: "absolute",
          left: `${8 + develop * 35}%`,
          top: `${10 + develop * 28}%`,
          width: `${90 - develop * 52}%`,
          height: `${8 + develop * 54}%`,
          border: `18px solid ${scene.accent}`,
          borderRadius: `${develop * 50}%`,
          transform: `rotate(${develop * 180}deg)`,
          opacity: 1 - resolve,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "5%",
          top: "5%",
          color: scene.accent,
          fontWeight: 950,
          letterSpacing: 5,
        }}
      >
        MOTIF / RETURN
      </span>
      <div
        style={{
          position: "absolute",
          inset: scene.vertical ? "16% 11% 26%" : "12% 28% 12%",
          zIndex: 2,
          transform: `scale(${0.82 + develop * 0.18})`,
        }}
      >
        <Product src={props.imageSrc} />
      </div>
      <div
        style={{
          position: "absolute",
          top: `${productInset.top + (edge - productInset.top) * resolve}%`,
          right: `${productInset.right + (edge - productInset.right) * resolve}%`,
          bottom: `${productInset.bottom + (edge - productInset.bottom) * resolve}%`,
          left: `${productInset.left + (edge - productInset.left) * resolve}%`,
          zIndex: 1,
          border: `5px solid ${scene.accent}`,
          borderRadius: `${(1 - resolve) * 50}%`,
          opacity: resolve,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          bottom: "10%",
          zIndex: 3,
          opacity: resolve,
        }}
      >
        <Copy scene={scene} />
      </div>
    </AbsoluteFill>
  );
};

export const ProductTemplateBatch17: React.FC<ProductVideoProps> = (props) => {
  switch (props.templateId) {
    case "palindrome-hero":
      return <Palindrome {...props} />;
    case "product-callback":
      return <TheCallback {...props} />;
    default:
      return null;
  }
};
