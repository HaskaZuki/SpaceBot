const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { validatePlayerState, validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('previous')
        .setDescription('Play the previous track'),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        
        try {
            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            const playerState = musicPlayer.players.get(guildId);
            const playerCheck = validatePlayerState(playerState, { requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `${emoji.status.error} ${playerCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            if (!playerState.history || playerState.history.length === 0) {
                return interaction.reply({ 
                    content: `${emoji.status.error} No previous track in history!`, 
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                const previousTrack = playerState.history[playerState.history.length - 1];
                playerState.history.pop();
                if (playerState.currentTrack) {
                    playerState.queue.unshift(playerState.currentTrack);
                }
                await playerState.player.playTrack({ track: { encoded: previousTrack.encoded } });
                playerState.currentTrack = previousTrack;
                
                await interaction.reply({
                    content: `${emoji.controls.previous} Playing previous track: **${previousTrack.info.title}**`
                });
                
            } catch (playError) {
                console.error('Previous track play error:', playError);
                await interaction.reply({ 
                    content: `${emoji.status.error} Failed to play previous track!`, 
                    flags: MessageFlags.Ephemeral
                });
            }
            
        } catch (error) {
            console.error('Previous command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: `${emoji.status.error} An error occurred!`, 
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
