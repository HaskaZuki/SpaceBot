const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const database = require('./database');

// Discord Portal: only "Server Members Intent" enabled (no Message Content, no Presence)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();

const shoukaku = new Shoukaku(
    new Connectors.DiscordJS(client),
    [{
        name: 'Public-Node',
        url: `${process.env.LAVALINK_HOST}:${process.env.LAVALINK_PORT}`,
        auth: process.env.LAVALINK_PASSWORD,
        secure: process.env.LAVALINK_SECURE === 'true'
    }],
    {
        resume: false,
        resumeTimeout: 30,
        resumeByLibrary: false,
        reconnectTries: 3,
        reconnectInterval: 5,
        restTimeout: 60000,
        moveOnDisconnect: false,
        userAgent: 'SpaceBot/1.0.0'
    }
);

shoukaku.on('error', (_, error) => console.error('Shoukaku Error:', error));
shoukaku.on('ready', (name) => console.log(`Lavalink Node: ${name} is ready`));

client.shoukaku = shoukaku;

const voiceStateTimers = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
    const botMember = newState.guild.members.me;
    if (!botMember.voice.channel) return;

    const voiceChannel = botMember.voice.channel;
    const guildId = newState.guild.id;

    const humanMembers = voiceChannel.members.filter(m => !m.user.bot);

    if (humanMembers.size === 0) {
        if (!voiceStateTimers.has(guildId)) {
            console.log(`⏰ Starting 10s timer for empty voice channel in ${newState.guild.name}`);
            
            const timer = setTimeout(async () => {
                const currentBotMember = newState.guild.members.me;
                if (!currentBotMember.voice.channel) return;
                
                const currentVoiceChannel = currentBotMember.voice.channel;
                const currentHumans = currentVoiceChannel.members.filter(m => !m.user.bot);
                
                if (currentHumans.size === 0) {
                    console.log(`🚪 Auto-disconnecting from ${newState.guild.name} - no users for 10s`);
                    
                    const musicPlayer = require('./utils/musicPlayer');
                    const GuildConfig = require('./models/GuildConfig');
                    
                    try {
                        const config = await GuildConfig.findOne({ guildId });
                        let textChannel = null;
                        
                        const playerState = musicPlayer.getQueue(guildId);
                        if (playerState && playerState.textChannelId) {
                            textChannel = client.channels.cache.get(playerState.textChannelId);
                        }

                        if (!textChannel && config && config.musicChannelId) {
                            textChannel = client.channels.cache.get(config.musicChannelId);
                        }
                        
                        if (!textChannel) {
                            textChannel = newState.guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(currentBotMember).has('SendMessages'));
                        }
                        
                        if (textChannel) {
                            await textChannel.send('👋 Left voice channel - no one was listening for 10 seconds.');
                        }
                    } catch (error) {
                        console.error('Error sending disconnect message:', error);
                    }
                    
                    await musicPlayer.stopPlayer(client, guildId);
                }
                
                voiceStateTimers.delete(guildId);
            }, 10000);
            
            voiceStateTimers.set(guildId, timer);
        }
    } else {
        if (voiceStateTimers.has(guildId)) {
            console.log(`✅ Cancelling auto-disconnect timer for ${newState.guild.name} - user joined`);
            clearTimeout(voiceStateTimers.get(guildId));
            voiceStateTimers.delete(guildId);
        }
    }
});

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

function loadCommandFiles(dirPath) {
    const files = [];
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
            files.push(...loadCommandFiles(fullPath));
        } else if (item.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
        const commandFiles = loadCommandFiles(folderPath);
        for (const filePath of commandFiles) {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                command.category = folder;
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] Command at ${filePath} missing "data" or "execute"`);
            }
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

(async () => {
    await database.connect();
    require('./web/server')(client);
    client.login(process.env.DISCORD_TOKEN);
})();
