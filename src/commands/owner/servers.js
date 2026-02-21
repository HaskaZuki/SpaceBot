const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('[OWNER] List all servers the bot is in')
        .addIntegerOption(opt => opt.setName('page').setDescription('Page number').setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const client = interaction.client;        let allGuilds = [];
        if (client.shard) {            const guildDataArray = await client.shard.broadcastEval(c => 
                c.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    memberCount: g.memberCount
                }))
            );            allGuilds = guildDataArray.flat();
        } else {            allGuilds = [...client.guilds.cache.values()].map(g => ({
                id: g.id,
                name: g.name,
                memberCount: g.memberCount
            }));
        }

        const perPage = 10;
        const page = Math.max(1, interaction.options.getInteger('page') || 1);
        const totalPages = Math.ceil(allGuilds.length / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;        allGuilds.sort((a, b) => b.memberCount - a.memberCount);

        const pageGuilds = allGuilds.slice(start, end);

        const totalMembers = allGuilds.reduce((acc, g) => acc + g.memberCount, 0);

        let description = '';
        pageGuilds.forEach((g, i) => {
            description += `**${start + i + 1}.** ${g.name}\n`;
            description += `   ID: \`${g.id}\` | Members: **${g.memberCount.toLocaleString()}**\n\n`;
        });

        const shardInfo = client.shard ? `Shard ${client.shard.ids[0]}/${client.shard.count}` : 'No Sharding';

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle(`📊 Server List (Page ${page}/${totalPages})`)
            .setDescription(description || 'No servers found.')
            .addFields(
                { name: 'Total Servers', value: allGuilds.length.toLocaleString(), inline: true },
                { name: 'Total Members', value: totalMembers.toLocaleString(), inline: true },
                { name: 'Average Size', value: Math.round(totalMembers / allGuilds.length).toLocaleString(), inline: true },
                { name: 'Sharding', value: shardInfo, inline: false }
            )
            .setFooter({ text: `Use /servers page:<number> to navigate | Data from all shards` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};

