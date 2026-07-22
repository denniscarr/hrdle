import type { HorseData } from "@/godot-embed/godot-bridge";
import MashBetBtn from "./MathBetBtn";
import styles from "./MashBetBtns.module.css";
import { GAME_PROGRESS, useLoadedStore, useProgressStore } from "@/state/store";

interface MashBetBtnsProps {
  horseDatas: HorseData[];
}

const MashBetBtns = ({ horseDatas }: MashBetBtnsProps) => {
  const isLoaded = useLoadedStore((state) => state.loaded);
  const raceProgress = useProgressStore((state) => state.progress);

  if (!isLoaded) {
    return <></>;
  }

  return (
    <>
      {raceProgress === GAME_PROGRESS.COUNTDOWN && <h2>Place your bets:</h2>}
      {raceProgress === GAME_PROGRESS.RACE && <h2>Your bets:</h2>}
      <div className={styles.buttonContainer}>
        {horseDatas.map((horseData: HorseData) => {
          return (
            <MashBetBtn
              key={horseData.nameAbbrev}
              name={horseData.nameAbbrev}
              color={horseData.color}
            />
          );
        })}
      </div>
    </>
  );
};

export default MashBetBtns;
