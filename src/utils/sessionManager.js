const MusicSession = require('../models/MusicSession');

/**
 * Save the current player state for a guild to MongoDB.
 * Called before shutdown or when finishing playback in 24/7 mode.
 */
async function saveSession(guildId, playerState) {
    if (!playerState) return;

    const { voiceChannelId, textChannelId, currentTrack, queue, loop, volume } = playerState;

    // Only persist sessions where the bot is actually in a voice channel
    if (!voiceChannelId) return;

    const queueToSave = [];
    if (currentTrack) queueToSave.push(currentTrack);
    queueToSave.push(...(queue || []));

    // Don't save empty sessions
    if (queueToSave.length === 0) {
        await clearSession(guildId);
        return;
    }

    try {
        await MusicSession.findOneAndUpdate(
            { guildId },
            {
                guildId,
                voiceChannelId,
                textChannelId: textChannelId || null,
                currentTrack: currentTrack || null,
                queue: queue || [],
                loop: loop || 'off',
                volume: volume || 100,
                savedAt: new Date(),
            },
            { upsert: true, new: true }
        );
        console.log(`[Session] Saved session for guild ${guildId} (${queueToSave.length} tracks)`);
    } catch (err) {
        console.error(`[Session] Failed to save session for ${guildId}:`, err.message);
    }
}

/**
 * Load a saved session for a guild.
 */
async function loadSession(guildId) {
    try {
        return await MusicSession.findOne({ guildId });
    } catch (err) {
        console.error(`[Session] Failed to load session for ${guildId}:`, err.message);
        return null;
    }
}

/**
 * Delete a saved session (after restoring or when bot leaves).
 */
async function clearSession(guildId) {
    try {
        await MusicSession.deleteOne({ guildId });
    } catch (err) {
        console.error(`[Session] Failed to clear session for ${guildId}:`, err.message);
    }
}

/**
 * Save ALL active sessions (call on process SIGINT/SIGTERM).
 */
async function saveAllSessions(players) {
    const saves = [];
    for (const [guildId, state] of players.entries()) {
        saves.push(saveSession(guildId, state));
    }
    await Promise.allSettled(saves);
    console.log(`[Session] Saved ${saves.length} active session(s) before shutdown`);
}

/**
 * Restore all saved sessions after bot is ready and Lavalink is connected.
 * Rejoins voice channels and requeues tracks.
 */
async function restoreAllSessions(client) {
    const emoji = require('./emojiConfig');
    const musicPlayer = require('./musicPlayer');

    let sessions;
    try {
        sessions = await MusicSession.find({});
    } catch (err) {
        console.error('[Session] Failed to fetch sessions:', err.message);
        return;
    }

    if (!sessions || sessions.length === 0) {
        console.log('[Session] No sessions to restore');
        return;
    }

    console.log(`[Session] Restoring ${sessions.length} session(s)...`);

    for (const session of sessions) {
        const { guildId, voiceChannelId, textChannelId, currentTrack, queue, loop } = session;

        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.log(`[Session] Guild ${guildId} not found, skipping`);
                await clearSession(guildId);
                continue;
            }

            const voiceChannel = guild.channels.cache.get(voiceChannelId);
            if (!voiceChannel) {
                console.log(`[Session] Voice channel ${voiceChannelId} not found in ${guild.name}, skipping`);
                await clearSession(guildId);
                continue;
            }

            // Check Lavalink node is ready
            const nodes = [...client.shoukaku.nodes.values()];
            const node = nodes.find(n => n.state === 2); // State 2 = READY in Shoukaku
            if (!node) {
                console.log('[Session] No Lavalink node ready, skipping restore');
                break;
            }

            // Rejoin voice channel
            let player;
            try {
                player = await client.shoukaku.joinVoiceChannel({
                    guildId,
                    channelId: voiceChannelId,
                    shardId: 0,
                    deaf: true,
                });
            } catch (err) {
                console.error(`[Session] Failed to join VC for ${guild.name}:`, err.message);
                await clearSession(guildId);
                continue;
            }

            // Rebuild player state in memory
            const playerState = musicPlayer.getQueue(guildId);
            playerState.player = player;
            playerState.voiceChannelId = voiceChannelId;
            playerState.textChannelId = textChannelId;
            playerState.loop = loop || 'off';
            playerState.queue = queue || [];

            // Re-attach Lavalink event listeners
            player.removeAllListeners('end');
            player.removeAllListeners('exception');
            player.removeAllListeners('stuck');

            player.on('end', async (data) => {
                if (data?.reason === 'replaced') return;
                if (playerState.loop === 'track' && playerState.currentTrack) {
                    const t = playerState.currentTrack;
                    player.playTrack({ track: { encoded: t.encoded || t.track } });
                } else if (playerState.loop === 'queue') {
                    playerState.queue.push(playerState.currentTrack);
                    await musicPlayer.playNext(client, guildId);
                } else {
                    await musicPlayer.playNext(client, guildId);
                }
            });

            player.on('exception', async () => {
                await musicPlayer.playNext(client, guildId);
            });

            player.on('stuck', () => {
                musicPlayer.playNext(client, guildId);
            });

            // Start playback from current track
            if (currentTrack) {
                try {
                    await player.playTrack({ track: { encoded: currentTrack.encoded || currentTrack.track } });
                    playerState.currentTrack = currentTrack;
                    musicPlayer.updateDashboard(client, guildId);
                } catch (err) {
                    console.error(`[Session] Failed to start playback for ${guild.name}:`, err.message);
                    // Try the next in queue if current fails
                    musicPlayer.playNext(client, guildId);
                }
            } else if (playerState.queue.length > 0) {
                musicPlayer.playNext(client, guildId);
            }

            // Notify the text channel
            if (textChannelId) {
                const textChannel = client.channels.cache.get(textChannelId);
                if (textChannel) {
                    try {
                        const { EmbedBuilder } = require('discord.js');
                        const embed = new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setDescription(
                                `${emoji.animated.notes} Bot restarted — resuming your session in <#${voiceChannelId}>.\n` +
                                `${emoji.controls.play} **${currentTrack ? currentTrack.info?.title || 'Unknown Track' : 'Next in queue'}**`
                            );
                        await textChannel.send({ embeds: [embed] });
                    } catch (_) { /* channel may be inaccessible */ }
                }
            }

            await clearSession(guildId);
            console.log(`[Session] ✅ Restored session for ${guild.name}`);

        } catch (err) {
            console.error(`[Session] Error restoring session for guild ${guildId}:`, err.message);
            await clearSession(guildId);
        }
    }
}

module.exports = { saveSession, loadSession, clearSession, saveAllSessions, restoreAllSessions };
