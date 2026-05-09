const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/locations - Liste avec détails
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_locations_details ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// GET /api/locations/en-cours - Locations actives
router.get('/en-cours', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM v_locations_details WHERE statut = 'en_cours' ORDER BY date_debut");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/locations - Créer une location
router.post('/', auth, async (req, res) => {
  try {
    const { client_id, vehicule_id, date_debut, date_fin } = req.body;

    if (!client_id || !vehicule_id || !date_debut || !date_fin) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérifier si le véhicule est disponible
    const vehicule = await pool.query("SELECT * FROM vehicules WHERE id = $1 AND statut = 'disponible'", [vehicule_id]);
    if (vehicule.rows.length === 0) {
      return res.status(400).json({ message: 'Véhicule non disponible.' });
    }

    const result = await pool.query(
      `INSERT INTO locations (client_id, vehicule_id, agent_id, date_debut, date_fin, statut) 
       VALUES ($1, $2, $3, $4, $5, 'en_cours') RETURNING *`,
      [client_id, vehicule_id, req.agent.id, date_debut, date_fin]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/locations/:id/retour - Terminer une location (retour véhicule)
router.put('/:id/retour', auth, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE locations SET statut = 'termine' WHERE id = $1 AND statut = 'en_cours' RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location non trouvée ou déjà terminée.' });
    }

    res.json({ message: 'Location terminée avec succès.', location: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// PUT /api/locations/:id/annuler - Annuler une location
router.put('/:id/annuler', auth, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE locations SET statut = 'annule' WHERE id = $1 AND statut = 'en_cours' RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location non trouvée ou déjà terminée.' });
    }

    res.json({ message: 'Location annulée avec succès.', location: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
