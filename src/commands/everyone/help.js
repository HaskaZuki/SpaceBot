const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const commandDetails = {
    play: {
        description: 'Play a song from YouTube, SoundCloud, Spotify, or a direct URL',
        usage: '/play <song>',
        options: [
            { name: 'song', type: 'String', required: true, desc: 'Song name, URL, or playlist link' }
        ],
        examples: ['/play never gonna give you up', '/play https://open.spotify.com/track/...'],
        category: 'everyone',
        cooldown: '3s'
    },
    search: {
        description: 'Search for a song across multiple sources and pick from results',
        usage: '/search <query> [source]',
        options: [
            { name: 'query', type: 'String', required: true, desc: 'Song name to search' },
            { name: 'source', type: 'String', required: false, desc: 'Music source: YouTube, YouTube Music, SoundCloud, Spotify' }
        ],
        examples: ['/search lofi beats', '/search chill vibes source:soundcloud'],
        category: 'everyone',
        cooldown: '5s'
    },
    nowplaying: {
        description: 'Show the currently playing track with a visual progress bar, source, requester, and queue info',
        usage: '/nowplaying',
        options: [],
        examples: ['/nowplaying'],
        category: 'everyone'
    },
    queue: {
        description: 'View the current music queue with track list and total duration',
        usage: '/queue',
        options: [],
        examples: ['/queue'],
        category: 'everyone'
    },
    lyrics: {
        description: 'Fetch and display lyrics for the current song or a custom search query',
        usage: '/lyrics [query]',
        options: [
            { name: 'query', type: 'String', required: false, desc: 'Song name (uses current song if empty)' }
        ],
        examples: ['/lyrics', '/lyrics imagine dragons believer'],
        category: 'everyone'
    },
    grab: {
        description: 'Save the currently playing song info to your DMs for later',
        usage: '/grab',
        options: [],
        examples: ['/grab'],
        category: 'everyone'
    },
    leaderboard: {
        description: 'View the top 10 listeners in the server ranked by total plays',
        usage: '/leaderboard [period]',
        options: [
            { name: 'period', type: 'String', required: false, desc: 'Time period: Today, This Week, This Month, All Time' }
        ],
        examples: ['/leaderboard', '/leaderboard period:This Week'],
        category: 'everyone'
    },
    songinfo: {
        description: 'Get detailed information about the currently playing track',
        usage: '/songinfo',
        options: [],
        examples: ['/songinfo'],
        category: 'everyone'
    },
    voteskip: {
        description: 'Start a vote to skip the current track (requires 50% of voice channel)',
        usage: '/voteskip',
        options: [],
        examples: ['/voteskip'],
        category: 'everyone'
    },
    playlist: {
        description: 'Create, view, load, and manage your personal playlists',
        usage: '/playlist <action> [name]',
        options: [
            { name: 'action', type: 'String', required: true, desc: 'create, view, load, delete, add, remove, list' },
            { name: 'name', type: 'String', required: false, desc: 'Playlist name' }
        ],
        examples: ['/playlist create My Vibes', '/playlist load My Vibes', '/playlist list'],
        category: 'everyone'
    },
    'export-playlist': {
        description: 'Export a playlist to a shareable text file',
        usage: '/export-playlist <name>',
        options: [
            { name: 'name', type: 'String', required: true, desc: 'Playlist name to export' }
        ],
        examples: ['/export-playlist My Vibes'],
        category: 'everyone'
    },
    playerstats: {
        description: 'View listening statistics for yourself or another user',
        usage: '/playerstats [user]',
        options: [
            { name: 'user', type: 'User', required: false, desc: 'User to check stats for (defaults to you)' }
        ],
        examples: ['/playerstats', '/playerstats @username'],
        category: 'everyone'
    },
    premiumstatus: {
        description: 'Check the premium status of the current server',
        usage: '/premiumstatus',
        options: [],
        examples: ['/premiumstatus'],
        category: 'everyone'
    },
    ping: {
        description: 'Check the bot\'s latency and API response time',
        usage: '/ping',
        options: [],
        examples: ['/ping'],
        category: 'everyone'
    },
    updates: {
        description: 'View the latest bot updates and changelog',
        usage: '/updates',
        options: [],
        examples: ['/updates'],
        category: 'everyone'
    },
    pause: {
        description: 'Pause the current track playback',
        usage: '/pause',
        options: [],
        examples: ['/pause'],
        category: 'dj'
    },
    resume: {
        description: 'Resume paused track playback',
        usage: '/resume',
        options: [],
        examples: ['/resume'],
        category: 'dj'
    },
    skip: {
        description: 'Skip the current track and play the next one in queue',
        usage: '/skip',
        options: [],
        examples: ['/skip'],
        category: 'dj'
    },
    stop: {
        description: 'Stop playback completely and clear the queue',
        usage: '/stop',
        options: [],
        examples: ['/stop'],
        category: 'dj'
    },
    shuffle: {
        description: 'Randomly shuffle all tracks in the queue',
        usage: '/shuffle',
        options: [],
        examples: ['/shuffle'],
        category: 'dj'
    },
    loop: {
        description: 'Set the loop mode for playback',
        usage: '/loop <mode>',
        options: [
            { name: 'mode', type: 'String', required: true, desc: 'off, track, or queue' }
        ],
        examples: ['/loop track', '/loop queue', '/loop off'],
        category: 'dj'
    },
    seek: {
        description: 'Jump to a specific timestamp in the current track',
        usage: '/seek <time>',
        options: [
            { name: 'time', type: 'String', required: true, desc: 'Timestamp (e.g. 1:30, 0:45)' }
        ],
        examples: ['/seek 1:30', '/seek 2:00'],
        category: 'dj'
    },
    clear: {
        description: 'Clear the entire music queue without stopping the current track',
        usage: '/clear',
        options: [],
        examples: ['/clear'],
        category: 'dj'
    },
    move: {
        description: 'Move a track from one queue position to another',
        usage: '/move <from> <to>',
        options: [
            { name: 'from', type: 'Integer', required: true, desc: 'Current position' },
            { name: 'to', type: 'Integer', required: true, desc: 'New position' }
        ],
        examples: ['/move 5 1'],
        category: 'dj'
    },
    remove: {
        description: 'Remove a specific track from the queue by position',
        usage: '/remove <position>',
        options: [
            { name: 'position', type: 'Integer', required: true, desc: 'Queue position to remove' }
        ],
        examples: ['/remove 3'],
        category: 'dj'
    },
    replay: {
        description: 'Restart the currently playing track from the beginning',
        usage: '/replay',
        options: [],
        examples: ['/replay'],
        category: 'dj'
    },
    leave: {
        description: 'Disconnect the bot from the voice channel',
        usage: '/leave',
        options: [],
        examples: ['/leave'],
        category: 'dj'
    },
    forward: {
        description: 'Fast forward the current track by a specified amount',
        usage: '/forward <seconds>',
        options: [
            { name: 'seconds', type: 'Integer', required: true, desc: 'Seconds to skip forward' }
        ],
        examples: ['/forward 10', '/forward 30'],
        category: 'playback'
    },
    rewind: {
        description: 'Rewind the current track by a specified amount',
        usage: '/rewind <seconds>',
        options: [
            { name: 'seconds', type: 'Integer', required: true, desc: 'Seconds to rewind' }
        ],
        examples: ['/rewind 10'],
        category: 'playback'
    },
    jump: {
        description: 'Jump to a specific position in the queue and play it',
        usage: '/jump <position>',
        options: [
            { name: 'position', type: 'Integer', required: true, desc: 'Queue position to jump to' }
        ],
        examples: ['/jump 5'],
        category: 'playback'
    },
    previous: {
        description: 'Play the previous track from history',
        usage: '/previous',
        options: [],
        examples: ['/previous'],
        category: 'playback'
    },
    volume: {
        description: 'Adjust the playback volume (1-200%)',
        usage: '/volume <level>',
        options: [
            { name: 'level', type: 'Integer', required: true, desc: 'Volume level (1-200)' }
        ],
        examples: ['/volume 80', '/volume 150'],
        category: 'premium'
    },
    filter: {
        description: 'Apply audio filters to the playback',
        usage: '/filter <type>',
        options: [
            { name: 'type', type: 'String', required: true, desc: 'Filter type to apply' }
        ],
        examples: ['/filter bassboost', '/filter nightcore'],
        category: 'premium'
    },
    bassboost: {
        description: 'Toggle bass boost effect on the current playback',
        usage: '/bassboost',
        options: [],
        examples: ['/bassboost'],
        category: 'premium'
    },
    nightcore: {
        description: 'Toggle nightcore effect (faster + higher pitch)',
        usage: '/nightcore',
        options: [],
        examples: ['/nightcore'],
        category: 'premium'
    },
    vaporwave: {
        description: 'Toggle vaporwave effect (slower + lower pitch)',
        usage: '/vaporwave',
        options: [],
        examples: ['/vaporwave'],
        category: 'premium'
    },
    demon: {
        description: 'Toggle demon voice effect (deep pitch shift)',
        usage: '/demon',
        options: [],
        examples: ['/demon'],
        category: 'premium'
    },
    speed: {
        description: 'Adjust the playback speed of the current track',
        usage: '/speed <rate>',
        options: [
            { name: 'rate', type: 'Number', required: true, desc: 'Speed multiplier (0.5-2.0)' }
        ],
        examples: ['/speed 1.5', '/speed 0.75'],
        category: 'premium'
    },
    '247': {
        description: 'Toggle 24/7 mode — bot stays in voice channel even when idle',
        usage: '/247',
        options: [],
        examples: ['/247'],
        category: 'premium'
    },
    autoplay: {
        description: 'Toggle autoplay — automatically plays similar tracks when queue is empty',
        usage: '/autoplay',
        options: [],
        examples: ['/autoplay'],
        category: 'premium'
    },
    'add-favorite': {
        description: 'Save the currently playing track to your favorites',
        usage: '/add-favorite',
        options: [],
        examples: ['/add-favorite'],
        category: 'premium'
    },
    'manage-favorites': {
        description: 'View, play, or remove tracks from your favorites list',
        usage: '/manage-favorites <action>',
        options: [
            { name: 'action', type: 'String', required: true, desc: 'list, play, remove' }
        ],
        examples: ['/manage-favorites list', '/manage-favorites play'],
        category: 'premium'
    },
    history: {
        description: 'View your recent listening history in this server',
        usage: '/history',
        options: [],
        examples: ['/history'],
        category: 'premium'
    },
    'lyrics-sync': {
        description: 'View synchronized lyrics that highlight the current line being played',
        usage: '/lyrics-sync',
        options: [],
        examples: ['/lyrics-sync'],
        category: 'premium'
    },
    skipto: {
        description: 'Skip to a specific position in the queue, removing all tracks before it',
        usage: '/skipto <position>',
        options: [
            { name: 'position', type: 'Integer', required: true, desc: 'Queue position to skip to' }
        ],
        examples: ['/skipto 5', '/skipto 3'],
        category: 'premium'
    },
    settings: {
        description: 'View or modify server bot settings',
        usage: '/settings <action>',
        options: [
            { name: 'action', type: 'String', required: true, desc: 'view, reset, or specific setting' }
        ],
        examples: ['/settings view', '/settings reset'],
        category: 'admin'
    },
    setup: {
        description: 'Setup a dedicated music channel with player embed and controls',
        usage: '/setup',
        options: [],
        examples: ['/setup'],
        category: 'admin'
    },
    setdj: {
        description: 'Set or remove the DJ role for music controls',
        usage: '/setdj <role>',
        options: [
            { name: 'role', type: 'Role', required: true, desc: 'Role to set as DJ' }
        ],
        examples: ['/setdj @DJ'],
        category: 'admin'
    },
    setvc: {
        description: 'Restrict bot to specific voice channels',
        usage: '/setvc <action> [channel]',
        options: [
            { name: 'action', type: 'String', required: true, desc: 'add, remove, list, clear' },
            { name: 'channel', type: 'Channel', required: false, desc: 'Voice channel to add/remove' }
        ],
        examples: ['/setvc add #music-vc', '/setvc list'],
        category: 'admin'
    },
    language: {
        description: 'Change the bot language for this server',
        usage: '/language <lang>',
        options: [
            { name: 'lang', type: 'String', required: true, desc: 'Language code (en, id, ja, ko, etc.)' }
        ],
        examples: ['/language id', '/language en'],
        category: 'admin'
    },
    announce: {
        description: 'Toggle song announcement messages when a new track starts',
        usage: '/announce',
        options: [],
        examples: ['/announce'],
        category: 'admin'
    },
    limit: {
        description: 'Set maximum queue size for this server',
        usage: '/limit <number>',
        options: [
            { name: 'number', type: 'Integer', required: true, desc: 'Max queue size (0 = unlimited)' }
        ],
        examples: ['/limit 50', '/limit 0'],
        category: 'admin'
    },
    requester: {
        description: 'Toggle showing who requested each song in the queue',
        usage: '/requester',
        options: [],
        examples: ['/requester'],
        category: 'admin'
    },
    ban: {
        description: 'Ban a user from using music commands in this server',
        usage: '/ban <user>',
        options: [
            { name: 'user', type: 'User', required: true, desc: 'User to ban' }
        ],
        examples: ['/ban @username'],
        category: 'admin'
    },
    unban: {
        description: 'Unban a previously banned user from music commands',
        usage: '/unban <user>',
        options: [
            { name: 'user', type: 'User', required: true, desc: 'User to unban' }
        ],
        examples: ['/unban @username'],
        category: 'admin'
    },
    cleanup: {
        description: 'Clean up bot messages in the current channel',
        usage: '/cleanup [amount]',
        options: [
            { name: 'amount', type: 'Integer', required: false, desc: 'Number of messages to clean (default: 50)' }
        ],
        examples: ['/cleanup', '/cleanup 100'],
        category: 'admin'
    },
    fix: {
        description: 'Fix common bot issues (stuck player, broken queue)',
        usage: '/fix',
        options: [],
        examples: ['/fix'],
        category: 'admin'
    }
};

