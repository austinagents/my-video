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
  SlidersHorizontal,
  Sparkles,
  Square,
  Type,
  Upload,
  Video,
  Volume2,
  Wand2,
  ZoomIn,
} from "lucide-react";
import {
  AdvancedStudioIntegrationProof,
  advancedStudioIntegrationFormats,
  advancedStudioIntegrationFps,
  advancedStudioIntegrationProofDuration,
  advancedStudioIntegrationTimedScenes,
  getAdvancedStudioSceneAtFrame,
  type AdvancedStudioTimedScene,
} from "../../src/advanced-studio/AdvancedStudioIntegrationProof";
import type {BoardSceneContent} from "../../src/advanced-studio/BoardSceneRenderer";
import type {InfographicSceneContent} from "../../src/advanced-studio/InfographicSceneRenderer";
import type {StudioFormatId} from "../../src/antv-studio/studio-formats";

const formatOrder: StudioFormatId[] = ["portrait", "square", "vertical"];

const sceneLabels: Record<
  string,
  {
    title: string;
    subtitle: string;
    thumbnailTone: "board" | "chart" | "cta";
  }
> = {
  "board-hook": {
    title: "Budget Focus",
    subtitle: "Board Scene",
    thumbnailTone: "board",
  },
  "infographic-revenue-ranking": {
    title: "Revenue Ranking",
    subtitle: "Infographic (G2)",
    thumbnailTone: "chart",
  },
  "board-cta": {
    title: "Overview / CTA",
    subtitle: "Board Scene",
    thumbnailTone: "cta",
  },
};

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

const inspectorTabs = ["Scene", "Camera", "Transition", "Settings"] as const;
const initialPreviewFrame =
  (advancedStudioIntegrationTimedScenes[1]?.startFrame ?? 0) + 32;

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

const titleForScene = (scene: AdvancedStudioTimedScene) =>
  sceneLabels[scene.id]?.title ?? scene.id;

const subtitleForScene = (scene: AdvancedStudioTimedScene) =>
  sceneLabels[scene.id]?.subtitle ?? scene.type;

