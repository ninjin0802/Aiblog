import { Router } from 'express';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import pool from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    if (showAll) {
      const auth = req.headers.authorization;
      try { jwt.verify(auth?.replace('Bearer ', '') ?? '', JWT_SECRET); }
      catch { return res.status(401).json({ error: 'Unauthorized' }); }
    }
    const { rows } = await pool.query(`
      SELECT p.*, COUNT(c.id) FILTER (WHERE c.status = 'approved') as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      ${showAll ? '' : "WHERE p.status = 'published'"}
      GROUP BY p.id
      ORDER BY p.date DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { id, title_ja, title_en, date, category, tags, read_time, excerpt_ja, excerpt_en, blocks, status } = req.body;
  try {
    // Sanitize HTML in blocks to prevent XSS
    const sanitizedBlocks = (blocks || []).map(block => {
      if (block.text && typeof block.text === 'string') {
        return { ...block, text: sanitizeHtml(block.text) };
      }
      return block;
    });

    const { rows } = await pool.query(
      `INSERT INTO posts (id, title_ja, title_en, date, category, tags, read_time, excerpt_ja, excerpt_en, blocks, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         title_ja=$2, title_en=$3, date=$4, category=$5, tags=$6,
         read_time=$7, excerpt_ja=$8, excerpt_en=$9, blocks=$10, status=$11
       RETURNING *`,
      [id, title_ja, title_en, date, category, tags, read_time, excerpt_ja, excerpt_en, JSON.stringify(sanitizedBlocks), status]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    await pool.query('UPDATE posts SET views = COALESCE(views,0)+1 WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
