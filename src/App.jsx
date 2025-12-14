import { useState } from "react";
import "./App.css";

/* =========================
   MEDALS (HALO-STYLE)
========================= */
const MEDALS = {
  DEGENERATE: {
    id: "degenerate",
    icon: "🥴",
    name: "Degenerate",
    text: "Statistically impressive. Morally concerning."
  },
  SPONGE: {
    id: "sponge",
    icon: "🍺",
    name: "Human Sponge",
    text: "Your liver filed a formal complaint."
  },
  KING: {
    id: "king",
    icon: "👑",
    name: "Kingmaker",
    text: "Absolute power. Immediate corruption."
  },
  THUMB: {
    id: "thumb",
    icon: "👆",
    name: "Thumb Tyrant",
    text: "Hands up. You work for them now."
  },
  QUESTION: {
    id: "question",
    icon: "❓",
    name: "Interrogator",
    text: "Every sentence is a trap."
  },
  TRAINWRECK: {
    id: "trainwreck",
    icon: "💀",
    name: "Trainwreck",
    text: "We watched it happen. Nobody stopped it."
  }
};

/* =========================
   CARD SETUP (52 CARDS)
========================= */
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

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* =========================
     PLAYER LOGIC
  ========================= */
  function addPlayer() {
    if (!nameInput.trim()) return;
    setPlayers([
      ...players,
      { name: nameInput, drinks: 0, medals: [] }
    ]);
    setNameInput("");
  }

  function startGame() {
    if (players.length < 2) return;
    setDeck(shuffle(buildDeck()));
    setDiscard([]);
    setTurn(0);
    setGameOver(false);
  }

  function awardMedal(playerIndex, medal) {
    setPlayers(prev =>
      prev.map((p, i) =>
        i === playerIndex && !p.medals.find(m => m.id === medal.id)
          ? { ...p, medals: [...p.medals, medal] }
          : p
      )
    );
  }

  /* =========================
     GAMEPLAY
  ========================= */
  function drawCard() {
    if (deck.length === 0) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    /* ---- DRINK BASED MEDALS ---- */
    if (nextPlayers[turn].drinks === 5) {
      awardMedal(turn, MEDALS.DEGENERATE);
    }

    if (nextPlayers[turn].drinks === 8) {
      awardMedal(turn, MEDALS.TRAINWRECK);
    }

    /* ---- CARD BASED MEDALS ---- */
    if (card.rank === "K") awardMedal(turn, MEDALS.KING);
    if (card.rank === "J") awardMedal(turn, MEDALS.THUMB);
    if (card.rank === "Q") awardMedal(turn, MEDALS.QUESTION);

    setPlayers(nextPlayers);
    setDeck(nextDeck);
    setDiscard([...discard, card]);

    if (nextDeck.length === 0) {
      const maxDrinks = Math.max(...nextPlayers.map(p => p.drinks));
      nextPlayers.forEach((p, i) => {
        if (p.drinks === maxDrinks) {
          awardMedal(i, MEDALS.SPONGE);
        }
      });
      setGameOver(true);
    } else {
      setTurn((turn + 1) % players.length);
    }
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

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
          <h2>
            Turn: <span className="active">{players[turn].name}</span>
          </h2>

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
                <div className="medals">
                  {p.medals.map(m => (
                    <span key={m.id} title={m.text}>
                      {m.icon}
                    </span>
                  ))}
                </div>
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
                  <div className="medals">
                    {p.medals.map(m => (
                      <span key={m.id} title={m.text}>
                        {m.icon}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}
    </div>
  );
}
