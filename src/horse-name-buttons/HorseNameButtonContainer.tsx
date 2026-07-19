import type { HorseData } from "@/godot-embed/godot-bridge";
import HorseNameButton from "./HorseNameButton";
import styles from "./HorseNameButtonContainer.module.css";

interface HorseNameButtonContainerProps {
  horseDatas: HorseData[];
}

const HorseNameButtonContainer = ({
  horseDatas,
}: HorseNameButtonContainerProps) => {
  return (
    <div className={styles.container}>
      {horseDatas.map((horseData: HorseData) => {
        return (
          <HorseNameButton
            key={horseData.nameAbbrev}
            name={horseData.nameAbbrev}
            color={horseData.color}
          />
        );
      })}
    </div>
  );
};

export default HorseNameButtonContainer;
