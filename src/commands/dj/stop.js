const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        await musicPlayer.stopPlayer(interaction.client, guildId);
        await interaction.reply({ content: '⏹️ Stopped the music and cleared the queue.', flags: 64 });
    },
};
