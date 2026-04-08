const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the player volume 0-200% (Premium)')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Volume amount (0-200)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(200)),
    category: 'premium',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const volume = interaction.options.getInteger('amount');
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player) {
            return interaction.reply({ content: `${emoji.status.error} No music is playing.`, flags: MessageFlags.Ephemeral });
        }
        playerState.player.setGlobalVolume(volume);
        await interaction.reply({ content: `${emoji.animated.notes} Volume set to **${volume}%**` });
    },
};
