const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String },
    avatar: { type: String },    theme: { type: String, default: 'dark', enum: ['dark', 'light', 'auto'] },
    language: { type: String, default: 'en' },
    compactMode: { type: Boolean, default: false },    notifications: {
        nowPlaying: { type: Boolean, default: false },
        queueUpdates: { type: Boolean, default: false },
        desktop: { type: Boolean, default: false }
    },    trackHistory: { type: Boolean, default: true },
    shareActivity: { type: Boolean, default: false },    favoriteServers: [{ type: String }],
    favoriteTracks: [{ type: Object }],    recentlyPlayed: [{ type: Object }],    totalPlays: { type: Number, default: 0 },
    totalListeningTime: { type: Number, default: 0 },     playlists: [{
        name: { type: String, required: true },
        tracks: [{ type: Object }],
        createdAt: { type: Date, default: Date.now }
    }],
    maxPlaylists: { type: Number, default: 10 },    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },    lastActive: { type: Date, default: Date.now }
}, {
    timestamps: true 
});

module.exports = mongoose.model('UserSettings', UserSettingsSchema);
