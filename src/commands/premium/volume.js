const emoji = require('../utils/emojiConfig');
const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Sets the player volume (Premium up to 200%)')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('The volume amount')
                .setRequired(true)),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const volume = interaction.options.getInteger('amount');
        const UserSettings = require('../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        const isPremium = userSettings && userSettings.isPremium;
        const maxVol = isPremium ? 200 : 100;
        if (volume < 0 || volume > maxVol) {
            return interaction.reply({ content: `Please choose a number between 0 and ${maxVol}.${!isPremium ? ' Upgrade to Premium for 200% volume!' : ''}`, flags: 64 });
        }
        const playerState = musicPlayer.players.get(guildId);
        if (playerState && playerState.player) {
            playerState.player.setGlobalVolume(volume);
            await interaction.reply({ content: `${emoji.animated.notes} Volume set to **${volume}%**`, flags: 64 });
        } else {
            await interaction.reply({ content: 'No music is playing.', flags: 64 });
        }
    },
};