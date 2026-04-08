const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('updates')
        .setDescription('View the latest SpaceBot updates and changelog'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('SpaceBot — Changelog')
            .setDescription(
                `${emoji.animated.notes} Here's a full summary of what's new in SpaceBot.\n\n` +
                '─────────────────────────'
            )
            .addFields(
                {
                    name: `${emoji.animated.premium} v2.0 Music Fix- *(April 2026)*`,
                    value:
                        `${emoji.status.success} **Spotify & playlist loading fully fixed** — All tracks from any Spotify/YouTube playlist are now loaded into the queue correctly\n` +
                        `${emoji.status.success} **Full playlist queue support** — Playing a playlist now enqueues every track, not just the first one\n` +
                        `${emoji.status.success} **Playlist embed redesign** — When loading a playlist, the bot now shows the playlist name as a clickable link + the first track\n` +
                        `${emoji.status.success} **\`/search\` response style** — Selecting a track from search now shows "Now Playing" or "Added to Queue" the same way \`/play\` does\n` +
                        `${emoji.status.success} **All filters consolidated** — \`/bassboost\`, \`/nightcore\`, \`/vaporwave\`, \`/demon\`, \`/speed\` were merged into one dynamic \`/filter type: [name] level: [intensity]\` command\n` +
                        `${emoji.status.success} **Lavalink auto-reconnect** — The bot handles node disconnects gracefully and reconnects automatically without needing a restart\n` +
                        `${emoji.status.success} **General commands category** — Utility commands like \`/ping\`, \`/support\`, \`/updates\`, \`/premiumstatus\` are now in their own **General** category in \`/help\``
                },
                {
                    name: `${emoji.animated.notes} v1.5 — Slash Command Migration`,
                    value:
                        '• All commands migrated to `/slash` format\n' +
                        '• Legacy prefix system (`!play`, etc.) fully removed\n' +
                        '• Ephemeral replies added for personal interactions\n' +
                        '• Help command redesigned with category buttons & tutorial'
                },
                {
                    name: `${emoji.animated.premium} Premium Features`,
                    value:
                        '• Audio filters with custom intensity levels\n' +
                        '• 24/7 voice channel mode\n' +
                        '• Unlimited favorites & listening history\n' +
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
            .setFooter({ text: 'SpaceBot • Stay tuned for more updates!' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};

