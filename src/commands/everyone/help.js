const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const emoji = require('../../utils/emojiConfig');


const COMMANDS = {

    play:              { desc: 'Play a song from YouTube, Spotify, or SoundCloud',  usage: '/play <song>',            cat: 'music' },
    search:            { desc: 'Search and pick from a list of results',             usage: '/search <query>',         cat: 'music' },
    nowplaying:        { desc: 'Show the currently playing track',                  usage: '/nowplaying',             cat: 'music' },
    queue:             { desc: 'View the current music queue',                       usage: '/queue',                  cat: 'music' },
    lyrics:            { desc: 'Get lyrics for the current or any song',             usage: '/lyrics [query]',         cat: 'music' },
    grab:              { desc: 'Save the current song to your DMs',                  usage: '/grab',                   cat: 'music' },
    songinfo:          { desc: 'Get detailed info about the current track',          usage: '/songinfo',               cat: 'music' },
    voteskip:          { desc: 'Vote to skip the current track',                     usage: '/voteskip',               cat: 'music' },
    leaderboard:       { desc: 'View the top 10 listeners in this server',           usage: '/leaderboard [period]',   cat: 'music' },
    playerstats:       { desc: 'View listening stats for yourself or a user',        usage: '/playerstats [user]',     cat: 'music' },
    playlist:          { desc: 'Create, load, and manage playlists',                 usage: '/playlist <action>',      cat: 'music' },
    'export-playlist': { desc: 'Export a playlist to a shareable file',              usage: '/export-playlist <name>', cat: 'music' },
    removedupes:       { desc: 'Remove duplicate tracks from the queue',             usage: '/removedupes',            cat: 'music' },
    premiumstatus:     { desc: 'Check the premium status of this server',            usage: '/premiumstatus',          cat: 'general' },
    support:           { desc: 'Get the support server invite link',                 usage: '/support',                cat: 'general' },
    ping:              { desc: "Check the bot's latency",                            usage: '/ping',                   cat: 'general' },
    updates:           { desc: 'View the latest bot updates',                        usage: '/updates',                cat: 'general' },

    pause:             { desc: 'Pause the current track',                            usage: '/pause',                  cat: 'dj' },
    resume:            { desc: 'Resume paused playback',                             usage: '/resume',                 cat: 'dj' },
    skip:              { desc: 'Skip to the next track',                             usage: '/skip',                   cat: 'dj' },
    forceskip:         { desc: 'Force-skip bypassing any active voteskip',           usage: '/forceskip',              cat: 'dj' },
    stop:              { desc: 'Stop playback and clear the queue',                  usage: '/stop',                   cat: 'dj' },
    shuffle:           { desc: 'Shuffle all tracks in the queue',                    usage: '/shuffle',                cat: 'dj' },
    loop:              { desc: 'Set loop mode (off / track / queue)',                usage: '/loop <mode>',            cat: 'dj' },
    seek:              { desc: 'Jump to a timestamp in the current track',           usage: '/seek <time>',            cat: 'dj' },
    clear:             { desc: 'Clear the queue without stopping playback',          usage: '/clear',                  cat: 'dj' },
    move:              { desc: 'Move a track to a new position',                     usage: '/move <from> <to>',       cat: 'dj' },
    remove:            { desc: 'Remove a track from the queue',                      usage: '/remove <position>',      cat: 'dj' },
    replay:            { desc: 'Restart the current track',                          usage: '/replay',                 cat: 'dj' },
    leave:             { desc: 'Disconnect the bot from voice',                      usage: '/leave',                  cat: 'dj' },
    connect:           { desc: 'Join your voice channel',                            usage: '/connect',                cat: 'dj' },

    forward:           { desc: 'Fast forward by N seconds',                          usage: '/forward <seconds>',      cat: 'playback' },
    rewind:            { desc: 'Rewind by N seconds',                                usage: '/rewind <seconds>',       cat: 'playback' },
    jump:              { desc: 'Jump to a queue position',                           usage: '/jump <position>',        cat: 'playback' },
    previous:          { desc: 'Play the previous track',                            usage: '/previous',               cat: 'playback' },

    volume:            { desc: 'Set playback volume (1–200%)',                       usage: '/volume <level>',         cat: 'premium' },
    filter:            { desc: 'Apply an audio filter',                              usage: '/filter <type>',          cat: 'premium' },

    '247':             { desc: 'Toggle 24/7 — stay in VC when idle',                 usage: '/247',                    cat: 'premium' },
    autoplay:          { desc: 'Toggle auto-play when queue ends',                   usage: '/autoplay',               cat: 'premium' },
    'add-favorite':    { desc: 'Save current track to your favorites',               usage: '/add-favorite',           cat: 'premium' },
    'manage-favorites':{ desc: 'View, play, or remove favorites',                    usage: '/manage-favorites',       cat: 'premium' },
    history:           { desc: 'View your listening history',                        usage: '/history',                cat: 'premium' },
    skipto:            { desc: 'Skip to any position in the queue',                  usage: '/skipto <position>',      cat: 'premium' },

    settings:          { desc: 'View or change server settings',                     usage: '/settings <action>',      cat: 'admin' },
    setdj:             { desc: 'Set the DJ role for this server',                    usage: '/setdj <role>',           cat: 'admin' },
    setvc:             { desc: 'Restrict bot to specific voice channels',             usage: '/setvc <action>',         cat: 'admin' },
    setcommandchannel: { desc: 'Lock commands to one text channel',                  usage: '/setcommandchannel',      cat: 'admin' },
    language:          { desc: 'Change the bot language',                            usage: '/language <code>',        cat: 'admin' },
    announce:          { desc: 'Toggle song announcement messages',                  usage: '/announce',               cat: 'admin' },
    limit:             { desc: 'Set the max queue size',                             usage: '/limit <number>',         cat: 'admin' },
    requester:         { desc: 'Toggle displaying who requested each track',          usage: '/requester',              cat: 'admin' },
    ban:               { desc: 'Ban a user from music commands',                     usage: '/ban <user>',             cat: 'admin' },
    unban:             { desc: 'Unban a user from music commands',                   usage: '/unban <user>',           cat: 'admin' },
    cleanup:           { desc: 'Clean up bot messages in this channel',              usage: '/cleanup [amount]',       cat: 'admin' },
    fix:               { desc: 'Fix common bot issues',                              usage: '/fix',                    cat: 'admin' },
};

