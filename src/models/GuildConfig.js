const mongoose = require('mongoose');

const GuildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true, index: true },

    language: { type: String, default: 'en' },

    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null },

    djRoleId: { type: String, default: null },
    allowedVoiceChannels: [{ type: String }],
    musicChannelId: { type: String, default: null },
    musicMessageId: { type: String, default: null },

    maxSongDuration: { type: Number, default: 0 },
    maxSongCount: { type: Number, default: 0 },

    alwaysOn: { type: Boolean, default: false },
    autoPlay: { type: Boolean, default: false },
    volume: { type: Number, default: 50 },
    allowPlaylists: { type: Boolean, default: true },
    showRequester: { type: Boolean, default: true },
    announceSongs: { type: Boolean, default: true },
    deleteSongAnnouncements: { type: Boolean, default: false },
    loopMode: { type: String, default: 'off', enum: ['off', 'track', 'queue', 'autoplay'] },

    bannedUsers: [{ type: String }],
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('GuildConfig', GuildConfigSchema);
