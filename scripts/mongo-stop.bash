#!/usr/bin/env bash
# stop-mongo.sh
# Stops (but does not remove) the mongo container named "mongo-puck-<user>"

set -euo pipefail

# Colors via tput with fallbacks (safer in minimal/non-interactive environments)
GREEN="$(tput setaf 2 2>/dev/null || printf '\033[0;32m')"
YELLOW="$(tput setaf 3 2>/dev/null || printf '\033[0;33m')"
RED="$(tput setaf 1 2>/dev/null || printf '\033[0;31m')"
LIGHTGRAY="$(printf '\033[38;5;246m')"
RESET="$(tput sgr0 2>/dev/null || printf '\033[0m')"

# Ensure we always reset the terminal color on exit
trap 'printf "%b" "$RESET"' EXIT

# Helper printing functions (use %b to allow tput sequences)
light() { printf "%b%s%b\n" "$LIGHTGRAY" "$1" "$RESET"; }
info()  { printf "%b%s%b\n" "$YELLOW"    "$1" "$RESET"; }
ok()    { printf "%b%s%b\n" "$GREEN"     "$1" "$RESET"; }
err()   { printf "%b%s%b\n" "$RED"       "$1" "$RESET" >&2; }

user=$(whoami | tr '[:upper:]' '[:lower:]')
name="mongo-puck-$user"

if ! docker ps --filter "name=^${name}$" --filter "status=running" -q; then
  warn "Container '$name' is not running."
  exit 0
fi

if docker stop "$name" >/dev/null; then
  ok "Stopped container: '$name'"  
  printf "\n"
  printf "Note: If you are entirely done with the container be sure to permanently remove the docker container. This will help preserve limited resources. To delete permanently run the following:"
  printf "\n"
  light "./scripts/mongo-remove.bash"
else
  err "Failed to stop container: '$name'" 
  exit 1
fi
