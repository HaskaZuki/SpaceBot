const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { formatTime, validatePlayerState, validateVoiceState } = require('../../utils/validators');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rewind')
        .setDescription('Rewind the current track by specified seconds')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Number of seconds to rewind (default: 10)')
                .setMinValue(1)
                .setMaxValue(300)
                .setRequired(false)),
    
    async execute(interaction) {
        const guildId = interaction.guild.id;
        
        try {
            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `❌ ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            const playerState = musicPlayer.players.get(guildId);
            const playerCheck = validatePlayerState(playerState, { requireTrack: true, requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `❌ ${playerCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            const seconds = interaction.options.getInteger('seconds') || 10;
            const rewindMs = seconds * 1000;
            const currentPosition = playerState.player.position || 0;
            const newPosition = Math.max(0, currentPosition - rewindMs);
            try {
                await playerState.player.seekTo(newPosition);
                
                await interaction.reply({
                    content: `⏪ Rewound **${seconds}s** to **${formatTime(newPosition)}**`
                });
                
            } catch (seekError) {
                console.error('Rewind error:', seekError);
                await interaction.reply({ 
                    content: '❌ Failed to rewind. This track may not support seeking.', 
                    flags: MessageFlags.Ephemeral
                });
            }
            
        } catch (error) {
            console.error('Rewind command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ An error occurred while rewinding!', 
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
