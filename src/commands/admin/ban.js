const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from using the bot')
        .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.reply({ content: 'User banned from bot usage (Mock).', flags: 64 });
    },
};