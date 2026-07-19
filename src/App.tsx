import { useState } from "react";
import Race from "@/race/Race";
import styles from "./App.module.css";
import {
  GODOT_EVENT,
  useGodotListener,
  type RaceInitializedEvent,
} from "./godot-embed/godot-bridge";
import HorseNameButtonContainer from "./horse-name-buttons/HorseNameButtonContainer";

function App() {
  const [horseNames, setHorseNames] = useState<string[]>([]);
  console.log(horseNames);

  useGodotListener(GODOT_EVENT.RACE_INITIALIZED, (e: RaceInitializedEvent) => {
    setHorseNames(e.horseNames);
  });

  return (
    <div className={styles.fullscreenContainer}>
      <div>
        <Race />
        <HorseNameButtonContainer horseNames={horseNames} />
      </div>
    </div>
  );
}

export default App;
