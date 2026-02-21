const musicPlayer = require('./musicPlayer');

let clientRef = null;
let ioRef = null;

const init = (client, io) => {
    clientRef = client;
    ioRef = io;

    io.on('connection', (socket) => {
        socket.on('player:play', async ({ guildId, query }) => {
            try {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) return socket.emit('player:error', { message: 'Guild not found' });

                const botMember = guild.members.me;
                const voiceChannel = botMember?.voice?.channel;
                if (!voiceChannel) return socket.emit('player:error', { message: 'Bot is not in a voice channel' });

                const textChannel = guild.channels.cache.find(c => c.type === 0);
                const result = await musicPlayer.playTrack(client, guildId, voiceChannel.id, query, textChannel);

                if (result?.error) {
                    socket.emit('player:error', { message: result.error });
                } else {
                    io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
                }
            } catch (err) {
                console.error('[Socket] play error:', err.message);
                socket.emit('player:error', { message: 'Failed to play track' });
            }
        });

        socket.on('player:pause', async ({ guildId }) => {
            try {
                await musicPlayer.pauseResume(client, guildId);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] pause error:', err.message);
            }
        });

        socket.on('player:skip', async ({ guildId }) => {
            try {
                await musicPlayer.skipTrack(client, guildId);
                setTimeout(() => {
                    io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
                }, 500);
            } catch (err) {
                console.error('[Socket] skip error:', err.message);
            }
        });

        socket.on('player:stop', async ({ guildId }) => {
            try {
                await musicPlayer.stopPlayer(client, guildId);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] stop error:', err.message);
            }
        });

        socket.on('player:volume', async ({ guildId, volume }) => {
            try {
                const playerState = musicPlayer.players.get(guildId);
                if (!playerState?.player) return;
                playerState.player.setGlobalVolume(volume);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] volume error:', err.message);
            }
        });

        socket.on('player:loop', async ({ guildId }) => {
            try {
                await musicPlayer.setLoop(client, guildId);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] loop error:', err.message);
            }
        });

        socket.on('player:shuffle', async ({ guildId }) => {
            try {
                await musicPlayer.shuffleQueue(client, guildId);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] shuffle error:', err.message);
            }
        });

        socket.on('player:seek', async ({ guildId, position }) => {
            try {
                const playerState = musicPlayer.players.get(guildId);
                if (!playerState?.player) return;
                playerState.player.seekTo(position);
                io.to(guildId).emit('player:stateUpdate', getPlayerState(guildId));
            } catch (err) {
                console.error('[Socket] seek error:', err.message);
            }
        });

        socket.on('player:getState', ({ guildId }) => {
            socket.emit('player:stateUpdate', getPlayerState(guildId));
        });
    });
};

const getPlayerState = (guildId) => {
    const playerState = musicPlayer.players.get(guildId);

    if (!playerState || !playerState.player) {
        return {
            guildId,
            isPlaying: false,
            currentTrack: null,
            queue: [],
            volume: 100,
            loop: 'off',
            isPaused: false,
            position: 0
        };
    }

    return {
        guildId,
        isPlaying: !!playerState.currentTrack,
        currentTrack: playerState.currentTrack ? {
            title: playerState.currentTrack.info?.title,
            author: playerState.currentTrack.info?.author,
            duration: playerState.currentTrack.info?.length,
            uri: playerState.currentTrack.info?.uri,
            artworkUrl: playerState.currentTrack.info?.artworkUrl
        } : null,
        queue: playerState.queue.slice(0, 20).map(t => ({
            title: t.info?.title,
            author: t.info?.author,
            duration: t.info?.length
        })),
        volume: playerState.player.filters?.volume || 100,
        loop: playerState.loop || 'off',
        isPaused: playerState.player.paused || false,
        position: playerState.player.position || 0
    };
};

const emitToGuild = (guildId, event, data) => {
    if (!ioRef) return;
    try {
        ioRef.to(guildId).emit(event, data);
    } catch (err) {
        console.error('[Socket] emit error:', err.message);
    }
};

module.exports = { init, getPlayerState, emitToGuild };
