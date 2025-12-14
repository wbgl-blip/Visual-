import { useState, useEffect } from "react";
import "./App.css";

/* ---------- CARD SETUP ---------- */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck() {
  const deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({
        rank,
        suit,
        rule: getRule(rank)
      });
    }
  }
  return shuffle(deck);
}

function shuffle(deck) {
  return [...deck].sort(() => Math.random() - 0.5);
}

function getRule(rank) {
  switch (rank) {
    case "A": return "Waterfall – everyone drinks";
    case "2": return "You – pick someone to drink";
    case "3": return "Me – you drink";
    case "4": return "Whores – we all drink";
    case "5": return "Guys drink";
    case "6": return "Dicks – we all drink";
    case "7": return "Pointer";
    case "8": return "Mate – pick a buddy";
    case "9": return "Rhyme";
    case "10": return "Categories";
    case "J": return "Thumb Master";
    case "Q": return "Question Master";
    case "K": return "Make a rule";
    default: return "";
  }
}

/* ---------- APP ---------- */

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [started, setStarted] = useState(false);

  const [lastCard, setLastCard] = useState(null);

  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [pointer, setPointer] = useState(null);

  /* ---------- GAME START ---------- */

  const startGame = () => {
    if (players.length < 2) return;
    setDeck(buildDeck());
    setStarted(true);
  };

  /* ---------- PLAYER MGMT ---------- */

  const addPlayer = () => {
    if (!nameInput.trim()) return;
    if (players.length >= 8) return;

    setPlayers([...players, nameInput.trim()]);
    setNameInput("");
  };

  /* ---------- DRAW CARD ---------- */

  const drawCard = () => {
    if (!deck.length) return;

    const card = deck[0];
    const remaining = deck.slice(1);

    const player = players[currentTurn];

    setDeck(remaining);
    setLastCard({
      player,
      card: `${card.rank}${card.suit}`,
      rule: card.rule
    });

    // Role logic (overwrites previous holder)
    if (card.rank === "7") setPointer(player);
    if (card.rank === "J") setThumbMaster(player);
    if (card.rank === "Q") setQuestionMaster(player);

    setCurrentTurn((currentTurn + 1) % players.length);
  };

  /* ---------- UI ---------- */

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {!started && (
        <>
          <div className="add-player">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="Add player"
            />
            <button onClick={addPlayer}>Add</button>
          </div>

          <div className="seats">
            {players.map((p, i) => (
              <div key={i} className="seat">{p}</div>
            ))}
          </div>

          <button onClick={startGame} disabled={players.length < 2}>
            Start Game
          </button>
        </>
      )}

      {started && (
        <>
          <div className="seats">
            {players.map((p, i) => (
              <div
                key={i}
                className={`seat ${i === currentTurn ? "active" : ""}`}
              >
                {p}
              </div>
            ))}
          </div>

          <p className="counter">Cards left: {deck.length}</p>

          <div className="roles">
            👆 Thumb Master: {thumbMaster || "None"}<br />
            🧠 Question Master: {questionMaster || "None"}<br />
            👉 Pointer: {pointer || "None"}
          </div>

          <button onClick={drawCard} disabled={!deck.length}>
            Draw Card
          </button>

          {lastCard && (
            <div className="card-display">
              <div className="card-rank">{lastCard.card}</div>
              <div className="card-player">
                {lastCard.player} drew
              </div>
              <div className="card-rule">
                {lastCard.rule}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
