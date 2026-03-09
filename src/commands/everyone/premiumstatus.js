const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const UserSettings = require('../../models/UserSettings');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('premiumstatus')
        .setDescription('Check server premium status'),
    async execute(interaction) {
        const [guildConfig, userSettings] = await Promise.all([
            GuildConfig.findOne({ guildId: interaction.guild.id }),
            UserSettings.findOne({ userId: interaction.user.id })
        ]);
        const isServerPrem = guildConfig && guildConfig.isPremium;
        const isUserPrem = userSettings && userSettings.isPremium;
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('Premium Status Check')
            .setDescription(`${emoji.premium.diamond} Current Premium status for you and this server.`)
            .addFields(
                { 
                    name: `User Status (${interaction.user.username})`, 
                    value: isUserPrem 
                        ? `${emoji.status.success} **Premium Active**\nExpires: ${userSettings.premiumExpiresAt ? new Date(userSettings.premiumExpiresAt).toDateString() : `**Lifetime**`}`
                        : `${emoji.status.error} **Free Plan**`,
                    inline: false 
                },
                { 
                    name: `Server Status (${interaction.guild.name})`, 
                    value: isServerPrem 
                        ? `${emoji.status.success} **Premium Active**\nExpires: ${guildConfig.premiumExpiresAt ? new Date(guildConfig.premiumExpiresAt).toDateString() : `**Lifetime**`}`
                        : `${emoji.status.error} **Free Plan**`,
                    inline: false 
                }
            )
            .setFooter({ text: isUserPrem || isServerPrem ? 'Thanks for supporting SpaceBot!' : 'Upgrade to unlock exclusive features!' });
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
};
