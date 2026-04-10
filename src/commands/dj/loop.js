const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Cycle loop mode: Off → Track → Queue → Off'),
    category: 'dj',
    async execute(interaction) {
        const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
        if (!voiceCheck.valid) {
            return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
        }
        const guildId = interaction.guild.id;
        if (!musicPlayer.players.get(guildId)?.currentTrack) {
            return interaction.reply({
                content: `${emoji.status.error} Nothing is currently playing!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const mode = await musicPlayer.setLoop(interaction.client, guildId);
        const loopDisplay = emoji.getLoopDisplay(mode);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`Loop mode set to: **${loopDisplay}**`)
            .setFooter({ text: `Changed by ${interaction.user.displayName || interaction.user.username}` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
