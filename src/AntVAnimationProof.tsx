import React, {useEffect, useMemo, useState} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {transformAnimatedSvg} from "./antv-animation/transform-animated-svg";

export const AntVAnimationProof: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const [svg, setSvg] = useState<string | null>(null);
  const [handle] = useState(() =>
    delayRender("Loading actual AntV SVG"),
  );

  useEffect(() => {
    let cancelled = false;

    const assetUrl = staticFile("antv-animation-proof.svg");

    fetch(assetUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `SVG request failed with ${response.status}: ${assetUrl}`,
          );
        }

        return response.text();
      })
      .then((value) => {
        if (cancelled) {
          return;
        }

        if (!value.includes("<animate")) {
          throw new Error(
            "Loaded SVG does not contain the expected AntV animation.",
          );
        }

        setSvg(value);
        continueRender(handle);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : String(error);

        console.error(message);
        continueRender(handle);
      });

    return () => {
      cancelled = true;
    };
  }, [handle]);

  const transformedSvg = useMemo(() => {
    if (!svg) {
      return null;
    }

    return transformAnimatedSvg({
      svg,
      frame,
      fps,
    });
  }, [svg, frame, fps]);

  if (!transformedSvg) {
    return null;
  }

  const svgSrc =
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      transformedSvg,
    )}`;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={svgSrc}
        style={{
          width: 900,
          height: 700,
          objectFit: "contain",
        }}
      />
    </AbsoluteFill>
  );
};
