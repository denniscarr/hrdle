import GodotEmbed from "@/godot-embed/GodotEmbed";
// import Loader from "app/ui/Loader";
// import useDebugKeypress from "app/util/useDebugKeys";
import {
  GODOT_EVENT,
  GODOT_MESSAGE,
  sendGodotMessage,
  useGodotListener,
} from "@/godot-embed/godot-bridge";
import LoadingScreen from "@/loading-screen/LoadingScreen";
import { useProgressStore } from "@/state/store";
import { useCallback, useEffect, useState } from "react";
import styles from "./Race.module.css";
import { useLoadedStore } from "@/state/store";

interface RaceProps {
  dailySeed: string;
}

function Race({ dailySeed }: RaceProps) {
  const isLoaded = useLoadedStore((state) => state.loaded);
  const setLoaded = useLoadedStore((state) => state.setLoaded);
  const [loadError, setLoadError] = useState(false);
  // TODO: bring useWindowSize over, might be useful
  // const { aspect: screenAspect } = useWindowSize();
  // const isLandscape = screenAspect === Aspect.LANDSCAPE;

  // Watchdog: if the Godot embed never finishes loading, surface an error.
  useEffect(() => {
    if (isLoaded || loadError) {
      return;
    }
    const timer = setTimeout(() => setLoadError(true), 60000);
    return () => clearTimeout(timer);
  }, [isLoaded, loadError]);

  const handleGameLoaded = useCallback(() => {
    if (isLoaded) return;
    sendGodotMessage(GODOT_MESSAGE.INIT_RACE, dailySeed);
    console.log(dailySeed);
    setLoaded();
  }, [isLoaded, setLoaded, dailySeed]);

  function handleGameUnloaded() {
    setLoaded();
    // setHideGame(true);
  }

  const handleLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  // Sync race state with React
  const setRaceStarted = useProgressStore((state) => state.startRace);
  const setRaceEnded = useProgressStore((state) => state.endRace);
  useGodotListener(GODOT_EVENT.RACE_STARTED, setRaceStarted);
  useGodotListener(GODOT_EVENT.RACE_ENDED, setRaceEnded);

  // TODO: should prob add an analogous event
  // useGodotListener(GODOT_EVENT.GAMEPLAY_START, () => setIsGameplayActive(true));

  // TODO: should prob add an analogous victory event
  // useGodotListener(GODOT_EVENT.SOLVED, () => {
  //   setIsGameplayActive(false);
  // });

  // TODO: maybe we don't need this stuff but keeping it here as a reminder
  // const isScreenPhonePortrait =
  //   window.innerHeight > window.innerWidth && window.innerWidth < 768;

  // function handleCanvasDimensionsChanged(
  //   canvasW: number,
  //   canvasH: number,
  //   divW: number,
  //   divH: number,
  // ) {
  //   const newW = Math.min(canvasW, divW);
  //   const newH = Math.min(canvasH, divH);

  //   sendGodotMessage(
  //     GODOT_MESSAGE.SET_DIMENSIONS,
  //     newW.toString(),
  //     newH.toString(),
  //     window.innerHeight > window.innerWidth ? "true" : "false", // Whether page is portrait
  //   );
  // }

  // TODO: this would be useful
  // Allow skipping of game by holding three keys at once
  // useDebugKeypress(["w", "i", "n"], 1000, () => {
  //   sendGodotMessage(GODOT_MESSAGE.DEBUG_TRIGGER_VICTORY);
  // });

  return (
    <div // Full screen container
      className={styles.fullScreenContainer}
    >
      <div // Embed container
        id="embedContainer"
        className={styles.embedContainer}
      >
        <GodotEmbed
          // TODO: use daily race seed as key?
          // key={levelLayout}
          script={"hrdle.js"}
          executable="hrdle"
          gdextensionLibs={[
            `libsgphysics2d.web.template_debug.wasm32.nothreads.wasm`,
            // `${import.meta.env.BASE_URL}/libsgphysics2d.web.template_release.wasm32.wasm`,
          ]}
          onGameLoaded={handleGameLoaded}
          onGameUnloaded={handleGameUnloaded}
          onLoadError={handleLoadError}
          loadingScreen={<LoadingScreen />}
          renderWidth={640}
          renderHeight={480}
          nearestNeighbor={true}
          // onDimensionsChanged={handleCanvasDimensionsChanged}
        />
      </div>
    </div>
  );
}

export default Race;
