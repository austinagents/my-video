import React, {useEffect, useRef, useState} from "react";
import {Infographic} from "@antv/infographic";

type Example = {
  name: string;
  syntax: string;
};

const examples: Example[] = [
  {
    name: "Timeline",
    syntax: `
infographic sequence-timeline-simple

data
  title Customer Journey
  lists
    - label Awareness
      desc Discover the brand
    - label Consideration
      desc Compare possible solutions
    - label Conversion
      desc Take the first action
    - label Retention
      desc Build repeat behavior
`,
  },
  {
    name: "Funnel",
    syntax: `
infographic sequence-funnel-simple

data
  title Marketing Funnel
  lists
    - label Awareness
      desc Reach the audience
    - label Interest
      desc Build curiosity
    - label Intent
      desc Create desire
    - label Conversion
      desc Drive action
`,
  },
  {
    name: "Comparison",
    syntax: `
infographic compare-binary-horizontal-simple-vs

data
  title Organic vs Paid Growth
  left
    label Organic
    desc Compounds over time
  right
    label Paid
    desc Produces immediate reach
`,
  },
  {
    name: "Circular Process",
    syntax: `
infographic sequence-circle-arrows-indexed-card

data
  title Content Growth Loop
  lists
    - label Research
      desc Find audience demand
    - label Create
      desc Build useful content
    - label Publish
      desc Distribute consistently
    - label Learn
      desc Improve from feedback
`,
  },
  {
    name: "Hierarchy",
    syntax: `
infographic hierarchy-tree-curved-line-rounded-rect-node

data
  title Marketing System
  root
    label Strategy
    children
      - label Audience
        children
          - label Needs
          - label Behaviors
      - label Offer
        children
          - label Value
          - label Positioning
      - label Distribution
        children
          - label Organic
          - label Paid
`,
  },
  {
    name: "Network",
    syntax: `
infographic relation-network-icon-badge

data
  title Marketing Ecosystem
  lists
    - label Brand
      desc Central identity
    - label Customer
      desc Audience demand
    - label Content
      desc Communication
    - label Product
      desc Delivered value
    - label Channel
      desc Distribution
`,
  },
];

const Preview: React.FC<{example: Example}> = ({example}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";

    const infographic = new Infographic({
      container: ref.current,
      width: 920,
      height: 520,
    });

    infographic.render(example.syntax);

    return () => {
      infographic.destroy?.();
    };
  }, [example]);

  return (
    <div
      ref={ref}
      style={{
        width: 920,
        height: 520,
      }}
    />
  );
};

export const AntVGallery: React.FC = () => {
  const [index, setIndex] = useState(0);
  const example = examples[index];

  return (
    <div
      style={{
        width: 1100,
        height: 690,
        background: "white",
        borderRadius: 30,
        boxShadow: "0 35px 100px rgba(17, 31, 54, 0.18)",
        padding: 28,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#142235",
            }}
          >
            {example.name}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 17,
              color: "#738197",
            }}
          >
            Template {index + 1} of {examples.length}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <button
            onClick={() =>
              setIndex((current) =>
                current === 0 ? examples.length - 1 : current - 1
              )
            }
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            Previous
          </button>

          <button
            onClick={() =>
              setIndex((current) => (current + 1) % examples.length)
            }
            style={{
              border: "none",
              borderRadius: 12,
              padding: "12px 18px",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "#e7ebf0",
          marginBottom: 12,
        }}
      />

      <Preview example={example} />
    </div>
  );
};
