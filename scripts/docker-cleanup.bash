#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="./docker-compose.generated.yml"

run_step() {
  local msg="$1"; shift
  # print bullet line
  printf "• %s...\n" "$msg"

  # Run the command and capture all output for error reporting
  local out
  if out=$("$@" 2>&1); then
    echo "✓ DONE"
  else
    echo "✗ FAILED : $out"
    return 1
  fi
}

# 1) Stop/remove containers & volumes from the generated file
if [[ -f "$COMPOSE_FILE" ]]; then
  run_step "Stopping/removing containers & volumes from $COMPOSE_FILE" \
    docker compose -f "$COMPOSE_FILE" down -v
else
  printf "• %s...\n" "Stopping/removing containers & volumes from $COMPOSE_FILE"
  echo "✗ FAILED : compose file not found"
fi
# 2) Remove temp generated dockerfile
if [[ -f "$COMPOSE_FILE" ]]; then
  run_step "Removing $COMPOSE_FILE" rm -f "$COMPOSE_FILE"
else
  printf "• %s...\n" "Removing $COMPOSE_FILE"
  echo "✓ DONE"
fi
