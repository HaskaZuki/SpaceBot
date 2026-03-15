#!/bin/bash
cd "$(dirname "$0")"
echo "Downloading Lavalink v4.0.8..."
wget -O Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
mkdir -p plugins
echo "Downloading LavaSrc v4.3.0..."
wget -O plugins/lavasrc-plugin-4.3.0.jar https://github.com/topi314/LavaSrc/releases/download/4.3.0/lavasrc-plugin-4.3.0.jar
echo "Done! You can now start Lavalink."
