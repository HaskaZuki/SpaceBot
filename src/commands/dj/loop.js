const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggles loop mode (Off, Track, Queue)'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const mode = await musicPlayer.setLoop(interaction.client, guildId);
        
        let icon = '';
        if (mode === 'track') icon = emoji.controls.loopTrack;
        if (mode === 'queue') icon = emoji.controls.loopQueue;
        
        const displayText = icon ? `${icon} ${mode.toUpperCase()}` : mode.toUpperCase();
        await interaction.reply({ content: `Loop mode set to: **${displayText}**`, flags: 64 });
    },
};
