#!/usr/bin/env bash
set -euo pipefail

# docker-redeploy.bash
# Usage: ./scripts/docker-redeploy.bash
#
# This script redeploys the application containers (eproc-app and socketio)
# with the latest code while preserving the MongoDB database.
#
# It will:
# 1. Stop only the application containers
# 2. Rebuild and restart them with latest code
# 3. Leave MongoDB container and volume untouched

OUT="./docker-compose.generated.yml"
user=$(whoami | tr '[:upper:]' '[:lower:]')

# load .env.local if var not already exported
if [ -z "${NEXT_PUBLIC_BASE_URL+x}" ] && [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1090
  . ./.env.local
  set +a
fi

# Check if the generated compose file exists
if [ ! -f "$OUT" ]; then
  echo "Error: $OUT not found. Run docker-up.bash first to generate the compose file."
  exit 1
fi

echo "Redeploying application with latest code (preserving database)..."
echo "This will rebuild and restart: eproc-app and socketio containers"
echo "MongoDB container and data volume will remain untouched"

# Stop only the application containers (not mongo)
echo "Stopping application containers..."
docker compose -f "$OUT" stop eproc-app socketio

# Remove the application containers (this will force rebuild)
echo "Removing application containers..."
docker compose -f "$OUT" rm -f eproc-app socketio

# Rebuild and start only the application containers
echo "Rebuilding and starting application containers..."
docker compose -f "$OUT" up -d --build eproc-app socketio

echo "✓ Application redeployed successfully!"
echo "✓ Database preserved in volume: mongo-eproc-${user}-data"
echo "App available at: ${NEXT_PUBLIC_BASE_URL:-http://localhost:5770}"
