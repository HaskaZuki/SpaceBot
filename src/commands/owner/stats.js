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
        const lavalinkStatus = lavalinkNodes.length > 0 
            ? lavalinkNodes.map(n => `${n.name}: ${n.state === 2 ? '🟢 Connected' : '🔴 Disconnected'}`).join('\n')
            : '❌ No Nodes';

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('📊 XylosBot Statistics')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '⏰ Uptime', value: uptimeStr, inline: true },
                { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '🧩 Shard', value: shardInfo.isSharded ? `${shardInfo.id}/${shardInfo.total}` : 'No Sharding', inline: true },
                
                { name: '🌐 Total Servers', value: totalGuilds.toLocaleString(), inline: true },
                { name: '👥 Total Users', value: totalUsers.toLocaleString(), inline: true },
                { name: '🎵 Voice Connections', value: totalVoiceConnections.toLocaleString(), inline: true },
                
                { name: '📺 This Shard Servers', value: shardInfo.guilds.toLocaleString(), inline: true },
                { name: '📺 This Shard Channels', value: totalChannels.toLocaleString(), inline: true },
                { name: '💾 Memory (Bot)', value: `${memUsedMB} / ${memTotalMB} MB`, inline: true },
                
                { name: '💻 System RAM', value: `${systemFreeMemMB} / ${systemMemMB} GB free`, inline: true },
                { name: '🖥️ Platform', value: `${os.platform()} ${os.arch()}`, inline: true },
                { name: '📦 Node.js', value: process.version, inline: true },
                
                { name: '🔧 Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🎵 Lavalink', value: lavalinkStatus, inline: false }
            )
            .setFooter({ text: `Bot ID: ${client.user.id}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

