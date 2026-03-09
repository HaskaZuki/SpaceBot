const emoji = require('./utils/emojiConfig');
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
module.exports = {
    connect: async () => {
        try {
            const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/spacebot';
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 15000
            });
            console.log('${emoji.status.success} Connected to MongoDB');
            mongoose.connection.on('error', (err) => {
                console.error('${emoji.status.error} MongoDB Connection Error:', err);
            });
            mongoose.connection.on('disconnected', () => {
                console.warn(`${emoji.status.error} MongoDB Disconnected. Attempting to reconnect...`);
            });
        } catch (error) {
            console.error(`${emoji.status.error} Failed to connect to MongoDB:`, error.message);
        }
    }
};
