const { ShardingManager } = require('discord.js');
const path = require('path');
require('dotenv').config();


const c = {
    reset:  '\x1b[0m',
    bold:   '\x1b[1m',
    dim:    '\x1b[2m',
    cyan:   '\x1b[36m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
    blue:   '\x1b[34m',
    magenta:'\x1b[35m',
    white:  '\x1b[37m',
    gray:   '\x1b[90m',
};

const tag  = (color, label) => `${c.bold}${color}[${label}]${c.reset}`;
const time = () => `${c.gray}${new Date().toLocaleTimeString('en-US', { hour12: false })}${c.reset}`;
const log  = (label, color, ...msg) => console.log(`${time()} ${tag(color, label)}`, ...msg);


function printBanner(totalShards) {
    const version = require('./package.json').version || '1.0.0';
    console.log();
    console.log(`${c.bold}${c.cyan}  ███████╗██████╗  █████╗  ██████╗███████╗${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ███████╗██████╔╝███████║██║     █████╗  ${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  ${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ███████║██║     ██║  ██║╚██████╗███████╗${c.reset}`);
    console.log(`${c.bold}${c.cyan}  ╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝${c.reset}`);
    console.log();
    console.log(`  ${c.bold}${c.white}SpaceBot${c.reset}  ${c.gray}v${version}${c.reset}  ${c.gray}·${c.reset}  ${c.cyan}Music Bot${c.reset}`);
    console.log(`  ${c.gray}Spawning ${c.bold}${c.cyan}${totalShards === 'auto' ? 'auto' : totalShards}${c.reset} ${c.gray}shard(s)...${c.reset}`);
    console.log();
    console.log(`  ${c.gray}${'─'.repeat(42)}${c.reset}`);
    console.log();
}


const shardStats = new Map(); // shardId -> { guilds, users, ping, ready }


const totalShards = process.env.TOTAL_SHARDS === 'auto'
    ? 'auto'
    : parseInt(process.env.TOTAL_SHARDS) || 1;

printBanner(totalShards);

const manager = new ShardingManager(path.join(__dirname, 'src', 'index.js'), {
    token: process.env.DISCORD_TOKEN,
    totalShards,
    respawn: true,
    shardArgs: [],
    execArgv: [],
});

manager.on('shardCreate', (shard) => {
    shardStats.set(shard.id, { guilds: 0, users: 0, ping: -1, ready: false });
    log('SHARD', c.cyan, `${c.bold}#${shard.id}${c.reset} ${c.gray}spawned${c.reset}`);


    shard.on('ready', () => {
        const stat = shardStats.get(shard.id) || {};
        stat.ready = true;
        shardStats.set(shard.id, stat);
        log('READY', c.green, `Shard ${c.bold}${c.green}#${shard.id}${c.reset} ${c.green}is online${c.reset}`);
        printShardTable();
    });

    shard.on('disconnect', () => {
        const stat = shardStats.get(shard.id) || {};
        stat.ready = false;
        shardStats.set(shard.id, stat);
        log('WARN', c.yellow, `Shard ${c.bold}#${shard.id}${c.reset} ${c.yellow}disconnected${c.reset}`);
    });

    shard.on('reconnecting', () => {
        log('INFO', c.blue, `Shard ${c.bold}#${shard.id}${c.reset} ${c.blue}reconnecting...${c.reset}`);
    });

    shard.on('death', (process) => {
        const stat = shardStats.get(shard.id) || {};
        stat.ready = false;
        shardStats.set(shard.id, stat);
        log('ERROR', c.red, `Shard ${c.bold}#${shard.id}${c.reset} ${c.red}died${c.reset} ${c.gray}(exit ${process.exitCode})${c.reset} — will respawn`);
    });

    shard.on('error', (error) => {
        log('ERROR', c.red, `Shard ${c.bold}#${shard.id}${c.reset} ${c.red}error:${c.reset}`, error.message);
    });


    shard.on('message', (msg) => {
        if (msg?.type === 'shardStats') {
            shardStats.set(shard.id, { ...shardStats.get(shard.id), ...msg.data, ready: true });
        }
    });
});


function printShardTable() {
    const shards = [...shardStats.entries()].sort((a, b) => a[0] - b[0]);
    if (shards.length === 0) return;

    const readyCount  = shards.filter(([, s]) => s.ready).length;
    const totalGuilds = shards.reduce((a, [, s]) => a + (s.guilds || 0), 0);
    const totalUsers  = shards.reduce((a, [, s]) => a + (s.users || 0), 0);
    const avgPing     = shards.reduce((a, [, s]) => a + (s.ping > 0 ? s.ping : 0), 0) / shards.length;

    console.log();
    console.log(`  ${c.gray}${'─'.repeat(50)}${c.reset}`);
    console.log(`  ${c.bold}Shard Overview${c.reset}  ${c.gray}${readyCount}/${shards.length} online${c.reset}`);
    console.log(`  ${c.gray}${'─'.repeat(50)}${c.reset}`);

    for (const [id, stat] of shards) {
        const status = stat.ready
            ? `${c.green}● online${c.reset}`
            : `${c.red}○ offline${c.reset}`;
        const ping = stat.ping > 0
            ? `${stat.ping > 150 ? c.yellow : c.green}${stat.ping}ms${c.reset}`
            : `${c.gray}—${c.reset}`;
        console.log(
            `  ${c.gray}Shard ${c.bold}#${id}${c.reset}  ` +
            `${status}  ` +
            `${c.gray}${stat.guilds || 0} servers${c.reset}  ` +
            `${c.gray}${stat.users || 0} users${c.reset}  ` +
            `${ping}`
        );
    }

    console.log(`  ${c.gray}${'─'.repeat(50)}${c.reset}`);
    console.log(
        `  ${c.gray}Total:${c.reset}  ` +
        `${c.bold}${c.white}${totalGuilds}${c.reset} ${c.gray}servers${c.reset}  ` +
        `${c.bold}${c.white}${totalUsers}${c.reset} ${c.gray}users${c.reset}  ` +
        `${c.gray}avg ping${c.reset} ${c.cyan}${Math.round(avgPing) || '—'}ms${c.reset}`
    );
    console.log(`  ${c.gray}${'─'.repeat(50)}${c.reset}`);
    console.log();
}


manager.spawn({ timeout: 60_000 })
    .then((shards) => {
        log('MANAGER', c.magenta, `${c.bold}${c.green}All ${shards.size} shard(s) spawned successfully${c.reset}`);

        setTimeout(printShardTable, 3000);

        setInterval(printShardTable, 5 * 60_000);
    })
    .catch((err) => {
        log('FATAL', c.red, 'Failed to spawn shards:', err.message);
        process.exit(1);
    });


process.on('unhandledRejection', (reason) => {
    log('ERROR', c.red, 'Unhandled rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
    log('FATAL', c.red, 'Uncaught exception:', err.message);
    process.exit(1);
});
