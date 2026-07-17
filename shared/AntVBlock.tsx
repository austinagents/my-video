import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {Infographic} from "@antv/infographic";
import {
  continueRender,
  delayRender,
  getRemotionEnvironment,
} from "remotion";
import type {StudioBlock} from "./project";
import {resolveAntVBlock} from "./antv/resolve";
import {buildAntVSyntax} from "./antv/syntax";

const normalizeSvg = (
  container: HTMLDivElement,
  block: StudioBlock,
) => {
  const svg = container.querySelector<SVGSVGElement>("svg");

  if (!svg) {
    return false;
  }

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.maxWidth = "100%";
  svg.style.maxHeight = "100%";
  svg.style.overflow = "visible";

  const firstGroup = svg.querySelector<SVGGElement>("g");

  if (firstGroup) {
    try {
      const box = firstGroup.getBBox();

      if (
        Number.isFinite(box.x) &&
        Number.isFinite(box.y) &&
        Number.isFinite(box.width) &&
        Number.isFinite(box.height) &&
        box.width > 1 &&
        box.height > 1
      ) {
        const horizontalPadding = Math.max(
          14,
          box.width * 0.045,
        );

        const verticalPadding = Math.max(
          12,
          box.height * 0.07,
        );

        svg.setAttribute(
          "viewBox",
          [
            box.x - horizontalPadding,
            box.y - verticalPadding,
            box.width + horizontalPadding * 2,
            box.height + verticalPadding * 2,
          ].join(" "),
        );
      }
    } catch {
      // The second animation frame will retry after browser layout.
    }
  }

  const textNodes =
    svg.querySelectorAll<SVGTextElement>("text");

  textNodes.forEach((text) => {
    text.style.fontFamily =
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    text.style.fontKerning = "normal";
    text.style.textRendering = "geometricPrecision";
  });

  svg
    .querySelectorAll<SVGGraphicsElement>(
      "path, rect, circle, line, polyline, polygon",
    )
    .forEach((element) => {
      element.style.vectorEffect = "non-scaling-stroke";
    });

  /*
   * AntV sometimes emits literal NaN labels when a template receives
   * incompatible source data. Hide only those invalid text nodes.
   */
  textNodes.forEach((text) => {
    if (text.textContent?.includes("NaN")) {
      text.style.display = "none";
    }
  });

  return true;
};

export const AntVBlock: React.FC<{
  block: StudioBlock;
}> = ({block}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const resolved = useMemo(
    () => resolveAntVBlock(block),
    [
      block.type,
      block.designPreset,
      block.width,
      block.height,
    ],
  );

  const syntax = useMemo(
    () => buildAntVSyntax(block, resolved.template),
    [block, resolved.template],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = "";
    setError(null);

    let disposed = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let thirdFrame = 0;
    let completed = false;

    const environment = getRemotionEnvironment();

    const renderHandle = environment.isRendering
      ? delayRender(`AntV block: ${block.id}`)
      : null;

    const finish = () => {
      if (completed) {
        return;
      }

      completed = true;

      if (renderHandle !== null) {
        continueRender(renderHandle);
      }
    };

    const infographic = new Infographic({
      container,
      width: resolved.internalWidth,
      height: resolved.internalHeight,
    });

    Promise.resolve(infographic.render(syntax))
      .then(() => {
        if (disposed) {
          finish();
          return;
        }

        firstFrame = requestAnimationFrame(() => {
          normalizeSvg(container, block);

          secondFrame = requestAnimationFrame(() => {
            normalizeSvg(container, block);

            thirdFrame = requestAnimationFrame(() => {
              normalizeSvg(container, block);
              finish();
            });
          });
        });
      })
      .catch((reason: unknown) => {
        console.error(
          `AntV render failed for "${block.id}" using "${resolved.template}"`,
          reason,
        );

        if (!disposed) {
          setError(
            reason instanceof Error
              ? reason.message
              : "AntV could not render this block.",
          );
        }

        finish();
      });

    return () => {
      disposed = true;

      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      cancelAnimationFrame(thirdFrame);

      infographic.destroy?.();

      container.innerHTML = "";
      finish();
    };
  }, [
    block.id,
    block.title,
    block.type,
    block.designPreset,
    block.width,
    block.height,
    block.syntax,
    resolved.template,
    resolved.internalWidth,
    resolved.internalHeight,
    syntax,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        inset: resolved.padding,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        ref={containerRef}
        data-antv-block={block.id}
        data-antv-template={resolved.template}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      />

      {error ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 14,
            borderRadius: 8,
            background: "#f7f9fc",
            color: "#586477",
            textAlign: "center",
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#142033",
                fontSize: 13,
                marginBottom: 5,
              }}
            >
              {block.title}
            </strong>

            <span style={{fontSize: 10}}>
              The selected AntV template rejected this block’s data.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
