const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const musicPlayer = require('../../../utils/musicPlayer');
const storage = require('../../../utils/storage');
const { formatTime } = require('../../../utils/validators');
const emoji = require('../../../utils/emojiConfig');
const ITEMS_PER_PAGE = 10;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('favorites')
        .setDescription('Manage your favorite tracks')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Show your favorite tracks'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play all your favorites'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove  a track from favorites')
                .addIntegerOption(option =>
                    option.setName('position')
                        .setDescription('Position of track to remove (see /favorites list)')
                        .setMinValue(1)
                        .setRequired(true))),
    category: 'premium',
    async execute(interaction) {
        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();
        try {
            const userFavorites = await storage.getUser('favorites', userId);
            if (!userFavorites || userFavorites.favorites.length === 0) {
                return interaction.reply({
                    content: `${emoji.status.error} You don't have any favorites yet!\n\nUse \`/favorite\` while a track is playing to add it.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            if (subcommand === 'list') {
                const favorites = userFavorites.favorites;
                const totalPages = Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));
                let currentPage = 0;
                function buildEmbed(page) {
                    const startIdx = page * ITEMS_PER_PAGE;
                    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, favorites.length);
                    const pageFavorites = favorites.slice(startIdx, endIdx);
                    return new EmbedBuilder()
                        .setColor('#FFD700')
                        .setTitle(`Your Favorites (${favorites.length} tracks)`)
                        .setDescription(
                            `${emoji.premium.star} Your saved favorite tracks\n\n` +
                            pageFavorites.map((fav, idx) => 
                                `**${startIdx + idx + 1}.** [${fav.info.title}](${fav.info.uri})\n` +
                                `└ ${fav.info.author} • ${formatTime(fav.info.length)}`
                            ).join('\n\n')
                        )
                        .setFooter({ text: `Page ${page + 1}/${totalPages} • Use /favorites play to play all` })
                        .setTimestamp();
                }
                function buildButtons(page) {
                    return new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`fav_prev_${userId}`)
                            .setEmoji('◀️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId(`fav_next_${userId}`)
                            .setEmoji('▶️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(page >= totalPages - 1)
                    );
                }
                const components = totalPages > 1 ? [buildButtons(currentPage)] : [];
                const reply = await interaction.reply({ 
                    embeds: [buildEmbed(currentPage)], 
                    components,
                    flags: MessageFlags.Ephemeral
                });
                if (totalPages <= 1) return;
                const collector = reply.createMessageComponentCollector({ time: 120_000 });
                collector.on('collect', async (btnInteraction) => {
                    if (btnInteraction.user.id !== interaction.user.id) {
                        return btnInteraction.reply({ content: `${emoji.status.error} This is not your favorites view!`, flags: MessageFlags.Ephemeral });
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
                    } catch {
                    }
                });
            } else if (subcommand === 'play') {
                const guildId = interaction.guild.id;
                const member = interaction.member;
                if (!member.voice?.channel) {
                    return interaction.reply({
                        content: `${emoji.status.error} You must be in a voice channel to play favorites!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
                await interaction.deferReply();
                try {
                    const favorites = userFavorites.favorites;
                    let addedCount = 0;
                    for (const favorite of favorites) {
                        try {
                            await musicPlayer.playTrack(
                                interaction.client,
                                guildId,
                                member.voice.channel.id,
                                favorite.info.uri,
                                interaction.channel
                            );
                            addedCount++;
                        } catch (error) {
                            console.error('Error adding favorite:', error);
                        }
                    }
                    await interaction.editReply({
                        content: `${emoji.premium.star} Added **${addedCount}** favorites to the queue!`
                    });
                } catch (playError) {
                    console.error('Play favorites error:', playError);
                    await interaction.editReply({
                        content: `${emoji.status.error} An error occurred while adding favorites to queue!`
                    });
                }
            } else if (subcommand === 'remove') {
                const position = interaction.options.getInteger('position');
                const index = position - 1;
                if (index < 0 || index >= userFavorites.favorites.length) {
                    return interaction.reply({
                        content: `${emoji.status.error} Invalid position! You have ${userFavorites.favorites.length} favorites.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
                try {
                    const removed = userFavorites.favorites.splice(index, 1)[0];
                    const success = await storage.setUser('favorites', userId, userFavorites);
                    if (success) {
                        await interaction.reply({
                            content: `${emoji.controls.remove} Removed from favorites: **${removed.info.title}**\n\n` +
                                    `Remaining favorites: ${userFavorites.favorites.length}`,
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await interaction.reply({
                            content: `${emoji.status.error} Failed to update favorites!`,
                            flags: MessageFlags.Ephemeral
                        });
                    }
                } catch (removeError) {
                    console.error('Remove favorite error:', removeError);
                    await interaction.reply({
                        content: `${emoji.status.error} An error occurred while removing favorite!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
        } catch (error) {
            console.error('Favorites command error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `${emoji.status.error} An error occurred!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
