# Déploiement FindYourCompany sur o2switch

## Architecture de déploiement

```
o2switch (cPanel)
├── public_html/                    ← Frontend React (fichiers statiques)
│   ├── index.html
│   ├── assets/
│   └── .htaccess                   ← SPA routing + cache + HTTPS
│
├── findyourcompany-api/            ← Backend Node.js (Passenger)
│   ├── app.js                      ← Point d'entrée Passenger
│   ├── index.js                    ← Application Express
│   ├── .env                        ← Variables d'environnement
│   ├── .htaccess                   ← Config Passenger
│   ├── tmp/
│   │   └── restart.txt             ← Toucher pour redémarrer
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── node_modules/
│
└── nodevenv/                       ← Environnement Node.js (créé par cPanel)
    └── findyourcompany-api/18/
```

**Option A** — Sous-domaine API (recommandé) :
- `votredomaine.com` → Frontend (public_html)
- `api.votredomaine.com` → Backend Node.js

**Option B** — Même domaine :
- `votredomaine.com` → Frontend
- `votredomaine.com/api/*` → Backend (via reverse proxy .htaccess)

---

## Étape 1 : Préparer la base de données MySQL

1. Connectez-vous à **cPanel** → **Bases de données MySQL**
2. Créer une base de données : `prefixe_findyourcompany`
3. Créer un utilisateur : `prefixe_user` avec un mot de passe fort
4. Associer l'utilisateur à la base avec **TOUS LES PRIVILÈGES**

> Sur o2switch, le préfixe est votre identifiant cPanel (ex: `abc123_findyourcompany`)

---

## Étape 2 : Configurer le sous-domaine API

1. cPanel → **Sous-domaines**
2. Créer `api.votredomaine.com`
3. Document Root : `/home/USER/findyourcompany-api/public`
   (Créez ce dossier s'il n'existe pas)

---

## Étape 3 : Configurer Node.js sur cPanel

1. cPanel → **Setup Node.js App**
2. Cliquer **CREATE APPLICATION**
3. Remplir :
   - **Node.js version** : 18.x (ou la plus récente disponible)
   - **Application mode** : Production
   - **Application root** : `findyourcompany-api`
   - **Application URL** : `api.votredomaine.com`
   - **Application startup file** : `app.js`
4. Cliquer **CREATE**
5. Noter la commande d'activation de l'environnement virtuel :
   ```bash
   source /home/USER/nodevenv/findyourcompany-api/18/bin/activate
   ```

---

## Étape 4 : Déployer le backend

### Via SSH (recommandé)

```bash
# Se connecter en SSH
ssh user@user.o2switch.net

# Aller dans le dossier de l'application
cd ~/findyourcompany-api

# Activer l'environnement Node.js
source ~/nodevenv/findyourcompany-api/18/bin/activate

# Cloner ou mettre à jour le code
git clone https://github.com/VOTRE_USER/FindYourCompany.git tmp-repo
cp -r tmp-repo/server/* .
rm -rf tmp-repo

# Créer le fichier .env
cp .env.example .env
nano .env  # Remplir les valeurs

# Installer les dépendances
npm ci --production

# Exécuter les migrations
npm run migrate

# Créer le dossier public pour le sous-domaine
mkdir -p public

# Copier le .htaccess
cp .htaccess public/.htaccess

# Redémarrer Passenger
mkdir -p tmp
touch tmp/restart.txt
```

### Via le script de déploiement (depuis votre machine locale)

```bash
# 1. Configurer le script
nano deploy.sh  # Modifier O2SWITCH_USER et O2SWITCH_HOST

# 2. Déployer le backend
./deploy.sh backend
```

---

## Étape 5 : Configurer les variables d'environnement

Créer le fichier `.env` dans `findyourcompany-api/` :

```env
NODE_ENV=production
PORT=5000

# Base de données (valeurs de l'étape 1)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prefixe_findyourcompany
DB_USER=prefixe_user
DB_PASS=votre_mot_de_passe

# API INSEE Sirene
INSEE_API_KEY=votre_cle_api

# URLs
FRONTEND_URL=https://votredomaine.com
API_URL=https://api.votredomaine.com

# Enrichissement (optionnel)
ENABLE_ENRICHMENT=false
```

---

## Étape 6 : Déployer le frontend

### Build local et upload

```bash
# Sur votre machine locale
cd client/

# Créer le fichier d'environnement de production
cp .env.example .env.production
# Modifier VITE_API_URL avec votre URL API
echo "VITE_API_URL=https://api.votredomaine.com" > .env.production

# Build
npm ci
npm run build

# Upload vers o2switch
rsync -avz --delete dist/ user@user.o2switch.net:~/public_html/
```

### Ou via le script

```bash
./deploy.sh frontend
```

---

## Étape 7 : Configurer le SSL (HTTPS)

1. cPanel → **SSL/TLS Status** ou **Let's Encrypt**
2. Activer le certificat SSL pour :
   - `votredomaine.com`
   - `api.votredomaine.com`
3. o2switch fournit Let's Encrypt gratuitement et le renouvelle automatiquement

---

## Étape 8 : Vérification

```bash
# Tester le health check de l'API
curl https://api.votredomaine.com/api/health
# Réponse attendue: {"status":"OK","message":"Backend opérationnel",...}

# Tester la recherche
curl -X POST https://api.votredomaine.com/api/companies/search \
  -H "Content-Type: application/json" \
  -d '{"location":{"city":"Paris","postcode":"75001","lat":"48.8566","lon":"2.3522"},"radius":10,"sector":"Informatique / Tech"}'
```

Puis visitez `https://votredomaine.com` dans votre navigateur.

---

## Commandes utiles

```bash
# Redémarrer l'application Node.js
touch ~/findyourcompany-api/tmp/restart.txt

# Voir les logs de Passenger
cat ~/findyourcompany-api/logs/passenger.log

# Voir les logs Apache/LiteSpeed
tail -f ~/logs/api.votredomaine.com/error.log

# Relancer les migrations
cd ~/findyourcompany-api && source ~/nodevenv/findyourcompany-api/18/bin/activate && npm run migrate

# Vérifier que Node.js fonctionne
node -v
npm -v
```

---

## Dépannage

### L'API retourne une erreur 503
- Vérifiez que l'application Node.js est démarrée dans cPanel
- Vérifiez le fichier `app.js` et `tmp/restart.txt`
- Consultez les logs : `~/findyourcompany-api/logs/`

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans `.env` correspond exactement à votre domaine frontend
- Vérifiez que le protocole (https) est correct

### Base de données non accessible
- Vérifiez les identifiants dans `.env`
- Vérifiez que l'utilisateur est bien associé à la base dans cPanel
- Le host doit être `localhost` sur o2switch

### Le frontend affiche une page blanche
- Vérifiez que `index.html` est bien dans `public_html/`
- Vérifiez le `.htaccess` pour le SPA routing
- Ouvrez la console du navigateur pour voir les erreurs

### Erreur "Cannot find module"
- Relancez `npm ci --production` dans le dossier backend
- Vérifiez que l'environnement Node.js est activé

---

## Mise à jour du projet

```bash
# Méthode rapide depuis votre machine locale
./deploy.sh all

# Ou manuellement
./deploy.sh backend   # Met à jour le backend
./deploy.sh frontend  # Met à jour le frontend
```
