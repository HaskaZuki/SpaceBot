const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Seek to a position in the track')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Position to seek to (e.g. 1:30 or 90)')
                .setRequired(true)),
    
    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        
        if (!playerState || !playerState.player) {
            return interaction.reply({ content: 'No music is playing.', flags: 64 });
        }

        let totalSeconds = 0;
        if (timeInput.includes(':')) {
            const parts = timeInput.split(':').map(Number);
            if (parts.length === 2) {
                totalSeconds = (parts[0] * 60) + parts[1];
            } else if (parts.length === 3) {
                totalSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
            }
        } else {
            totalSeconds = parseInt(timeInput);
        }

        if (isNaN(totalSeconds) || totalSeconds < 0) {
            return interaction.reply({ content: 'Invalid time format. Use `1:30` or `90`.', flags: 64 });
        }

        playerState.player.seekTo(totalSeconds * 1000);

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formatted = `${minutes}:${String(seconds).padStart(2, '0')}`;

        await interaction.reply({ content: `⏩ Seeked to **${formatted}**`, flags: 64 });
    },
};