import { useState } from "react";
import "./App.css";

const CARDS = [
  "Ace – Waterfall",
  "2 – You pick someone to drink",
  "3 – Me (you drink)",
  "4 – Floor",
  "5 – Guys drink",
  "6 – Girls drink",
  "7 – Heaven",
  "8 – Mate",
  "9 – Rhyme",
  "10 – Categories",
  "Jack – Thumb Master",
  "Queen – Question Master",
  "King – Make a rule",
];

export default function App() {
  const [card, setCard] = useState(null);

  function drawCard() {
    const random =
      CARDS[Math.floor(Math.random() * CARDS.length)];
    setCard(random);
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <button onClick={drawCard}>Draw Card</button>

      {card && <p className="card">{card}</p>}
    </div>
  );
}
