# Deploiement - TrouveTaBoite

## Prerequis

- Compte O2Switch avec acces cPanel
- Domaine `trouvetaboite.com` configure
- Acces au Terminal dans cPanel

---

## Premier deploiement

### Etape 1 : Preparer les dossiers

Ouvrez le **Terminal** dans cPanel et executez :

```bash
# Creer les dossiers
mkdir -p ~/public_html/trouvetaboite.com
mkdir -p ~/nodejs/trouvetaboite-api

# Cloner le repo
cd ~
git clone https://github.com/WilliamPeynichou/FindYourCompany.git
```

### Etape 2 : Build et deployer le frontend

```bash
cd ~/FindYourCompany/client
npm install
npm run build

# Copier le build vers le dossier du domaine
cp -r dist/* ~/public_html/trouvetaboite.com/
cp public/.htaccess ~/public_html/trouvetaboite.com/
```

### Etape 3 : Deployer le backend

```bash
# Copier les fichiers du serveur
cp -r ~/FindYourCompany/server/* ~/nodejs/trouvetaboite-api/
```

### Etape 4 : Configurer Node.js dans cPanel

1. Allez dans **cPanel > Setup Node.js App**
2. Cliquez **Create Application**
3. Configurez :
   - **Node.js version** : `18.x` ou `20.x`
   - **Application mode** : `Production`
   - **Application root** : `/home/kifo1668/nodejs/trouvetaboite-api`
   - **Application startup file** : `index.js`
4. Cliquez **Create**

### Etape 5 : Variables d'environnement

Dans l'interface Node.js de cPanel, ajoutez ces variables :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `ALLOWED_ORIGINS` | `https://trouvetaboite.com,https://www.trouvetaboite.com` |
| `CLIENT_DIST_PATH` | `/home/kifo1668/public_html/trouvetaboite.com` |

> **IMPORTANT** : `CLIENT_DIST_PATH` permet a Express de servir le frontend directement. C'est essentiel si `mod_proxy` n'est pas disponible sur votre hebergement mutualise.

### Etape 6 : Installer et demarrer

1. Cliquez **Run NPM Install**
2. Cliquez **Restart**

### Etape 7 : Activer SSL

1. **cPanel > SSL/TLS** ou **Let's Encrypt**
2. Activez le certificat pour `trouvetaboite.com`

---

## Mise a jour du site

Pour mettre a jour apres des modifications :

```bash
cd ~/FindYourCompany
git pull

# Rebuild frontend
cd client
npm install
npm run build
cp -r dist/* ~/public_html/trouvetaboite.com/
cp public/.htaccess ~/public_html/trouvetaboite.com/

# Mettre a jour backend
cp -r ~/FindYourCompany/server/* ~/nodejs/trouvetaboite-api/
```

Puis dans cPanel > **Node.js App** > **Run NPM Install** > **Restart**

---

## Architecture de production

```
O2Switch (cPanel)
|
|-- public_html/trouvetaboite.com/   <-- Frontend React (build)
|   |-- index.html
|   |-- assets/
|   |-- .htaccess                     <-- Redirections HTTPS, cache, securite
|
|-- nodejs/trouvetaboite-api/         <-- Backend Node.js/Express
|   |-- index.js                      <-- Point d'entree (sert aussi le frontend via CLIENT_DIST_PATH)
|   |-- routes/
|   |-- services/
|   |-- .env                          <-- Variables d'environnement
```

**Flux des requetes :**
1. Le navigateur fait une requete vers `https://trouvetaboite.com`
2. Apache/Passenger route vers Express (Node.js)
3. Express sert les fichiers statiques (React) et gere `/api/*`
4. Les appels `/api/companies/search-gouv` utilisent l'API data.gouv.fr (gratuite)

---

## Verification

- **Frontend** : https://trouvetaboite.com
- **API Health** : https://trouvetaboite.com/api/health
  - Doit retourner : `{"status":"OK","message":"Backend operationnel"}`

---

## Depannage

### La recherche ne fonctionne pas

1. Verifiez que l'API repond : `https://trouvetaboite.com/api/health`
2. Si l'API ne repond pas :
   - Verifiez que l'app Node.js est **Running** dans cPanel
   - Consultez les logs dans l'interface Node.js
   - Verifiez que `CLIENT_DIST_PATH` est correctement defini
3. Si l'API repond mais la recherche echoue :
   - Verifiez les logs de l'app Node.js pour des erreurs SSL
   - Testez : `curl https://recherche-entreprises.api.gouv.fr/search?q=test` depuis le terminal cPanel

### Page blanche

- Verifiez que `.htaccess` est bien copie dans `public_html/trouvetaboite.com/`
- Verifiez que `index.html` existe dans ce dossier
- Si Passenger est actif, Express sert le frontend via `CLIENT_DIST_PATH`

### Erreur CORS

- Verifiez la variable `ALLOWED_ORIGINS` dans l'interface Node.js de cPanel
- Doit contenir : `https://trouvetaboite.com,https://www.trouvetaboite.com`

### Erreur 403 "Host not allowed" de l'API gouv

- L'API `recherche-entreprises.api.gouv.fr` peut bloquer certaines IP
- Testez depuis le terminal cPanel : `curl "https://recherche-entreprises.api.gouv.fr/search?q=test&per_page=1"`
- Si bloque, contactez le support O2Switch pour debloquer les requetes HTTPS sortantes

### Cache du navigateur

- Apres une mise a jour, les utilisateurs peuvent voir l'ancienne version
- Le `.htaccess` met `no-cache` sur les fichiers HTML
- Les assets JS/CSS ont un hash unique (Vite), donc le cache est invalide automatiquement
- En cas de probleme : Ctrl+Shift+R (hard refresh)
