const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a track from one queue position to another')
        .addIntegerOption(opt =>
            opt.setName('from')
                .setDescription('Current position of the track')
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(opt =>
            opt.setName('to')
                .setDescription('New position for the track')
                .setRequired(true)
                .setMinValue(1)),
    category: 'dj',
    async execute(interaction) {
        const from = interaction.options.getInteger('from') - 1;
        const to = interaction.options.getInteger('to') - 1;
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        const queue = playerState?.queue;
        if (!queue || queue.length === 0) {
            return interaction.reply({
                content: `${emoji.status.error} The queue is empty!`,
                flags: MessageFlags.Ephemeral
            });
        }
        if (!queue[from]) {
            return interaction.reply({
                content: `${emoji.status.error} No track at position **${from + 1}**. Queue has **${queue.length}** track${queue.length !== 1 ? 's' : ''}.`,
                flags: MessageFlags.Ephemeral
            });
        }
        const [item] = queue.splice(from, 1);
        queue.splice(to, 0, item);
        musicPlayer.updateDashboard(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.navigation.arrow} Moved **${item.info.title}** from position **${from + 1}** to **${to + 1}**.`)
            .setFooter({ text: `Moved by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};