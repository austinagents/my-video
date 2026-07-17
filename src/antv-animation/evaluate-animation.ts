import type {SupportedSvgAnimation} from "./types";

export const evaluateSvgAnimation = ({
  animation,
  frame,
  fps,
}: {
  animation: SupportedSvgAnimation;
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
