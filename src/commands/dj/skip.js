const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track'),
    category: 'dj',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.currentTrack) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const skippedTitle = playerState.currentTrack.info.title;
        const nextTrack = playerState.queue?.[0];
        await musicPlayer.skipTrack(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(
                `${emoji.controls.next} Skipped **${skippedTitle}**` +
                (nextTrack ? `\n\nNow playing: **${nextTrack.info.title}**` : '\n\nThe queue is now empty.')
            )
            .setFooter({ text: `Skipped by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
