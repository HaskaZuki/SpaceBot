const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { isValidPosition, validatePlayerState, validateVoiceState } = require('../../utils/validators');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jump')
        .setDescription('Jump to a specific position in the queue')
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('Queue position to jump to (1 = next song)')
                .setMinValue(1)
                .setRequired(true)),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        
        try {            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `❌ ${voiceCheck.error}`, ephemeral: true });
            }            const playerState = musicPlayer.players.get(guildId);            const playerCheck = validatePlayerState(playerState, { requireQueue: true, requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `❌ ${playerCheck.error}`, ephemeral: true });
            }            const position = interaction.options.getInteger('position');
            const queueIndex = position - 1;            if (!isValidPosition(position, playerState.queue.length)) {
                return interaction.reply({ 
                    content: `❌ Invalid position! Queue has ${playerState.queue.length} tracks. Use a number between 1 and ${playerState.queue.length}.`, 
                    ephemeral: true 
                });
            }

            try {                const targetTrack = playerState.queue[queueIndex];                const skippedTracks = playerState.queue.splice(0, queueIndex);                playerState.player.stopTrack();
                
                await interaction.reply({
                    content: `⏭️ Jumping to position **${position}**: **${targetTrack.info.title}**\nSkipped **${skippedTracks.length}** track(s)`
                });
                
            } catch (jumpError) {
                console.error('Jump error:', jumpError);
                await interaction.reply({ 
                    content: '❌ Failed to jump to track!', 
                    ephemeral: true 
                });
            }
            
        } catch (error) {
            console.error('Jump command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred!', 
                    ephemeral: true 
                });
            }
        }
    },
};
