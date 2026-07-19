import { useState } from "react";
import Race from "@/race/Race";
import styles from "./App.module.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div
    className={styles.fullscreenContainer}
    >
      <div>
        <Race />
      </div>
      <div>
        <p>My penis did explode this many times: {count}</p>
        <button onClick={() => setCount((v) => v + 1)}>
          Click to explode penis
        </button>
      </div>
    </div>
  );
}

export default App;
