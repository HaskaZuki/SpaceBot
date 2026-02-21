const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a song from queue')
        .addIntegerOption(opt => opt.setName('position').setDescription('Position to remove').setRequired(true)),
    
    async execute(interaction) {
        const pos = interaction.options.getInteger('position') - 1;
        const guildId = interaction.guild.id;
        const queue = musicPlayer.getQueue(guildId)?.queue;
        
        if (!queue || !queue[pos]) return interaction.reply('Invalid position');

        const [removed] = queue.splice(pos, 1);
        musicPlayer.updateDashboard(interaction.client, guildId);
        await interaction.reply(`Removed **${removed.info.title}**`);
    },
};