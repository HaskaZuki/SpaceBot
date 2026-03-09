const emoji = require('../../utils/emojiConfig');
const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const filterPresets = {
    bassboost: { equalizer: [{ band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 2, gain: 0.67 }, { band: 3, gain: 0.4 }, { band: 4, gain: -0.5 }] },
    nightcore: { timescale: { speed: 1.3, pitch: 1.3, rate: 1.0 } },
    vaporwave: { timescale: { speed: 0.8, pitch: 0.8, rate: 1.0 }, equalizer: [{ band: 0, gain: 0.3 }, { band: 1, gain: 0.3 }] },
    pop: { equalizer: [{ band: 0, gain: -0.25 }, { band: 1, gain: 0.48 }, { band: 2, gain: 0.59 }, { band: 3, gain: 0.32 }, { band: 4, gain: -0.22 }] },
    soft: { lowPass: { smoothing: 20.0 } },
    treblebass: { equalizer: [{ band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 12, gain: 0.6 }, { band: 13, gain: 0.67 }] },
    eightD: { rotation: { rotationHz: 0.2 } },
    karaoke: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } },
    vibrato: { vibrato: { frequency: 10.0, depth: 0.9 } },
    tremolo: { tremolo: { frequency: 10.0, depth: 0.5 } }
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Applies an audio filter (Premium Only)')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The filter type')
                .setRequired(true)
                .addChoices(
                    { name: 'BassBoost', value: 'bassboost' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Vaporwave', value: 'vaporwave' },
                    { name: 'Pop', value: 'pop' },
                    { name: 'Soft', value: 'soft' },
                    { name: 'TrebleBass', value: 'treblebass' },
                    { name: 'EightD', value: 'eightD' },
                    { name: 'Karaoke', value: 'karaoke' },
                    { name: 'Vibrato', value: 'vibrato' },
                    { name: 'Tremolo', value: 'tremolo' },
                    { name: 'OFF', value: 'off' }
                )),
    async execute(interaction) {
        const UserSettings = require('../../models/UserSettings');
        const userSettings = await UserSettings.findOne({ userId: interaction.user.id });
        if (!userSettings || !userSettings.isPremium) {
            return interaction.reply({ content: 'Filters are restricted to **Premium Users**.', flags: 64 });
        }
        const filter = interaction.options.getString('type');
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState || !playerState.player) {
            return interaction.reply({ content: 'No music is playing.', flags: 64 });
        }
        if (filter === 'off') {
            playerState.player.setFilters({});
            await interaction.reply({ content: '${emoji.ui.gear} Filters disabled.', flags: 64 });
        } else {
            const preset = filterPresets[filter];
            if (!preset) {
                return interaction.reply({ content: 'Unknown filter type.', flags: 64 });
            }
            playerState.player.setFilters(preset);
            await interaction.reply({ content: `${emoji.ui.gear} Applied **${filter}** filter!`, flags: 64 });
        }
    },
};