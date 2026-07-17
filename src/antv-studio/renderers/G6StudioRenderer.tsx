import React, {useEffect, useRef, useState} from "react";
import {Graph} from "@antv/g6";
import {defaultControls} from "../theme";
import {cloneContent} from "../sample-content";
import type {G6StudioDesign, StudioContent, StudioControls} from "../types";

type Props = {
  design: G6StudioDesign;
  content: StudioContent;
  controls: StudioControls;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  onReady: () => void;
  onError: (message: string) => void;
};

export const G6StudioRenderer: React.FC<Props> = ({
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
  const graphRef = useRef<Graph | null>(null);
  const generationRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const config = design.createGraphConfig({
      content: cloneContent(design.defaultContent),
      controls: defaultControls,
      width,
      height,
    });
    graphRef.current = new Graph({...config, container});

    return () => {
      generationRef.current += 1;
      graphRef.current?.destroy();
      graphRef.current = null;
      container.innerHTML = "";
    };
  }, [design, height, width]);

  useEffect(() => {
    const graph = graphRef.current;
    const container = containerRef.current;
    if (!graph || !container) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setErrorMessage("");

    const render = async () => {
      try {
        const config = design.createGraphConfig({content, controls, width, height});
        graph.setData(config.data ?? {});
        await graph.render();
        if (generationRef.current !== generation) return;
        if (!container.querySelector("canvas,svg")) {
          throw new Error(`${design.name} rendered without a canvas or SVG root.`);
        }
        setErrorMessage("");
        onReady();
      } catch (error) {
        if (generationRef.current !== generation) return;
        const text = error instanceof Error ? error.message : String(error);
        setErrorMessage(text);
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
      {errorMessage ? (
        <div style={{position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#ff9e9e", fontSize: 13}}>
          {errorMessage}
        </div>
      ) : null}
      <div ref={containerRef} style={{width, height}} />
    </div>
  );
};
