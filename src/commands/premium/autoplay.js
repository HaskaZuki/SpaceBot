const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggles autoplay (Premium)'),
    
    async execute(interaction) {
        const UserSettings = require('../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        if (!userSettings || !userSettings.isPremium) return interaction.reply({ content: '🚫 This feature requires **User Premium**.', flags: 64 });
        
        const GuildConfig = require('../../models/GuildConfig');
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });

        config.autoPlay = !config.autoPlay;
        await config.save();
        await interaction.reply({ content: `Autoplay is now **${config.autoPlay ? 'ON' : 'OFF'}**.`, ephemeral: true });
    },
};