const CATS = {
    general: { label: 'General',  icon: emoji.ui.home,          color: 0x5865F2, perm: 'Everyone' },
    music:   { label: 'Music',    icon: emoji.animated.notes,   color: 0xE91E63, perm: 'Everyone' },
    dj:      { label: 'DJ',       icon: emoji.ui.gear,          color: 0x9C27B0, perm: 'DJ Role / Admin' },
    playback:{ label: 'Playback', icon: emoji.controls.play,    color: 0x3F51B5, perm: 'DJ Role / Admin' },
    premium: { label: 'Premium',  icon: emoji.animated.premium, color: 0xF1C40F, perm: 'Premium' },
    admin:   { label: 'Admin',    icon: emoji.ui.gear,          color: 0x95A5A6, perm: 'Administrator' },
};

const CAT_ORDER = ['general', 'music', 'dj', 'playback', 'premium', 'admin'];


function grouped() {
    const g = {};
    for (const [name, cmd] of Object.entries(COMMANDS)) {
        if (!g[cmd.cat]) g[cmd.cat] = [];
        g[cmd.cat].push(name);
    }
    return g;
}

function buildOverview() {
    const g = grouped();
    const total = Object.keys(COMMANDS).length;

    const lines = CAT_ORDER.map(cat => {
        const c = CATS[cat];
        const count = (g[cat] || []).length;
        return `${c.icon}  **${c.label}** — ${count} commands  ·  *${c.perm}*`;
    });

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: 'SpaceBot — Command Help', iconURL: 'https://cdn.discordapp.com/emojis/1475168921169428622.gif' })
        .setDescription(
            `Use the buttons below to browse each category.\n` +
            `Type \`/help command:<name>\` for full details on any command.\n\n` +
            lines.join('\n')
        )
        .setFooter({ text: `${total} total commands  ·  Buttons expire in 3 min` });
}

