const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const emoji = require('../../utils/emojiConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanup')
        .setDescription('[ADMIN] Delete SpaceBot messages in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('Max messages to scan (default: 100)')
                .setMinValue(1)
                .setMaxValue(500)
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const limit = interaction.options.getInteger('amount') ?? 100;
        const channel = interaction.channel;

        let deleted = 0;
        let checked = 0;
        let lastId = undefined;

        while (checked < limit) {
            const fetchCount = Math.min(100, limit - checked);
            const options = { limit: fetchCount };
            if (lastId) options.before = lastId;

            const messages = await channel.messages.fetch(options).catch(() => null);
            if (!messages || messages.size === 0) break;

            lastId = messages.last().id;
            checked += messages.size;

            const botMessages = messages.filter(msg => msg.author.id === interaction.client.user.id);

            for (const msg of botMessages.values()) {
                await msg.delete().catch(() => null);
                deleted++;
                await new Promise(r => setTimeout(r, 300));
            }

            if (messages.size < fetchCount) break;
        }

        await interaction.editReply({
            content: `${emoji.status.success} Deleted **${deleted}** SpaceBot message${deleted !== 1 ? 's' : ''} in this channel. (scanned ${checked} messages)`
        });
    },
};
