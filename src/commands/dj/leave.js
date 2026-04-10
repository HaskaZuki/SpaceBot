const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnect the bot from the voice channel'),
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
                content: `${emoji.status.error} I'm not connected to any voice channel!`,
                flags: MessageFlags.Ephemeral
            });
        }
        playerState.player.disconnect();
        musicPlayer.players.delete(guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.status.success} Disconnected from the voice channel. Goodbye!`)
            .setFooter({ text: `Disconnected by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed] });
    },
};
