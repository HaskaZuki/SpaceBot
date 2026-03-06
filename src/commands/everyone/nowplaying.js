const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show detailed info about the currently playing track'),
    category: 'everyone',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.currentTrack) {
            return interaction.reply({ content: `${emoji.status.error} Nothing is currently playing!`, flags: 64 });
        }
        const track = playerState.currentTrack;
        const player = playerState.player;
        const position = player?.position || 0;
        const duration = track.info.length || 0;
        const isStream = track.info.isStream || false;
        const sourceName = track.info.sourceName || 'default';
        const sourceIcon = emoji.getSourceIcon(sourceName);
        const progressBar = isStream
            ? '🔴 **LIVE STREAM**'
            : `${musicPlayer.createProgressBar(position, duration)} \`${musicPlayer.formatTime(position)} / ${musicPlayer.formatTime(duration)}\``;
        const loopMode = playerState.loop || 'off';
        const loopDisplay = emoji.getLoopDisplay(loopMode);
        const queueLength = playerState.queue?.length || 0;
        let requestedByText = track.requestedByName || null;
        let requestedByIcon = track.requestedByAvatar || null;
        if (!requestedByText && track.requestedBy) {
            try {
                const user = interaction.client.users.cache.get(track.requestedBy) || await interaction.client.users.fetch(track.requestedBy);
                if (user) {
                    requestedByText = user.displayName || user.username;
                    requestedByIcon = user.displayAvatarURL({ size: 32 });
                }
            } catch (_) { }
        }
        if (!requestedByText) requestedByText = 'Someone';
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setAuthor({ name: 'SpaceMusic', iconURL: 'https://i.imgur.com/hHKiFvO.png' })
            .setTitle(`${emoji.animated.disc} Now Playing`)
            .setURL(track.info.uri || null)
            .setDescription(`**[${track.info.title}](${track.info.uri || '#'})**`)
            .addFields(
                { name: 'Progress', value: progressBar, inline: false },
                { name: 'Artist', value: track.info.author || 'Unknown', inline: true },
                { name: 'Source', value: `${sourceIcon} ${sourceName}`, inline: true },
                { name: 'Loop', value: loopDisplay, inline: true },
                { name: 'Queue', value: `${queueLength} track${queueLength !== 1 ? 's' : ''}`, inline: true }
            )
            .setFooter({ text: `Requested by ${requestedByText}` });
        if (track.info.artworkUrl) {
            embed.setThumbnail(track.info.artworkUrl);
        }
        await interaction.reply({ embeds: [embed] });
    },
};
