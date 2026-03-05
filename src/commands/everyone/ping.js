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
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);
        const latencyColor = latency < 100 ? '#10B981' : latency < 200 ? '#F59E0B' : '#EF4444';
        const embed = new EmbedBuilder()
            .setColor(latencyColor)
            .setDescription(
                `${emoji.ui.notice} **Bot Latency:** \`${latency}ms\`\n` +
                `${emoji.ui.link} **API Latency:** \`${apiLatency}ms\``
            )
            .setFooter({ text: 'SpaceBot Status' })
            .setTimestamp();
        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
