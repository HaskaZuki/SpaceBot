const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('removedupes')
        .setDescription('Remove duplicate tracks from the queue'),
    category: 'everyone',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        if (!playerState || playerState.queue.length === 0) {
            return interaction.reply({
                content: `${emoji.status.error} The queue is empty!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const originalCount = playerState.queue.length;
        const seen = new Set();
        playerState.queue = playerState.queue.filter(track => {
            const key = track.info?.uri || track.info?.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        const removed = originalCount - playerState.queue.length;
        if (removed === 0) {
            return interaction.reply({
                content: `${emoji.status.success} No duplicate tracks found in the queue!`,
                flags: MessageFlags.Ephemeral
            });
        }
        musicPlayer.updateDashboard(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor(`#7C3AED`)
            .setDescription(
                `${emoji.status.success} Removed **${removed}** duplicate track${removed !== 1 ? 's' : ''} from the queue.\n` +
                `Queue now has **${playerState.queue.length}** track${playerState.queue.length !== 1 ? 's' : ''}.`
            )
            .setFooter({ text: `Cleaned by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
