const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggles 24/7 mode (Premium Only)'),
    category: 'premium',
    async execute(interaction) {
        await interaction.deferReply();
        const config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) return interaction.editReply('Guild config not found.');
        config.alwaysOn = !config.alwaysOn;
        await config.save();
        await interaction.editReply(`${config.alwaysOn ? '🟢' : '🔴'} 24/7 Mode is now **${config.alwaysOn ? 'ENABLED' : 'DISABLED'}**.`);
    },
};
