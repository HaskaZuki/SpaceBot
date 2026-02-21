const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skipto')
        .setDescription('Skip to a specific position in the queue (Premium)')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Queue position to skip to (1 = first in queue)')
                .setRequired(true)
                .setMinValue(1)),
    
    category: 'premium',

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const member = interaction.member;

        if (!member.voice?.channel) {
            return interaction.reply({ content: '❌ You must be in a voice channel!', flags: 64 });
        }

        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.currentTrack) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', flags: 64 });
        }

        const position = interaction.options.getInteger('position');
        const queueLength = playerState.queue.length;

        if (queueLength === 0) {
            return interaction.reply({ content: '❌ The queue is empty!', flags: 64 });
        }

        if (position > queueLength) {
            return interaction.reply({ 
                content: `❌ Invalid position! Queue only has **${queueLength}** track${queueLength !== 1 ? 's' : ''}. Use a number between 1 and ${queueLength}.`, 
                flags: 64 
            });
        }

        const skippedCount = position - 1;
        const targetTrack = playerState.queue[position - 1];

        playerState.queue = playerState.queue.slice(position - 1);

        try {
            await musicPlayer.skipTrack(interaction.client, guildId);

            const embed = new EmbedBuilder()
                .setColor('#7C3AED')
                .setDescription(
                    `⏭️ Skipped to position **#${position}** in queue\n` +
                    `${skippedCount > 0 ? `Removed **${skippedCount}** track${skippedCount !== 1 ? 's' : ''}**\n` : ''}` +
                    `\n🎵 Now playing: **${targetTrack.info.title}**`
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('SkipTo error:', error);
            await interaction.reply({ content: '❌ Failed to skip to that position.', flags: 64 });
        }
    },
};
