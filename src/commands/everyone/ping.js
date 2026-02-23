const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot latency'),
    
    async execute(interaction) {
        const { resource } = await interaction.reply({ content: 'Pinging...', withResponse: true, flags: MessageFlags.Ephemeral });
        const sent = resource.message;
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latency: ${latency}ms. API Latency: ${Math.round(interaction.client.ws.ping)}ms`);
    },
};
