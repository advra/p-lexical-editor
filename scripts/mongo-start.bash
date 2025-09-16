#!/usr/bin/env bash
# create-or-start-mongo.sh
# Start existing "mongo-puck-<user>" container if stopped, or create it if missing.
#
# - Uses tput with fallbacks for colors.
# - Uses docker ps filters that return IDs (safer than parsing Status).
# - Ensures terminal colors are reset on exit (trap).
# - Prints a neat Host/Port/Container port table both when already running and after starting.

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

# Print a table of published ports for a container (uses docker port)
print_ports_table() {
  local cname="$1"
  local port_lines
  port_lines=$(docker port "$cname" 2>/dev/null || true)

  if [[ -z "$port_lines" ]]; then
    info "No published ports for container '$cname'."
    return
  fi

  # Header
  printf "\n"
  printf "%b%-20s %-8s %-15s%b\n" "$LIGHTGRAY" "Host" "Port" "Container port" "$RESET"
  printf "%b%-20s %-8s %-15s%b\n" "$LIGHTGRAY" "--------------------" "--------" "---------------" "$RESET"

  # Each line looks like: "27017/tcp -> 0.0.0.0:27017"
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    container_port="${line%%/*}"                # "27017"
    after_arrow="${line#*-> }"                  # "0.0.0.0:27017"
    host_ip="${after_arrow%%:*}"                # "0.0.0.0"
    host_port="${after_arrow##*:}"              # "27017"

    display_host="$host_ip"
    if [[ "$host_ip" == "0.0.0.0" ]]; then
      display_host="127.0.0.1"
    fi

    printf "%b%-20s %-8s %-15s%b\n" \
      "$LIGHTGRAY" "$display_host" "$host_port" "$container_port" "$RESET"
  done <<< "$port_lines"
}

# Check whether a container with the exact name exists / is running
exists_id=$(docker ps -a --filter "name=^${name}$" -q 2>/dev/null || true)
running_id=$(docker ps --filter "name=^${name}$" --filter "status=running" -q 2>/dev/null || true)

if [[ -n "$running_id" ]]; then
  ok "Container '$name' is already running."
  print_ports_table "$name"
  exit 0
fi

if [[ -n "$exists_id" ]]; then
  info "Container '$name' exists but is not running. Attempting to start..."
  if docker start "$name" >/dev/null; then
    ok "Started container: $name"
    print_ports_table "$name"
    exit 0
  else
    err "Failed to start container: $name"
    exit 1
  fi
fi

# Container not found -> create it
info "Creating container '$name'..."
container_id=$(docker run -d \
  --name "$name" \
  --restart unless-stopped \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=r00t \
  -e MONGO_INITDB_ROOT_PASSWORD=r00t \
  mongo:7 2>/dev/null || true)

if [[ -n "${container_id:-}" ]]; then
  ok "Docker instance created named: $name"
  # Give docker a second to register published ports (optional)
  sleep 0.5
  print_ports_table "$name"
  exit 0
else
  err "Failed to create Docker instance named: $name"
  exit 1
fi
