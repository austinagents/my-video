import React, {useEffect, useMemo, useState} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type AnimationDefinition = {
  from: number;
  to: number;
  durationSeconds: number;
  repeatIndefinitely: boolean;
};

const parseDurationSeconds = (value: string): number => {
  const normalized = value.trim();

  if (normalized.endsWith("ms")) {
    return Number.parseFloat(normalized) / 1000;
  }

  if (normalized.endsWith("s")) {
    return Number.parseFloat(normalized);
  }

  return Number.parseFloat(normalized);
};

const getAnimationValue = ({
  animation,
  frame,
  fps,
}: {
  animation: AnimationDefinition;
  frame: number;
  fps: number;
}): number => {
  const durationFrames = Math.max(
    1,
    animation.durationSeconds * fps,
  );

  const activeFrame = animation.repeatIndefinitely
    ? frame % durationFrames
    : Math.min(frame, durationFrames);

  const progress = activeFrame / durationFrames;

  return (
    animation.from +
    (animation.to - animation.from) * progress
  );
};

const transformAnimatedSvg = ({
  svg,
  frame,
  fps,
}: {
  svg: string;
  frame: number;
  fps: number;
}): string => {
  const parser = new DOMParser();
  const document = parser.parseFromString(svg, "image/svg+xml");

  const parserError = document.querySelector("parsererror");

  if (parserError) {
    throw new Error(
      `Unable to parse AntV SVG: ${parserError.textContent ?? ""}`,
    );
  }

  const animationElements = Array.from(
    document.querySelectorAll("animate"),
  );

  if (animationElements.length === 0) {
    throw new Error(
      "Expected AntV SVG animation elements, but none were found.",
    );
  }

  for (const animationElement of animationElements) {
    const parent = animationElement.parentElement;

    if (!parent) {
      throw new Error(
        `AntV animation has no parent: ${animationElement.outerHTML}`,
      );
    }

    const attributeName =
      animationElement.getAttribute("attributeName");

    const from = Number.parseFloat(
      animationElement.getAttribute("from") ?? "",
    );

    const to = Number.parseFloat(
      animationElement.getAttribute("to") ?? "",
    );

    const durationSeconds = parseDurationSeconds(
      animationElement.getAttribute("dur") ?? "",
    );

    const repeatIndefinitely =
      animationElement.getAttribute("repeatCount") ===
      "indefinite";

    const supported =
      attributeName === "stroke-dashoffset" &&
      Number.isFinite(from) &&
      Number.isFinite(to) &&
      Number.isFinite(durationSeconds) &&
      durationSeconds > 0;

    if (!supported) {
      throw new Error(
        `Unsupported AntV animation: ${animationElement.outerHTML}`,
      );
    }

    const value = getAnimationValue({
      animation: {
        from,
        to,
        durationSeconds,
        repeatIndefinitely,
      },
      frame,
      fps,
    });

    parent.setAttribute(attributeName, String(value));
    animationElement.remove();
  }

  if (document.querySelector("animate, animateTransform")) {
    throw new Error(
      "Autonomous SVG animation remained after transformation.",
    );
  }

  return new XMLSerializer().serializeToString(
    document.documentElement,
  );
};

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

        throw error;
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
