import db from '../../db.js';
import { fetchPrice as fromTcgplayer } from './tcgplayer.js';
import { fetchPrice as fromEbay } from './ebay.js';
import { fetchPrice as fromPricecharting } from './pricecharting.js';

const SOURCES = [
  { name: 'tcgplayer', fn: fromTcgplayer },
  { name: 'ebay_sold', fn: fromEbay },
  { name: 'pricecharting', fn: fromPricecharting },
];

const TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getAggregatedPrice(cardId) {
  const { rows: card } = await db.query('SELECT * FROM cards WHERE id = $1', [cardId]);
  if (!card.length) throw new Error('Card not found');
  const { name, set_name } = card[0];

  const results = [];

  await Promise.all(
    SOURCES.map(async ({ name: source, fn }) => {
      // Check cache
      const { rows: cached } = await db.query(
        `SELECT * FROM pricing_snapshots
         WHERE card_id = $1 AND source = $2
         ORDER BY captured_at DESC LIMIT 1`,
        [cardId, source]
      );
      if (cached.length && Date.now() - new Date(cached[0].captured_at) < TTL_MS) {
        results.push(cached[0]);
        return;
      }

      try {
        const price = await fn(name, set_name);
        if (price == null) return;

        const { rows } = await db.query(
          `INSERT INTO pricing_snapshots (card_id, source, price) VALUES ($1, $2, $3) RETURNING *`,
          [cardId, source, price]
        );
        results.push(rows[0]);
      } catch {
        // Degrade gracefully — skip unavailable sources
      }
    })
  );

  return results;
}
