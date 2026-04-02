const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');

const PLATFORM_CONFIG = {
    spotify: {
        name: 'Spotify',
        icon: '<:spotify:1475168210423906484>',
        color: 0x1DB954,
        searchUrl: (title, artist) =>
            `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`).replace(/%20/g, '%20')}`,
        openUrl: 'https://open.spotify.com',
    },
    youtube: {
        name: 'YouTube Music',
        icon: '<:youtube:1475168468746637566>',
        color: 0xFF0000,
        searchUrl: (title, artist) =>
            `https://music.youtube.com/search?q=${encodeURIComponent(`${title} ${artist}`)}`,
        openUrl: 'https://music.youtube.com',
    },
    apple: {
        name: 'Apple Music',
        icon: '<:appless:1475168309333721270>',
        color: 0xFC3C44,
        searchUrl: (title, artist) =>
            `https://music.apple.com/search?term=${encodeURIComponent(`${title} ${artist}`)}`,
        openUrl: 'https://music.apple.com',
    },
};

const MAX_DISPLAY_TRACKS = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export-playlist')
        .setDescription('Export a playlist as search links for Spotify, YouTube Music, or Apple Music')
        .addStringOption(opt =>
            opt.setName('playlist')
                .setDescription('Playlist name to export')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(opt =>
            opt.setName('platform')
                .setDescription('Target platform')
                .setRequired(true)
                .addChoices(
                    { name: 'Spotify', value: 'spotify' },
                    { name: 'YouTube Music', value: 'youtube' },
                    { name: 'Apple Music', value: 'apple' }
                )),

    async execute(interaction) {
        const playlistName = interaction.options.getString('playlist');
        const platform = interaction.options.getString('platform');
        const storage = require('../../utils/storage');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userData = await storage.getUser('playlists', interaction.user.id);
        if (!userData || !userData.playlists?.length) {
            return interaction.editReply({
                content: `${emoji.status.error} You have no playlists saved. Use \`/playlist add\` to get started.`,
            });
        }

        const playlist = userData.playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
        if (!playlist) {
            return interaction.editReply({
                content: `${emoji.status.error} Playlist **${playlistName}** not found.\nUse \`/playlist list\` to see your saved playlists.`,
            });
        }

        const tracks = playlist.tracks || [];
        if (tracks.length === 0) {
            return interaction.editReply({
                content: `${emoji.status.error} Playlist **${playlistName}** is empty.`,
            });
        }

        const cfg = PLATFORM_CONFIG[platform];
        const displayTracks = tracks.slice(0, MAX_DISPLAY_TRACKS);
        const remaining = tracks.length - MAX_DISPLAY_TRACKS;

        const trackLines = displayTracks.map((track, i) => {
            const title = track.title || track.info?.title || 'Unknown';
            const artist = track.author || track.info?.author || '';
            const searchLink = cfg.searchUrl(title, artist);
            const label = artist ? `${title} — ${artist}` : title;
            return `\`${String(i + 1).padStart(2)}\` [${label}](${searchLink})`;
        });

        if (remaining > 0) {
            trackLines.push(`\n*…and ${remaining} more track${remaining === 1 ? '' : 's'}*`);
        }

        const embed = new EmbedBuilder()
            .setColor(cfg.color)
            .setAuthor({ name: `${cfg.name} Export — ${playlist.name}` })
            .setDescription(
                `${cfg.icon} **${tracks.length} track${tracks.length === 1 ? '' : 's'}** ready to search on ${cfg.name}\n\n` +
                `Click any track name to search it directly on ${cfg.name}.\n\n` +
                trackLines.join('\n')
            )
            .setFooter({
                text: `Playlist: ${playlist.name} • ${tracks.length} tracks • Click links to open ${cfg.name}`,
            })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(`Open ${cfg.name}`)
                .setURL(cfg.openUrl)
                .setStyle(ButtonStyle.Link)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    },

    async autocomplete(interaction) {
        const storage = require('../../utils/storage');
        const userData = await storage.getUser('playlists', interaction.user.id);
        if (!userData) return interaction.respond([]);
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = (userData.playlists || [])
            .filter(p => p.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(p => ({ name: `${p.name} (${(p.tracks || []).length} tracks)`, value: p.name }));
        await interaction.respond(choices);
    },
};
