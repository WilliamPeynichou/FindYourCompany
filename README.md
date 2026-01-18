# TrouveTaBoite

Plateforme web permettant aux professionnels et étudiants de rechercher des entreprises par localisation et secteur d'activité via l'API Recherche Entreprises (data.gouv.fr). Accès aux informations officielles : nom, adresse, SIRET, secteur d'activité.

## 🚀 Technologies

### Frontend
- **React** avec **Vite**
- **Tailwind CSS** pour le styling
- **React Hook Form** + **Zod** pour la validation des formulaires
- **Lucide React** pour les icônes
- **Google AdSense** pour la monétisation

### Backend
- **Node.js** avec **Express**
- **Sequelize** comme ORM
- **PostgreSQL** comme base de données
- **express-rate-limit** pour la protection DDoS
- **helmet** pour les headers de sécurité
- **express-validator** pour la validation des entrées

## 📁 Structure du projet

```
FindYourCompany/
├── client/          # Application React frontend
├── server/          # API Node.js backend
└── README.md        # Ce fichier
```

## 🛠️ Installation

### Prérequis
- Node.js (v18+)
- PostgreSQL (v14+)
- npm ou yarn

### Frontend

```bash
cd client
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Backend

```bash
cd server
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos informations

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

## 📝 Configuration

### Variables d'environnement (server/.env)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=findyourcompany_db
DB_USER=postgres
DB_PASSWORD=postgres

# Clé API INSEE Sirene (optionnel)
INSEE_API_KEY=votre_cle_api_ici

# Token API Pappers (optionnel, pour emails)
PAPPERS_API_TOKEN=votre_token_ici

# Origins autorisées en production
ALLOWED_ORIGINS=https://votre-domaine.com
```

## 🎯 Fonctionnalités

### Version 1.0 (Actuelle)
- ✅ Recherche d'entreprises par localisation (API Geo gouv.fr)
- ✅ Filtrage par rayon de recherche (0km à 200km)
- ✅ Filtrage par secteur d'activité (26 secteurs avec codes NAF précis)
- ✅ Visualisation sur carte interactive
- ✅ Affichage des résultats avec informations officielles
- ✅ Statistiques de recherche
- ✅ Protection sécurité complète (rate limiting, validation, sanitization)
- ✅ Google AdSense intégré

### Version 2.0 (À venir) 🚀
- 🔜 **Récupération des adresses email** des entreprises
- 🔜 **Export CSV** avec toutes les données (nom, adresse, email, téléphone, etc.)
- 🔜 Enrichissement automatique des données de contact

## 🔄 Source de données

Le projet utilise principalement l'**API Recherche Entreprises** (data.gouv.fr) - gratuite et sans limite. Les informations sont officielles et à jour.

**Note** : L'API gratuite ne fournit pas les emails/téléphones. Pour la V2, nous intégrerons des services d'enrichissement pour récupérer ces données.

## 🔒 Sécurité

Le projet implémente de nombreuses mesures de sécurité :
- Rate limiting (protection DDoS)
- Validation stricte des entrées (whitelist secteurs)
- Sanitization des sorties
- Headers de sécurité (Helmet)
- Protection CORS
- Gestion sécurisée des erreurs

Voir `server/SECURITY.md` pour plus de détails.

## 📄 Licence

Ce projet est privé et propriétaire.

## 👤 Auteur

William Peynichou
