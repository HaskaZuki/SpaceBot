const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { createMusicEmbed } = require('../../utils/embedBuilder');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Sets up the music request channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        try {
            const existingChannel = interaction.guild.channels.cache.find(
                ch => ch.name === 'space-music' && ch.type === ChannelType.GuildText
            );
            if (existingChannel) {
                return interaction.editReply({
                    content: `${emoji.status.error} Music controller already setup!\n\n` +
                            `Channel: ${existingChannel}\n\n` +
                            `The channel **#space-music** already exists in this server.\n` +
                            `Delete that channel first if you want to run setup again.`
                });
            }
            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (config && config.musicChannelId) {
                const dbChannel = interaction.guild.channels.cache.get(config.musicChannelId);
                if (dbChannel) {
                    return interaction.editReply({
                        content: `${emoji.status.error} Music controller already setup!\n\n` +
                                `Channel: ${dbChannel}\n\n` +
                                `You've already configured a music controller in this server.`
                    });
                }
            }
            const channel = await interaction.guild.channels.create({
                name: 'space-music',
                type: ChannelType.GuildText,
                topic: 'Send song names or links here to play music!',
                parent: interaction.channel.parentId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                    }
                ]
            });
            if (!config) {
                config = await GuildConfig.create({ guildId: interaction.guild.id });
            }
            const { embeds, components } = createMusicEmbed(config, null, [], 'Idle');
            const message = await channel.send({ embeds, components });
            config.musicChannelId = channel.id;
            config.musicMessageId = message.id;
            await config.save();
            await interaction.editReply(`${emoji.status.success} Setup complete! Access your music controller here: ${channel}`);
        } catch (error) {
            console.error('Setup error:', error);
            await interaction.editReply(`${emoji.status.error} Failed to set up music system.`);
        }
    },
};
