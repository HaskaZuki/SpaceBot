const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const UserSettings = require('../../models/UserSettings');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');

function parseDuration(durationStr) {
    if (!durationStr || durationStr === 'lifetime') return null;
    
    const regex = /^(\d+)([dhm])$/;
    const match = durationStr.match(regex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch(unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        default: return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setpremium')
        .setDescription('[OWNER] Manage Premium status for Users or Servers')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('user')
               .setDescription('Manage User Premium')
               .addStringOption(opt => opt.setName('userid').setDescription('Target User ID').setRequired(true))
               .addStringOption(opt => 
                   opt.setName('status')
                      .setDescription('Set status')
                      .setRequired(true)
                      .addChoices(
                          { name: '💎 Premium', value: 'premium' },
                          { name: '🆓 Free', value: 'free' }
                      ))
               .addStringOption(opt => 
                   opt.setName('duration')
                      .setDescription('Duration (e.g. 30d, 12h, lifetime) - Ignored if Free')
                      .setRequired(false))
        )
        .addSubcommand(sub => 
            sub.setName('server')
               .setDescription('Manage Server Premium')
               .addStringOption(opt => opt.setName('serverid').setDescription('Target Server ID').setRequired(true))
               .addStringOption(opt => 
                   opt.setName('status')
                      .setDescription('Set status')
                      .setRequired(true)
                      .addChoices(
                          { name: '💎 Premium', value: 'premium' },
                          { name: '🆓 Free (Revoke/Punish)', value: 'free' }
                      ))
               .addStringOption(opt => 
                   opt.setName('duration')
                      .setDescription('Duration (e.g. 30d, 12h, lifetime) - Ignored if Free')
                      .setRequired(false))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetId = interaction.options.getString(subcommand === 'user' ? 'userid' : 'serverid');
        const status = interaction.options.getString('status');
        const durationStr = interaction.options.getString('duration');

        let durationMs = null;
        let expiresAt = null;

        if (status === 'premium') {
            if (durationStr && durationStr !== 'lifetime') {
                durationMs = parseDuration(durationStr);
                if (!durationMs) {
                    return interaction.reply({ content: `${emoji.status.error} Invalid duration format! Use: 30d, 12h, 60m or "lifetime"`, flags: 64 });
                }
                expiresAt = new Date(Date.now() + durationMs);
            }
        }

        try {
            if (subcommand === 'user') {
                let user = await UserSettings.findOne({ userId: targetId });
                if (!user) {
                    user = new UserSettings({ userId: targetId });
                }

                if (status === 'premium') {
                    user.isPremium = true;
                    user.premiumExpiresAt = expiresAt;
                    await user.save();
                    
                    const timeInfo = expiresAt ? `until <t:${Math.floor(expiresAt.getTime()/1000)}:F>` : '**Lifetime**';
                    return interaction.reply({ content: `${emoji.status.success} **User Premium Activated** for <@${targetId}> (${targetId})\n📅 Duration: ${timeInfo}`, flags: 64 });
                } else {
                    user.isPremium = false;
                    user.premiumExpiresAt = null;
                    await user.save();
                    return interaction.reply({ content: `🚫 **User Premium Revoked** for <@${targetId}> (${targetId}). Status set to **Free**.`, flags: 64 });
                }

            } else if (subcommand === 'server') {
                let guild = await GuildConfig.findOne({ guildId: targetId });
                if (!guild) {
                    guild = new GuildConfig({ guildId: targetId });
                }

                if (status === 'premium') {
                    guild.isPremium = true;
                    guild.premiumExpiresAt = expiresAt;
                    await guild.save();

                    const timeInfo = expiresAt ? `until <t:${Math.floor(expiresAt.getTime()/1000)}:F>` : '**Lifetime**';
                    return interaction.reply({ content: `${emoji.status.success} **Server Premium Activated** for Guild ID: \`${targetId}\`\n📅 Duration: ${timeInfo}`, flags: 64 });
                } else {
                    guild.isPremium = false;
                    guild.premiumExpiresAt = null;
                    guild.alwaysOn = false;
                    guild.autoPlay = false;
                    await guild.save();
                    
                    return interaction.reply({ content: `🚫 **Server Premium Revoked** for Guild ID: \`${targetId}\`.\n⚠️ Premium features (24/7, Autoplay) have been disabled.`, flags: 64 });
                }
            }

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `${emoji.status.error} Database error occurred.`, flags: 64 });
        }
    }
};
