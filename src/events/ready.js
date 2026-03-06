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

        // Wait for Lavalink node to be ready before restoring sessions
        const tryRestore = async (attempts = 0) => {
            const nodes = [...client.shoukaku.nodes.values()];
            const ready = nodes.find(n => n.state === 2); // State 2 = READY in Shoukaku

            if (ready) {
                console.log('[Session] Lavalink ready — restoring sessions...');
                await restoreAllSessions(client);
            } else if (attempts < 10) {
                console.log(`[Session] Waiting for Lavalink... (attempt ${attempts + 1}/10)`);
                setTimeout(() => tryRestore(attempts + 1), 3000);
            } else {
                console.warn('[Session] Lavalink not available after 30s — skipping session restore');
            }
        };

        // Give Lavalink a short head-start before polling
        setTimeout(() => tryRestore(), 5000);

        // Broadcast stats to ShardingManager every 60s so the console table stays fresh
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
