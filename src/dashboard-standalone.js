/**
 * Start only the web dashboard (no Discord bot).
 * Use when the bot won't spawn (e.g. 429): keeps port 3001 up so /health and site work.
 * Stop this when running the full bot (shard.js).
 */
require('dotenv').config();
const database = require('./database');

const stubClient = {
    guilds: { cache: { get: () => null, size: 0, reduce: (_, acc) => acc } },
    shard: {
        fetchClientValues: () => Promise.resolve([0]),
        broadcastEval: () => Promise.resolve([0])
    },
    user: null,
    dashboardIO: null
};

(async () => {
    await database.connect();
    require('./web/server')(stubClient);
    console.log('[Dashboard standalone] Running without bot. Stop this when using pm2 start shard.js');
})();
