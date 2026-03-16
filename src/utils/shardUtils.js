
async function getTotalGuildCount(client) {
    if (!client.shard) return client.guilds.cache.size;
    try {
        const results = await client.shard.broadcastEval(c => c.guilds.cache.size);
        return results.reduce((acc, count) => acc + count, 0);
    } catch (error) {
        console.error('Error fetching total guild count:', error);
        return client.guilds.cache.size;
    }
}
async function getTotalUserCount(client) {
    if (!client.shard) return client.users.cache.size;
    try {
        const results = await client.shard.broadcastEval(c => c.users.cache.size);
        return results.reduce((acc, count) => acc + count, 0);
    } catch (error) {
        console.error('Error fetching total user count:', error);
        return client.users.cache.size;
    }
}
async function getTotalVoiceConnections(client) {
    if (!client.shard) {
        return client.shoukaku?.players?.size || 0;
    }
    try {
        const results = await client.shard.broadcastEval(c => c.shoukaku?.players?.size || 0);
        return results.reduce((acc, count) => acc + count, 0);
    } catch (error) {
        console.error('Error fetching total voice connections:', error);
        return client.shoukaku?.players?.size || 0;
    }
}
async function getTotalChannelCount(client) {
    if (!client.shard) return client.channels.cache.size;
    try {
        const results = await client.shard.broadcastEval(c => c.channels.cache.size);
        return results.reduce((acc, count) => acc + count, 0);
    } catch (error) {
        console.error('Error fetching total channel count:', error);
        return client.channels.cache.size;
    }
}
function getShardInfo(client) {
    if (!client.shard) {
        return {
            id: 0,
            total: 1,
            guilds: client.guilds.cache.size,
            isSharded: false
        };
    }
    return {
        id: client.shard.ids[0],
        total: client.shard.count,
        guilds: client.guilds.cache.size,
        isSharded: true
    };
}
async function broadcastToShards(client, event, data) {
    if (!client.shard) {
        console.log('Not running in sharded mode');
        return;
    }
    try {
        await client.shard.broadcastEval((c, { event, data }) => {
            c.emit(event, data);
        }, { context: { event, data } });
    } catch (error) {
        console.error('Error broadcasting to shards:', error);
    }
}
module.exports = {
    getTotalGuildCount,
    getTotalUserCount,
    getTotalVoiceConnections,
    getTotalChannelCount,
    getShardInfo,
    broadcastToShards
};
