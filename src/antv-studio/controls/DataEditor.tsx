import React from "react";
import {Plus, Trash2} from "lucide-react";
import {inputStyle, studioTheme} from "../theme";
import type {AntVStudioDesign, StudioContent} from "../types";

type Props = {
  design: AntVStudioDesign;
  content: StudioContent;
  onChange: (content: StudioContent) => void;
};

const clampNumber = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(-9999, Math.min(9999, parsed));
};

export const DataEditor: React.FC<Props> = ({design, content, onChange}) => {
  const updateRow = (index: number, key: "label" | "value", value: string) => {
    const rows = content.rows.map((row, rowIndex) =>
      rowIndex === index ? {...row, [key]: key === "value" ? clampNumber(value) : value} : row,
    );
    onChange({...content, rows});
  };

  const updateNode = (index: number, label: string) => {
    const nodes = (content.nodes ?? []).map((node, nodeIndex) =>
      nodeIndex === index ? {...node, label} : node,
    );
    onChange({...content, nodes});
  };

  const addRow = () => {
    onChange({
      ...content,
      rows: [...content.rows, {id: `item-${Date.now()}`, label: "New item", value: 10}],
    });
  };

  const removeRow = (index: number) => {
    if (content.rows.length <= 2) return;
    onChange({...content, rows: content.rows.filter((_, rowIndex) => rowIndex !== index)});
  };

  return (
    <div style={{display: "grid", gap: 10}}>
      <div style={{fontSize: 12, fontWeight: 800, color: studioTheme.text}}>
        {design.engine === "g6" ? "Node Labels" : "Data Items"}
      </div>

      {design.engine === "g6"
        ? (content.nodes ?? []).map((node, index) => (
            <input
              key={node.id}
              value={node.label}
              onChange={(event) => updateNode(index, event.target.value)}
              style={inputStyle}
            />
          ))
        : content.rows.map((row, index) => (
            <div key={row.id} style={{display: "grid", gridTemplateColumns: "1fr 72px 28px", gap: 6}}>
              <input value={row.label} onChange={(event) => updateRow(index, "label", event.target.value)} style={inputStyle} />
              <input type="number" value={row.value} onChange={(event) => updateRow(index, "value", event.target.value)} style={inputStyle} />
              <button
                onClick={() => removeRow(index)}
                title="Remove item"
                style={{
                  border: `1px solid ${studioTheme.border}`,
                  background: "#11100d",
                  color: studioTheme.muted,
                  borderRadius: 6,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

      {design.engine !== "g6" && design.supportsAddRemove ? (
        <button
          onClick={addRow}
          style={{
            border: `1px solid ${studioTheme.borderStrong}`,
            background: "rgba(216,173,85,0.1)",
            color: studioTheme.goldSoft,
            borderRadius: 6,
            padding: "9px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          <Plus size={14} /> Add item
        </button>
      ) : null}
    </div>
  );
};

