const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎵 SpaceBot Sharding Manager v2.0');
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

const maxSpawnRetries = 10;
const baseWaitSec = 8;

function spawnWithRetry(retriesLeft = maxSpawnRetries) {
    return manager.spawn().then(() => {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ All shards spawned successfully!`);
        console.log(`📊 Total Shards: ${manager.totalShards}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
    }).catch(async (err) => {
        const res = err?.cause ?? err?.response ?? err;
        const status = res?.status;
        const statusText = res?.statusText;
        const msg = typeof err?.message === 'string' ? err.message : '';
        const is429 = status === 429 || statusText === 'Too Many Requests' ||
            msg.includes('429') || msg.includes('Too Many Requests');
        const headers = res?.headers;
        const getHeader = (h, k) => (typeof h?.get === 'function' ? h.get(k) : h?.[k] ?? h?.[k.toLowerCase?.()]);
        const retryAfterHeader = getHeader(headers, 'retry-after');
        const retryAfter = retryAfterHeader != null ? parseInt(String(retryAfterHeader), 10) : null;
        const waitSec = Number.isFinite(retryAfter) ? Math.max(retryAfter, 3) : baseWaitSec;

        if (retriesLeft > 0 && (is429 || msg.includes('gateway') || msg.includes('spawn'))) {
            console.warn('');
            console.warn(`⏳ ${is429 ? 'Discord rate limit (429)' : 'Spawn failed'}. Waiting ${waitSec}s before retry (${retriesLeft} left)...`);
            console.warn('');
            await new Promise(r => setTimeout(r, waitSec * 1000));
            return spawnWithRetry(retriesLeft - 1);
        }

        console.error('');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ FATAL ERROR: Failed to spawn shards');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error(err);
        process.exit(1);
    });
}

const startupDelaySec = parseInt(process.env.STARTUP_DELAY_SEC || '0', 10) || 0;
if (startupDelaySec > 0) {
    console.log(`⏳ Waiting ${startupDelaySec}s before first spawn (STARTUP_DELAY_SEC)...`);
    setTimeout(() => spawnWithRetry(), startupDelaySec * 1000);
} else {
    spawnWithRetry();
}

process.on('SIGINT', () => {
    console.log('');
    console.log('⏹️  Shutting down all shards...');
    manager.shards.forEach(shard => {
        shard.kill();
    });
    setTimeout(() => process.exit(0), 3000);
});
