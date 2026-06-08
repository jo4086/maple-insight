#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

FRONTEND_DIST_DIR="${ROOT_DIR}/apps/frontend/dist"
FRONTEND_DEPLOY_DIR="${FRONTEND_DEPLOY_DIR:-/var/www/frontend}"
FRONTEND_DEPLOY_DIST_DIR="${FRONTEND_DEPLOY_DIR}/dist"
PM2_APP_NAME="${PM2_APP_NAME:-maple-back}"

log() {
  printf "\n[deploy] %s\n" "$1"
}

ensure_safe_frontend_path() {
  if [[ "${FRONTEND_DEPLOY_DIST_DIR}" != "/var/www/frontend/dist" && "${ALLOW_CUSTOM_DEPLOY_DIR:-}" != "true" ]]; then
    echo "Refusing to remove unexpected deploy path: ${FRONTEND_DEPLOY_DIST_DIR}" >&2
    echo "Set ALLOW_CUSTOM_DEPLOY_DIR=true only if this path is intentional." >&2
    exit 1
  fi
}

deploy_frontend() {
  log "Building frontend"
  pnpm --dir "${ROOT_DIR}" --filter maple-insight-frontend build

  log "Replacing frontend dist at ${FRONTEND_DEPLOY_DIST_DIR}"
  ensure_safe_frontend_path
  sudo rm -rf "${FRONTEND_DEPLOY_DIST_DIR}"
  sudo mkdir -p "${FRONTEND_DEPLOY_DIR}"
  sudo cp -r "${FRONTEND_DIST_DIR}" "${FRONTEND_DEPLOY_DIR}/"
}

deploy_backend() {
  log "Building backend"
  pnpm --dir "${ROOT_DIR}" --filter maple-insight-back build

  log "Restarting backend with PM2: ${PM2_APP_NAME}"
  if pm2 describe "${PM2_APP_NAME}" > /dev/null 2>&1; then
    pm2 restart "${PM2_APP_NAME}"
  else
    pm2 start "pnpm start" --name "${PM2_APP_NAME}" --cwd "${ROOT_DIR}/apps/back"
  fi
}

case "${TARGET}" in
  frontend)
    deploy_frontend
    ;;
  backend)
    deploy_backend
    ;;
  all)
    deploy_frontend
    deploy_backend
    ;;
  *)
    echo "Usage: scripts/deploy.sh [frontend|backend|all]" >&2
    exit 1
    ;;
esac

log "Done"
