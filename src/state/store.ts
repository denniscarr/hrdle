import { create } from "zustand";

export const GAME_PROGRESS = {
  COUNTDOWN: "COUNTDOWN",
  RACE: "RACE",
  VICTORY: "VICTORY",
} as const;
export type GameProgress = (typeof GAME_PROGRESS)[keyof typeof GAME_PROGRESS];

type ProgressStore = {
  progress: GameProgress;
  startRace: () => void;
  endRace: () => void;
};

export const useProgressStore = create<ProgressStore>((set) => ({
  progress: GAME_PROGRESS.COUNTDOWN,
  startRace: () => {
    set(() => ({ progress: GAME_PROGRESS.RACE }));
  },
  endRace: () => {
    set(() => ({ progress: GAME_PROGRESS.VICTORY }));
  },
}));

type LoadedStore = {
  loaded: boolean;
  setLoaded: () => void;
};

export const useLoadedStore = create<LoadedStore>((set) => ({
  loaded: false,
  setLoaded: () => {
    set(() => ({ loaded: true }));
  },
}));
