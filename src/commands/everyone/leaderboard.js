const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayHistory = require('../../models/PlayHistory');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');

const medals = ['1st', '2nd', '3rd'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top listeners in this server')
        .addStringOption(option =>
            option.setName('period')
                .setDescription('Time period for the leaderboard')
                .setRequired(false)
                .addChoices(
                    { name: 'Today', value: 'today' },
                    { name: 'This Week', value: 'week' },
                    { name: 'This Month', value: 'month' },
                    { name: 'All Time', value: 'all' }
                )),
    
    category: 'everyone',

    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const period = interaction.options.getString('period') || 'all';

        const dateFilter = {};
        const now = new Date();

        if (period === 'today') {
            dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (period === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter.$gte = weekAgo;
        } else if (period === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            dateFilter.$gte = monthAgo;
        }

        const matchStage = { guildId };
        if (dateFilter.$gte) {
            matchStage.timestamp = dateFilter;
        }

        try {
            const topListeners = await PlayHistory.aggregate([
                { $match: matchStage },
                { 
                    $group: {
                        _id: '$userId',
                        totalPlays: { $sum: 1 },
                        totalDuration: { $sum: '$duration' },
                        lastPlayed: { $max: '$timestamp' }
                    }
                },
                { $sort: { totalPlays: -1 } },
                { $limit: 10 }
            ]);

            if (topListeners.length === 0) {
                return interaction.editReply('No listening data yet for this server! Start playing some music.');
            }

            const periodLabels = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                all: 'All Time'
            };

            const entries = [];
            for (let i = 0; i < topListeners.length; i++) {
                const listener = topListeners[i];
                const rank = i < 3 ? medals[i] : `\`${i + 1}.\``;
                
                let username = 'Unknown User';
                try {
                    const user = await interaction.client.users.fetch(listener._id);
                    username = user.displayName || user.username;
                } catch {
                    username = `User (${listener._id.slice(-4)})`;
                }

                const listeningTime = musicPlayer.formatTime(listener.totalDuration);
                entries.push(`${rank} **${username}** — ${listener.totalPlays} plays • ${listeningTime} listened`);
            }

            const embed = new EmbedBuilder()
                .setColor('#F59E0B')
                .setTitle(`Listening Leaderboard — ${interaction.guild.name}`)
                .setDescription(`**Period:** ${periodLabels[period]}\n\n${entries.join('\n')}`)
                .setFooter({ text: `${topListeners.reduce((acc, l) => acc + l.totalPlays, 0)} total plays tracked` })
                .setTimestamp();

            if (interaction.guild.iconURL()) {
                embed.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 128 }));
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Leaderboard error:', error);
            await interaction.editReply(`${emoji.status.error} Failed to load leaderboard. Please try again.`);
        }
    },
};
