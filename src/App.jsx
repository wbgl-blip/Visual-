import { useState, useEffect } from "react";
import "./App.css";

/* ======================
   CONFIG
====================== */
const MAX_PLAYERS = 8;

/* ======================
   MEDALS
====================== */
const MEDALS = {
  DEGENERATE: {
    id: "degenerate",
    icon: "🥴",
    normal: "Poor choices were made.",
    toxic: "You are a walking cautionary tale."
  },
  KING: {
    id: "king",
    icon: "👑",
    normal: "Rule maker.",
    toxic: "Power corrupted you immediately."
  },
  THUMB: {
    id: "thumb",
    icon: "👆",
    normal: "Thumb Master.",
    toxic: "Everyone answers to your hand now."
  },
  QUESTION: {
    id: "question",
    icon: "❓",
    normal: "Question Master.",
    toxic: "Every word out of your mouth is a trap."
  },
  SPONGE: {
    id: "sponge",
    icon: "🍺",
    normal: "Most drinks taken.",
    toxic: "Your liver wants a lawyer."
  }
};

/* ======================
   CARDS
====================== */
const suits = ["♠", "♥", "♦", "♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck() {
  return suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));
}
function shuffle(deck) {
  return [...deck].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [toxicMode, setToxicMode] = useState(false);

  const [medalPopup, setMedalPopup] = useState(null);
  const [announcerText, setAnnouncerText] = useState("");

  /* ======================
     PLAYER / LOBBY
  ====================== */
  function addPlayer() {
    if (!nameInput.trim() || players.length >= MAX_PLAYERS) return;
    setPlayers([...players, { name: nameInput, drinks: 0, medals: [] }]);
    setNameInput("");
  }

  function startGame() {
    if (players.length < 2) return;
    setDeck(shuffle(buildDeck()));
    setDiscard([]);
    setTurn(0);
    setGameOver(false);
    setAnnouncerText("Game on.");
  }

  /* ======================
     MEDAL HANDLING
  ====================== */
  function awardMedal(playerIndex, medal) {
    setPlayers(prev =>
      prev.map((p, i) => {
        if (i !== playerIndex) return p;
        if (p.medals.find(m => m.id === medal.id)) return p;
        return { ...p, medals: [...p.medals, medal] };
      })
    );

    setMedalPopup({
      player: players[playerIndex]?.name,
      icon: medal.icon,
      text: toxicMode ? medal.toxic : medal.normal
    });

    setTimeout(() => setMedalPopup(null), 2500);
  }

  /* ======================
     GAMEPLAY
  ====================== */
  function drawCard() {
    if (!deck.length) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    nextPlayers[turn].drinks += 1;

    if (nextPlayers[turn].drinks === 5)
      awardMedal(turn, MEDALS.DEGENERATE);

    if (card.rank === "K") awardMedal(turn, MEDALS.KING);
    if (card.rank === "J") awardMedal(turn, MEDALS.THUMB);
    if (card.rank === "Q") awardMedal(turn, MEDALS.QUESTION);

    setPlayers(nextPlayers);
    setDeck(nextDeck);
    setDiscard([...discard, card]);

    if (nextDeck.length === 0) {
      const max = Math.max(...nextPlayers.map(p => p.drinks));
      nextPlayers.forEach((p, i) => {
        if (p.drinks === max) awardMedal(i, MEDALS.SPONGE);
      });
      setGameOver(true);
      setAnnouncerText("Game over.");
    } else {
      setTurn((turn + 1) % players.length);
    }
  }

  /* ======================
     UI
  ====================== */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <label className="toggle">
        <input
          type="checkbox"
          checked={toxicMode}
          onChange={() => setToxicMode(!toxicMode)}
        />
        Toxic Mode
      </label>

      {announcerText && <div className="announcer">{announcerText}</div>}

      {/* SETUP */}
      {deck.length === 0 && !gameOver && (
        <div className="setup">
          <input
            value={nameInput}
            placeholder="Player name"
            onChange={e => setNameInput(e.target.value)}
          />
          <button onClick={addPlayer}>Add Player</button>

          <div className="seats">
            {players.map((p, i) => (
              <div key={i} className="seat filled">{p.name}</div>
            ))}
            {Array.from({ length: MAX_PLAYERS - players.length }).map((_, i) => (
              <div key={i} className="seat">Empty</div>
            ))}
          </div>

          <button className="start" onClick={startGame}>
            Start Game
          </button>
        </div>
      )}

      {/* GAME */}
      {deck.length > 0 && !gameOver && (
        <>
          <h2>Turn: <span className="active">{players[turn].name}</span></h2>
          <button className="draw" onClick={drawCard}>Draw Card</button>
          <p>Cards left: {deck.length}</p>

          {discard.length > 0 && (
            <div className="card">
              {discard.at(-1).rank}{discard.at(-1).suit}
            </div>
          )}

          <ul>
            {players.map((p, i) => (
              <li key={i} className={i === turn ? "active" : ""}>
                {p.name} – {p.drinks}
                <div className="medals">
                  {p.medals.map(m => <span key={m.id}>{m.icon}</span>)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* GAME OVER */}
      {gameOver && (
        <div className="game-over">
          <h2>Final Standings</h2>
          <ol>
            {[...players]
              .sort((a,b) => b.drinks - a.drinks)
              .map((p,i) => (
                <li key={i}>
                  {p.name} – {p.drinks}
                  <div className="medals">
                    {p.medals.map(m => <span key={m.id}>{m.icon}</span>)}
                  </div>
                </li>
              ))}
          </ol>
        </div>
      )}

      {medalPopup && (
        <div className="medal-popup">
          <strong>{medalPopup.player}</strong> earned {medalPopup.icon}
          <div>{medalPopup.text}</div>
        </div>
      )}
    </div>
  );
}
