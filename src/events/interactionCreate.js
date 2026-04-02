const musicPlayer = require('../utils/musicPlayer');
const GuildConfig = require('../models/GuildConfig');
const emoji = require('../utils/emojiConfig');
module.exports = {
    name: 'interactionCreate',
    execute: async (interaction) => {
        if (interaction.isButton()) {
            const guildId = interaction.guild?.id;
            if (!guildId) return;
            const member = interaction.member;
            const NON_MUSIC_PREFIXES = ['help_', 'help:', 'settings_', 'servers_', 'queue_', 'fav_'];
            if (NON_MUSIC_PREFIXES.some(prefix => interaction.customId.startsWith(prefix))) {
                return;
            }
            try {
                await interaction.deferUpdate().catch(() => {});
                if (!member.voice?.channel) {
                    return interaction.followUp({ content: `${emoji.status.error} You must be in a voice channel!`, flags: 64 }).catch(() => {});
                }
                const REQUIRES_MUSIC = ['play_pause', 'stop', 'skip', 'shuffle'];
                if (REQUIRES_MUSIC.includes(interaction.customId)) {
                    const playerState = musicPlayer.players?.get(guildId);
                    if (!playerState || !playerState.currentTrack) {
                        return interaction.followUp({ content: `${emoji.status.error} Nothing is currently playing!`, flags: 64 }).catch(() => {});
                    }
                }
                switch (interaction.customId) {
                    case 'play_pause':
                        await musicPlayer.pauseResume(interaction.client, guildId);
                        break;
                    case 'stop':
                        await musicPlayer.stopPlayer(interaction.client, guildId);
                        break;
                    case 'skip':
                        await musicPlayer.skipTrack(interaction.client, guildId);
                        break;
                    case 'loop': {
                        const mode = await musicPlayer.setLoop(interaction.client, guildId);
                        await interaction.followUp({ content: `${emoji.controls.loopQueue} Loop mode set to: **${mode}**` }).catch(() => {});
                        break;
                    }
                    case `shuffle`:
                        await musicPlayer.shuffleQueue(interaction.client, guildId);
                        await interaction.followUp({ content: `${emoji.controls.shuffle} Queue shuffled!` }).catch(() => {});
                        break;
                }
            } catch (error) {
                console.error('Button interaction error:', error.message);
            }
            return;
        }
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('search_select_')) {
                const userId = interaction.customId.replace('search_select_', '');
                if (userId !== interaction.user.id) {
                    return interaction.reply({ content: `${emoji.status.error} This search was initiated by someone else!`, flags: 64 });
                }
                const searchData = global.searchCache?.[userId];
                if (!searchData) {
                    return interaction.reply({ content: `${emoji.status.error} Search results expired! Please search again.`, flags: 64 });
                }
                const selectedIndex = parseInt(interaction.values[0]);
                const selectedTrack = searchData.tracks[selectedIndex];
                if (!selectedTrack) {
                    return interaction.reply({ content: `${emoji.status.error} Invalid selection!`, flags: 64 });
                }
                await interaction.deferUpdate();
                try {
                    const result = await musicPlayer.playTrackDirect(
                        interaction.client,
                        searchData.guildId,
                        searchData.voiceChannelId,
                        selectedTrack,
                        searchData.textChannel
                    );
                    delete global.searchCache[userId];
                    const embed = new require('discord.js').EmbedBuilder()
                        .setColor('#3B82F6')
                        .setTitle('Added to Queue')
                        .setDescription(`${emoji.status.success} | [${selectedTrack.info.title}](${selectedTrack.info.uri || '#'})`)
                        .setFooter({ text: `Requested by ${interaction.user.displayName || interaction.user.username}` })
                        .setTimestamp();
                    await interaction.followUp({ embeds: [embed], flags: 64 });
                } catch (error) {
                    console.error(`Play from search error:`, error);
                    await interaction.followUp({
                        content: `${emoji.status.error} Failed to add track to queue.`,
                        flags: 64
                    });
                }
            }
            return;
        }
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command || !command.autocomplete) return;
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`Autocomplete error:`, error.message);
            }
            return;
        }
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            const channelConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (channelConfig?.commandChannelId && interaction.channel.id !== channelConfig.commandChannelId) {
                return interaction.reply({
                    content: `${emoji.status.error} Bot commands are only allowed in <#${channelConfig.commandChannelId}>.`,
                    flags: 64
                });
            }
            if (!channelConfig?.commandChannelId && channelConfig?.ignoredChannels?.includes(interaction.channel.id)) {
                return interaction.reply({
                    content: `${emoji.status.error} Bot commands are disabled in this channel.`,
                    flags: 64
                });
            }
            if (command.category === 'dj') {
                const config = channelConfig;
                const isAdmin = interaction.member.permissions.has('Administrator');
                if (config && config.djRoleId) {
                    const hasRole = interaction.member.roles.cache.has(config.djRoleId);
                    if (!hasRole && !isAdmin) {
                        return interaction.reply({ 
                            content: `${emoji.status.error} You need the <@&${config.djRoleId}> role to use this command!`, 
                            flags: 64 
                        });
                    }
                }
            }
            if (command.category === 'admin') {
                if (!interaction.member.permissions.has('Administrator')) {
                     return interaction.reply({ 
                        content: `${emoji.status.error} You need **Administrator** permission to use this command!`, 
                        flags: 64 
                    });
                }
            }
            if (command.category === 'owner') {
                const ownerId = (process.env.OWNER_ID || '').trim();
                if (!ownerId) {
                    console.error('[OWNER CHECK] OWNER_ID is not set in environment variables!');
                }
                if (interaction.user.id !== ownerId) {
                    console.warn(`[OWNER CHECK] Denied: user=${interaction.user.id}, expected=${ownerId || 'NOT SET'}`);
                    return interaction.reply({
                        content: `${emoji.status.error} **Owner-Only Command**\n\nThe \`/${interaction.commandName}\` command is restricted to the **Bot Owner** only and cannot be used by regular users.\n\nIf you need assistance, please contact the bot owner.`,
                        flags: 64
                    });
                }
            }
            if (command.category === `premium`) {
                const config = channelConfig;
                const guildIsPremium = config && config.isPremium;
                if (!guildIsPremium) {
                    const UserSettings = require('../models/UserSettings');
                    const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
                    const userIsPremium = userSettings && userSettings.isPremium;
                    if (!userIsPremium) {
                        return interaction.reply({
                            content: `${emoji.premium.diamond} **Premium Required**\n\nThis command is only available for:\n• **Premium Users** — upgrade your account\n• **Premium Servers** — contact the bot owner to upgrade this server\n\nContact the bot owner to get Premium access!`,
                            flags: 64
                        });
                    }
                }
            }
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Command execution error:`, error);
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: `${emoji.status.error} There was an error executing this command!`, flags: 64 });
                    } else {
                        await interaction.reply({ content: `${emoji.status.error} There was an error executing this command!`, flags: 64 });
                    }
                } catch (replyError) {
                    console.error('Failed to send error reply:', replyError.message);
                }
            }
        }
    }
};
