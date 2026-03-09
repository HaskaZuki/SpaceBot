const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('[OWNER] Restart bot shards')
        .addSubcommand(sub => sub
            .setName('all')
            .setDescription('Restart all shards'))
        .addSubcommand(sub => sub
            .setName('shard')
            .setDescription('Restart a specific shard')
            .addIntegerOption(opt => opt
                .setName('id')
                .setDescription('Shard ID to restart')
                .setRequired(true))),
    async execute(interaction) {
        const client = interaction.client;
        const subcommand = interaction.options.getSubcommand();
        if (!client.shard) {
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Not Running in Sharded Mode')
                .setDescription('The bot is not running with sharding. Use '/shutdown' instead.')
                .addFields({
                    name: 'Tip',
                    value: 'Start the bot with 'node shard.js' to enable sharding.'
                })
                .setTimestamp();
            return interaction.reply({ embeds: [embed], flags: 64 });
        }
        if (subcommand === 'all') {
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Restarting All Shards...')
                .setDescription('Restarting all **${client.shard.count}** shards. This may take a moment.')
                .addFields(
                    { name: 'Initiated By', value: interaction.user.tag, inline: true },
                    { name: 'Total Shards', value: '${client.shard.count}', inline: true },
                    { name: 'Expected Downtime', value: '10-30 seconds', inline: true }
                )
                .setFooter({ text: 'All shards will reconnect automatically' })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], flags: 64 });
            setTimeout(async () => {
                try {
                    await client.shard.respawnAll({
                        shardDelay: 5000,
                        respawnDelay: 500,
                        timeout: 30000
                    });
                } catch (error) {
                    console.error('Restart error:', error);
                }
            }, 1000);
        } else if (subcommand === 'shard') {
            const shardId = interaction.options.getInteger('id');
            if (shardId < 0 || shardId >= client.shard.count) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Invalid Shard ID')
                    .setDescription(`${emoji.status.error} Shard ID must be between **0** and **${client.shard.count - 1}**.`)
                    .addFields({
                        name: 'Current Shards',
                        value: 'Total: ${client.shard.count} (IDs: 0-${client.shard.count - 1})`
                    })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            const embed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('Restarting Shard ${shardId}...`)
                .setDescription(`Restarting shard **${shardId}** of **${client.shard.count}**.')
                .addFields(
                    { name: 'Initiated By', value: interaction.user.tag, inline: true },
                    { name: 'Shard ID', value: '${shardId}`, inline: true },
                    { name: 'Expected Downtime', value: '5-10 seconds', inline: true }
                )
                .setFooter({ text: 'Other shards will remain online' })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], flags: 64 });
            setTimeout(async () => {
                try {
                    await client.shard.respawnAll({
                        shardDelay: 5000,
                        respawnDelay: 500,
                        timeout: 30000,
                        shards: [shardId]
                    });
                } catch (error) {
                    console.error(`Shard ${shardId} restart error:`, error);
                }
            }, 1000);
        }
    },
};
