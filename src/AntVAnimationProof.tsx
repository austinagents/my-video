import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {RotateCcw, RefreshCw} from "lucide-react";
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from "remotion";
import {FramepointPreviewStage, type StudioZoom} from "./antv-studio/FramepointPreviewStage";
import {StudioInspector} from "./antv-studio/controls/StudioInspector";
import {StudioSidebar} from "./antv-studio/controls/StudioSidebar";
import {antVStudioDesigns, validateRegistry} from "./antv-studio/registry";
import {cloneContent} from "./antv-studio/sample-content";
import {STUDIO_FORMATS, STUDIO_FORMAT_ORDER, type StudioFormatId} from "./antv-studio/studio-formats";
import {defaultControls, studioTheme} from "./antv-studio/theme";
import type {AntVEngine, AntVStudioDesign, StudioContent, StudioControls} from "./antv-studio/types";

const designMatches = (
  design: AntVStudioDesign,
  search: string,
  engine: AntVEngine | "all",
  category: string,
) => {
  const haystack = `${design.name} ${design.category} ${design.description} ${design.industryExample}`.toLowerCase();
  return (
    haystack.includes(search.toLowerCase()) &&
    (engine === "all" || design.engine === engine) &&
    (category === "all" || design.category === category)
  );
};

const toolbarButton = (active = false): React.CSSProperties => ({
  border: `1px solid ${active ? studioTheme.gold : studioTheme.border}`,
  background: active ? "rgba(216,173,85,0.17)" : "#11100d",
  color: active ? studioTheme.goldSoft : studioTheme.muted,
  borderRadius: 7,
  padding: "8px 10px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
});

