import React from "react";
import {Player, type PlayerRef} from "@remotion/player";
import {
  BarChart3,
  ChevronDown,
  Crosshair,
  Download,
  Eye,
  Film,
  Fullscreen,
  GitCompareArrows,
  Pause,
  Play,
  Ratio,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Wand2,
  WandSparkles,
  ZoomIn,
} from "lucide-react";
import {
  AdvancedStudioIntegrationProof,
  advancedStudioDefaultProject,
  advancedStudioIntegrationFormats,
  advancedStudioIntegrationFps,
  createAdvancedStudioInfographicContent,
  getAdvancedStudioProjectDuration,
  getAdvancedStudioSceneAtFrame,
  getAdvancedStudioTimedScenes,
} from "../../src/advanced-studio/AdvancedStudioIntegrationProof";
import {animationPresets} from "../../shared/animation-presets";
import type {BoardSceneContent} from "../../src/advanced-studio/BoardSceneRenderer";
import type {
  AdvancedStudioInfographicContent,
  AdvancedStudioProject,
  AdvancedStudioScene,
  AdvancedStudioSceneType,
  AdvancedStudioTimedScene,
} from "../../src/advanced-studio/scene-contract";
import {getAdvancedStudioCameraPath} from "../../src/advanced-studio/camera-paths";
import {antVStudioDesigns} from "../../src/antv-studio/registry";
import {cloneContent} from "../../src/antv-studio/sample-content";
import {defaultControls} from "../../src/antv-studio/theme";
import type {StudioFormatId} from "../../src/antv-studio/studio-formats";
import type {
  AntVEngine,
  AntVStudioDesign,
  StudioContent,
} from "../../src/antv-studio/types";
import {defaultProject} from "../../shared/project";
import type {StudioProject} from "../../shared/project";

const formatOrder: StudioFormatId[] = ["portrait", "square", "vertical"];
const inspectorTabs = ["Scene", "Camera", "Transition"] as const;
const engineOrder: AntVEngine[] = ["g2", "g6"];
const appDesigns = antVStudioDesigns.filter((design) =>
  engineOrder.includes(design.engine),
);
const appCategories = Array.from(
  new Set(appDesigns.map((design) => design.category)),
).sort();

const copyProject = (project: AdvancedStudioProject): AdvancedStudioProject =>
  JSON.parse(JSON.stringify(project)) as AdvancedStudioProject;

const boardProjectCopy = (): StudioProject =>
  JSON.parse(JSON.stringify(defaultProject)) as StudioProject;

const titleForScene = (scene: AdvancedStudioScene) => scene.title;

const subtitleForScene = (scene: AdvancedStudioScene) =>
  scene.type === "board" ? "Board Scene" : `${scene.type.toUpperCase()} Infographic`;

const sceneTone = (scene: AdvancedStudioScene): "board" | "chart" | "cta" =>
  scene.type === "board"
    ? (scene.content as BoardSceneContent).activeBlockId
      ? "board"
      : "cta"
    : "chart";

