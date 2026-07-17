import React from "react";
import {
  AlignHorizontalSpaceAround,
  BarChart3,
  Blocks,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CirclePlay,
  Clock3,
  Copy,
  Crosshair,
  Crown,
  Eye,
  Funnel,
  GitCompareArrows,
  Goal,
  Grid2X2,
  Group,
  Info,
  LayoutGrid,
  ListTree,
  Maximize,
  MousePointer2,
  MoveUpRight,
  Network,
  PanelTop,
  PieChart,
  Plus,
  Redo2,
  Search,
  Settings,
  Shapes,
  Sparkles,
  Target,
  Trash2,
  Undo2,
  WandSparkles,
  Waypoints,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {AbsoluteFill} from "remotion";

const palette = {
  app: "#090d13",
  panel: "#11161e",
  panel2: "#151b24",
  panel3: "#1a212b",
  border: "#252d38",
  mutedBorder: "#202731",
  text: "#f7f8fb",
  muted: "#939cab",
  purple: "#7655f6",
  purpleLight: "#9c82ff",
  blue: "#2966d9",
  cyan: "#1da5a8",
  orange: "#ef7a35",
  gold: "#e8a63f",
  green: "#36c89a",
  red: "#e95a52",
};

type IconType = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  color?: string;
}>;

const IconButton: React.FC<{
  icon: IconType;
  label?: string;
  active?: boolean;
  danger?: boolean;
}> = ({icon: Icon, label, active, danger}) => (
  <div
    style={{
      minWidth: label ? 50 : 36,
      height: 48,
      padding: label ? "0 7px" : 0,
      borderRadius: 8,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      color: danger
        ? palette.red
        : active
          ? palette.text
          : palette.muted,
      background: active ? "#1d242e" : "transparent",
    }}
  >
    <Icon size={19} strokeWidth={1.8} />
    {label ? (
      <span style={{fontSize: 10, lineHeight: 1}}>{label}</span>
    ) : null}
  </div>
);

