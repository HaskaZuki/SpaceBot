
function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.some(isNaN)) return null;
    let milliseconds = 0;
    if (parts.length === 1) {
        milliseconds = parts[0] * 1000;
    } else if (parts.length === 2) {
        milliseconds = (parts[0] * 60 + parts[1]) * 1000;
    } else if (parts.length === 3) {
        milliseconds = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    } else {
        return null;
    }
    return milliseconds >= 0 ? milliseconds : null;
}
function formatTime(ms) {
    if (typeof ms !== 'number' || ms < 0) return '0:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const secs = seconds % 60;
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}
function isValidPosition(position, queueLength) {
    return Number.isInteger(position) && position >= 1 && position <= queueLength;
}
function isValidVolume(volume) {
    return typeof volume === 'number' && volume >= 0 && volume <= 200;
}
function isValidLength(str, min = 1, max = 100) {
    return typeof str === 'string' && str.length >= min && str.length <= max;
}
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>]/g, '')
        .trim()
        .substring(0, 200);
}
function validatePlayerState(playerState, requirements = {}) {
    if (!playerState) {
        return { valid: false, error: 'No active player in this server' };
    }
    if (requirements.requireTrack && !playerState.currentTrack) {
        return { valid: false, error: 'No track is currently playing' };
    }
    if (requirements.requireQueue && (!playerState.queue || playerState.queue.length === 0)) {
        return { valid: false, error: 'Queue is empty' };
    }
    if (requirements.requirePlayer && !playerState.player) {
        return { valid: false, error: 'Player not initialized' };
    }
    return { valid: true };
}
function validateVoiceState(member, guild) {
    if (!member?.voice?.channel) {
        return { valid: false, error: 'You must be in a voice channel!' };
    }
    const botMember = guild?.members?.me;
    if (!botMember) {
        return { valid: false, error: 'Bot member not found' };
    }
    const botVoiceChannel = botMember.voice?.channel;
    if (botVoiceChannel && botVoiceChannel.id !== member.voice.channel.id) {
        return { valid: false, error: 'You must be in the same voice channel as the bot!' };
    }
    return { valid: true, channel: member.voice.channel };
}
module.exports = {
    parseTime,
    formatTime,
    isValidPosition,
    isValidVolume,
    isValidLength,
    sanitizeInput,
    validatePlayerState,
    validateVoiceState
};