export const AntVAnimationProof: React.FC<{initialDesignId?: string}> = ({initialDesignId}) => {
  const registryErrors = useMemo(() => validateRegistry(), []);
  const first =
    antVStudioDesigns.find((design) => design.id === initialDesignId) ??
    antVStudioDesigns[0];
  const [selectedId, setSelectedId] = useState(first.id);
  const selected = antVStudioDesigns.find((design) => design.id === selectedId) ?? first;
  const [content, setContent] = useState<StudioContent>(() => cloneContent(selected.defaultContent));
  const [controls, setControls] = useState<StudioControls>(defaultControls);
  const [search, setSearch] = useState("");
  const [engine, setEngine] = useState<AntVEngine | "all">("all");
  const [category, setCategory] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [readyIds, setReadyIds] = useState<Set<string>>(() => new Set());
  const [formatId, setFormatId] = useState<StudioFormatId>("portrait");
  const [zoom, setZoom] = useState<StudioZoom>("fit");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [replayEpoch, setReplayEpoch] = useState(0);
  const [initialHandle] = useState(() => delayRender("Loading AntV studio proof"));
  const initialResolvedRef = useRef(false);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const format = STUDIO_FORMATS[formatId];

  useEffect(() => {
    setContent(cloneContent(selected.defaultContent));
    setControls(defaultControls);
  }, [selected.defaultContent, selected.id]);

  const visibleDesigns = useMemo(
    () => antVStudioDesigns.filter((design) => designMatches(design, search, engine, category)),
    [category, engine, search],
  );

  useEffect(() => {
    if (!visibleDesigns.some((design) => design.id === selectedId) && visibleDesigns[0]) {
      setSelectedId(visibleDesigns[0].id);
    }
  }, [selectedId, visibleDesigns]);

  const markReady = useCallback(() => {
    if (!initialResolvedRef.current) {
      initialResolvedRef.current = true;
      continueRender(initialHandle);
    }
    setReadyIds((current) => new Set(current).add(selected.id));
    setErrors((current) => {
      const next = {...current};
      delete next[selected.id];
      return next;
    });
  }, [initialHandle, selected.id]);

  const markError = useCallback((message: string) => {
    if (!initialResolvedRef.current) {
      initialResolvedRef.current = true;
      continueRender(initialHandle);
    }
    setErrors((current) => ({...current, [selected.id]: message}));
  }, [initialHandle, selected.id]);

  const failedIds = useMemo(() => new Set(Object.keys(errors)), [errors]);
  const resetSelected = useCallback(() => {
    setContent(cloneContent(selected.defaultContent));
    setControls(defaultControls);
  }, [selected.defaultContent]);

  return (
    <AbsoluteFill
      style={{
        background: studioTheme.page,
        color: studioTheme.text,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 0,
        }}
      >
        <header
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            background: studioTheme.panel,
            border: `1px solid ${studioTheme.border}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <div style={{minWidth: 0}}>
            <div style={{fontSize: 18, fontWeight: 900, color: studioTheme.text}}>AntV Design Studio</div>
            <div style={{marginTop: 2, fontSize: 11, color: studioTheme.dim}}>Exact Framepoint output workspace</div>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 108px)", gap: 7}}>
            {STUDIO_FORMAT_ORDER.map((id) => {
              const item = STUDIO_FORMATS[id];
              return (
                <button key={id} onClick={() => setFormatId(id)} style={{...toolbarButton(formatId === id), display: "grid", gap: 2}}>
                  <span>{item.label}</span>
                  <span style={{fontSize: 10, color: formatId === id ? studioTheme.goldSoft : studioTheme.dim}}>
                    {item.width} x {item.height}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{display: "flex", gap: 7}}>
            <button onClick={() => setReplayEpoch(frame)} style={toolbarButton()}>
              <RefreshCw size={14} /> Replay
            </button>
            <button onClick={resetSelected} style={toolbarButton()}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div style={{display: "flex", gap: 7}}>
            {(["fit", "50", "75", "100"] as StudioZoom[]).map((item) => (
              <button key={item} onClick={() => setZoom(item)} style={toolbarButton(zoom === item)}>
                {item === "fit" ? "Fit" : `${item}%`}
              </button>
            ))}
          </div>

          <div style={{display: "grid", gap: 4, justifyItems: "end", minWidth: 170, flex: "1 1 170px"}}>
            <div style={{display: "flex", gap: 7, alignItems: "center", maxWidth: "100%"}}>
              <button onClick={() => setLeftOpen((value) => !value)} style={toolbarButton(leftOpen)}>
                Designs
              </button>
              <button onClick={() => setRightOpen((value) => !value)} style={toolbarButton(rightOpen)}>
                Inspector
              </button>
              <span style={{
                border: `1px solid ${studioTheme.borderStrong}`,
                borderRadius: 999,
                padding: "5px 8px",
                color: studioTheme.goldSoft,
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
              }}>
                {selected.engine}
              </span>
            </div>
            <div style={{maxWidth: "100%", color: studioTheme.muted, fontSize: 12, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
              {selected.name}
            </div>
          </div>
        </header>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: `${leftOpen ? "240px" : "0px"} minmax(0, 1fr) ${rightOpen ? "320px" : "0px"}`,
            gap: leftOpen || rightOpen ? 12 : 0,
            transition: "grid-template-columns 160ms ease",
          }}
        >
          <div style={{minWidth: 0, minHeight: 0, overflow: "hidden", opacity: leftOpen ? 1 : 0, pointerEvents: leftOpen ? "auto" : "none"}}>
            <div style={{height: "100%", background: studioTheme.panel, border: `1px solid ${studioTheme.border}`, borderRadius: 8, padding: 14, boxSizing: "border-box", minHeight: 0}}>
              <StudioSidebar
                designs={visibleDesigns}
                selectedId={selected.id}
                search={search}
                engine={engine}
                category={category}
                failedIds={failedIds}
                onSearch={setSearch}
                onEngine={setEngine}
                onCategory={setCategory}
                onSelect={setSelectedId}
              />
            </div>
          </div>

          <FramepointPreviewStage
            format={format}
            logicalWidth={format.width}
            logicalHeight={format.height}
            selectedDesign={selected}
            editableContent={content}
            controls={controls}
            currentFrame={frame}
            fps={fps}
            replayEpoch={replayEpoch}
            ready={readyIds.has(selected.id)}
            zoom={zoom}
            onReady={markReady}
            onError={markError}
          />

          <div style={{minWidth: 0, minHeight: 0, overflow: "hidden", opacity: rightOpen ? 1 : 0, pointerEvents: rightOpen ? "auto" : "none"}}>
            <div style={{height: "100%", background: studioTheme.panel, border: `1px solid ${studioTheme.border}`, borderRadius: 8, padding: 14, boxSizing: "border-box", minHeight: 0}}>
              {registryErrors.length > 0 ? (
                <div style={{color: studioTheme.danger, fontSize: 12, marginBottom: 10}}>
                  {registryErrors.join(" ")}
                </div>
              ) : null}
              <StudioInspector
                design={selected}
                format={format}
                content={content}
                controls={controls}
                error={errors[selected.id]}
                onContent={setContent}
                onControls={setControls}
              />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
