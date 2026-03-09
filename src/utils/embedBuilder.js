const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emoji = require('./emojiConfig');

module.exports = {
    createMusicEmbed: (guildConfig, track, queue, status = 'Playing') => {
        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('SpaceBot Music Control')
            .setImage('https://imgur.com/a/hHKiFvO')
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
                new ButtonBuilder().setCustomId('play_pause').setEmoji(emoji.controls.play).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('stop').setEmoji(emoji.ui.home).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('skip').setEmoji(emoji.controls.next).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('loop').setEmoji(emoji.controls.loopTrack).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('shuffle').setEmoji(emoji.controls.shuffle).setStyle(ButtonStyle.Secondary)
            );
        return { embeds: [embed], components: [row] };
    }
};
