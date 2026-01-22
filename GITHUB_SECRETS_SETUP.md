# 🔐 Configuration des GitHub Secrets pour le déploiement automatique

## 📋 Secrets à configurer

Allez sur GitHub : **Settings → Secrets and variables → Actions → New repository secret**

Ajoutez ces 3 secrets :

### 1. `SSH_HOST`
**Valeur** : L'adresse SSH de votre serveur O2Switch

Exemple : `ssh.o2switch.net` ou `ssh123.o2switch.net`

Pour trouver cette valeur :
- Connectez-vous à cPanel
- Cherchez "SSH Access" ou "Terminal"
- L'adresse SSH est généralement affichée

---

### 2. `SSH_USER`
**Valeur** : `kifo1668`

Votre nom d'utilisateur cPanel.

---

### 3. `SSH_PRIVATE_KEY`
**Valeur** : Votre clé SSH privée

#### Comment générer la clé SSH :

**Sur Windows (PowerShell) :**
```powershell
ssh-keygen -t rsa -b 4096 -C "deploy@github-actions"
# Appuyez sur Entrée 3 fois (pas de passphrase)
# La clé est dans : C:\Users\VOTRE_USER\.ssh\id_rsa
```

**Sur Linux/Mac :**
```bash
ssh-keygen -t rsa -b 4096 -C "deploy@github-actions"
# Appuyez sur Entrée 3 fois (pas de passphrase)
# La clé est dans : ~/.ssh/id_rsa
```

#### Récupérer la clé privée :

**Windows :**
```powershell
Get-Content $env:USERPROFILE\.ssh\id_rsa | clip
# La clé est copiée dans le presse-papier
```

**Linux/Mac :**
```bash
cat ~/.ssh/id_rsa
# Copiez tout le contenu (de -----BEGIN à -----END-----)
```

#### Ajouter la clé publique sur O2Switch :

1. Récupérez la clé **publique** :
   ```powershell
   # Windows
   Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
   
   # Linux/Mac
   cat ~/.ssh/id_rsa.pub
   ```

2. Dans **cPanel → SSH Access → Manage SSH Keys**
3. Cliquez **Import Key**
4. Collez la clé **publique** (le fichier `.pub`)
5. Cliquez **Authorize** pour l'activer

---

## ✅ Vérification

Une fois les 3 secrets configurés :

1. Allez dans **Actions** sur GitHub
2. Vous devriez voir le workflow "Deploy to O2Switch"
3. Cliquez **Run workflow** pour tester manuellement

Ou simplement faites un `git push` et le déploiement se fera automatiquement !

---

## 🚀 Fonctionnement

À chaque `git push` sur la branche `main` :

1. ✅ GitHub Actions récupère le code
2. ✅ Build du frontend avec `VITE_API_URL=https://trouvetaboite.com`
3. ✅ Upload du frontend dans `/public_html/trouvetaboite.com/`
4. ✅ Upload du backend dans `/nodejs/trouvetaboite-api/`

**Note** : Vous devrez redémarrer manuellement l'app Node.js dans cPanel après chaque déploiement du backend.

---

## 🔒 Sécurité

- ✅ Les secrets ne sont **jamais** visibles dans les logs
- ✅ La clé SSH est **privée** et sécurisée par GitHub
- ✅ Seuls les collaborateurs du repo peuvent déclencher le déploiement

---

## 🐛 Dépannage

### Erreur "Permission denied (publickey)"
- Vérifiez que la clé publique est bien **autorisée** dans cPanel
- Vérifiez que `SSH_PRIVATE_KEY` contient **toute** la clé (BEGIN → END)

### Le workflow échoue
- Vérifiez les logs dans l'onglet **Actions** sur GitHub
- Vérifiez que les 3 secrets sont bien configurés

### Le site ne se met pas à jour
- Vérifiez que le fichier `.htaccess` est bien présent
- Videz le cache du navigateur (Ctrl+F5)

---

**Prêt à déployer automatiquement ! 🚀**
