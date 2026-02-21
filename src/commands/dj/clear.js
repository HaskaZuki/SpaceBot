const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears the music queue'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        
        if (!playerState || playerState.queue.length === 0) {
            return interaction.reply({ content: 'The queue is already empty!', flags: 64 });
        }

        playerState.queue = [];
        musicPlayer.updateDashboard(interaction.client, guildId);
        
        await interaction.reply({ content: 'Cleared the queue!', flags: 64 });
    },
};
