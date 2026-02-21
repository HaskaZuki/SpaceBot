const express = require('express');
const router = express.Router();
const musicPlayer = require('../../utils/musicPlayer');

module.exports = (client, io) => {
    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.status(401).json({ message: 'Unauthorized' });
    };

    const checkGuildAccess = (req, res, next) => {
        const guildId = req.params.guildId;
        const hasAccess = req.user.guilds?.find(g => g.id === guildId && (BigInt(g.permissions) & 0x20n) === 0x20n);
        if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });
        next();
    };

    router.get('/:guildId/state', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;
        
        try {
            const playerState = musicPlayer.players.get(guildId);
            
            if (!playerState || !playerState.player) {
                return res.json({
                    isPlaying: false,
                    currentTrack: null,
                    queue: [],
                    volume: 100,
                    loop: 'off',
                    isPaused: false
                });
            }

            const player = playerState.player;
            
            res.json({
                isPlaying: !!playerState.currentTrack,
                currentTrack: playerState.currentTrack ? {
                    title: playerState.currentTrack.info.title,
                    author: playerState.currentTrack.info.author,
                    duration: playerState.currentTrack.info.length,
                    uri: playerState.currentTrack.info.uri,
                    artworkUrl: playerState.currentTrack.info.artworkUrl
                } : null,
                queue: playerState.queue.slice(0, 20).map(t => ({
                    title: t.info.title,
                    author: t.info.author,
                    duration: t.info.length
                })),
                volume: player.filters?.volume || 100,
                loop: playerState.loop || 'off',
                isPaused: player.paused || false,
                position: player.position || 0
            });
        } catch (error) {
            console.error('Get player state error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/play', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;
        const { query } = req.body;

        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return res.status(404).json({ message: 'Guild not found' });

            const botMember = guild.members.me;
            const voiceChannel = botMember?.voice?.channel;

            if (!voiceChannel) {
                return res.status(400).json({ message: 'Bot is not in a voice channel. Use Discord commands first.' });
            }

            if (query) {
                const result = await musicPlayer.playTrack(
                    client,
                    guildId,
                    voiceChannel.id,
                    query,
                    guild.channels.cache.find(c => c.type === 0)
                );

                if (result.error) {
                    return res.status(400).json({ message: result.error });
                }

                io.to(guildId).emit('player:update', { action: 'trackAdded' });

                res.json({ success: true, message: 'Track added to queue', track: result.track });
            } else {
                const playerState = musicPlayer.players.get(guildId);
                if (playerState?.player) {
                    await playerState.player.setPaused(false);
                    io.to(guildId).emit('player:update', { action: 'resumed' });
                    res.json({ success: true, message: 'Playback resumed' });
                } else {
                    res.status(400).json({ message: 'No active player' });
                }
            }
        } catch (error) {
            console.error('Play error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/pause', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            const playerState = musicPlayer.players.get(guildId);
            if (!playerState?.player) {
                return res.status(400).json({ message: 'No active player' });
            }

            await playerState.player.setPaused(true);
            io.to(guildId).emit('player:update', { action: 'paused' });
            
            res.json({ success: true, message: 'Playback paused' });
        } catch (error) {
            console.error('Pause error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/skip', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            await musicPlayer.skipTrack(client, guildId);
            io.to(guildId).emit('player:update', { action: 'skipped' });
            
            res.json({ success: true, message: 'Track skipped' });
        } catch (error) {
            console.error('Skip error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/stop', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            await musicPlayer.stopPlayer(client, guildId);
            io.to(guildId).emit('player:update', { action: 'stopped' });
            
            res.json({ success: true, message: 'Playback stopped' });
        } catch (error) {
            console.error('Stop error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/volume', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;
        const { volume } = req.body;

        if (volume === undefined || volume < 0 || volume > 200) {
            return res.status(400).json({ message: 'Volume must be between 0 and 200' });
        }

        try {
            const playerState = musicPlayer.players.get(guildId);
            if (!playerState?.player) {
                return res.status(400).json({ message: 'No active player' });
            }

            await playerState.player.setGlobalVolume(volume);
            io.to(guildId).emit('player:update', { action: 'volumeChanged', volume });
            
            res.json({ success: true, message: `Volume set to ${volume}%` });
        } catch (error) {
            console.error('Volume error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/loop', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            const mode = await musicPlayer.setLoop(client, guildId);
            io.to(guildId).emit('player:update', { action: 'loopChanged', mode });
            
            res.json({ success: true, message: `Loop mode: ${mode}`, mode });
        } catch (error) {
            console.error('Loop error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/shuffle', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            await musicPlayer.shuffleQueue(client, guildId);
            io.to(guildId).emit('player:update', { action: 'shuffled' });
            
            res.json({ success: true, message: 'Queue shuffled' });
        } catch (error) {
            console.error('Shuffle error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    router.post('/:guildId/clear', checkAuth, checkGuildAccess, async (req, res) => {
        const { guildId } = req.params;

        try {
            await musicPlayer.clearQueue(client, guildId);
            io.to(guildId).emit('player:update', { action: 'cleared' });
            
            res.json({ success: true, message: 'Queue cleared' });
        } catch (error) {
            console.error('Clear queue error:', error);
            res.status(500).json({ message: error.message });
        }
    });

    return router;
};
