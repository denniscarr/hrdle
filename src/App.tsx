import { useState } from "react";
import Race from "@/race/Race";
import styles from "./App.module.css";
import {
  GODOT_EVENT,
  useGodotListener,
  type HorseData,
  type RaceInitializedEvent,
} from "./godot-embed/godot-bridge";
import MashBetBtns from "@/mash-bets/MashBetBtns";
import useSeed from "./util/useSeed";

function App() {
  const [horseDatas, setHorseDatas] = useState<HorseData[]>([]);
  const dailySeed = useSeed();

  useGodotListener(GODOT_EVENT.RACE_INITIALIZED, (e: RaceInitializedEvent) => {
    setHorseDatas(e.horseDatas);
  });

  return (
    <div className={styles.mainContainer}>
      <h1>Horse Race Tests</h1>
      <div className={styles.gameWrapper}>
        <Race dailySeed={dailySeed} />
        <MashBetBtns horseDatas={horseDatas} />
      </div>
    </div>
  );
}

export default App;
