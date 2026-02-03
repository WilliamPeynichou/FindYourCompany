#!/bin/bash
# ============================================
# Script de déploiement FindYourCompany sur o2switch
# ============================================
# Usage: ./deploy.sh [frontend|backend|all]
#
# Prérequis:
#   - SSH configuré vers o2switch
#   - Variables d'environnement configurées (voir .env.example)
#   - Node.js activé via cPanel sur o2switch

set -e

# --- CONFIGURATION À ADAPTER ---
O2SWITCH_USER="votre_user"
O2SWITCH_HOST="votre_user.o2switch.net"
O2SWITCH_SSH="${O2SWITCH_USER}@${O2SWITCH_HOST}"

# Chemins sur le serveur o2switch
REMOTE_FRONTEND="/home/${O2SWITCH_USER}/public_html"
REMOTE_BACKEND="/home/${O2SWITCH_USER}/findyourcompany-api"
REMOTE_TMP="/home/${O2SWITCH_USER}/tmp/restart.txt"

# Chemins locaux
LOCAL_ROOT="$(cd "$(dirname "$0")" && pwd)"
LOCAL_CLIENT="${LOCAL_ROOT}/client"
LOCAL_SERVER="${LOCAL_ROOT}/server"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERREUR]${NC} $1"; }

# --- FONCTIONS ---

deploy_frontend() {
  log_info "=== Déploiement du FRONTEND ==="

  # 1. Build du frontend
  log_info "Build du frontend..."
  cd "${LOCAL_CLIENT}"

  if [ -f ".env.production" ]; then
    log_info "Fichier .env.production trouvé"
  else
    log_warn "Pas de .env.production trouvé ! Créez-le à partir de .env.example"
    log_warn "Le build utilisera les valeurs par défaut"
  fi

  npm ci
  npm run build

  if [ ! -d "dist" ]; then
    log_error "Le dossier dist/ n'a pas été créé. Build échoué."
    exit 1
  fi

  log_info "Build terminé. Contenu de dist/:"
  ls -la dist/

  # 2. Upload vers o2switch
  log_info "Upload du frontend vers o2switch..."
  rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    "${LOCAL_CLIENT}/dist/" \
    "${O2SWITCH_SSH}:${REMOTE_FRONTEND}/"

  log_info "Frontend déployé avec succès !"
}

deploy_backend() {
  log_info "=== Déploiement du BACKEND ==="

  # 1. Créer le dossier distant si nécessaire
  log_info "Préparation du dossier backend sur o2switch..."
  ssh "${O2SWITCH_SSH}" "mkdir -p ${REMOTE_BACKEND}/tmp"

  # 2. Upload des fichiers backend
  log_info "Upload du backend vers o2switch..."
  rsync -avz --delete \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='.git' \
    --exclude='tmp' \
    "${LOCAL_SERVER}/" \
    "${O2SWITCH_SSH}:${REMOTE_BACKEND}/"

  # 3. Installer les dépendances sur le serveur
  log_info "Installation des dépendances sur o2switch..."
  ssh "${O2SWITCH_SSH}" "cd ${REMOTE_BACKEND} && source /home/${O2SWITCH_USER}/nodevenv/findyourcompany-api/18/bin/activate && npm ci --production"

  # 4. Exécuter les migrations
  log_info "Exécution des migrations..."
  ssh "${O2SWITCH_SSH}" "cd ${REMOTE_BACKEND} && source /home/${O2SWITCH_USER}/nodevenv/findyourcompany-api/18/bin/activate && npm run migrate" || log_warn "Migration échouée ou déjà appliquée"

  # 5. Redémarrer Passenger
  log_info "Redémarrage de Passenger..."
  ssh "${O2SWITCH_SSH}" "touch ${REMOTE_BACKEND}/tmp/restart.txt"

  log_info "Backend déployé avec succès !"
}

verify_deployment() {
  log_info "=== Vérification du déploiement ==="

  # Vérifier le health check de l'API
  API_URL=$(grep -E '^API_URL=' "${LOCAL_SERVER}/.env" 2>/dev/null | cut -d'=' -f2 || echo "")
  if [ -n "${API_URL}" ]; then
    log_info "Test du health check: ${API_URL}/api/health"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/health" 2>/dev/null || echo "000")
    if [ "${HTTP_CODE}" = "200" ]; then
      log_info "API OK (HTTP ${HTTP_CODE})"
    else
      log_warn "API retourne HTTP ${HTTP_CODE} - vérifiez les logs"
    fi
  else
    log_warn "API_URL non définie dans .env, impossible de vérifier"
  fi
}

# --- MAIN ---

case "${1:-all}" in
  frontend)
    deploy_frontend
    ;;
  backend)
    deploy_backend
    ;;
  all)
    deploy_backend
    deploy_frontend
    verify_deployment
    ;;
  *)
    echo "Usage: $0 [frontend|backend|all]"
    exit 1
    ;;
esac

log_info "=== Déploiement terminé ! ==="
