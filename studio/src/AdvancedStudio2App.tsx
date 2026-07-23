import React from "react";
import {Player, type PlayerRef} from "@remotion/player";
import {
  Check,
  ChevronDown,
  Download,
  Folder,
  ImagePlus,
  MonitorPlay,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  ProductVideo,
  getProductVideoDuration,
  productVideoFormats,
  productVideoFps,
  type ProductVideoFormat,
  type ProductVideoProps,
} from "../../src/advanced-studio2/ProductVideo";
import {
  productTemplates,
  type ProductTemplateId,
} from "../../src/advanced-studio2/product-templates";

const formats: Array<{id: ProductVideoFormat; label: string; meta: string}> = [
  {id: "portrait", label: "Portrait", meta: "1080 × 1350"},
  {id: "square", label: "Square", meta: "1080 × 1080"},
  {id: "vertical", label: "Vertical", meta: "1080 × 1920"},
];

const defaultState: ProductVideoProps = {
  templateId: "obsidian",
  imageSrc: "",
  productName: "Aurelia One",
  headline: "",
  subheadline: "",
  eyebrow: "",
  cta: "",
  accent: "",
  formatId: "portrait",
};

export const AdvancedStudio2App: React.FC = () => {
  const playerRef = React.useRef<PlayerRef>(null);
  const [project, setProject] = React.useState<ProductVideoProps>(defaultState);
  const [expandedBatch, setExpandedBatch] = React.useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [isProcessingImage, setIsProcessingImage] = React.useState(false);
  const [imageMessage, setImageMessage] = React.useState("");
  const [renderState, setRenderState] = React.useState<
    "idle" | "rendering" | "complete" | "error"
  >("idle");
  const [renderMessage, setRenderMessage] = React.useState("");
  const format = productVideoFormats[project.formatId];
  const selectedTemplate =
    productTemplates.find((item) => item.id === project.templateId) ??
    productTemplates[0];
  const durationInFrames = getProductVideoDuration(project.templateId);

  const update = <K extends keyof ProductVideoProps>(
    key: K,
    value: ProductVideoProps[K],
  ) => {
    setProject((current) => ({...current, [key]: value}));
    setRenderState("idle");
    setRenderMessage("");
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageMessage("Choose a PNG, JPEG, or WebP product image.");
      return;
    }
    setIsProcessingImage(true);
    setImageMessage("Apple Vision is isolating your product…");
    try {
      const response = await fetch(
        "/api/advanced-studio2/remove-background",
        {
          method: "POST",
          headers: {"Content-Type": file.type},
          body: file,
        },
      );
      if (!response.ok) {
        const result = (await response.json()) as {error?: string};
        throw new Error(result.error || "Background removal failed.");
      }
      const productImage = await response.blob();
      const reader = new FileReader();
      const imageSrc = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("The product image could not be read."));
        reader.readAsDataURL(productImage);
      });
      update("imageSrc", imageSrc);
      setImageMessage("Background removed with Apple Vision.");
    } catch (error) {
      setImageMessage(
        error instanceof Error ? error.message : "Background removal failed.",
      );
    } finally {
      setIsProcessingImage(false);
    }
  };

  const renderVideo = async () => {
    setRenderState("rendering");
    setRenderMessage("Rendering the exact preview composition…");
    try {
      const response = await fetch("/api/render-advanced2", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        downloadUrl?: string;
        error?: string;
      };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Render failed.");
      }
      setRenderState("complete");
      setRenderMessage("Your product video is ready.");
    } catch (error) {
      setRenderState("error");
      setRenderMessage(error instanceof Error ? error.message : "Render failed.");
    }
  };

  return (
    <div className="as2-shell">
      <header className="as2-topbar">
        <div className="as2-brand">
          <div className="as2-mark">FP</div>
          <div>
            <strong>Advanced Studio 2</strong>
            <span>Product Template Lab</span>
          </div>
        </div>
        <div className="as2-top-actions">
          <div className="as2-status">
            <Check size={15} /> Preview and export use one composition
          </div>
          {renderState === "complete" ? (
            <a
              className="as2-button secondary"
              href={`/api/export-advanced2/${project.formatId}`}
            >
              <Download size={18} /> Download MP4
            </a>
          ) : null}
          <button
            className="as2-button primary"
            type="button"
            onClick={renderVideo}
            disabled={renderState === "rendering"}
          >
            <Sparkles size={18} />
            {renderState === "rendering" ? "Rendering…" : "Export video"}
          </button>
        </div>
      </header>

      <main className="as2-workspace">
        <aside className="as2-library">
          {([1, 2, 3, 4, 5] as const).map((batch) => (
            <React.Fragment key={batch}>
              <button
                className="as2-template-folder"
                type="button"
                aria-expanded={expandedBatch === batch}
                onClick={() =>
                  setExpandedBatch((current) =>
                    current === batch ? null : batch,
                  )
                }
              >
                <span className="as2-folder-icon">
                  <Folder size={20} fill="currentColor" />
                </span>
                <div>
                  <strong>Product Templates {batch}</strong>
                  <small>10 locked templates</small>
                </div>
                <ChevronDown
                  className="as2-folder-chevron"
                  size={17}
                  aria-hidden="true"
                />
              </button>
              {expandedBatch === batch ? (
                <div className="as2-template-grid">
                  {productTemplates
                    .filter((template) => template.batch === batch)
                    .map((template) => (
                      <button
                        key={template.id}
                        className={`as2-template-card ${
                          project.templateId === template.id ? "selected" : ""
                        }`}
                        type="button"
                        onClick={() => update("templateId", template.id)}
                      >
                        <div
                          className="as2-template-art"
                          style={{
                            background: template.background,
                            color: template.foreground,
                            borderColor: `${template.accent}55`,
                          }}
                        >
                          <span style={{background: template.accent}} />
                          <b>
                            {String(
                              productTemplates.indexOf(template) + 1,
                            ).padStart(2, "0")}
                          </b>
                          <em>{template.eyebrow}</em>
                        </div>
                        <div>
                          <strong>{template.name}</strong>
                          <small>{template.category}</small>
                        </div>
                      </button>
                    ))}
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </aside>

        <section className="as2-stage-column">
          <div className="as2-stage-toolbar">
            <div>
              <MonitorPlay size={17} />
              <strong>Live composition</strong>
              <span>{selectedTemplate.name}</span>
            </div>
            <div className="as2-format-tabs">
              {formats.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={project.formatId === item.id ? "active" : ""}
                  onClick={() => update("formatId", item.id)}
                >
                  <strong>{item.label}</strong>
                  <span>{item.meta}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="as2-stage">
            <div
              className="as2-player-frame"
              style={{aspectRatio: `${format.width} / ${format.height}`}}
            >
              <Player
                ref={playerRef}
                component={ProductVideo}
                inputProps={project}
                durationInFrames={durationInFrames}
                fps={productVideoFps}
                compositionWidth={format.width}
                compositionHeight={format.height}
                style={{width: "100%", height: "100%"}}
                controls
                loop
                acknowledgeRemotionLicense
              />
            </div>
          </div>

          <div className="as2-playback">
            <button
              type="button"
              onClick={() => playerRef.current?.toggle()}
              aria-label="Play preview"
            >
              <Play size={20} fill="currentColor" />
            </button>
            <div>
              <strong>{durationInFrames / productVideoFps} second product story</strong>
              <span>Reveal → product proof → call to action</span>
            </div>
            <div className="as2-timeline">
              <span />
              <span />
              <span />
            </div>
          </div>

          {renderState !== "idle" ? (
            <div className={`as2-render-message ${renderState}`}>
              {renderMessage}
            </div>
          ) : null}
        </section>

        <aside className="as2-inspector">
          <div className="as2-panel-heading">
            <span>02</span>
            <div>
              <strong>Add your product</strong>
              <small>Only approved fields are editable</small>
            </div>
          </div>

          <label className="as2-upload">
            {project.imageSrc ? (
              <img src={project.imageSrc} alt="Uploaded product" />
            ) : (
              <div>
                <ImagePlus size={30} />
                <strong>Upload product image</strong>
                <span>Apple Vision removes the background on this Mac</span>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={isProcessingImage}
              onChange={(event) => handleUpload(event.target.files?.[0])}
            />
            <b>
              <Upload size={15} />{" "}
              {isProcessingImage
                ? "Removing background…"
                : project.imageSrc
                  ? "Replace image"
                  : "Choose image"}
            </b>
          </label>
          {imageMessage ? (
            <div className="as2-image-message">{imageMessage}</div>
          ) : null}

          <div className="as2-field-group">
            <label>
              <span>Product name</span>
              <input
                value={project.productName}
                onChange={(event) => update("productName", event.target.value)}
                maxLength={42}
              />
            </label>
            <label>
              <span>Eyebrow</span>
              <input
                value={project.eyebrow ?? ""}
                placeholder={selectedTemplate.eyebrow}
                onChange={(event) => update("eyebrow", event.target.value)}
                maxLength={34}
              />
            </label>
            <label>
              <span>Headline</span>
              <textarea
                value={project.headline ?? ""}
                placeholder={selectedTemplate.headline}
                onChange={(event) => update("headline", event.target.value)}
                maxLength={68}
                rows={2}
              />
            </label>
            <label>
              <span>Supporting line</span>
              <textarea
                value={project.subheadline ?? ""}
                placeholder={selectedTemplate.subheadline}
                onChange={(event) => update("subheadline", event.target.value)}
                maxLength={110}
                rows={3}
              />
            </label>
            <label>
              <span>Call to action</span>
              <input
                value={project.cta ?? ""}
                placeholder={selectedTemplate.cta}
                onChange={(event) => update("cta", event.target.value)}
                maxLength={32}
              />
            </label>
          </div>

          <div className="as2-color-row">
            <div>
              <Palette size={17} />
              <span>
                <strong>Accent color</strong>
                <small>Template default unless overridden</small>
              </span>
            </div>
            <input
              type="color"
              value={project.accent || selectedTemplate.accent}
              onChange={(event) => update("accent", event.target.value)}
            />
          </div>

          <button
            className="as2-reset"
            type="button"
            onClick={() =>
              setProject((current) => ({
                ...defaultState,
                imageSrc: current.imageSrc,
                formatId: current.formatId,
              }))
            }
          >
            <RotateCcw size={15} /> Reset copy and design
          </button>

          <div className="as2-template-note">
            <div>
              <Sparkles size={17} />
              <strong>{selectedTemplate.name}</strong>
              <ChevronDown size={15} />
            </div>
            <p>{selectedTemplate.description}</p>
          </div>
        </aside>
      </main>
    </div>
  );
};
