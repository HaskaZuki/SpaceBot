
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
