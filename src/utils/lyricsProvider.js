
const https = require('https');
async function fetchFromLyricsOvh(artist, title) {
    return new Promise((resolve) => {
        try {
            const cleanArtist = encodeURIComponent(artist.trim());
            const cleanTitle = encodeURIComponent(title.trim());
            const url = 'https://api.lyrics.ovh/v1/${cleanArtist}/${cleanTitle}';
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.lyrics) {
                            resolve(json.lyrics.trim());
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        console.error('Error parsing lyrics.ovh response:', error);
                        resolve(null);
                    }
                });
            }).on('error', (error) => {
                console.error('Error fetching from lyrics.ovh:', error);
                resolve(null);
            });
        } catch (error) {
            console.error('Error in fetchFromLyricsOvh:', error);
            resolve(null);
        }
    });
}
function cleanTitle(title) {
    if (!title) return '';
    return title
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/\s*-\s*.*$/,'')
        .replace(/feat\.|ft\.|featuring/gi, '')
        .replace(/remix|cover|live|acoustic|official|video|audio/gi, '')
        .trim();
}
function cleanArtist(artist) {
    if (!artist) return '';
    return artist
        .split(',')[0]
        .split('&')[0]
        .split('feat')[0]
        .split('ft.')[0]
        .trim();
}
async function getLyrics(artist, title) {
    try {
        const cleanedArtist = cleanArtist(artist);
        const cleanedTitle = cleanTitle(title);
        if (!cleanedArtist || !cleanedTitle) {
            return { error: 'Invalid artist or title' };
        }
        console.log('[Lyrics] Fetching lyrics for: ${cleanedArtist} - ${cleanedTitle}');
        const lyrics = await fetchFromLyricsOvh(cleanedArtist, cleanedTitle);
        if (lyrics) {
            const truncated = lyrics.length > 4000 
                ? lyrics.substring(0, 4000) + '\n\n...(lyrics truncated)'
                : lyrics;
            return {
                lyrics: truncated,
                source: 'lyrics.ovh',
                artist: cleanedArtist,
                title: cleanedTitle
            };
        }
        return { error: 'Lyrics not found' };
    } catch (error) {
        console.error('Error getting lyrics:', error);
        return { error: 'Failed to fetch lyrics' };
    }
}
async function searchLyrics(query) {
    try {
        const parts = query.split('-').map(p => p.trim());
        let artist, title;
        if (parts.length >= 2) {
            artist = parts[0];
            title = parts.slice(1).join(' ');
        } else {
            artist = 'Unknown';
            title = query;
        }
        return await getLyrics(artist, title);
    } catch (error) {
        console.error('Error searching lyrics:', error);
        return { error: 'Failed to search lyrics' };
    }
}
module.exports = {
    getLyrics,
    searchLyrics,
    cleanTitle,
    cleanArtist
};
