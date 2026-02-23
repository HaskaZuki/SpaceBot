const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Sets the bot language')
        .addStringOption(opt => opt
            .setName('lang')
            .setDescription('Language code')
            .setRequired(true)
            .addChoices(
                { name: '🇺🇸 English', value: 'en' },
                { name: '🇮🇩 Indonesia', value: 'id' },
                { name: '🇪🇸 Spanish', value: 'es' },
                { name: '🇫🇷 French', value: 'fr' },
                { name: '🇩🇪 German', value: 'de' },
                { name: '🇯🇵 Japanese', value: 'ja' },
                { name: '🇰🇷 Korean', value: 'ko' },
                { name: '🇧🇷 Portuguese', value: 'pt' },
                { name: '🇷🇺 Russian', value: 'ru' },
                { name: '🇨🇳 Chinese', value: 'zh' },
                { name: '🇹🇭 Thai', value: 'th' }
            ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const lang = interaction.options.getString('lang');
        const guildId = interaction.guild.id;
        
        try {
            let config = await GuildConfig.findOne({ guildId });
            if (!config) {
                config = await GuildConfig.create({ guildId });
            }
            
            config.language = lang;
            await config.save();
            
            const langNames = { 
                en: '🇺🇸 English', id: '🇮🇩 Indonesia', es: '🇪🇸 Spanish',
                fr: '🇫🇷 French', de: '🇩🇪 German', ja: '🇯🇵 Japanese',
                ko: '🇰🇷 Korean', pt: '🇧🇷 Portuguese', ru: '🇷🇺 Russian',
                zh: '🇨🇳 Chinese', th: '🇹🇭 Thai'
            };
            await interaction.reply(`${emoji.status.success} Language set to **${langNames[lang] || lang}**`);
        } catch (error) {
            console.error('language error:', error);
            await interaction.reply({ content: 'Failed to update language.', flags: 64 });
        }
    },
};
