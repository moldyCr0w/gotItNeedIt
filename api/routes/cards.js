import { Router } from 'express';
import { searchCards, getCard } from '../services/cards/pokemontcg.js';

const router = Router();

// Search PokéTCG API and cache results
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q is required' });
  try {
    const cards = await searchCards(q);
    res.json(cards);
  } catch (err) {
    res.status(502).json({ error: 'PokéTCG API unavailable' });
  }
});

// Get a single card by id
router.get('/:id', async (req, res) => {
  try {
    const card = await getCard(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (err) {
    res.status(502).json({ error: 'PokéTCG API unavailable' });
  }
});

export default router;
