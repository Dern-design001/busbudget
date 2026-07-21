// ============================================================
// routes/entries.js — REST API for budget entries (per user)
// ============================================================
const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ── Middleware: require login for all entry routes ─────────
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Login required' });
}
router.use(requireAuth);

// ── GET /api/entries — fetch all entries for this user ────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM entries WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /entries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// ── POST /api/entries — create a new entry ────────────────
router.post('/', async (req, res) => {
  const { id, date, budget, spent, saved, expenses } = req.body;

  if (!id || !date || budget == null) {
    return res.status(400).json({ error: 'id, date and budget are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO entries (id, date, budget, spent, saved, expenses, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, date, budget, spent, saved, JSON.stringify(expenses), req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: `Entry for ${date} already exists` });
    }
    console.error('POST /entries error:', err.message);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// ── PUT /api/entries/:id — update an entry (owned by user) ─
router.put('/:id', async (req, res) => {
  const { id }                                   = req.params;
  const { date, budget, spent, saved, expenses } = req.body;

  try {
    const result = await pool.query(
      `UPDATE entries
       SET date=$1, budget=$2, spent=$3, saved=$4, expenses=$5
       WHERE id=$6 AND user_id=$7
       RETURNING *`,
      [date, budget, spent, saved, JSON.stringify(expenses), id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /entries error:', err.message);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// ── DELETE /api/entries/:id — delete (owned by user only) ─
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM entries WHERE id=$1 AND user_id=$2',
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /entries error:', err.message);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
