import { Router } from 'express';
import db from '../db.js';

const router = Router();

// List binders
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const { rows } = await db.query(
    'SELECT * FROM binders WHERE user_id = $1 ORDER BY created_at',
    [userId]
  );
  res.json(rows);
});

// Create binder
router.post('/', async (req, res) => {
  const { userId, name, description } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });
  const { rows } = await db.query(
    'INSERT INTO binders (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, description]
  );
  res.status(201).json(rows[0]);
});

// Get a binder with its pages and slots
router.get('/:id', async (req, res) => {
  const { rows: binder } = await db.query('SELECT * FROM binders WHERE id = $1', [req.params.id]);
  if (!binder.length) return res.status(404).json({ error: 'Binder not found' });

  const { rows: pages } = await db.query(
    `SELECT bp.*, json_agg(bs.* ORDER BY bs.slot_index) AS slots
     FROM binder_pages bp
     LEFT JOIN binder_slots bs ON bs.page_id = bp.id
     WHERE bp.binder_id = $1
     GROUP BY bp.id
     ORDER BY bp.page_number`,
    [req.params.id]
  );
  res.json({ ...binder[0], pages });
});

// Add a page to a binder
router.post('/:id/pages', async (req, res) => {
  const { pageNumber, pocketLayout = '3x3' } = req.body;
  if (!pageNumber) return res.status(400).json({ error: 'pageNumber is required' });
  const { rows } = await db.query(
    'INSERT INTO binder_pages (binder_id, page_number, pocket_layout) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, pageNumber, pocketLayout]
  );
  res.status(201).json(rows[0]);
});

// Place a card in a slot
router.put('/pages/:pageId/slots/:slotIndex', async (req, res) => {
  const { collectionEntryId } = req.body;
  const { rows } = await db.query(
    `INSERT INTO binder_slots (page_id, slot_index, collection_entry_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (page_id, slot_index) DO UPDATE SET collection_entry_id = EXCLUDED.collection_entry_id
     RETURNING *`,
    [req.params.pageId, req.params.slotIndex, collectionEntryId]
  );
  res.json(rows[0]);
});

// Remove a card from a slot
router.delete('/pages/:pageId/slots/:slotIndex', async (req, res) => {
  await db.query(
    'UPDATE binder_slots SET collection_entry_id = NULL WHERE page_id = $1 AND slot_index = $2',
    [req.params.pageId, req.params.slotIndex]
  );
  res.status(204).end();
});

export default router;
