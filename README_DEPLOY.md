# 🚀 Guide de déploiement - trouvetaboite.com

## 🎯 Méthode recommandée : GitHub Actions (Automatique)

### Avantages
- ✅ **Automatique** : Déploie à chaque `git push`
- ✅ **Sécurisé** : Utilise les GitHub Secrets
- ✅ **Build automatique** : Le frontend est compilé automatiquement
- ✅ **Historique** : Tous les déploiements sont tracés dans Actions
- ✅ **Rollback facile** : Revenez à une version précédente facilement

### Configuration (une seule fois)

1. **Configurer les 3 secrets GitHub** (voir `GITHUB_SECRETS_SETUP.md`)
   - `SSH_HOST` : Adresse SSH du serveur
   - `SSH_USER` : `kifo1668`
   - `SSH_PRIVATE_KEY` : Votre clé SSH privée

2. **Première fois uniquement** : Configurer dans cPanel
   - Créer la base MySQL
   - Créer l'app Node.js
   - Ajouter les variables d'environnement
   - Activer SSL

   (Voir `DEPLOY_O2SWITCH.md` étapes 1, 3, 5, 8)

### Utilisation

**C'est tout !** 

```bash
git add .
git commit -m "Mes modifications"
git push
```

GitHub Actions déploie automatiquement ! Vous pouvez suivre le déploiement dans l'onglet **Actions** sur GitHub.

**Note** : Si vous modifiez le backend, redémarrez l'app Node.js dans cPanel après le déploiement.

---

## 🔧 Méthode alternative : Script manuel

Si vous préférez déployer manuellement :

### Windows
```powershell
.\deploy.ps1
```

### Linux/Mac/Git Bash
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📁 Structure du déploiement

```
Serveur O2Switch (kifo1668)
├── public_html/trouvetaboite.com/     ← Frontend (React)
│   ├── index.html
│   ├── .htaccess
│   └── assets/
│
└── nodejs/trouvetaboite-api/           ← Backend (Node.js)
    ├── index.js
    ├── package.json
    ├── config/
    ├── models/
    ├── routes/
    └── services/
```

---

## ✅ Vérifier le déploiement

1. **Frontend** : https://trouvetaboite.com
2. **API Health** : https://trouvetaboite.com/api/health
3. **Recherche** : Tester une recherche d'entreprises

---

## 🔄 Workflow de développement recommandé

1. Développer en local (`npm run dev`)
2. Tester localement
3. Commit & push sur GitHub
4. GitHub Actions déploie automatiquement
5. Vérifier sur https://trouvetaboite.com

---

## 📚 Documentation

- **`GITHUB_SECRETS_SETUP.md`** : Configuration des secrets GitHub (clés SSH)
- **`DEPLOY_O2SWITCH.md`** : Guide complet cPanel (première configuration)
- **`ENV_PRODUCTION_TEMPLATE.txt`** : Variables d'environnement
- **`.github/workflows/deploy.yml`** : Configuration du déploiement automatique

---

## 🐛 Problèmes courants

### Le déploiement GitHub Actions échoue
→ Vérifiez les logs dans l'onglet **Actions**
→ Vérifiez que les 3 secrets sont bien configurés

### Le site ne se met pas à jour
→ Videz le cache (Ctrl+F5)
→ Vérifiez que le workflow a réussi dans Actions

### L'API ne répond pas
→ Redémarrez l'app Node.js dans cPanel
→ Vérifiez les variables d'environnement

---

**Bon déploiement ! 🎉**
