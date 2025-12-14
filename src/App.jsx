import { useState } from "react";
import "./App.css";

/* =======================
   BASE RULES
======================= */
const BASE_RULES = [
  { card: "A", text: "Waterfall – everyone drinks" },
  { card: "2", text: "You – pick someone to drink" },
  { card: "3", text: "Me – you drink" },
  { card: "4", text: "Whores – we all drink" },
  { card: "5", text: "Guys drink" },
  { card: "6", text: "Dicks – we all drink" },
  { card: "7", text: "Heaven – last to raise hand drinks" },
  { card: "8", text: "Mate – pick a drinking buddy" },
  { card: "9", text: "Rhyme – loser drinks" },
  { card: "10", text: "Categories – loser drinks" },
  { card: "J", text: "Thumb Master" },
  { card: "Q", text: "Question Master" },
  { card: "K", text: "Make a rule" }
];

/* =======================
   NSFW / TOXIC ADD-ONS
======================= */
const NSFW_RULES = [
  { card: "J", text: "Degenerate Thumb Master 😈" },
  { card: "Q", text: "Toxic Question Master ☠️" },
  { card: "K", text: "Make a cursed rule" }
];

export default function App() {
  const [current, setCurrent] = useState(null);
  const [nsfwEnabled, setNsfwEnabled] = useState(false);

  const drawCard = () => {
    const activeRules = nsfwEnabled
      ? [...BASE_RULES, ...NSFW_RULES]
      : BASE_RULES;

    const random =
      activeRules[Math.floor(Math.random() * activeRules.length)];

    setCurrent(random);
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* TOGGLES */}
      <div className="toggles">
        <label className="toggle">
          <input
            type="checkbox"
            checked={nsfwEnabled}
            onChange={() => setNsfwEnabled(!nsfwEnabled)}
          />
          <span>NSFW Mode 😈</span>
        </label>
      </div>

      {/* DRAW */}
      <button onClick={drawCard}>Draw Card</button>

      {/* CARD */}
      {current && (
        <div className="card">
          <div className="card-value">{current.card}</div>
          <div className="card-text">{current.text}</div>
        </div>
      )}
    </div>
  );
}
