import { useState } from "react";
import "./App.css";

/* ------------------ DECK ------------------ */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

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

const MEDALS = {
  A: "Hydration Hero 💧",
  7: "Sky Lord ☁️",
  J: "Sticky Fingers 🖐️",
  Q: "Interrogator ❓"
};

function buildDeck() {
  const deck = [];
  SUITS.forEach(s =>
    RANKS.forEach(r => deck.push({ rank: r, suit: s }))
  );
  return deck.sort(() => Math.random() - 0.5);
}

/* ------------------ ANNOUNCER ------------------ */

function speak(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const voice =
    synth.getVoices().find(v => v.name.includes("Google")) ||
    synth.getVoices()[0];

  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.rate = 0.95;
  u.pitch = 0.9;
  synth.cancel();
  synth.speak(u);
}

/* ------------------ APP ------------------ */

export default function App() {
  const [setup, setSetup] = useState(true);
  const [players, setPlayers] = useState([
    { name: "", drinks: 0, medals: [] },
    { name: "", drinks: 0, medals: [] }
  ]);

  const [deck, setDeck] = useState([]);
  const [card, setCard] = useState(null);
  const [active, setActive] = useState(0);

  const [thumb, setThumb] = useState(null);
  const [question, setQuestion] = useState(null);
  const [heaven, setHeaven] = useState(null);

  /* ---------- SETUP ---------- */

  function updateName(i, value) {
    setPlayers(p =>
      p.map((pl, idx) => (idx === i ? { ...pl, name: value } : pl))
    );
  }

  function addPlayer() {
    if (players.length < 8)
      setPlayers([...players, { name: "", drinks: 0, medals: [] }]);
  }

  function startGame() {
    setDeck(buildDeck());
    setSetup(false);
  }

  /* ---------- GAME ---------- */

  function drawCard() {
    if (!deck.length) return;

    const [next, ...rest] = deck;
    setDeck(rest);
    setCard(next);

    const rule = RULES[next.rank];
    speak(rule);

    const playerName = players[active].name;

    if (next.rank === "J") setThumb(playerName);
    if (next.rank === "Q") setQuestion(playerName);
    if (next.rank === "7") setHeaven(playerName);

    const medal = MEDALS[next.rank];
    if (medal) {
      setPlayers(p =>
        p.map((pl, i) =>
          i === active && !pl.medals.includes(medal)
            ? { ...pl, medals: [...pl.medals, medal] }
            : pl
        )
      );
      speak(medal);
    }

    setActive((active + 1) % players.length);
  }

  function addDrink(i) {
    setPlayers(p =>
      p.map((pl, idx) =>
        idx === i ? { ...pl, drinks: pl.drinks + 1 } : pl
      )
    );
  }

  /* ---------- UI ---------- */

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

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="status">
        <span>🂠 {deck.length}</span>
        <span>👑 {thumb || "—"}</span>
        <span>❓ {question || "—"}</span>
        <span>☁️ {heaven || "—"}</span>
      </div>

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

      <div className="players">
        {players.map((p, i) => (
          <div
            key={i}
            className={`player ${i === active ? "active" : ""}`}
          >
            <strong>{p.name}</strong>
            <div>🍺 {p.drinks}</div>
            <button onClick={() => addDrink(i)}>+1</button>

            <div className="medals">
              {p.medals.map(m => (
                <span key={m} className="medal">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
