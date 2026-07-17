export type StudioFormatId = "portrait" | "square" | "vertical";

export type StudioFormat = {
  id: StudioFormatId;
  label: string;
  width: number;
  height: number;
  aspectRatio: number;
};

export const STUDIO_FORMATS = {
  portrait: {
    id: "portrait",
    label: "Portrait",
    width: 1080,
    height: 1350,
    aspectRatio: 4 / 5,
  },
  square: {
    id: "square",
    label: "Square",
    width: 1080,
    height: 1080,
    aspectRatio: 1,
  },
  vertical: {
    id: "vertical",
    label: "Vertical",
    width: 1080,
    height: 1920,
    aspectRatio: 9 / 16,
  },
} as const satisfies Record<StudioFormatId, StudioFormat>;

export const STUDIO_FORMAT_ORDER: StudioFormatId[] = ["portrait", "square", "vertical"];

export type StudioLayout = {
  width: number;
  height: number;
  paddingX: number;
  paddingTop: number;
  paddingBottom: number;
  titleAreaHeight: number;
  titleFontSize: number;
  subtitleFontSize: number;
  contentLeft: number;
  contentTop: number;
  contentWidth: number;
  contentHeight: number;
  footerTop: number;
  footerHeight: number;
  labelScale: number;
  tableDensity: "compact" | "standard" | "spacious";
  graphSpacing: {
    nodeGap: number;
    rankGap: number;
    radialRadius: number;
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getStudioLayout = (
  format: StudioFormat,
  width = format.width,
  height = format.height,
): StudioLayout => {
  const isSquare = format.id === "square";
  const isVertical = format.id === "vertical";
  const paddingX = Math.round(width * (isSquare ? 0.075 : 0.07));
  const paddingTop = Math.round(height * (isVertical ? 0.055 : 0.065));
  const paddingBottom = Math.round(height * (isVertical ? 0.052 : 0.06));
  const titleAreaHeight = Math.round(height * (isSquare ? 0.17 : isVertical ? 0.135 : 0.16));
  const footerHeight = Math.round(height * 0.045);
  const contentTop = paddingTop + titleAreaHeight;
  const footerTop = height - paddingBottom - footerHeight;
  const contentHeight = Math.max(320, footerTop - contentTop - Math.round(height * 0.025));
  const contentWidth = width - paddingX * 2;
  const titleFontSize = clamp(Math.round(width * (isVertical ? 0.049 : isSquare ? 0.048 : 0.052)), 44, 58);
  const subtitleFontSize = clamp(Math.round(width * 0.022), 21, 28);

  return {
    width,
    height,
    paddingX,
    paddingTop,
    paddingBottom,
    titleAreaHeight,
    titleFontSize,
    subtitleFontSize,
    contentLeft: paddingX,
    contentTop,
    contentWidth,
    contentHeight,
    footerTop,
    footerHeight,
    labelScale: isVertical ? 1.05 : isSquare ? 0.96 : 1,
    tableDensity: isVertical ? "spacious" : isSquare ? "compact" : "standard",
    graphSpacing: {
      nodeGap: Math.round(width * (isSquare ? 0.06 : 0.052)),
      rankGap: Math.round(height * (isVertical ? 0.07 : 0.055)),
      radialRadius: Math.round(Math.min(width, height) * (isSquare ? 0.31 : 0.28)),
    },
  };
};
