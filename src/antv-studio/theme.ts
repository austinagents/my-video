import type React from "react";
import type {StudioControls} from "./types";

export const STAGE_WIDTH = 720;
export const STAGE_HEIGHT = 1080;

export const studioTheme = {
  page: "#0e0d0a",
  panel: "#15130f",
  panelSoft: "#1d1a14",
  border: "rgba(223, 190, 122, 0.18)",
  borderStrong: "rgba(223, 190, 122, 0.36)",
  text: "#f5efe3",
  muted: "#b8ab95",
  dim: "#827866",
  gold: "#d8ad55",
  goldSoft: "#f0cf82",
  danger: "#ff9e9e",
  canvas: "#11100d",
  grid: "rgba(245, 239, 227, 0.11)",
  palette: ["#d8ad55", "#7ca982", "#8aa6c8", "#c98274", "#b79ad6", "#d2c6ad"],
};

export const defaultControls: StudioControls = {
  showLabels: true,
  showLegend: true,
  compact: false,
  orientation: "portrait",
};

export const chartPadding = {
  top: 20,
  right: 32,
  bottom: 54,
  left: 70,
};

export const compactChartPadding = {
  top: 12,
  right: 22,
  bottom: 42,
  left: 54,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: `1px solid ${studioTheme.border}`,
  background: "#0f0e0b",
  color: studioTheme.text,
  borderRadius: 6,
  padding: "9px 10px",
  fontSize: 12,
  outline: "none",
};
