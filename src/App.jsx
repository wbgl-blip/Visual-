import { useState } from "react";
import "./App.css";

/* ================== DECK ================== */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const RULES = {
  A: "Waterfall – everyone drinks",
  2: "You – pick someone to drink",
  3: "Me – you drink",
  4: "Whores – we all drink",
  5: "Guys drink",
  6: "Dicks – we all drink",
  7: "Heaven – last hand up drinks",
  8: "Mate – pick a buddy",
  9: "Rhyme – loser drinks",
  10: "Categories – loser drinks",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

/* ================== MEDALS ================== */

const MEDALS = {
  J: "🖐️ Thumb Tyrant",
  Q: "❓ Interrogator",
  7: "☁️ Sky Lord",
  K: "👑 Rule Maker"
};

/* ================== APP ================== */

export default function App() {
  const [setup, setSetup] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const [players, setPlayers] = useState([{ name: "", drinks: 0, medals: [] }]);
  const [active, setActive] = useState(0);

  const [deck, setDeck] = useState([]);
  const [card, setCard] = useState(null);

  // Persistent roles
  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [heavenMaster, setHeavenMaster] = useState(null);

  /* ========== HELPERS ========== */

  function buildDeck() {
    const d = [];
    SUITS.forEach(s =>
      RANKS.forEach(r => d.push({ rank: r, suit: s }))
    );
    return d.sort(() => Math.random() - 0.5);
  }

  function giveMedal(playerIndex, medal) {
    setPlayers(p =>
      p.map((pl, i) =>
        i === playerIndex && !pl.medals.includes(medal)
          ? { ...pl, medals: [...pl.medals, medal] }
          : pl
      )
    );
  }

  /* ========== SETUP ========== */

  function updateName(i, value) {
    setPlayers(p =>
      p.map((pl, idx) =>
        idx === i ? { ...pl, name: value } : pl
      )
    );
  }

  function addPlayer() {
    if (players.length < 8) {
      setPlayers([...players, { name: "", drinks: 0, medals: [] }]);
    }
  }

  function startGame() {
    setDeck(buildDeck());
    setSetup(false);
  }

  /* ========== GAME ========== */

  function drawCard() {
    if (!deck.length) return;

    const [next, ...rest] = deck;
    setDeck(rest);
    setCard(next);

    const currentPlayer = active;

    // Role logic
    if (next.rank === "J") {
      setThumbMaster(currentPlayer);
      giveMedal(currentPlayer, MEDALS.J);
    }

    if (next.rank === "Q") {
      setQuestionMaster(currentPlayer);
      giveMedal(currentPlayer, MEDALS.Q);
    }

    if (next.rank === "7") {
      setHeavenMaster(currentPlayer);
      giveMedal(currentPlayer, MEDALS[7]);
    }

    if (next.rank === "K") {
      giveMedal(currentPlayer, MEDALS.K);
    }

    // Advance turn
    const nextTurn = (active + 1) % players.length;
    setActive(nextTurn);

    // End game
    if (rest.length === 0) {
      setGameOver(true);
    }
  }

  function addDrink(i) {
    setPlayers(p =>
      p.map((pl, idx) =>
        idx === i ? { ...pl, drinks: pl.drinks + 1 } : pl
      )
    );
  }

  /* ========== UI ========== */

  if (setup) {
    return (
      <div className="app">
        <h1>KAD Kings</h1>

        {players.map((p, i) => (
          <input
            key={i}
            placeholder={`Player ${i + 1}`}
            value={p.name}
            onChange={e => updateName(i, e.target.value)}
          />
        ))}

        <button onClick={addPlayer}>+ Add Player</button>
        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="app">
        <h1>Game Over 🍻</h1>

        {players.map((p, i) => (
          <div key={i} className="player">
            <strong>{p.name}</strong>
            <div>🍺 Drinks: {p.drinks}</div>
            <div>
              {p.medals.map(m => (
                <span key={m} className="medal">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="card" onClick={drawCard}>
        {card ? (
          <>
            <div className="rank">{card.rank}</div>
            <div className="suit">{card.suit}</div>
            <div className="rule">{RULES[card.rank]}</div>
          </>
        ) : (
          <span>Tap to draw</span>
        )}
      </div>

      <div className="deck-count">
        Cards left: {deck.length}
      </div>

      <div className="players">
        {players.map((p, i) => (
          <div
            key={i}
            className={`player ${i === active ? "active" : ""}`}
          >
            <strong>{p.name}</strong>
            <div>🍺 {p.drinks}</div>
            <button onClick={() => addDrink(i)}>+1</button>
          </div>
        ))}
      </div>

      <div className="roles">
        <div>🖐️ Thumb: {thumbMaster !== null ? players[thumbMaster].name : "-"}</div>
        <div>❓ Question: {questionMaster !== null ? players[questionMaster].name : "-"}</div>
        <div>☁️ Heaven: {heavenMaster !== null ? players[heavenMaster].name : "-"}</div>
      </div>
    </div>
  );
}
