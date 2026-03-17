import { Router } from 'express';
import { getAggregatedPrice } from '../services/pricing/index.js';
import db from '../db.js';

const router = Router();

// Get latest cached prices for a card
router.get('/:cardId', async (req, res) => {
  const { rows } = await db.query(
    `SELECT DISTINCT ON (source) *
     FROM pricing_snapshots
     WHERE card_id = $1
     ORDER BY source, captured_at DESC`,
    [req.params.cardId]
  );
  res.json(rows);
});

// Refresh prices for a card (fetches from all sources)
router.post('/:cardId/refresh', async (req, res) => {
  const { cardId } = req.params;
  const results = await getAggregatedPrice(cardId);
  if (!results.length) {
    return res.status(502).json({ error: 'No pricing sources available' });
  }
  res.json(results);
});

export default router;
