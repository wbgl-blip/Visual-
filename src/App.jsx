import { useEffect, useState } from "react";
import "./App.css";

/* ------------------ DECK SETUP ------------------ */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck() {
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({ rank, suit });
    });
  });
  return shuffle(deck);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

/* ------------------ RULES ------------------ */

function getRule(card) {
  switch (card.rank) {
    case "A": return "Waterfall – everyone drinks";
    case "2": return "You – pick someone to drink";
    case "3": return "Me – you drink";
    case "4": return "Whores – we all drink";
    case "5": return "Guys drink";
    case "6": return "Dicks – we all drink";
    case "7": return "Heaven – last hand up drinks";
    case "8": return "Mate – pick a buddy";
    case "9": return "Rhyme – loser drinks";
    case "10": return "Categories – loser drinks";
    case "J": return "Thumb Master";
    case "Q": return "Question Master";
    case "K": return "Make a rule";
    default: return "";
  }
}

/* ------------------ MEDALS ------------------ */

function getMedal(card) {
  switch (card.rank) {
    case "J": return "Sticky Fingers 🖐️";
    case "Q": return "Interrogator ❓";
    case "7": return "Sky Lord ☁️";
    case "A": return "Hydration Hero 💧";
    default: return null;
  }
}

/* ------------------ ANNOUNCER ------------------ */

function speak(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const voices = synth.getVoices();
  const voice =
    voices.find(v => v.name.includes("Google")) ||
    voices.find(v => v.lang === "en-US") ||
    voices[0];

  const utter = new SpeechSynthesisUtterance(text);
  utter.voice = voice;
  utter.rate = 0.95;
  utter.pitch = 0.9;
  utter.volume = 1;

  synth.cancel();
  synth.speak(utter);
}

/* ------------------ APP ------------------ */

export default function App() {
  const [players, setPlayers] = useState([
    { name: "Player 1", drinks: 0, medals: [] },
    { name: "Player 2", drinks: 0, medals: [] }
  ]);

  const [deck, setDeck] = useState(buildDeck());
  const [currentCard, setCurrentCard] = useState(null);
  const [rule, setRule] = useState("");

  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);
  const [heavenMaster, setHeavenMaster] = useState(null);

  /* ------------------ DRAW CARD ------------------ */

  function drawCard() {
    if (deck.length === 0) return;

    const [card, ...rest] = deck;
    setDeck(rest);
    setCurrentCard(card);

    const ruleText = getRule(card);
    setRule(ruleText);

    speak(ruleText);

    // Role reassignment
    if (card.rank === "J") setThumbMaster(players[0].name);
    if (card.rank === "Q") setQuestionMaster(players[0].name);
    if (card.rank === "7") setHeavenMaster(players[0].name);

    // Medal awarding
    const medal = getMedal(card);
    if (medal) {
      setPlayers(prev =>
        prev.map((p, i) =>
          i === 0 && !p.medals.includes(medal)
            ? { ...p, medals: [...p.medals, medal] }
            : p
        )
      );
      speak(medal);
    }
  }

  /* ------------------ UI ------------------ */

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="status">
        <div>Cards left: {deck.length}</div>
        <div>👑 Thumb: {thumbMaster || "—"}</div>
        <div>❓ Question: {questionMaster || "—"}</div>
        <div>☁️ Heaven: {heavenMaster || "—"}</div>
      </div>

      <button onClick={drawCard} disabled={deck.length === 0}>
        Draw Card
      </button>

      {currentCard && (
        <div className="card">
          <div className="card-rank">{currentCard.rank}</div>
          <div className="card-suit">{currentCard.suit}</div>
          <div className="card-rule">{rule}</div>
        </div>
      )}

      <div className="players">
        {players.map((p, i) => (
          <div key={i} className="player">
            <strong>{p.name}</strong>
            <div>🍺 Drinks: {p.drinks}</div>
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
