const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const i18n = require('../../utils/i18n');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song from a name or URL')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('The song name or URL')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const guildId = interaction.guild.id;
        const member = interaction.member;
        const lang = await i18n.getGuildLang(guildId);
        if (!member.voice.channel) {
            return interaction.reply({ 
                content: i18n.get(lang, 'common.no_voice'), 
                flags: 64 
            });
        }
        if (!interaction.client.shoukaku) {
            return interaction.reply({ 
                content: i18n.get(lang, 'common.error'), 
                flags: 64 
            });
        }
        const nodes = [...interaction.client.shoukaku.nodes.values()];
        const node = nodes.find(n => n.state === 1);
        if (!node || nodes.length === 0) {
            console.log(`[PLAY] No ready node. Nodes: ${nodes.map(n => `${n.name}:${n.state}`).join(', ')}`);
            return interaction.reply({ 
                content: i18n.get(lang, 'common.error') + ' (Lavalink Offline)', 
                flags: 64 
            });
        }
        await interaction.deferReply();
        try {
            const result = await musicPlayer.playTrack(
                interaction.client, 
                guildId, 
                member.voice.channel.id, 
                query, 
                interaction.channel,
                interaction.user.id
            );
            if (result && result.error) {
                await interaction.editReply({ content: `${emoji.status.error} ${result.error}` });
            } else if (result && result.track) {
                const title = result.track.info?.title || query;
                const url = result.track.info?.uri || null;
                const thumbnail = result.track.info?.artworkUrl || result.track.info?.thumbnail || null;
                const requester = interaction.user;
                const requesterName = requester.displayName || requester.username;

        const playerState = musicPlayer.getQueue(guildId);
        console.log(`[DEBUG play.js] Queue state - currentTrack: ${playerState.currentTrack ? 'exists' : 'null'}, queue length: ${playerState.queue.length}`);
        
        if (result.isFirst) {
                    const nowPlayingEmbed = new EmbedBuilder()
                        .setColor('#7C3AED')
                        .setTitle('Now Playing')
                        .setDescription(`${emoji.animated.disc} | [${title}](${url})`)
                    await interaction.editReply({ embeds: [nowPlayingEmbed] });
                } else {
                    const queueEmbed = new EmbedBuilder()
                        .setColor('#3B82F6')
                        .setTitle('Added to Queue')
                        .setDescription(`${emoji.animated.disc} | [${title}](${url})`)
                    await interaction.editReply({ embeds: [queueEmbed] });
                }
            } else {
                await interaction.editReply({ content: `${emoji.status.error} No results found.` });
            }
        } catch (error) {
            console.error('Play command error:', error);
            try {
                await interaction.editReply({ content: i18n.get(lang, 'common.error') });
            } catch (e) { }
        }
    },
};
