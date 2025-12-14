import { useState } from 'react'

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
  { card: 'Jack', rule: 'Make a rule.' },
  { card: 'Queen', rule: 'Question master.' },
  { card: 'King', rule: 'Pour into the King’s Cup.' }
]

export default function App() {
  const [currentCard, setCurrentCard] = useState(null)

  const drawCard = () => {
    const random = cards[Math.floor(Math.random() * cards.length)]
    setCurrentCard(random)
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>👑 KAD Kings</h1>

      <button style={styles.button} onClick={drawCard}>
        Draw Card
      </button>

      {currentCard && (
        <div style={styles.card}>
          <h2>{currentCard.card}</h2>
          <p>{currentCard.rule}</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem'
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    borderRadius: '12px',
    border: 'none',
    background: '#000',
    color: '#fff'
  },
  card: {
    marginTop: '1rem',
    padding: '1.5rem',
    borderRadius: '12px',
    background: '#f4f4f4',
    width: '80%',
    maxWidth: '300px'
  }
}
