
module.exports = {
    animated: {
        loading: '<a:loading:1475170482700681286>',
        disc: '<a:disc:1475168869105795132>',
        notes: '<a:notes:1475168921169428622>',
        premium: '<a:premium:1475168695130128394>',
        rocket: '<a:disc:1475168869105795132>', // using disc as fallback
    },
    status: {
        success: '<:checkk:1475176290649899099>',
        error: '<:no:1475169601955430430>',
    },
    premium: {
        diamond: '<a:premium:1475168695130128394>',
        star: '<:star:1475169167457955901>',
        crown: '<:crown:1475169336399384616>',
    },
    sources: {
        youtube: '<:youtube:1475168468746637566>',
        spotify: '<:spotify:1475168210423906484>',
        soundcloud: '<:sound_cloud:1475168572266381474>',
        apple: '<:appless:1475168309333721270>',
    },
    controls: {
        play: '<:play:1475169672847687811>',
        pause: '<:pause:1475169461672870049>',
        next: '<:next:1475170434206011444>',
        previous: '<:previous:1475170396708798655>',
        shuffle: '<:shuffle:1475168369874440242>',
        loopTrack: '<:loop_track:1475169773288558797>',
        loopQueue: '<:loop_queue:1475169865017983259>',
    },
    navigation: {
        arrow: '<:arrow:1475169715726061679>',
        nextPage: '<:next_page:1475169518203699280>',
        previousPage: '<:previous_page:1475169112547393658>',
    },
    ui: {
        home: '<:home:1475168826017447988>',
        gear: '<:gear:1475168752013152449>',
        help: '<:help:1475169227433574680>',
        link: '<:link:1475169633202864178>',
        notice: '<:notice:1475169287223116007>',
        suggestion: '<:suggestion:1475169011036586134>',
        charts: '<:charts:1475169397474852886>',
    },
    get(key) {
        const parts = key.split('.');
        let result = this;
        for (const part of parts) {
            result = result[part];
            if (result === undefined) return null;
        }
        return result;
    },
    getSourceIcon(sourceName) {
        const sourceMap = {
            youtube: this.sources.youtube,
            spotify: this.sources.spotify,
            soundcloud: this.sources.soundcloud,
            applemusic: this.sources.apple,
            apple: this.sources.apple,
            deezer: this.sources.apple, // fallback to apple
            default: this.animated.notes
        };
        return sourceMap[sourceName?.toLowerCase()] || sourceMap.default;
    },
    getLoopDisplay(mode) {
        const loopMap = {
            off: '▶️ Normal',
            track: `${this.controls.loopTrack} Track`,
            queue: `${this.controls.loopQueue} Queue`
        };
        return loopMap[mode] || loopMap.off;
    }
};
