const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const i18n = require('../../utils/i18n');

const ITEMS_PER_PAGE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const lang = await i18n.getGuildLang(guildId);
        const playerState = musicPlayer.getQueue(guildId);
        
        if (!playerState || (playerState.queue.length === 0 && !playerState.currentTrack)) {
            return interaction.reply({ 
                content: i18n.get(lang, 'queue.empty'), 
                flags: MessageFlags.Ephemeral
            });
        }

        const queue = playerState.queue;
        const totalPages = Math.max(1, Math.ceil(queue.length / ITEMS_PER_PAGE));
        let currentPage = 0;

        function buildEmbed(page) {
            const start = page * ITEMS_PER_PAGE;
            const end = Math.min(start + ITEMS_PER_PAGE, queue.length);
            const pageItems = queue.slice(start, end);

            const nowPlayingText = i18n.get(lang, 'queue.now_playing', {
                title: `[${playerState.currentTrack?.info.title}](${playerState.currentTrack?.info.uri})`
            });

            const list = pageItems.map((t, i) => 
                `${start + i + 1}. [${t.info.title}](${t.info.uri})`
            ).join('\n');

            const upNextTitle = i18n.get(lang, 'queue.up_next');
            const upNextContent = list || i18n.get(lang, 'queue.empty');

            return new EmbedBuilder()
                .setColor('#6366f1')
                .setTitle('Music Queue')
                .setDescription(`${nowPlayingText}\n\n${upNextTitle}\n${upNextContent}`)
                .setFooter({ text: `Page ${page + 1}/${totalPages} • ${queue.length} tracks • Loop: ${playerState.loop}` });
        }

        function buildButtons(page, userId) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`queue_prev_${userId}`)
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId(`queue_next_${userId}`)
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= totalPages - 1)
            );
            return row;
        }

        const components = totalPages > 1 ? [buildButtons(currentPage, interaction.user.id)] : [];

        const reply = await interaction.reply({ 
            embeds: [buildEmbed(currentPage)], 
            components,
            flags: MessageFlags.Ephemeral
        });

        if (totalPages <= 1) return;

        const collector = reply.createMessageComponentCollector({ time: 120_000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.user.id !== interaction.user.id) {
                return btnInteraction.reply({ content: '❌ This is not your queue view!', flags: MessageFlags.Ephemeral });
            }

            if (btnInteraction.customId.includes('prev')) {
                currentPage = Math.max(0, currentPage - 1);
            } else {
                currentPage = Math.min(totalPages - 1, currentPage + 1);
            }

            await btnInteraction.update({
                embeds: [buildEmbed(currentPage)],
                components: [buildButtons(currentPage, interaction.user.id)]
            });
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: [] });
            } catch {
                // Message might be deleted
            }
        });
    },
};
