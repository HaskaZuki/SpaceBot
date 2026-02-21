const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const https = require('https');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lyrics')
        .setDescription('Get lyrics for the current song or search for a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name to search for (optional, uses current song if empty)')
                .setRequired(false)),
    
    category: 'everyone',

    async execute(interaction) {
        await interaction.deferReply();
        
        const query = interaction.options.getString('query');
        const guildId = interaction.guild.id;

        let searchTitle = '';
        let searchArtist = '';

        if (query) {
            searchTitle = query;
        } else {
            const playerState = musicPlayer.players.get(guildId);
            if (!playerState || !playerState.currentTrack) {
                return interaction.editReply('❌ No song is currently playing! Use `/lyrics query:song name` to search.');
            }
            
            const track = playerState.currentTrack;
            searchTitle = cleanTrackTitle(track.info.title);
            searchArtist = track.info.author || '';
        }

        try {
            const lyrics = await fetchLyrics(searchTitle, searchArtist);
            
            if (!lyrics) {
                return interaction.editReply(`❌ No lyrics found for: **${searchTitle}**\n\nTry a more specific search with \`/lyrics query:artist - song\``);
            }

            const chunks = splitLyrics(lyrics.plainLyrics, 3900);
            
            const embed = new EmbedBuilder()
                .setColor('#FFFF64')
                .setTitle(`🎵 ${lyrics.trackName}`)
                .setAuthor({ name: lyrics.artistName })
                .setDescription(chunks[0])
                .setFooter({ 
                    text: `${chunks.length > 1 ? `Page 1/${chunks.length} • ` : ''}Source: ${lyrics.source || 'LRCLIB'}` 
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            for (let i = 1; i < chunks.length; i++) {
                const pageEmbed = new EmbedBuilder()
                    .setColor('#FFFF64')
                    .setDescription(chunks[i])
                    .setFooter({ text: `Page ${i + 1}/${chunks.length}` });
                
                await interaction.followUp({ embeds: [pageEmbed] });
            }

        } catch (error) {
            console.error('Lyrics error:', error);
            await interaction.editReply('❌ Failed to fetch lyrics. Please try again.');
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

function splitLyrics(text, maxLength) {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    let current = '';
    const lines = text.split('\n');
    
    for (const line of lines) {
        if ((current + '\n' + line).length > maxLength) {
            chunks.push(current.trim());
            current = line;
        } else {
            current += (current ? '\n' : '') + line;
        }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
}

function fetchLyrics(title, artist) {
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

                    const best = results.find(r => r.plainLyrics) || results[0];
                    if (!best || !best.plainLyrics) return resolve(null);

                    resolve({
                        trackName: best.trackName || title,
                        artistName: best.artistName || artist || 'Unknown',
                        plainLyrics: best.plainLyrics,
                        syncedLyrics: best.syncedLyrics || null,
                        duration: best.duration || 0,
                        source: 'LRCLIB'
                    });
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}