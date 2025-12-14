import { useState } from "react";
import "./App.css";

const RULES = [
  { card: "A", text: "Waterfall – everyone drinks" },
  { card: "2", text: "You – pick someone to drink" },
  { card: "3", text: "Me – you drink" },
  { card: "4", text: "Floor – last to touch drinks" },
  { card: "5", text: "Guys drink" },
  { card: "6", text: "Girls drink" },
  { card: "7", text: "Heaven – last to raise hand drinks" },
  { card: "8", text: "Mate – pick a drinking buddy" },
  { card: "9", text: "Rhyme – loser drinks" },
  { card: "10", text: "Categories – loser drinks" },
  { card: "J", text: "Thumb Master" },
  { card: "Q", text: "Question Master" },
  { card: "K", text: "Make a rule" }
];

function App() {
  const [current, setCurrent] = useState(null);

  const drawCard = () => {
    const random =
      RULES[Math.floor(Math.random() * RULES.length)];
    setCurrent(random);
  };

  return (
  <div className="app">
    <h1>KAD Kings</h1>

    <button onClick={drawCard}>
      Draw Card
    </button>

    {current && (
      <div className="card">
        <div className="card-value">{current.card}</div>
        <div className="card-text">{current.text}</div>
      </div>
    )}
  </div>
);
export default App;