const animationLabel = (animation?: string) => {
  if (!animation) return "None";
  return animation
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

export const AdvancedStudioApp: React.FC = () => {
  const playerRef = React.useRef<PlayerRef>(null);
  const rulerRef = React.useRef<HTMLDivElement>(null);
  const [formatId, setFormatId] = React.useState<StudioFormatId>("portrait");
  const [selectedSceneId, setSelectedSceneId] = React.useState(
    advancedStudioIntegrationTimedScenes[1]?.id ??
      advancedStudioIntegrationTimedScenes[0]?.id,
  );
  const [currentFrame, setCurrentFrame] = React.useState(
    Math.min(initialPreviewFrame, advancedStudioIntegrationProofDuration - 1),
  );
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [inspectorTab, setInspectorTab] =
    React.useState<(typeof inspectorTabs)[number]>("Scene");
  const [addSceneOpen, setAddSceneOpen] = React.useState(false);
  const [zoomLabel, setZoomLabel] = React.useState("100%");

  const selectedScene =
    advancedStudioIntegrationTimedScenes.find(
      (scene) => scene.id === selectedSceneId,
    ) ?? advancedStudioIntegrationTimedScenes[0];
  const activeScene = getAdvancedStudioSceneAtFrame(currentFrame);
  const format = advancedStudioIntegrationFormats[formatId];

  React.useEffect(() => {
    if (activeScene && activeScene.id !== selectedSceneId) {
      setSelectedSceneId(activeScene.id);
    }
  }, [activeScene, selectedSceneId]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrame = ({detail}: {detail: {frame: number}}) => {
      setCurrentFrame(Math.round(detail.frame));
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    player.addEventListener("frameupdate", onFrame);
    player.addEventListener("seeked", onFrame);
    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("ended", onEnded);

    return () => {
      player.removeEventListener("frameupdate", onFrame);
      player.removeEventListener("seeked", onFrame);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("ended", onEnded);
    };
  }, []);

  React.useEffect(() => {
    playerRef.current?.seekTo(currentFrame);
  }, []);

  const seekToFrame = React.useCallback((frame: number) => {
    const nextFrame = Math.max(
      0,
      Math.min(advancedStudioIntegrationProofDuration - 1, Math.round(frame)),
    );
    playerRef.current?.seekTo(nextFrame);
    setCurrentFrame(nextFrame);
  }, []);

  const selectScene = (scene: AdvancedStudioTimedScene) => {
    setSelectedSceneId(scene.id);
    seekToFrame(scene.startFrame);
  };

  const togglePlayback = () => {
    if (!playerRef.current) return;
    playerRef.current.toggle();
    setIsPlaying(playerRef.current.isPlaying());
  };

  const stepScene = (direction: -1 | 1) => {
    const currentIndex = advancedStudioIntegrationTimedScenes.findIndex(
      (scene) => scene.id === selectedSceneId,
    );
    const next =
      advancedStudioIntegrationTimedScenes[
        Math.max(
          0,
          Math.min(
            advancedStudioIntegrationTimedScenes.length - 1,
            currentIndex + direction,
          ),
        )
      ];
    if (next) selectScene(next);
  };

  const scrubTimeline = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = rulerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const ratio = (event.clientX - bounds.left) / bounds.width;
    seekToFrame(ratio * advancedStudioIntegrationProofDuration);
  };

  const previewSelectedScene = () => {
    if (!selectedScene) return;
    seekToFrame(selectedScene.startFrame);
    requestAnimationFrame(() => playerRef.current?.play());
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
          <button className="render-button disabled" type="button" disabled>
            <Wand2 size={16} /> Render <ChevronDown size={14} />
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
                <button type="button" disabled>
                  Board Scene <span>Preset creation pending</span>
                </button>
                <button type="button" disabled>
                  Infographic <span>Preset creation pending</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="scene-list">
          {advancedStudioIntegrationTimedScenes.map((scene, index) => (
            <button
              key={scene.id}
              className={`scene-card ${scene.id === selectedSceneId ? "selected" : ""}`}
              type="button"
              onClick={() => selectScene(scene)}
            >
              <span className="scene-index">{index + 1}</span>
              <SceneThumbnail tone={sceneLabels[scene.id]?.thumbnailTone ?? "board"} />
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
            {formatFrameTime(advancedStudioIntegrationProofDuration).slice(0, 5)} (
            {advancedStudioIntegrationProofDuration} frames)
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
              durationInFrames={advancedStudioIntegrationProofDuration}
              fps={advancedStudioIntegrationFps}
              compositionWidth={format.width}
              compositionHeight={format.height}
              inputProps={{formatId}}
              initialFrame={currentFrame}
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
            <span>/ {formatFrameTime(advancedStudioIntegrationProofDuration)}</span>
            <em>
              ({currentFrame} / {advancedStudioIntegrationProofDuration})
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
          <div
            className="ruler"
            ref={rulerRef}
            onPointerDown={scrubTimeline}
          >
            {Array.from({length: 13}).map((_, index) => {
              const frame = index * 30;
              return (
                <span key={frame} style={{left: `${(frame / 360) * 100}%`}}>
                  {frame}f
                </span>
              );
            })}
          </div>
          <div className="tracks">
            <div className="video-track">
              {advancedStudioIntegrationTimedScenes.map((scene, index) => (
                <button
                  key={scene.id}
                  className={`timeline-segment ${
                    scene.id === selectedSceneId ? "selected" : ""
                  }`}
                  type="button"
                  onClick={() => selectScene(scene)}
                  style={{
                    left: `${
                      (scene.startFrame / advancedStudioIntegrationProofDuration) *
                      100
                    }%`,
                    width: `${
                      (scene.durationFrames /
                        advancedStudioIntegrationProofDuration) *
                      100
                    }%`,
                  }}
                >
                  <span className="segment-index">{index + 1}</span>
                  <SceneThumbnail
                    tone={sceneLabels[scene.id]?.thumbnailTone ?? "board"}
                    small
                  />
                  <strong>{titleForScene(scene)}</strong>
                  <em>{subtitleForScene(scene)}</em>
                </button>
              ))}
              <span className="transition-chip" style={{left: "31.5%"}}>
                <Share2 size={14} /> 18f
              </span>
              <span className="transition-chip" style={{left: "72.5%"}}>
                <Share2 size={14} /> 18f
              </span>
            </div>
            <div className="camera-track">
              <div
                className="camera-curve"
                style={{
                  left: `${
                    ((selectedScene?.startFrame ?? 0) /
                      advancedStudioIntegrationProofDuration) *
                    100
                  }%`,
                  width: `${
                    ((selectedScene?.durationFrames ?? 0) /
                      advancedStudioIntegrationProofDuration) *
                    100
                  }%`,
                }}
              >
                <span>Push In</span>
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
            style={{
              left: `${
                (currentFrame / advancedStudioIntegrationProofDuration) * 100
              }%`,
            }}
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
}> = ({scene, tab, onPreview}) => {
  if (!scene) return null;

  if (tab !== "Scene") {
    return (
      <div className="inspector-body">
        <InspectorField label={`${tab} Controls`}>
          <div className="info-row muted">
            <SlidersHorizontal size={16} />
            <span>Preset controls will graduate here after more proofs.</span>
          </div>
        </InspectorField>
      </div>
    );
  }

  const isInfographic = scene.type === "infographic";
  const boardContent = scene.content as BoardSceneContent;
  const infographicContent = scene.content as InfographicSceneContent;
  const design = isInfographic ? infographicContent.design : null;

  return (
    <div className="inspector-body">
      <InspectorField label="Scene Type">
        <button className="wide-select" type="button" disabled>
          {isInfographic ? <BarChart3 size={17} /> : <Layers3 size={17} />}
          <span>{subtitleForScene(scene)}</span>
          <ChevronDown size={16} />
        </button>
      </InspectorField>

      <InspectorField label="Duration">
        <div className="dual-fields">
          <span>
            <strong>{scene.durationFrames}</strong> frames
          </span>
          <span>
            <strong>{formatFrameTime(scene.durationFrames)}</strong> time
          </span>
        </div>
      </InspectorField>

      <InspectorField label="Design">
        <div className="asset-row">
          <SceneThumbnail
            tone={sceneLabels[scene.id]?.thumbnailTone ?? "board"}
            small
          />
          <span>
            <strong>{isInfographic ? design?.name : titleForScene(scene)}</strong>
            <small>
              {isInfographic ? design?.id : boardContent.activeBlockId ?? "overview"}
            </small>
          </span>
          <button type="button" disabled>
            Change
          </button>
        </div>
      </InspectorField>

      <InspectorField label="Animation">
        <div className="asset-row compact">
          {isInfographic ? <BarChart3 size={18} /> : <Film size={18} />}
          <span>
            <strong>
              {isInfographic
                ? animationLabel(design?.animation)
                : animationLabel(boardContent.animation)}
            </strong>
          </span>
          <button type="button" onClick={onPreview}>
            Preview
          </button>
        </div>
      </InspectorField>

      <InspectorField label="Camera">
        <div className="asset-row compact">
          <Frame size={18} />
          <span>
            <strong>{scene.cameraPreset === "push-in" ? "Push In" : "Static"}</strong>
          </span>
          <button type="button" disabled>
            Edit
          </button>
        </div>
      </InspectorField>

      <InspectorField label="Transition In">
        <div className="transition-row">
          <Share2 size={16} />
          <span>{scene.transitionIn?.preset ?? "None"}</span>
          <strong>{scene.transitionIn?.durationFrames ?? 0} frames</strong>
        </div>
      </InspectorField>

      <InspectorField label="Transition Out">
        <div className="transition-row">
          <Share2 size={16} />
          <span>{scene.transitionOut?.preset ?? "None"}</span>
          <strong>{scene.transitionOut?.durationFrames ?? 0} frames</strong>
        </div>
      </InspectorField>

      <button className="advanced-collapse" type="button">
        Advanced <ChevronDown size={16} />
      </button>
    </div>
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
