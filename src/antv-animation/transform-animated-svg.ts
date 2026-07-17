import {evaluateSvgAnimation} from "./evaluate-animation";
import type {SupportedSvgAnimation} from "./types";

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

export const transformAnimatedSvg = ({
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
      "Expected at least one AntV SVG animation element.",
    );
  }

  for (const animationElement of animationElements) {
    const parent = animationElement.parentElement;

    if (!parent) {
      throw new Error(
        `Animation has no parent: ${animationElement.outerHTML}`,
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
        `Unsupported SVG animation: ${animationElement.outerHTML}`,
      );
    }

    const animation: SupportedSvgAnimation = {
      attributeName,
      from,
      to,
      durationSeconds,
      repeatIndefinitely,
    };

    const value = evaluateSvgAnimation({
      animation,
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
