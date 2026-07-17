import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>My penis did explode this many times: {count}</p>
      <button onClick={() => setCount((v) => v + 1)}>
        Click to explode penis
      </button>
    </>
  );
}

export default App;
