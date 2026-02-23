const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { isValidPosition, validatePlayerState, validateVoiceState } = require('../../utils/validators');
const emoji = require('../../utils/emojiConfig');

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
        
        try {
            const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
            if (!voiceCheck.valid) {
                return interaction.reply({ content: `${emoji.status.error} ${voiceCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            const playerState = musicPlayer.players.get(guildId);
            const playerCheck = validatePlayerState(playerState, { requireQueue: true, requirePlayer: true });
            if (!playerCheck.valid) {
                return interaction.reply({ content: `${emoji.status.error} ${playerCheck.error}`, flags: MessageFlags.Ephemeral });
            }
            const position = interaction.options.getInteger('position');
            const queueIndex = position - 1;
            if (!isValidPosition(position, playerState.queue.length)) {
                return interaction.reply({ 
                    content: `${emoji.status.error} Invalid position! Queue has ${playerState.queue.length} tracks. Use a number between 1 and ${playerState.queue.length}.`, 
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                const targetTrack = playerState.queue[queueIndex];
                const skippedTracks = playerState.queue.splice(0, queueIndex);
                playerState.player.stopTrack();
                
                await interaction.reply({
                    content: `${emoji.controls.skip} Jumping to position **${position}**: **${targetTrack.info.title}**\nSkipped **${skippedTracks.length}** track(s)`
                });
                
            } catch (jumpError) {
                console.error('Jump error:', jumpError);
                await interaction.reply({ 
                    content: `${emoji.status.error} Failed to jump to track!`, 
                    flags: MessageFlags.Ephemeral
                });
            }
            
        } catch (error) {
            console.error('Jump command error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: `${emoji.status.error} An error occurred!`, 
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
