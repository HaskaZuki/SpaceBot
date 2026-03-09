const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const emoji = require('../../utils/emojiConfig');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setdj')
        .setDescription('Manage the DJ role for this server')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a DJ role')
                .addRoleOption(option => 
                    option.setName('role')
                        .setDescription('The role to set as DJ')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unset')
                .setDescription('Remove the DJ role restriction'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the current DJ role'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        try {
            let config = await GuildConfig.findOne({ guildId: interaction.guild.id });
            if (!config) {
                config = await GuildConfig.create({ guildId: interaction.guild.id });
            }
            if (subcommand === 'view') {
                if (!config.djRoleId) {
                    return interaction.reply({ 
                        content: '📋 No DJ role is currently set.\nUse `/setdj set` to configure one.', 
                        flags: 64 
                    });
                }
                const role = interaction.guild.roles.cache.get(config.djRoleId);
                if (!role) {
                    return interaction.reply({ 
                        content: '⚠️ DJ role was set but no longer exists.\nUse `/setdj set` to configure a new one.', 
                        flags: 64 
                    });
                }
                return interaction.reply({ 
                    content: `📋 Current DJ Role: ${role}`, 
                    flags: 64 
                });
            }
            if (subcommand === 'unset') {
                if (!config.djRoleId) {
                    return interaction.reply({ 
                        content: `${emoji.status.error} No DJ role is currently set.`, 
                        flags: 64 
                    });
                }
                config.djRoleId = null;
                await config.save();
                return interaction.reply({ 
                    content: `${emoji.status.success} DJ role has been removed. All administrators can now use DJ commands.`, 
                    ephemeral: false 
                });
            }
            if (subcommand === 'set') {
                const role = interaction.options.getRole('role');
                if (config.djRoleId) {
                    const currentRole = interaction.guild.roles.cache.get(config.djRoleId);
                    if (currentRole) {
                        return interaction.reply({ 
                            content: `⚠️ DJ Role is already set to ${currentRole}!\n\n` +
                                    `To change the DJ role, you must first unset it:\n` +
                                    `1. Use \`/setdj unset\` to remove current DJ role\n` +
                                    `2. Then use \`/setdj set\` to set a new role`, 
                            flags: 64 
                        });
                    }
                }
                config.djRoleId = role.id;
                await config.save();
                await interaction.reply({ 
                    content: `${emoji.status.success} Successfully set the DJ role to ${role}.\n` +
                            `Users with this role can now use DJ commands.`, 
                    ephemeral: false 
                });
            }
        } catch (error) {
            console.error('setdj error:', error);
            await interaction.reply({ content: `${emoji.status.error} Failed to save DJ role configuration.`, flags: 64 });
        }
    },
};
