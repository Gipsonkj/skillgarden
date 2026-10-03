#!/bin/bash
# Start Skill Garden when you log in to this Mac (a per-user LaunchAgent).
#   bash install-login-item.sh           install and start it now
#   bash install-login-item.sh --remove  stop it and remove it
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
LABEL="com.skillgarden.local"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
if [ "${1:-}" = "--remove" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$PLIST"
  echo "Removed. Skill Garden no longer starts at login."
  exit 0
fi
NODE="$(command -v node || true)"
[ -n "$NODE" ] || { echo "Skill Garden needs Node.js. Install it from https://nodejs.org first."; exit 1; }
mkdir -p "$HOME/Library/LaunchAgents" "$HERE/logs"
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>$NODE</string><string>$HERE/server.mjs</string></array>
  <key>WorkingDirectory</key><string>$HERE</string>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>$(dirname "$NODE"):$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string></dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$HERE/logs/server.log</string>
  <key>StandardErrorPath</key><string>$HERE/logs/server.log</string>
</dict></plist>
PL
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Skill Garden now starts at login: http://localhost:4747 (log: $HERE/logs/server.log)"
