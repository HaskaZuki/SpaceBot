const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { REST, Routes } = require('discord.js');
const fs = require('fs');
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
    try {        console.log(`Started refreshing ${globalCommands.length} global commands.`);
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: globalCommands },
        );
        console.log(`Successfully reloaded ${globalData.length} global commands.`);        if (process.env.OWNER_GUILD_ID) {
            console.log(`Registering ${ownerCommands.length} owner commands to guild ${process.env.OWNER_GUILD_ID}...`);
            const ownerData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.OWNER_GUILD_ID),
                { body: ownerCommands },
            );
            console.log(`Successfully reloaded ${ownerData.length} owner-only guild commands.`);
            console.log('Owner commands are only visible in the owner guild and protected by OWNER_ID check.');
        } else {            console.warn('[WARNING] OWNER_GUILD_ID not set in .env');
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
