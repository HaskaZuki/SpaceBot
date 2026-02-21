const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('broadcast')
        .setDescription('[OWNER] Send announcement to all servers')
        .addStringOption(opt => opt.setName('message').setDescription('Announcement message').setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const message = interaction.options.getString('message');
        const client = interaction.client;
        
        const embedData = {
            color: 0x6366f1,
            title: '📢 Xylos Announcement',
            description: message,
            footer: { text: 'From the Xylos Team' },
            timestamp: new Date().toISOString()
        };

        let totalSent = 0;
        let totalFailed = 0;

        if (client.shard) {
            const results = await client.shard.broadcastEval(async (c, ctx) => {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder(ctx.embedData);
                
                let sent = 0;
                let failed = 0;

                for (const guild of c.guilds.cache.values()) {
                    try {
                        const channel = guild.channels.cache.find(ch => 
                            ch.type === 0 &&
                            ch.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel']) &&
                            (ch.name.includes('general') || ch.name.includes('bot') || ch.name.includes('music'))
                        ) || guild.systemChannel;

                        if (channel) {
                            await channel.send({ embeds: [embed] });
                            sent++;
                        } else {
                            failed++;
                        }
                    } catch (e) {
                        failed++;
                    }
                }

                return { sent, failed };
            }, { context: { embedData } });
            totalSent = results.reduce((acc, r) => acc + r.sent, 0);
            totalFailed = results.reduce((acc, r) => acc + r.failed, 0);
        } else {
            const embed = new EmbedBuilder(embedData);
            
            for (const guild of client.guilds.cache.values()) {
                try {
                    const channel = guild.channels.cache.find(c => 
                        c.type === 0 &&
                        c.permissionsFor(guild.members.me).has(['SendMessages', 'ViewChannel']) &&
                        (c.name.includes('general') || c.name.includes('bot') || c.name.includes('music'))
                    ) || guild.systemChannel;

                    if (channel) {
                        await channel.send({ embeds: [embed] });
                        totalSent++;
                    } else {
                        totalFailed++;
                    }
                } catch (e) {
                    totalFailed++;
                }
            }
        }

        const shardInfo = client.shard ? ` (${client.shard.count} shards)` : '';
        await interaction.editReply(`📢 **Announcement sent!${shardInfo}**\n✅ Sent: **${totalSent}**\n❌ Failed: **${totalFailed}**`);
    },
};

