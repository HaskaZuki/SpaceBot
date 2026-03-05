const mongoose = require('mongoose');
const PlayHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    guildId: { type: String, required: true, index: true },
    trackTitle: { type: String, required: true },
    trackUrl: { type: String, default: null },
    artist: { type: String, default: 'Unknown' },
    duration: { type: Number, default: 0 },
    source: { type: String, default: 'unknown' },
    timestamp: { type: Date, default: Date.now, index: true }
});
PlayHistorySchema.index({ userId: 1, guildId: 1, timestamp: -1 });
module.exports = mongoose.model('PlayHistory', PlayHistorySchema);
