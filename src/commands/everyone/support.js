const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get help and support resources'),
    
    category: 'everyone',

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎫 SpaceBot Support')
            .setDescription('Need help with SpaceBot? Here are some ways to get support:')
            .addFields(
                {
                    name: '📝 Documentation',
                    value: 'Check our docs at [spacebot.me/docs](https://spacebot.me/docs) for guides and tutorials.',
                    inline: false
                },
                {
                    name: '💬 Discord Server',
                    value: 'Join our support server to chat with the team and get real-time help:',
                    inline: false
                },
                {
                    name: '🐛 Report Bugs',
                    value: 'Found a bug? Report it in our support server or on GitHub.',
                    inline: false
                }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Join Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/9m2TASRgJj')
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setLabel('Documentation')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://spacebot.me/docs')
                    .setEmoji('📚'),
                new ButtonBuilder()
                    .setLabel('Website')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://spacebot.me')
                    .setEmoji('🌐')
            );

        await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.Ephemeral });
    },
};
