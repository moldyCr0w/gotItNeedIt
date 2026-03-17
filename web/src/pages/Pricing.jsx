import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPricing, refreshPricing, getCard } from '../api.js';
import styles from './Pricing.module.css';

const SOURCE_LABELS = {
  tcgplayer: 'TCGPlayer',
  ebay_sold: 'eBay Sold',
  pricecharting: 'PriceCharting',
};

export default function Pricing() {
  const { cardId } = useParams();
  const [card, setCard] = useState(null);
  const [prices, setPrices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getCard(cardId).then(setCard);
    getPricing(cardId).then(setPrices);
  }, [cardId]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const updated = await refreshPricing(cardId);
      setPrices(updated);
    } finally {
      setRefreshing(false);
    }
  }

  const avg = prices.length
    ? prices.reduce((sum, p) => sum + parseFloat(p.price), 0) / prices.length
    : null;

  return (
    <div className={styles.page}>
      {card && (
        <div className={styles.cardInfo}>
          {card.image_large && <img src={card.image_large} alt={card.name} className={styles.img} />}
          <div>
            <h1 className={styles.name}>{card.name}</h1>
            <div className={styles.set}>{card.set_name} · #{card.number}</div>
            {card.rarity && <div className={styles.rarity}>{card.rarity}</div>}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Pricing</h2>
          <button onClick={handleRefresh} disabled={refreshing} className={styles.refreshBtn}>
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </button>
        </div>

        {avg != null && (
          <div className={styles.avg}>
            <span className={styles.avgLabel}>Average</span>
            <span className={styles.avgValue}>${avg.toFixed(2)}</span>
          </div>
        )}

        {prices.length === 0 ? (
          <div className={styles.empty}>No price data yet. Hit Refresh to fetch.</div>
        ) : (
          <div className={styles.priceList}>
            {prices.map((p) => (
              <div key={p.id} className={styles.priceRow}>
                <span className={styles.source}>{SOURCE_LABELS[p.source] ?? p.source}</span>
                <span className={styles.price}>${parseFloat(p.price).toFixed(2)}</span>
                <span className={styles.timestamp}>
                  {new Date(p.captured_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
