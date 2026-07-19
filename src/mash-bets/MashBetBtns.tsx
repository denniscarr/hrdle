import type { HorseData } from "@/godot-embed/godot-bridge";
import MashBetBtn from "./MathBetBtn";
import styles from "./MashBetBtns.module.css";

interface MashBetBtnsProps {
  horseDatas: HorseData[];
}

const MashBetBtns = ({ horseDatas }: MashBetBtnsProps) => {
  return (
    <div className={styles.container}>
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
  );
};

export default MashBetBtns;
