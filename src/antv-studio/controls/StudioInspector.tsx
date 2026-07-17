import React from "react";
import {DataEditor} from "./DataEditor";
import {inputStyle, studioTheme} from "../theme";
import type {StudioFormat} from "../studio-formats";
import type {AntVStudioDesign, StudioContent, StudioControls} from "../types";

type Props = {
  design: AntVStudioDesign;
  format: StudioFormat;
  content: StudioContent;
  controls: StudioControls;
  error?: string;
  onContent: (content: StudioContent) => void;
  onControls: (controls: StudioControls) => void;
};

export const StudioInspector: React.FC<Props> = ({
  design,
  format,
  content,
  controls,
  error,
  onContent,
  onControls,
}) => (
  <aside style={{height: "100%", overflowY: "auto", display: "grid", alignContent: "start", gap: 14, minWidth: 0}}>
    <div>
      <div style={{display: "flex", gap: 8, alignItems: "center"}}>
        <span style={{fontSize: 10, color: studioTheme.goldSoft, fontWeight: 900, textTransform: "uppercase"}}>{design.engine}</span>
        <span style={{fontSize: 11, color: studioTheme.dim}}>{design.category}</span>
      </div>
      <div style={{marginTop: 6, fontSize: 18, fontWeight: 850, color: studioTheme.text}}>{design.name}</div>
      <div style={{marginTop: 5, color: studioTheme.muted, fontSize: 12, lineHeight: 1.45}}>{design.description}</div>
      <div style={{marginTop: 7, color: studioTheme.dim, fontSize: 11}}>Sample industry: {design.industryExample}</div>
    </div>

    {error ? (
      <div style={{border: "1px solid rgba(255,158,158,0.35)", color: studioTheme.danger, background: "rgba(255,158,158,0.08)", borderRadius: 6, padding: 10, fontSize: 12}}>
        {error}
      </div>
    ) : null}

    <label style={{display: "grid", gap: 5, fontSize: 11, color: studioTheme.muted}}>
      Title
      <input value={content.title} onChange={(event) => onContent({...content, title: event.target.value})} style={inputStyle} />
    </label>

    <label style={{display: "grid", gap: 5, fontSize: 11, color: studioTheme.muted}}>
      Subtitle
      <input value={content.subtitle ?? ""} onChange={(event) => onContent({...content, subtitle: event.target.value})} style={inputStyle} />
    </label>

    <div style={{display: "grid", gap: 8}}>
      <label style={{display: "flex", justifyContent: "space-between", color: studioTheme.muted, fontSize: 12}}>
        Show labels
        <input type="checkbox" checked={controls.showLabels} onChange={(event) => onControls({...controls, showLabels: event.target.checked})} />
      </label>
      <label style={{display: "flex", justifyContent: "space-between", color: studioTheme.muted, fontSize: 12}}>
        Show legend
        <input type="checkbox" checked={controls.showLegend} onChange={(event) => onControls({...controls, showLegend: event.target.checked})} />
      </label>
      <label style={{display: "flex", justifyContent: "space-between", color: studioTheme.muted, fontSize: 12}}>
        Compact spacing
        <input type="checkbox" checked={controls.compact} onChange={(event) => onControls({...controls, compact: event.target.checked})} />
      </label>
    </div>

    <DataEditor design={design} content={content} onChange={onContent} />

    <details style={{border: `1px solid ${studioTheme.border}`, borderRadius: 7, padding: 10}}>
      <summary style={{cursor: "pointer", color: studioTheme.goldSoft, fontSize: 12, fontWeight: 800}}>Framepoint definition</summary>
      <pre style={{whiteSpace: "pre-wrap", color: studioTheme.muted, fontSize: 10, lineHeight: 1.45, overflowX: "auto"}}>
        {JSON.stringify({
          id: design.id,
          engine: design.engine,
          name: design.name,
          category: design.category,
          format: {
            id: format.id,
            width: format.width,
            height: format.height,
            aspectRatio: format.aspectRatio,
          },
          content,
        }, null, 2)}
      </pre>
    </details>
  </aside>
);
