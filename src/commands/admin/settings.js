const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View or reset server settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View all current server settings'))
        .addSubcommand(sub =>
            sub.setName('reset')
                .setDescription('Reset all server settings to default')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        try {
            let config = await GuildConfig.findOne({ guildId });
            if (subcommand === 'view') {
                if (!config) {
                    config = await GuildConfig.create({ guildId });
                }
                const langNames = {
                    en: '🇺🇸 English', id: '🇮🇩 Indonesia', es: '🇪🇸 Spanish',
                    fr: '🇫🇷 French', de: '🇩🇪 German', ja: '🇯🇵 Japanese',
                    ko: '🇰🇷 Korean', pt: '🇧🇷 Portuguese', ru: '🇷🇺 Russian',
                    zh: '🇨🇳 Chinese', th: '🇹🇭 Thai'
                };
                const djRole = config.djRoleId ? '<@&${config.djRoleId}>' : 'Not set';
                const musicChannel = config.musicChannelId ? '<#${config.musicChannelId}>' : 'Not set';
                const allowedVCs = config.allowedVoiceChannels?.length > 0
                    ? config.allowedVoiceChannels.map(id => '<#${id}>').join(', ')
                    : 'All channels';
                const maxDuration = config.maxSongDuration > 0
                    ? '${Math.floor(config.maxSongDuration / 60)} minutes'
                    : 'Unlimited';
                const maxSongs = config.maxSongCount > 0
                    ? '${config.maxSongCount} songs'
                    : 'Unlimited';
                const embed = new EmbedBuilder()
                    .setColor('#7C3AED')
                    .setTitle('Settings — ${interaction.guild.name}')
                    .addFields(
                        {
                            name: 'Music | Settings',
                            value: [
                                '**Volume:** ${config.volume}%`,
                                `**Loop:** ${config.loopMode}`,
                                `**Auto Play:** ${config.autoPlay ? emoji.status.success : emoji.status.error}`,
                                `**24/7 Mode:** ${config.alwaysOn ? emoji.status.success : emoji.status.error}'
                            ].join('\n'),
                            inline: true
                        },
                        {
                            name: 'Limits | Settings',
                            value: [
                                '**Max Duration:** ${maxDuration}`,
                                `**Max Queue:** ${maxSongs}`,
                                `**Allow Playlists:** ${config.allowPlaylists ? emoji.status.success : emoji.status.error}'
                            ].join('\n'),
                            inline: true
                        },
                        {
                            name: 'Channels & Roles | Settings',
                            value: [
                                '**DJ Role:** ${djRole}`,
                                `**Music Channel:** ${musicChannel}`,
                                `**Allowed VCs:** ${allowedVCs}'
                            ].join('\n'),
                            inline: false
                        },
                        {
                            name: 'Announcements | Settings',
                            value: [
                                '**Announce Songs:** ${config.announceSongs ? emoji.status.success : emoji.status.error}`,
                                `**Show Requester:** ${config.showRequester ? emoji.status.success : emoji.status.error}`,
                                `**Delete Announcements:** ${config.deleteSongAnnouncements ? emoji.status.success : emoji.status.error}'
                            ].join('\n'),
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Use /settings reset to restore all defaults' })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], flags: 64 });
            }
            if (subcommand === 'reset') {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('settings_reset_confirm')
                        .setLabel('Yes, reset everything')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('${emoji.status.error}'),
                    new ButtonBuilder()
                        .setCustomId('settings_reset_cancel')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );
                const reply = await interaction.reply({
                    content: '${emoji.status.error} **Are you sure you want to reset ALL settings to default?**\n\n' +
                             'This will reset:\n' +
                             '• Language → English\n' +
                             '• Volume → 50%\n' +
                             '• DJ Role → None\n' +
                             '• Allowed VCs → All\n' +
                             '• Max Duration / Queue → Unlimited\n' +
                             '• Loop → Off\n' +
                             '• All toggles → Default\n\n' +
                             '**Premium status and music channel will NOT be affected.**',
                    components: [row],
                    flags: 64
                });
                const collector = reply.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 30000,
                    max: 1
                });
                collector.on('collect', async (btnInteraction) => {
                    if (btnInteraction.customId === 'settings_reset_confirm') {
                        if (!config) {
                            config = await GuildConfig.create({ guildId });
                        }
                        config.language = 'en';
                        config.djRoleId = null;
                        config.allowedVoiceChannels = [];
                        config.maxSongDuration = 0;
                        config.maxSongCount = 0;
                        config.volume = 50;
                        config.allowPlaylists = true;
                        config.showRequester = true;
                        config.announceSongs = true;
                        config.deleteSongAnnouncements = false;
                        config.loopMode = 'off';
                        config.autoPlay = false;
                        config.alwaysOn = false;
                        config.bannedUsers = [];
                        await config.save();
                        await btnInteraction.update({
                            content: '${emoji.status.success} **All settings have been reset to default!**\n\nUse \`/settings view\` to see the current configuration.`,
                            components: []
                        });
                    } else {
                        await btnInteraction.update({
                            content: `${emoji.status.error} Reset cancelled.`,
                            components: []
                        });
                    }
                });
                collector.on('end', async (collected) => {
                    if (collected.size === 0) {
                        try {
                            await interaction.editReply({
                                content: 'Reset timed out. No changes were made.',
                                components: []
                            });
                        } catch (e) {}
                    }
                });
            }
        } catch (error) {
            console.error('Settings command error:', error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: `${emoji.status.error} Failed to process settings.` });
            } else {
                await interaction.reply({ content: `${emoji.status.error} Failed to process settings.`, flags: 64 });
            }
        }
    },
};
