import React, {useEffect, useRef, useState} from "react";
import {TableSheet} from "@antv/s2";
import {defaultControls} from "../theme";
import {cloneContent} from "../sample-content";
import type {S2StudioDesign, StudioContent, StudioControls} from "../types";

type Props = {
  design: S2StudioDesign;
  content: StudioContent;
  controls: StudioControls;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  onReady: () => void;
  onError: (message: string) => void;
};

export const S2StudioRenderer: React.FC<Props> = ({
  design,
  content,
  controls,
  width,
  height,
  frameWidth,
  frameHeight,
  onReady,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<TableSheet | null>(null);
  const generationRef = useRef(0);
  const [message, setMessage] = useState("Loading S2 table");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const config = design.createSheetConfig({
      content: cloneContent(design.defaultContent),
      controls: defaultControls,
      width,
      height,
    });
    sheetRef.current = new TableSheet(container, config.dataCfg, config.options);

    return () => {
      generationRef.current += 1;
      sheetRef.current?.destroy();
      sheetRef.current = null;
      container.innerHTML = "";
    };
  }, [design, height, width]);

  useEffect(() => {
    const sheet = sheetRef.current;
    const container = containerRef.current;
    if (!sheet || !container) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setMessage("Loading S2 table");

    const render = async () => {
      try {
        const config = design.createSheetConfig({content, controls, width, height});
        sheet.setDataCfg(config.dataCfg, true);
        sheet.setOptions(config.options, true);
        await sheet.render(true);
        if (generationRef.current !== generation) return;
        if (!container.querySelector("canvas")) {
          throw new Error(`${design.name} rendered without a canvas root.`);
        }
        setMessage("");
        onReady();
      } catch (error) {
        if (generationRef.current !== generation) return;
        const text = error instanceof Error ? error.message : String(error);
        setMessage(text);
        onError(text);
      }
    };

    void render();
  }, [content, controls, design, height, onError, onReady, width]);

  return (
    <div
      data-frame-width={frameWidth}
      data-frame-height={frameHeight}
      style={{position: "relative", width, height}}
    >
      {message ? (
        <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#b8ab95", fontSize: 13}}>
          {message}
        </div>
      ) : null}
      <div ref={containerRef} style={{width, height}} />
    </div>
  );
};
