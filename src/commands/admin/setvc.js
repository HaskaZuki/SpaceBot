const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setvc')
        .setDescription('Manage voice channel restriction')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Restrict bot to a specific voice channel')
                .addChannelOption(opt => opt
                    .setName('channel')
                    .setDescription('Voice channel to restrict bot to')
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unset')
                .setDescription('Remove voice channel restriction'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current voice channel restriction'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }
            if (subcommand === 'view') {
                if (!config.allowedVoiceChannels || config.allowedVoiceChannels.length === 0) {
                    return interaction.reply({ 
                        content: '${emoji.animated.notes} No voice channel restriction is set.\nBot can join any voice channel.\nUse `/setvc set` to restrict to one channel.', 
                        flags: 64 
                    });
                }
                const channelId = config.allowedVoiceChannels[0];
                const channel = interaction.guild.channels.cache.get(channelId);
                if (!channel) {
                    return interaction.reply({ 
                        content: '${emoji.status.error} Restricted voice channel no longer exists.\nUse `/setvc set` to configure a new one.', 
                        flags: 64 
                    });
                }
                return interaction.reply({ 
                    content: `${emoji.animated.notes} Bot is restricted to: ${channel}`, 
                    flags: 64 
                });
            }
            if (subcommand === 'unset') {
                if (!config.allowedVoiceChannels || config.allowedVoiceChannels.length === 0) {
                    return interaction.reply({ 
                        content: `${emoji.status.error} No voice channel restriction is currently set.`, 
                        flags: 64 
                    });
                }
                config.allowedVoiceChannels = [];
                await config.save();
                return interaction.reply({ 
                    content: `${emoji.status.success} Voice channel restriction removed. Bot can now join any voice channel.`, 
                    ephemeral: false 
                });
            }
            if (subcommand === 'set') {
                const channel = interaction.options.getChannel('channel');
                if (config.allowedVoiceChannels && config.allowedVoiceChannels.length > 0) {
                    const currentChannelId = config.allowedVoiceChannels[0];
                    const currentChannel = interaction.guild.channels.cache.get(currentChannelId);
                    if (currentChannel) {
                        return interaction.reply({ 
                            content: `${emoji.status.error} Voice channel restriction is already set to ${currentChannel}!\n\n` +
                                    `Only **one** voice channel can be set.\n` +
                                    `To change:\n` +
                                    `1. Use \`/setvc unset\` to remove current restriction\n` +
                                    `2. Then use \`/setvc set\` to set a new channel`, 
                            flags: 64 
                        });
                    }
                }
                config.allowedVoiceChannels = [channel.id];
                await config.save();
                await interaction.reply({ 
                    content: `${emoji.status.success} Bot restricted to voice channel: ${channel}\n` +
                            `The bot will only join this voice channel.`, 
                    ephemeral: false 
                });
            }
        } catch (error) {
            console.error('setvc error:', error);
            await interaction.reply({ content: `${emoji.status.error} Failed to update voice channel restriction.`, flags: 64 });
        }
    },
};
