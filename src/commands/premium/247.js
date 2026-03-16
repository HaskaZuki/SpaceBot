const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggles 24/7 mode (Premium Only)'),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return interaction.editReply('Guild config not found.');
        const UserSettings = require('../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        if (!userSettings || !userSettings.isPremium) {
            return interaction.editReply('🚫 You must be a **Premium User** to toggle 24/7 mode.');
        }
        config.alwaysOn = !config.alwaysOn;
        await config.save();
        await interaction.editReply(`24/7 Mode is now **${config.alwaysOn ? 'ENABLED' : 'DISABLED'}**.`);
    },
};
