import { useState } from "react";
import "./App.css";

/* ----- CARD SETUP ----- */
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck() {
  const deck = [];
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });
  return deck;
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* ----- PLAYER LOGIC ----- */
  function addPlayer() {
    if (!nameInput.trim()) return;
    setPlayers([...players, { name: nameInput, drinks: 0 }]);
    setNameInput("");
  }

  function startGame() {
    if (players.length < 2) return;
    setDeck(shuffle(buildDeck()));
    setDiscard([]);
    setTurn(0);
    setGameOver(false);
  }

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  /* ----- GAMEPLAY ----- */
  function drawCard() {
    if (deck.length === 0) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    setPlayers(nextPlayers);
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
      <h1>Card Drinking Game</h1>

      {/* SETUP */}
      {deck.length === 0 && !gameOver && (
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

      {/* GAME */}
      {deck.length > 0 && !gameOver && (
        <>
          <h2>Turn: <span className="active">{players[turn].name}</span></h2>

          <button className="draw" onClick={drawCard}>
            Draw Card
          </button>

          <p>Cards left: {deck.length}</p>

          {discard.length > 0 && (
            <div className="card">
              {discard[discard.length - 1].rank}
              {discard[discard.length - 1].suit}
            </div>
          )}

          <h3>Scores</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i} className={i === turn ? "active" : ""}>
                {p.name}: {p.drinks} drinks
              </li>
            ))}
          </ul>
        </>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <h3>Leaderboard</h3>
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
