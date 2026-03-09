const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanup')
        .setDescription('[ADMIN] Cleans up bot player states across all shards')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const client = interaction.client;
        const guildId = interaction.guild.id;
        await musicPlayer.stopPlayer(interaction.client, guildId);
        let totalCleaned = 0;
        if (client.shard) {
            const results = await client.shard.broadcastEval(async (c) => {
                const mp = require('./utils/musicPlayer');
                let cleaned = 0;
                for (const [gId, state] of mp.players) {
                    const guild = c.guilds.cache.get(gId);
                    if (!guild || !state.player) {
                        mp.players.delete(gId);
                        cleaned++;
                    }
                }
                return cleaned;
            }).catch(() => [0]);
            totalCleaned = results.reduce((acc, count) => acc + count, 0);
        }
        const shardInfo = client.shard ? ' (${client.shard.count} shards checked)' : '';
        await interaction.editReply({ 
            content: ` **Cleanup complete!${shardInfo}**\n${emoji.status.success} Player state reset\n🗑️ Cleaned up ${totalCleaned} inactive players`,
        });
    },
};
