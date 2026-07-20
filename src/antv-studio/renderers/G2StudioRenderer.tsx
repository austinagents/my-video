import React, {useEffect, useRef, useState} from "react";
import {Chart} from "@antv/g2";
import {
  formatCompatibilityError,
  validateStudioDesignCompatibility,
} from "../compatibility";
import type {G2StudioDesign, StudioContent, StudioControls} from "../types";

type Props = {
  design: G2StudioDesign;
  content: StudioContent;
  controls: StudioControls;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  onReady: () => void;
  onError: (message: string) => void;
};

export const G2StudioRenderer: React.FC<Props> = ({
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
  const chartRef = useRef<InstanceType<typeof Chart> | null>(null);
  const generationRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const compatibility = validateStudioDesignCompatibility({
      design,
      content,
      expectedEngine: "g2",
    });
    if (!compatibility.ok) {
      setErrorMessage(formatCompatibilityError(compatibility));
      onError(formatCompatibilityError(compatibility));
      return;
    }

    container.innerHTML = "";
    chartRef.current = new Chart({container, width, height, autoFit: false});

    return () => {
      generationRef.current += 1;
      chartRef.current?.destroy();
      chartRef.current = null;
      container.innerHTML = "";
    };
  }, [design.id, height, width]);

  useEffect(() => {
    const chart = chartRef.current;
    const container = containerRef.current;
    if (!chart || !container) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setErrorMessage("");

    const render = async () => {
      try {
        const compatibility = validateStudioDesignCompatibility({
          design,
          content,
          expectedEngine: "g2",
        });
        if (!compatibility.ok) {
          throw new Error(formatCompatibilityError(compatibility));
        }
        const options = design.createOptions({content, controls, width, height});
        chart.options(options);
        await chart.render();
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
