const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('requester')
        .setDescription('Toggle showing requester')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        let config = await GuildConfig.findOne({ guildId });
        if (!config) config = await GuildConfig.create({ guildId });
        config.showRequester = !config.showRequester;
        await config.save();
        await interaction.reply(`Show requester: ${config.showRequester}`);
    },
};