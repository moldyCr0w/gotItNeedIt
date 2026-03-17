import { Router } from 'express';
import db from '../db.js';

const router = Router();

// List all collection entries for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const { rows } = await db.query(
    `SELECT ce.*, c.name, c.set_name, c.number, c.image_small
     FROM collection_entries ce
     JOIN cards c ON c.id = ce.card_id
     WHERE ce.user_id = $1
     ORDER BY c.set_name, c.number`,
    [userId]
  );
  res.json(rows);
});

// Add a card to the collection
router.post('/', async (req, res) => {
  const { userId, cardId, quantity = 1, condition, isGraded = false, grade, grader, notes } = req.body;
  if (!userId || !cardId) return res.status(400).json({ error: 'userId and cardId are required' });
  const { rows } = await db.query(
    `INSERT INTO collection_entries (user_id, card_id, quantity, condition, is_graded, grade, grader, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, cardId, quantity, condition, isGraded, grade, grader, notes]
  );
  res.status(201).json(rows[0]);
});

// Update a collection entry
router.patch('/:id', async (req, res) => {
  const { quantity, condition, isGraded, grade, grader, notes } = req.body;
  const { rows } = await db.query(
    `UPDATE collection_entries
     SET quantity = COALESCE($1, quantity),
         condition = COALESCE($2, condition),
         is_graded = COALESCE($3, is_graded),
         grade = COALESCE($4, grade),
         grader = COALESCE($5, grader),
         notes = COALESCE($6, notes)
     WHERE id = $7
     RETURNING *`,
    [quantity, condition, isGraded, grade, grader, notes, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Entry not found' });
  res.json(rows[0]);
});

// Remove a card from the collection
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM collection_entries WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
