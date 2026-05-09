const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/retours - Liste tous les retours
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, l.client_id, l.vehicule_id, l.date_debut, l.date_fin,
             c.nom as client_nom, c.prenom as client_prenom,
             v.marque as vehicule_marque, v.modele as vehicule_modele, v.immatriculation
      FROM retours r
      JOIN locations l ON r.location_id = l.id
      JOIN clients c ON l.client_id = c.id
      JOIN vehicules v ON l.vehicule_id = v.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/retours - Enregistrer un retour
router.post('/', auth, async (req, res) => {
  try {
    const { location_id, date_retour, etat, kilometrage_retour, observations } = req.body;

    if (!location_id) {
      return res.status(400).json({ message: 'ID de location requis.' });
    }

    // Vérifier que la location existe et est en cours
    const location = await pool.query(
      "SELECT * FROM locations WHERE id = $1 AND statut = 'en_cours'",
      [location_id]
    );

    if (location.rows.length === 0) {
      return res.status(400).json({ message: 'Location non trouvée ou déjà terminée.' });
    }

    // Créer le retour
    const retourResult = await pool.query(
      `INSERT INTO retours (location_id, date_retour, etat, kilometrage_retour, observations) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [location_id, date_retour || new Date(), etat || 'bon', kilometrage_retour, observations]
    );

    // Terminer la location (met à jour aussi le statut du véhicule via trigger)
    await pool.query(
      "UPDATE locations SET statut = 'termine' WHERE id = $1",
      [location_id]
    );

    res.status(201).json({
      message: 'Retour enregistré avec succès. Véhicule remis en disponible.',
      retour: retourResult.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
