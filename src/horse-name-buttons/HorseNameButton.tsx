import { useState } from "react";
import styles from "./HorseNameButton.module.css";

interface HorseNameButtonProps {
  name: string;
}

const HorseNameButton = ({ name }: HorseNameButtonProps) => {
  const [score, setScore] = useState(0);

  return (
    <div className={styles.container}>
      <button onClick={() => setScore((prev: number) => prev + 1)}>
        {name}
      </button>
      <p>{score}</p>
    </div>
  );
};

export default HorseNameButton;
