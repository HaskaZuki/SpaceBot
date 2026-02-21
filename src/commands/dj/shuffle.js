const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffles the queue'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        await musicPlayer.shuffleQueue(interaction.client, guildId);
        await interaction.reply({ content: '🔀 Shuffled the queue.', flags: 64 });
    },
};
