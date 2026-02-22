const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('export-playlist')
        .setDescription('Export playlist to Spotify/YouTube (Free for everyone!)')
        .addStringOption(opt =>
            opt.setName('playlist')
                .setDescription('Playlist name to export')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(opt =>
            opt.setName('platform')
                .setDescription('Export to which platform')
                .setRequired(true)
                .addChoices(
                    { name: '🎵 Spotify', value: 'spotify' },
                    { name: '📺 YouTube Music', value: 'youtube' },
                    { name: '🍎 Apple Music', value: 'apple' }
                )),
    
    async execute(interaction) {
        
        const playlistName = interaction.options.getString('playlist');
        const platform = interaction.options.getString('platform');
        
        await interaction.reply({
            content: `📤 **Export Playlist**\n\n` +
                    `Playlist: **${playlistName}**\n` +
                    `Platform: **${platform}**\n\n` +
                    '⚠️ Cross-platform integration under development!\n\n' +
                    'Planned features:\n' +
                    '• One-click export to Spotify\n' +
                    '• Automatic playlist sync\n' +
                    '• Import from other platforms\n' +
                    '• Share playlists publicly\n\n' +
                    'Step-by-step export will begin shortly...',
            flags: MessageFlags.Ephemeral
        });
    },
    
    async autocomplete(interaction) {
        const userId = interaction.user.id;
        const storage = require('../../utils/storage');
        const userPlaylists = await storage.getUser('playlists', userId);
        
        if (!userPlaylists) return interaction.respond([]);
        
        const focused = interaction.options.getFocused().toLowerCase();
        const choices = userPlaylists.playlists
            .filter(p => p.name.toLowerCase().includes(focused))
            .slice(0, 25)
            .map(p => ({ name: p.name, value: p.name }));
        
        await interaction.respond(choices);
    }
};
