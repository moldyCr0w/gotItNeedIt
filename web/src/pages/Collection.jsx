import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCollection, addToCollection, removeFromCollection } from '../api.js';
import CardSearch from '../components/CardSearch.jsx';
import styles from './Collection.module.css';

const CONDITIONS = ['NM', 'LP', 'MP', 'HP', 'DMG'];

export default function Collection() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCollection().then(setEntries).finally(() => setLoading(false));
  }, []);

  async function handleAdd(card) {
    const entry = await addToCollection({ cardId: card.id });
    setEntries((prev) => [...prev, { ...entry, name: card.name, set_name: card.set_name, number: card.number, image_small: card.image_small }]);
  }

  async function handleRemove(id) {
    await removeFromCollection(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) return <div className={styles.empty}>Loading...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Got It <span className={styles.count}>{entries.length}</span></h1>
        <CardSearch onSelect={handleAdd} label="Add Card" />
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>No cards yet. Add some!</div>
      ) : (
        <div className={styles.grid}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.card}>
              {entry.image_small && (
                <img
                  src={entry.image_small}
                  alt={entry.name}
                  className={styles.cardImg}
                  onClick={() => navigate(`/pricing/${entry.card_id}`)}
                />
              )}
              <div className={styles.info}>
                <div className={styles.name}>{entry.name}</div>
                <div className={styles.set}>{entry.set_name} · #{entry.number}</div>
                <div className={styles.meta}>
                  <span className={styles.condition}>{entry.condition || '—'}</span>
                  {entry.is_graded && (
                    <span className={styles.grade}>{entry.grader} {entry.grade}</span>
                  )}
                  {entry.quantity > 1 && (
                    <span className={styles.qty}>×{entry.quantity}</span>
                  )}
                </div>
              </div>
              <button className={styles.remove} onClick={() => handleRemove(entry.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
