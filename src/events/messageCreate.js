const musicPlayer = require('../utils/musicPlayer');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        try {
            const botMention = `<@${message.client.user.id}>`;
            const botMentionNick = `<@!${message.client.user.id}>`;

            if (message.content.startsWith(botMention) || message.content.startsWith(botMentionNick)) {
                const prefix = message.content.startsWith(botMention) ? botMention : botMentionNick;
                const args = message.content.slice(prefix.length).trim().split(/\s+/);
                const commandName = args.shift()?.toLowerCase();

                if (!commandName) {
                    await message.reply({
                        content: '👋 Hey! Use `/help` to see all commands, or mention me with a command like `@XylosBot play <song>`.'
                    });
                    return;
                }

                const command = message.client.commands.get(commandName);

                if (!command) {
                    await message.reply({
                        content: `❌ Unknown command: \`${commandName}\`. Use \`/help\` for a list of commands.`
                    });
                    return;
                }

                const fakeInteraction = {
                    guild: message.guild,
                    guildId: message.guild.id,
                    channel: message.channel,
                    channelId: message.channel.id,
                    user: message.author,
                    member: message.member,
                    client: message.client,
                    replied: false,
                    deferred: false,
                    options: {
                        getString: (name) => {
                            const idx = getOptionIndex(command, name);
                            return args[idx] || args.join(' ') || null;
                        },
                        getInteger: (name) => {
                            const idx = getOptionIndex(command, name);
                            const val = parseInt(args[idx]);
                            return isNaN(val) ? null : val;
                        },
                        getNumber: (name) => {
                            const idx = getOptionIndex(command, name);
                            const val = parseFloat(args[idx]);
                            return isNaN(val) ? null : val;
                        },
                        getBoolean: (name) => {
                            const idx = getOptionIndex(command, name);
                            if (!args[idx]) return null;
                            return args[idx].toLowerCase() === 'true';
                        },
                        getUser: () => message.mentions.users.first() || null,
                        getMember: () => message.mentions.members?.first() || null,
                        getChannel: () => message.mentions.channels.first() || null,
                        getRole: () => message.mentions.roles.first() || null,
                        getSubcommand: () => args[0] || null,
                        getAttachment: () => message.attachments.first() || null,
                    },
                    reply: async (data) => {
                        fakeInteraction.replied = true;
                        if (typeof data === 'string') {
                            return message.reply({ content: data });
                        }
                        const replyData = { ...data };
                        delete replyData.flags;
                        delete replyData.ephemeral;
                        return message.reply(replyData);
                    },
                    deferReply: async () => {
                        fakeInteraction.deferred = true;
                        return message.channel.sendTyping();
                    },
                    editReply: async (data) => {
                        if (typeof data === 'string') {
                            return message.reply({ content: data });
                        }
                        const replyData = { ...data };
                        delete replyData.flags;
                        delete replyData.ephemeral;
                        return message.reply(replyData);
                    },
                    followUp: async (data) => {
                        if (typeof data === 'string') {
                            return message.channel.send({ content: data });
                        }
                        const replyData = { ...data };
                        delete replyData.flags;
                        delete replyData.ephemeral;
                        return message.channel.send(replyData);
                    },
                    deferUpdate: async () => {},
                    isCommand: () => true,
                    isChatInputCommand: () => true,
                };

                try {
                    await command.execute(fakeInteraction);
                } catch (error) {
                    console.error(`Mention command error [${commandName}]:`, error);
                    if (!fakeInteraction.replied) {
                        await message.reply({ content: '❌ An error occurred while executing that command.' }).catch(() => {});
                    }
                }
                return;
            }

            const config = await GuildConfig.findOne({ guildId: message.guild.id });

            if (config && config.musicChannelId && message.channel.id === config.musicChannelId) {
                const query = message.content.trim();

                if (!query || query.length === 0) {
                    await message.delete().catch(() => {});
                    return;
                }

                const member = message.member;
                if (!member.voice.channel) {
                    const reply = await message.reply('❌ You must be in a voice channel to queue songs!');
                    setTimeout(() => {
                        message.delete().catch(() => {});
                        reply.delete().catch(() => {});
                    }, 5000);
                    return;
                }

                await message.delete().catch(() => {});

                try {
                    const result = await musicPlayer.playTrack(
                        message.client,
                        message.guild.id,
                        member.voice.channel.id,
                        query,
                        message.channel,
                        message.author.id
                    );

                    if (result && result.error) {
                        const errorMsg = await message.channel.send(`❌ ${result.error}`);
                        setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
                    } else if (result && result.track) {
                        console.log(`[HYDRA] Added to queue: ${result.track.info.title}`);
                    }
                } catch (error) {
                    console.error('[HYDRA] Error adding song:', error);
                    const errorMsg = await message.channel.send('❌ Failed to add song to queue.');
                    setTimeout(() => errorMsg.delete().catch(() => {}), 5000);
                }
            }
        } catch (error) {
            console.error('messageCreate error:', error);
        }
    },
};

function getOptionIndex(command, optionName) {
    if (!command.data?.options) return 0;
    const options = command.data.options;
    for (let i = 0; i < options.length; i++) {
        if (options[i].name === optionName) return i;
    }
    return 0;
}
