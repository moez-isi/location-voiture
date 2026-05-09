const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/dashboard/stats - Statistiques tableau de bord
router.get('/stats', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_dashboard_stats');
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/dashboard/recent-locations - Dernières locations
router.get('/recent-locations', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM v_locations_details 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
