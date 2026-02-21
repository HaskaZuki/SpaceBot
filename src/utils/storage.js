

const UserSettings = require('../models/UserSettings');

module.exports = {
    
    getUser: async (collection, userId) => {
        try {
            if (collection === 'playlists') {
                let settings = await UserSettings.findOne({ userId });
                if (!settings) return null;                return {
                    userId: settings.userId,
                    playlists: settings.playlists || [],
                    maxPlaylists: settings.maxPlaylists || 10
                };
            }
            return null;
        } catch (error) {
            console.error(`[Storage] Error getting ${collection} for ${userId}:`, error);
            return null;
        }
    },

    
    setUser: async (collection, userId, userData) => {
        try {
            if (collection === 'playlists') {                await UserSettings.findOneAndUpdate(
                    { userId },
                    { 
                        userId,
                        playlists: userData.playlists,
                        maxPlaylists: userData.maxPlaylists
                    },
                    { upsert: true, new: true }
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error(`[Storage] Error setting ${collection} for ${userId}:`, error);
            return false;
        }
    }
};
