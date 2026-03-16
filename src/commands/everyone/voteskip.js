const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('voteskip')
        .setDescription('Vote to skip the current song'),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player) {
            return interaction.reply({ content: 'Nothing playing.', flags: 64 });
        }
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: 'Join voice first.', flags: 64 });
        await interaction.reply('Vote registered! Skipping the current track.');
        await musicPlayer.skipTrack(interaction.client, guildId);
    },
};
