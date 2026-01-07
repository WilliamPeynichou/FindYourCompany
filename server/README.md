# FindYourCompany - Server

Backend Node.js avec Express et Sequelize ORM.

## Installation

Les dépendances sont déjà installées. Si besoin :

```bash
npm install
```

## Configuration

1. Créer une base de données PostgreSQL nommée `findyourcompany_db`
2. Modifier le fichier `.env` avec vos informations de connexion

## Démarrage

### Mode développement (avec nodemon)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

### n8n (automation workflow)
```bash
npm run n8n
```

Le serveur Express démarre par défaut sur le port 5000.
n8n démarre par défaut sur le port 5678 (accessible via http://localhost:5678).

## Structure

- `config/` - Configuration Sequelize
- `models/` - Modèles de données
- `migrations/` - Migrations de base de données
- `seeders/` - Données de seed
- `index.js` - Point d'entrée de l'application

## Technologies

- **Express** - Framework web
- **Sequelize** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **n8n** - Plateforme d'automatisation de workflows
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variables d'environnement
- **nodemon** - Rechargement automatique en développement

