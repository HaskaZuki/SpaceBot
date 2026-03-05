const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const PlayHistory = require('../../models/PlayHistory');
const { formatTime } = require('../../utils/validators');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerstats')
        .setDescription('View listening statistics')
        .addUserOption(opt =>
            opt.setName('user')
                .setDescription('User to view stats for (defaults to you)')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const guildId = interaction.guild.id;
        await interaction.deferReply({ flags: 64 });
        try {
            const [totalStats] = await PlayHistory.aggregate([
                { $match: { userId: targetUser.id, guildId } },
                {
                    $group: {
                        _id: null,
                        totalPlays: { $sum: 1 },
                        totalDuration: { $sum: '$duration' }
                    }
                }
            ]);
            if (!totalStats || totalStats.totalPlays === 0) {
                return interaction.editReply(`**${targetUser.username}** has no listening history in this server yet.`);
            }
            const topSongs = await PlayHistory.aggregate([
                { $match: { userId: targetUser.id, guildId } },
                {
                    $group: {
                        _id: '$trackTitle',
                        plays: { $sum: 1 },
                        artist: { $first: '$artist' },
                        url: { $first: '$trackUrl' }
                    }
                },
                { $sort: { plays: -1 } },
                { $limit: 5 }
            ]);
            const topArtists = await PlayHistory.aggregate([
                { $match: { userId: targetUser.id, guildId, artist: { $ne: 'Unknown' } } },
                {
                    $group: {
                        _id: '$artist',
                        plays: { $sum: 1 }
                    }
                },
                { $sort: { plays: -1 } },
                { $limit: 3 }
            ]);
            const topSongsText = topSongs.map((s, i) => {
                const medal = ['1.', '2.', '3.', '4.', '5.'][i];
                const title = s.url ? `[${s._id}](${s.url})` : s._id;
                return `${medal} ${title}\n└ ${s.artist} — **${s.plays}** plays`;
            }).join('\n');
            const topArtistsText = topArtists.length > 0
                ? topArtists.map((a, i) => `${['1st', '2nd', '3rd'][i]} **${a._id}** — ${a.plays} plays`).join('\n')
                : 'Not enough data';
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setTitle(`${targetUser.username}'s Listening Stats`)
                .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
                .addFields(
                    {
                        name: 'Overview',
                        value: [
                            `**Total Plays:** ${totalStats.totalPlays.toLocaleString()}`,
                            `**Total Listened:** ${formatTime(totalStats.totalDuration)}`,
                            `**Avg Duration:** ${formatTime(Math.round(totalStats.totalDuration / totalStats.totalPlays))}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: 'Top Songs',
                        value: topSongsText,
                        inline: false
                    },
                    {
                        name: 'Top Artists',
                        value: topArtistsText,
                        inline: false
                    }
                )
                .setFooter({ text: `Stats for this server` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Stats command error:', error);
            await interaction.editReply('An error occurred while fetching stats.');
        }
    },
};
