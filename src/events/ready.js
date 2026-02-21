const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    const shardId = client.shard ? client.shard.ids[0] : 0;
    const totalShards = client.shard ? client.shard.count : 1;
    const guildCount = client.guilds.cache.size;
    
    console.log(`Ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Shard ${shardId}/${totalShards} | ${guildCount} servers`);

    client.user.setPresence({
        activities: [{ 
            name: `Music on Shard ${shardId} | ${guildCount} servers`, 
            type: ActivityType.Listening 
        }],
        status: 'online',
    });
  },
};
