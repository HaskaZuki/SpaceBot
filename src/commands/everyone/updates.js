const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates')
        .setDescription('View the latest XylosBot updates and changelog'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🚀 XylosBot — Migration to Slash Commands Complete')
            .setDescription(
                'XylosBot has been fully migrated to **Discord Slash Commands**!\n\n' +
                'All legacy prefix-based commands (`!play`, `!skip`, etc.) have been removed.\n' +
                'You now interact with XylosBot exclusively through `/slash` commands.\n\n' +
                '─────────────────────────'
            )
            .addFields(
                {
                    name: '✅ What Changed',
                    value:
                        '• All commands now use `/command` format\n' +
                        '• Prefix system (`!`, `?`, etc.) fully removed\n' +
                        '• Mention trigger added: `@XylosBot play <song>`\n' +
                        '• Replies are now ephemeral (only you can see them)\n' +
                        '• Dashboard prefix setting removed'
                },
                {
                    name: '🎵 How to Use',
                    value:
                        '• Type `/` in chat to see all commands\n' +
                        '• Use `/play <song>` to start playing music\n' +
                        '• Use `/help` for a full command list\n' +
                        '• Mention the bot: `@XylosBot play <song>`'
                },
                {
                    name: '💎 Premium Features',
                    value:
                        '• Audio filters, 24/7 mode, favorites\n' +
                        '• Lyrics sync, listening history\n' +
                        '• 200% volume boost\n' +
                        '• Use `/premiumstatus` to check your tier'
                },
                {
                    name: '🔗 Links',
                    value:
                        '[Dashboard](https://xylos.biz.id/dashboard) • ' +
                        '[Support Server](https://discord.gg/xylos) • ' +
                        '[Commands List](https://xylos.biz.id/commands)'
                }
            )
            .setFooter({ text: 'XylosBot v3.0 — Slash Commands Edition' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
