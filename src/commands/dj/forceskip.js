const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceskip')
        .setDescription('Force-skip the current track immediately (DJ only, bypasses vote)'),
    category: 'dj',
    async execute(interaction) {
        const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
        if (!voiceCheck.valid) {
            return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
        }
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
                `${emoji.controls.next} Force-skipped **${skippedTitle}**` +
                (nextTrack ? `\n\nNow playing: **${nextTrack.info.title}**` : '\n\nThe queue is now empty.')
            )
            .setFooter({ text: `Force-skipped by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed] });
    },
};
