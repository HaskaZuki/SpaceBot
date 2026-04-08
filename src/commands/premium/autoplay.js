const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Toggles autoplay (Premium)'),
    category: 'premium',
    async execute(interaction) {
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return interaction.reply({ content: 'Guild config not found.', flags: MessageFlags.Ephemeral });
        config.autoPlay = !config.autoPlay;
        await config.save();
        await interaction.reply({ content: `${config.autoPlay ? '🟢' : '🔴'} Autoplay is now **${config.autoPlay ? 'ON' : 'OFF'}**.` });
    },
};
