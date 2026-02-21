const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Disconnects the bot from the voice channel'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);

        if (playerState && playerState.player) {
            playerState.player.disconnect();
            musicPlayer.players.delete(guildId);
            await interaction.reply({ content: 'Disconnected from voice channel.', flags: 64 });
        } else {
            await interaction.reply({ content: 'I am not connected to a voice channel.', flags: 64 });
        }
    },
};
