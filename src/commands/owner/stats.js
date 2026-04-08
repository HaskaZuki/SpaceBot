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
        const days    = Math.floor(uptime / 86400);
        const hours   = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const mem       = process.memoryUsage();
        const heapUsed  = (mem.heapUsed  / 1024 / 1024).toFixed(1);
        const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);
        const sysTotal  = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const sysFree   = (os.freemem()  / 1024 / 1024 / 1024).toFixed(2);

        const cpus = os.cpus();
        const avgCpu = (
            cpus.reduce((acc, cpu) => {
                const total = Object.values(cpu.times).reduce((a, t) => a + t, 0);
                return acc + (cpu.times.user / total) * 100;
            }, 0) / cpus.length
        ).toFixed(1);

        const [totalGuilds, totalUsers, totalVoice, shardInfo] = await Promise.all([
            getTotalGuildCount(client),
            getTotalUserCount(client),
            getTotalVoiceConnections(client),
            getShardInfo(client),
        ]);

        const netIfaces = os.networkInterfaces();
        let internalIP = 'N/A';
        for (const ifaces of Object.values(netIfaces)) {
            for (const iface of ifaces) {
                if (iface.family === 'IPv4' && !iface.internal) { internalIP = iface.address; break; }
            }
        }

        const shoukaku = client.shoukaku;
        const lavalinkNodes = shoukaku ? [...shoukaku.nodes.values()] : [];

        const lavalinkField = lavalinkNodes.length > 0
            ? lavalinkNodes.map(n => {
                const status  = n.state === 1 ? '🟢' : '🔴';
                const players = n.stats?.players ?? 0;
                const playing = n.stats?.playingPlayers ?? 0;
                const cpuLoad = n.stats?.cpu
                    ? (typeof n.stats.cpu === 'object'
                        ? (n.stats.cpu.systemLoad * 100).toFixed(1)
                        : n.stats.cpu.toFixed(1))
                    : '0.0';
                const memMB = n.stats?.memory ? (n.stats.memory.used / 1024 / 1024).toFixed(0) : '0';
                return `${status} **${n.name}**\n╠ Players: ${players} | Playing: ${playing}\n╚ CPU: ${cpuLoad}% | Mem: ${memMB}MB`;
            }).join('\n\n')
            : '`No nodes connected`';

        const ping = client.ws.ping;
        const responseTime = Date.now() - interaction.createdTimestamp;

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('SpaceBot Statistics')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                {
                    name: 'Bot',
                    value: `**Name:** ${client.user.username}\n**ID:** \`${client.user.id}\`\n**Commands:** ${client.commands.size}\n**Uptime:** ${uptimeStr}`,
                    inline: true,
                },
                {
                    name: 'Global',
                    value: `**Servers:** ${totalGuilds.toLocaleString()}\n**Users:** ${totalUsers.toLocaleString()}\n**Voice:** ${totalVoice.toLocaleString()}\n**Channels:** ${client.channels.cache.size.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: 'Shard',
                    value: `**ID:** ${shardInfo.id} / ${shardInfo.total}\n**Servers:** ${shardInfo.guilds.toLocaleString()}\n**WS Ping:** ${ping}ms\n**Response:** ${responseTime}ms`,
                    inline: true,
                },
                {
                    name: 'System',
                    value: `**OS:** ${os.platform()} ${os.arch()}\n**CPU:** ${avgCpu}% avg · ${cpus.length} cores\n**RAM (Bot):** ${heapUsed}MB / ${heapTotal}MB\n**RAM (System):** ${sysFree}GB free / ${sysTotal}GB\n**IP:** \`${internalIP}\``,
                    inline: true,
                },
                {
                    name: 'Versions',
                    value: `**Node.js:** ${process.version}\n**V8:** v${process.versions.v8}\n**Discord.js:** v${djsVersion}`,
                    inline: true,
                },
                {
                    name: 'Lavalink Nodes',
                    value: lavalinkField,
                    inline: false,
                },
            )
            .setFooter({ text: `Shard ${shardInfo.id}/${shardInfo.total} • Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
