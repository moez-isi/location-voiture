const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/vehicules - Liste tous les véhicules
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicules ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/vehicules/disponibles - Véhicules disponibles
router.get('/disponibles', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicules WHERE statut = 'disponible' ORDER BY marque");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/vehicules/:id - Détail
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicules WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/vehicules - Ajouter
router.post('/', auth, async (req, res) => {
  try {
    const { marque, modele, immatriculation, annee, prix_jour, statut } = req.body;

    if (!marque || !modele || !immatriculation || !prix_jour) {
      return res.status(400).json({ message: 'Marque, modèle, immatriculation et prix/jour sont requis.' });
    }

    const result = await pool.query(
      `INSERT INTO vehicules (marque, modele, immatriculation, annee, prix_jour, statut) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [marque, modele, immatriculation, annee, prix_jour, statut || 'disponible']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Immatriculation déjà utilisée.' });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/vehicules/:id - Modifier
router.put('/:id', auth, async (req, res) => {
  try {
    const { marque, modele, immatriculation, annee, prix_jour, statut } = req.body;
    const result = await pool.query(
      `UPDATE vehicules SET marque=$1, modele=$2, immatriculation=$3, annee=$4, prix_jour=$5, statut=$6 
       WHERE id=$7 RETURNING *`,
      [marque, modele, immatriculation, annee, prix_jour, statut, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Immatriculation déjà utilisée.' });
    }
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/vehicules/:id - Supprimer
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicules WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Véhicule non trouvé.' });
    }
    res.json({ message: 'Véhicule supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
