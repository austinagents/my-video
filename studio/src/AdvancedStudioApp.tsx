import React from "react";
import {Player, type PlayerRef} from "@remotion/player";
import {
  BarChart3,
  ChevronDown,
  Download,
  Film,
  Folder,
  Frame,
  Fullscreen,
  Image,
  Layers3,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  Ratio,
  RotateCcw,
  RotateCw,
  Scissors,
  Settings,
  Share2,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  Type,
  Upload,
  Video,
  Volume2,
  Wand2,
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
import type {BoardSceneContent} from "../../src/advanced-studio/BoardSceneRenderer";
import type {
  AdvancedStudioInfographicContent,
  AdvancedStudioProject,
  AdvancedStudioScene,
  AdvancedStudioSceneType,
  AdvancedStudioTimedScene,
} from "../../src/advanced-studio/scene-contract";
import {
  advancedStudioCameraPaths,
  getAdvancedStudioCameraPath,
} from "../../src/advanced-studio/camera-paths";
import {advancedStudioG2Templates} from "../../src/advanced-studio/g2-template-library";
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
const inspectorTabs = ["Scene", "Camera", "Transition", "Settings"] as const;
const engineOrder: AntVEngine[] = ["g2", "g6", "s2"];

const navItems = [
  {label: "Project", icon: Folder},
  {label: "Scenes", icon: Frame, active: true},
  {label: "Media", icon: Image},
  {label: "Graphics", icon: Scissors},
  {label: "Text", icon: Type},
  {label: "Music", icon: Music},
  {label: "Brand", icon: Sparkles},
  {label: "Settings", icon: Settings},
];

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

const designForScene = (scene: AdvancedStudioScene) => {
  if (scene.type === "board") return null;
  const content = scene.content as AdvancedStudioInfographicContent;
  return antVStudioDesigns.find(
    (design) => design.id === content.designId && design.engine === scene.type,
  );
};

const firstDesignForEngine = (engine: AntVEngine) => {
  const design = antVStudioDesigns.find((item) => item.engine === engine);
  if (!design) throw new Error(`No ${engine} designs registered.`);
  return design;
};

const newInfographicScene = (engine: AntVEngine): AdvancedStudioScene => {
  const design = firstDesignForEngine(engine);
  return {
    id: `${engine}-${Date.now()}`,
    type: engine,
    title: design.name,
    durationFrames: 150,
    content: createAdvancedStudioInfographicContent(design),
    transitionIn: {preset: "crossfade", durationFrames: 18},
    transitionOut: {preset: "crossfade", durationFrames: 18},
    cameraPath: {preset: "push-in"},
  };
};

const newBoardScene = (): AdvancedStudioScene => ({
  id: `board-${Date.now()}`,
  type: "board",
  title: "Board Focus",
  durationFrames: 120,
  content: {
    project: boardProjectCopy(),
    activeBlockId: "budget",
    animation: "focus",
  },
  transitionIn: {preset: "crossfade", durationFrames: 18},
  transitionOut: {preset: "crossfade", durationFrames: 18},
  cameraPath: {preset: "overview-sweep"},
});

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
  const [addSceneOpen, setAddSceneOpen] = React.useState(false);
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

  const addScene = (scene: AdvancedStudioScene) => {
    const nextProject = {...project, scenes: [...project.scenes, scene]};
    const start =
      getAdvancedStudioTimedScenes(nextProject).find(
        (item) => item.id === scene.id,
      )?.startFrame ?? 0;

    setProject(nextProject);
    setSelectedSceneId(scene.id);
    setCurrentFrame(start);
    setAddSceneOpen(false);
    window.setTimeout(() => {
      playerRef.current?.seekTo(start);
      setCurrentFrame(start);
    }, 50);
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

      <aside className="left-rail">
        <div className="nav-stack">
          {navItems.map(({label, icon: Icon, active}) => (
            <button
              key={label}
              className={`nav-button ${active ? "active" : ""}`}
              type="button"
              disabled={!active}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="rail-history">
          <button className="icon-button" type="button" disabled aria-label="Undo">
            <RotateCcw size={17} />
          </button>
          <button className="icon-button" type="button" disabled aria-label="Redo">
            <RotateCw size={17} />
          </button>
        </div>
      </aside>

      <aside className="scene-browser">
        <div className="panel-heading">
          <h1>Scenes</h1>
          <div className="add-scene-wrap">
            <button
              className="secondary-button"
              type="button"
              onClick={() => setAddSceneOpen((open) => !open)}
            >
              <Plus size={16} /> Add Scene
            </button>
            {addSceneOpen ? (
              <div className="add-popover">
                <button type="button" onClick={() => addScene(newBoardScene())}>
                  Board Scene <span>Original Studio board</span>
                </button>
                {engineOrder.map((engine) => (
                  <button
                    key={engine}
                    type="button"
                    onClick={() => addScene(newInfographicScene(engine))}
                  >
                    {engine.toUpperCase()} Infographic
                    <span>{firstDesignForEngine(engine).name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="scene-list">
          {timedScenes.map((scene, index) => (
            <button
              key={scene.id}
              className={`scene-card ${scene.id === selectedSceneId ? "selected" : ""}`}
              type="button"
              onClick={() => selectScene(scene)}
            >
              <span className="scene-index">{index + 1}</span>
              <SceneThumbnail tone={sceneTone(scene)} />
              <span className="scene-summary">
                <strong>{titleForScene(scene)}</strong>
                <small>{subtitleForScene(scene)}</small>
                <em>
                  {formatRange(scene)} ({scene.durationFrames}f)
                </em>
              </span>
              <span className="scene-more">•••</span>
            </button>
          ))}
        </div>

        <div className="scene-total">
          <span>Total Duration</span>
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
        <div className="timeline-labels">
          <TrackLabel icon={Video} label="Video" />
          <TrackLabel icon={Radio} label="Camera" />
          <TrackLabel icon={Volume2} label="Audio" />
          <TrackLabel icon={Music} label="Music" />
        </div>
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

const TrackLabel: React.FC<{
  icon: React.ComponentType<{size?: number}>;
  label: string;
}> = ({icon: Icon, label}) => (
  <div className="track-label">
    <Icon size={17} />
    <span>{label}</span>
  </div>
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
        <CameraLibraryInspector scene={scene} onUpdate={onUpdate} />
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

  if (tab === "Settings") {
    return (
      <div className="inspector-body">
        <G2TemplateLibraryInspector
          selectedTemplateId={
            scene.type === "g2"
              ? (scene.content as AdvancedStudioInfographicContent).designId
              : undefined
          }
          onChange={(templateId) => {
            const design = antVStudioDesigns.find(
              (item) => item.id === templateId && item.engine === "g2",
            );
            if (!design) return;
            onUpdate((current) => ({
              ...current,
              type: "g2",
              title: design.name,
              content: createAdvancedStudioInfographicContent(design),
            }));
          }}
        />
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
          <option value="s2">S2 Infographic</option>
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

const CameraLibraryInspector: React.FC<{
  scene: AdvancedStudioScene;
  onUpdate: (updater: (scene: AdvancedStudioScene) => AdvancedStudioScene) => void;
}> = ({scene, onUpdate}) => (
  <InspectorField label="Camera Library">
    <div className="asset-row compact">
      <Frame size={18} />
      <select
        className="advanced-input"
        value={scene.cameraPath?.preset ?? scene.cameraPreset ?? "static"}
        onChange={(event) =>
          onUpdate((current) => ({
            ...current,
            cameraPath: {
              preset: event.target
                .value as NonNullable<AdvancedStudioScene["cameraPath"]>["preset"],
            },
            cameraPreset: undefined,
          }))
        }
      >
        {advancedStudioCameraPaths.map((path) => (
          <option key={path.id} value={path.id}>
            {path.label}
          </option>
        ))}
      </select>
    </div>
    <div className="camera-path-grid">
      {advancedStudioCameraPaths.map((path) => (
        <button
          key={path.id}
          type="button"
          className={
            (scene.cameraPath?.preset ?? scene.cameraPreset ?? "static") ===
            path.id
              ? "active"
              : ""
          }
          onClick={() =>
            onUpdate((current) => ({
              ...current,
              cameraPath: {preset: path.id},
              cameraPreset: undefined,
            }))
          }
        >
          <span>
            <i
              style={{
                left: `${50 + path.points[0].x}%`,
                top: `${50 + path.points[0].y}%`,
              }}
            />
            <b
              style={{
                left: `${50 + path.points[1].x}%`,
                top: `${50 + path.points[1].y}%`,
              }}
            />
          </span>
          <strong>{path.label}</strong>
        </button>
      ))}
    </div>
  </InspectorField>
);

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

const G2TemplateLibraryInspector: React.FC<{
  selectedTemplateId?: string;
  onChange: (templateId: string) => void;
}> = ({selectedTemplateId, onChange}) => (
  <InspectorField label="AntV G2 Template Library">
    <select
      className="advanced-input"
      value={selectedTemplateId ?? ""}
      onChange={(event) => event.target.value && onChange(event.target.value)}
    >
      <option value="">Choose a G2 template</option>
      {advancedStudioG2Templates.map((template) => (
        <option key={template.id} value={template.id}>
          {template.label} · {template.category}
        </option>
      ))}
    </select>
    <div className="template-library-grid">
      {advancedStudioG2Templates.map((template) => (
        <button
          key={template.id}
          type="button"
          className={selectedTemplateId === template.id ? "active" : ""}
          onClick={() => onChange(template.id)}
        >
          <G2TemplateThumbnail templateId={template.id} />
          <span className="template-card-copy">
            <strong>{template.label}</strong>
            <small>{template.category} · {animationLabel(template.animation)}</small>
          </span>
        </button>
      ))}
    </div>
  </InspectorField>
);

const G2TemplateThumbnail: React.FC<{
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
        <select
          className="advanced-input"
          value={content.animation}
          onChange={(event) =>
            onChange({...content, animation: event.target.value as BoardSceneContent["animation"]})
          }
        >
          {["focus", "reveal", "build", "trace", "compare", "count", "spotlight", "overview"].map(
            (item) => (
              <option key={item} value={item}>
                {animationLabel(item)}
              </option>
            ),
          )}
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
  const designs = antVStudioDesigns.filter((item) => item.engine === scene.type);

  return (
    <>
      <InspectorField label="Design Browser">
        <select
          className="advanced-input"
          value={design.id}
          onChange={(event) => {
            const next = antVStudioDesigns.find(
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
