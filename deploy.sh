#!/bin/bash
# Script de déploiement automatique pour trouvetaboite.com
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement sur trouvetaboite.com"
echo "======================================"
echo ""

# Configuration
SSH_USER="kifo1668"
read -p "Entrez l'adresse SSH du serveur (ex: ssh.o2switch.net): " SSH_HOST
DOMAIN_PATH="/home/kifo1668/public_html/trouvetaboite.com"
API_PATH="/home/kifo1668/nodejs/trouvetaboite-api"
REPO_URL="https://github.com/WilliamPeynichou/FindYourCompany.git"

echo ""
echo "📦 Étape 1/5 : Build du frontend..."
cd client
export VITE_API_URL="https://trouvetaboite.com"
npm run build
cd ..
echo "✅ Build terminé"
echo ""

echo "📡 Étape 2/5 : Connexion SSH et clonage du repo..."
ssh "${SSH_USER}@${SSH_HOST}" "cd ~; if [ ! -d 'FindYourCompany' ]; then git clone $REPO_URL; else cd FindYourCompany && git pull; fi"
echo "✅ Repo synchronisé"
echo ""

echo "📤 Étape 3/5 : Upload du frontend..."
# Créer une archive
cd client/dist
tar -czf ../../frontend.tar.gz .
cd ../..

# Upload via SCP
scp frontend.tar.gz "${SSH_USER}@${SSH_HOST}:~/"

# Décompresser sur le serveur
ssh "${SSH_USER}@${SSH_HOST}" << EOF
mkdir -p $DOMAIN_PATH
cd $DOMAIN_PATH
tar -xzf ~/frontend.tar.gz
rm ~/frontend.tar.gz
EOF

rm frontend.tar.gz
echo "✅ Frontend déployé"
echo ""

echo "📤 Étape 4/5 : Upload du backend..."
ssh "${SSH_USER}@${SSH_HOST}" << EOF
mkdir -p $API_PATH
cp -r ~/FindYourCompany/server/* $API_PATH/
EOF
echo "✅ Backend copié"
echo ""

echo "📋 Étape 5/5 : Instructions finales..."
cat << EOF

⚠️  ACTIONS MANUELLES REQUISES dans cPanel :

1. Créer la base MySQL (si pas déjà fait)
   - cPanel → MySQL Databases
   - Créer: kifo1668_trouvetaboite

2. Configurer l'app Node.js (si pas déjà fait)
   - cPanel → Setup Node.js App
   - Application root: $API_PATH
   - Startup file: index.js

3. Ajouter les variables d'environnement
   - NODE_ENV=production
   - PORT=5000
   - DATABASE_URL=mysql://USER:PASS@localhost:3306/kifo1668_trouvetaboite
   - ALLOWED_ORIGINS=https://trouvetaboite.com,https://www.trouvetaboite.com

4. Run NPM Install et Restart

5. Activer SSL (Let's Encrypt)

✅ Site: https://trouvetaboite.com
✅ API: https://trouvetaboite.com/api/health

EOF

echo "🎉 Déploiement terminé !"
