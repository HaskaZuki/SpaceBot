const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎵 XylosBot Sharding Manager v2.0');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const manager = new ShardingManager(path.join(__dirname, 'src', 'index.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto',
    respawn: true,
    shardArgs: process.argv.slice(2),
    execArgv: process.execArgv
});

manager.on('shardCreate', shard => {
    console.log(`🚀 [SHARD ${shard.id}] Launching...`);

    shard.on('ready', () => {
        console.log(`✅ [SHARD ${shard.id}] Connected and ready!`);
    });

    shard.on('reconnecting', () => {
        console.warn(`🔄 [SHARD ${shard.id}] Reconnecting to Discord...`);
    });

    shard.on('disconnect', () => {
        console.error(`❌ [SHARD ${shard.id}] Disconnected from Discord`);
    });

    shard.on('death', () => {
        console.error(`💀 [SHARD ${shard.id}] Process died, respawning...`);
    });

    shard.on('error', (error) => {
        console.error(`⚠️ [SHARD ${shard.id}] Error:`, error.message);
    });
});

manager.spawn()
    .then(() => {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ All shards spawned successfully!`);
        console.log(`📊 Total Shards: ${manager.totalShards}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    })
    .catch(err => {
        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ FATAL ERROR: Failed to spawn shards');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(err);
        process.exit(1);
    });

process.on('SIGINT', () => {
    console.log('');
    console.log('⏹️  Shutting down all shards...');
    manager.shards.forEach(shard => {
        shard.kill();
    });
    setTimeout(() => process.exit(0), 3000);
});
