let spotifyToken = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken() {
    if (spotifyToken && Date.now() < spotifyTokenExpiry - 60000) {
        return spotifyToken;
    }
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    const json = await res.json();
    if (!json.access_token) {
        throw new Error(`Spotify token error: ${JSON.stringify(json)}`);
    }
    spotifyToken = json.access_token;
    spotifyTokenExpiry = Date.now() + json.expires_in * 1000;
    return spotifyToken;
}

/**
 * Fetches all tracks from a Spotify playlist directly via the Web API.
 * Returns { playlistName, tracks: [{ title, artist }] }
 */
async function fetchSpotifyPlaylist(playlistId) {
    const token = await getSpotifyToken();

    const metaRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}?fields=name`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const meta = await metaRes.json();
    const playlistName = meta.name || 'Spotify Playlist';

    const tracks = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=next,items(track(name,artists,duration_ms))`;

    while (url) {
        const pageRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const page = await pageRes.json();
        if (!page.items) break;
        for (const item of page.items) {
            if (!item.track || item.track.duration_ms === null) continue;
            const artist = item.track.artists?.[0]?.name || '';
            const title = item.track.name || '';
            if (title) tracks.push({ title, artist });
        }
        url = page.next || null;
    }

    return { playlistName, tracks };
}

module.exports = { fetchSpotifyPlaylist };
