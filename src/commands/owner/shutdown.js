const emoji = require('../../utils/emojiConfig');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('[OWNER] Gracefully shutdown the bot'),
    async execute(interaction) {
        const client = interaction.client;
        const shardInfo = client.shard ? 'Shutting down all ${client.shard.count} shards...' : 'Shutting down...';
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle(`${emoji.status.error} Shutting Down...`)
            .setDescription(`**${shardInfo}**\n\nBot is shutting down gracefully. Goodbye!`)
            .addFields(
                { name: 'Initiated By', value: '${interaction.user.tag}', inline: true },
                { name: 'Sharding', value: client.shard ? 'Shard ${client.shard.ids[0]}/${client.shard.count}' : 'No Sharding', inline: true }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [embed], flags: 64 });
        const musicPlayer = require('../../utils/musicPlayer');
        for (const [guildId, state] of musicPlayer.players) {
            if (state.player) {
                state.player.disconnect();
            }
        }
        if (client.shard) {
            await client.shard.broadcastEval(() => {
                const mp = require('./utils/musicPlayer');
                for (const [gid, state] of mp.players) {
                    if (state.player) state.player.disconnect();
                }
            }).catch(() => {});
        }
        setTimeout(() => {
            process.exit(0);
        }, 2000);
    },
};
