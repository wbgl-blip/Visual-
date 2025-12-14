import { useState } from 'react'

// 🃏 Kings Cup cards (CORRECTED RULES)
const cards = [
  { card: 'Ace', rule: 'Waterfall – everyone drinks, you start.' },
  { card: '2', rule: 'You – choose someone to drink.' },
  { card: '3', rule: 'Me – you drink.' },
  { card: '4', rule: 'Floor – last person to touch the floor drinks.' },
  { card: '5', rule: 'Guys drink.' },
  { card: '6', rule: 'Girls drink.' },
  { card: '7', rule: 'Heaven – last person to raise a hand drinks.' },
  { card: '8', rule: 'Mate – pick a drinking buddy.' },
  { card: '9', rule: 'Rhyme – say a word, others rhyme.' },
  { card: '10', rule: 'Categories – pick a category.' },
  { card: 'Jack', rule: 'Thumb Master – last to put their thumb down drinks.' },
  { card: 'Queen', rule: 'Question Master.' },
  { card: 'King', rule: 'Make a rule and pour into the King’s Cup.' },
]

// 🍻 Degenerate medals
const degenerateMedals = [
  '🍺 THIRSTY',
  '🍻 ALCOHOLIC',
  '🛢️ HUMAN KEG',
  '💀 ON THIN ICE',
  '☠️ DEATH WISH',
  '🚑 MEDIC!',
]

// 😈 NSFW / talking-shit medals
const nsfwMedals = [
  '🤡 CLOWN ENERGY',
  '🗑️ TRASH PULL',
  '🍼 LIGHTWEIGHT',
  '🧠❌ NO THOUGHTS',
  '👀 CAN’T READ',
  '🫠 ABSOLUTELY FOLDED',
]

// ☠️ Ultra-toxic medals
const toxicMedals = [
  '🚮 DOGSHIT LUCK',
  '🎮 SKILL ISSUE',
  '🧠 ROOM TEMPERATURE IQ',
  '🥴 YOU GOOD, BRO?',
  '⚰️ SHOULD’VE STAYED SOBER',
  '🪦 PACK IT UP',
  '📉 FELL OFF',
  '👑➡️🤡 THIS YOUR KING?',
  '🧲 EVERYONE HATES YOU',
  '🎯 DESIGNATED VICTIM',
]

export default function App() {
  const [currentCard, setCurrentCard] = useState(null)
  const [lastCard, setLastCard] = useState(null)
  const [drawCount, setDrawCount] = useState(0)
  const [medal, setMedal] = useState(null)
  const [toxicMode, setToxicMode] = useState(true)

  const randomFrom = (arr) =>
    arr[Math.floor(Math.random() * arr.length)]

  const drawCard = () => {
    const nextCard = cards[Math.floor(Math.random() * cards.length)]
    const nextCount = drawCount + 1

    setLastCard(currentCard)
    setCurrentCard(nextCard)
    setDrawCount(nextCount)

    // 🥇 MEDAL PRIORITY (top → bottom)

    // First draw
    if (nextCount === 1) {
      setMedal('🥇 FIRST BLOOD')
      return
    }

    // King-specific medals
    if (nextCard.card === 'King') {
      setMedal('📜 RULE LORD')
      return
    }

    // Jack-specific medal
    if (nextCard.card === 'Jack') {
      setMedal('🧠 THUMB TYRANT')
      return
    }

    // Same card twice
    if (lastCard && lastCard.card === nextCard.card) {
      setMedal('🔥 DOUBLE DOWN')
      return
    }

    // Degenerate escalation
    if (nextCount === 3) {
      setMedal('🍺 THIRSTY')
      return
    }

    if (nextCount === 5) {
      setMedal('🍻 ALCOHOLIC')
      return
    }

    if (nextCount >= 8) {
      setMedal('🛢️ HUMAN KEG')
      return
    }

    // ☠️ Toxic / NSFW random roast (25% chance)
    if (toxicMode && Math.random() < 0.25) {
      const pool = [
        ...degenerateMedals,
        ...nsfwMedals,
        ...toxicMedals,
      ]
      setMedal(randomFrom(pool))
      return
    }

    // No medal this draw
    setMedal(null)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👑 KAD Kings</h1>

      <div style={styles.toggle}>
  <input
    id="toxic-toggle"
    type="checkbox"
    checked={toxicMode}
    onChange={() => setToxicMode(!toxicMode)}
  />
  <label htmlFor="toxic-toggle"> Toxic Mode</label>
</div>
