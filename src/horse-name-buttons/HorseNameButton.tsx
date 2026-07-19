import { useState } from "react";
import styles from "./HorseNameButton.module.css";
import { godotColorToCss } from "@/util/godot-utils";

interface HorseNameButtonProps {
  name: string;
  color: string;
}

const HorseNameButton = ({ name, color }: HorseNameButtonProps) => {
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

export default HorseNameButton;
