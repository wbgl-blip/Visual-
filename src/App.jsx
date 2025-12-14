import { useState, useEffect } from "react";
import "./App.css";

/* =======================
   RULES
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

const NSFW_RULES = [
  { card: "J", text: "Degenerate Thumb Master 😈" },
  { card: "Q", text: "Toxic Question Master ☠️" },
  { card: "K", text: "Make a cursed rule" }
];

/* =======================
   MEDALS BY CARD
======================= */
const MEDALS_BY_CARD = {
  A: ["🌊 Waterfall Warrior"],
  4: ["🔥 Certified Degenerate"],
  6: ["🔥 Certified Degenerate"],
  7: ["🙌 Heaven Sprinter"],
  8: ["🍻 Ride or Die"],
  9: ["🎤 Rhyme Criminal"],
  10: ["📚 Category Goblin"],
  J: ["🖐 Thumb Tyrant"],
  Q: ["🧠 Question Terrorist"],
  K: ["☠️ Rule Dictator"]
};

export default function App() {
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [nsfw, setNsfw] = useState(false);
  const [medals, setMedals] = useState([]);

  /* Build deck */
  useEffect(() => {
    resetDeck();
  }, [nsfw]);

  const resetDeck = () => {
    const rules = nsfw ? [...BASE_RULES, ...NSFW_RULES] : BASE_RULES;
    setDeck(shuffle([...rules]));
    setCurrent(null);
    setMedals([]);
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const drawCard = () => {
    if (deck.length === 0) {
      resetDeck();
      return;
    }

    const next = deck[0];
    setDeck(deck.slice(1));
    setCurrent(next);

    // Award medals tied to card
    const earned = MEDALS_BY_CARD[next.card] || [];
    setMedals(earned);

    triggerFeedback();
  };

  const triggerFeedback = () => {
    if (navigator.vibrate) navigator.vibrate(60);

    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.frequency.value = 440;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* NSFW TOGGLE */}
      <label className="switch">
        <input type="checkbox" checked={nsfw} onChange={() => setNsfw(!nsfw)} />
        <span className="slider" />
        <span className="label">NSFW 😈</span>
      </label>

      <button onClick={drawCard}>Draw Card</button>

      {current && (
        <div className="card">
          <div className="card-value">{current.card}</div>
          <div className="card-text">{current.text}</div>
        </div>
      )}

      {/* MEDALS */}
      {medals.length > 0 && (
        <div className="medals">
          {medals.map((m, i) => (
            <div key={i} className="medal">
              {m}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
