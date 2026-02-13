const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Déterminer les origines autorisées selon l'environnement
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL, process.env.API_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log des requêtes pour déboguer
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API TrouveTaBoite',
    status: 'OK',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Route de test pour vérifier la connexion
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Routes des entreprises
const companiesRoutes = require('./routes/companies');
app.use('/api/companies', companiesRoutes);

// En production, servir les fichiers statiques du frontend (si déployés ensemble)
if (process.env.SERVE_STATIC === 'true') {
  const clientDistPath = process.env.STATIC_PATH || path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Démarrage du serveur uniquement si exécuté directement (pas via Passenger)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
}

module.exports = app;

