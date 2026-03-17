import { Router } from 'express';
import db from '../db.js';

const router = Router();

// --- Folders ---

router.get('/folders', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const { rows } = await db.query(
    'SELECT * FROM chase_folders WHERE user_id = $1 ORDER BY sort_order',
    [userId]
  );
  res.json(rows);
});

router.post('/folders', async (req, res) => {
  const { userId, name, sortOrder = 0 } = req.body;
  if (!userId || !name) return res.status(400).json({ error: 'userId and name are required' });
  const { rows } = await db.query(
    'INSERT INTO chase_folders (user_id, name, sort_order) VALUES ($1, $2, $3) RETURNING *',
    [userId, name, sortOrder]
  );
  res.status(201).json(rows[0]);
});

router.delete('/folders/:id', async (req, res) => {
  await db.query('DELETE FROM chase_folders WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

// --- Chase Entries ---

router.get('/', async (req, res) => {
  const { userId, folderId, priority } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  let query = `SELECT ce.*, c.name, c.set_name, c.number, c.image_small
               FROM chase_entries ce
               JOIN cards c ON c.id = ce.card_id
               WHERE ce.user_id = $1`;
  const params = [userId];
  if (folderId) { params.push(folderId); query += ` AND ce.folder_id = $${params.length}`; }
  if (priority) { params.push(priority); query += ` AND ce.priority = $${params.length}`; }
  query += ' ORDER BY ce.priority, c.set_name, c.number';
  const { rows } = await db.query(query, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { userId, cardId, folderId, priority = 'medium', notes } = req.body;
  if (!userId || !cardId) return res.status(400).json({ error: 'userId and cardId are required' });
  const { rows } = await db.query(
    `INSERT INTO chase_entries (user_id, card_id, folder_id, priority, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, cardId, folderId, priority, notes]
  );
  res.status(201).json(rows[0]);
});

router.patch('/:id', async (req, res) => {
  const { folderId, priority, notes } = req.body;
  const { rows } = await db.query(
    `UPDATE chase_entries
     SET folder_id = COALESCE($1, folder_id),
         priority  = COALESCE($2, priority),
         notes     = COALESCE($3, notes)
     WHERE id = $4 RETURNING *`,
    [folderId, priority, notes, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Entry not found' });
  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM chase_entries WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
