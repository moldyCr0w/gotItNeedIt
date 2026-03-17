import { useState } from 'react';
import { searchCards } from '../api.js';
import styles from './CardSearch.module.css';

export default function CardSearch({ onSelect, label = 'Add Card' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const cards = await searchCards(query);
      setResults(cards);
    } finally {
      setLoading(false);
    }
  }

  function select(card) {
    onSelect(card);
    setOpen(false);
    setQuery('');
    setResults([]);
  }

  if (!open) {
    return (
      <button className={styles.trigger} onClick={() => setOpen(true)}>
        + {label}
      </button>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Search Cards</h2>
          <button className={styles.close} onClick={() => setOpen(false)}>✕</button>
        </div>
        <form onSubmit={search} className={styles.form}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Card name (e.g. Charizard)"
          />
          <button type="submit" className={styles.searchBtn} disabled={loading}>
            {loading ? '...' : 'Search'}
          </button>
        </form>
        <div className={styles.results}>
          {results.map((card) => (
            <button key={card.id} className={styles.result} onClick={() => select(card)}>
              {card.image_small && (
                <img src={card.image_small} alt={card.name} className={styles.thumb} />
              )}
              <div>
                <div className={styles.cardName}>{card.name}</div>
                <div className={styles.cardSet}>{card.set_name} · #{card.number}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
