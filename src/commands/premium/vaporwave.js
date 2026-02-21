const { SlashCommandBuilder } = require('discord.js');
const filterCmd = require('./filter');

module.exports = {
    data: new SlashCommandBuilder().setName('vaporwave').setDescription('Applies Vaporwave filter (Premium)'),
    async execute(interaction) {
        interaction.options.getString = () => 'vaporwave'; 
        await filterCmd.execute(interaction);
    },
};