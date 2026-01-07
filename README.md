# FindYourCompany

Plateforme web permettant aux professionnels et étudiants de rechercher des entreprises par localisation et secteur d'activité, avec accès aux coordonnées complètes (nom, email, adresse, téléphone).

## 🚀 Technologies

### Frontend
- **React** avec **Vite**
- **React Router DOM** pour la navigation
- **Tailwind CSS v4** pour le styling
- **React Leaflet** pour la cartographie interactive
- **React Hook Form** + **Zod** pour la validation des formulaires
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec **Express**
- **Sequelize** comme ORM
- **PostgreSQL** comme base de données
- **n8n** pour l'automatisation des workflows de scraping

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
# Éditer .env avec vos informations de connexion PostgreSQL

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:5000`

### n8n (Workflow automation)

```bash
cd server
npm run n8n
```

n8n sera accessible sur `http://localhost:5678`

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
```

## 🎯 Fonctionnalités

- ✅ Recherche d'entreprises par localisation (avec autocomplétion)
- ✅ Filtrage par rayon de recherche (5km à 200km)
- ✅ Filtrage par secteur d'activité
- ✅ Visualisation sur carte interactive (Leaflet)
- ✅ Affichage des résultats avec coordonnées complètes
- ✅ Export des résultats en CSV (à venir)

## 🔄 Workflow n8n

Le projet utilise n8n pour automatiser le scraping des données d'entreprises depuis PagesJaunes et autres sources, avec extraction structurée via LLM.

## 📄 Licence

Ce projet est privé et propriétaire.

## 👤 Auteur

William Peynichou

