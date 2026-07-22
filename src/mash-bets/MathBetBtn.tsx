import { useState } from "react";
import styles from "./MashBetBtn.module.css";
import { godotColorToCss } from "@/util/godot-utils";
import { GAME_PROGRESS, useProgressStore } from "@/state/store";

interface MashBetBtnProps {
  name: string;
  color: string;
}

const MashBetBtn = ({ name, color }: MashBetBtnProps) => {
  const [score, setScore] = useState(0);
  const raceProgress = useProgressStore((state) => state.progress);

  return (
    <div className={styles.container}>
      <p>{`Ʊ${score}`}</p>
      {raceProgress === GAME_PROGRESS.COUNTDOWN ? (
        <button
          style={{ backgroundColor: godotColorToCss(color) }}
          onClick={() => setScore((prev: number) => prev + 1)}
        >
          <p>{name}</p>
        </button>
      ) : (
        <div style={{ backgroundColor: godotColorToCss(color) }}>{name}</div>
      )}
    </div>
  );
};

export default MashBetBtn;