const categoryConfig = {
    everyone: { emoji: '🎵', label: 'Music', color: '#e91e63', permission: 'Everyone' },
    dj: { emoji: '🎚️', label: 'DJ Controls', color: '#9c27b0', permission: 'DJ Role / Admin' },
    playback: { emoji: '⏯️', label: 'Playback', color: '#3F51B5', permission: 'DJ Role / Admin' },
    premium: { emoji: '💎', label: 'Premium', color: '#f1c40f', permission: 'Premium Server' },
    admin: { emoji: '⚙️', label: 'Admin', color: '#95a5a6', permission: 'Administrator' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all commands or get detailed info about a specific command')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get detailed info about a specific command')
                .setRequired(false)
                .setAutocomplete(true)),
    
    category: 'everyone',

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = Object.keys(commandDetails)
            .filter(cmd => cmd.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(cmd => ({
                name: `/${cmd} — ${commandDetails[cmd].description.slice(0, 70)}`,
                value: cmd
            }));
        
        await interaction.respond(choices);
    },

    async execute(interaction) {
        const specificCommand = interaction.options.getString('command');

        if (specificCommand) {
            return showCommandDetail(interaction, specificCommand.toLowerCase());
        }

        return showOverview(interaction);
    },
};

async function showCommandDetail(interaction, cmdName) {
    const cmd = commandDetails[cmdName];
    if (!cmd) {
        const suggestions = Object.keys(commandDetails)
            .filter(c => c.includes(cmdName) || cmdName.includes(c))
            .slice(0, 5);
        
        const suggestionText = suggestions.length > 0
            ? `\n\nDid you mean: ${suggestions.map(s => `\`/${s}\``).join(', ')}?`
            : '';
            
        return interaction.reply({ 
            content: `❌ Command \`/${cmdName}\` not found.${suggestionText}`, 
            flags: 64 
        });
    }

    const cat = categoryConfig[cmd.category] || categoryConfig.everyone;

    let optionsText = '*No options*';
    if (cmd.options && cmd.options.length > 0) {
        optionsText = cmd.options.map(opt => {
            const reqTag = opt.required ? '`REQUIRED`' : '`optional`';
            return `> \`${opt.name}\` (${opt.type}) ${reqTag}\n> ${opt.desc}`;
        }).join('\n\n');
    }

    const embed = new EmbedBuilder()
        .setColor(cat.color)
        .setTitle(`${cat.emoji} /${cmdName}`)
        .setDescription(cmd.description)
        .addFields(
            { name: '📋 Usage', value: `\`${cmd.usage}\``, inline: true },
            { name: '📂 Category', value: `${cat.emoji} ${cat.label}`, inline: true },
            { name: '🔑 Permission', value: cat.permission, inline: true },
            { name: '⚙️ Options', value: optionsText }
        );

    if (cmd.examples && cmd.examples.length > 0) {
        embed.addFields({
            name: '💡 Examples',
            value: cmd.examples.map(e => `\`${e}\``).join('\n')
        });
    }

    if (cmd.cooldown) {
        embed.addFields({ name: '⏰ Cooldown', value: cmd.cooldown, inline: true });
    }

    embed.setFooter({ text: 'Use /help to see all commands' });

    await interaction.reply({ embeds: [embed], flags: 64 });
}

