const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('fix')
        .setDescription('Tries to fix voice connection issues')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (playerState && playerState.player) {
            playerState.player.disconnect();
            musicPlayer.players.delete(guildId);
            await interaction.reply({ content: '🔧 Voice connection reset.', flags: 64 });
        } else {
            await interaction.reply({ content: 'No active player to fix.', flags: 64 });
        }
    },
};
