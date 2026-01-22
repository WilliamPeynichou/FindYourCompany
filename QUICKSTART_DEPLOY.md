# ⚡ Quick Start - Déploiement automatique

## 🎯 En 3 étapes simples

### 1️⃣ Générer une clé SSH (une fois)

**Windows PowerShell :**
```powershell
ssh-keygen -t rsa -b 4096 -C "deploy@github"
# Appuyez 3 fois sur Entrée
```

### 2️⃣ Ajouter la clé publique sur O2Switch

```powershell
# Afficher la clé publique
Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
```

Puis dans **cPanel → SSH Access → Manage SSH Keys** :
- Import Key
- Coller la clé publique
- Authorize

### 3️⃣ Configurer les 3 secrets GitHub

Sur GitHub : **Settings → Secrets → Actions → New secret**

| Nom | Valeur |
|-----|--------|
| `SSH_HOST` | Adresse SSH (ex: `ssh.o2switch.net`) |
| `SSH_USER` | `kifo1668` |
| `SSH_PRIVATE_KEY` | Contenu de `~/.ssh/id_rsa` (toute la clé) |

Pour copier la clé privée :
```powershell
Get-Content $env:USERPROFILE\.ssh\id_rsa | clip
```

---

## 🚀 C'est fini !

Maintenant, à chaque `git push` :

```bash
git add .
git commit -m "Mon changement"
git push
```

→ Le site se déploie **automatiquement** sur https://trouvetaboite.com ! 🎉

Suivez le déploiement dans l'onglet **Actions** sur GitHub.

---

## ⚙️ Configuration cPanel (première fois uniquement)

Après le premier déploiement, configurez dans cPanel :

1. **MySQL** : Créer la base `kifo1668_trouvetaboite`
2. **Node.js App** : 
   - Application root: `/home/kifo1668/nodejs/trouvetaboite-api`
   - Startup file: `index.js`
3. **Variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=mysql://USER:PASS@localhost:3306/kifo1668_trouvetaboite
   ALLOWED_ORIGINS=https://trouvetaboite.com,https://www.trouvetaboite.com
   ```
4. **Run NPM Install** et **Restart**
5. **SSL** : Activer Let's Encrypt

(Détails complets dans `DEPLOY_O2SWITCH.md`)

---

## 📝 Besoin d'aide ?

- **Configuration secrets** : `GITHUB_SECRETS_SETUP.md`
- **Guide complet** : `README_DEPLOY.md`
- **Config cPanel** : `DEPLOY_O2SWITCH.md`

**Bon déploiement ! 🚀**
