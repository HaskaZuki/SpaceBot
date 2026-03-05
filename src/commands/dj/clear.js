const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear the entire music queue'),
    category: 'dj',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        if (!playerState || playerState.queue.length === 0) {
            return interaction.reply({
                content: `${emoji.status.error} The queue is already empty!`,
                flags: MessageFlags.Ephemeral
            });
        }
        const count = playerState.queue.length;
        playerState.queue = [];
        musicPlayer.updateDashboard(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.status.success} Cleared **${count}** track${count !== 1 ? 's' : ''} from the queue.`)
            .setFooter({ text: `Cleared by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
