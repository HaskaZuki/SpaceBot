const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const i18n = require('../../utils/i18n');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const lang = await i18n.getGuildLang(guildId);
        const playerState = musicPlayer.getQueue(guildId);
        
        if (!playerState || (playerState.queue.length === 0 && !playerState.currentTrack)) {
            return interaction.reply({ 
                content: i18n.get(lang, 'queue.empty'), 
                flags: 64 
            });
        }

        const nowPlayingText = i18n.get(lang, 'queue.now_playing', {
            title: `[${playerState.currentTrack?.info.title}](${playerState.currentTrack?.info.uri})`
        });

        const list = playerState.queue.slice(0, 10).map((t, i) => 
            `${i + 1}. [${t.info.title}](${t.info.uri})`
        ).join('\n');
        
        const hidden = playerState.queue.length > 10 ? `\n...and ${playerState.queue.length - 10} more` : '';
        const upNextTitle = i18n.get(lang, 'queue.up_next');
        const upNextContent = list || i18n.get(lang, 'queue.empty');

        const embed = new EmbedBuilder()
            .setColor('#6366f1')
            .setTitle('Music Queue')
            .setDescription(`${nowPlayingText}\n\n${upNextTitle}\n${upNextContent}${hidden}`)
            .setFooter({ text: `Loop Mode: ${playerState.loop}` });

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
