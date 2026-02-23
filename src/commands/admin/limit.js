const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('limit')
        .setDescription('Configure song limits')
        .addStringOption(opt => 
            opt.setName('type')
                .setDescription('Type of limit')
                .setRequired(true)
                .addChoices({ name: 'Duration', value: 'maxSongDuration' }, { name: 'Count', value: 'maxSongCount' }))
        .addIntegerOption(opt => opt.setName('value').setDescription('Value in seconds/count (0 = unlimited)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const val = interaction.options.getInteger('value');
        const guildId = interaction.guild.id;

        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }
            
            config[type] = val;
            await config.save();
            
            const typeName = type === 'maxSongDuration' ? 'Duration' : 'Count';
            await interaction.reply(`${emoji.status.success} ${typeName} limit set to **${val}** ${type === 'maxSongDuration' ? 'seconds' : 'songs'}`);
        } catch (error) {
            console.error('limit error:', error);
            await interaction.reply({ content: 'Failed to update limit.', flags: 64 });
        }
    },
};
