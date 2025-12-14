import { useState, useEffect } from "react";
import "./App.css";

/* -------------------- CARD + MEDAL DATA -------------------- */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const RULES_BY_RANK = {
  A: "Waterfall – everyone drinks",
  2: "You – pick someone to drink",
  3: "Me – you drink",
  4: "Whores – everyone drinks",
  5: "Guys drink",
  6: "Dicks – everyone drinks",
  7: "Heaven – last to raise hand drinks",
  8: "Mate – pick a drinking buddy",
  9: "Rhyme – loser drinks",
  10: "Categories – loser drinks",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

// Medals tied to specific cards (NOT every card)
const MEDALS_BY_RANK = {
  A: "Waterfall King",
  K: "Rule Maker",
  8: "Best Mate"
};

/* -------------------- ANNOUNCER VOICE -------------------- */

function speak(text, mode) {
  if (mode === "off") return;
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find(v => v.lang.startsWith("en")) || voices[0];

  if (mode === "arena") {
    utterance.rate = 0.85;
    utterance.pitch = 0.85;
  }
  if (mode === "action") {
    utterance.rate = 0.95;
    utterance.pitch = 0.7;
  }
  if (mode === "toxic") {
    utterance.rate = 1;
    utterance.pitch = 0.6;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function getToxicTier(drawCount, deckSize) {
  const progress = drawCount / deckSize;
  if (progress < 0.33) return "mild";
  if (progress < 0.66) return "mean";
  return "nuclear";
}

const MEDAL_LINES = {
  "Waterfall King": {
    toxic: {
      mild: ["Waterfall King. Everyone drinks."],
      mean: ["Waterfall King. This is your fault."],
      nuclear: [
        "Waterfall King. You ruined the night.",
        "Congratulations. Everyone hates you."
      ]
    }
  },
  "Rule Maker": {
    toxic: {
      mild: ["Rule Maker. Choose wisely."],
      mean: ["Rule Maker. This will go badly."],
      nuclear: [
        "Rule Maker. Make it hurt.",
        "Rule Maker. Be cruel."
      ]
    }
  },
  "Best Mate": {
    toxic: {
      mild: ["Best Mate locked in."],
      mean: ["Best Mate. Misery loves company."],
      nuclear: [
        "Best Mate. Drag them down with you."
      ]
    }
  }
};

/* -------------------- APP -------------------- */

export default function App() {
  const [players, setPlayers] = useState([
    "Seat 1",
    "Seat 2",
    "Seat 3",
    "Seat 4"
  ]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [medals, setMedals] = useState({});
  const [announcerMode, setAnnouncerMode] = useState("toxic");
  const [drawCount, setDrawCount] = useState(0);

  /* Build deck on load */
  useEffect(() => {
    const newDeck = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        newDeck.push({ suit, rank });
      });
    });
    setDeck(shuffle(newDeck));
  }, []);

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function drawCard() {
    if (deck.length === 0) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();
    setDeck(nextDeck);
    setCurrentCard(card);
    setDrawCount(c => c + 1);

    const playerName = players[currentPlayer];
    const medalName = MEDALS_BY_RANK[card.rank];

    // Award permanent medal
    if (medalName) {
      setMedals(prev => {
        const owned = prev[playerName] || [];
        if (owned.includes(medalName)) return prev;

        const updated = {
          ...prev,
          [playerName]: [...owned, medalName]
        };

        if (announcerMode === "toxic") {
          const tier = getToxicTier(drawCount, 52);
          const lines = MEDAL_LINES[medalName]?.toxic?.[tier];
          if (lines?.length) {
            speak(
              `${playerName}. ${lines[Math.floor(Math.random() * lines.length)]}`,
              announcerMode
            );
          }
        }

        return updated;
      });
    }

    setCurrentPlayer((currentPlayer + 1) % players.length);
  }

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="announcer-toggle">
        <label>Announcer</label>
        <select
          value={announcerMode}
          onChange={e => setAnnouncerMode(e.target.value)}
        >
          <option value="arena">Arena</option>
          <option value="action">Action</option>
          <option value="toxic">Toxic</option>
          <option value="off">Off</option>
        </select>
      </div>

      <div className="seats">
        {players.map((p, i) => (
          <div
            key={i}
            className={`seat ${i === currentPlayer ? "active" : ""}`}
          >
            {p}
          </div>
        ))}
      </div>

      <button onClick={drawCard} disabled={deck.length === 0}>
        Draw Card ({deck.length} left)
      </button>

      {currentCard && (
        <div className="card">
          <div className="card-value">
            {currentCard.rank}
            {currentCard.suit}
          </div>
          <div className="card-text">
            {RULES_BY_RANK[currentCard.rank]}
          </div>
        </div>
      )}

      <div className="medals">
        <h3>Medals</h3>
        {Object.entries(medals).map(([player, list]) => (
          <div key={player}>
            <strong>{player}</strong>
            <ul>
              {list.map(m => (
                <li key={m}>🏅 {m}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
