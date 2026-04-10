const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('replay')
        .setDescription('Restart the current track from the beginning'),
    category: 'dj',
    async execute(interaction) {
        const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
        if (!voiceCheck.valid) {
            return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
        }
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player || !playerState.currentTrack) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
        }
        playerState.player.seekTo(0);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.controls.play} Replaying **${playerState.currentTrack.info.title}** from the beginning.`)
            .setFooter({ text: `Replayed by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
