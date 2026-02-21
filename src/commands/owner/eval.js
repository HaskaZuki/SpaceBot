const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('[OWNER] Execute JavaScript code')
        .addStringOption(opt => opt.setName('code').setDescription('Code to evaluate').setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const code = interaction.options.getString('code');        const cleanCode = code.replace(/```(js|javascript)?/g, '').trim();

        try {            const client = interaction.client;
            const guild = interaction.guild;
            const channel = interaction.channel;
            const member = interaction.member;
            const GuildConfig = require('../../models/GuildConfig');
            const musicPlayer = require('../../utils/musicPlayer');
            
            let result = eval(cleanCode);            if (result instanceof Promise) {
                result = await result;
            }            let output = typeof result === 'string' ? result : require('util').inspect(result, { depth: 2 });            if (output.length > 1900) {
                output = output.substring(0, 1900) + '\n... (truncated)';
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Eval Result')
                .addFields(
                    { name: '📥 Input', value: `\`\`\`js\n${cleanCode.substring(0, 500)}\n\`\`\`` },
                    { name: '📤 Output', value: `\`\`\`js\n${output}\n\`\`\`` }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Eval Error')
                .addFields(
                    { name: '📥 Input', value: `\`\`\`js\n${cleanCode.substring(0, 500)}\n\`\`\`` },
                    { name: '❌ Error', value: `\`\`\`\n${error.message}\n\`\`\`` }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        }
    },
};
