import { useState } from "react";
import Race from "@/race/Race";
import styles from "./App.module.css";
import {
  GODOT_EVENT,
  useGodotListener,
  type HorseData,
  type RaceInitializedEvent,
} from "./godot-embed/godot-bridge";
import HorseNameButtonContainer from "./horse-name-buttons/HorseNameButtonContainer";

function App() {
  const [horseDatas, setHorseDatas] = useState<HorseData[]>([]);

  useGodotListener(GODOT_EVENT.RACE_INITIALIZED, (e: RaceInitializedEvent) => {
    setHorseDatas(e.horseDatas);
  });

  return (
    <div className={styles.fullscreenContainer}>
      <div>
        <Race />
        <HorseNameButtonContainer horseDatas={horseDatas} />
      </div>
    </div>
  );
}

export default App;
