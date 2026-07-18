export {};

declare global {
  type EngineLoaderDescription = string;

  interface Window {
    Engine: EngineConstructor;
    godot_handler?: (...args: unknown[]) => void;
  }

  interface EngineConfig {
    unloadAfterInit?: boolean;
    canvas?: HTMLCanvasElement | null;
    executable?: string;
    mainPack?: string;
    locale?: string | null;
    canvasResizePolicy?: 0 | 1 | 2;
    args?: string[];
    focusCanvas?: boolean;
    experimentalVK?: boolean;
    serviceWorker?: string;
    persistentPaths?: string[];
    persistentDrops?: boolean;
    gdextensionLibs?: string[];
    fileSizes?: string[];
    onExecute?: (path: string, args: string[]) => void;
    onExit?: (code: number) => void;
    onProgress?: (current: number, total: number) => void;
    onPrint?: (...args: unknown[]) => void;
    onPrintError?: (...args: unknown[]) => void;
  }

  interface GodotEngineInstance {
    init(basePath?: string): Promise<void>;
    preloadFile(file: string | ArrayBuffer, path?: string): Promise<void>;
    start(override?: EngineConfig): Promise<void>;
    startGame(override?: EngineConfig): Promise<void>;
    copyToFS(path: string, buffer: ArrayBuffer): void;
    requestQuit(): void;
  }

  interface EngineConstructor {
    new (initConfig?: EngineConfig): GodotEngineInstance;

    load(basePath: string, size?: number): Promise<unknown>;
    unload(): void;
    isWebGLAvailable(majorVersion?: number): boolean;
  }
}
