import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  loadProgress: number;
}

const LoadingScreen = ({ loadProgress }: LoadingScreenProps) => {
  return (
    <div className={styles.loadingScreen}>
      <p>Loading horsies...</p>
      <p>{`${loadProgress * 100}%`}</p>
    </div>
  );
};

export default LoadingScreen;
