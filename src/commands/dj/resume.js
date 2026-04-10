const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume paused playback'),
    category: 'dj',
    async execute(interaction) {
        const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
        if (!voiceCheck.valid) {
            return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
        }
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
        }
        if (!playerState.player.paused) {
            return interaction.reply({
                content: `${emoji.status.error} The player is already playing. Use \`/pause\` to pause.`,
                flags: MessageFlags.Ephemeral
            });
        }
        playerState.player.setPaused(false);
        musicPlayer.updateDashboard(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.controls.play} Playback **resumed**.`)
            .setFooter({ text: `Resumed by ${interaction.user.displayName || interaction.user.username}` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
