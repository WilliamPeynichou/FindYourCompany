# Script de déploiement automatique pour trouvetaboite.com
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Déploiement sur trouvetaboite.com" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Configuration
$SSH_USER = "kifo1668"
$SSH_HOST = Read-Host "Entrez l'adresse SSH du serveur (ex: ssh.o2switch.net)"
$DOMAIN_PATH = "/home/kifo1668/public_html/trouvetaboite.com"
$API_PATH = "/home/kifo1668/nodejs/trouvetaboite-api"
$REPO_URL = "https://github.com/WilliamPeynichou/FindYourCompany.git"

Write-Host "`n📦 Étape 1/5 : Build du frontend..." -ForegroundColor Yellow
Set-Location client
$env:VITE_API_URL = "https://trouvetaboite.com"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host "✅ Build terminé`n" -ForegroundColor Green

Write-Host "📡 Étape 2/5 : Connexion SSH et clonage du repo..." -ForegroundColor Yellow
ssh "${SSH_USER}@${SSH_HOST}" "cd ~; if [ ! -d 'FindYourCompany' ]; then git clone $REPO_URL; else cd FindYourCompany && git pull; fi"
Write-Host "✅ Repo synchronisé`n" -ForegroundColor Green

Write-Host "📤 Étape 3/5 : Upload du frontend..." -ForegroundColor Yellow
# Créer une archive zip du frontend
Compress-Archive -Path "client\dist\*" -DestinationPath "frontend.zip" -Force

# Upload via SCP
scp frontend.zip "${SSH_USER}@${SSH_HOST}:~/"

# Décompresser sur le serveur
ssh "${SSH_USER}@${SSH_HOST}" @"
mkdir -p $DOMAIN_PATH
cd $DOMAIN_PATH
unzip -o ~/frontend.zip
rm ~/frontend.zip
"@

Remove-Item "frontend.zip"
Write-Host "✅ Frontend déployé`n" -ForegroundColor Green

Write-Host "📤 Étape 4/5 : Upload du backend..." -ForegroundColor Yellow
ssh "${SSH_USER}@${SSH_HOST}" @"
mkdir -p $API_PATH
cp -r ~/FindYourCompany/server/* $API_PATH/
"@
Write-Host "✅ Backend copié`n" -ForegroundColor Green

Write-Host "📋 Étape 5/5 : Instructions finales..." -ForegroundColor Yellow
Write-Host @"

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

"@ -ForegroundColor Cyan

Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
