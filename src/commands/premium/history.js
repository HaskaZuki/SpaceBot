const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayHistory = require('../../models/PlayHistory');
const { formatTime } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('View your listening history (Premium Only)')
        .addIntegerOption(opt =>
            opt.setName('limit')
                .setDescription('Number of tracks to show (default: 10)')
                .setMinValue(5)
                .setMaxValue(50)
                .setRequired(false)),
    async execute(interaction) {
        const UserSettings = require('../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        if (!userSettings || !userSettings.isPremium) {
            return interaction.reply({
                content: '${emoji.status.error} **History is a Premium-Only feature!**\n\n' +
                    'Premium features:\n' +
                    '• ${emoji.ui.charts} Full listening history\n` +
                    `• ${emoji.ui.charts} Statistics & analytics\n' +
                    '• ⭐ Unlimited favorites\n' +
                    '• ${emoji.ui.gear} Advanced audio filters\n\n' +
                    'Upgrade your account to Premium!',
                flags: 64
            });
        }
        const limit = interaction.options.getInteger('limit') || 10;
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        await interaction.deferReply({ flags: 64 });
        try {
            const recentTracks = await PlayHistory.find({ userId, guildId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .lean();
            if (recentTracks.length === 0) {
                return interaction.editReply('${emoji.ui.charts} Your listening history is empty! Play some music to build your history.`);
            }
            const [totalStats] = await PlayHistory.aggregate([
                { $match: { userId, guildId } },
                {
                    $group: {
                        _id: null,
                        totalPlays: { $sum: 1 },
                        totalDuration: { $sum: '$duration' }
                    }
                }
            ]);
            const trackList = recentTracks.map((item, idx) => {
                const timeAgo = getTimeAgo(item.timestamp);
                const title = item.trackUrl ? '[${item.trackTitle}](${item.trackUrl})` : item.trackTitle;
                return `**${idx + 1}.** ${title}\n└ ${item.artist} • ${formatTime(item.duration)} • ${timeAgo}`;
            }).join('\n\n');
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('${interaction.user.username}`s Listening History`)
                .setDescription(`${emoji.ui.charts} Your recent listening activity\n\n${trackList}`)
                .setFooter({
                    text: `Total plays: ${totalStats?.totalPlays || 0} • Total listened: ${formatTime(totalStats?.totalDuration || 0)} • Showing last ${recentTracks.length}`
                })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('History command error:', error);
            await interaction.editReply('An error occurred while fetching history.');
        }
    },
};
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return '${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}
