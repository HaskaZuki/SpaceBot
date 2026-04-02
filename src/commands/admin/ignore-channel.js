const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ignore-channel')
        .setDescription('Toggle ignoring bot commands in a specific channel')
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Ignore commands from a channel')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to ignore')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Stop ignoring a channel')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Channel to un-ignore')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List all ignored channels')),
    category: 'admin',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();
        let config = await GuildConfig.findOne({ guildId });
        if (!config) {
            config = await GuildConfig.create({ guildId });
        }
        if (sub === 'list') {
            const ignored = config.ignoredChannels || [];
            if (ignored.length === 0) {
                return interaction.reply({
                    content: `${emoji.ui.notice} No channels are currently ignored.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            const channelList = ignored.map(id => `<#${id}>`).join('\n');
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(`${emoji.ui.gear} **Ignored Channels**\n\n${channelList}`)
                .setFooter({ text: `${ignored.length} channel${ignored.length !== 1 ? 's' : ''} ignored` });
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        const channel = interaction.options.getChannel('channel');
        if (sub === 'add') {
            if ((config.ignoredChannels || []).includes(channel.id)) {
                return interaction.reply({
                    content: `${emoji.status.error} ${channel} is already ignored!`,
                    flags: MessageFlags.Ephemeral
                });
            }
            config.ignoredChannels.push(channel.id);
            await config.save();
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(`${emoji.status.success} Now ignoring commands from ${channel}.\nUsers in that channel cannot trigger bot commands.`)
                .setFooter({ text: `Updated by ${interaction.user.displayName || interaction.user.username}` });
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        if (sub === 'remove') {
            if (!(config.ignoredChannels || []).includes(channel.id)) {
                return interaction.reply({
                    content: `${emoji.status.error} ${channel} is not in the ignore list!`,
                    flags: MessageFlags.Ephemeral
                });
            }
            config.ignoredChannels = config.ignoredChannels.filter(id => id !== channel.id);
            await config.save();
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(`${emoji.status.success} ${channel} is no longer ignored.`)
                .setFooter({ text: `Updated by ${interaction.user.displayName || interaction.user.username}` });
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    },
};
