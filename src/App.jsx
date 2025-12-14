import { useState } from "react";
import "./App.css";

const cards = [
  "A – Waterfall",
  "2 – You",
  "3 – Me",
  "4 – Floor",
  "5 – Guys",
  "6 – Chicks",
  "7 – Heaven",
  "8 – Mate",
  "9 – Rhyme",
  "10 – Categories",
  "J – Thumb Master",
  "Q – Question Master",
  "K – Make a Rule"
];

function App() {
  const [card, setCard] = useState(null);

  const drawCard = () => {
    const random = cards[Math.floor(Math.random() * cards.length)];
    setCard(random);
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <button onClick={drawCard}>Draw Card</button>

      {card && <div className="card">{card}</div>}
    </div>
  );
}

export default App;
