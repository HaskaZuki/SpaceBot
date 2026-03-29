const { SlashCommandBuilder } = require('discord.js');
const filterCmd = require('./filter');
module.exports = {
    data: new SlashCommandBuilder().setName('bassboost').setDescription('Applies Bassboost filter (Premium)'),
    category: 'premium',
    async execute(interaction) {
        interaction.options.getString = () => 'bassboost';
        await filterCmd.execute(interaction);
    },
};
