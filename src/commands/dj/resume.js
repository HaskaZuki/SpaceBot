const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes the paused music'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        try {
            const playerState = musicPlayer.players.get(guildId);
            if (playerState && playerState.player && playerState.player.paused) {
                playerState.player.setPaused(false);
                musicPlayer.updateDashboard(interaction.client, guildId);
                await interaction.reply({ content: 'Resumed the music.', flags: 64 });
            } else {
                await interaction.reply({ content: 'Music is not paused or not playing.', flags: 64 });
            }
        } catch (error) {
            await interaction.reply({ content: 'Failed to resume.', flags: 64 });
        }
    },
};
