const { ActivityType } = require('discord.js');
const { restoreAllSessions } = require('../utils/sessionManager');

module.exports = {
    name: 'clientReady',
    once: true,
    async execute(client) {
        const shardId = client.shard ? client.shard.ids[0] : 0;
        const totalShards = client.shard ? client.shard.count : 1;
        const guildCount = client.guilds.cache.size;

        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log(`📊 Shard ${shardId}/${totalShards} | ${guildCount} servers`);

        client.user.setPresence({
            activities: [{
                name: `Music on Shard ${shardId} | ${guildCount} servers`,
                type: ActivityType.Listening
            }],
            status: 'online',
        });

        // Check if Lavalink is already connected (e.g. bot restarted after Lavalink was up)
        const checkAndRestore = async () => {
            const nodes = [...client.shoukaku.nodes.values()];
            const ready = nodes.find(n => n.state === 1);
            if (ready) {
                console.log('[Session] Lavalink ready — restoring sessions...');
                await restoreAllSessions(client);
                return true;
            }
            return false;
        };

        // Try immediately, then listen for the ready event for future connections
        const alreadyReady = await checkAndRestore();
        if (!alreadyReady) {
            console.log('[Session] Lavalink not yet ready — waiting for node ready event...');
            client.shoukaku.once('ready', async (name) => {
                console.log(`[Session] Lavalink node "${name}" connected — restoring sessions...`);
                await restoreAllSessions(client);
            });
        }

        if (client.shard) {
            const broadcastStats = () => {
                const statPayload = {
                    type: 'shardStats',
                    data: {
                        guilds: client.guilds.cache.size,
                        users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                        ping: client.ws.ping,
                    },
                };
                process.send?.(statPayload);
            };
            broadcastStats();
            setInterval(broadcastStats, 60_000);
        }
    },
};
