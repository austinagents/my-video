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
import {resolveAntVRenderInput} from "./antv/input";
import {prepareStaticSvg} from "./antv/svg";

const getRenderedRootSvg = (container: HTMLDivElement) =>
  container.querySelector<SVGSVGElement>("svg");

export const AntVBlock: React.FC<{
  block: StudioBlock;
}> = ({block}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const environment = getRemotionEnvironment();
  const isRendering = environment.isRendering;
  const [error, setError] = useState<string | null>(null);
  const [staticSvg, setStaticSvg] = useState<string | null>(null);

  const antvInput = useMemo(
    () => resolveAntVRenderInput(block),
    [
      block.type,
      block.designPreset,
      block.width,
      block.height,
      block.title,
      block.syntax,
    ],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = "";
    setError(null);
    setStaticSvg(null);

    let disposed = false;
    let completed = false;
    const animationFrames: number[] = [];

    const renderHandle = isRendering
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
      width: antvInput.width,
      height: antvInput.height,
    });

    const fail = (reason: unknown) => {
      console.error(
        `AntV render failed for "${block.id}" using "${antvInput.template}"`,
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
    };

    const prepareSvg = () => {
      try {
        if (disposed) {
          finish();
          return;
        }

        const svg = getRenderedRootSvg(container);

        if (!svg) {
          throw new Error("AntV rendered without a root SVG.");
        }

        setStaticSvg(prepareStaticSvg(svg));
        animationFrames.push(requestAnimationFrame(finish));
      } catch (reason: unknown) {
        console.error(
          `AntV SVG preparation failed for "${block.id}" using "${antvInput.template}"`,
          reason,
        );

        if (!disposed) {
          setError(
            reason instanceof Error
              ? reason.message
              : "AntV could not prepare this block.",
          );
        }

        finish();
      }
    };

    const onRendered = () => {
      animationFrames.push(requestAnimationFrame(prepareSvg));
    };

    const onError = (reason: unknown) => {
      fail(reason);
    };

    infographic.on("rendered", onRendered);
    infographic.on("error", onError);

    try {
      infographic.render(antvInput.syntax);
    } catch (reason: unknown) {
      fail(reason);
    }

    return () => {
      disposed = true;

      infographic.off("rendered", onRendered);
      infographic.off("error", onError);

      animationFrames.forEach((animationFrame) => {
        cancelAnimationFrame(animationFrame);
      });

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
    antvInput.template,
    antvInput.width,
    antvInput.height,
    antvInput.syntax,
    isRendering,
  ]);

  return (
    <div
      style={{
        position: "absolute",
        inset: antvInput.padding,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {staticSvg ? (
        <div
          data-antv-block={block.id}
          data-antv-template={antvInput.template}
          dangerouslySetInnerHTML={{__html: staticSvg}}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : null}

      <div
        ref={containerRef}
        data-antv-block={block.id}
        data-antv-template={antvInput.template}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
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
