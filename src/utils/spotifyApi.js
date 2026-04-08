const https = require('https');

let spotifyToken = null;
let spotifyTokenExpiry = 0;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
    if (spotifyToken && Date.now() < spotifyTokenExpiry - 60000) {
        return spotifyToken;
    }
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    return new Promise((resolve, reject) => {
        const body = 'grant_type=client_credentials';
        const req = https.request({
            hostname: 'accounts.spotify.com',
            path: '/api/token',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(body),
            },
        }, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.access_token) {
                        spotifyToken = json.access_token;
                        spotifyTokenExpiry = Date.now() + json.expires_in * 1000;
                        resolve(spotifyToken);
                    } else {
                        reject(new Error('No access_token in Spotify response'));
                    }
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function spotifyGet(path, token) {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.spotify.com',
            path,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        }, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

/**
 * Fetches all tracks from a Spotify playlist directly via API.
 * Returns array of { title, artist, isrc } objects.
 */
async function fetchSpotifyPlaylist(playlistId) {
    const token = await getSpotifyToken();
    const meta = await spotifyGet(`/v1/playlists/${playlistId}?fields=name,tracks.total`, token);
    const playlistName = meta.name || 'Spotify Playlist';
    const tracks = [];
    let offset = 0;
    const limit = 100;
    while (true) {
        const page = await spotifyGet(
            `/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}&fields=items(track(name,artists,external_ids,duration_ms)),next`,
            token
        );
        if (!page.items) break;
        for (const item of page.items) {
            if (!item.track || item.track.duration_ms === null) continue;
            const artist = item.track.artists?.[0]?.name || '';
            const title = item.track.name || '';
            const isrc = item.track.external_ids?.isrc || null;
            tracks.push({ title, artist, isrc });
        }
        if (!page.next) break;
        offset += limit;
    }
    return { playlistName, tracks };
}

module.exports = { fetchSpotifyPlaylist };