async function showOverview(interaction) {
    const categories = {};
    for (const [name, cmd] of Object.entries(commandDetails)) {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        categories[cmd.category].push(name);
    }

    const embeds = [];

    const mainEmbed = new EmbedBuilder()
        .setColor('#7C3AED')
        .setTitle('📖 Space Music — Command Guide')
        .setDescription(
            '**Use the menu below to browse commands by category.**\n' +
            'For detailed info on any command: `/help command:<name>`\n\n' +
            `🎵 **${Object.keys(commandDetails).length}** commands available across **${Object.keys(categoryConfig).length}** categories`
        );

    const categoryOrder = ['everyone', 'dj', 'playback', 'premium', 'admin'];
    for (const catKey of categoryOrder) {
        const cat = categoryConfig[catKey];
        const cmds = categories[catKey] || [];
        if (cmds.length === 0) continue;
        mainEmbed.addFields({
            name: `${cat.emoji} ${cat.label} (${cmds.length})`,
            value: cmds.map(c => `\`/${c}\``).join(', '),
            inline: false
        });
    }

    mainEmbed.setFooter({ text: 'Select a category below for details, or use /help command:<name>' });
    embeds.push(mainEmbed);

    const menuOptions = categoryOrder
        .filter(catKey => categories[catKey]?.length > 0)
        .map(catKey => {
            const cat = categoryConfig[catKey];
            return {
                label: cat.label,
                description: `${(categories[catKey] || []).length} commands — ${cat.permission}`,
                value: catKey,
                emoji: cat.emoji
            };
        });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`help_category_${interaction.user.id}`)
        .setPlaceholder('📂 Select a category for details...')
        .addOptions(menuOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const reply = await interaction.reply({ 
        embeds: embeds, 
        components: [row], 
        flags: 64 
    });

    const collector = reply.createMessageComponentCollector({ 
        time: 120_000 
    });

    collector.on('collect', async (menuInteraction) => {
        if (menuInteraction.user.id !== interaction.user.id) {
            return menuInteraction.reply({ content: '❌ This menu is not for you!', flags: 64 });
        }

        const selectedCategory = menuInteraction.values[0];
        const cat = categoryConfig[selectedCategory];
        const cmds = categories[selectedCategory] || [];

        const detailEmbed = new EmbedBuilder()
            .setColor(cat.color)
            .setTitle(`${cat.emoji} ${cat.label} Commands`)
            .setDescription(`**Permission:** ${cat.permission}\n\n`);

        const fields = cmds.map(cmdName => {
            const cmd = commandDetails[cmdName];
            return {
                name: `\`${cmd.usage}\``,
                value: cmd.description.length > 80 ? cmd.description.slice(0, 77) + '...' : cmd.description,
                inline: true
            };
        });

        for (let i = 0; i < fields.length; i += 25) {
            detailEmbed.setFields(fields.slice(i, i + 25));
        }

        detailEmbed.setFooter({ text: `${cmds.length} commands • /help command:<name> for details` });

        await menuInteraction.update({ embeds: [detailEmbed], components: [row] });
    });

    collector.on('end', async () => {
        try {
            await interaction.editReply({ components: [] });
        } catch {
            // Message might be deleted
        }
    });
}
