import { Router } from 'express';
import db from '../db.js';

const router = Router();

// List boxes
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const { rows } = await db.query(
    'SELECT * FROM boxes WHERE user_id = $1 ORDER BY created_at',
    [userId]
  );
  res.json(rows);
});

// Create box
router.post('/', async (req, res) => {
  const { userId, name, description } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });
  const { rows } = await db.query(
    'INSERT INTO boxes (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, description]
  );
  res.status(201).json(rows[0]);
});

// Get a box with dividers and rows
router.get('/:id', async (req, res) => {
  const { rows: box } = await db.query('SELECT * FROM boxes WHERE id = $1', [req.params.id]);
  if (!box.length) return res.status(404).json({ error: 'Box not found' });

  const { rows: dividers } = await db.query(
    'SELECT * FROM box_dividers WHERE box_id = $1 ORDER BY sort_order',
    [req.params.id]
  );
  const { rows: cardRows } = await db.query(
    `SELECT br.*, c.name, c.set_name, c.number, c.image_small
     FROM box_rows br
     JOIN collection_entries ce ON ce.id = br.collection_entry_id
     JOIN cards c ON c.id = ce.card_id
     WHERE br.box_id = $1
     ORDER BY br.sort_order`,
    [req.params.id]
  );
  res.json({ ...box[0], dividers, rows: cardRows });
});

// Add a divider
router.post('/:id/dividers', async (req, res) => {
  const { label, sortOrder = 0 } = req.body;
  const { rows } = await db.query(
    'INSERT INTO box_dividers (box_id, label, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [req.params.id, label, sortOrder]
  );
  res.status(201).json(rows[0]);
});

// Add a card row to a box
router.post('/:id/rows', async (req, res) => {
  const { collectionEntryId, dividerId, sortOrder = 0 } = req.body;
  if (!collectionEntryId) return res.status(400).json({ error: 'collectionEntryId is required' });
  const { rows } = await db.query(
    `INSERT INTO box_rows (box_id, divider_id, collection_entry_id, sort_order)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [req.params.id, dividerId, collectionEntryId, sortOrder]
  );
  res.status(201).json(rows[0]);
});

// Remove a card row
router.delete('/rows/:rowId', async (req, res) => {
  await db.query('DELETE FROM box_rows WHERE id = $1', [req.params.rowId]);
  res.status(204).end();
});

export default router;