const formatFrameTime = (frame: number) => {
  const totalSeconds = Math.floor(frame / advancedStudioIntegrationFps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const frameRemainder = frame % advancedStudioIntegrationFps;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}:${String(frameRemainder).padStart(2, "0")}`;
};

const formatRange = (scene: AdvancedStudioTimedScene) =>
  `${formatFrameTime(scene.startFrame).slice(0, 5)} - ${formatFrameTime(
    scene.endFrame,
  ).slice(0, 5)}`;

const animationLabel = (animation?: string) => {
  if (!animation) return "None";
  return animation
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

const AnimationPresetIcon = ({
  preset,
}: {
  preset: (typeof animationPresets)[number]["id"];
}) => {
  if (preset === "focus") return <Crosshair size={18} />;
  if (preset === "reveal") return <Eye size={18} />;
  if (preset === "compare") return <GitCompareArrows size={18} />;
  if (preset === "overview") return <Fullscreen size={18} />;
  if (preset === "spotlight") return <Wand2 size={18} />;
  if (preset === "build" || preset === "count") return <WandSparkles size={18} />;
  return <Sparkles size={18} />;
};

const designForScene = (scene: AdvancedStudioScene) => {
  if (scene.type === "board") return null;
  const content = scene.content as AdvancedStudioInfographicContent;
  return appDesigns.find(
    (design) => design.id === content.designId && design.engine === scene.type,
  );
};

const firstDesignForEngine = (engine: AntVEngine) => {
  const design = appDesigns.find((item) => item.engine === engine);
  if (!design) throw new Error(`No ${engine} designs registered.`);
  return design;
};

export const AdvancedStudioApp: React.FC = () => {
  const playerRef = React.useRef<PlayerRef>(null);
  const rulerRef = React.useRef<HTMLDivElement>(null);
  const [project, setProject] = React.useState<AdvancedStudioProject>(() =>
    copyProject(advancedStudioDefaultProject),
  );
  const [formatId, setFormatId] = React.useState<StudioFormatId>("portrait");
  const [selectedSceneId, setSelectedSceneId] = React.useState(
    project.scenes[1]?.id ?? project.scenes[0]?.id,
  );
  const [currentFrame, setCurrentFrame] = React.useState(152);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [inspectorTab, setInspectorTab] =
    React.useState<(typeof inspectorTabs)[number]>("Scene");
  const [zoomLabel, setZoomLabel] = React.useState("100%");
  const [renderStatus, setRenderStatus] = React.useState<
    "idle" | "rendering" | "complete" | "error"
  >("idle");

  const timedScenes = React.useMemo(
    () => getAdvancedStudioTimedScenes(project),
    [project],
  );
  const duration = getAdvancedStudioProjectDuration(project);
  const selectedScene =
    timedScenes.find((scene) => scene.id === selectedSceneId) ?? timedScenes[0];
  const activeScene = getAdvancedStudioSceneAtFrame(currentFrame, project);
  const format = advancedStudioIntegrationFormats[formatId];

  React.useEffect(() => {
    if (activeScene && activeScene.id !== selectedSceneId) {
      setSelectedSceneId(activeScene.id);
    }
  }, [activeScene, selectedSceneId]);

  React.useEffect(() => {
    if (currentFrame >= duration) {
      const next = Math.max(0, duration - 1);
      setCurrentFrame(next);
      playerRef.current?.seekTo(next);
    }
  }, [currentFrame, duration]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = ({detail}: {detail: {frame: number}}) =>
      setCurrentFrame(Math.round(detail.frame));
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("seeked", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);
    player.seekTo(currentFrame);

    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("seeked", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
    };
  }, []);

  const seekToFrame = React.useCallback(
    (frame: number) => {
      const nextFrame = Math.max(0, Math.min(duration - 1, Math.round(frame)));
      playerRef.current?.seekTo(nextFrame);
      setCurrentFrame(nextFrame);
    },
    [duration],
  );

  const selectScene = (scene: AdvancedStudioTimedScene) => {
    setSelectedSceneId(scene.id);
    seekToFrame(scene.startFrame);
  };

  const updateScene = (
    id: string,
    updater: (scene: AdvancedStudioScene) => AdvancedStudioScene,
  ) => {
    setProject((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === id ? updater(scene) : scene,
      ),
    }));
  };

  const deleteScene = (id: string) => {
    if (project.scenes.length <= 1) return;
    const index = project.scenes.findIndex((scene) => scene.id === id);
    const nextScenes = project.scenes.filter((scene) => scene.id !== id);
    const nextSelected = nextScenes[Math.max(0, index - 1)] ?? nextScenes[0];
    setProject((current) => ({...current, scenes: nextScenes}));
    setSelectedSceneId(nextSelected.id);
    seekToFrame(0);
  };

  const moveScene = (id: string, direction: -1 | 1) => {
    const index = project.scenes.findIndex((scene) => scene.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= project.scenes.length) return;
    const nextScenes = [...project.scenes];
    const [scene] = nextScenes.splice(index, 1);
    nextScenes.splice(target, 0, scene);
    setProject((current) => ({...current, scenes: nextScenes}));
  };

  const togglePlayback = () => {
    if (!playerRef.current) return;
    playerRef.current.toggle();
    setIsPlaying(playerRef.current.isPlaying());
  };

  const stepScene = (direction: -1 | 1) => {
    const currentIndex = timedScenes.findIndex(
      (scene) => scene.id === selectedSceneId,
    );
    const next =
      timedScenes[
        Math.max(0, Math.min(timedScenes.length - 1, currentIndex + direction))
      ];
    if (next) selectScene(next);
  };

  const scrubTimeline = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = rulerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    seekToFrame(((event.clientX - bounds.left) / bounds.width) * duration);
  };

  const previewSelectedScene = () => {
    if (!selectedScene) return;
    seekToFrame(selectedScene.startFrame);
    requestAnimationFrame(() => playerRef.current?.play());
  };

  const applyDesignToSelectedScene = (design: AntVStudioDesign) => {
    if (!selectedScene) return;
    updateScene(selectedScene.id, (current) => ({
      ...current,
      type: design.engine,
      title: design.name,
      content: createAdvancedStudioInfographicContent(design),
    }));
    seekToFrame(selectedScene.startFrame);
    requestAnimationFrame(() => playerRef.current?.play());
  };

  const renderAdvanced = async () => {
    setRenderStatus("rendering");
    try {
      const response = await fetch("/api/render-advanced", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({project, formatId}),
      });
      if (!response.ok) throw new Error("Render failed");
      setRenderStatus("complete");
    } catch {
      setRenderStatus("error");
    }
  };

  return (
    <div className="advanced-shell">
      <header className="advanced-topbar">
        <div className="brand-lockup">
          <div className="fp-mark">FP</div>
          <div className="brand-divider" />
          <button className="studio-title-button" type="button">
            Advanced Studio <ChevronDown size={16} />
          </button>
        </div>

        <div className="format-switcher" role="group" aria-label="Output format">
          {formatOrder.map((id) => {
            const option = advancedStudioIntegrationFormats[id];
            const active = id === formatId;
            const Icon = id === "vertical" ? Ratio : Square;
            return (
              <button
                key={id}
                className={`format-option ${active ? "active" : ""}`}
                type="button"
                onClick={() => setFormatId(id)}
              >
                <Icon size={20} />
                <span>
                  <strong>{option.label}</strong>
                  <small>
                    {option.width}x{option.height}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="top-actions">
          <button className="toolbar-button" type="button" onClick={previewSelectedScene}>
            <Play size={16} /> Preview
          </button>
          <button className="toolbar-button disabled" type="button" disabled>
            <Upload size={16} /> Export
          </button>
          <button
            className="render-button"
            type="button"
            onClick={renderAdvanced}
            disabled={renderStatus === "rendering"}
          >
            <Wand2 size={16} />
            {renderStatus === "rendering"
              ? "Rendering"
              : renderStatus === "complete"
                ? "Rendered"
                : renderStatus === "error"
                  ? "Render Failed"
                  : "Render"}
          </button>
          <button className="icon-button" type="button" aria-label="Settings" disabled>
            <Settings size={18} />
          </button>
        </div>
      </header>

      <aside className="scene-browser">
        <div className="panel-heading">
          <h1>Templates</h1>
        </div>

        <div className="left-template-browser">
          <UniversalTemplateBrowser
            selectedDesignId={
              selectedScene?.type === "board"
                ? undefined
                : (selectedScene?.content as AdvancedStudioInfographicContent | undefined)
                    ?.designId
            }
            selectedEngine={
              selectedScene && selectedScene.type !== "board"
                ? (selectedScene.type as AntVEngine)
                : undefined
            }
            onApply={applyDesignToSelectedScene}
          />
        </div>

        <div className="scene-total">
          <span>Project Duration</span>
          <strong>
            {formatFrameTime(duration).slice(0, 5)} ({duration} frames)
          </strong>
        </div>
      </aside>

      <main className="preview-pane">
        <div className="preview-toolbar">
          <div>
            <span>Current Scene</span>
            <button type="button" onClick={() => selectedScene && selectScene(selectedScene)}>
              {selectedScene ? titleForScene(selectedScene) : "None"}{" "}
              <small>{selectedScene ? `(${subtitleForScene(selectedScene)})` : ""}</small>
              <ChevronDown size={14} />
            </button>
          </div>
          <button
            className="zoom-button"
            type="button"
            onClick={() => setZoomLabel((label) => (label === "100%" ? "Fit" : "100%"))}
          >
            <ZoomIn size={15} /> {zoomLabel} <ChevronDown size={14} />
          </button>
        </div>

        <div className="stage-area">
          <div
            className="stage-shell"
            style={{aspectRatio: `${format.width} / ${format.height}`}}
          >
            <Player
              ref={playerRef}
              component={AdvancedStudioIntegrationProof}
              durationInFrames={Math.max(1, duration)}
              fps={advancedStudioIntegrationFps}
              compositionWidth={format.width}
              compositionHeight={format.height}
              inputProps={{formatId, project}}
              initialFrame={Math.min(currentFrame, duration - 1)}
              controls={false}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>

        <div className="playback-bar">
          <button className="icon-button" type="button" onClick={() => seekToFrame(0)}>
            <SkipBack size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => stepScene(-1)}>
            <SkipBack size={18} strokeWidth={1.5} />
          </button>
          <button className="play-button" type="button" onClick={togglePlayback}>
            {isPlaying ? <Pause size={22} /> : <Play size={22} />}
          </button>
          <button className="icon-button" type="button" onClick={() => stepScene(1)}>
            <SkipForward size={18} strokeWidth={1.5} />
          </button>
          <div className="time-readout">
            <strong>{formatFrameTime(currentFrame)}</strong>
            <span>/ {formatFrameTime(duration)}</span>
            <em>
              ({currentFrame} / {duration})
            </em>
          </div>
          <button className="fit-button" type="button" onClick={() => setZoomLabel("Fit")}>
            Fit
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => playerRef.current?.requestFullscreen()}
            aria-label="Fullscreen"
          >
            <Fullscreen size={18} />
          </button>
        </div>
      </main>

      <aside className="inspector">
        <div className="inspector-tabs">
          {inspectorTabs.map((tab) => (
            <button
              key={tab}
              className={tab === inspectorTab ? "active" : ""}
              type="button"
              onClick={() => setInspectorTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <InspectorBody
          scene={selectedScene}
          tab={inspectorTab}
          onPreview={previewSelectedScene}
          onUpdate={(updater) => selectedScene && updateScene(selectedScene.id, updater)}
          onDelete={() => selectedScene && deleteScene(selectedScene.id)}
          onMove={(direction) => selectedScene && moveScene(selectedScene.id, direction)}
        />
      </aside>

      <section className="timeline">
        <div className="timeline-board">
          <div className="ruler" ref={rulerRef} onPointerDown={scrubTimeline}>
            {Array.from({length: Math.floor(duration / 30) + 1}).map(
              (_, index) => {
                const frame = index * 30;
                return (
                  <span key={frame} style={{left: `${(frame / duration) * 100}%`}}>
                    {frame}f
                  </span>
                );
              },
            )}
          </div>
          <div className="tracks">
            <div className="video-track">
              {timedScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  className={`timeline-segment ${
                    scene.id === selectedSceneId ? "selected" : ""
                  }`}
                  type="button"
                  onClick={() => selectScene(scene)}
                  style={{
                    left: `${(scene.startFrame / duration) * 100}%`,
                    width: `${(scene.durationFrames / duration) * 100}%`,
                  }}
                >
                  <span className="segment-index">{index + 1}</span>
                  <SceneThumbnail tone={sceneTone(scene)} small />
                  <strong>{titleForScene(scene)}</strong>
                  <em>{subtitleForScene(scene)}</em>
                </button>
              ))}
              {timedScenes.slice(1).map((scene) =>
                scene.transitionIn ? (
                  <span
                    key={scene.id}
                    className="transition-chip"
                    style={{left: `${(scene.startFrame / duration) * 100}%`}}
                  >
                    <Share2 size={14} /> {scene.transitionIn.durationFrames}f
                  </span>
                ) : null,
              )}
            </div>
            <div className="camera-track">
              <div
                className="camera-curve"
                style={{
                  left: `${((selectedScene?.startFrame ?? 0) / duration) * 100}%`,
                  width: `${
                    ((selectedScene?.durationFrames ?? 0) / duration) * 100
                  }%`,
                }}
              >
                <span>
                  {
                    getAdvancedStudioCameraPath(
                      selectedScene?.cameraPath?.preset ??
                        selectedScene?.cameraPreset ??
                        "static",
                    ).label
                  }
                </span>
                <i className="camera-path-line" />
              </div>
            </div>
            <div className="audio-track">
              <div className="waveform" />
            </div>
            <div className="music-track">
              <span>Upbeat Corporate</span>
            </div>
          </div>
          <div
            className="playhead"
            style={{left: `${(currentFrame / duration) * 100}%`}}
          />
        </div>
      </section>
    </div>
  );
};

const SceneThumbnail: React.FC<{
  tone: "board" | "chart" | "cta";
  small?: boolean;
}> = ({tone, small}) => (
  <span className={`scene-thumb ${tone} ${small ? "small" : ""}`}>
    {tone === "chart" ? (
      <span className="mini-bars">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    ) : (
      <span className="mini-board">
        <i />
        <b>{tone === "cta" ? "DRIVE" : "BUDGET"}</b>
      </span>
    )}
  </span>
);

const InspectorBody: React.FC<{
  scene?: AdvancedStudioTimedScene;
  tab: (typeof inspectorTabs)[number];
  onPreview: () => void;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}> = ({scene, tab, onPreview, onUpdate, onDelete, onMove}) => {
  if (!scene) return null;

  const isBoard = scene.type === "board";
  const boardContent = scene.content as BoardSceneContent;
  const infographicContent = scene.content as AdvancedStudioInfographicContent;
  const design = designForScene(scene);

  if (tab === "Camera") {
    return (
      <div className="inspector-body">
        <AnimationReviewCameraInspector
          scene={scene}
          onUpdate={onUpdate}
        />
      </div>
    );
  }

  if (tab === "Transition") {
    return (
      <div className="inspector-body">
        <TransitionInspector scene={scene} onUpdate={onUpdate} />
      </div>
    );
  }

  const updateContent = (content: StudioContent) => {
    onUpdate((current) => ({
      ...current,
      title: content.title,
      content: {
        ...(current.content as AdvancedStudioInfographicContent),
        content,
      },
    }));
  };

  return (
    <div className="inspector-body">
      <InspectorField label="Scene">
        <input
          className="advanced-input"
          value={scene.title}
          onChange={(event) =>
            onUpdate((current) => ({...current, title: event.target.value}))
          }
        />
        <div className="scene-actions">
          <button type="button" onClick={() => onMove(-1)}>Move Up</button>
          <button type="button" onClick={() => onMove(1)}>Move Down</button>
          <button type="button" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </InspectorField>

      <InspectorField label="Scene Type">
        <select
          className="advanced-input"
          value={scene.type}
          onChange={(event) => {
            const type = event.target.value as AdvancedStudioSceneType;
            onUpdate((current) => {
              if (type === "board") {
                return {
                  ...current,
                  type,
                  title: "Board Focus",
                  content: {
                    project: boardProjectCopy(),
                    activeBlockId: "budget",
                    animation: "focus",
                  },
                };
              }
              const nextDesign = firstDesignForEngine(type);
              return {
                ...current,
                type,
                title: nextDesign.name,
                content: createAdvancedStudioInfographicContent(nextDesign),
              };
            });
          }}
        >
          <option value="board">Board Scene</option>
          <option value="g2">G2 Infographic</option>
          <option value="g6">G6 Infographic</option>
        </select>
      </InspectorField>

      <InspectorField label="Duration">
        <div className="dual-fields">
          <label>
            <input
              className="advanced-input"
              type="number"
              min={30}
              step={15}
              value={scene.durationFrames}
              onChange={(event) =>
                onUpdate((current) => ({
                  ...current,
                  durationFrames: Math.max(30, Number(event.target.value) || 30),
                }))
              }
            />
            frames
          </label>
          <span>
            <strong>{formatFrameTime(scene.durationFrames)}</strong> time
          </span>
        </div>
      </InspectorField>

      {isBoard ? (
        <BoardInspector
          content={boardContent}
          onChange={(content) =>
            onUpdate((current) => ({...current, content}))
          }
        />
      ) : design ? (
        <InfographicInspector
          scene={scene}
          design={design}
          content={infographicContent.content ?? cloneContent(design.defaultContent)}
          onDesign={(nextDesign) =>
            onUpdate((current) => ({
              ...current,
              type: nextDesign.engine,
              title: nextDesign.name,
              content: createAdvancedStudioInfographicContent(nextDesign),
            }))
          }
          onContent={updateContent}
          onControls={(controls) =>
            onUpdate((current) => ({
              ...current,
              content: {
                ...(current.content as AdvancedStudioInfographicContent),
                controls,
              },
            }))
          }
        />
      ) : null}

      <InspectorField label="Animation">
        <div className="asset-row compact">
          {isBoard ? <Film size={18} /> : <BarChart3 size={18} />}
          <span>
            <strong>
              {isBoard
                ? animationLabel(boardContent.animation)
                : animationLabel(design?.animation)}
            </strong>
          </span>
          <button type="button" onClick={onPreview}>
            Preview
          </button>
        </div>
      </InspectorField>
    </div>
  );
};

const AnimationReviewCameraInspector: React.FC<{
  scene: AdvancedStudioScene;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
}> = ({scene, onUpdate}) => {
  const isBoard = scene.type === "board";
  const boardContent = isBoard ? (scene.content as BoardSceneContent) : null;
  const infographicContent = isBoard
    ? null
    : (scene.content as AdvancedStudioInfographicContent);
  const currentAnimation =
    boardContent?.animation ?? infographicContent?.objectMotion;
  const applyAnimation = (animation: BoardSceneContent["animation"]) =>
    onUpdate((current) => {
      if (current.type !== "board") {
        if (animation !== "focus") return current;

        return {
          ...current,
          content: {
            ...(current.content as AdvancedStudioInfographicContent),
            objectMotion: "focus",
          },
        };
      }

      const content = current.content as BoardSceneContent;

      return {
        ...current,
        content: {
          ...content,
          animation,
          activeBlockId: animation === "overview" ? null : content.activeBlockId,
        },
      };
    });

  return (
    <InspectorField label="Animation Presets">
      <div className="panel-subheading">
        Focus targets the selected scene object. Infographics use the whole scene
        as the target for now.
      </div>
      <div className="animation-preset-grid">
        {animationPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={currentAnimation === preset.id ? "active" : ""}
            title={
              preset.id === "focus"
                ? "Apply focus motion to the selected scene object."
                : "Only Focus is wired for infographic canvas objects in this slice."
            }
            onClick={() => applyAnimation(preset.id)}
          >
            <AnimationPresetIcon preset={preset.id} />
            <span>
              <strong>{preset.label}</strong>
              <small>{preset.description}</small>
            </span>
          </button>
        ))}
      </div>
    </InspectorField>
  );
};

const TransitionInspector: React.FC<{
  scene: AdvancedStudioScene;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
}> = ({scene, onUpdate}) => (
  <InspectorField label="Transitions">
    <div className="transition-row">
      <Share2 size={16} />
      <span>Crossfade In</span>
      <input
        className="advanced-input compact-number"
        type="number"
        min={0}
        value={scene.transitionIn?.durationFrames ?? 0}
        onChange={(event) =>
          onUpdate((current) => ({
            ...current,
            transitionIn:
              Number(event.target.value) > 0
                ? {preset: "crossfade", durationFrames: Number(event.target.value)}
                : undefined,
          }))
        }
      />
    </div>
    <div className="transition-row">
      <Share2 size={16} />
      <span>Crossfade Out</span>
      <input
        className="advanced-input compact-number"
        type="number"
        min={0}
        value={scene.transitionOut?.durationFrames ?? 0}
        onChange={(event) =>
          onUpdate((current) => ({
            ...current,
            transitionOut:
              Number(event.target.value) > 0
                ? {preset: "crossfade", durationFrames: Number(event.target.value)}
                : undefined,
          }))
        }
      />
    </div>
  </InspectorField>
);

const UniversalTemplateBrowser: React.FC<{
  selectedDesignId?: string;
  selectedEngine?: AntVEngine;
  onApply: (design: AntVStudioDesign) => void;
}> = ({selectedDesignId, selectedEngine, onApply}) => {
  const [engine, setEngine] = React.useState<AntVEngine | "all">(
    selectedEngine ?? "all",
  );
  const [category, setCategory] = React.useState("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (selectedEngine) setEngine(selectedEngine);
  }, [selectedEngine]);

  const visibleDesigns = appDesigns.filter((design) => {
    if (engine !== "all" && design.engine !== engine) return false;
    if (category !== "all" && design.category !== category) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      design.name,
      design.category,
      design.description,
      design.engine,
      design.industryExample,
    ].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <InspectorField label="Universal Template Browser">
      <div className="template-browser-controls">
        <input
          className="advanced-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search G2 or G6 templates"
        />
        <div className="engine-filter-row">
          <button
            type="button"
            className={engine === "all" ? "active" : ""}
            onClick={() => setEngine("all")}
          >
            All
          </button>
          {engineOrder.map((item) => (
            <button
              key={item}
              type="button"
              className={engine === item ? "active" : ""}
              onClick={() => setEngine(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <select
          className="advanced-input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {appCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="template-browser-count">
          {visibleDesigns.length} visible / {appDesigns.length} total
        </div>
      </div>

      <div className="template-library-grid">
        {visibleDesigns.map((design) => (
          <button
            key={design.id}
            type="button"
            className={selectedDesignId === design.id ? "active" : ""}
            onClick={() => onApply(design)}
          >
            <TemplateThumbnail templateId={design.id} />
            <span className="template-card-copy">
              <strong>{design.name}</strong>
              <small>
                {design.engine.toUpperCase()} · {design.category} ·{" "}
                {animationLabel(design.animation)}
              </small>
            </span>
          </button>
        ))}
      </div>
    </InspectorField>
  );
};

const TemplateThumbnail: React.FC<{
  templateId: string;
}> = ({templateId}) => (
  <span className="g2-template-thumbnail">
    <img
      src={`/antv-studio-previews/${templateId}.png`}
      alt=""
      loading="lazy"
    />
  </span>
);

const BoardInspector: React.FC<{
  content: BoardSceneContent;
  onChange: (content: BoardSceneContent) => void;
}> = ({content, onChange}) => {
  const project = content.project ?? boardProjectCopy();
  const block = content.activeBlockId
    ? project.blocks.find((item) => item.id === content.activeBlockId)
    : null;
  return (
    <>
      <InspectorField label="Board Content">
        <input
          className="advanced-input"
          value={project.title}
          onChange={(event) =>
            onChange({...content, project: {...project, title: event.target.value}})
          }
        />
        <input
          className="advanced-input"
          value={project.subtitle}
          onChange={(event) =>
            onChange({...content, project: {...project, subtitle: event.target.value}})
          }
        />
        {block ? (
          <input
            className="advanced-input"
            value={block.title}
            onChange={(event) =>
              onChange({
                ...content,
                project: {
                  ...project,
                  blocks: project.blocks.map((item) =>
                    item.id === block.id ? {...item, title: event.target.value} : item,
                  ),
                },
              })
            }
          />
        ) : null}
      </InspectorField>

      <InspectorField label="Board Focus">
        <select
          className="advanced-input"
          value={content.activeBlockId ?? "overview"}
          onChange={(event) =>
            onChange({
              ...content,
              activeBlockId:
                event.target.value === "overview" ? null : event.target.value,
            })
          }
        >
          <option value="overview">Full Overview</option>
          {project.blocks.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </InspectorField>

    </>
  );
};

const InfographicInspector: React.FC<{
  scene: AdvancedStudioScene;
  design: AntVStudioDesign;
  content: StudioContent;
  onDesign: (design: AntVStudioDesign) => void;
  onContent: (content: StudioContent) => void;
  onControls: (controls: AdvancedStudioInfographicContent["controls"]) => void;
}> = ({
  scene,
  design,
  content,
  onDesign,
  onContent,
  onControls,
}) => {
  const sceneContent = scene.content as AdvancedStudioInfographicContent;
  const controls = sceneContent.controls ?? defaultControls;
  const designs = appDesigns.filter((item) => item.engine === scene.type);

  return (
    <>
      <InspectorField label="Design Browser">
        <select
          className="advanced-input"
          value={design.id}
          onChange={(event) => {
            const next = appDesigns.find(
              (item) => item.id === event.target.value,
            );
            if (next) onDesign(next);
          }}
        >
          {designs.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.category}
            </option>
          ))}
        </select>
        <div className="engine-filter-row">
          {engineOrder.map((engine) => (
            <button
              key={engine}
              type="button"
              className={scene.type === engine ? "active" : ""}
              onClick={() => onDesign(firstDesignForEngine(engine))}
            >
              {engine.toUpperCase()}
            </button>
          ))}
        </div>
      </InspectorField>

      <InspectorField label="Content">
        <input
          className="advanced-input"
          value={content.title}
          onChange={(event) => onContent({...content, title: event.target.value})}
        />
        <input
          className="advanced-input"
          value={content.subtitle ?? ""}
          onChange={(event) =>
            onContent({...content, subtitle: event.target.value})
          }
        />
        {design.engine === "g6"
          ? (content.nodes ?? []).map((node, index) => (
              <input
                key={node.id}
                className="advanced-input"
                value={node.label}
                onChange={(event) =>
                  onContent({
                    ...content,
                    nodes: (content.nodes ?? []).map((item, nodeIndex) =>
                      nodeIndex === index
                        ? {...item, label: event.target.value}
                        : item,
                    ),
                  })
                }
              />
            ))
          : content.rows.map((row, index) => (
              <div className="data-row" key={row.id}>
                <input
                  className="advanced-input"
                  value={row.label}
                  onChange={(event) =>
                    onContent({
                      ...content,
                      rows: content.rows.map((item, rowIndex) =>
                        rowIndex === index
                          ? {...item, label: event.target.value}
                          : item,
                      ),
                    })
                  }
                />
                <input
                  className="advanced-input"
                  type="number"
                  value={row.value}
                  onChange={(event) =>
                    onContent({
                      ...content,
                      rows: content.rows.map((item, rowIndex) =>
                        rowIndex === index
                          ? {...item, value: Number(event.target.value) || 0}
                          : item,
                      ),
                    })
                  }
                />
              </div>
            ))}
      </InspectorField>

      <InspectorField label="Design Controls">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.showLabels}
            onChange={(event) =>
              onControls({...controls, showLabels: event.target.checked})
            }
          />
          Labels
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.showLegend}
            onChange={(event) =>
              onControls({...controls, showLegend: event.target.checked})
            }
          />
          Legend
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={controls.compact}
            onChange={(event) =>
              onControls({...controls, compact: event.target.checked})
            }
          />
          Compact
        </label>
      </InspectorField>
    </>
  );
};

const InspectorField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({label, children}) => (
  <section className="inspector-field">
    <h2>{label}</h2>
    {children}
  </section>
);
