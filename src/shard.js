const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();
const totalShards = process.env.TOTAL_SHARDS === 'auto' ? 'auto' : parseInt(process.env.TOTAL_SHARDS) || 1;
const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards,
    respawn: true
});
manager.on('shardCreate', shard => {
    console.log('[Manager] Launched shard ${shard.id}');
    shard.on('ready', () => {
        console.log('[Manager] Shard ${shard.id} ready');
    });
    shard.on('disconnect', () => {
        console.warn('[Manager] Shard ${shard.id} disconnected');
    });
    shard.on('reconnecting', () => {
        console.log('[Manager] Shard ${shard.id} reconnecting...');
    });
    shard.on('death', () => {
        console.error('[Manager] Shard ${shard.id} died');
    });
    shard.on('error', (error) => {
        console.error(`[Manager] Shard ${shard.id} error:`, error);
    });
});
manager.spawn()
    .then(shards => {
        console.log(`[Manager] Spawning complete. Total shards: ${shards.size}`);
    })
    .catch(console.error);
