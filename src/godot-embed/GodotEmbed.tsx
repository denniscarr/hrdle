// Adapted from d3dc/react-godot
import { useEffect, useRef, useState } from "react";

export type GodotEngineProps = {
  engine: EngineConstructor;
  executable: string;
  width?: number;
  height?: number;
  params?: unknown;
  resize?: boolean;
};

interface GodotEmbedProps {
  script: EngineLoaderDescription;
  executable: string;
  gdextensionLibs?: string[];
  renderWidth?: number;
  renderHeight?: number;
  nearestNeighbor?: boolean;
  params?: unknown;
  hideCanvas?: boolean;
  onGameLoaded?: () => void;
  onGameUnloaded?: () => void;
  onLoadProgress?: (percent: number) => void;
  onLoadError?: (reason: string) => void;
  loadingScreen?: React.ReactNode;
}

// Serializes engine lifecycles across remounts: two overlapping Godot runtimes
// can wedge Emscripten and hang the load, so each mount waits for the prior
// teardown before starting.
let enginePipeline: Promise<void> = Promise.resolve();

function GodotEmbed({
  script,
  executable,
  gdextensionLibs,
  renderWidth,
  renderHeight,
  nearestNeighbor = false,
  hideCanvas,
  onGameLoaded,
  onGameUnloaded,
  onLoadProgress,
  onLoadError,
  loadingScreen,
}: GodotEmbedProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<EngineConstructor | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const godotRef = useRef<GodotEngineInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Attach Godot script to window on first mount.
  // Note: Due to time constraints, I decided not to support changing the
  // script URL at runtime. If we reuse this component in future apps we may
  // need to address that.
  useEffect(() => {
    function onScriptLoad() {
      setEngine(() => window.Engine);
    }

    if (window.Engine) {
      onScriptLoad();
      return;
    }

    const scriptUrl = `${import.meta.env.BASE_URL}${script}`;
    let scriptElement = document.querySelector(
      `script[src="${scriptUrl}"]`,
    ) as HTMLScriptElement;

    function onScriptError() {
      onLoadError?.("Failed to load game engine script");
    }

    if (scriptElement) {
      scriptElement.addEventListener("load", onScriptLoad, { once: true });
      scriptElement.addEventListener("error", onScriptError, { once: true });
      return;
    }

    scriptElement = document.createElement("script");
    scriptElement.src = scriptUrl;
    scriptElement.async = true;
    scriptElement.onload = onScriptLoad;
    scriptElement.onerror = onScriptError;
    document.body.appendChild(scriptElement);
  }, [onLoadError, script]);

  // Handle loading
  useEffect(() => {
    if (!engine) {
      return;
    }

    if (!engine.isWebGLAvailable(2)) {
      onLoadError?.("WebGL not available");
      return;
    }

    let cancelled = false;
    let instance: GodotEngineInstance | null = null;
    let canvasEl: HTMLCanvasElement | null = null;

    const runPromise = enginePipeline.then(() => {
      if (cancelled) {
        return;
      }

      instance = new engine({
        canvas: canvasEl,
        executable: `${import.meta.env.BASE_URL}${executable}`,
        mainPack: `${import.meta.env.BASE_URL}${executable}.pck`,
        gdextensionLibs: gdextensionLibs,
        canvasResizePolicy: 0,
        onProgress: (current, total) => {
          if (total > 0) {
            const percent = current / total;
            onLoadProgress?.(percent);
          }
        },
      });

      canvasEl = canvasRef.current;
      godotRef.current = instance;

      return instance.startGame().then(
        () => {
          if (cancelled) {
            return;
          }
          outerRef.current?.focus();
          onGameLoaded?.();
          setIsLoaded(true);
        },
        (err: unknown) => {
          if (cancelled) {
            return;
          }
          onLoadError?.(err instanceof Error ? err.message : String(err));
        },
      );
    });
    enginePipeline = runPromise.catch(() => {});

    return () => {
      cancelled = true;

      // Wait for this instance's start to settle before tearing it down, and
      // re-arm the barrier so the next mount waits for us.
      enginePipeline = runPromise
        .then(() => {
          if (instance) {
            instance.requestQuit?.();
            engine.unload?.();
          }

          // This indirectly kills the Godot instance.
          // Seems to be reliable even though it looks hacky.
          if (canvasEl) {
            // Godot pops a "WebGL context lost" alert when the context drops.
            // We drop it on purpose, so swallow that event in the capture
            // phase before it reaches Godot's handler on the canvas.
            const holder = document.createElement("div");
            holder.appendChild(canvasEl);
            holder.addEventListener(
              "webglcontextlost",
              (ev: Event) => ev.stopPropagation(),
              true,
            );

            const gl =
              canvasEl.getContext("webgl") || canvasEl.getContext("webgl2");
            gl?.getExtension("WEBGL_lose_context")?.loseContext();
            canvasEl.width = 0;
            canvasEl.height = 0;
          }

          godotRef.current = null;

          onGameUnloaded?.();
        })
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, executable]);

  return (
    <div
      id="wrap"
      ref={outerRef}
      tabIndex={0}
      style={{ width: "100%", display: "flex" }}
    >
      {engine !== null && (
        <canvas
          ref={canvasRef}
          key={executable}
          id="canvas"
          width={renderWidth}
          height={renderHeight}
          tabIndex={-1}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: !isLoaded || hideCanvas ? "none" : "block",
            imageRendering: nearestNeighbor ? "pixelated" : "auto",
            pointerEvents: "none",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            outerRef.current?.focus();
          }}
        >
          HTML5 canvas appears to be unsupported in the current browser.
          <br />
          Please try updating or use a different browser.
        </canvas>
      )}
      {!isLoaded && loadingScreen}
    </div>
  );
}

export default GodotEmbed;

// function getDpr(): number {
//   const dpr = window.devicePixelRatio || 1;
//   return Math.min(dpr, 2.0);
// }
