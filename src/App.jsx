import { useState, useEffect } from "react";
import "./App.css";

/* =======================
   DECK SETUP
======================= */
const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["♠", "♥", "♦", "♣"];

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

/* =======================
   MEDALS (RARE)
======================= */
const MEDALS_BY_VALUE = {
  J: ["🖐 Thumb Tyrant"],
  Q: ["🧠 Question Terrorist"],
  K: ["☠️ Rule Dictator"]
};

const FINAL_KING_MEDAL = "👑 KINGSLAYER – You drew the final King";

/* =======================
   APP
======================= */
export default function App() {
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(null);
  const [medals, setMedals] = useState([]);
  const [kingCount, setKingCount] = useState(0);

  /* Players */
  const [players, setPlayers] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [activePlayer, setActivePlayer] = useState(null);

  /* Persistent Roles */
  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [pointer, setPointer] = useState(null);

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
    setMedals([]);
    setKingCount(0);
    setThumbMaster(null);
    setQuestionMaster(null);
    setPointer(null);
  };

  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const addPlayer = () => {
    if (!playerName.trim()) return;
    setPlayers([...players, playerName.trim()]);
    setPlayerName("");
  };

  const drawCard = () => {
    if (!activePlayer) {
      alert("Select who is drawing");
      return;
    }

    if (deck.length === 0) {
      resetDeck();
      return;
    }

    const next = deck[0];
    setDeck(deck.slice(1));
    setCurrent(next);
    setMedals([]);

    /* KING LOGIC */
    if (next.value === "K") {
      const newCount = kingCount + 1;
      setKingCount(newCount);

      setMedals(
        newCount === 4
          ? [FINAL_KING_MEDAL]
          : MEDALS_BY_VALUE.K
      );
    }

    /* ROLE LOGIC (PERSISTENT) */
    if (next.value === "J") {
      setThumbMaster(activePlayer);
      setMedals(MEDALS_BY_VALUE.J);
    }

    if (next.value === "Q") {
      setQuestionMaster(activePlayer);
      setMedals(MEDALS_BY_VALUE.Q);
    }

    if (next.value === "7") {
      setPointer(activePlayer);
    }

    if (navigator.vibrate) navigator.vibrate(60);
  };

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* PLAYERS */}
      <div className="players">
        <input
          placeholder="Add player"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add</button>

        <div className="player-list">
          {players.map(p => (
            <button
              key={p}
              className={activePlayer === p ? "active-player" : ""}
              onClick={() => setActivePlayer(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ROLES DISPLAY */}
      <div className="roles">
        <div>🖐 Thumb Master: {thumbMaster || "None"}</div>
        <div>🧠 Question Master: {questionMaster || "None"}</div>
        <div>👆 Pointer: {pointer || "None"}</div>
      </div>

      {/* KING COUNTER */}
      <div className="king-counter">
        Kings drawn: {kingCount} / 4
      </div>

      <button onClick={drawCard}>Draw Card</button>

      {current && (
        <div className="card">
          <div className="card-value">
            {current.value}{current.suit}
          </div>
          <div className="card-text">{current.text}</div>
        </div>
      )}

      {medals.length > 0 && (
        <div className="medals">
          {medals.map((m, i) => (
            <div key={i} className="medal">{m}</div>
          ))}
        </div>
      )}
    </div>
  );
}
