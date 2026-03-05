const { SlashCommandBuilder, EmbedBuilder, ChannelType, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcommandchannel')
        .setDescription('Restrict all bot commands to one specific channel (whitelist mode)')
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set the only channel where bot commands are allowed')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('Text channel to restrict commands to')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Remove the restriction — allow commands in all channels again'))
        .addSubcommand(sub =>
            sub.setName('status')
                .setDescription('Check which channel is currently set')),
    category: 'admin',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();
        let config = await GuildConfig.findOne({ guildId });
        if (!config) {
            config = await GuildConfig.create({ guildId });
        }
        if (sub === 'status') {
            if (!config.commandChannelId) {
                return interaction.reply({
                    content: `${emoji.ui.notice} No command channel set — bot responds in all channels (minus ignored ones).`,
                    flags: MessageFlags.Ephemeral
                });
            }
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(
                    `${emoji.ui.gear} Commands are restricted to <#${config.commandChannelId}>.\n` +
                    `Use \`/setcommandchannel clear\` to allow all channels.`
                );
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        if (sub === 'clear') {
            if (!config.commandChannelId) {
                return interaction.reply({
                    content: `${emoji.status.error} No command channel was set.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            config.commandChannelId = null;
            await config.save();
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(`${emoji.status.success} Restriction removed — bot now responds in all channels.`)
                .setFooter({ text: `Updated by ${interaction.user.displayName || interaction.user.username}` });
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
        if (sub === 'set') {
            const channel = interaction.options.getChannel('channel');
            config.commandChannelId = channel.id;
            await config.save();
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(
                    `${emoji.status.success} Commands are now restricted to ${channel}.\n\n` +
                    `Users in other channels will see a redirect message.\n` +
                    `Use \`/setcommandchannel clear\` to remove this restriction.`
                )
                .setFooter({ text: `Updated by ${interaction.user.displayName || interaction.user.username}` });
            return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }
    },
};
