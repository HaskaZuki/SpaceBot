const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const https = require('https');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics-sync')
        .setDescription('View synchronized lyrics with the current track (Premium)'),
    
    category: 'premium',

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);

        if (!playerState?.currentTrack) {
            return interaction.reply({ content: `${emoji.status.error} No track is currently playing!`, flags: 64 });
        }

        await interaction.deferReply();

        const track = playerState.currentTrack;
        const player = playerState.player;
        const position = player?.position || 0;
        const cleanTitle = cleanTrackTitle(track.info.title);
        const artist = track.info.author || '';

        try {
            const lyricsData = await fetchSyncedLyrics(cleanTitle, artist);

            if (!lyricsData || !lyricsData.syncedLyrics) {
                return interaction.editReply(
                    `${emoji.status.error} No synced lyrics available for: **${track.info.title}**\n\n` +
                    `Try \`/lyrics\` for plain lyrics instead.`
                );
            }

            const lines = parseLRC(lyricsData.syncedLyrics);
            if (lines.length === 0) {
                return interaction.editReply(`${emoji.status.error} Synced lyrics could not be parsed.`);
            }

            const currentLineIndex = findCurrentLine(lines, position);
            const display = buildSyncedDisplay(lines, currentLineIndex, 7);

            const progressBar = `${musicPlayer.createProgressBar(position, track.info.length)} \`${musicPlayer.formatTime(position)} / ${musicPlayer.formatTime(track.info.length)}\``;

            const embed = new EmbedBuilder()
                .setColor('#8B5CF6')
                .setAuthor({ name: `${emoji.animated.notes} Synced Lyrics` })
                .setTitle(lyricsData.trackName)
                .setDescription(`${progressBar}\n\n${display}`)
                .setFooter({ text: `${lyricsData.artistName} • Use this command again to refresh • Source: LRCLIB` })
                .setTimestamp();

            if (track.info.artworkUrl) {
                embed.setThumbnail(track.info.artworkUrl);
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Lyrics-sync error:', error);
            await interaction.editReply(`${emoji.status.error} Failed to fetch synced lyrics. Please try again.`);
        }
    },
};

function cleanTrackTitle(title) {
    return title
        .replace(/\(Official\s*(Music\s*)?Video\)/gi, '')
        .replace(/\(Official\s*Audio\)/gi, '')
        .replace(/\(Lyric\s*Video\)/gi, '')
        .replace(/\(Lyrics?\)/gi, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\|.*$/g, '')
        .replace(/ft\.?\s*.*/gi, '')
        .replace(/feat\.?\s*.*/gi, '')
        .trim();
}

function parseLRC(lrcText) {
    const lines = [];
    const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/g;
    let match;

    while ((match = regex.exec(lrcText)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = parseInt(match[3].padEnd(3, '0'), 10);
        const time = (minutes * 60 + seconds) * 1000 + ms;
        const text = match[4].trim();
        if (text) {
            lines.push({ time, text });
        }
    }

    return lines.sort((a, b) => a.time - b.time);
}

function findCurrentLine(lines, positionMs) {
    let index = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].time <= positionMs) {
            index = i;
        } else {
            break;
        }
    }
    return index;
}

function buildSyncedDisplay(lines, currentIndex, contextLines = 7) {
    const halfContext = Math.floor(contextLines / 2);
    let start = Math.max(0, currentIndex - halfContext);
    let end = Math.min(lines.length, start + contextLines);
    
    if (end - start < contextLines) {
        start = Math.max(0, end - contextLines);
    }

    const displayLines = [];
    for (let i = start; i < end; i++) {
        const timestamp = formatTimestamp(lines[i].time);
        if (i === currentIndex) {
            displayLines.push(`**${emoji.controls.play} \`${timestamp}\` ${lines[i].text}**`);
        } else if (i < currentIndex) {
            displayLines.push(`ㅤ\`${timestamp}\` ~~${lines[i].text}~~`);
        } else {
            displayLines.push(`ㅤ\`${timestamp}\` ${lines[i].text}`);
        }
    }

    return displayLines.join('\n');
}

function formatTimestamp(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function fetchSyncedLyrics(title, artist) {
    return new Promise((resolve, reject) => {
        const params = new URLSearchParams();
        if (artist) params.append('artist_name', artist);
        params.append('track_name', title);
        
        const url = `https://lrclib.net/api/search?${params.toString()}`;
        
        const options = {
            headers: { 'User-Agent': 'SpaceBot/1.0.0' }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (!Array.isArray(results) || results.length === 0) {
                        return resolve(null);
                    }

                    const best = results.find(r => r.syncedLyrics) || null;
                    if (!best) return resolve(null);

                    resolve({
                        trackName: best.trackName || title,
                        artistName: best.artistName || artist || 'Unknown',
                        syncedLyrics: best.syncedLyrics,
                        plainLyrics: best.plainLyrics || null,
                        duration: best.duration || 0
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}
