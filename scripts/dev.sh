#!/usr/bin/env bash
set -euo pipefail

NODE20_BIN="/home/linuxbrew/.linuxbrew/opt/node@20/bin"

if [[ ! -x "$NODE20_BIN/node" ]]; then
  echo "Node 20 not found. Install with: brew install node@20"
  exit 1
fi

export PATH="$NODE20_BIN:$PATH"
cd "$(dirname "$0")/.."

echo "Using $(node -v)"
exec npm run dev-server
