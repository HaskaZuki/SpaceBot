const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        await musicPlayer.skipTrack(interaction.client, guildId);
        await interaction.reply({ content: '⏭️ Skipped the track.', flags: 64 });
    },
};
