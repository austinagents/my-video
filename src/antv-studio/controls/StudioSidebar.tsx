import React from "react";
import {Search} from "lucide-react";
import {categories} from "../registry";
import {inputStyle, studioTheme} from "../theme";
import type {AntVEngine, AntVStudioDesign} from "../types";

type Props = {
  designs: AntVStudioDesign[];
  selectedId: string;
  search: string;
  engine: AntVEngine | "all";
  category: string;
  failedIds: Set<string>;
  onSearch: (value: string) => void;
  onEngine: (value: AntVEngine | "all") => void;
  onCategory: (value: string) => void;
  onSelect: (id: string) => void;
};

const engines: Array<AntVEngine | "all"> = ["all", "g2", "s2", "g6"];

export const StudioSidebar: React.FC<Props> = ({
  designs,
  selectedId,
  search,
  engine,
  category,
  failedIds,
  onSearch,
  onEngine,
  onCategory,
  onSelect,
}) => (
  <aside style={{height: "100%", display: "flex", flexDirection: "column", gap: 14, minWidth: 0}}>
    <div>
      <div style={{fontSize: 20, fontWeight: 800, color: studioTheme.text}}>AntV Design Studio</div>
      <div style={{marginTop: 3, fontSize: 11, color: studioTheme.muted}}>50 Framepoint-ready visual proofs</div>
    </div>

    <label style={{position: "relative", display: "block"}}>
      <Search size={14} style={{position: "absolute", left: 10, top: 10, color: studioTheme.dim}} />
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search designs"
        style={{...inputStyle, paddingLeft: 30}}
      />
    </label>

    <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6}}>
      {engines.map((item) => (
        <button
          key={item}
          onClick={() => onEngine(item)}
          style={{
            border: `1px solid ${engine === item ? studioTheme.gold : studioTheme.border}`,
            background: engine === item ? "rgba(216,173,85,0.18)" : "#11100d",
            color: engine === item ? studioTheme.goldSoft : studioTheme.muted,
            borderRadius: 6,
            padding: "8px 0",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {item}
        </button>
      ))}
    </div>

    <select value={category} onChange={(event) => onCategory(event.target.value)} style={inputStyle}>
      <option value="all">All categories</option>
      {categories.map((item) => (
        <option key={item} value={item}>{item}</option>
      ))}
    </select>

    <div style={{fontSize: 11, color: studioTheme.dim}}>{designs.length} visible / 50 total</div>

    <div style={{overflowY: "auto", flex: 1, paddingRight: 4}}>
      {designs.map((design) => {
        const selected = selectedId === design.id;
        const failed = failedIds.has(design.id);
        return (
          <button
            key={design.id}
            onClick={() => onSelect(design.id)}
            style={{
              width: "100%",
              textAlign: "left",
              display: "grid",
              gridTemplateColumns: "34px 1fr",
              gap: 9,
              border: `1px solid ${selected ? studioTheme.gold : failed ? "rgba(255,158,158,0.4)" : studioTheme.border}`,
              background: selected ? "rgba(216,173,85,0.12)" : "#11100d",
              color: studioTheme.text,
              borderRadius: 8,
              padding: 9,
              marginBottom: 7,
              cursor: "pointer",
            }}
          >
            <span style={{
              alignSelf: "center",
              justifySelf: "center",
              borderRadius: 5,
              padding: "4px 5px",
              background: failed ? "rgba(255,158,158,0.14)" : "rgba(216,173,85,0.16)",
              color: failed ? studioTheme.danger : studioTheme.goldSoft,
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
            }}>
              {design.engine}
            </span>
            <span style={{minWidth: 0}}>
              <span style={{display: "block", fontSize: 12, fontWeight: 750, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
                {design.name}
              </span>
              <span style={{display: "block", marginTop: 2, color: failed ? studioTheme.danger : studioTheme.dim, fontSize: 10}}>
                {failed ? "Render failed" : design.category}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  </aside>
);

