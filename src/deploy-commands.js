require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const globalCommands = [];
const ownerCommands = [];
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
            const fileName = path.relative(commandsPath, filePath);
            console.log(`Processing: ${fileName}`);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                try {
                    const jsonData = command.data.toJSON();
                    if (folder === 'owner') {
                        ownerCommands.push(jsonData);
                    } else {
                        globalCommands.push(jsonData);
                    }
                } catch (err) {
                    console.error(`FAILED to process command: ${fileName}`);
                    console.error(err);
                }
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        // Deploy global commands (visible to everyone)
        console.log(`Started refreshing ${globalCommands.length} global commands.`);
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: globalCommands },
        );
        console.log(`Successfully reloaded ${globalData.length} global commands.`);

        // Deploy owner commands to owner's guild only (hidden from other servers)
        if (process.env.OWNER_GUILD_ID) {
            console.log(`Registering ${ownerCommands.length} owner commands to guild ${process.env.OWNER_GUILD_ID}...`);
            const ownerData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.OWNER_GUILD_ID),
                { body: ownerCommands },
            );
            console.log(`Successfully reloaded ${ownerData.length} owner-only guild commands.`);
            console.log('Owner commands are only visible in the owner guild and protected by OWNER_ID check.');
        } else {
            // Fallback: deploy owner commands globally but they are still protected by OWNER_ID check
            console.warn('[WARNING] OWNER_GUILD_ID not set in .env');
            console.warn('Deploying owner commands globally (they are still protected by OWNER_ID check in the bot).');
            const allData = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: [...globalCommands, ...ownerCommands] },
            );
            console.log(`Deployed ${allData.length} total commands globally (including owner commands).`);
        }
    } catch (error) {
        console.error(error);
    }
})();
