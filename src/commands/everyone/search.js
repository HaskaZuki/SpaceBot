const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for music from multiple sources')
        .addStringOption(opt => 
            opt.setName('query')
                .setDescription('Song name to search for')
                .setRequired(true))
        .addStringOption(opt =>
            opt.setName('source')
                .setDescription('Music source to search from')
                .setRequired(false)
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'YouTube Music', value: 'ytmusic' },
                    { name: 'SoundCloud', value: 'soundcloud' },
                    { name: 'Spotify', value: 'spotify' }
                )),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const source = interaction.options.getString('source') || 'youtube';
        const guildId = interaction.guild.id;
        const member = interaction.member;
        if (!member.voice.channel) {
            return interaction.reply({ content: `${emoji.status.error} You must be in a voice channel!`, flags: 64 });
        }
        const nodes = [...interaction.client.shoukaku.nodes.values()];
        const node = nodes.find(n => n.state === 1);
        if (!node || nodes.length === 0) {
            console.log(`[SEARCH] No ready node. Nodes: ${nodes.map(n => `${n.name}:${n.state}`).join(', ')}`);
            return interaction.reply({ 
                content: `${emoji.status.error} Music service is not available. Lavalink server is not connected.`, 
                flags: 64 
            });
        }
        await interaction.reply({ content: `${emoji.animated.loading} Searching for **${query}**...`, flags: MessageFlags.Ephemeral });
        try {
            const sourceConfig = {
                soundcloud: { prefix: 'scsearch', emoji: emoji.sources.soundcloud },
                spotify: { prefix: 'spsearch', emoji: emoji.sources.spotify },
                ytmusic: { prefix: 'ytmsearch', emoji: emoji.sources.youtube },
                youtube: { prefix: 'ytsearch', emoji: emoji.sources.youtube }
            };
            const selectedSource = sourceConfig[source] || sourceConfig.youtube;
            let searchQuery = `${selectedSource.prefix}:${query}`;
            console.log(`[SEARCH] Trying ${selectedSource.emoji}: ${searchQuery}`);
            let result = await node.rest.resolve(searchQuery);
            if (!result || result.loadType === 'empty' || result.loadType === 'error') {
                const fallbackSources = ['scsearch', 'ytmsearch', 'ytsearch', 'spsearch']
                    .filter(s => s !== selectedSource.prefix);
                for (const fallbackPrefix of fallbackSources) {
                    try {
                        const fallbackQuery = `${fallbackPrefix}:${query}`;
                        result = await node.rest.resolve(fallbackQuery);
                        if (result && result.loadType === 'search' && result.data && result.data.length > 0) {
                            const sourceName = Object.values(sourceConfig).find(s => s.prefix === fallbackPrefix)?.emoji || fallbackPrefix;
                            console.log(`✅ Found results on fallback source: ${sourceName}`);
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
            if (!result || result.loadType === 'empty' || result.loadType === 'error') {
                return interaction.editReply(`${emoji.status.error} No results found for: **${query}**\n\nTried multiple sources but found nothing. Try a different search term!`);
            }
            let tracks = [];
            if (result.loadType === 'search') {
                tracks = result.data || [];
            } else if (result.data && Array.isArray(result.data)) {
                tracks = result.data;
            } else if (result.tracks) {
                tracks = result.tracks;
            }
            if (tracks.length === 0) {
                return interaction.editReply(`${emoji.status.error} No results found for: **${query}**`);
            }
            const topTracks = tracks.slice(0, 10);
            const embed = new EmbedBuilder()
                .setColor('#6366f1')
                .setTitle(`Search Results`)
                .setDescription(`Showing top ${topTracks.length} results for: **${query}**\n\n` +
                    topTracks.map((track, i) => 
                        `**${i + 1}.** [${track.info.title}](${track.info.uri})\n` +
                        `└ Author: ${track.info.author} • Duration: ${formatDuration(track.info.length)}`
                    ).join('\n\n'))
                .setFooter({ text: `Select a song to add it to the queue` });
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`search_select_${interaction.user.id}`)
                .setPlaceholder('Select a song to play')
                .addOptions(
                    topTracks.map((track, i) => ({
                        label: track.info.title.substring(0, 100),
                        description: `${track.info.author.substring(0, 50)} • ${formatDuration(track.info.length)}`,
                        value: i.toString()
                    }))
                );
            const row = new ActionRowBuilder().addComponents(selectMenu);
            const message = await interaction.editReply({ embeds: [embed], components: [row] });
            global.searchCache = global.searchCache || {};
            const cacheTimestamp = Date.now();
            global.searchCache[interaction.user.id] = {
                tracks: topTracks,
                guildId,
                voiceChannelId: member.voice.channel.id,
                textChannel: interaction.channel,
                timestamp: cacheTimestamp
            };
            setTimeout(() => {
                if (global.searchCache[interaction.user.id]?.timestamp === cacheTimestamp) {
                    delete global.searchCache[interaction.user.id];
                }
            }, 60000);
        } catch (error) {
            console.error('Search error:', error);
            await interaction.editReply(`${emoji.status.error} Failed to search. Error: ${error.message}`);
        }
    },
};
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}