const MiniDiagram: React.FC<{type: string}> = ({type}) => {
  if (type === "timeline") {
    return (
      <div style={{display: "flex", alignItems: "center", width: 88}}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: palette.blue,
          }}
        />
        <span style={{height: 2, width: 18, background: "#586477"}} />
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: palette.cyan,
          }}
        />
        <span style={{height: 2, width: 18, background: "#586477"}} />
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: palette.orange,
          }}
        />
        <span style={{height: 2, width: 18, background: "#586477"}} />
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 99,
            background: palette.purple,
          }}
        />
      </div>
    );
  }

  if (type === "funnel") {
    return (
      <div style={{display: "flex", flexDirection: "column", gap: 2}}>
        {[68, 54, 40, 25].map((width, index) => (
          <div
            key={width}
            style={{
              width,
              height: 10,
              clipPath: "polygon(8% 0, 92% 0, 82% 100%, 18% 100%)",
              background: [
                palette.gold,
                palette.cyan,
                palette.blue,
                palette.purple,
              ][index],
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "compare") {
    return (
      <div style={{display: "flex", alignItems: "center", gap: 7}}>
        <div
          style={{
            width: 29,
            height: 29,
            borderRadius: 5,
            background: palette.blue,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
          }}
        >
          A
        </div>
        <span style={{fontSize: 11, color: palette.muted}}>VS</span>
        <div
          style={{
            width: 29,
            height: 29,
            borderRadius: 5,
            background: palette.cyan,
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
          }}
        >
          B
        </div>
      </div>
    );
  }

  if (type === "donut") {
    return (
      <div
        style={{
          width: 55,
          height: 55,
          borderRadius: "50%",
          background:
            "conic-gradient(#2865d8 0 34%, #19a3a6 34% 61%, #e3a241 61% 78%, #7655f6 78% 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: "50%",
            background: palette.panel3,
          }}
        />
      </div>
    );
  }

  if (type === "hierarchy") {
    return (
      <div style={{width: 76, height: 50, position: "relative"}}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 28,
            width: 22,
            height: 15,
            borderRadius: 3,
            background: palette.blue,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 15,
            width: 2,
            height: 12,
            background: "#667183",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 26,
            width: 54,
            height: 2,
            background: "#667183",
          }}
        />
        {[4, 29, 54].map((left, index) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left,
              top: 28,
              width: 19,
              height: 14,
              borderRadius: 3,
              background: [palette.purple, palette.blue, palette.cyan][index],
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "process") {
    return (
      <div style={{display: "flex", alignItems: "center", gap: 3}}>
        {[palette.cyan, palette.blue, palette.gold, palette.purple].map(
          (color, index) => (
            <React.Fragment key={color}>
              <div
                style={{
                  width: 21,
                  height: 21,
                  borderRadius: "50%",
                  background: color,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 9,
                }}
              >
                {index + 1}
              </div>
              {index < 3 ? (
                <ChevronRight size={12} color="#747f90" />
              ) : null}
            </React.Fragment>
          ),
        )}
      </div>
    );
  }

  return (
    <div style={{textAlign: "right"}}>
      <div style={{fontSize: 22, fontWeight: 800}}>$12.4M</div>
      <div style={{fontSize: 13, color: palette.green}}>+18% ↗</div>
    </div>
  );
};

const BlockCard: React.FC<{
  title: string;
  description: string;
  type: string;
}> = ({title, description, type}) => (
  <div
    style={{
      height: 88,
      borderRadius: 8,
      border: `1px solid ${palette.border}`,
      background: palette.panel3,
      padding: "13px 14px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    <div style={{width: 112}}>
      <div style={{fontSize: 14, fontWeight: 750, color: palette.text}}>
        {title}
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: 11,
          lineHeight: 1.35,
          color: palette.muted,
        }}
      >
        {description}
      </div>
    </div>
    <MiniDiagram type={type} />
  </div>
);

const DesignPreset: React.FC<{
  label: string;
  icon: IconType;
  active?: boolean;
  crown?: boolean;
}> = ({label, icon: Icon, active, crown}) => (
  <div
    style={{
      height: 48,
      borderRadius: 8,
      border: active
        ? `1px solid ${palette.purple}`
        : `1px solid ${palette.border}`,
      boxShadow: active ? "0 0 0 1px rgba(118,85,246,.2)" : "none",
      background: palette.panel3,
      display: "flex",
      alignItems: "center",
      padding: "0 12px",
      gap: 10,
      position: "relative",
    }}
  >
    <Icon
      size={20}
      color={active ? palette.purpleLight : "#c5cbd4"}
      strokeWidth={1.7}
    />
    <span
      style={{
        fontSize: 12,
        fontWeight: 650,
        color: palette.text,
        lineHeight: 1.15,
      }}
    >
      {label}
    </span>
    {crown ? (
      <Crown
        size={12}
        color={palette.gold}
        style={{position: "absolute", right: 8, top: 6}}
      />
    ) : null}
  </div>
);

const AnimationPreset: React.FC<{
  label: string;
  description: string;
  icon: IconType;
  active?: boolean;
}> = ({label, description, icon: Icon, active}) => (
  <div
    style={{
      height: 43,
      borderRadius: 7,
      border: active
        ? `1px solid ${palette.purple}`
        : `1px solid ${palette.border}`,
      background: palette.panel3,
      padding: "0 11px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <Icon
      size={19}
      color={active ? "#ffffff" : "#c4cad3"}
      strokeWidth={1.8}
    />
    <div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          lineHeight: 1.1,
          color: palette.text,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 9.5,
          lineHeight: 1,
          color: palette.muted,
        }}
      >
        {description}
      </div>
    </div>
  </div>
);

const DonutChartVisual: React.FC = () => (
  <div
    style={{
      width: 146,
      height: 146,
      borderRadius: "50%",
      background:
        "conic-gradient(#2865d8 0 40%, #7554ec 40% 65%, #7a8798 65% 70%, #e4aa45 70% 80%, #1fa5a7 80% 100%)",
      position: "relative",
      boxShadow: "0 9px 22px rgba(19,34,55,.15)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 38,
        borderRadius: "50%",
        background: "#ffffff",
      }}
    />
    {[
      ["40%", 108, 45],
      ["25%", 69, 119],
      ["20%", 24, 68],
      ["10%", 35, 26],
      ["5%", 67, 11],
    ].map(([label, left, top]) => (
      <span
        key={label}
        style={{
          position: "absolute",
          left,
          top,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    ))}
  </div>
);

const BoardCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({children, style}) => (
  <div
    style={{
      borderRadius: 10,
      border: "1px solid #d9dee8",
      background: "#ffffff",
      ...style,
    }}
  >
    {children}
  </div>
);

const SceneCard: React.FC<{
  index: number;
  title: string;
  preset: string;
  duration: string;
  icon: IconType;
  color: string;
}> = ({index, title, preset, duration, icon: Icon, color}) => (
  <div
    style={{
      width: 178,
      height: 82,
      borderRadius: 8,
      border: `1px solid ${palette.border}`,
      background: palette.panel3,
      display: "flex",
      alignItems: "center",
      padding: 10,
      gap: 10,
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        width: 22,
        height: 22,
        borderRadius: 5,
        background: color,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 11,
      }}
    >
      {index}
    </div>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 9,
        background: "#111821",
        display: "grid",
        placeItems: "center",
        marginLeft: 16,
      }}
    >
      <Icon size={25} color="#ffffff" strokeWidth={1.7} />
    </div>
    <div style={{paddingTop: 4}}>
      <div
        style={{
          width: 92,
          fontSize: 10,
          fontWeight: 700,
          color: palette.text,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>
      <div style={{fontSize: 9.5, color: palette.muted, marginTop: 5}}>
        {preset}
      </div>
      <div style={{fontSize: 9.5, color: palette.muted, marginTop: 5}}>
        {duration}
      </div>
    </div>
    <ChevronRight
      size={14}
      color="#6f7988"
      style={{position: "absolute", right: -15}}
    />
  </div>
);

const CanvasBoard: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 37,
      right: 37,
      top: 63,
      bottom: 19,
      background: "#ffffff",
      borderRadius: 4,
      boxShadow: "0 5px 25px rgba(0,0,0,.28)",
      color: "#101827",
      padding: "25px 43px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 41,
        left: 39,
        display: "grid",
        gridTemplateColumns: "repeat(4,5px)",
        gap: 8,
      }}
    >
      {Array.from({length: 16}).map((_, index) => (
        <span
          key={index}
          style={{
            width: 3,
            height: 3,
            borderRadius: 99,
            background: "#d9dfeb",
          }}
        />
      ))}
    </div>

    <div
      style={{
        position: "absolute",
        top: 41,
        right: 39,
        display: "grid",
        gridTemplateColumns: "repeat(4,5px)",
        gap: 8,
      }}
    >
      {Array.from({length: 16}).map((_, index) => (
        <span
          key={index}
          style={{
            width: 3,
            height: 3,
            borderRadius: 99,
            background: "#d9dfeb",
          }}
        />
      ))}
    </div>

    <div style={{textAlign: "center"}}>
      <div
        style={{
          fontSize: 36,
          letterSpacing: 1,
          lineHeight: 1,
          fontWeight: 900,
        }}
      >
        MARKETING STRATEGY
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 17,
          color: "#4f5c70",
        }}
      >
        A data-driven approach to sustainable growth
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "165px 1fr 165px",
        gap: 13,
        marginTop: 18,
        height: 186,
      }}
    >
      <BoardCard
        style={{
          position: "relative",
          padding: "18px 22px",
          outline: "2px solid #326be0",
          outlineOffset: -1,
        }}
      >
        {[
          [0, 0],
          [50, 0],
          [100, 0],
          [0, 100],
          [50, 100],
          [100, 100],
        ].map(([left, top], index) => (
          <span
            key={index}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%,-50%)",
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#ffffff",
              border: "2px solid #326be0",
            }}
          />
        ))}

        <div
          style={{
            fontSize: 10,
            textAlign: "center",
            fontWeight: 800,
          }}
        >
          ANNUAL BUDGET
        </div>
        <div
          style={{
            color: palette.blue,
            fontSize: 32,
            fontWeight: 900,
            marginTop: 12,
          }}
        >
          $2.4M
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            marginTop: 5,
          }}
        >
          +18% vs last year
        </div>
        <svg
          viewBox="0 0 130 53"
          width="125"
          height="53"
          style={{marginTop: 5}}
        >
          <polyline
            points="4,45 21,33 37,38 53,29 69,37 86,19 101,25 125,7"
            fill="none"
            stroke="#2b67d8"
            strokeWidth="2"
          />
          {[["4", "45"], ["21", "33"], ["37", "38"], ["53", "29"], ["69", "37"], ["86", "19"], ["101", "25"], ["125", "7"]].map(
            ([cx, cy]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r="2.6"
                fill="#2b67d8"
              />
            ),
          )}
        </svg>

        <div
          style={{
            position: "absolute",
            left: 28,
            bottom: -30,
            height: 28,
            borderRadius: 5,
            background: "#11151b",
            color: "#ffffff",
            padding: "0 9px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 3px 10px rgba(0,0,0,.35)",
          }}
        >
          <Sparkles size={12} />
          <Copy size={12} />
          <Group size={12} />
          <Trash2 size={12} />
        </div>
      </BoardCard>

      <BoardCard style={{padding: "13px 25px"}}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          BUDGET ALLOCATION
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 31,
            marginTop: 8,
          }}
        >
          <DonutChartVisual />
          <div style={{display: "grid", gap: 10}}>
            {[
              ["#2865d8", "Content Marketing"],
              ["#3487b8", "Paid Advertising"],
              ["#1fa5a7", "SEO & Organic"],
              ["#7655f6", "Email Marketing"],
              ["#7a8798", "Other"],
            ].map(([color, label]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 10,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 99,
                    background: color,
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </BoardCard>

      <BoardCard
        style={{
          padding: "19px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{fontSize: 10, fontWeight: 800}}>KEY OBJECTIVE</div>
        <Target
          size={65}
          color={palette.blue}
          strokeWidth={2.2}
          style={{marginTop: 18}}
        />
        <div
          style={{
            width: 125,
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.5,
            fontWeight: 700,
            marginTop: 9,
          }}
        >
          Increase qualified leads by 35% by end of Q4
        </div>
      </BoardCard>
    </div>

    <BoardCard
      style={{
        marginTop: 14,
        height: 153,
        padding: "12px 32px",
      }}
    >
      <div style={{fontSize: 11, fontWeight: 800, textAlign: "center"}}>
        CAMPAIGN TIMELINE
      </div>

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          marginTop: 17,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 50,
            right: 50,
            top: 21,
            height: 2,
            background:
              "linear-gradient(90deg,#2865d8,#1da5a8,#ef7a35,#7655f6)",
          }}
        />

        {[
          {
            title: "RESEARCH",
            period: "Jan - Feb",
            desc: "Market research\n& audience analysis",
            color: palette.blue,
            icon: Search,
          },
          {
            title: "CREATE",
            period: "Mar - Apr",
            desc: "Content creation\n& asset development",
            color: palette.cyan,
            icon: WandSparkles,
          },
          {
            title: "LAUNCH",
            period: "May - Jun",
            desc: "Campaign launch\n& initial promotion",
            color: palette.orange,
            icon: MoveUpRight,
          },
          {
            title: "OPTIMIZE",
            period: "Jul - Dec",
            desc: "Analyze & optimize\nfor better results",
            color: palette.purple,
            icon: ChartNoAxesColumnIncreasing,
          },
        ].map(({title, period, desc, color, icon: Icon}) => (
          <div
            key={title}
            style={{
              textAlign: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 43,
                height: 43,
                margin: "0 auto",
                borderRadius: "50%",
                background: color,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Icon size={21} strokeWidth={1.8} />
            </div>
            <div style={{fontSize: 10, fontWeight: 900, marginTop: 8}}>
              {title}
            </div>
            <div style={{fontSize: 9.5, marginTop: 4}}>{period}</div>
            <div
              style={{
                fontSize: 8.5,
                whiteSpace: "pre-line",
                lineHeight: 1.4,
                marginTop: 5,
              }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>
    </BoardCard>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 1.15fr 0.95fr",
        gap: 13,
        marginTop: 14,
        height: 183,
      }}
    >
      <BoardCard style={{padding: "12px 19px"}}>
        <div style={{fontSize: 10, fontWeight: 800, textAlign: "center"}}>
          CUSTOMER JOURNEY
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 13,
          }}
        >
          <MiniDiagram type="funnel" />
          <div style={{display: "grid", gap: 12}}>
            {[
              ["#2d67d7", "Awareness", "100%"],
              ["#e3a23e", "Interest", "60%"],
              ["#1da5a8", "Consideration", "30%"],
              ["#7655f6", "Conversion", "15%"],
            ].map(([color, title, value]) => (
              <div
                key={title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 8.5,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    background: color,
                  }}
                />
                <div>
                  <b>{title}</b>
                  <div>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BoardCard>

      <BoardCard style={{padding: "12px 18px"}}>
        <div style={{fontSize: 10, fontWeight: 800, textAlign: "center"}}>
          CHANNEL PERFORMANCE
        </div>
        <div style={{display: "grid", gap: 13, marginTop: 17}}>
          {[
            ["Organic Search", 126, "#2865d8", "4.2K"],
            ["Paid Social", 96, "#3688c4", "3.1K"],
            ["Email", 80, "#1da5a8", "2.8K"],
            ["Direct", 55, "#7655f6", "1.9K"],
            ["Referrals", 34, "#7c8794", "1.2K"],
          ].map(([label, width, color, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "79px 1fr 31px",
                alignItems: "center",
                gap: 7,
                fontSize: 8.5,
              }}
            >
              <span>{label}</span>
              <span
                style={{
                  width,
                  maxWidth: "100%",
                  height: 10,
                  borderRadius: 3,
                  background: color,
                }}
              />
              <b>{value}</b>
            </div>
          ))}
        </div>
      </BoardCard>

      <BoardCard style={{padding: "12px 18px"}}>
        <div style={{fontSize: 10, fontWeight: 800, textAlign: "center"}}>
          KEY METRICS
        </div>
        <div style={{display: "grid", gap: 20, marginTop: 18}}>
          {[
            ["Website Traffic", "42.5K", "↑ 24%", palette.green],
            ["Leads Generated", "3.2K", "↑ 35%", palette.green],
            ["Conversion Rate", "4.8%", "↑ 12%", palette.green],
            ["Customer Acquisition", "$58", "↓ 8%", palette.red],
          ].map(([label, value, delta, color], index) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "17px 1fr auto auto",
                gap: 8,
                fontSize: 8.5,
                alignItems: "center",
              }}
            >
              {index === 0 ? (
                <Network size={12} color={palette.blue} />
              ) : index === 1 ? (
                <Goal size={12} color={palette.purple} />
              ) : index === 2 ? (
                <PieChart size={12} color={palette.blue} />
              ) : (
                <CircleDollarSign size={12} color={palette.purple} />
              )}
              <span>{label}</span>
              <b>{value}</b>
              <b style={{color}}>{delta}</b>
            </div>
          ))}
        </div>
      </BoardCard>
    </div>
  </div>
);

export const MyComp: React.FC = () => {
  const blocks = [
    ["Timeline", "Show events in chronological order", "timeline"],
    ["Funnel", "Visualize stages in a process", "funnel"],
    ["Comparison", "Compare two or more options", "compare"],
    ["Pie / Donut", "Show proportions and percentages", "donut"],
    ["Hierarchy", "Display structure and relationships", "hierarchy"],
    ["Process", "Step-by-step explanation", "process"],
    ["KPI / Metric", "Highlight key numbers", "kpi"],
  ];

  return (
    <AbsoluteFill
      style={{
        background: palette.app,
        color: palette.text,
        fontFamily:
          'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 60,
          background:
            "linear-gradient(180deg,#0d1118 0%,#0a0e14 100%)",
          borderBottom: `1px solid ${palette.mutedBorder}`,
          display: "flex",
          alignItems: "center",
          padding: "0 21px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 27,
            height: 27,
            borderRadius: 6,
            background: "#f0eaff",
            color: "#2d244d",
            display: "grid",
            placeItems: "center",
            fontSize: 17,
            fontWeight: 950,
            marginRight: 10,
          }}
        >
          F
        </div>

        <div style={{fontSize: 18, fontWeight: 800}}>
          Framepoint Studio
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 83,
            gap: 12,
            fontSize: 13,
          }}
        >
          <span style={{color: palette.muted}}>Project</span>
          <span style={{color: "#454e5b"}}>|</span>
          <span style={{fontWeight: 650}}>Marketing Strategy Explainer</span>
          <ChevronDown size={14} color={palette.muted} />
          <span style={{color: "#454e5b"}}>|</span>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 99,
              background: "#183b30",
              color: palette.green,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Check size={9} strokeWidth={3} />
          </span>
          <span style={{fontSize: 11, color: palette.muted}}>Saved</span>
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            style={{
              height: 38,
              padding: "0 17px",
              borderRadius: 7,
              border: `1px solid ${palette.border}`,
              background: palette.panel2,
              color: palette.text,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CirclePlay size={17} />
            Preview
          </button>

          <button
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 7,
              border: "none",
              background:
                "linear-gradient(90deg,#7351ed 0%,#835af2 100%)",
              color: "#fff",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <PanelTop size={17} />
            Render Video
            <ChevronDown size={14} />
          </button>

          <div
            style={{
              height: 30,
              width: 1,
              background: palette.border,
              margin: "0 9px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              fontSize: 13,
              fontWeight: 650,
            }}
          >
            <Settings size={18} />
            Settings
          </div>
        </div>
      </div>

      {/* Main area */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 60,
          bottom: 0,
          display: "grid",
          gridTemplateColumns: "289px 1fr 326px",
          gap: 8,
          padding: "0 7px 8px",
        }}
      >
        {/* Left sidebar */}
        <aside
          style={{
            borderRadius: "10px 10px 0 0",
            background: palette.panel,
            border: `1px solid ${palette.mutedBorder}`,
            padding: "18px 15px 12px",
            overflow: "hidden",
          }}
        >
          <div style={{fontSize: 15, fontWeight: 850}}>BLOCKS</div>
          <div
            style={{
              marginTop: 5,
              fontSize: 11,
              color: palette.muted,
            }}
          >
            Drag to canvas
          </div>

          <div
            style={{
              marginTop: 17,
              height: 680,
              display: "grid",
              gap: 10,
            }}
          >
            {blocks.map(([title, description, type]) => (
              <BlockCard
                key={title}
                title={title}
                description={description}
                type={type}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              color: "#d6d9df",
            }}
          >
            <Grid2X2 size={14} />
            More Blocks
          </div>
        </aside>

        {/* Center */}
        <main
          style={{
            position: "relative",
            minWidth: 0,
            display: "grid",
            gridTemplateRows: "1fr 145px",
            gap: 8,
          }}
        >
          <section
            style={{
              position: "relative",
              borderRadius: "10px 10px 0 0",
              background:
                "linear-gradient(180deg,#11171e 0%,#0e141b 100%)",
              border: `1px solid ${palette.mutedBorder}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 62,
                display: "flex",
                alignItems: "center",
                padding: "0 24px",
                borderBottom: `1px solid ${palette.mutedBorder}`,
              }}
            >
              <div style={{display: "flex", gap: 7}}>
                <IconButton icon={MousePointer2} label="Select" active />
                <IconButton icon={Blocks} label="Arrange" />
                <IconButton icon={AlignHorizontalSpaceAround} label="Align" />
                <IconButton icon={Group} label="Group" />
                <IconButton icon={Trash2} label="Delete" danger />
              </div>

              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 7,
                    background: "#11161e",
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      borderRight: `1px solid ${palette.border}`,
                    }}
                  >
                    <Undo2 size={17} />
                  </div>
                  <div
                    style={{
                      width: 38,
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      color: "#505968",
                    }}
                  >
                    <Redo2 size={17} />
                  </div>
                </div>

                <div
                  style={{
                    height: 36,
                    borderRadius: 7,
                    background: "#11161e",
                    border: `1px solid ${palette.border}`,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div style={{width: 38, display: "grid", placeItems: "center"}}>
                    <ZoomOut size={16} />
                  </div>
                  <div
                    style={{
                      minWidth: 53,
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    100%
                  </div>
                  <div style={{width: 38, display: "grid", placeItems: "center"}}>
                    <ZoomIn size={16} />
                  </div>
                </div>

                <div
                  style={{
                    width: 38,
                    height: 36,
                    borderRadius: 7,
                    border: `1px solid ${palette.border}`,
                    background: "#11161e",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Maximize size={17} />
                </div>
              </div>
            </div>

            <CanvasBoard />
          </section>

          {/* Sequence */}
          <section
            style={{
              borderRadius: "0 0 10px 10px",
              background: palette.panel,
              border: `1px solid ${palette.mutedBorder}`,
              padding: "13px 18px 9px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#576171",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              SCENE SEQUENCE{" "}
              <span style={{fontSize: 8, color: "#343c48"}}>
                Drag to reorder
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <SceneCard
                index={1}
                title="Research & Budget"
                preset="Focus"
                duration="4.0s"
                icon={Search}
                color={palette.blue}
              />
              <SceneCard
                index={2}
                title="Funnel Journey"
                preset="Reveal"
                duration="4.5s"
                icon={Funnel}
                color={palette.cyan}
              />
              <SceneCard
                index={3}
                title="Channel Metrics"
                preset="Build"
                duration="4.0s"
                icon={PieChart}
                color={palette.orange}
              />
              <SceneCard
                index={4}
                title="Key Objective"
                preset="Spotlight"
                duration="3.5s"
                icon={Target}
                color={palette.purple}
              />
              <SceneCard
                index={5}
                title="Full Overview"
                preset="Overview"
                duration="4.0s"
                icon={Grid2X2}
                color="#6b7585"
              />

              <div
                style={{
                  width: 94,
                  height: 82,
                  borderRadius: 8,
                  border: "1px dashed #46505e",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  color: palette.muted,
                  fontSize: 10,
                }}
              >
                <Plus size={22} strokeWidth={1.5} />
                Add Scene
              </div>
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
                fontSize: 10,
                color: palette.muted,
              }}
            >
              <Clock3 size={12} />
              Total Duration: 20.0s
            </div>
          </section>
        </main>

        {/* Right sidebar */}
        <aside
          style={{
            borderRadius: "10px 10px 0 0",
            background: palette.panel,
            border: `1px solid ${palette.mutedBorder}`,
            padding: "18px 16px 14px",
            overflow: "hidden",
          }}
        >
          <div style={{fontSize: 15, fontWeight: 850}}>PRESETS</div>

          <div style={{fontSize: 12, fontWeight: 800, marginTop: 23}}>
            DESIGN PRESETS
          </div>
          <div
            style={{
              color: palette.muted,
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Apply proven layout and style rules
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 12,
            }}
          >
            <DesignPreset
              label="Hero Emphasis"
              icon={PanelTop}
              active
              crown
            />
            <DesignPreset label="Supporting Block" icon={Blocks} />
            <DesignPreset label="Data Block" icon={BarChart3} />
            <DesignPreset label="Process Block" icon={Waypoints} />
            <DesignPreset label="Summary Block" icon={ListTree} />
            <DesignPreset label="Technical Callout" icon={Shapes} />
            <DesignPreset label="Balanced Grid" icon={Grid2X2} />
            <DesignPreset label="Editorial Spread" icon={LayoutGrid} />
          </div>

          <div
            style={{
              height: 1,
              background: palette.border,
              margin: "18px 0",
            }}
          />

          <div style={{fontSize: 12, fontWeight: 800}}>
            ANIMATION PRESETS
          </div>
          <div
            style={{
              color: palette.muted,
              fontSize: 10,
              marginTop: 6,
            }}
          >
            Apply professional animation behavior
          </div>

          <div
            style={{
              display: "grid",
              gap: 5,
              marginTop: 12,
            }}
          >
            <AnimationPreset
              label="Focus"
              description="Zoom to highlight with dim"
              icon={Crosshair}
              active
            />
            <AnimationPreset
              label="Reveal"
              description="Fade in and slide up"
              icon={Eye}
            />
            <AnimationPreset
              label="Build"
              description="Sequential build in"
              icon={Sparkles}
            />
            <AnimationPreset
              label="Trace"
              description="Draw attention along a path"
              icon={Waypoints}
            />
            <AnimationPreset
              label="Compare"
              description="Side-by-side highlight"
              icon={GitCompareArrows}
            />
            <AnimationPreset
              label="Count"
              description="Animate numbers and data"
              icon={CircleDollarSign}
            />
            <AnimationPreset
              label="Spotlight"
              description="Isolate with spotlight effect"
              icon={WandSparkles}
            />
            <AnimationPreset
              label="Overview"
              description="Zoom out to full view"
              icon={Maximize}
            />
          </div>

          <div
            style={{
              borderRadius: 8,
              background: "#151923",
              border: `1px solid ${palette.border}`,
              marginTop: 20,
              padding: "14px 13px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <Info size={17} color={palette.purpleLight} />
            <div
              style={{
                color: palette.muted,
                fontSize: 10,
                lineHeight: 1.45,
              }}
            >
              Presets use optimized timing
              <br />
              and easing based on best practices.
            </div>
          </div>
        </aside>
      </div>
    </AbsoluteFill>
  );
};
