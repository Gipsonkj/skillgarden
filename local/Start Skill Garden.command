#!/bin/bash
# Double-click to start Skill Garden, then keep this window open.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Skill Garden needs Node.js. Install the LTS version from https://nodejs.org, then double-click this file again."
  read -n 1 -s -r -p "Press any key to close."
  exit 1
fi
(sleep 1.5; open "http://localhost:${PORT:-4747}") &
exec node server.mjs
