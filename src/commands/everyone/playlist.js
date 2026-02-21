const { SlashCommandBuilder } = require('discord.js');
const storage = require('../../utils/storage');
const musicPlayer = require('../../utils/musicPlayer');
const { validateVoiceState, sanitizeInput, isValidLength } = require('../../utils/validators');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage your personal playlists')
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('Create a new playlist')
                .addStringOption(opt =>
                    opt.setName('name')
                        .setDescription('Playlist name (max 50 chars)')
                        .setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add current track to a playlist')
                .addStringOption(opt =>
                    opt.setName('playlist')
                        .setDescription('Playlist name')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(sub =>
            sub.setName('play')
                .setDescription('Play entire playlist')
                .addStringOption(opt =>
                    opt.setName('playlist')
                        .setDescription('Playlist name')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Show all your playlists'))
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View tracks in a playlist')
                .addStringOption(opt =>
                    opt.setName('playlist')
                        .setDescription('Playlist name')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a playlist')
                .addStringOption(opt =>
                    opt.setName('playlist')
                        .setDescription('Playlist name')
                        .setRequired(true)
                        .setAutocomplete(true))),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const subcommand = interaction.options.getSubcommand();
        
        try {
            if (subcommand === 'create') {
                return await this.handleCreate(interaction, userId);
            } else if (subcommand === 'add') {
                return await this.handleAdd(interaction, userId);
            } else if (subcommand === 'play') {
                return await this.handlePlay(interaction, userId);
            } else if (subcommand === 'list') {
                return await this.handleList(interaction, userId);
            } else if (subcommand === 'view') {
                return await this.handleView(interaction, userId);
            } else if (subcommand === 'delete') {
                return await this.handleDelete(interaction, userId);
            }
        } catch (error) {
            console.error('Playlist command error:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            }
        }
    },
    
    async handleCreate(interaction, userId) {
        const name = sanitizeInput(interaction.options.getString('name'));
        
        if (!isValidLength(name, 1, 50)) {
            return interaction.reply({ content: '❌ Playlist name must be 1-50 characters!', ephemeral: true });
        }
        
        let userPlaylists = await storage.getUser('playlists', userId);
        if (!userPlaylists) {
            userPlaylists = { userId, playlists: [], maxPlaylists: 10 };
        }
        
        if (userPlaylists.playlists.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            return interaction.reply({ content: `❌ Playlist "**${name}**" already exists!`, ephemeral: true });
        }
        
        if (userPlaylists.playlists.length >= userPlaylists.maxPlaylists) {
            return interaction.reply({ content: `❌ Max playlists reached (${userPlaylists.maxPlaylists})!`, ephemeral: true });
        }
        
        userPlaylists.playlists.push({
            name,
            tracks: [],
            createdAt: new Date().toISOString()
        });
        
        const success = await storage.setUser('playlists', userId, userPlaylists);
        if (success) {
            await interaction.reply({
                content: `✅ Created playlist "**${name}**"!\n\nUse \`/playlist add\` to add tracks.`,
                ephemeral: true
            });
        } else {
            await interaction.reply({ content: '❌ Failed to create playlist!', ephemeral: true });
        }
    },
    
    async handleAdd(interaction, userId) {
        const playlistName = interaction.options.getString('playlist');
        const guildId = interaction.guild.id;
        
        const playerState = musicPlayer.players.get(guildId);
        if (!playerState?.currentTrack) {
            return interaction.reply({ content: '❌ No track playing!', ephemeral: true });
        }
        
        const userPlaylists = await storage.getUser('playlists', userId);
        if (!userPlaylists) {
            return interaction.reply({ content: '❌ No playlists found! Use `/playlist create` first.', ephemeral: true });
        }
        
        const playlist = userPlaylists.playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
        if (!playlist) {
            return interaction.reply({ content: `❌ Playlist "**${playlistName}**" not found!`, ephemeral: true });
        }
        
        const track = {
            encoded: playerState.currentTrack.encoded,
            info: playerState.currentTrack.info,
            addedAt: new Date().toISOString()
        };
        
        if (playlist.tracks.some(t => t.info.uri === track.info.uri)) {
            return interaction.reply({ content: `❌ Track already in playlist!`, ephemeral: true });
        }
        
        playlist.tracks.push(track);
        const success = await storage.setUser('playlists', userId, userPlaylists);
        
        if (success) {
            await interaction.reply({
                content: `➕ Added **${track.info.title}** to "**${playlistName}**"!\n\nTotal tracks: ${playlist.tracks.length}`,
                ephemeral: true
            });
        } else {
            await interaction.reply({ content: '❌ Failed to add track!', ephemeral: true });
        }
    },
    
    async handlePlay(interaction, userId) {
        const playlistName = interaction.options.getString('playlist');
        
        const voiceCheck = validateVoiceState(interaction.member, interaction.guild);
        if (!voiceCheck.valid) {
            return interaction.reply({ content: `❌ ${voiceCheck.error}`, ephemeral: true });
        }
        
        const userPlaylists = await storage.getUser('playlists', userId);
        if (!userPlaylists) {
            return interaction.reply({ content: '❌ No playlists found!', ephemeral: true });
        }
        
        const playlist = userPlaylists.playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
        if (!playlist) {
            return interaction.reply({ content: `❌ Playlist "**${playlistName}**" not found!`, ephemeral: true });
        }
        
        if (playlist.tracks.length === 0) {
            return interaction.reply({ content: `❌ Playlist is empty!`, ephemeral: true });
        }
        
        await interaction.deferReply();
        
        let added = 0;
        for (const track of playlist.tracks) {
            try {
                await musicPlayer.playTrack(
                    interaction.client,
                    interaction.guild.id,
                    interaction.member.voice.channel.id,
                    track.info.uri,
                    interaction.channel
                );
                added++;
            } catch (error) {
                console.error('Error adding track:', error);
            }
        }
        
        await interaction.editReply({
            content: `🎵 Playing playlist "**${playlistName}**"!\n\nAdded ${added}/${playlist.tracks.length} tracks to queue.`
        });
    },
    
    async handleList(interaction, userId) {
        const userPlaylists = await storage.getUser('playlists', userId);
        if (!userPlaylists || userPlaylists.playlists.length === 0) {
            return interaction.reply({ content: '❌ No playlists yet! Use `/playlist create`.', ephemeral: true });
        }
        
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`📝 Your Playlists (${userPlaylists.playlists.length}/${userPlaylists.maxPlaylists})`)
            .setDescription(
                userPlaylists.playlists.map((p, idx) =>
                    `**${idx + 1}.** \`${p.name}\` - ${p.tracks.length} tracks`
                ).join('\n')
            );
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
    
    async handleView(interaction, userId) {
        const playlistName = interaction.options.getString('playlist');
        const userPlaylists = await storage.getUser('playlists', userId);
        
        if (!userPlaylists) {
            return interaction.reply({ content: '❌ No playlists found!', ephemeral: true });
        }
        
        const playlist = userPlaylists.playlists.find(p => p.name.toLowerCase() === playlistName.toLowerCase());
        if (!playlist) {
            return interaction.reply({ content: `❌ Playlist "**${playlistName}**" not found!`, ephemeral: true });
        }
        
        if (playlist.tracks.length === 0) {
            return interaction.reply({ content: `📝 Playlist "**${playlistName}**" is empty!`, ephemeral: true });
        }
        
        const { EmbedBuilder } = require('discord.js');
        const { formatTime } = require('../../utils/validators');
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`📝 ${playlistName}`)
            .setDescription(
                playlist.tracks.slice(0, 10).map((t, idx) =>
                    `**${idx + 1}.** [${t.info.title}](${t.info.uri})\n└ ${t.info.author} • ${formatTime(t.info.length)}`
                ).join('\n\n')
            )
            .setFooter({ text: `${playlist.tracks.length} total tracks` });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
    
    async handleDelete(interaction, userId) {
        const playlistName = interaction.options.getString('playlist');
        const userPlaylists = await storage.getUser('playlists', userId);
        
        if (!userPlaylists) {
            return interaction.reply({ content: '❌ No playlists found!', ephemeral: true });
        }
        
        const idx = userPlaylists.playlists.findIndex(p => p.name.toLowerCase() === playlistName.toLowerCase());
        if (idx === -1) {
            return interaction.reply({ content: `❌ Playlist "**${playlistName}**" not found!`, ephemeral: true });
        }
        
        const deleted = userPlaylists.playlists.splice(idx, 1)[0];
        const success = await storage.setUser('playlists', userId, userPlaylists);
        
        if (success) {
            await interaction.reply({
                content: `🗑️ Deleted playlist "**${deleted.name}**" (${deleted.tracks.length} tracks)`,
                ephemeral: true
            });
        } else {
            await interaction.reply({ content: '❌ Failed to delete playlist!', ephemeral: true });
        }
    },
    
    async autocomplete(interaction) {
        const userId = interaction.user.id;
        const userPlaylists = await storage.getUser('playlists', userId);
        
        if (!userPlaylists || userPlaylists.playlists.length === 0) {
            return interaction.respond([]);
        }
        
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = userPlaylists.playlists
            .filter(p => p.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(p => ({ name: `${p.name} (${p.tracks.length} tracks)`, value: p.name }));
        
        await interaction.respond(choices);
    }
};