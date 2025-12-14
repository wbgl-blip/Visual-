import { useState, useEffect } from "react";
import "./App.css";

/* ---------------- DATA ---------------- */

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const RULES = {
  A: "Waterfall – everyone drinks",
  2: "You – pick someone",
  3: "Me – you drink",
  4: "Whores – everyone drinks",
  5: "Guys drink",
  6: "Dicks – everyone drinks",
  7: "Heaven",
  8: "Mate",
  9: "Rhyme",
  10: "Categories",
  J: "Thumb Master",
  Q: "Question Master",
  K: "Make a rule"
};

const MEDALS = {
  A: "Waterfall King",
  K: "Rule Maker",
  8: "Best Mate"
};

/* ---------------- VOICE ---------------- */

function speak(text, mode) {
  if (mode === "off") return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = mode === "toxic" ? 1 : 0.9;
  u.pitch = mode === "toxic" ? 0.6 : 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------------- APP ---------------- */

export default function App() {
  const [players] = useState(
    Array.from({ length: 8 }, (_, i) => `Seat ${i + 1}`)
  );

  const [deck, setDeck] = useState([]);
  const [card, setCard] = useState(null);
  const [turn, setTurn] = useState(0);
  const [medals, setMedals] = useState({});
  const [drinks, setDrinks] = useState({});
  const [gameOver, setGameOver] = useState(false);

  const [announcer, setAnnouncer] = useState("toxic");
  const [nsfw, setNsfw] = useState(false);

  const [thumbMaster, setThumbMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState(null);

  /* ---------- INIT ---------- */

  useEffect(() => {
    const d = [];
    SUITS.forEach(s => RANKS.forEach(r => d.push({ s, r })));
    setDeck(d.sort(() => Math.random() - 0.5));

    const initialDrinks = {};
    players.forEach(p => (initialDrinks[p] = 0));
    setDrinks(initialDrinks);
  }, []);

  /* ---------- DRAW ---------- */

  function drawCard() {
    if (!deck.length) return;

    const next = [...deck];
    const drawn = next.pop();
    setDeck(next);
    setCard(drawn);

    const player = players[turn];

    // Roles
    if (drawn.r === "J") {
      setThumbMaster(turn);
      speak(`${player} is Thumb Master`, announcer);
    }
    if (drawn.r === "Q") {
      setQuestionMaster(turn);
      speak(`${player} is Question Master`, announcer);
    }

    // Medals
    const medal = MEDALS[drawn.r];
    if (medal) {
      setMedals(m => ({
        ...m,
        [player]: [...(m[player] || []), medal]
      }));
      speak(`${player} earned ${medal}`, announcer);
    }

    // End game
    if (next.length === 0) {
      endGame();
    }

    setTurn((turn + 1) % players.length);
  }

  /* ---------- DRINK TRACKING ---------- */

  function addDrink(player, amount) {
    setDrinks(d => ({
      ...d,
      [player]: d[player] + amount
    }));
  }

  /* ---------- END GAME ---------- */

  function endGame() {
    setGameOver(true);

    const sorted = Object.entries(drinks).sort((a,b)=>b[1]-a[1]);
    const mvp = sorted[0];
    const shame = sorted[sorted.length - 1];

    speak(
      nsfw
        ? `${mvp[0]} drank the most. Absolute menace. ${shame[0]} was carried.`
        : `${mvp[0]} drank the most. MVP.`,
      announcer
    );
  }

  /* ---------- UI ---------- */

  return (
    <div className="app">
      <h1>KAD Kings</h1>

      <div className="controls">
        <select value={announcer} onChange={e => setAnnouncer(e.target.value)}>
          <option value="arena">Arena</option>
          <option value="toxic">Toxic</option>
          <option value="off">Off</option>
        </select>

        <label>
          <input type="checkbox" checked={nsfw} onChange={e=>setNsfw(e.target.checked)} />
          NSFW
        </label>
      </div>

      <div className="seats">
        {players.map((p,i)=>(
          <div key={p} className={`seat ${i===turn?"active":""}`}>
            {p}
            {thumbMaster===i && <div>👎 Thumb</div>}
            {questionMaster===i && <div>❓ Question</div>}

            <div className="drinks">
              🍺 {drinks[p]}
              <button onClick={()=>addDrink(p,1)}>+1</button>
              <button onClick={()=>addDrink(p,5)}>+5</button>
            </div>
          </div>
        ))}
      </div>

      {!gameOver && (
        <button onClick={drawCard}>
          Draw Card ({deck.length})
        </button>
      )}

      {card && !gameOver && (
        <div className="card">
          {card.r}{card.s}
          <div>{RULES[card.r]}</div>
        </div>
      )}

      {gameOver && (
        <div className="scoreboard">
          <h2>Final Scores</h2>
          {Object.entries(drinks)
            .sort((a,b)=>b[1]-a[1])
            .map(([p,d])=>(
              <div key={p}>{p}: {d} 🍺</div>
            ))}
        </div>
      )}
    </div>
  );
}
