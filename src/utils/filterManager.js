const emojiConfig = require('./emojiConfig');

const FILTER_PRESETS = {
    'bass-boost': {
        name: 'Bass Boost',
        emoji: emojiConfig.ui?.suggestion || '<:suggestion:1475169011036586134>',
        equalizer: [
            { band: 0, gain: 0.6 },
            { band: 1, gain: 0.67 },
            { band: 2, gain: 0.67 },
            { band: 3, gain: 0.4 }
        ]
    },
    'nightcore': {
        name: 'Nightcore',
        emoji: emojiConfig.ui?.notice || '<:notice:1475169287223116007>',
        timescale: {
            speed: 1.2,
            pitch: 1.2,
            rate: 1.0
        }
    },
    'vaporwave': {
        name: 'Vaporwave',
        emoji: emojiConfig.premium?.star || '<:star:1475169167457955901>',
        timescale: {
            speed: 0.8,
            pitch: 0.8,
            rate: 1.0
        }
    },
    '8d': {
        name: '8D Audio',
        emoji: emojiConfig.animated?.disc || '<a:disc:1475168869105795132>',
        rotation: {
            rotationHz: 0.2
        }
    },
    'karaoke': {
        name: 'Karaoke',
        emoji: emojiConfig.animated?.rocket || '<a:disc:1475168869105795132>',
        karaoke: {
            level: 1.0,
            monoLevel: 1.0,
            filterBand: 220.0,
            filterWidth: 100.0
        }
    },
    'tremolo': {
        name: 'Tremolo',
        emoji: emojiConfig.ui?.charts || '<:charts:1475169397474852886>',
        tremolo: {
            frequency: 2.0,
            depth: 0.5
        }
    },
    'vibrato': {
        name: 'Vibrato',
        emoji: emojiConfig.animated?.notes || '<a:notes:1475168921169428622>',
        vibrato: {
            frequency: 2.0,
            depth: 0.5
        }
    }
};

async function applyFilter(player, filter) {
    try {
        if (!player) {
            throw new Error('Player not found');
        }
        let filterConfig;
        if (typeof filter === 'string') {
            const preset = FILTER_PRESETS[filter.toLowerCase()];
            if (!preset) {
                throw new Error(`Unknown filter: ${filter}`);
            }
            filterConfig = { ...preset };
            delete filterConfig.name;
            delete filterConfig.emoji;
        } else {
            filterConfig = filter;
        }
        await player.setFilters(filterConfig);
        return true;
    } catch (error) {
        console.error('Error applying filter:', error);
        return false;
    }
}

async function resetFilters(player) {
    try {
        if (!player) {
            throw new Error('Player not found');
        }
        await player.setFilters({});
        return true;
    } catch (error) {
        console.error('Error resetting filters:', error);
        return false;
    }
}

function getAvailableFilters() {
    return Object.keys(FILTER_PRESETS);
}

function getFilterInfo(filterName) {
    const preset = FILTER_PRESETS[filterName.toLowerCase()];
    if (!preset) return null;
    return {
        name: preset.name,
        emoji: preset.emoji,
        key: filterName.toLowerCase()
    };
}

function isValidFilterConfig(config) {
    if (!config || typeof config !== 'object') return false;
    const validProps = ['equalizer', 'karaoke', 'timescale', 'tremolo', 'vibrato', 'rotation', 'distortion', 'channelMix', 'lowPass'];
    return validProps.some(prop => config.hasOwnProperty(prop));
}

module.exports = {
    FILTER_PRESETS,
    applyFilter,
    resetFilters,
    getAvailableFilters,
    getFilterInfo,
    isValidFilterConfig
};
