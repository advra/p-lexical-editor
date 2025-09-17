#!/usr/bin/env bash
# remove-mongo.sh
# Stops and removes the mongo container named "mongo-puck-<user>"
# (This removes the container and its data stored in the container layer.
#  If you used a host bind or named volume, you may need to remove that separately.)

set -euo pipefail

# Colors via tput (safer)
GREEN="$(tput setaf 2)"
YELLOW="$(tput setaf 3)"
RED="$(tput setaf 1)"
RESET="$(tput sgr0)"

# Ensure we always reset the terminal color on exit
trap 'printf "%b" "$RESET"' EXIT

# Helper functions
warn()  { printf "%b%s%b\n" "$YELLOW" "$1" "$RESET"; }
ok()    { printf "%b%s%b\n" "$GREEN" "$1" "$RESET"; }
err()   { printf "%b%s%b\n" "$RED" "$1" "$RESET" >&2; }

user=$(whoami | tr '[:upper:]' '[:lower:]')
name="mongo-puck-$user"

if ! docker ps -a --format '{{.Names}}' | grep -qx "$name"; then
  warn "No container named '$name' exists." 
  exit 0
fi

# Stop if running (ignore errors)
docker stop "$name" >/dev/null 2>&1 || true

if docker rm -f "$name" >/dev/null; then
  ok "Removed container:'$name'"

  # remove the volume 
  docker volume rm "$name-data" || true
  ok "volume removed successfully: '$name"
else
  err "Failed to remove container: '$name'" >&2
  exit 1
fi
