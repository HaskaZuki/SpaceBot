const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../../utils/musicPlayer');
const storage = require('../../../utils/storage');
const { validatePlayerState } = require('../../../utils/validators');
const emoji = require('../../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('favorite')
        .setDescription('Add current track to your favorites'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const UserSettings = require('../../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId });
        if (!userSettings || !userSettings.isPremium) {
             return interaction.reply({
                 content: `${emoji.premium.star} **Favorites are a Premium-Only feature!**\n\nUpgrade your account to Premium to save unlimited tracks.`,
                 flags: MessageFlags.Ephemeral
             });
        }
        try {
            const playerState = musicPlayer.players.get(guildId);
            const playerCheck = validatePlayerState(playerState, { requireTrack: true });
            if (!playerCheck.valid) {
                return interaction.reply({ 
                    content: `${emoji.status.error} ${playerCheck.error}`,
                    flags: MessageFlags.Ephemeral
                });
            }
            const currentTrack = playerState.currentTrack;
            let userFavorites = await storage.getUser('favorites', userId);
            if (!userFavorites) {
                userFavorites = {
                    userId,
                    favorites: [],
                    maxFavorites: 100
                };
            }
            const alreadyFavorited = userFavorites.favorites.some(
                fav => fav.info.uri === currentTrack.info.uri
            );
            if (alreadyFavorited) {
                return interaction.reply({
                    content: `${emoji.premium.star} **${currentTrack.info.title}** is already in your favorites!`,
                    flags: MessageFlags.Ephemeral
                });
            }
            if (userFavorites.favorites.length >= userFavorites.maxFavorites) {
                return interaction.reply({
                    content: `${emoji.status.error} Favorites limit reached (${userFavorites.maxFavorites})!\n\nUse \`/unfavorite\` to remove some tracks first.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            try {
                userFavorites.favorites.push({
                    encoded: currentTrack.encoded,
                    info: currentTrack.info,
                    addedAt: new Date().toISOString()
                });
                const success = await storage.setUser('favorites', userId, userFavorites);
                if (success) {
                    await interaction.reply({
                        content: `${emoji.premium.star} Added to favorites: **${currentTrack.info.title}**\n\n` +
                                `Total favorites: ${userFavorites.favorites.length}/${userFavorites.maxFavorites}`
                    });
                } else {
                    await interaction.reply({
                        content: `${emoji.status.error} Failed to save favorite!`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            } catch (saveError) {
                console.error('Save favorite error:', saveError);
                await interaction.reply({
                    content: `${emoji.status.error} An error occurred while saving your favorite!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Favorite command error:', error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: `${emoji.status.error} An error occurred!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
