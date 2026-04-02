const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates')
        .setDescription('View the latest SpaceBot updates and changelog'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('SpaceBot — Migration to Slash Commands Complete')
            .setDescription(
                `${emoji.animated.notes} SpaceBot has been fully migrated to **Discord Slash Commands**!\n\n` +
                'All legacy prefix-based commands (`!play`, `!skip`, etc.) have been removed.\n' +
                'You now interact with SpaceBot exclusively through `/slash` commands.\n\n' +
                '─────────────────────────'
            )
            .addFields(
                {
                    name: `${emoji.status.success} What Changed`,
                    value:
                        '• All commands now use `/command` format\n' +
                        '• Prefix system (`!`, `?`, etc.) fully removed\n' +
                        '• Mention trigger added: `@SpaceBot play <song>`\n' +
                        '• Replies are now ephemeral (only you can see them)\n' +
                        '• Dashboard prefix setting removed'
                },
                {
                    name: `${emoji.animated.notes} How to Use`,
                    value:
                        '• Type `/` in chat to see all commands\n' +
                        '• Use `/play <song>` to start playing music\n' +
                        '• Use `/help` for a full command list\n' +
                        '• Mention the bot: `@SpaceBot play <song>`'
                },
                {
                    name: `${emoji.animated.premium} Premium Features`,
                    value:
                        '• Audio filters, 24/7 mode, favorites\n' +
                        '• Lyrics sync, listening history\n' +
                        '• 200% volume boost\n' +
                        '• Use `/premiumstatus` to check your tier'
                },
                {
                    name: `${emoji.ui.link} Links`,
                    value:
                        '[Dashboard](https://spacebot.me/dashboard) • ' +
                        '[Support Server](https://discord.gg/CFRKf8mXe4) • ' +
                        '[Commands List](https://spacebot.me/commands)'
                }
            )
            .setFooter({ text: 'SpaceBot EST.' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
