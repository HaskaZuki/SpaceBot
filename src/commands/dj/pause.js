const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current track'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        try {
            const isPaused = await musicPlayer.pauseResume(interaction.client, guildId);
            await interaction.reply({ content: isPaused ? 'Paused the music.' : 'Resumed the music.', flags: 64 });
        } catch (error) {
            await interaction.reply({ content: 'Failed to pause/resume.', flags: 64 });
        }
    },
};
