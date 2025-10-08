#!/usr/bin/env bash
set -euo pipefail

# generate-compose.sh
# Usage:
#   ./generate-compose.sh           # run with docker compose (local)
#   ./generate-compose.sh stack     # deploy to swarm with docker stack deploy
#
# This script expands ${user} (and other env vars) into a generated compose file
# so top-level volume keys are literal (works for docker stack deploy too).
#
# Note to log a service like seeder run the following:
#   docker compose -f docker-compose.generated.yml logs -f seeder

OUT="./docker-compose.generated.yml"
MODE="${1:-compose}"   # "compose" or "stack"
STACK_NAME="${STACK_NAME:-my_stack}"   # used only for stack deploy
user=$(whoami | tr '[:upper:]' '[:lower:]')
VOLUME_NAME="mongo-eproc-${user}-data"


PROJECT_ROOT="$(pwd)"
SOCKET_DIR="${PROJECT_ROOT}/src/server/socketio"

cat > "$OUT" <<EOF
services:
  mongo:
    image: mongo:7
    container_name: ${MONGO_EPROC_NAME:-mongo-eproc-${user}}
    restart: unless-stopped
    ports:
      - "5771:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME:-r00t}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD:-r00t}
    volumes:
      - ./docker:/docker-entrypoint-initdb.d:ro
      - ${VOLUME_NAME}:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "mongodb://r00t:r00t@localhost:27017/admin?authSource=admin", "--eval", "db.adminCommand({ ping: 1 })"]
      interval: 4s
      timeout: 3s
      retries: 30

  seeder:
    image: node:20-alpine
    working_dir: /app
    depends_on:
      mongo:
        condition: service_healthy
    volumes:
      - ./seeder:/app:ro
    environment:
      DATABASE_URL: mongodb://r00t:r00t@mongo:27017/eproc?authSource=admin
    command: sh -lc "if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm run seed"
    restart: "no"

  socketio:
    container_name: ${SOCKET_EPROC_NAME:-socket-eproc-${user}}
    build: ./src/server/socketio
    ports:
      - "5772:5772"

volumes:
  ${VOLUME_NAME}: {}
EOF

echo "Generated $OUT (volume: ${VOLUME_NAME})"

if [ "$MODE" = "stack" ]; then
  # ensure the volume exists (optional but explicit)
  if ! docker volume inspect "$VOLUME_NAME" >/dev/null 2>&1; then
    echo "Creating docker volume ${VOLUME_NAME}..."
    docker volume create "$VOLUME_NAME"
  fi

  echo "Deploying stack ${STACK_NAME} using $OUT..."
  docker stack deploy -c "$OUT" "$STACK_NAME"
  echo "Stack deployed."
else
  echo "Bringing up services with docker compose using $OUT..."
  docker compose -f "$OUT" up -d
  echo "Services started."
fi
