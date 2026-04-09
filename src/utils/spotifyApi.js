const unfetch = require('isomorphic-unfetch');
const spotifyUrlInfo = require('spotify-url-info')(unfetch);

/**
 * Fetches all tracks from a Spotify playlist using spotify-url-info.
 * No OAuth credentials needed — uses Spotify's internal API.
 * Always returns fresh data (no caching).
 * Returns { playlistName, tracks: [{ title, artist }] }
 */
async function fetchSpotifyPlaylist(playlistId) {
    const url = `https://open.spotify.com/playlist/${playlistId}`;
    const data = await spotifyUrlInfo.getData(url);

    if (!data) {
        throw new Error('No data returned from Spotify');
    }

    const playlistName = data.name || 'Spotify Playlist';
    const items = data.trackList || [];

    const tracks = items
        .filter(item => item?.title && item?.isPlayable)
        .map(item => ({
            title: item.title,
            artist: item.subtitle || '',
        }));

    console.log(`[Spotify] Fetched playlist "${playlistName}" with ${tracks.length} tracks`);
    return { playlistName, tracks };
}

module.exports = { fetchSpotifyPlaylist };
