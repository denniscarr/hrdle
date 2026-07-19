import HorseNameButton from "./HorseNameButton";
import styles from "./HorseNameButtonContainer.module.css";

interface HorseNameButtonContainerProps {
  horseNames: string[];
}

const HorseNameButtonContainer = ({
  horseNames,
}: HorseNameButtonContainerProps) => {
  return (
    <div className={styles.container}>
      {horseNames.map((horseName: string) => {
        return <HorseNameButton name={horseName} />;
      })}
    </div>
  );
};

export default HorseNameButtonContainer;
