const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/clients - Liste tous les clients
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/clients/:id - Détail d'un client
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/clients - Ajouter un client
router.post('/', auth, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, cin, adresse } = req.body;

    if (!nom || !prenom) {
      return res.status(400).json({ message: 'Nom et prénom sont requis.' });
    }

    const result = await pool.query(
      `INSERT INTO clients (nom, prenom, email, telephone, cin, adresse) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nom, prenom, email, telephone, cin, adresse]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email ou CIN déjà utilisé.' });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/clients/:id - Modifier un client
router.put('/:id', auth, async (req, res) => {
  try {
    const { nom, prenom, email, telephone, cin, adresse } = req.body;
    const result = await pool.query(
      `UPDATE clients SET nom=$1, prenom=$2, email=$3, telephone=$4, cin=$5, adresse=$6 
       WHERE id=$7 RETURNING *`,
      [nom, prenom, email, telephone, cin, adresse, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email ou CIN déjà utilisé.' });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/clients/:id - Supprimer un client
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }
    res.json({ message: 'Client supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
