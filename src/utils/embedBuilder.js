const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
    createMusicEmbed: (guildConfig, track, queue, status = 'Playing') => {
        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('SpaceBot Music Control')
            .setImage('https://cdn.discordapp.com/attachments/1435852776449118371/1465402991979790498/Untitled_video_-_Made_with_Clipchamp.mp4?ex=6978fa63&is=6977a8e3&hm=00839384b272fd0e7f115717c169df50dfb1963583edc93c019abe179128f401&')
            .setFooter({ text: 'SpaceBot Music System' });
        if (track) {
            embed.setDescription(`**[${track.info.title}](${track.info.uri})**\nAuthor: ${track.info.author}\nRequested by: unknown`);
            const nextTracks = queue.slice(0, 5).map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri})`).join('\n');
            if (nextTracks) embed.addFields({ name: 'Up Next:', value: nextTracks });
            embed.addFields({ name: 'Status', value: status, inline: true });
        } else {
            embed.setDescription('**No song playing currently.**\nJoin a voice channel and send a Song Name or Link here to play!');
        }
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('play_pause').setEmoji('⏯️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('loop').setEmoji('🔁').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('shuffle').setEmoji('🔀').setStyle(ButtonStyle.Secondary)
            );
        return { embeds: [embed], components: [row] };
    }
};
