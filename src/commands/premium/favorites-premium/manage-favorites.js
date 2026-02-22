const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../../utils/musicPlayer');
const storage = require('../../../utils/storage');
const { formatTime } = require('../../../utils/validators');

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
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();
        const UserSettings = require('../../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId });
        
        if (!userSettings || !userSettings.isPremium) {
             return interaction.reply({
                 content: '🔒 **Favorites are a Premium-Only feature!**\n\nUpgrade your account to Premium to manage favorites.',
                 flags: MessageFlags.Ephemeral
             });
        }
        
        try {
            const userFavorites = await storage.getUser('favorites', userId);
            
            if (!userFavorites || userFavorites.favorites.length === 0) {
                return interaction.reply({
                    content: '❌ You don\'t have any favorites yet!\n\nUse `/favorite` while a track is playing to add it.',
                    flags: MessageFlags.Ephemeral
                });
            }
            
            if (subcommand === 'list') {
                const favorites = userFavorites.favorites;
                const itemsPerPage = 10;
                const totalPages = Math.ceil(favorites.length / itemsPerPage);
                const page = 0;
                
                const startIdx = page * itemsPerPage;
                const endIdx = Math.min(startIdx + itemsPerPage, favorites.length);
                const pageFavorites = favorites.slice(startIdx, endIdx);
                
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle(`⭐ Your Favorites (${favorites.length} tracks)`)
                    .setDescription(
                        pageFavorites.map((fav, idx) => 
                            `**${startIdx + idx + 1}.** [${fav.info.title}](${fav.info.uri})\n` +
                            `└ ${fav.info.author} • ${formatTime(fav.info.length)}`
                        ).join('\n\n')
                    )
                    .setFooter({ text: `Use /favorites play to play all favorites` })
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                
            } else if (subcommand === 'play') {
                const guildId = interaction.guild.id;
                const member = interaction.member;
                
                if (!member.voice?.channel) {
                    return interaction.reply({
                        content: '❌ You must be in a voice channel to play favorites!',
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
                        content: `⭐ Added **${addedCount}** favorites to the queue!`
                    });
                    
                } catch (playError) {
                    console.error('Play favorites error:', playError);
                    await interaction.editReply({
                        content: '❌ An error occurred while adding favorites to queue!'
                    });
                }
                
            } else if (subcommand === 'remove') {
                const position = interaction.options.getInteger('position');
                const index = position - 1;
                
                if (index < 0 || index >= userFavorites.favorites.length) {
                    return interaction.reply({
                        content: `❌ Invalid position! You have ${userFavorites.favorites.length} favorites.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
                
                try {
                    const removed = userFavorites.favorites.splice(index, 1)[0];
                    const success = await storage.setUser('favorites', userId, userFavorites);
                    
                    if (success) {
                        await interaction.reply({
                            content: `🗑️ Removed from favorites: **${removed.info.title}**\n\n` +
                                    `Remaining favorites: ${userFavorites.favorites.length}`,
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await interaction.reply({
                            content: '❌ Failed to update favorites!',
                            flags: MessageFlags.Ephemeral
                        });
                    }
                } catch (removeError) {
                    console.error('Remove favorite error:', removeError);
                    await interaction.reply({
                        content: '❌ An error occurred while removing favorite!',
                        flags: MessageFlags.Ephemeral
                    });
                }
            }
            
        } catch (error) {
            console.error('Favorites command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
