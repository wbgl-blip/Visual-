import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

/* ================= CARD SETUP ================= */
const suits = ["♠","♥","♦","♣"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

const buildDeck = () =>
  suits.flatMap(s => ranks.map(r => ({ suit: s, rank: r })));

const shuffle = d => [...d].sort(() => Math.random() - 0.5);

/* ================= MEDAL DEFINITIONS ================= */
const MEDALS = {
  // COMMON
  A: { tier: "common", name: "Ace Hole", text: "Off to a great start, champ." },
  4: { tier: "common", name: "Everyone Drinks", text: "Collective punishment." },
  6: { tier: "common", name: "You're Fucked", text: "That’s unfortunate." },
  7: { tier: "common", name: "Thumb Master", text: "Power went straight to your head." },
  J: { tier: "common", name: "Trigger Happy", text: "Relax, Rambo." },
  Q: { tier: "common", name: "Drama Queen", text: "As expected." },
  K: { tier: "common", name: "Kingmaker", text: "Dictator energy." },

  // UNCOMMON
  COURT_JESTER: {
    tier: "uncommon",
    name: "Court Jester",
    text: "You exist for entertainment."
  },

  // RARE
  POWER_TRIP: {
    tier: "rare",
    name: "Power Trip",
    text: "This went straight to your ego."
  },

  // EPIC
  BOTTLE_COMMANDER: {
    tier: "epic",
    name: "Bottle Commander",
    text: "Multiple casualties confirmed."
  },

  // LEGENDARY
  MAIN_VILLAIN: {
    tier: "legendary",
    name: "Main Villain",
    text: "Everyone agrees it’s you."
  }
};

export default function App() {
  const [roomCode, setRoomCode] = useState("");
  const [roomData, setRoomData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [popup, setPopup] = useState(null);

  const [playerId] = useState(() => crypto.randomUUID());

  /* ================= ROOM ================= */
  async function createRoom() {
    const code = Math.random().toString(36).substring(2,7).toUpperCase();
    await setDoc(doc(db, "rooms", code), {
      hostId: playerId,
      players: [],
      deck: [],
      discard: [],
      turn: 0,
      gameOver: false
    });
    setRoomCode(code);
  }

  async function joinRoom() {
    if (!roomCode || !name.trim()) return;

    const ref = doc(db, "rooms", roomCode);
    const snap = await getDoc(ref);
    if (!snap.exists()) return alert("Room not found");

    const data = snap.data();
    if (data.players.some(p => p.id === playerId)) return;

    await updateDoc(ref, {
      players: [
        ...data.players,
        {
          id: playerId,
          name,
          drinks: 0,
          medals: [],
          stats: { faceCards: 0, causedDrinks: 0 }
        }
      ]
    });
  }

  /* ================= SYNC ================= */
  useEffect(() => {
    if (!roomCode) return;
    return onSnapshot(doc(db, "rooms", roomCode), snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setRoomData(d);
      setPlayers(d.players);
      setDeck(d.deck);
      setDiscard(d.discard);
      setTurn(d.turn);
      setGameOver(d.gameOver);
    });
  }, [roomCode]);

  /* ================= MEDAL ENGINE ================= */
  function awardMedal(player, medalKey) {
    if (player.medals.includes(medalKey)) return;
    player.medals.push(medalKey);
    setPopup(MEDALS[medalKey]);
    setTimeout(() => setPopup(null), 2500);
  }

  /* ================= START ================= */
  async function startGame() {
    if (roomData.hostId !== playerId) return;
    if (players.length < 2) return alert("Need at least 2 players");

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: shuffle(buildDeck()),
      discard: [],
      turn: 0,
      gameOver: false
    });
  }

  /* ================= DRAW ================= */
  async function drawCard() {
    if (!deck.length) return;

    const nextDeck = [...deck];
    const card = nextDeck.pop();

    const nextPlayers = [...players];
    const current = nextPlayers[turn];

    current.drinks += 1;

    // Track stats
    if (["J","Q","K"].includes(card.rank)) current.stats.faceCards++;

    // COMMON MEDALS
    if (MEDALS[card.rank]) awardMedal(current, card.rank);

    // UNCOMMON
    if (current.stats.faceCards === 2) {
      awardMedal(current, "COURT_JESTER");
    }

    // EPIC
    if (current.drinks === 5) {
      awardMedal(current, "BOTTLE_COMMANDER");
    }

    await updateDoc(doc(db, "rooms", roomCode), {
      deck: nextDeck,
      discard: [...discard, card],
      players: nextPlayers,
      turn: nextDeck.length ? (turn + 1) % players.length : turn,
      gameOver: nextDeck.length === 0
    });
  }

  /* ================= END GAME ================= */
  useEffect(() => {
    if (!gameOver || !players.length) return;

    const villain = [...players].sort((a,b)=>b.drinks-a.drinks)[0];
    awardMedal(villain, "MAIN_VILLAIN");
  }, [gameOver]);

  /* ================= UI ================= */
  return (
    <div className="app">
      <h1>KAD Kings</h1>

      {!roomCode && (
        <>
          <button onClick={createRoom}>Create Room</button>
          <input placeholder="ROOM CODE" onChange={e=>setRoomCode(e.target.value.toUpperCase())}/>
          <input placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
          <button onClick={joinRoom}>Join</button>
        </>
      )}

      {roomCode && deck.length === 0 && !gameOver && (
        <>
          <h2>Room: {roomCode}</h2>
          <ul>
            {players.map(p=>(
              <li key={p.id}>
                {p.name} {p.id===roomData.hostId && "👑"}
                <div>
                  {p.medals.map(m=><span key={m}>🏅 {MEDALS[m].name}</span>)}
                </div>
              </li>
            ))}
          </ul>
          {roomData.hostId===playerId && (
            <button onClick={startGame}>Start Game</button>
          )}
        </>
      )}

      {deck.length>0 && !gameOver && (
        <>
          <h2>Turn: {players[turn]?.name}</h2>
          <button onClick={drawCard}>Draw Card</button>
          <p>Cards left: {deck.length}</p>
          {discard.length>0 && (
            <div className="card">
              {discard.at(-1).rank}{discard.at(-1).suit}
            </div>
          )}
        </>
      )}

      {gameOver && (
        <>
          <h2>Game Over</h2>
          {[...players].sort((a,b)=>b.drinks-a.drinks).map(p=>(
            <div key={p.id}>
              <strong>{p.name}</strong> — {p.drinks} drinks
              <div>
                {p.medals.map(m=><div key={m}>{MEDALS[m].name}</div>)}
              </div>
            </div>
          ))}
        </>
      )}

      {popup && (
        <div className="medal-popup">
          <h3>{popup.name}</h3>
          <p>{popup.text}</p>
        </div>
      )}
    </div>
  );
}
