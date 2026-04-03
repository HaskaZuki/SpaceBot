const emoji = require('../../utils/emojiConfig');
const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

const getFilterData = (type, level) => {
    switch(type) {
        case 'bassboost': {
            const gain = level !== null ? level / 10 : 0.67;
            return { equalizer: [
                { band: 0, gain: gain * 0.9 },
                { band: 1, gain: gain },
                { band: 2, gain: gain },
                { band: 3, gain: gain * 0.6 },
                { band: 4, gain: -0.5 }
            ] };
        }
        case 'nightcore': {
            const scale = level !== null ? level : 1.3;
            return { timescale: { speed: scale, pitch: scale, rate: 1.0 } };
        }
        case 'vaporwave': {
            const scale = level !== null ? level : 0.8;
            return { timescale: { speed: scale, pitch: scale, rate: 1.0 }, equalizer: [{ band: 0, gain: 0.3 }, { band: 1, gain: 0.3 }] };
        }
        case 'speed': {
            const scale = level !== null ? level : 1.5;
            return { timescale: { speed: scale, pitch: 1.0, rate: 1.0 } };
        }
        case 'pitch': {
            const scale = level !== null ? level : 1.5;
            return { timescale: { speed: 1.0, pitch: scale, rate: 1.0 } };
        }
        case 'demon': {
            const pitch = level !== null ? level : 0.5;
            return { timescale: { speed: 1.0, pitch: pitch, rate: 1.0 } };
        }
        case 'pop':
            return { equalizer: [{ band: 0, gain: -0.25 }, { band: 1, gain: 0.48 }, { band: 2, gain: 0.59 }, { band: 3, gain: 0.32 }, { band: 4, gain: -0.22 }] };
        case 'soft':
            return { lowPass: { smoothing: level !== null ? level : 20.0 } };
        case 'treblebass':
            return { equalizer: [{ band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 12, gain: 0.6 }, { band: 13, gain: 0.67 }] };
        case 'eightD':
            return { rotation: { rotationHz: level !== null ? level : 0.2 } };
        case 'karaoke':
            return { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } };
        case 'vibrato':
            return { vibrato: { frequency: level !== null ? level : 10.0, depth: 0.9 } };
        case 'tremolo':
            return { tremolo: { frequency: level !== null ? level : 10.0, depth: 0.5 } };
        default:
            return null;
    }
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
                    { name: 'Speed', value: 'speed' },
                    { name: 'Pitch', value: 'pitch' },
                    { name: 'Demon', value: 'demon' },
                    { name: 'Pop', value: 'pop' },
                    { name: 'Soft', value: 'soft' },
                    { name: 'TrebleBass', value: 'treblebass' },
                    { name: 'EightD', value: 'eightD' },
                    { name: 'Karaoke', value: 'karaoke' },
                    { name: 'Vibrato', value: 'vibrato' },
                    { name: 'Tremolo', value: 'tremolo' },
                    { name: 'OFF', value: 'off' }
                ))
        .addNumberOption(option =>
            option.setName('level')
                .setDescription('Custom intensity (e.g., 8 for 8dB BassBoost, 1.5 for Speed)')
                .setRequired(false)
        ),
    category: 'premium',
    async execute(interaction) {
        const filter = interaction.options.getString('type');
        const customLevel = interaction.options.getNumber('level');
        const guildId = interaction.guild.id;
        const playerState = musicPlayer.players.get(guildId);
        
        if (!playerState || !playerState.player) {
            return interaction.reply({ content: 'No music is playing.', flags: 64 });
        }
        
        if (filter === 'off') {
            playerState.player.setFilters({});
            await interaction.reply({ content: `${emoji.ui.gear} Filters disabled.`, flags: 64 });
        } else {
            const preset = getFilterData(filter, customLevel);
            if (!preset) {
                return interaction.reply({ content: 'Unknown filter type.', flags: 64 });
            }
            playerState.player.setFilters(preset);
            
            const levelText = customLevel !== null ? ` at level **${customLevel}**` : '';
            await interaction.reply({ content: `${emoji.ui.gear} Applied **${filter}** filter${levelText}!`, flags: 64 });
        }
    },
};
