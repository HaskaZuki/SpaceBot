const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('grab')
        .setDescription('Save the current song to your DMs'),
    
    category: 'everyone',

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);

        if (!playerState || !playerState.currentTrack) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', flags: 64 });
        }

        const track = playerState.currentTrack;
        const duration = musicPlayer.formatTime(track.info.length);

        const embed = new EmbedBuilder()
            .setColor('#10B981')
            .setTitle('💾 Song Saved!')
            .setDescription(`**[${track.info.title}](${track.info.uri})**`)
            .addFields(
                { name: '🎤 Artist', value: track.info.author || 'Unknown', inline: true },
                { name: '⏱️ Duration', value: duration, inline: true },
                { name: '🔊 Source', value: (track.info.sourceName || 'Unknown').charAt(0).toUpperCase() + (track.info.sourceName || 'unknown').slice(1), inline: true },
                { name: '🏠 Server', value: interaction.guild.name, inline: true }
            )
            .setFooter({ text: `Saved from #${interaction.channel.name}` })
            .setTimestamp();

        if (track.info.artworkUrl) {
            embed.setThumbnail(track.info.artworkUrl);
        }

        try {
            await interaction.user.send({ embeds: [embed] });
            await interaction.reply({ content: '✅ Song info sent to your DMs! Check your messages.', flags: 64 });
        } catch {
            await interaction.reply({ 
                content: '❌ Couldn\'t send DM! Make sure your DMs are open for this server.', 
                flags: 64 
            });
        }
    },
};
