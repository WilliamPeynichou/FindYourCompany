# 🚀 Déploiement - TrouveTaBoite

## Prérequis

- Compte O2Switch avec accès cPanel
- Domaine `trouvetaboite.com` configuré
- Accès au Terminal dans cPanel

---

## 📦 Premier déploiement

### Étape 1 : Préparer les dossiers

Ouvrez le **Terminal** dans cPanel et exécutez :

```bash
# Créer les dossiers
mkdir -p ~/public_html/trouvetaboite.com
mkdir -p ~/nodejs/trouvetaboite-api

# Cloner le repo
cd ~
git clone https://github.com/WilliamPeynichou/FindYourCompany.git
```

### Étape 2 : Build et déployer le frontend

```bash
cd ~/FindYourCompany/client
npm install
npm run build

# Copier le build vers le dossier du domaine
cp -r dist/* ~/public_html/trouvetaboite.com/
cp public/.htaccess ~/public_html/trouvetaboite.com/
```

### Étape 3 : Déployer le backend

```bash
# Copier les fichiers du serveur
cp -r ~/FindYourCompany/server/* ~/nodejs/trouvetaboite-api/
```

### Étape 4 : Configurer Node.js dans cPanel

1. Allez dans **cPanel → Setup Node.js App**
2. Cliquez **Create Application**
3. Configurez :
   - **Node.js version** : `18.x` ou `20.x`
   - **Application mode** : `Production`
   - **Application root** : `/home/kifo1668/nodejs/trouvetaboite-api`
   - **Application startup file** : `index.js`
4. Cliquez **Create**

### Étape 5 : Variables d'environnement

Dans l'interface Node.js, ajoutez ces variables :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `ALLOWED_ORIGINS` | `https://trouvetaboite.com,https://www.trouvetaboite.com` |

### Étape 6 : Installer et démarrer

1. Cliquez **Run NPM Install**
2. Cliquez **Restart**

### Étape 7 : Activer SSL

1. **cPanel → SSL/TLS** ou **Let's Encrypt**
2. Activez le certificat pour `trouvetaboite.com`

---

## 🔄 Mise à jour du site

Pour mettre à jour après des modifications :

```bash
cd ~/FindYourCompany
git pull

# Rebuild frontend
cd client
npm run build
cp -r dist/* ~/public_html/trouvetaboite.com/

# Mettre à jour backend
cp -r ~/FindYourCompany/server/* ~/nodejs/trouvetaboite-api/
```

Puis dans cPanel → **Node.js App** → **Restart**

---

## ✅ Vérification

- **Frontend** : https://trouvetaboite.com
- **API** : https://trouvetaboite.com/api/health

---

## 🐛 Dépannage

### Page blanche
- Vérifiez que `.htaccess` est bien copié
- Vérifiez que `index.html` existe dans `/public_html/trouvetaboite.com/`

### API ne répond pas
- Vérifiez que l'app Node.js est **Running**
- Consultez les logs dans l'interface Node.js

### Erreur CORS
- Vérifiez la variable `ALLOWED_ORIGINS`
