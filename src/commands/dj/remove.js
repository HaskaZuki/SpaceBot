const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a specific track from the queue by position')
        .addIntegerOption(opt =>
            opt.setName('position')
                .setDescription('Queue position of the track to remove')
                .setRequired(true)
                .setMinValue(1)),
    category: 'dj',
    async execute(interaction) {
        const pos = interaction.options.getInteger('position') - 1;
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        const queue = playerState?.queue;
        if (!queue || queue.length === 0) {
            return interaction.reply({
                content: `${emoji.status.error} The queue is empty!`,
                flags: MessageFlags.Ephemeral
            });
        }
        if (!queue[pos]) {
            return interaction.reply({
                content: `${emoji.status.error} No track at position **${pos + 1}**. Queue has **${queue.length}** track${queue.length !== 1 ? 's' : ''}.`,
                flags: MessageFlags.Ephemeral
            });
        }
        const [removed] = queue.splice(pos, 1);
        musicPlayer.updateDashboard(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.status.success} Removed **${removed.info.title}** from the queue.`)
            .setFooter({ text: `Removed by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};