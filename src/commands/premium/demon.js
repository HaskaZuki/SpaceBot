const { SlashCommandBuilder } = require('discord.js');
const filterCmd = require('./filter');
module.exports = {
    data: new SlashCommandBuilder().setName('demon').setDescription('Applies Demon filter (Premium)'),
    category: 'premium',
    async execute(interaction) {
        interaction.options.getString = () => 'demon';
        await filterCmd.execute(interaction);
    },
};
