const express = require('express');
const router = express.Router();
const GuildConfig = require('../../models/GuildConfig');
const UserSettings = require('../../models/UserSettings');
const mongoose = require('mongoose');

module.exports = (client) => {
    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        res.status(401).json({ message: 'Unauthorized' });
    };

    const checkPremium = async (req, res, next) => {
        try {
            const userSettings = await UserSettings.findOne({ userId: req.user.id });
            const now = new Date();
            const isPremium = userSettings?.isPremium && 
                (!userSettings.premiumExpiresAt || userSettings.premiumExpiresAt > now);
            req.isPremium = isPremium;
            next();
        } catch (err) {
            req.isPremium = false;
            next();
        }
    };

    const requirePremium = async (req, res, next) => {
        try {
            const userSettings = await UserSettings.findOne({ userId: req.user.id });
            const now = new Date();
            const isPremium = userSettings?.isPremium && 
                (!userSettings.premiumExpiresAt || userSettings.premiumExpiresAt > now);
            if (!isPremium) {
                return res.status(403).json({ message: 'Premium required', requiresPremium: true });
            }
            req.isPremium = true;
            next();
        } catch (err) {
            return res.status(403).json({ message: 'Premium check failed', requiresPremium: true });
        }
    };

    router.get('/stats', async (req, res) => {
        try {
            const promises = [
                client.shard.fetchClientValues('guilds.cache.size'),
                client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            ];

            const [guilds, users] = await Promise.all(promises);
            const totalGuilds = guilds.reduce((acc, guildCount) => acc + guildCount, 0);
            const totalUsers = users.reduce((acc, userCount) => acc + userCount, 0);

            res.json({
                servers: totalGuilds,
                users: totalUsers,
                commands: client.commands.size,
                uptime: client.uptime
            });
        } catch (err) {
            res.json({
                servers: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
                commands: client.commands.size,
                uptime: client.uptime
            });
        }
    });

    router.get('/status', async (req, res) => {
        try {
            const dbStatus = mongoose.connection.readyState === 1;
            const lavalinkStatus = client.manager?.nodes?.some(n => n.connected) || false;

            res.json({
                api: true,
                database: dbStatus,
                lavalink: lavalinkStatus,
                uptime: client.uptime,
                ping: client.ws.ping,
                servers: client.guilds.cache.size,
                users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)
            });
        } catch (err) {
            res.json({ api: true, database: false, lavalink: false });
        }
    });

    router.get('/guilds', checkAuth, async (req, res) => {
        try {
            const userGuilds = req.user.guilds || [];
            const botGuilds = client.guilds.cache;
            
            const manageableGuilds = userGuilds.filter(g => {
                const hasPerm = (BigInt(g.permissions) & 0x20n) === 0x20n;
                return hasPerm && botGuilds.has(g.id);
            });

            res.json(manageableGuilds);
        } catch (err) {
            console.error('Error fetching guilds:', err);
            res.status(500).json({ message: err.message });
        }
    });

    router.get('/user/servers', checkAuth, async (req, res) => {
        try {
            const userGuilds = req.user.guilds || [];
            const botGuilds = client.guilds.cache;
            
            const adminGuilds = userGuilds.filter(g => {
                const hasAdmin = (BigInt(g.permissions) & 0x8n) === 0x8n;
                return hasAdmin && botGuilds.has(g.id);
            });

            res.json(adminGuilds);
        } catch (err) {
            console.error('Error fetching user servers:', err);
            res.status(500).json({ message: err.message });
        }
    });

    router.get('/user/premium', checkAuth, async (req, res) => {
        try {
            const userSettings = await UserSettings.findOne({ userId: req.user.id });
            const now = new Date();
            
            if (!userSettings) {
                return res.json({
                    isPremium: false,
                    tier: 'free',
                    expiresAt: null,
                    maxPlaylists: 3,
                    maxQueueSize: 50,
                    canUseFilters: false,
                    canControlVolume: false
                });
            }

            const isPremium = userSettings.isPremium && 
                (!userSettings.premiumExpiresAt || userSettings.premiumExpiresAt > now);

            if (userSettings.isPremium && userSettings.premiumExpiresAt && userSettings.premiumExpiresAt <= now) {
                userSettings.isPremium = false;
                await userSettings.save();
            }

            res.json({
                isPremium,
                tier: isPremium ? 'pro' : 'free',
                expiresAt: userSettings.premiumExpiresAt,
                maxPlaylists: isPremium ? 100 : 3,
                maxQueueSize: isPremium ? 500 : 50,
                canUseFilters: isPremium,
                canControlVolume: isPremium,
                totalPlays: userSettings.totalPlays || 0,
                totalListeningTime: userSettings.totalListeningTime || 0
            });
        } catch (err) {
            console.error('Error fetching premium status:', err);
            res.status(500).json({ message: err.message });
        }
    });

    router.get('/guild/:id', checkAuth, async (req, res) => {
        const guildId = req.params.id;
        
        const hasAccess = req.user.guilds?.find(g => g.id === guildId && (BigInt(g.permissions) & 0x20n) === 0x20n);
        if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }
            
            const guild = client.guilds.cache.get(guildId);
            
            let roles = [];
            let channels = [];
            let guildName = 'Unknown Server';
            let guildIcon = null;
            let memberCount = 0;

            if (guild) {
                guildName = guild.name;
                guildIcon = guild.iconURL({ dynamic: true, size: 128 });
                memberCount = guild.memberCount;
                
                roles = guild.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
                    .sort((a, b) => b.position - a.position);
                
                channels = guild.channels.cache
                    .filter(c => c.type === 0)
                    .map(c => ({ id: c.id, name: c.name }))
                    .sort((a, b) => a.name.localeCompare(b.name));
            }
            
            res.json({
                success: true,
                guild: {
                    id: guildId,
                    name: guildName,
                    icon: guildIcon,
                    memberCount
                },
                config: config,
                roles: roles,
                channels: channels
            });
        } catch (err) {
            console.error('Error fetching guild config:', err);
            res.status(500).json({ message: err.message });
        }
    });

    router.post('/guild/:id/config', checkAuth, async (req, res) => {
        const guildId = req.params.id;
        const hasAccess = req.user.guilds?.find(g => g.id === guildId && (BigInt(g.permissions) & 0x20n) === 0x20n);
        if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }

            const {
                volume, alwaysOn, djRole, djRoleId,
                language, maxSongDuration, maxSongCount,
                autoPlay, allowPlaylists, showRequester,
                announceSongs, deleteSongAnnouncements, allowedVoiceChannels
            } = req.body;

            const isPremium = config.isPremium || false;
            if (volume !== undefined) config.volume = isPremium ? (parseInt(volume) || 50) : 50;
            if (djRole !== undefined) config.djRoleId = djRole || null;
            if (djRoleId !== undefined) config.djRoleId = djRoleId || null;
            if (language !== undefined) config.language = language;
            if (maxSongDuration !== undefined) config.maxSongDuration = parseInt(maxSongDuration) || 0;
            if (maxSongCount !== undefined) config.maxSongCount = parseInt(maxSongCount) || 0;
            if (allowPlaylists !== undefined) config.allowPlaylists = allowPlaylists;
            if (showRequester !== undefined) config.showRequester = showRequester;
            if (announceSongs !== undefined) config.announceSongs = announceSongs;
            if (deleteSongAnnouncements !== undefined) config.deleteSongAnnouncements = deleteSongAnnouncements;
            if (allowedVoiceChannels !== undefined) config.allowedVoiceChannels = allowedVoiceChannels ? [allowedVoiceChannels] : [];

            if (alwaysOn !== undefined) config.alwaysOn = isPremium ? alwaysOn : false;
            if (autoPlay !== undefined) config.autoPlay = isPremium ? autoPlay : false;

            await config.save();
            
            res.json({ 
                success: true, 
                message: 'Configuration saved!',
                config: config 
            });
        } catch (err) {
            console.error('Error saving guild config:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.patch('/guild/:id', checkAuth, async (req, res) => {
        const guildId = req.params.id;
        const hasAccess = req.user.guilds?.find(g => g.id === guildId && (BigInt(g.permissions) & 0x20n) === 0x20n);
        if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }

            const {
                volume, alwaysOn, djRoleId,
                language, maxSongDuration, maxSongCount,
                autoPlay, allowPlaylists, showRequester,
                announceSongs, deleteSongAnnouncements, allowedVoiceChannels
            } = req.body;

            const isPremium = config.isPremium || false;
            if (volume !== undefined) config.volume = isPremium ? (parseInt(volume) || 50) : 50;
            if (djRoleId !== undefined) config.djRoleId = djRoleId || null;
            if (language !== undefined) config.language = language;
            if (maxSongDuration !== undefined) config.maxSongDuration = parseInt(maxSongDuration) || 0;
            if (maxSongCount !== undefined) config.maxSongCount = parseInt(maxSongCount) || 0;
            if (allowPlaylists !== undefined) config.allowPlaylists = allowPlaylists;
            if (showRequester !== undefined) config.showRequester = showRequester;
            if (announceSongs !== undefined) config.announceSongs = announceSongs;
            if (deleteSongAnnouncements !== undefined) config.deleteSongAnnouncements = deleteSongAnnouncements;
            if (allowedVoiceChannels !== undefined) config.allowedVoiceChannels = allowedVoiceChannels ? [allowedVoiceChannels] : [];

            if (isPremium) {
                if (alwaysOn !== undefined) config.alwaysOn = alwaysOn;
                if (autoPlay !== undefined) config.autoPlay = autoPlay;
            }

            await config.save();
            
            res.json({ 
                success: true, 
                message: 'Configuration saved!',
                config: config 
            });
        } catch (err) {
            console.error('Error saving guild config:', err);
            res.status(500).json({ message: err.message });
        }
    });

    router.get('/user/settings', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                settings = await UserSettings.create({
                    userId: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar
                });
            }

            const now = new Date();
            const isPremium = settings.isPremium && 
                (!settings.premiumExpiresAt || settings.premiumExpiresAt > now);

            res.json({ 
                success: true, 
                settings: {
                    ...settings.toObject(),
                    isPremium
                }
            });
        } catch (err) {
            console.error('Error fetching settings:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.post('/user/settings', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                settings = await UserSettings.create({
                    userId: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar
                });
            }

            const {
                theme,
                language,
                compactMode,
                notifications,
                trackHistory,
                shareActivity,
                audioQuality
            } = req.body;

            const now = new Date();
            const isPremium = settings.isPremium && 
                (!settings.premiumExpiresAt || settings.premiumExpiresAt > now);

            if (theme !== undefined) settings.theme = theme;
            if (language !== undefined) settings.language = language;
            if (compactMode !== undefined) settings.compactMode = compactMode;
            if (notifications !== undefined) settings.notifications = { ...settings.notifications, ...notifications };
            if (trackHistory !== undefined) settings.trackHistory = trackHistory;
            if (shareActivity !== undefined) settings.shareActivity = shareActivity;

            if (audioQuality !== undefined) {
                const premiumQualities = ['128', '256'];
                if (premiumQualities.includes(audioQuality) && !isPremium) {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Premium required for HD audio quality',
                        requiresPremium: true 
                    });
                }
            }

            settings.lastActive = Date.now();
            await settings.save();

            res.json({ success: true, message: 'Settings saved!', settings });
        } catch (err) {
            console.error('Error saving settings:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.get('/user/playlists', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                settings = await UserSettings.create({
                    userId: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar
                });
            }

            const now = new Date();
            const isPremium = settings.isPremium && 
                (!settings.premiumExpiresAt || settings.premiumExpiresAt > now);

            res.json({ 
                success: true, 
                playlists: settings.playlists || [],
                maxPlaylists: isPremium ? 100 : 3,
                isPremium
            });
        } catch (err) {
            console.error('Error fetching playlists:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.post('/user/playlists', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                settings = await UserSettings.create({
                    userId: req.user.id,
                    username: req.user.username,
                    avatar: req.user.avatar
                });
            }

            const { name } = req.body;
            if (!name || !name.trim()) {
                return res.status(400).json({ success: false, message: 'Playlist name is required' });
            }

            const now = new Date();
            const isPremium = settings.isPremium && 
                (!settings.premiumExpiresAt || settings.premiumExpiresAt > now);
            const maxPlaylists = isPremium ? 100 : 3;

            if ((settings.playlists || []).length >= maxPlaylists) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Playlist limit reached (${maxPlaylists}). ${!isPremium ? 'Upgrade to Premium for more!' : ''}`,
                    requiresPremium: !isPremium
                });
            }

            const newPlaylist = {
                id: new mongoose.Types.ObjectId().toString(),
                name: name.trim(),
                tracks: [],
                createdAt: new Date()
            };

            if (!settings.playlists) settings.playlists = [];
            settings.playlists.push(newPlaylist);
            await settings.save();

            res.json({ success: true, playlist: newPlaylist });
        } catch (err) {
            console.error('Error creating playlist:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.delete('/user/playlists/:playlistId', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                return res.status(404).json({ success: false, message: 'No playlists found' });
            }

            const playlistId = req.params.playlistId;
            const originalLength = (settings.playlists || []).length;
            settings.playlists = (settings.playlists || []).filter(p => 
                p.id !== playlistId && p._id?.toString() !== playlistId
            );

            if (settings.playlists.length === originalLength) {
                return res.status(404).json({ success: false, message: 'Playlist not found' });
            }

            await settings.save();
            res.json({ success: true, message: 'Playlist deleted' });
        } catch (err) {
            console.error('Error deleting playlist:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.get('/user/analytics', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                return res.json({
                    success: true,
                    totalPlays: 0,
                    totalListeningTime: 0,
                    recentlyPlayed: [],
                    favoriteServers: [],
                    playlistCount: 0
                });
            }

            res.json({
                success: true,
                totalPlays: settings.totalPlays || 0,
                totalListeningTime: settings.totalListeningTime || 0,
                recentlyPlayed: (settings.recentlyPlayed || []).slice(0, 20),
                favoriteTracks: (settings.favoriteTracks || []).slice(0, 20),
                favoriteServers: settings.favoriteServers || [],
                playlistCount: (settings.playlists || []).length,
                memberSince: settings.createdAt
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.post('/user/favorites/server/:guildId', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                settings = await UserSettings.create({ userId: req.user.id });
            }

            const guildId = req.params.guildId;
            if (!settings.favoriteServers.includes(guildId)) {
                settings.favoriteServers.push(guildId);
                await settings.save();
            }

            res.json({ success: true, favorites: settings.favoriteServers });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.delete('/user/favorites/server/:guildId', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                return res.json({ success: true, favorites: [] });
            }

            const guildId = req.params.guildId;
            settings.favoriteServers = settings.favoriteServers.filter(id => id !== guildId);
            await settings.save();

            res.json({ success: true, favorites: settings.favoriteServers });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.get('/user/recently-played', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                return res.json({ success: true, tracks: [] });
            }
            res.json({ success: true, tracks: settings.recentlyPlayed || [] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

    router.post('/user/clear/:type', checkAuth, async (req, res) => {
        try {
            let settings = await UserSettings.findOne({ userId: req.user.id });
            if (!settings) {
                return res.json({ success: true, message: 'No data to clear' });
            }

            const type = req.params.type;
            switch (type) {
                case 'history':
                    settings.recentlyPlayed = [];
                    break;
                case 'favorites':
                    settings.favoriteTracks = [];
                    settings.favoriteServers = [];
                    break;
                case 'all':
                    settings.recentlyPlayed = [];
                    settings.favoriteTracks = [];
                    settings.favoriteServers = [];
                    settings.totalPlays = 0;
                    settings.totalListeningTime = 0;
                    break;
            }

            await settings.save();
            res.json({ success: true, message: `${type} cleared successfully` });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });

    return router;
};
