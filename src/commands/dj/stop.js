const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playback and clear the queue'),
    category: 'dj',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const queueCount = playerState.queue?.length || 0;
        await musicPlayer.stopPlayer(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor(`#7C3AED`)
            .setDescription(
                `${emoji.controls.pause} Playback **stopped** and queue cleared.` +
                (queueCount > 0 ? ` Removed **${queueCount}** track${queueCount !== 1 ? 's' : ''}.' : '')
            )
            .setFooter({ text: `Stopped by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
