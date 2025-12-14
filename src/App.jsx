import { useState, useEffect } from "react";
import "./App.css";

/* =====================
   CONSTANTS
===================== */
const MAX_SEATS = 8;
const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["♠","♥","♦","♣"];

const RULE_TEXT = {
  A: "Waterfall – everyone drinks",
  2: "You – pick someone to drink",
  3: "Me – you drink",
  4: "Whores – we all drink",
  5: "Guys drink",
  6: "Dicks – we all drink",
  7: "Heaven – Pointer",
  8: "Mate – pick a drinking buddy",
  9: "Rhyme – loser drinks",
  10: "Categories – loser drinks",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

/* =====================
   APP
===================== */
export default function App() {
  /* Deck */
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [kingCount, setKingCount] = useState(0);

  /* Seats */
  const [seats, setSeats] = useState(
    Array.from({ length: MAX_SEATS }, (_, i) => ({
      id: i + 1,
      name: null
    }))
  );
  const [playerName, setPlayerName] = useState("");
  const [activeSeat, setActiveSeat] = useState(null);

  /* Roles (persistent) */
  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [pointer, setPointer] = useState(null);

  /* =====================
     SETUP
  ===================== */
  useEffect(() => {
    resetDeck();
  }, []);

  const resetDeck = () => {
    const fullDeck = [];
    VALUES.forEach(v =>
      SUITS.forEach(s =>
        fullDeck.push({ value: v, suit: s, text: RULE_TEXT[v] })
      )
    );
    setDeck(shuffle(fullDeck));
    setCurrent(null);
    setKingCount(0);
    setThumbMaster(null);
    setQuestionMaster(null);
    setPointer(null);
  };

  const shuffle = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  /* =====================
     LOBBY
  ===================== */
  const addPlayer = () => {
    if (!playerName.trim()) return;

    const empty = seats.find(s => s.name === null);
    if (!empty) {
      alert("Lobby full");
      return;
    }

    setSeats(seats.map(s =>
      s.id === empty.id ? { ...s, name: playerName.trim() } : s
    ));
    setPlayerName("");
  };

  const seatName = (id) =>
    seats.find(s => s.id === id)?.name || "None";

  /* =====================
     GAME LOGIC
  ===================== */
  const drawCard = () => {
    if (!activeSeat) {
      alert("Select a seat first");
      return;
    }

    if (deck.length === 0) {
      resetDeck();
      return;
    }

    const next = deck[0];
    setDeck(deck.slice(1));
    setCurrent(next);

    if (next.value === "K") {
      setKingCount(k => k + 1);
    }

    if (next.value === "J") setThumbMaster(activeSeat);
    if (next.value === "Q") setQuestionMaster(activeSeat);
    if (next.value === "7") setPointer(activeSeat);

    if (navigator.vibrate) navigator.vibrate(60);
  };

  /* =====================
     UI
  ===================== */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* ADD PLAYER */}
      <div>
        <input
          placeholder="Add player"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add</button>
      </div>

      {/* SEATS */}
      <div className="seats">
        {seats.map(seat => (
          <button
            key={seat.id}
            className={activeSeat === seat.id ? "seat active-seat" : "seat"}
            onClick={() => seat.name && setActiveSeat(seat.id)}
          >
            {seat.name ? `Seat ${seat.id}: ${seat.name}` : `Seat ${seat.id}: Empty`}
          </button>
        ))}
      </div>

      {/* ROLES */}
      <div className="roles">
        <div>🖐 Thumb Master: {seatName(thumbMaster)}</div>
        <div>🧠 Question Master: {seatName(questionMaster)}</div>
        <div>👆 Pointer: {seatName(pointer)}</div>
      </div>

      {/* KING COUNTER */}
      <div>Kings: {kingCount} / 4</div>

      <button onClick={drawCard}>Draw Card</button>

      {current && (
        <div className="card">
          <div className="card-value">
            {current.value}{current.suit}
          </div>
          <div className="card-text">{current.text}</div>
        </div>
      )}
    </div>
  );
}
