import React, {useEffect, useRef} from "react";
import {Infographic} from "@antv/infographic";

const syntax = `
infographic list-row-simple-horizontal-arrow

data
  title Marketing Flow
  lists
    - label Research
      desc Understand the audience and market
    - label Positioning
      desc Define the value and message
    - label Distribution
      desc Reach customers through the right channels
    - label Conversion
      desc Turn attention into action
`;

export const AntVBoard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const infographic = new Infographic({
      container: containerRef.current,
      width: 1400,
      height: 760,
    });

    infographic.render(syntax);

    return () => {
      infographic.destroy?.();
    };
  }, []);

  return (
    <div
      style={{
        width: 1400,
        height: 760,
        background: "white",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 36px 100px rgba(0,0,0,0.18)",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
