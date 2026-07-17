import React from "react";
import {AntVBlock} from "./AntVBlock";
import type {StudioBlock, StudioProject} from "./project";

type BoardProps = {
  project: StudioProject;
  selectedBlockId?: string | null;
  activeBlockId?: string | null;
  dimInactive?: boolean;
  interactive?: boolean;
  onSelectBlock?: (id: string) => void;
  onStartDrag?: (
    event: React.PointerEvent<HTMLDivElement>,
    block: StudioBlock,
  ) => void;
};

export const Board: React.FC<BoardProps> = ({
  project,
  selectedBlockId = null,
  activeBlockId = null,
  dimInactive = false,
  interactive = false,
  onSelectBlock,
  onStartDrag,
}) => {
  return (
    <div
      onClick={() => onSelectBlock?.("")}
      style={{
        position: "relative",
        width: 1000,
        height: 640,
        background: "#ffffff",
        borderRadius: 8,
        color: "#111827",
        overflow: "hidden",
        boxShadow: "0 30px 90px rgba(0,0,0,.25)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 27,
          left: 0,
          right: 0,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 950,
            letterSpacing: 1.2,
          }}
        >
          {project.title}
        </div>

        <div
          style={{
            fontSize: 16,
            color: "#647084",
            marginTop: 8,
          }}
        >
          {project.subtitle}
        </div>
      </div>

      {project.blocks.map((block) => {
        const selected = selectedBlockId === block.id;

        const dimmed =
          dimInactive &&
          activeBlockId !== null &&
          block.id !== activeBlockId;

        return (
          <div
            key={block.id}
            onClick={(event) => {
              event.stopPropagation();
              onSelectBlock?.(block.id);
            }}
            onPointerDown={(event) => {
              if (!interactive) return;
              onStartDrag?.(event, block);
            }}
            style={{
              position: "absolute",
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              boxSizing: "border-box",
              borderRadius:
                block.designPreset === "technical" ? 4 : 10,
              border: selected
                ? "2px solid #3474ed"
                : "1px solid transparent",
              background: "#ffffff",
              boxShadow:
                block.designPreset === "hero"
                  ? "0 12px 28px rgba(35,55,90,.12)"
                  : "none",
              cursor: interactive ? "grab" : "default",
              userSelect: "none",
              opacity: dimmed ? 0.16 : 1,
              filter: dimmed ? "saturate(.45)" : "none",
              transition:
                "opacity 180ms ease, filter 180ms ease, border-color 120ms ease",
              overflow: "hidden",
              touchAction: "none",
            }}
          >
            <AntVBlock block={block} />

            {selected
              ? [
                  [-5, -5],
                  ["calc(50% - 5px)", -5],
                  ["calc(100% - 5px)", -5],
                  [-5, "calc(100% - 5px)"],
                  ["calc(50% - 5px)", "calc(100% - 5px)"],
                  ["calc(100% - 5px)", "calc(100% - 5px)"],
                ].map(([left, top], index) => (
                  <span
                    key={index}
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      border: "2px solid #3474ed",
                      background: "#ffffff",
                      pointerEvents: "none",
                    }}
                  />
                ))
              : null}
          </div>
        );
      })}
    </div>
  );
};
