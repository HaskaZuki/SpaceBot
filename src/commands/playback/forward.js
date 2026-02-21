const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { formatTime, validatePlayerState, validateVoiceState } = require('../../utils/validators');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forward')
        .setDescription('Fast-forward the current track by specified seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Number of seconds to skip forward (default: 10)')
                .setMinValue(1)
                .setMaxValue(300)
                .setRequired(false)),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        
        try {            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `❌ ${voiceCheck.error}`, ephemeral: true });
            }            const playerState = musicPlayer.players.get(guildId);            const playerCheck = validatePlayerState(playerState, { requireTrack: true, requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `❌ ${playerCheck.error}`, ephemeral: true });
            }            const seconds = interaction.options.getInteger('seconds') || 10;
            const forwardMs = seconds * 1000;            const currentPosition = playerState.player.position || 0;
            const trackDuration = playerState.currentTrack.info.length;
            const newPosition = Math.min(trackDuration, currentPosition + forwardMs);            if (newPosition >= trackDuration - 1000) {                return interaction.reply({
                    content: '⏭️ Near end of track, skipping to next song instead...'
                }).then(() => {
                    musicPlayer.skipTrack(interaction.client, guildId);
                });
            }            try {
                await playerState.player.seekTo(newPosition);
                
                await interaction.reply({
                    content: `⏩ Fast-forwarded **${seconds}s** to **${formatTime(newPosition)}**`
                });
                
            } catch (seekError) {
                console.error('Forward error:', seekError);
                await interaction.reply({ 
                    content: '❌ Failed to fast-forward. This track may not support seeking.', 
                    ephemeral: true 
                });
            }
            
        } catch (error) {
            console.error('Forward command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred while fast-forwarding!', 
                    ephemeral: true 
                });
            }
        }
    },
};
