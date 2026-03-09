const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const emoji = require('../../utils/emojiConfig');
const PER_PAGE = 10;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('[OWNER] List all servers the bot is in'),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const client = interaction.client;
        let allGuilds = [];
        if (client.shard) {
            const guildDataArray = await client.shard.broadcastEval(c => 
                c.guilds.cache.map(g => ({
                    id: g.id,
                    name: g.name,
                    memberCount: g.memberCount
                }))
            );
            allGuilds = guildDataArray.flat();
        } else {
            allGuilds = [...client.guilds.cache.values()].map(g => ({
                id: g.id,
                name: g.name,
                memberCount: g.memberCount
            }));
        }
        allGuilds.sort((a, b) => b.memberCount - a.memberCount);
        const totalPages = Math.max(1, Math.ceil(allGuilds.length / PER_PAGE));
        const totalMembers = allGuilds.reduce((acc, g) => acc + g.memberCount, 0);
        const shardInfo = client.shard ? 'Shard ${client.shard.ids[0]}/${client.shard.count}' : 'No Sharding';
        let currentPage = 0;
        function buildEmbed(page) {
            const start = page * PER_PAGE;
            const end = Math.min(start + PER_PAGE, allGuilds.length);
            const pageGuilds = allGuilds.slice(start, end);
            let description = '';
            pageGuilds.forEach((g, i) => {
                description += '**${start + i + 1}.** ${g.name}\n`;
                description += `   ID: \`${g.id}\` | Members: **${g.memberCount.toLocaleString()}**\n\n`;
            });
            return new EmbedBuilder()
                .setColor('#6366f1')
                .setTitle('Server List (Page ${page + 1}/${totalPages})`)
                .setDescription(`${emoji.ui.charts} Bot server statistics\n\n${description || 'No servers found.'}`)
                .addFields(
                    { name: 'Total Servers', value: allGuilds.length.toLocaleString(), inline: true },
                    { name: 'Total Members', value: totalMembers.toLocaleString(), inline: true },
                    { name: 'Average Size', value: allGuilds.length > 0 ? Math.round(totalMembers / allGuilds.length).toLocaleString() : '0', inline: true },
                    { name: 'Sharding', value: shardInfo, inline: false }
                )
                .setFooter({ text: 'Page ${page + 1}/${totalPages} • Use buttons to navigate` })
                .setTimestamp();
        }
        function buildButtons(page) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`servers_prev_${interaction.user.id}')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('servers_next_${interaction.user.id}')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1)
            );
        }
        const components = totalPages > 1 ? [buildButtons(currentPage)] : [];
        await interaction.editReply({ 
            embeds: [buildEmbed(currentPage)],
            components
        });
        if (totalPages <= 1) return;
        const reply = await interaction.fetchReply();
        const collector = reply.createMessageComponentCollector({ time: 120_000 });
        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.user.id !== interaction.user.id) {
                return btnInteraction.reply({ content: `${emoji.status.error} This is not your server list!`, flags: MessageFlags.Ephemeral });
            }
            if (btnInteraction.customId.includes('prev')) {
                currentPage = Math.max(0, currentPage - 1);
            } else {
                currentPage = Math.min(totalPages - 1, currentPage + 1);
            }
            await btnInteraction.update({
                embeds: [buildEmbed(currentPage)],
                components: [buildButtons(currentPage)]
            });
        });
        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: [] });
            } catch {            }
        });
    },
};
