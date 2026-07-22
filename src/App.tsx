import MashBetBtns from "@/mash-bets/MashBetBtns";
import Race from "@/race/Race";
import { useState } from "react";
import styles from "./App.module.css";
import {
  GODOT_EVENT,
  useGodotListener,
  type HorseData,
  type RaceInitializedEvent,
} from "./godot-embed/godot-bridge";
import useSeed from "./util/useSeed";

const App = () => {
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
};

export default App;
