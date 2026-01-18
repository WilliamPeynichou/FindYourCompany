const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// SÉCURITÉ : Configuration Helmet (Headers HTTP sécurisés)
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://geo.api.gouv.fr", "https://api-adresse.data.gouv.fr", "https://recherche-entreprises.api.gouv.fr"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));

// ============================================================================
// SÉCURITÉ : Rate Limiting pour prévenir les attaques DDoS et brute force
// ============================================================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Plus permissif en dev
  message: {
    error: 'Trop de requêtes',
    message: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer dans 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Ne pas limiter le health check
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 10 : 100, // 10 recherches par minute en prod
  message: {
    error: 'Trop de recherches',
    message: 'Vous avez dépassé la limite de recherches. Veuillez réessayer dans 1 minute.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ============================================================================
// SÉCURITÉ : Configuration CORS dynamique basée sur l'environnement
// ============================================================================
const allowedOrigins = isProduction
  ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: Postman, curl) uniquement en dev
    if (!origin && !isProduction) {
      return callback(null, true);
    }
    if (!origin && isProduction) {
      return callback(new Error('Origin non autorisée'), false);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin non autorisée par CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight pendant 24h
}));

// ============================================================================
// SÉCURITÉ : Limitation de la taille des payloads
// ============================================================================
app.use(express.json({ 
  limit: '100kb', // Réduit de 10mb à 100kb
  strict: true // Rejeter les payloads non-JSON
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '100kb',
  parameterLimit: 50 // Limiter le nombre de paramètres
}));

// ============================================================================
// SÉCURITÉ : Logging sécurisé (pas de données sensibles en prod)
// ============================================================================
app.use((req, res, next) => {
  if (!isProduction) {
    // En dev, logger plus de détails (mais pas de données sensibles)
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  } else {
    // En prod, logging minimal
    const sanitizedPath = req.path.replace(/[^\w\/-]/g, '');
    console.log(`${new Date().toISOString()} - ${req.method} ${sanitizedPath}`);
  }
  next();
});

// ============================================================================
// SÉCURITÉ : Headers de sécurité supplémentaires
// ============================================================================
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ============================================================================
// Routes publiques
// ============================================================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'API TrouveTaBoite',
    status: 'OK',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Backend opérationnel',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Routes des entreprises (avec rate limiting spécifique)
// ============================================================================
const companiesRoutes = require('./routes/companies');
app.use('/api/companies', searchLimiter, companiesRoutes);

// ============================================================================
// SÉCURITÉ : Gestionnaire d'erreurs global
// ============================================================================
app.use((err, req, res, next) => {
  // Logger l'erreur de manière sécurisée
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  
  // Ne jamais exposer les stack traces en production
  const errorResponse = {
    error: 'Erreur serveur',
    message: isProduction ? 'Une erreur est survenue' : err.message
  };
  
  // Ajouter le stack trace uniquement en développement
  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }
  
  res.status(err.status || 500).json(errorResponse);
});

// ============================================================================
// SÉCURITÉ : Gestion des routes non trouvées
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.path} n'existe pas`
  });
});

// ============================================================================
// Vérification de la configuration
// ============================================================================
const checkConfiguration = () => {
  const warnings = [];
  
  if (!process.env.PAPPERS_API_TOKEN) {
    warnings.push('PAPPERS_API_TOKEN non défini');
  }
  if (!process.env.INSEE_API_KEY) {
    warnings.push('INSEE_API_KEY non défini');
  }
  if (isProduction && !process.env.ALLOWED_ORIGINS) {
    warnings.push('ALLOWED_ORIGINS non défini en production');
  }
  
  console.log('\n📋 Configuration:');
  console.log(`   Mode: ${isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   PAPPERS_API_TOKEN: ${process.env.PAPPERS_API_TOKEN ? '✅' : '⚠️'}`);
  console.log(`   INSEE_API_KEY: ${process.env.INSEE_API_KEY ? '✅' : '⚠️'}`);
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Avertissements:');
    warnings.forEach(w => console.log(`   - ${w}`));
  }
  console.log('');
};

// ============================================================================
// Démarrage du serveur
// ============================================================================
app.listen(PORT, () => {
  checkConfiguration();
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`   API disponible sur http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
