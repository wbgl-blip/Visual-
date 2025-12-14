import { useEffect, useState } from "react";
import "./App.css";

/* =========================
   ANNOUNCER VOICE ENGINE
   ========================= */

function speak(text, mode = "arena") {
  if (!window.speechSynthesis) return;

  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();

  // Prefer deep English voices if available
  const preferred =
    voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("male")) ||
    voices.find(v => v.lang.startsWith("en")) ||
    voices[0];

  utter.voice = preferred;

  if (mode === "arena") {
    utter.rate = 0.85;
    utter.pitch = 0.8;
    utter.volume = 1;
  }

  if (mode === "action") {
    utter.rate = 0.95;
    utter.pitch = 0.65;
    utter.volume = 1;
  }

  if (mode === "toxic") {
    utter.rate = 1.05;
    utter.pitch = 0.55;
    utter.volume = 1;
  }

  synth.cancel();
  synth.speak(utter);
}

/* =========================
   GAME CONSTANTS
   ========================= */

const SEAT_COUNT = 8;

const VALUES = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const SUITS = ["♠","♥","♦","♣"];

function buildDeck() {
  const deck = [];
  SUITS.forEach(s =>
    VALUES.forEach(v => deck.push({ value: v, suit: s }))
  );
  return deck.sort(() => Math.random() - 0.5);
}

/* =========================
   APP
   ========================= */

export default function App() {
  const [deck, setDeck] = useState(buildDeck());
  const [currentSeat, setCurrentSeat] = useState(0);
  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [announcer, setAnnouncer] = useState("arena");

  const [seats, setSeats] = useState(
    Array.from({ length: SEAT_COUNT }, (_, i) => ({
      name: `Seat ${i + 1}`,
      drinks: 0
    }))
  );

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  function addDrink(index) {
    const copy = [...seats];
    copy[index].drinks += 1;
    setSeats(copy);
  }

  function drawCard() {
    if (!deck.length) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();
    setDeck(nextDeck);

    const seatName = seats[currentSeat].name;

    // Persistent roles
    if (card.value === "7") {
      setThumbMaster(currentSeat);
      speak(`${seatName} is now Thumb Master.`, announcer);
    }

    if (card.value === "J") {
      setQuestionMaster(currentSeat);
      speak(`${seatName} is Question Master.`, announcer);
    }

    if (card.value === "K") {
      speak(`${seatName}. Make a rule.`, announcer);
    }

    // Advance turn
    setCurrentSeat((currentSeat + 1) % seats.length);
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="top-bar">
        <span>🂠 {deck.length} cards left</span>

        <select
          value={announcer}
          onChange={e => setAnnouncer(e.target.value)}
        >
          <option value="arena">🎙 Arena</option>
          <option value="action">💥 Action</option>
          <option value="toxic">☠️ Toxic</option>
          <option value="off">🔇 Off</option>
        </select>
      </div>

      <div className="masters">
        👇 Thumb: {thumbMaster !== null ? seats[thumbMaster].name : "None"} <br />
        ❓ Question: {questionMaster !== null ? seats[questionMaster].name : "None"}
      </div>

      <div className="seats">
        {seats.map((s, i) => (
          <div
            key={i}
            className={`seat ${i === currentSeat ? "active" : ""}`}
          >
            <span>{s.name}</span>
            <span>🍺 {s.drinks}</span>
            <button onClick={() => addDrink(i)}>+1</button>
          </div>
        ))}
      </div>

      <button className="draw-btn" onClick={drawCard}>
        Draw Card
      </button>
    </div>
  );
}
