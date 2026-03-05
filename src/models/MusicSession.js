const mongoose = require('mongoose');

const musicSessionSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    voiceChannelId: { type: String, required: true },
    textChannelId: { type: String, default: null },
    currentTrack: { type: mongoose.Schema.Types.Mixed, default: null },
    queue: { type: [mongoose.Schema.Types.Mixed], default: [] },
    loop: { type: String, default: 'off', enum: ['off', 'track', 'queue'] },
    volume: { type: Number, default: 100 },
    savedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MusicSession', musicSessionSchema);
