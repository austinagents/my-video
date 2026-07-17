const nativeAnimationSelector =
  "animate, animateTransform, animateMotion, set";

const parseSvgLength = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const hasUsableViewBox = (svg: SVGSVGElement): boolean => {
  const viewBox = svg.getAttribute("viewBox");

  if (!viewBox) {
    return false;
  }

  const [, , width, height] = viewBox
    .trim()
    .split(/[\s,]+/)
    .map(Number);

  return (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  );
};

export const prepareStaticSvg = (svg: SVGSVGElement): string => {
  svg.querySelectorAll(nativeAnimationSelector).forEach((element) => {
    element.remove();
  });

  if (!hasUsableViewBox(svg)) {
    const width = parseSvgLength(svg.getAttribute("width"));
    const height = parseSvgLength(svg.getAttribute("height"));

    if (width && height) {
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
  }

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "100%";

  return svg.outerHTML;
};

