#!/bin/bash
# Wait for Lavalink to be ready before starting the shard bot
# Usage: bash wait-for-lavalink.sh

HOST="${LAVALINK_HOST:-localhost}"
PORT="${LAVALINK_PORT:-2333}"
MAX_WAIT=60
INTERVAL=3

echo "[Startup] Waiting for Lavalink at $HOST:$PORT..."

elapsed=0
while ! nc -z "$HOST" "$PORT" 2>/dev/null; do
    if [ "$elapsed" -ge "$MAX_WAIT" ]; then
        echo "[Startup] WARNING: Lavalink not ready after ${MAX_WAIT}s. Starting bot anyway..."
        break
    fi
    echo "[Startup] Lavalink not ready yet... (${elapsed}s elapsed)"
    sleep "$INTERVAL"
    elapsed=$((elapsed + INTERVAL))
done

echo "[Startup] Lavalink is up! Starting SpaceBot shard..."
node shard.js
