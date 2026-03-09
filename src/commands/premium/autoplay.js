const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserSettings = require('../../models/UserSettings');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggles autoplay (Premium)'),
    async execute(interaction) {
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        config.autoPlay = !config.autoPlay;
        await config.save();
        await interaction.reply({ content: 'Autoplay is now **${config.autoPlay ? 'ON' : 'OFF'}**.', flags: MessageFlags.Ephemeral });
    },
};