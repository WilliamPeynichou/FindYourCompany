# 🚀 Guide de Déploiement - TrouveTaBoite

## Prérequis

- Compte O2Switch avec accès cPanel
- Domaine `trouvetaboite.com` configuré
- Node.js disponible sur le serveur

---

## 📦 Étape 1 : Build du Frontend

```bash
cd client
npm install
npm run build
```

Le dossier `dist/` est créé avec les fichiers à uploader.

---

## 📤 Étape 2 : Upload sur O2Switch

### Frontend (fichiers statiques)

1. Connectez-vous à **cPanel**
2. Ouvrez le **Gestionnaire de fichiers**
3. Naviguez vers `/public_html/` (ou le dossier de votre domaine)
4. **Supprimez** les fichiers existants (sauf .htaccess si déjà configuré)
5. **Uploadez** tout le contenu du dossier `client/dist/`
6. **Uploadez** le fichier `client/public/.htaccess` à la racine

### Backend (Node.js)

1. Dans cPanel, cherchez **"Setup Node.js App"**
2. Cliquez sur **"Create Application"**
3. Configurez :
   - **Node.js version** : 18.x ou 20.x
   - **Application mode** : Production
   - **Application root** : `/home/VOTRE_USER/nodejs/trouvetaboite-api`
   - **Application URL** : Laissez vide ou configurez un sous-domaine
   - **Startup file** : `index.js`
4. Cliquez sur **"Create"**
5. Uploadez les fichiers du dossier `server/` (sauf `node_modules/`)
6. Créez le fichier `.env` avec vos vraies valeurs (voir `env.example`)
7. Dans le panneau Node.js, cliquez sur **"Run NPM Install"**
8. Cliquez sur **"Restart"**

---

## 🔒 Étape 3 : SSL/HTTPS

1. Dans cPanel → **SSL/TLS** ou **Let's Encrypt SSL**
2. Sélectionnez votre domaine `trouvetaboite.com`
3. Cliquez sur **"Issue"** ou **"Generate"**
4. Ajoutez aussi `www.trouvetaboite.com`

---

## ⚙️ Étape 4 : Configuration .env

### Sur le serveur, créez `/home/USER/nodejs/trouvetaboite-api/.env` :

```env
NODE_ENV=production
PORT=5000

# APIs (si utilisées)
PAPPERS_API_TOKEN=votre_vrai_token
INSEE_API_KEY=votre_vraie_cle

# CORS - Important !
ALLOWED_ORIGINS=https://trouvetaboite.com,https://www.trouvetaboite.com
```

---

## 🔄 Étape 5 : Configuration du Proxy

Si le backend est sur un port différent, le `.htaccess` redirige `/api/*` vers le backend Node.js.

**Alternative** : Créer un sous-domaine `api.trouvetaboite.com` pointant vers l'app Node.js.

---

## ✅ Checklist finale

- [ ] Frontend uploadé dans `/public_html/`
- [ ] `.htaccess` en place
- [ ] Backend Node.js configuré et démarré
- [ ] Fichier `.env` créé avec les vraies valeurs
- [ ] SSL activé pour le domaine
- [ ] Test : `https://trouvetaboite.com` fonctionne
- [ ] Test : `https://trouvetaboite.com/api/health` répond

---

## 🐛 Dépannage

### Le site affiche une page blanche
- Vérifiez que `index.html` est bien à la racine
- Vérifiez le `.htaccess`

### Erreur 500
- Vérifiez les logs dans cPanel → Error Logs
- Vérifiez que le `.htaccess` est correct

### L'API ne répond pas
- Vérifiez que l'app Node.js est démarrée
- Vérifiez les logs Node.js dans cPanel
- Vérifiez le fichier `.env`

### Erreur CORS
- Vérifiez `ALLOWED_ORIGINS` dans le `.env` du backend
- Assurez-vous d'utiliser `https://` et pas `http://`

---

## 🔄 Mise à jour

Pour mettre à jour le site :

1. `git pull` sur votre machine locale
2. `npm run build` dans le dossier client
3. Re-uploadez le contenu de `dist/`
4. Si le backend a changé, re-uploadez et redémarrez l'app Node.js