function buildCategory(catKey) {
    const c = CATS[catKey];
    const g = grouped();
    const names = g[catKey] || [];

    const embed = new EmbedBuilder()
        .setColor(c.color)
        .setAuthor({ name: `${c.label} Commands  ·  ${c.perm}` })
        .setDescription(`*Click a button to switch category. Use \`/help command:<name>\` for details.*\n\u200b`);

    const fields = names.map(name => ({
        name: `\`/${name}\``,
        value: COMMANDS[name].desc,
        inline: true,
    }));

    for (let i = 0; i < fields.length; i += 25) {
        embed.setFields(fields.slice(i, Math.min(i + 25, fields.length)));
    }

    embed.setFooter({ text: `${names.length} commands in this category` });
    return embed;
}

function buildDetail(name) {
    const cmd = COMMANDS[name];
    const c = CATS[cmd.cat];

    return new EmbedBuilder()
        .setColor(c.color)
        .setAuthor({ name: `/${name}` })
        .setDescription(`${cmd.desc}\n\u200b`)
        .addFields(
            { name: 'Usage',      value: `\`${cmd.usage}\``,  inline: true },
            { name: 'Category',   value: `${c.icon} ${c.label}`, inline: true },
            { name: 'Permission', value: c.perm,              inline: true },
        )
        .setFooter({ text: 'Use /help to see all commands' });
}

function buildButtons(userId, activeCat) {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    const half = Math.ceil(CAT_ORDER.length / 2);
    for (let i = 0; i < CAT_ORDER.length; i++) {
        const cat = CAT_ORDER[i];
        const c = CATS[cat];
        const btn = new ButtonBuilder()
            .setCustomId(`help:${userId}:${cat}`)
            .setEmoji(c.icon)
            .setLabel(c.label)
            .setStyle(cat === activeCat ? ButtonStyle.Primary : ButtonStyle.Secondary);
        (i < half ? row1 : row2).addComponents(btn);
    }
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`help:${userId}:tutorial`)
            .setEmoji(emoji.ui.help)
            .setLabel('Quick Start Tutorial')
            .setStyle(activeCat === 'tutorial' ? ButtonStyle.Success : ButtonStyle.Secondary)
    );
    return [row1, row2, row3];
}

function buildDisabledButtons() {
    const row1 = new ActionRowBuilder();
    const row2 = new ActionRowBuilder();
    const half = Math.ceil(CAT_ORDER.length / 2);
    for (let i = 0; i < CAT_ORDER.length; i++) {
        const cat = CAT_ORDER[i];
        const c = CATS[cat];
        const btn = new ButtonBuilder()
            .setCustomId(`help:expired:${cat}`)
            .setEmoji(c.icon)
            .setLabel(c.label)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
        (i < half ? row1 : row2).addComponents(btn);
    }
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('help:expired:tutorial')
            .setEmoji(emoji.ui.help)
            .setLabel('Quick Start Tutorial')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );
    return [row1, row2, row3];
}

