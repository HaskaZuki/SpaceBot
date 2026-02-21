const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('replay')
        .setDescription('Replay current song'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const player = musicPlayer.players.get(guildId)?.player;
        if (player) {
            player.seekTo(0);
            await interaction.reply('Replaying track.');
        } else {
            await interaction.reply('Nothing playing.');
        }
    },
};