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
            ? '🔴 LIVE STREAM'
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
            } catch (_) { /* user left / uncached */ }
        }
        if (!requestedByText) requestedByText = 'Someone';

        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setAuthor({ name: `${emoji.animated.disc} Now Playing` })
            .setTitle(track.info.title)
            .setURL(track.info.uri || null)
            .setDescription(
                `${progressBar}\n\n` +
                `**Artist:** ${track.info.author || 'Unknown'}\n` +
                `**Source:** ${sourceIcon} ${sourceName.charAt(0).toUpperCase() + sourceName.slice(1)}\n` +
                `**Loop:** ${loopDisplay}\n` +
                `**Queue:** ${queueLength} track${queueLength !== 1 ? 's' : ''} remaining`
            )
            .setFooter({
                text: `Requested by ${requestedByText}`,
                iconURL: requestedByIcon || undefined
            })
            .setTimestamp();

        if (track.info.artworkUrl) {
            embed.setThumbnail(track.info.artworkUrl);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
