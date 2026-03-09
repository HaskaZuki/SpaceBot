const { createMusicEmbed } = require('./embedBuilder');
const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');
const PlayHistory = require('../models/PlayHistory');
const emoji = require('./emojiConfig');
const players = new Map();
const isNodeReady = (node) => {
    return node && node.state === 1;
};
const extractTracks = (result) => {
    if (!result) return [];
    if (result.loadType === 'track' && result.data) {
        return [result.data];
    }
    if (result.loadType === 'search' && result.data && Array.isArray(result.data)) {
        return result.data;
    }
    if (result.loadType === 'playlist' && result.data?.tracks) {
        return result.data.tracks;
    }
    if (result.tracks && Array.isArray(result.tracks)) {
        return result.tracks;
    }
    if (result.data && Array.isArray(result.data)) {
        return result.data;
    }
    return [];
};

const isBotAloneInVC = async (client, guildId, voiceChannelId) => {
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return true;
        const channel = guild.channels.cache.get(voiceChannelId);
        if (!channel) return true;

        const members = channel.members.filter(m => !m.user.bot);
        return members.size === 0;
    } catch (error) {
        console.error('Error checking if bot is alone:', error);
        return false;
    }
};

const sendToTextChannel = async (client, guildId, textChannelId, message) => {
    try {
        if (!textChannelId) return;
        const channel = client.channels.cache.get(textChannelId);
        if (channel) {
            await channel.send(message);
        }
    } catch (error) {
        console.error('Error sending message to text channel:', error);
    }
};
module.exports = {
    players,
    getQueue: (guildId) => {
        if (!players.has(guildId)) {
            players.set(guildId, { queue: [], loop: 'off', textChannelId: null, voiceChannelId: null, currentTrack: null });
        }
        return players.get(guildId);
    },
    playTrack: async (client, guildId, voiceChannelId, query, textChannel, requestedBy = null) => {
        const nodes = [...client.shoukaku.nodes.values()];
        console.log(`[DEBUG] Found ${nodes.length} Lavalink nodes`);
        nodes.forEach(n => console.log(`[DEBUG] Node: ${n.name}, State: ${n.state}`));
        const node = nodes.find(n => isNodeReady(n));
        if (!node || nodes.length === 0) {
            console.error('[ERROR] No Lavalink node available');
            return { error: 'No Lavalink node available' };
        }
        console.log(`[DEBUG] Using node: ${node.name}, State: ${node.state}`);
        const playerState = module.exports.getQueue(guildId);
        if (textChannel) {
            playerState.textChannelId = textChannel.id;
        }

        playerState.voiceChannelId = voiceChannelId;
        let result;
        if (query.startsWith('http')) {
            console.log(`[DEBUG] Direct URL: ${query}`);
            try {
                result = await node.rest.resolve(query);
            } catch (e) {
                console.error('Lavalink URL resolve error:', e.message);
                return { error: 'Failed to load URL' };
            }
        } else {
            const searchSources = [
                { name: 'SoundCloud', prefix: 'scsearch' },
                { name: 'YouTube Music', prefix: 'ytmsearch' },
                { name: 'YouTube', prefix: 'ytsearch' },
                { name: 'Spotify', prefix: 'spsearch' }
            ];
            for (const source of searchSources) {
                try {
                    const searchQuery = `${source.prefix}:${query}`;
                    console.log(`[DEBUG] Trying ${source.name}: ${searchQuery}`);
                    result = await node.rest.resolve(searchQuery);
                    if (result && result.loadType !== 'empty' && result.loadType !== 'NO_MATCHES' && result.loadType !== 'error') {
                        if ((result.loadType === 'track' && result.data) || 
                            (result.loadType === 'search' && result.data && result.data.length > 0) ||
                            (result.loadType === 'playlist' && result.data && result.data.tracks && result.data.tracks.length > 0)) {
                            console.log(`✅ Found results using ${source.name}`);
                            break;
                        }
                    }
                    console.log(`⚠️ No results from ${source.name}, trying next...`);
                } catch (e) {
                    console.log(`❌ ${source.name} error: ${e.message || e.error || e.toString()}, trying next...`);
                    continue;
                }
            }
        }
        if (!result || result.loadType === 'empty' || result.loadType === 'NO_MATCHES' || result.loadType === 'error') {
            console.log('[DEBUG] Final result: no tracks found after trying all sources');
            console.log('[DEBUG] Result:', JSON.stringify(result?.loadType));
            return { error: 'No results found. Try a different search term or direct URL.' };
        }
        const tracks = extractTracks(result);
        const track = tracks[0];
        if (!track) {
            console.log('[DEBUG] Result loaded but no track could be extracted');
            console.log('[DEBUG] loadType:', result.loadType, 'data:', typeof result.data);
            return { error: 'No track found' };
        }
        let player = client.shoukaku.players.get(guildId);
        const guild = client.guilds.cache.get(guildId);
        const botCurrentChannel = guild?.members?.me?.voice?.channelId;

        if (player && botCurrentChannel === voiceChannelId) {
            // Bot already in the right channel and player exists — reuse it
            playerState.player = player;
            console.log('[DEBUG] Reusing existing player in voice channel');
        } else {
            // Need to join (or rejoin from a different channel)
            if (botCurrentChannel) {
                // Bot is stuck in a channel (state mismatch) — force leave first
                console.log('[DEBUG] Bot still in channel but player stale, force-leaving first...');
                try { await client.shoukaku.leaveVoiceChannel(guildId); } catch (_) {}
                await new Promise(r => setTimeout(r, 500));
            }
            try {
                player = await client.shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: voiceChannelId,
                    shardId: 0,
                    deaf: true,
                    mute: false
                });
                console.log('[DEBUG] Successfully joined voice channel');
            } catch (joinError) {
                console.error('Failed to join voice channel:', joinError.message);
                return { error: 'Failed to join voice channel' };
            }
            playerState.player = player;
        }

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
               await module.exports.playNext(client, guildId);
            } else {
               await module.exports.playNext(client, guildId);
            }
        });
        player.on('exception', async (data) => {
            console.error('❌ Playback exception:', data);
            await module.exports.playNext(client, guildId);
        });
        player.on('stuck', (data) => {
            console.error('Track stuck:', data);
            module.exports.playNext(client, guildId);
        });
        player.on('start', () => {
            console.log('[DEBUG] Playback started - audio should be playing');
        });
        track.requestedBy = requestedBy;

        // Debug: Log queue state before checking isFirst
        console.log(`[DEBUG musicPlayer.js] Before isFirst check - currentTrack: ${playerState.currentTrack ? 'exists' : 'null'}, queue length: ${playerState.queue.length}`);
        
        const isFirst = !playerState.currentTrack && playerState.queue.length === 0;

        console.log(`[DEBUG musicPlayer.js] isFirst value: ${isFirst}`);

        playerState.queue.push(track);
        
        if (isFirst) {
            await module.exports.playNext(client, guildId);
        } else {
            module.exports.updateDashboard(client, guildId);
        }
        return { track, isFirst };
    },
    playTrackDirect: async (client, guildId, voiceChannelId, track, textChannel) => {
        const nodes = [...client.shoukaku.nodes.values()];
        const node = nodes.find(n => isNodeReady(n));
        if (!node) {
            return { error: 'No Lavalink node available' };
        }
        const playerState = module.exports.getQueue(guildId);
        let player = client.shoukaku.players.get(guildId);
        const guild = client.guilds.cache.get(guildId);
        const botCurrentChannel = guild?.members?.me?.voice?.channelId;

        if (player && botCurrentChannel === voiceChannelId) {
            playerState.player = player;
        } else {
            if (botCurrentChannel) {
                try { await client.shoukaku.leaveVoiceChannel(guildId); } catch (_) {}
                await new Promise(r => setTimeout(r, 500));
            }
            try {
                player = await client.shoukaku.joinVoiceChannel({
                    guildId: guildId,
                    channelId: voiceChannelId,
                    shardId: 0,
                    deaf: true,
                    mute: false
                });
            } catch (joinError) {
                console.error('Failed to join voice channel:', joinError.message);
                return { error: 'Failed to join voice channel' };
            }
            playerState.player = player;
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
                   await module.exports.playNext(client, guildId);
                } else {
                   await module.exports.playNext(client, guildId);
                }
            });
            player.on('exception', async (data) => {
                console.error('❌ Playback exception:', data);
                if (playerState.currentTrack && playerState.currentTrack.info) {
                    const trackTitle = playerState.currentTrack.info.title;
                    const trackAuthor = playerState.currentTrack.info.author;
                    const currentSource = playerState.currentTrack.info.sourceName;
                    const searchQuery = `${trackAuthor} ${trackTitle}`;
                    console.log(`🔄 Trying to find alternative for "${trackTitle}" (failed source: ${currentSource})`);
                    const altSources = ['scsearch', 'ytmsearch', 'ytsearch', 'spsearch']
                        .filter(s => !currentSource?.includes(s.replace('search', '')));
                    for (const sourcePrefix of altSources) {
                        try {
                            const node = [...client.shoukaku.nodes.values()].find(n => isNodeReady(n));
                            if (!node) break;
                            console.log(`  Trying ${sourcePrefix}:${searchQuery}...`);
                            const result = await node.rest.resolve(`${sourcePrefix}:${searchQuery}`);
                            if (result && result.data && result.data.length > 0) {
                                console.log(`✅ Found alternative using ${sourcePrefix}, retrying playback...`);
                                playerState.currentTrack = result.data[0];
                                player.playTrack({ track: { encoded: result.data[0].encoded } });
                                module.exports.updateDashboard(client, guildId);
                                return;
                            }
                        } catch (e) {
                            console.log(`  ${sourcePrefix} failed: ${e.message}`);
                            continue;
                        }
                    }
                    console.log('⚠️ No alternative found, skipping to next track');
                }
                module.exports.playNext(client, guildId);
            });
            player.on('stuck', (data) => {
                console.error('Track stuck:', data);
                module.exports.playNext(client, guildId);
            });
            player.on('start', () => {
                console.log('[DEBUG] Playback started (playTrackDirect) - audio should be playing');
            });
        }
        playerState.queue.push(track);
        console.log(`[DEBUG] Queue length after push: ${playerState.queue.length}, currentTrack: ${!!playerState.currentTrack}`);
        if (!playerState.currentTrack && playerState.queue.length === 1) {
            await module.exports.playNext(client, guildId);
        } else {
             module.exports.updateDashboard(client, guildId);
        }
        return { track };
    },
    playNext: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState) {
            console.log(`No player state found for guild ${guildId}`);
            return;
        }
        const track = playerState.queue.shift();
        playerState.currentTrack = track || null;
        if (track) {
            try {
                if (!playerState.player) {
                    console.error('No player available for playback');
                    return;
                }
                const encoded = track.encoded || track.track;
                console.log(`[DEBUG] playNext: encoded=${encoded ? encoded.substring(0, 20) + '...' : 'MISSING'}, title=${track.info?.title}`);
                if (!encoded) {
                    console.error('[ERROR] Track has no encoded field! Skipping.');
                    if (playerState.queue.length > 0) await module.exports.playNext(client, guildId);
                    return;
                }
                await playerState.player.playTrack({ track: { encoded } });
                console.log('[DEBUG] playTrack called successfully');
                PlayHistory.create({
                    userId: track.requestedBy || 'unknown',
                    guildId,
                    trackTitle: track.info?.title || 'Unknown',
                    trackUrl: track.info?.uri || null,
                    artist: track.info?.author || 'Unknown',
                    duration: track.info?.length || 0,
                    source: track.info?.sourceName || 'unknown'
                }).catch(err => console.error('PlayHistory save error:', err.message));
            } catch (error) {
                console.error('Error playing track:', error.message);

                if (playerState.queue.length > 0) {
                    await module.exports.playNext(client, guildId);
                }
                return;
            }
        } else {

            console.log(`[DEBUG] Queue empty for guild ${guildId}`);
            playerState.currentTrack = null;
            try {
                if (playerState.player) {
                    playerState.player.stopTrack();
                }
            } catch (error) {
                console.error('Error stopping track:', error.message);
            }

            let config;
            try {
                config = await GuildConfig.findOne({ guildId });
            } catch (error) {
                console.error('Error fetching guild config:', error.message);
            }

            if (config && config.alwaysOn) {
                module.exports.updateDashboard(client, guildId);
                return;
            }

            const voiceChannelId = playerState.voiceChannelId;
            const textChannelId = playerState.textChannelId;
            const isAlone = await isBotAloneInVC(client, guildId, voiceChannelId);
            if (isAlone) {

                setTimeout(async () => {
                    const state = players.get(guildId);
                    if (state && !state.currentTrack && state.queue.length === 0) {

                        const aloneEmbed = new EmbedBuilder()
                            .setColor('#7C3AED')
                            .setDescription(`${emoji.status.success} Left the voice channel — nobody was around. Use \`/play\` to bring me back!`);
                        await sendToTextChannel(client, guildId, textChannelId, { embeds: [aloneEmbed] });
                        try {
                            await client.shoukaku.leaveVoiceChannel(guildId);
                        } catch (error) {
                            console.error('Error disconnecting player:', error.message);
                            try {
                                if (state.player && state.player.connection) {
                                    state.player.connection.disconnect();
                                }
                            } catch (e2) {}
                        }
                        players.delete(guildId);
                        console.log(`Disconnected from guild ${guildId} - bot was alone`);
                        module.exports.updateDashboard(client, guildId);
                    }
                }, 10000);
            } else {

                setTimeout(async () => {
                    const state = players.get(guildId);
                    if (state && !state.currentTrack && state.queue.length === 0) {

                        const idleEmbed = new EmbedBuilder()
                            .setColor('#7C3AED')
                            .setDescription(`${emoji.controls.pause} Left the voice channel due to **30 seconds of inactivity**. Use \`/play\` to play music again!`);
                        await sendToTextChannel(client, guildId, textChannelId, { embeds: [idleEmbed] });
                        try {
                            await client.shoukaku.leaveVoiceChannel(guildId);
                        } catch (error) {
                            console.error('Error disconnecting player:', error.message);
                            try {
                                if (state.player && state.player.connection) {
                                    state.player.connection.disconnect();
                                }
                            } catch (e2) {}
                        }
                        players.delete(guildId);
                        console.log(`Disconnected from guild ${guildId} due to inactivity`);
                        module.exports.updateDashboard(client, guildId);
                    }
                }, 30000);
            }
        }
        module.exports.updateDashboard(client, guildId);
    },
    updateDashboard: async (client, guildId) => {
        try {
            const config = await GuildConfig.findOne({ guildId });
            if (config && config.musicChannelId && config.musicMessageId) {
                const channel = client.channels.cache.get(config.musicChannelId);
                if (channel) {
                    try {
                        const message = await channel.messages.fetch(config.musicMessageId);
                        if (message) {
                            const playerState = players.get(guildId);
                            const status = playerState && playerState.currentTrack ? 'Playing' : 'Idle';
                            const { embeds, components } = createMusicEmbed(config, playerState?.currentTrack, playerState?.queue || [], status);
                            await message.edit({ embeds, components });
                        }
                    } catch (msgErr) {
                        if (msgErr.code === 10008) {
                            await GuildConfig.updateOne({ guildId }, { $unset: { musicMessageId: '' } });
                        }
                    }
                }
            }
            if (client.dashboardIO) {
                client.dashboardIO.to(guildId).emit('player:update', {
                    action: 'stateChanged',
                    timestamp: Date.now()
                });
            }
        } catch (err) {
            console.error('Failed to update dashboard:', err);
        }
    },
    pauseResume: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState || !playerState.player) return;
        const paused = !playerState.player.paused;
        playerState.player.setPaused(paused);
        module.exports.updateDashboard(client, guildId);
        return paused;
    },
    stopPlayer: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState || !playerState.player) return;
        try {
            playerState.queue = [];
            playerState.currentTrack = null;
            try {
                playerState.player.stopTrack();
            } catch (e) {
                console.error('Error stopping track:', e.message);
            }
            try {
                console.log(`[stopPlayer] Attempting to leave voice channel for guild ${guildId}`);
                await client.shoukaku.leaveVoiceChannel(guildId);
                console.log(`[stopPlayer] Successfully left voice channel for guild ${guildId}`);
            } catch (disconnectError) {
                console.error('Error disconnecting from voice:', disconnectError.message);
                try {
                    if (playerState.player) {
                        playerState.player.connection?.disconnect();
                    }
                } catch (e2) {
                    console.error('Error in fallback disconnect:', e2.message);
                }
            }
            module.exports.updateDashboard(client, guildId);
            players.delete(guildId);
        } catch (error) {
            console.error('Error in stopPlayer:', error.message);
            players.delete(guildId);
        }
    },
    skipTrack: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState || !playerState.player) return;
        try {
            playerState.player.stopTrack();
        } catch (error) {
            console.error('Error skipping track:', error.message);
            module.exports.playNext(client, guildId);
        }
    },
    setLoop: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState) return;
        const modes = ['off', 'track', 'queue'];
        const currentIndex = modes.indexOf(playerState.loop);
        playerState.loop = modes[(currentIndex + 1) % modes.length];
        return playerState.loop;
    },
    shuffleQueue: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState || playerState.queue.length === 0) return;
        for (let i = playerState.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playerState.queue[i], playerState.queue[j]] = [playerState.queue[j], playerState.queue[i]];
        }
        module.exports.updateDashboard(client, guildId);
    },
    clearQueue: async (client, guildId) => {
        const playerState = players.get(guildId);
        if (!playerState) return;
        playerState.queue = [];
        module.exports.updateDashboard(client, guildId);
        return true;
    },
    formatTime: (ms) => {
        if (!ms || isNaN(ms)) return '0:00';
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / 1000 / 60) % 60);
        const hours = Math.floor(ms / 1000 / 60 / 60);
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    },
    createProgressBar: (current, total, barLength = 12) => {
        if (!total || total === 0) return '▬'.repeat(barLength);
        const progress = Math.min(Math.round((current / total) * barLength), barLength);
        const before = '▬'.repeat(Math.max(progress, 0));
        const after = '▬'.repeat(Math.max(barLength - progress - 1, 0));
        return `${before}🔘${after}`;
    }
};
