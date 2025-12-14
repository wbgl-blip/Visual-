import { useState } from "react";
import "./App.css";

const cards = [
  { rank: "A", text: "Waterfall – everyone drinks" },
  { rank: "2", text: "You – pick someone to drink" },
  { rank: "3", text: "Me – you drink" },
  { rank: "4", text: "Floor – last one drinks" },
  { rank: "5", text: "Guys drink" },
  { rank: "6", text: "Girls drink" },
  { rank: "7", text: "Heaven – last one drinks" },
  { rank: "8", text: "Mate – pick a drinking buddy" },
  { rank: "9", text: "Rhyme – mess up, drink" },
  { rank: "10", text: "Categories – mess up, drink" },
  { rank: "J", text: "Thumb Master 👆" },
  { rank: "Q", text: "Questions – answer last, drink" },
  { rank: "K", text: "Make a Rule 👑" }
];

const medals = {
  normal: [
    "Clutch Sip",
    "Last Man Standing",
    "Stone Face"
  ],
  toxic: [
    "Certified Menace",
    "Emotional Damage",
    "Chaos Agent"
  ],
  degenerate: [
    "Absolute Degenerate",
    "No Self Respect",
    "Gremlin Energy"
  ],
  nsfw: [
    "HR Violation",
    "Unholy Thoughts",
    "Too Far Bro"
  ]
};

export default function App() {
  const [card, setCard] = useState(null);
  const [medal, setMedal] = useState(null);

  const [showToxic, setShowToxic] = useState(false);
  const [showDegenerate, setShowDegenerate] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);

  function drawCard() {
    const newCard = cards[Math.floor(Math.random() * cards.length)];
    setCard(newCard);

    let pool = [...medals.normal];
    if (showToxic) pool = pool.concat(medals.toxic);
    if (showDegenerate) pool = pool.concat(medals.degenerate);
    if (showNSFW) pool = pool.concat(medals.nsfw);

    const newMedal = pool[Math.floor(Math.random() * pool.length)];
    setMedal(newMedal);
  }

  return (
    <div className="app">
      <h1>🍺 KAD Kings Cup</h1>

      <button onClick={drawCard}>Draw Card</button>

      {card && (
        <div className="card">
          <h2>{card.rank}</h2>
          <p>{card.text}</p>
        </div>
      )}

      {medal && (
        <div className="medal">
          🏅 {medal}
        </div>
      )}

      <div className="toggles">
        <label>
          <input
            type="checkbox"
            checked={showToxic}
            onChange={() => setShowToxic(!showToxic)}
          />
          Toxic
        </label>

        <label>
          <input
            type="checkbox"
            checked={showDegenerate}
            onChange={() => setShowDegenerate(!showDegenerate)}
          />
          Degenerate
        </label>

        <label>
          <input
            type="checkbox"
            checked={showNSFW}
            onChange={() => setShowNSFW(!showNSFW)}
          />
          NSFW
        </label>
      </div>
    </div>
  );
}
