const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Sécurité : Helmet pour les headers HTTP sécurisés
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS pour permettre les requêtes depuis le frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '10mb' })); // Limiter la taille des requêtes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Vérification des variables d'environnement critiques
const requiredEnvVars = {
  PAPPERS_API_TOKEN: process.env.PAPPERS_API_TOKEN,
  INSEE_API_KEY: process.env.INSEE_API_KEY
};

console.log('\n📋 Configuration:');
console.log(`   Port: ${PORT}`);
console.log(`   PAPPERS_API_TOKEN: ${requiredEnvVars.PAPPERS_API_TOKEN ? '✅ Défini' : '⚠️  NON DÉFINI (requis pour /search-pappers)'}`);
console.log(`   INSEE_API_KEY: ${requiredEnvVars.INSEE_API_KEY ? '✅ Défini' : '⚠️  NON DÉFINI (requis pour /search)'}`);
console.log('');

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`   API disponible sur http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

