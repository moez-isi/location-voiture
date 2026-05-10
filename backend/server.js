const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS : accepte TOUTES les origines (solution simple pour production)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/vehicules', require('./routes/vehicules'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/retours', require('./routes/retours'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Location de Voiture',
    status: 'En ligne',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' });
});

app.listen(PORT, () => {
  console.log(`🚗 Serveur démarré sur le port ${PORT}`);
});