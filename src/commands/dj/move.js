const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move')
        .setDescription('Move a song in queue')
        .addIntegerOption(opt => opt.setName('from').setDescription('Position to move from').setRequired(true))
        .addIntegerOption(opt => opt.setName('to').setDescription('Position to move to').setRequired(true)),
    
    async execute(interaction) {
        const from = interaction.options.getInteger('from') - 1;
        const to = interaction.options.getInteger('to') - 1;
        const guildId = interaction.guild.id;
        const queue = musicPlayer.getQueue(guildId)?.queue;
        
        if (!queue || !queue[from]) return interaction.reply('Invalid position');

        const [item] = queue.splice(from, 1);
        queue.splice(to, 0, item);
        musicPlayer.updateDashboard(interaction.client, guildId);
        
        await interaction.reply(`Moved song from ${from + 1} to ${to + 1}`);
    },
};