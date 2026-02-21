const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../../utils/musicPlayer');
const storage = require('../../../utils/storage');
const { validatePlayerState } = require('../../../utils/validators');

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
                 content: '🔒 **Favorites are a Premium-Only feature!**\n\nUpgrade your account to Premium to save unlimited tracks.',
                 ephemeral: true
             });
        }
        
        try {
            const playerState = musicPlayer.players.get(guildId);
            const playerCheck = validatePlayerState(playerState, { requireTrack: true });
            if (!playerCheck.valid) {
                return interaction.reply({ 
                    content: `❌ ${playerCheck.error}`,
                    ephemeral: true
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
                    content: `⭐ **${currentTrack.info.title}** is already in your favorites!`,
                    ephemeral: true
                });
            }
            if (userFavorites.favorites.length >= userFavorites.maxFavorites) {
                return interaction.reply({
                    content: `❌ Favorites limit reached (${userFavorites.maxFavorites})!\n\nUse \`/unfavorite\` to remove some tracks first.`,
                    ephemeral: true
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
                        content: `⭐ Added to favorites: **${currentTrack.info.title}**\n\n` +
                                `Total favorites: ${userFavorites.favorites.length}/${userFavorites.maxFavorites}`
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Failed to save favorite!',
                        ephemeral: true
                    });
                }
            } catch (saveError) {
                console.error('Save favorite error:', saveError);
                await interaction.reply({
                    content: '❌ An error occurred while saving your favorite!',
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('Favorite command error:', error);
            
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ An error occurred!',
                    ephemeral: true
                });
            }
        }
    },
};
