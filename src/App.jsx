import { useState } from "react";
import "./App.css";

/* ------------------ DECK ------------------ */

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

const MEDALS = {
  A: "Hydration Hero 💧",
  7: "Sky Lord ☁️",
  J: "Sticky Fingers 🖐️",
  Q: "Interrogator ❓"
};

/* ------------------ SOUND FX ------------------ */

const fxClick = new Audio("/fx/click.mp3"); // optional
fxClick.volume = 0.5;

/* ------------------ VOICE ------------------ */

function speakEnhanced(text, enabled) {
  if (!enabled) return;

  const synth = window.speechSynthesis;
  if (!synth) return;

  const voice =
    synth.getVoices().find(v => v.name.includes("Google")) ||
    synth.getVoices()[0];

  const parts = text.split(" – ");

  fxClick.play().catch(() => {});

  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p);
    u.voice = voice;
    u.rate = 0.95;
    u.pitch = 0.9;
    u.volume = 1;
    u.onstart = () => i === 0 && fxClick.play().catch(() => {});
    synth.speak(u);
  });
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

  const [announcerOn, setAnnouncerOn] = useState(true);
  const [toxicOn, setToxicOn] = useState(false);

  const [soundPack, setSoundPack] = useState({});

  /* ---------- HELPERS ---------- */

  function buildDeck() {
    const d = [];
    SUITS.forEach(s => RANKS.forEach(r => d.push({ rank: r, suit: s })));
    return d.sort(() => Math.random() - 0.5);
  }

  function playSound(key) {
    if (soundPack[key]) {
      soundPack[key].currentTime = 0;
      soundPack[key].play();
      return true;
    }
    return false;
  }

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

  function loadSoundPack(files) {
    const pack = {};
    Array.from(files).forEach(file => {
      const key = file.name.replace(/\..+$/, "");
      pack[key] = new Audio(URL.createObjectURL(file));
    });
    setSoundPack(pack);
  }

  /* ---------- GAME ---------- */

  function drawCard() {
    if (!deck.length) return;

    const [next, ...rest] = deck;
    setDeck(rest);
    setCard(next);

    const rule = RULES[next.rank];

    if (!playSound(next.rank)) {
      speakEnhanced(rule, announcerOn);
    }

    const name = players[active].name;

    if (next.rank === "J") setThumb(name);
    if (next.rank === "Q") setQuestion(name);
    if (next.rank === "7") setHeaven(name);

    const medal = MEDALS[next.rank];
    if (medal) {
      setPlayers(p =>
        p.map((pl, i) =>
          i === active && !pl.medals.includes(medal)
            ? { ...pl, medals: [...pl.medals, medal] }
            : pl
        )
      );

      if (!playSound("medal")) {
        speakEnhanced(medal, announcerOn);
      }
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

        <label className="upload">
          Load Sound Pack
          <input
            type="file"
            multiple
            accept="audio/*"
            hidden
            onChange={e => loadSoundPack(e.target.files)}
          />
        </label>

        <button onClick={startGame}>Start Game</button>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="toggles">
        <label>
          <input
            type="checkbox"
            checked={announcerOn}
            onChange={e => setAnnouncerOn(e.target.checked)}
          />
          Announcer
        </label>

        <label>
          <input
            type="checkbox"
            checked={toxicOn}
            onChange={e => setToxicOn(e.target.checked)}
          />
          ☣️ Shit-Talk
        </label>
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
          <div key={i} className={`player ${i === active ? "active" : ""}`}>
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
