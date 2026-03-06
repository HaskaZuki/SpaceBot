const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');
const { getTotalGuildCount, getTotalUserCount, getTotalVoiceConnections, getShardInfo } = require('../../utils/shardUtils');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('[OWNER] Shows detailed bot statistics'),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const client = interaction.client;
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const memUsed = process.memoryUsage();
        const memUsedMB = (memUsed.heapUsed / 1024 / 1024).toFixed(2);
        const memTotalMB = (memUsed.heapTotal / 1024 / 1024).toFixed(2);
        const systemMemMB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const systemFreeMemMB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const totalGuilds = await getTotalGuildCount(client);
        const totalUsers = await getTotalUserCount(client);
        const totalVoiceConnections = await getTotalVoiceConnections(client);
        const totalChannels = client.channels.cache.size;
        const shardInfo = getShardInfo(client);
        const shoukaku = client.shoukaku;
        const lavalinkNodes = shoukaku ? [...shoukaku.nodes.values()] : [];
        const cpus = os.cpus();
        let cpuUsage = 0;
        cpus.forEach(cpu => {
            const total = Object.values(cpu.times).reduce((acc, t) => acc + t, 0);
            const usage = ((cpu.times.user / total) * 100);
            cpuUsage += usage;
        });
        const avgCpu = (cpuUsage / cpus.length).toFixed(2);
        const nodeVersion = process.version;
        const v8Version = process.versions.v8;
        const networkInterfaces = os.networkInterfaces();
        let internalIP = 'N/A';
        for (const name of Object.keys(networkInterfaces)) {
            for (const iface of networkInterfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    internalIP = iface.address;
                    break;
                }
            }
        }
        const statsText = [
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'BOT STATISTICS',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `Bot Name: ${client.user.username}`,
            `Bot ID: ${client.user.id}`,
            `Loaded Commands: ${client.commands.size}`,
            `Uptime: ${uptimeStr}`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'GLOBAL STATISTICS',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `Total Servers: ${totalGuilds.toLocaleString()}`,
            `Total Users: ${totalUsers.toLocaleString()}`,
            `Voice Connections: ${totalVoiceConnections.toLocaleString()}`,
            `Total Channels: ${totalChannels.toLocaleString()}`,
            `Total Emojis: ${client.emojis.cache.size.toLocaleString()}`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'SHARD STATISTICS',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `This Shard ID: ${shardInfo.id}`,
            `This Shard Servers: ${shardInfo.guilds.toLocaleString()}`,
            `Total Shards: ${shardInfo.total}`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'SYSTEM INFORMATION',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `Platform: ${os.platform()} ${os.arch()}`,
            `System RAM: ${systemFreeMemMB}GB / ${systemMemMB}GB (Free)`,
            `Bot Memory: ${memUsedMB}MB / ${memTotalMB}MB (Heap)`,
            `CPU Usage: ${avgCpu}% (Average)`,
            `CPU Cores: ${cpus.length}`,
            `Internal IP: ${internalIP}`,
            '',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            'SOFTWARE VERSIONS',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            `Node.js: ${nodeVersion}`,
            `V8 Engine: v${v8Version}`,
            `Discord.js: v${djsVersion}`,
        ];
        if (lavalinkNodes.length > 0) {
            statsText.push('');
            statsText.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            statsText.push('LAVALINK NODES');
            statsText.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            lavalinkNodes.forEach(node => {
                const status = node.state === 2 ? 'Online' : 'Offline'; // State 2 = READY in Shoukaku
                const players = node.stats ? node.stats.players : 0;
                const playing = node.stats ? node.stats.playingPlayers : 0;
                statsText.push(`${status} ${node.name}`);
                statsText.push(`   Players: ${players} | Playing: ${playing}`);
                if (node.stats) {
                    const cpuLoad = typeof node.stats.cpu === 'object'
                        ? (node.stats.cpu.systemLoad * 100).toFixed(1)
                        : (typeof node.stats.cpu === 'number' ? node.stats.cpu.toFixed(1) : '0.0');
                    const memoryUsed = node.stats.memory ? (node.stats.memory.used / 1024 / 1024).toFixed(0) : '0';
                    statsText.push(`   CPU: ${cpuLoad}% | Memory: ${memoryUsed}MB`);
                }
            });
        } else {
            statsText.push('');
            statsText.push('Lavalink: No nodes connected');
        }
        statsText.push('');
        statsText.push(`WebSocket Ping: ${client.ws.ping}ms`);
        statsText.push(`Response Time: ${Date.now() - interaction.createdTimestamp}ms`);
        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('SpaceBot Statistics')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(statsText.join('\n'))
            .setFooter({ text: `Shard ${shardInfo.id}/${shardInfo.total} | Requested by ${interaction.user.username}` })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    },
};
