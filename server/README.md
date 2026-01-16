# TrouveTaBoite - Server

Backend Node.js avec Express et Sequelize ORM.

## Installation

Les dépendances sont déjà installées. Si besoin :

```bash
npm install
```

## Configuration

1. Créer une base de données MySQL/PostgreSQL nommée `findyourcompany`
2. Modifier le fichier `.env` avec vos informations de connexion :
   - `DB_NAME` - Nom de la base de données
   - `DB_USER` - Utilisateur de la base de données
   - `DB_PASS` - Mot de passe de la base de données
   - `DB_HOST` - Hôte de la base de données (ex: localhost)
   - `DB_PORT` - Port de la base de données (ex: 8889 pour MySQL/MAMP, 5432 pour PostgreSQL)
   - `INSEE_API_KEY` - Clé API INSEE pour l'API Sirene
   - `PAPPERS_API_TOKEN` - Token API Pappers (https://www.pappers.fr/api)
   - `ENABLE_ENRICHMENT` - (Optionnel) Activer l'enrichissement PagesJaunes (true/false, défaut: false)
   - `ENRICHMENT_LIMIT` - (Optionnel) Nombre max d'entreprises à enrichir avec PagesJaunes (défaut: 20)
   - `PORT` - Port du serveur Express (défaut: 5000)
   - `JWT_SECRET` - Secret pour JWT (si utilisé)

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

## Fonctionnalités

### Recherche d'entreprises

#### Route Sirene (INSEE)
La route `POST /api/companies/search` permet de rechercher des entreprises avec les paramètres suivants :
- `location`: { lat, lon, city, postcode } - Localisation GPS et informations de la ville
- `radius`: nombre - Rayon de recherche en km
- `sector`: string - Secteur d'activité (optionnel)

Le système :
1. Recherche les entreprises dans l'API Sirene (INSEE)
2. Tente d'enrichir avec PagesJaunes pour obtenir email et téléphone (si activé)
3. Retourne toutes les entreprises trouvées
4. Sauvegarde les résultats en base de données

**Note**: L'enrichissement PagesJaunes est optionnel et peut être activé avec `ENABLE_ENRICHMENT=true` dans `.env`.

#### Route Pappers (recommandée)
La route `POST /api/companies/search-pappers` permet de rechercher des entreprises via l'API Pappers.

**Avantages** :
- Retourne UNIQUEMENT les entreprises avec un email public
- Données plus complètes (téléphone, site web, effectif, etc.)
- Filtrage par rayon géographique précis
- Pas de blocage comme avec le scraping

**Paramètres** :
- `location`: { lat, lon, city, postcode } - Localisation (code postal requis)
- `radius`: nombre - Rayon de recherche en km (défaut: 5km)
- `sector`: string - Secteur d'activité (optionnel)

**Réponse** :
```json
{
  "companies": [...],
  "total": 15,
  "stats": {
    "withEmail": 15,
    "withPhone": 12,
    "withBoth": 10,
    "withWebsite": 8
  },
  "message": "15 entreprises avec email trouvées dans un rayon de 5km"
}
```

## Technologies

- **Express** - Framework web
- **Sequelize** - ORM pour MySQL/PostgreSQL
- **MySQL/PostgreSQL** - Base de données
- **n8n** - Plateforme d'automatisation de workflows
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variables d'environnement
- **nodemon** - Rechargement automatique en développement
- **axios** - Client HTTP pour les appels API
- **cheerio** - Parsing HTML pour le scraping PagesJaunes

