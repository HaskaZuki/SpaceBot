const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle all tracks in the queue'),
    category: 'dj',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.getQueue(guildId);
        if (!playerState || !playerState.queue || playerState.queue.length < 2) {
            return interaction.reply({
                content: `${emoji.status.error} Not enough tracks in the queue to shuffle!`,
                flags: MessageFlags.Ephemeral
            });
        }
        await musicPlayer.shuffleQueue(interaction.client, guildId);
        const embed = new EmbedBuilder()
            .setColor('#7C3AED')
            .setDescription(`${emoji.controls.shuffle} Queue **shuffled** — **${playerState.queue.length}** tracks reordered.`)
            .setFooter({ text: `Shuffled by ${interaction.user.displayName || interaction.user.username}` });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
