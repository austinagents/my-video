import React, {useEffect, useMemo, useRef, useState} from "react";
import {interpolate, spring} from "remotion";
import {G2StudioRenderer} from "./renderers/G2StudioRenderer";
import {G6StudioRenderer} from "./renderers/G6StudioRenderer";
import {S2StudioRenderer} from "./renderers/S2StudioRenderer";
import {getStudioLayout, type StudioFormat} from "./studio-formats";
import {studioTheme} from "./theme";
import type {AntVStudioDesign, StudioContent, StudioControls} from "./types";

type StudioZoom = "fit" | "50" | "75" | "100";

type Props = {
  format: StudioFormat;
  logicalWidth: number;
  logicalHeight: number;
  selectedDesign: AntVStudioDesign;
  editableContent: StudioContent;
  controls: StudioControls;
  currentFrame: number;
  fps: number;
  replayEpoch: number;
  ready: boolean;
  zoom: StudioZoom;
  onReady: () => void;
  onError: (message: string) => void;
};

const zoomScale = (zoom: StudioZoom, fitScale: number) => {
  if (zoom === "50") return 0.5;
  if (zoom === "75") return 0.75;
  if (zoom === "100") return 1;
  return fitScale;
};

const animationStyle = (design: AntVStudioDesign, progress: number): React.CSSProperties => {
  const eased = Math.max(0, Math.min(1, progress));
  const scale = interpolate(eased, [0, 1], [0.94, 1]);
  const opacity = interpolate(eased, [0, 0.24, 1], [0, 1, 1]);

  if (design.animation === "grow-right") {
    return {opacity, clipPath: `inset(0 ${100 - eased * 100}% 0 0)`, transform: `translateX(${(1 - eased) * -18}px)`};
  }
  if (design.animation === "grow-up" || design.animation === "row-reveal") {
    return {opacity, clipPath: `inset(${100 - eased * 100}% 0 0 0)`, transform: `translateY(${(1 - eased) * 18}px)`};
  }
  if (design.animation === "radial-reveal") {
    return {opacity, clipPath: `circle(${eased * 76}% at 50% 50%)`, transform: `scale(${scale})`};
  }
  if (design.animation === "top-down-tree") {
    return {opacity, clipPath: `inset(0 0 ${100 - eased * 100}% 0)`, transform: `translateY(${(1 - eased) * -16}px)`};
  }
  if (design.animation === "path-style-reveal") {
    return {opacity, clipPath: `inset(0 ${100 - eased * 100}% 0 0)`, transform: `scale(${scale})`};
  }
  return {opacity, transform: `scale(${scale})`};
};

export const FramepointPreviewStage: React.FC<Props> = ({
  format,
  logicalWidth,
  logicalHeight,
  selectedDesign,
  editableContent,
  controls,
  currentFrame,
  fps,
  replayEpoch,
  ready,
  zoom,
  onReady,
  onError,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({width: 1, height: 1});
  const layout = useMemo(
    () => getStudioLayout(format, logicalWidth, logicalHeight),
    [format, logicalHeight, logicalWidth],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setAvailable({width: Math.max(1, rect.width - 48), height: Math.max(1, rect.height - 48)});
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const fitScale = Math.min(available.width / logicalWidth, available.height / logicalHeight);
  const scale = zoomScale(zoom, fitScale);
  const localFrame = Math.max(0, currentFrame - replayEpoch);
  const progress = spring({frame: localFrame, fps, config: {damping: 18, stiffness: 95, mass: 0.8}});

  return (
    <section
      ref={hostRef}
      style={{
        minWidth: 0,
        minHeight: 0,
        height: "100%",
        overflow: zoom === "fit" ? "hidden" : "auto",
        display: "grid",
        placeItems: "center",
        background: "#101116",
        border: `1px solid ${studioTheme.border}`,
        borderRadius: 8,
        position: "relative",
      }}
    >
      <div
        style={{
          width: logicalWidth * scale,
          height: logicalHeight * scale,
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        <div
          data-framepoint-format={format.id}
          data-logical-width={logicalWidth}
          data-logical-height={logicalHeight}
          style={{
            width: logicalWidth,
            height: logicalHeight,
            aspectRatio: `${logicalWidth} / ${logicalHeight}`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
            background: studioTheme.canvas,
            border: `1px solid ${studioTheme.borderStrong}`,
            boxShadow: "0 26px 80px rgba(0,0,0,0.42)",
            position: "absolute",
            left: "50%",
            top: "50%",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: layout.paddingX,
              top: layout.paddingTop,
              width: layout.contentWidth,
              height: layout.titleAreaHeight,
            }}
          >
            <div style={{fontSize: layout.titleFontSize, lineHeight: 1.04, fontWeight: 900, letterSpacing: 0, color: studioTheme.text}}>
              {editableContent.title}
            </div>
            {editableContent.subtitle ? (
              <div style={{marginTop: Math.round(logicalHeight * 0.012), fontSize: layout.subtitleFontSize, lineHeight: 1.32, color: studioTheme.muted}}>
                {editableContent.subtitle}
              </div>
            ) : null}
          </div>

          <div
            data-selected-design={selectedDesign.id}
            data-engine={selectedDesign.engine}
            data-render-width={layout.contentWidth}
            data-render-height={layout.contentHeight}
            style={{
              position: "absolute",
              left: layout.contentLeft,
              top: layout.contentTop,
              width: layout.contentWidth,
              height: layout.contentHeight,
              ...animationStyle(selectedDesign, progress),
            }}
          >
            {selectedDesign.engine === "g2" ? (
              <G2StudioRenderer
                key={`${selectedDesign.id}-${format.id}`}
                design={selectedDesign}
                content={editableContent}
                controls={controls}
                width={layout.contentWidth}
                height={layout.contentHeight}
                frameWidth={logicalWidth}
                frameHeight={logicalHeight}
                onReady={onReady}
                onError={onError}
              />
            ) : selectedDesign.engine === "s2" ? (
              <S2StudioRenderer
                key={`${selectedDesign.id}-${format.id}`}
                design={selectedDesign}
                content={editableContent}
                controls={controls}
                width={layout.contentWidth}
                height={layout.contentHeight}
                frameWidth={logicalWidth}
                frameHeight={logicalHeight}
                onReady={onReady}
                onError={onError}
              />
            ) : (
              <G6StudioRenderer
                key={`${selectedDesign.id}-${format.id}`}
                design={selectedDesign}
                content={editableContent}
                controls={controls}
                width={layout.contentWidth}
                height={layout.contentHeight}
                frameWidth={logicalWidth}
                frameHeight={logicalHeight}
                onReady={onReady}
                onError={onError}
              />
            )}
          </div>

          <div style={{position: "absolute", left: layout.paddingX, top: layout.footerTop, color: studioTheme.dim, fontSize: Math.round(logicalWidth * 0.014), fontWeight: 800, textTransform: "uppercase"}}>
            {selectedDesign.engine} / {selectedDesign.category} / {format.label} {logicalWidth} x {logicalHeight}
            {ready ? " / ready" : ""}
          </div>
        </div>
      </div>
    </section>
  );
};

export type {StudioZoom};
