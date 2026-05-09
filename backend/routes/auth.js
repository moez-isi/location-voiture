const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    // Cherche l'agent dans la BDD
    const result = await pool.query('SELECT * FROM agents WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const agent = result.rows[0];
    
    // Compare le mot de passe tapé avec celui hashé dans la BDD
    const isMatch = await bcrypt.compare(password, agent.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // Crée un token JWT (valide 24h)
    const token = jwt.sign(
      { id: agent.id, email: agent.email, nom: agent.nom },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      agent: {
        id: agent.id,
        email: agent.email,
        nom: agent.nom,
        prenom: agent.prenom
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST /api/auth/register - Créer un agent (optionnel)
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    if (!email || !password || !nom) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existing = await pool.query('SELECT * FROM agents WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hash le mot de passe (10 rounds de cryptage)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO agents (email, password, nom, prenom) VALUES ($1, $2, $3, $4) RETURNING id, email, nom, prenom',
      [email, hashedPassword, nom, prenom]
    );

    res.status(201).json({ message: 'Agent créé avec succès.', agent: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;