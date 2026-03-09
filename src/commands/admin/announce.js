const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Toggles whether the bot announces new songs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!config) config = await GuildConfig.create({ guildId: interaction.guild.id });
        config.announceSongs = !config.announceSongs;
        await config.save();
        await interaction.reply({ 
            content: `Song announcements are now **${config.announceSongs ? 'ENABLED' : 'DISABLED'}**.`,
            flags: 64 
        });
    },
};