# Guide de Configuration - API Sirene

## Configuration de l'API Sirene (INSEE)

### 1. Obtenir une clé API INSEE

1. Se connecter au portail https://api.insee.fr/ en mode "Connexion pour les externes"
2. Créer un compte ou utiliser son compte existant (éviter les caractères accentués)
3. Créer une application :
   - Donner un nom et une description (obligatoire)
   - Choisir le mode "simple" (pas "backend to backend")
   - Laisser vide le client ID et le champ "souscription"
4. Souscrire à l'API Sirene :
   - Aller dans "Catalogue" → "Applicatif" → "API Sirene"
   - Cliquer sur "Souscrire"
   - Choisir le plan "Public"
   - Sélectionner l'application créée
   - Valider la souscription
5. Récupérer la clé API :
   - Aller dans votre application → onglet "Souscriptions"
   - Choisir la souscription à l'API Sirene
   - La clé API apparaît à droite

### 2. Configurer la clé API

Ajouter dans `server/.env` :
```env
INSEE_API_KEY=votre_cle_api_ici
```

## Workflow de Recherche

Le système utilise uniquement l'API Sirene officielle de l'INSEE :

1. **Recherche Sirene** : Récupère les entreprises depuis l'API officielle INSEE
2. **Sauvegarde** : Les résultats sont sauvegardés en base de données
3. **Retour** : Les entreprises sont retournées avec leurs informations (nom, adresse, secteur, SIRET)

**Note importante** : L'API Sirene ne fournit **PAS** d'emails ni de numéros de téléphone. Seules les informations officielles sont disponibles.

## Endpoint API

### POST `/api/companies/search`

**Body:**
```json
{
  "location": {
    "city": "Bordeaux",
    "postcode": "33000",
    "lat": "44.8378",
    "lon": "-0.5792"
  },
  "radius": 20,
  "sector": "Informatique / Tech"
}
```

**Response:**
```json
{
  "companies": [
    {
      "siret": "12345678901234",
      "name": "Nom Entreprise",
      "address": "Adresse complète",
      "city": "Bordeaux",
      "postcode": "33000",
      "sector": "62.01Z",
      "phone": null,
      "email": null,
      "website": null
    }
  ],
  "total": 1,
  "message": "1 entreprises trouvées"
}
```

## Base de données

### Créer la base de données

```bash
createdb findyourcompany_db
```

### Lancer les migrations

```bash
cd server
npx sequelize-cli db:migrate
```

## Exemple de requête curl

```bash
curl --location 'https://api.insee.fr/api-sirene/3.11/siret?q=codePostalEtablissement:33000' \
  --header 'X-INSEE-Api-Key-Integration: votre_cle_api'
```

## Documentation API

- Swagger : https://api.insee.fr/api-sirene/3.11/
- Portail : https://api.insee.fr/

## Données disponibles via Sirene

✅ **Disponibles** :
- Nom de l'entreprise
- Adresse complète
- Code postal et ville
- SIRET / SIREN
- Secteur d'activité (code APE/NAF)
- Statut juridique
- Date de création

❌ **Non disponibles** :
- Email
- Téléphone
- Site web

## Notes importantes

- ✅ L'API Sirene est rapide et fiable
- ✅ Données officielles et à jour
- ✅ Pas de problème de blocage ou de rate limiting
- ⚠️ Les entreprises sont retournées même sans coordonnées de contact
- ✅ Utiliser le header `X-INSEE-Api-Key-Integration` pour l'authentification
- ✅ La clé API n'a pas de durée limite mais peut être révoquée/renouvelée depuis le portail
