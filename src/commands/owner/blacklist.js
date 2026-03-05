const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('[OWNER] Manage server blacklist')
        .addSubcommand(sub => sub
            .setName('add')
            .setDescription('Blacklist a server')
            .addStringOption(opt => opt.setName('guild_id').setDescription('Server ID').setRequired(true))
            .addStringOption(opt => opt.setName('reason').setDescription('Reason').setRequired(false)))
        .addSubcommand(sub => sub
            .setName('remove')
            .setDescription('Remove server from blacklist')
            .addStringOption(opt => opt.setName('guild_id').setDescription('Server ID').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('check')
            .setDescription('Check if server is blacklisted')
            .addStringOption(opt => opt.setName('guild_id').setDescription('Server ID').setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.options.getString('guild_id');
        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }
            switch (subcommand) {
                case 'add': {
                    const reason = interaction.options.getString('reason') || 'No reason provided';
                    config.isBlacklisted = true;
                    config.blacklistReason = reason;
                    await config.save();
                    let leftGuild = false;
                    if (interaction.client.shard) {
                        const results = await interaction.client.shard.broadcastEval(async (c, ctx) => {
                            const guild = c.guilds.cache.get(ctx.guildId);
                            if (guild) {
                                await guild.leave();
                                return true;
                            }
                            return false;
                        }, { context: { guildId } });
                        leftGuild = results.some(r => r === true);
                    } else {
                        const guild = interaction.client.guilds.cache.get(guildId);
                        if (guild) {
                            await guild.leave();
                            leftGuild = true;
                        }
                    }
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Server Blacklisted')
                        .setDescription(`${emoji.status.error} Server has been added to blacklist`)
                        .addFields(
                            { name: 'Server ID', value: guildId, inline: true },
                            { name: 'Reason', value: reason, inline: true },
                            { name: 'Left Server', value: leftGuild ? 'Yes' : 'Not in server', inline: true }
                        )
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
                case 'remove': {
                    config.isBlacklisted = false;
                    config.blacklistReason = null;
                    await config.save();
                    const embed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('Server Removed from Blacklist')
                        .setDescription(`${emoji.status.success} Server has been removed from blacklist`)
                        .addFields({ name: 'Server ID', value: guildId })
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
                case 'check': {
                    const embed = new EmbedBuilder()
                        .setColor(config.isBlacklisted ? '#ff0000' : '#00ff00')
                        .setTitle(config.isBlacklisted ? 'Server is Blacklisted' : 'Server is NOT Blacklisted')
                        .setDescription(config.isBlacklisted ? `${emoji.status.error} This server is blacklisted` : `${emoji.status.success} This server is not blacklisted`)
                        .addFields(
                            { name: 'Server ID', value: guildId, inline: true },
                            { name: 'Status', value: config.isBlacklisted ? 'Blacklisted' : 'Clear', inline: true }
                        );
                    if (config.isBlacklisted && config.blacklistReason) {
                        embed.addFields({ name: 'Reason', value: config.blacklistReason });
                    }
                    embed.setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply('Failed to manage blacklist.');
        }
    },
};
