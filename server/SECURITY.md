# 🔒 Politique de Sécurité - TrouveTaBoite API

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans l'API TrouveTaBoite.

## Mesures de sécurité implémentées

### 1. Protection des Headers HTTP (Helmet)

```javascript
app.use(helmet({
  contentSecurityPolicy: {...},
  hsts: true,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
}));
```

**Headers configurés :**
- `Content-Security-Policy` : Limite les sources de contenu
- `Strict-Transport-Security` : Force HTTPS en production
- `X-Content-Type-Options: nosniff` : Empêche le MIME sniffing
- `X-Frame-Options: DENY` : Empêche le clickjacking
- `X-XSS-Protection: 1; mode=block` : Protection XSS navigateur

### 2. Rate Limiting

```javascript
// Limite globale : 100 req/15min en prod
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Limite recherche : 10 req/min en prod
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10
});
```

### 3. Validation des entrées (express-validator)

Toutes les entrées utilisateur sont :
- Validées avec des règles strictes
- Sanitizées pour supprimer les caractères dangereux
- Limitées en longueur
- Vérifiées contre une whitelist (secteurs)

### 4. Protection CORS

```javascript
app.use(cors({
  origin: dynamicOriginCheck,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
```

### 5. Limitation des payloads

- Taille maximale : 100KB (réduit de 10MB)
- Nombre de paramètres limité
- JSON strict uniquement

### 6. Sanitization des réponses

Toutes les données retournées sont sanitizées :
- URLs validées
- Emails validés
- Téléphones nettoyés
- Longueurs limitées
- Pas de données inattendues

### 7. Gestion sécurisée des erreurs

- Pas de stack traces en production
- Messages d'erreur génériques
- Logging sécurisé sans données sensibles

## Variables d'environnement requises

```env
# Mode de l'application
NODE_ENV=production

# Origins autorisées (séparées par des virgules)
ALLOWED_ORIGINS=https://monsite.com,https://www.monsite.com

# Tokens API (ne jamais commiter !)
PAPPERS_API_TOKEN=votre_token
INSEE_API_KEY=votre_cle
```

## Bonnes pratiques

### À faire

- ✅ Toujours utiliser HTTPS en production
- ✅ Définir `NODE_ENV=production` en prod
- ✅ Configurer `ALLOWED_ORIGINS` correctement
- ✅ Garder les dépendances à jour
- ✅ Surveiller les logs pour les tentatives d'attaque

### À ne pas faire

- ❌ Ne jamais commiter les fichiers `.env`
- ❌ Ne jamais exposer les tokens API
- ❌ Ne jamais désactiver la validation
- ❌ Ne jamais logger les données sensibles
- ❌ Ne jamais faire confiance aux données utilisateur

## Audit des dépendances

Exécutez régulièrement :

```bash
npm audit
npm audit fix
```

## Signalement de vulnérabilités

Si vous découvrez une vulnérabilité, veuillez :
1. Ne pas la divulguer publiquement
2. Contacter l'équipe de développement
3. Fournir les détails techniques
4. Attendre le correctif avant divulgation

## Changelog sécurité

### v1.1.0 (2026-01-18)
- ✅ Ajout du rate limiting
- ✅ Validation whitelist des secteurs
- ✅ Sanitization des réponses API
- ✅ Amélioration des headers de sécurité
- ✅ Logging sécurisé sans données sensibles
- ✅ Gestion des erreurs sécurisée
- ✅ Limitation de la taille des payloads
- ✅ Validation renforcée des coordonnées GPS
