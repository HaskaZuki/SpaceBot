const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('songinfo')
        .setDescription('Get info about current song'),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const track = musicPlayer.players.get(guildId)?.currentTrack;
        if (!track) return interaction.reply({ content: 'Nothing playing.', flags: 64 });
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setTitle(track.info.title)
            .setURL(track.info.uri)
            .setDescription(`Author: ${track.info.author}\nDuration: ${musicPlayer.formatTime(track.info.length)}`)
            .setThumbnail(track.info.artworkUrl || null)
            .setFooter({ text: `Requested by ${track.requestedByName || 'Unknown'}` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
