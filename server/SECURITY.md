# Mesures de Sécurité - TrouveTaBoite

Ce document décrit les mesures de sécurité mises en place pour protéger l'application contre les injections SQL et les attaques XSS.

## 🛡️ Protection contre les Injections SQL

### 1. Utilisation de Sequelize ORM
- **Sequelize** utilise des requêtes paramétrées par défaut, ce qui empêche les injections SQL
- Toutes les requêtes à la base de données utilisent des placeholders (`?`) au lieu de concaténation de chaînes

### 2. Validation et Sanitization des Entrées
- **express-validator** valide et sanitize toutes les entrées utilisateur
- Les paramètres sont nettoyés avant d'être utilisés dans les requêtes
- Validation stricte des types de données (nombres, chaînes, formats)

### 3. Protection dans sireneService.js
- Nettoyage des codes postaux (uniquement chiffres)
- Échappement des noms de villes (suppression des guillemets)
- Validation des codes APE/NAF (format numérique strict)

## 🔒 Protection contre les Attaques XSS

### 1. Côté Serveur (Backend)

#### Helmet.js
- Headers HTTP sécurisés configurés via **Helmet**
- Content Security Policy (CSP) pour limiter l'exécution de scripts
- Protection contre le clickjacking
- Headers XSS Protection activés

#### Sanitization des Données
- Tous les champs texte sont sanitizés avant stockage
- Suppression des caractères HTML dangereux (`<`, `>`, `"`, `'`)
- Validation des formats (email, téléphone, URL)

### 2. Côté Client (Frontend)

#### Validation Zod
- Schéma de validation strict avec **Zod**
- Vérification des formats (latitude, longitude, code postal)
- Limitation de la longueur des chaînes
- Regex pour valider les caractères autorisés

#### Échappement HTML
- Fonction `escapeHtml()` pour échapper tous les caractères HTML
- Utilisation systématique dans `ResultsList.jsx`
- Sanitization des URLs, emails et téléphones avant affichage

#### Protection des Liens
- Validation des URLs avant création de liens (`sanitizeUrl()`)
- Validation des emails avant `mailto:` (`sanitizeEmail()`)
- Nettoyage des numéros de téléphone (`sanitizePhone()`)
- Attribut `rel="noreferrer noopener"` sur les liens externes

## 📋 Validations Mises en Place

### Paramètres de Recherche

#### Localisation
- **Latitude** : Nombre entre -90 et 90, formaté à 8 décimales
- **Longitude** : Nombre entre -180 et 180, formaté à 8 décimales
- **Ville** : Max 100 caractères, uniquement lettres, espaces, tirets, apostrophes
- **Code postal** : Exactement 5 chiffres
- **Label** : Max 200 caractères, caractères HTML échappés

#### Rayon
- Nombre entier entre 0 et 200 km
- Valeur par défaut : 20 km si non spécifié

#### Secteur
- Max 100 caractères
- Caractères autorisés : lettres, chiffres, espaces, `/`, `-`, `.`
- Caractères HTML échappés

## 🔐 Headers de Sécurité (Helmet)

- **Content-Security-Policy** : Limite les sources de contenu autorisées
- **X-Content-Type-Options** : Empêche le MIME-sniffing
- **X-Frame-Options** : Protection contre le clickjacking
- **X-XSS-Protection** : Activation de la protection XSS du navigateur
- **Strict-Transport-Security** : Force HTTPS en production

## 📝 Bonnes Pratiques Appliquées

1. **Validation côté client ET serveur** : Double validation pour sécurité maximale
2. **Principe du moindre privilège** : Validation stricte des formats attendus
3. **Échappement systématique** : Toutes les données utilisateur sont échappées avant affichage
4. **Limitation de taille** : Limite de 10MB pour les requêtes JSON
5. **Logs sécurisés** : Les données sensibles ne sont pas loggées

## ⚠️ Notes Importantes

- Les validations sont appliquées **avant** le traitement des données
- Les erreurs de validation retournent des messages clairs sans exposer la structure interne
- Les données sanitizées sont utilisées dans toutes les requêtes
- Sequelize protège automatiquement contre les injections SQL via les requêtes paramétrées

## 🧪 Tests de Sécurité Recommandés

1. Tester avec des payloads XSS : `<script>alert('XSS')</script>`
2. Tester avec des injections SQL : `'; DROP TABLE companies; --`
3. Tester avec des caractères spéciaux : `<>"'&`
4. Tester avec des valeurs hors limites : latitude > 90, rayon > 200
5. Tester avec des formats invalides : code postal avec lettres

## 📚 Références

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [express-validator Documentation](https://express-validator.github.io/docs/)

