// Adapted from d3dc/react-godot

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
  // The ideal aspect ratio of the canvas
  aspectRatio?: number;
  resize?: boolean;
  params?: unknown;
  hideCanvas?: boolean;
  preChildren?: React.ReactNode;
  children?: React.ReactNode;
  wrapperClassName?: string;
  onGameLoaded?: () => void;
  onGameUnloaded?: () => void;
  onLoadError?: (reason: string) => void;
  onDimensionsChanged?: (
    canvasW: number,
    canvasH: number,
    wrapperW: number,
    wrapperH: number,
  ) => void;
}

// Serializes engine lifecycles across remounts: two overlapping Godot runtimes
// can wedge Emscripten and hang the load, so each mount waits for the prior
// teardown before starting.
let enginePipeline: Promise<void> = Promise.resolve();

function GodotEmbed({
  script,
  executable,
  aspectRatio,
  resize = false,
  //   hideCanvas,
  preChildren,
  children,
  //   wrapperClassName,
  onGameLoaded,
  onGameUnloaded,
  onLoadError,
  onDimensionsChanged,
}: GodotEmbedProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<EngineConstructor | null>(null);
  const [dimensions, setDimensions] = useState([0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const godotRef = useRef<GodotEngineInstance | null>(null);

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

    const scriptUrl = `${import.meta.env.BASE_URL}/${script}`;
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
        executable: `${import.meta.env.BASE_URL}/${executable}`,
        mainPack: `${import.meta.env.BASE_URL}/${executable}.pck`,
        canvasResizePolicy: 0,
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
  }, [engine, executable]);

  // Handle resizing
  useLayoutEffect(() => {
    if (!resize || outerRef.current === null) {
      return;
    }

    function handleResize(overrideW = 0, overrideH = 0) {
      if (!outerRef.current) {
        return;
      }

      /*
       * TODO: A lot of this sizing code was written specifically for Pixellence
       * (a former project I worked on).
       * Determine if any of it is necessary/useful here and delete unneeded
       * parts.
       */

      const containerW = overrideW || outerRef.current.clientWidth;
      const containerH = overrideH || outerRef.current.clientHeight;
      const targetRatio = aspectRatio || 1;
      // const isScreenPhonePortrait =
      //   window.innerHeight > window.innerWidth && window.innerWidth < 768;

      // let finalCssW: number;
      // let finalCssH: number;

      // On phones specifically, we want to ignore the apsect ratio provided
      // by Godot if it's taller than the containing div, and just use the
      // aspect of the containing div instead.
      // if (isScreenPhonePortrait) {
      //   const idealH = containerW / targetRatio;
      //   if (idealH > containerH) {
      //     finalCssW = containerW;
      //     finalCssH = containerH;
      //   } else {
      //     finalCssW = containerW;
      //     finalCssH = idealH;
      //   }
      // } else {
      // In landscape, we always want to respect the grid's aspect ratio.
      let proposedW = containerW;
      let proposedH = containerW / targetRatio;

      // If the proposed height is greater than the containing div's shrink the
      // canvas just enough to fit.
      if (proposedH > containerH) {
        proposedH = containerH;
        proposedW = containerH * targetRatio;
      }

      const finalCssW = proposedW;
      const finalCssH = proposedH;
      // }

      const dpr = getDpr();
      const newCanvasW = Math.max(1, Math.floor(finalCssW * dpr));
      const newCanvasH = Math.max(1, Math.floor(finalCssH * dpr));

      // Don't continue if the canvas does not need to change size
      if (
        newCanvasW === canvasRef.current?.width &&
        newCanvasH === canvasRef.current?.height
      ) {
        return;
      }

      // Account for the device pixel ratio
      setDimensions([newCanvasW, newCanvasH]);

      onDimensionsChanged?.(newCanvasW, newCanvasH, containerW, containerH);
    }

    // Possible fix for Safari page sizing issue. Needs testing.
    const delayedResize = () => {
      handleResize();
      setTimeout(handleResize, 100);
    };

    window.addEventListener("focus", delayedResize);
    window.addEventListener("pageshow", delayedResize);
    window.visualViewport?.addEventListener("resize", delayedResize);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        handleResize(width, height);
      }
    });

    resizeObserver.observe(outerRef.current);

    return () => {
      window.removeEventListener("focus", delayedResize);
      window.removeEventListener("pageshow", delayedResize);
      window.visualViewport?.removeEventListener("resize", delayedResize);
      resizeObserver.disconnect();
    };
  }, [aspectRatio, resize, onDimensionsChanged]);

  return (
    <div
      id="wrap"
      // TODO: use tailwind?
      //   className={cn(
      //     "w-full h-full min-w-0 min-h-0",
      //     "flex justify-center items-center",
      //     "overflow-hidden",
      //     wrapperClassName,
      //   )}
      ref={outerRef}
      tabIndex={0}
    >
      {preChildren}
      {engine !== null && (
        <canvas
          ref={canvasRef}
          key={executable}
          id="canvas"
          width={dimensions[0]}
          height={dimensions[1]}
          tabIndex={-1}
          //   className={cn(
          //     hideCanvas ? "hidden" : "block",
          //     "touch-none pointer-events-auto",
          //     "shrink",
          //     "max-w-full max-h-full",
          //   )}
          style={{
            width: `${dimensions[0] / getDpr()}px`,
            height: `${dimensions[1] / getDpr()}px`,
            objectFit: "contain",
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
      {children}
    </div>
  );
}

export default GodotEmbed;

function getDpr(): number {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr, 2.0);
}
