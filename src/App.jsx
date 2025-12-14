import { useState } from "react";
import "./App.css";

export default function App() {
  const [message, setMessage] = useState("Draw a card to begin");

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="card">
        {message}
      </div>

      <button
        className="draw-btn"
        onClick={() => setMessage("🍺 You drew a card")}
      >
        Draw Card
      </button>
    </div>
  );
}
