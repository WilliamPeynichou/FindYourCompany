# 🚀 Déploiement O2Switch - trouvetaboite.com

## ✅ Préparation locale (DÉJÀ FAIT)

- ✅ Build du frontend avec `VITE_API_URL=https://trouvetaboite.com`
- ✅ Fichier `client/dist/` prêt à uploader
- ✅ Configuration `.htaccess` prête

---

## 📋 Checklist cPanel (À FAIRE)

### ÉTAPE 1 : Créer la base de données MySQL

1. **cPanel → MySQL® Databases**
2. Créer une nouvelle base :
   - Nom : `kifo1668_trouvetaboite`
3. Créer un utilisateur :
   - Nom : `kifo1668_user`
   - Mot de passe : **[CHOISIR UN MOT DE PASSE FORT]**
4. Ajouter l'utilisateur à la base (tous les privilèges)

📝 **Noter ces valeurs** :
- DB_NAME : `kifo1668_trouvetaboite`
- DB_USER : `kifo1668_user`
- DB_PASSWORD : `[votre_mot_de_passe]`

---

### ÉTAPE 2 : Uploader le frontend

1. **cPanel → Gestionnaire de fichiers**
2. Naviguez vers `/public_html/trouvetaboite.com/` (créer si nécessaire)
3. **Supprimez** tous les fichiers existants
4. **Uploadez** tout le contenu de `client/dist/` :
   - `index.html`
   - `assets/` (dossier complet)
   - Tous les autres fichiers
5. **Uploadez** le fichier `client/public/.htaccess` à la racine

✅ Vérifier : `https://trouvetaboite.com` devrait afficher le site

---

### ÉTAPE 3 : Configurer l'application Node.js

1. **cPanel → Setup Node.js App**
2. Cliquez **Create Application**
3. Configurez :
   - **Node.js version** : `18.x` ou `20.x`
   - **Application mode** : `Production`
   - **Application root** : `/home/kifo1668/nodejs/trouvetaboite-api`
   - **Application URL** : Laisser vide
   - **Application startup file** : `index.js`
4. Cliquez **Create**

---

### ÉTAPE 4 : Uploader le backend

1. **Gestionnaire de fichiers**
2. Créez le dossier `/home/kifo1668/nodejs/trouvetaboite-api/`
3. **Uploadez** tout le contenu de `server/` :
   - `index.js`
   - `package.json`
   - `config/`
   - `models/`
   - `routes/`
   - `services/`
   - `middleware/`
   - Tous les autres dossiers/fichiers

❌ **NE PAS UPLOADER** :
   - `node_modules/`
   - `.env` (on va le créer)

---

### ÉTAPE 5 : Configurer les variables d'environnement

Dans **Setup Node.js App → Environment Variables**, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DATABASE_URL` | `mysql://kifo1668_user:VOTRE_MOT_DE_PASSE@localhost:3306/kifo1668_trouvetaboite` |
| `ALLOWED_ORIGINS` | `https://trouvetaboite.com,https://www.trouvetaboite.com` |

**Optionnel** (si vous avez les clés) :
| Variable | Valeur |
|----------|--------|
| `INSEE_API_KEY` | Votre clé |
| `PAPPERS_API_TOKEN` | Votre token |

📝 **IMPORTANT** : Remplacez `VOTRE_MOT_DE_PASSE` par le vrai mot de passe MySQL de l'étape 1

---

### ÉTAPE 6 : Installer les dépendances

1. Dans **Setup Node.js App**, cliquez **Run NPM Install**
2. Attendez que l'installation soit terminée (peut prendre 2-3 minutes)

---

### ÉTAPE 7 : Démarrer l'application

1. Cliquez **Restart** dans l'interface Node.js
2. Vérifiez que le statut est **Running**

---

### ÉTAPE 8 : Activer SSL (HTTPS)

1. **cPanel → SSL/TLS Status** ou **Let's Encrypt SSL**
2. Sélectionnez `trouvetaboite.com`
3. Sélectionnez `www.trouvetaboite.com`
4. Cliquez **Issue** ou **Run AutoSSL**

---

## ✅ Tests de vérification

1. **Frontend** : `https://trouvetaboite.com` → Le site s'affiche ✅
2. **API Health** : `https://trouvetaboite.com/api/health` → JSON avec `"status": "OK"` ✅
3. **Recherche** : Essayer une recherche d'entreprises ✅

---

## 🐛 Dépannage

### Le site affiche une page blanche
- Vérifiez que `index.html` est bien à la racine de `/public_html/trouvetaboite.com/`
- Vérifiez le `.htaccess`

### Erreur 500
- Vérifiez les **Error Logs** dans cPanel
- Vérifiez que le `.htaccess` est correct

### L'API ne répond pas (`/api/health` ne marche pas)
- Vérifiez que l'app Node.js est **Running** dans cPanel
- Vérifiez les **logs Node.js** dans l'interface
- Vérifiez que `DATABASE_URL` est correct

### Erreur CORS
- Vérifiez `ALLOWED_ORIGINS` dans les variables d'environnement
- Assurez-vous d'utiliser `https://` (pas `http://`)

### Erreur de connexion à la base de données
- Vérifiez que la base MySQL existe
- Vérifiez que l'utilisateur a tous les privilèges
- Vérifiez que `DATABASE_URL` est correct (format exact)

---

## 🔄 Mises à jour futures

Pour mettre à jour le site après des modifications :

### Frontend
```powershell
cd client
$env:VITE_API_URL="https://trouvetaboite.com"
npm run build
# Puis re-uploader le contenu de dist/
```

### Backend
- Re-uploader les fichiers modifiés dans `/home/kifo1668/nodejs/trouvetaboite-api/`
- Cliquer **Restart** dans l'interface Node.js

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs d'erreur dans cPanel
2. Les logs Node.js dans l'interface
3. La console développeur du navigateur (F12)

---

**Version du guide** : 2025-01-22
**Domaine** : trouvetaboite.com
**Hébergeur** : O2Switch (kifo1668)
