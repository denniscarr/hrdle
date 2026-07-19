import { useState } from "react";
import Race from "@/race/Race";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Race />
      </div>
      <div>
        <p>My penis did explode this many times: {count}</p>
        <button onClick={() => setCount((v) => v + 1)}>
          Click to explode penis
        </button>
      </div>
    </>
  );
}

export default App;
