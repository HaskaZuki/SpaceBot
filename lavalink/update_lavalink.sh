#!/bin/bash
cd "$(dirname "$0")"
echo "Downloading Lavalink v4.2.2..."
wget -O Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.2.2/Lavalink.jar
mkdir -p plugins
echo "Downloading LavaSrc v4.8.1..."
wget -O plugins/lavasrc-plugin-4.8.1.jar https://maven.lavalink.dev/releases/com/github/topi314/lavasrc/lavasrc-plugin/4.8.1/lavasrc-plugin-4.8.1.jar
echo "Downloading YouTube plugin v1.18.0..."
wget -O plugins/youtube-plugin-1.18.0.jar https://maven.lavalink.dev/releases/dev/lavalink/youtube/youtube-plugin/1.18.0/youtube-plugin-1.18.0.jar
echo "Done! You can now start Lavalink."
