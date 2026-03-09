const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription('Jump to a specific timestamp in the current track')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Timestamp to seek to (e.g. 1:30 or 90)')
                .setRequired(true)),
    category: 'dj',
    async execute(interaction) {
        const timeInput = interaction.options.getString('time');
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player || !playerState.currentTrack) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
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
            return interaction.reply({
                content: `${emoji.status.error} Invalid time format. Use \`1:30\` or \`90\`.`,
                flags: MessageFlags.Ephemeral
            });
        }
        const trackDurationSeconds = Math.floor((playerState.currentTrack.info.length || 0) / 1000);
        if (totalSeconds > trackDurationSeconds) {
            return interaction.reply({
                content: `${emoji.status.error} Timestamp exceeds track duration.`,
                flags: MessageFlags.Ephemeral
            });
        }
        playerState.player.seekTo(totalSeconds * 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formatted = `${minutes}:${String(seconds).padStart(2, '0')}';
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription('${emoji.controls.play} Seeked to **${formatted}** in **${playerState.currentTrack.info.title}**.`)
            .setFooter({ text: `Seeked by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};