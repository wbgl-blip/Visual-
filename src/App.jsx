import { useState } from "react";
import "./App.css";

/* ===== CARD SETUP ===== */
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
  return shuffle(deck);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ===== KINGS RULES ===== */
function getRuleText(card) {
  switch (card.rank) {
    case "A": return "Waterfall – everyone drinks";
    case "2": return "You – pick someone to drink";
    case "3": return "Me – you drink";
    case "4": return "Whores – we all drink";
    case "5": return "Guys drink";
    case "6": return "Dicks – we all drink";
    case "7": return "Heaven – last to point drinks";
    case "8": return "Mate – pick a drinking buddy";
    case "9": return "Rhyme – loser drinks";
    case "10": return "Categories – loser drinks";
    case "J": return "Thumb Master";
    case "Q": return "Question Master";
    case "K": return "Make a rule";
    default: return "";
  }
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [roles, setRoles] = useState({
    thumb: null,
    question: null,
    heaven: null,
    king: null
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  /* ===== PLAYER SETUP ===== */
  function addPlayer() {
    if (!nameInput.trim()) return;
    setPlayers([...players, { name: nameInput, drinks: 0 }]);
    setNameInput("");
  }

  function startGame() {
    if (players.length < 2) return;
    setDeck(buildDeck());
    setDiscard([]);
    setTurn(0);
    setRoles({ thumb: null, question: null, heaven: null, king: null });
    setGameStarted(true);
    setGameOver(false);
  }

  /* ===== DRAW CARD ===== */
  function drawCard() {
    if (deck.length === 0) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    const nextRoles = { ...roles };
    if (card.rank === "J") nextRoles.thumb = turn;
    if (card.rank === "Q") nextRoles.question = turn;
    if (card.rank === "7") nextRoles.heaven = turn;
    if (card.rank === "K") nextRoles.king = turn;

    setPlayers(nextPlayers);
    setRoles(nextRoles);
    setDeck(nextDeck);
    setDiscard([...discard, card]);

    if (nextDeck.length === 0) {
      setGameOver(true);
    } else {
      setTurn((turn + 1) % players.length);
    }
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {/* SETUP SCREEN */}
      {!gameStarted && (
        <div className="setup">
          <input
            value={nameInput}
            placeholder="Player name"
            onChange={e => setNameInput(e.target.value)}
          />
          <button onClick={addPlayer}>Add Player</button>

          <ul>
            {players.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>

          <button className="start" onClick={startGame}>
            Start Game
          </button>
        </div>
      )}

      {/* GAME SCREEN */}
      {gameStarted && !gameOver && (
        <>
          <h2>
            Turn: <span className="active">{players[turn].name}</span>
          </h2>

          <button className="draw" onClick={drawCard}>
            Draw Card
          </button>

          <p>Cards left: {deck.length}</p>

          {discard.length > 0 && (
            <div className="card">
              <div className="rank">
                {discard[discard.length - 1].rank}
                {discard[discard.length - 1].suit}
              </div>
              <div className="rule">
                {getRuleText(discard[discard.length - 1])}
              </div>
            </div>
          )}

          <h3>Players</h3>
          <ul className="players">
            {players.map((p, i) => (
              <li key={i} className={i === turn ? "active" : ""}>
                {p.name}
                {roles.thumb === i && " 🖐"}
                {roles.question === i && " ❓"}
                {roles.heaven === i && " ☁️"}
                {roles.king === i && " 👑"}
                — {p.drinks} drinks
              </li>
            ))}
          </ul>
        </>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <ol>
            {[...players]
              .sort((a, b) => b.drinks - a.drinks)
              .map((p, i) => (
                <li key={i}>
                  {p.name} – {p.drinks} drinks
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
