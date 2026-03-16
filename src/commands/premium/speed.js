const { SlashCommandBuilder } = require('discord.js');
const filterCmd = require('./filter');
module.exports = {
    data: new SlashCommandBuilder().setName('speed').setDescription('Applies Speed filter (Premium)'),
    async execute(interaction) {
        interaction.options.getString = () => 'nightcore';
        await filterCmd.execute(interaction);
    },
};
