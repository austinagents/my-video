import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const reveal = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Full-board entrance.
  const introOpacity = interpolate(frame, [0, 18], [0, 1], clamp);
  const introScale = interpolate(frame, [0, 35], [0.94, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Camera moves across the board in three stages.
  const cameraX = interpolate(
    frame,
    [0, 70, 120, 185, 235, 285],
    [0, 0, 130, -120, 80, 0],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const cameraY = interpolate(
    frame,
    [0, 70, 120, 185, 235, 285],
    [0, 0, -55, -45, 120, 0],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const cameraScale = interpolate(
    frame,
    [0, 70, 120, 185, 235, 285],
    [1, 1.03, 1.22, 1.2, 1.18, 1],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }
  );

  // Section reveals.
  const section1 = reveal(frame, 25);
  const section2 = reveal(frame, 85);
  const section3 = reveal(frame, 145);
  const section4 = reveal(frame, 205);

  // Spotlight travels between regions.
  const spotX = interpolate(
    frame,
    [0, 35, 95, 155, 215, 280],
    [400, 470, 780, 1100, 760, 760],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const spotY = interpolate(
    frame,
    [0, 35, 95, 155, 215, 280],
    [300, 300, 300, 300, 650, 500],
    {
      ...clamp,
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const dimOpacity = interpolate(
    frame,
    [0, 22, 250, 285],
    [0, 0.48, 0.48, 0],
    clamp
  );

  const finalGlow = interpolate(frame, [260, 290], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at center, #f8f7f2 0%, #ebe8df 100%)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: 1500,
          height: 850,
          position: "relative",
          opacity: introOpacity,
          transform: `
            translate(${cameraX}px, ${cameraY}px)
            scale(${introScale * cameraScale})
          `,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#ffffff",
            borderRadius: 38,
            boxShadow: "0 36px 100px rgba(20, 25, 35, 0.18)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              position: "absolute",
              left: 58,
              top: 38,
              right: 58,
              height: 82,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid #e9edf4",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  letterSpacing: -2,
                  color: "#132238",
                }}
              >
                MARKETING
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 20,
                  color: "#6c7890",
                }}
              >
                How attention becomes growth
              </div>
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#55739d",
              }}
            >
              VISUAL EXPLAINER
            </div>
          </div>

          {/* Section 1 */}
          <div
            style={{
              position: "absolute",
              left: 58,
              top: 150,
              width: 395,
              height: 260,
              borderRadius: 28,
              background:
                "linear-gradient(145deg, #edf4ff 0%, #f8fbff 100%)",
              border: "1px solid #dce8f7",
              padding: 28,
              opacity: section1,
              transform: `translateY(${(1 - section1) * 22}px)`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#193251",
              }}
            >
              1. Understand the market
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 22,
                marginTop: 30,
              }}
            >
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  border: "18px solid #2d6cdf",
                  borderRightColor: "#9fc0f4",
                  transform: "rotate(-25deg)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 50,
                    fontWeight: 900,
                    color: "#2d6cdf",
                  }}
                >
                  72%
                </div>
                <div
                  style={{
                    width: 190,
                    fontSize: 20,
                    lineHeight: 1.35,
                    color: "#58677c",
                  }}
                >
                  of successful campaigns begin with customer insight.
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div
            style={{
              position: "absolute",
              left: 485,
              top: 150,
              width: 470,
              height: 260,
              borderRadius: 28,
              background:
                "linear-gradient(145deg, #ecfbf5 0%, #f8fffb 100%)",
              border: "1px solid #d8f1e5",
              padding: 28,
              opacity: section2,
              transform: `translateY(${(1 - section2) * 22}px)`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#183d32",
              }}
            >
              2. Create and communicate value
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 34,
              }}
            >
              {["Product", "Message", "Channel"].map((label, index) => (
                <React.Fragment key={label}>
                  <div
                    style={{
                      width: 105,
                      height: 105,
                      borderRadius: 22,
                      background:
                        index === 0
                          ? "#1bbf83"
                          : index === 1
                            ? "#6d54d9"
                            : "#f2a01a",
                      color: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      padding: 10,
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {label}
                  </div>

                  {index < 2 ? (
                    <div
                      style={{
                        fontSize: 38,
                        color: "#85a79b",
                        fontWeight: 700,
                      }}
                    >
                      →
                    </div>
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div
            style={{
              position: "absolute",
              right: 58,
              top: 150,
              width: 395,
              height: 260,
              borderRadius: 28,
              background:
                "linear-gradient(145deg, #fff5e9 0%, #fffaf4 100%)",
              border: "1px solid #f4e1ca",
              padding: 28,
              opacity: section3,
              transform: `translateY(${(1 - section3) * 22}px)`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#4b351c",
              }}
            >
              3. Move people through the funnel
            </div>

            <div
              style={{
                marginTop: 26,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
              }}
            >
              {[
                ["Awareness", 270, "#2d6cdf"],
                ["Consideration", 215, "#1bbf83"],
                ["Conversion", 160, "#f2a01a"],
                ["Loyalty", 105, "#6d54d9"],
              ].map(([label, width, color]) => (
                <div
                  key={label}
                  style={{
                    width,
                    height: 42,
                    borderRadius: 14,
                    background: color,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 17,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom section */}
          <div
            style={{
              position: "absolute",
              left: 58,
              right: 58,
              bottom: 54,
              height: 318,
              borderRadius: 28,
              background:
                "linear-gradient(145deg, #f6f7fa 0%, #fbfbfc 100%)",
              border: "1px solid #e6e9ef",
              padding: 30,
              opacity: section4,
              transform: `translateY(${(1 - section4) * 24}px)`,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#213147",
              }}
            >
              4. Measure, learn and improve
            </div>

            <div
              style={{
                display: "flex",
                height: 235,
                marginTop: 14,
                alignItems: "flex-end",
                justifyContent: "space-around",
              }}
            >
              {[88, 135, 118, 185, 224].map((height, index) => (
                <div
                  key={height}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 96,
                      height,
                      borderRadius: "18px 18px 5px 5px",
                      background:
                        index === 4
                          ? "#2d6cdf"
                          : `rgba(45, 108, 223, ${0.25 + index * 0.13})`,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 18,
                      color: "#68778c",
                      fontWeight: 700,
                    }}
                  >
                    {["Reach", "Engage", "Convert", "Retain", "Grow"][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Darkened layer with animated spotlight cutout */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: dimOpacity,
              background: `radial-gradient(
                ellipse 290px 210px at ${spotX}px ${spotY}px,
                rgba(0,0,0,0) 0%,
                rgba(0,0,0,0.03) 42%,
                rgba(7,12,22,0.68) 74%,
                rgba(7,12,22,0.78) 100%
              )`,
            }}
          />

          {/* Final full-board glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: finalGlow * 0.5,
              boxShadow: "inset 0 0 90px rgba(83, 137, 224, 0.22)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
