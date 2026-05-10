const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connexion à Render
const pool = new Pool({
  connectionString: 'postgresql://location_voiture_user:QrrccoPcSEWgTJjBG7M3iHg6d5DNx11D@dpg-d7vrsvegvqtc73cvevg0-a.frankfurt-postgres.render.com/location_voiture?sslmode=require'
});

// Lire le fichier SQL
const sqlPath = path.join(__dirname, '..', 'database.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

console.log('⏳ Connexion à Render...');

pool.query(sql)
  .then(() => {
    console.log('✅ Base de données initialisée avec succès !');
    console.log('✅ Tables créées : agents, clients, vehicules, locations, retours');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });