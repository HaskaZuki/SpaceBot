const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles loop mode (Off, Track, Queue)'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const mode = await musicPlayer.setLoop(interaction.client, guildId);
        let icon = '➡️';
        if (mode === 'track') icon = '🔂';
        if (mode === 'queue') icon = '🔁';
        
        await interaction.reply({ content: `${icon} Loop mode set to: **${mode.toUpperCase()}**`, flags: 64 });
    },
};