function buildTutorial() {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({ name: 'SpaceBot — Quick Start Guide', iconURL: 'https://cdn.discordapp.com/emojis/1475168921169428622.gif' })
        .setDescription(`Welcome to SpaceBot! Here's how to get started in under a minute.\n\u200b`)
        .addFields(
            {
                name: `${emoji.controls.play}  Step 1 — Play Music`,
                value:
                    'Use `/play <song name or URL>` to start playing music.\n' +
                    'Supports YouTube, Spotify, SoundCloud, and Apple Music links.\n' +
                    'Example: `/play Blinding Lights`',
                inline: false,
            },
            {
                name: `${emoji.controls.next}  Step 2 — Skip & Control`,
                value:
                    '`/skip` — Skip the current track\n' +
                    '`/pause` / `/resume` — Pause or resume\n' +
                    '`/queue` — See what\'s queued up\n' +
                    '`/stop` — Stop and clear the queue',
                inline: false,
            },
            {
                name: `${emoji.ui.gear}  Step 3 — Server Setup (Admins)`,
                value:
                    '`/setdj <set|unset|view> [role]` — Set who can use DJ controls\n' +
                    '`/setvc <set|unset|view> [channel]` — Restrict bot to a voice channel\n'+
                    '`/setcommandchannel <set|clear|status> [channel]` — Lock commands to one channel',
                inline: false,
            },
            {
                name: `${emoji.animated.premium}  Step 4 — Premium Features`,
                value:
                    'Premium unlocks audio filters, 24/7 mode, favorites, history, and more.\n' +
                    'Use `/premiumstatus` to check if your server has premium.\n' +
                    '[Get Premium →](https://spacebot.me)',
                inline: false,
            },
            {
                name: `${emoji.ui.help}  Need Help?`,
                value:
                    'Use `/help command:<name>` for detailed info on any command.\n' +
                    'Join the [Support Server](https://discord.gg/CFRKf8mXe4) if you\'re stuck.',
                inline: false,
            }
        )
        .setFooter({ text: 'SpaceBot • Use the category buttons to explore all commands' });
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all SpaceBot commands or get details about a specific one')
        .addStringOption(opt =>
            opt.setName('command')
                .setDescription('Get details about a specific command')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    category: 'everyone',

    async autocomplete(interaction) {
        const query = interaction.options.getFocused().toLowerCase();
        const results = Object.keys(COMMANDS)
            .filter(name => name.includes(query) || COMMANDS[name].desc.toLowerCase().includes(query))
            .slice(0, 25)
            .map(name => ({
                name: `/${name}  —  ${COMMANDS[name].desc.slice(0, 60)}`,
                value: name,
            }));
        await interaction.respond(results);
    },

    async execute(interaction) {
        const cmdName = interaction.options.getString('command')?.toLowerCase();

        if (cmdName) {
            if (!COMMANDS[cmdName]) {
                const suggestions = Object.keys(COMMANDS)
                    .filter(n => n.includes(cmdName))
                    .slice(0, 4)
                    .map(n => `\`/${n}\``);
                return interaction.reply({
                    content: `${emoji.status.error} Command \`/${cmdName}\` not found.` +
                        (suggestions.length ? `\n\nDid you mean: ${suggestions.join(', ')}?` : ''),
                    flags: MessageFlags.Ephemeral,
                });
            }
            return interaction.reply({ embeds: [buildDetail(cmdName)], flags: MessageFlags.Ephemeral });
        }

        const reply = await interaction.reply({
            embeds: [buildOverview()],
            components: buildButtons(interaction.user.id, null),
            flags: MessageFlags.Ephemeral,
        });

        const collector = reply.createMessageComponentCollector({ time: 180_000 });

        collector.on('collect', async btn => {
            if (btn.user.id !== interaction.user.id) {
                return btn.reply({ content: `${emoji.status.error} This menu isn't yours.`, flags: MessageFlags.Ephemeral });
            }
            const [, , cat] = btn.customId.split(':');
            if (cat === 'tutorial') {
                await btn.update({
                    embeds: [buildTutorial()],
                    components: buildButtons(interaction.user.id, 'tutorial'),
                });
            } else {
                await btn.update({
                    embeds: [buildCategory(cat)],
                    components: buildButtons(interaction.user.id, cat),
                });
            }
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: buildDisabledButtons() });
            } catch {  }
        });
    },
};
