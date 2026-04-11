const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot latency and API response time'),
    category: 'everyone',
    async execute(interaction) {
        const { resource } = await interaction.reply({
            content: `${emoji.animated.loading} Pinging...`,
            withResponse: true,
            flags: MessageFlags.Ephemeral
        });
        const sent = resource.message;
        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = Math.round(interaction.client.ws.ping);
        const latencyColor = apiLatency < 200 ? '#10B981' : apiLatency < 400 ? '#F59E0B' : '#EF4444';
        const wsColor = wsLatency < 200 ? '🟢' : wsLatency < 400 ? '🟡' : '🔴';
        const embed = new EmbedBuilder()
            .setColor(latencyColor)
            .setDescription(
                `${emoji.ui.notice} **API Response:** \`${apiLatency}ms\`\n` +
                `${emoji.ui.link} **WebSocket:** \`${wsLatency}ms\` ${wsColor}`
            )
            .setFooter({ text: 'SpaceBot Status' })
            .setTimestamp();
        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
