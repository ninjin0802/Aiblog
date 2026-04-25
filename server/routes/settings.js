import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from './auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT value FROM settings WHERE key = 'profile'`);
    res.json(rows[0]?.value ?? {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('profile', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
