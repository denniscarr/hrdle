import { useState } from "react";
import styles from "./MashBetBtn.module.css";
import { godotColorToCss } from "@/util/godot-utils";

interface MashBetBtnProps {
  name: string;
  color: string;
}

const MashBetBtn = ({ name, color }: MashBetBtnProps) => {
  const [score, setScore] = useState(0);

  return (
    <div 
    className={styles.container}
    >
      <button
        style={{ backgroundColor: godotColorToCss(color) }}
        onClick={() => setScore((prev: number) => prev + 1)}
      >
        <p>{name}</p>
      </button>
      <p className={styles.p}>{`$${score}`}</p>
    </div>
  );
};

export default MashBetBtn;
