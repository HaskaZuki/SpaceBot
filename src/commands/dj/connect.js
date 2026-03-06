const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Join your voice channel without playing anything'),
    category: 'dj',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const voiceChannel = interaction.member?.voice?.channel;
        if (!voiceChannel) {
            return interaction.reply({
                content: `${emoji.status.error} You must be in a voice channel first!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const existingPlayer = musicPlayer.players.get(guildId);
        if (existingPlayer?.player) {
            return interaction.reply({
                content: `${emoji.status.error} I'm already connected to a voice channel!`,
                flags: MessageFlags.Ephemeral
            });
        }
        try {
            const nodes = [...interaction.client.shoukaku.nodes.values()];
            const node = nodes.find(n => n.state === 2); // State 2 = READY in Shoukaku
            if (!node) {
                return interaction.reply({
                    content: `${emoji.status.error} No music nodes are available right now.`,
                    flags: MessageFlags.Ephemeral
                });
            }
            const player = await interaction.client.shoukaku.joinVoiceChannel({
                guildId,
                channelId: voiceChannel.id,
                shardId: 0,
                deaf: true
            });
            const playerState = musicPlayer.getQueue(guildId);
            playerState.player = player;
            playerState.voiceChannelId = voiceChannel.id;
            playerState.textChannelId = interaction.channel.id;
            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(`${emoji.status.success} Connected to **${voiceChannel.name}**.\nUse \`/play\` to start playing music!`)
                .setFooter({ text: `Connected by ${interaction.user.displayName || interaction.user.username}` });
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('[connect] Failed to join voice channel:', error);
            await interaction.reply({
                content: `${emoji.status.error} Failed to join **${voiceChannel.name}**. Check my permissions!`,
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
