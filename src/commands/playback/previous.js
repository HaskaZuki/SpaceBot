const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validatePlayerState, validateVoiceState } = require('../../utils/validators');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous track'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        
        try {            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `❌ ${voiceCheck.error}`, ephemeral: true });
            }            const playerState = musicPlayer.players.get(guildId);            const playerCheck = validatePlayerState(playerState, { requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `❌ ${playerCheck.error}`, ephemeral: true });
            }            if (!playerState.history || playerState.history.length === 0) {
                return interaction.reply({ 
                    content: '❌ No previous track in history!', 
                    ephemeral: true 
                });
            }

            try {                const previousTrack = playerState.history[playerState.history.length - 1];                playerState.history.pop();                if (playerState.currentTrack) {
                    playerState.queue.unshift(playerState.currentTrack);
                }                await playerState.player.playTrack({ track: { encoded: previousTrack.encoded } });
                playerState.currentTrack = previousTrack;
                
                await interaction.reply({
                    content: `⏮️ Playing previous track: **${previousTrack.info.title}**`
                });
                
            } catch (playError) {
                console.error('Previous track play error:', playError);
                await interaction.reply({ 
                    content: '❌ Failed to play previous track!', 
                    ephemeral: true 
                });
            }
            
        } catch (error) {
            console.error('Previous command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred!', 
                    ephemeral: true 
                });
            }
        }
    },
};
