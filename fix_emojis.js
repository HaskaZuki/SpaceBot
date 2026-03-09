const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove single line comments that are on their own line
    content = content.replace(/^\s*\/\/.*$/gm, '');
    
    // Custom replacements for specific icons
    content = content.replace(/🚫/g, '${emoji.status.error}');
    content = content.replace(/🔒/g, '${emoji.status.error}');
    content = content.replace(/📋/g, '${emoji.animated.notes}');
    content = content.replace(/⚠️/g, '${emoji.status.error}');
    content = content.replace(/🔊/g, '${emoji.animated.notes}');
    content = content.replace(/📊/g, '${emoji.ui.charts}');
    content = content.replace(/📈/g, '${emoji.ui.charts}');
    content = content.replace(/🎚️/g, '${emoji.ui.gear}');
    content = content.replace(/🎵/g, '${emoji.animated.notes}');
    content = content.replace(/❌/g, '${emoji.status.error}');
    content = content.replace(/✅/g, '${emoji.status.success}');
    content = content.replace(/📢/g, '${emoji.animated.notes}'); // For broadcast command
    content = content.replace(/💎/g, '${emoji.premium.diamond}'); // For premium
    content = content.replace(/🔴/g, '${emoji.status.error}'); // For nowplaying

    // Ensure emojiConfig is required if we added an emoji variable
    if (content !== original && content.includes('${emoji.') && !content.includes('emojiConfig') && !content.includes("../../utils/emojiConfig")) {
        // Simple depth calculation for require path
        const depth = filePath.split(path.sep).length - 3; // src/ is 1, commands/cat/ is 3
        let reqPath;
        if (depth > 0) reqPath = '../'.repeat(depth) + 'utils/emojiConfig';
        else reqPath = './utils/emojiConfig';
        content = "const emoji = require('" + reqPath + "');\n" + content;
    }

    // specific fix for filterManager.js
    if (filePath.endsWith('filterManager.js')) {
        if (!content.includes('emojiConfig')) {
            content = "const emojiConfig = require('./emojiConfig');\n" + content;
        }
        content = content.replace(/'🔊'/g, "emojiConfig.ui?.suggestion || '🔊'");
        content = content.replace(/'🌙'/g, "emojiConfig.ui?.notice || '🌙'");
        content = content.replace(/'🌊'/g, "emojiConfig.premium?.star || '🌊'");
        content = content.replace(/'🎧'/g, "emojiConfig.animated?.disc || '🎧'");
        content = content.replace(/'🎤'/g, "emojiConfig.animated?.rocket || '🎤'");
        content = content.replace(/'📳'/g, "emojiConfig.ui?.charts || '📳'");
        content = content.replace(/'🎵'/g, "emojiConfig.animated?.notes || '🎵'");
    }

    fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fullPath.includes('node_modules') || fullPath.includes('.git')) return;
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') && !fullPath.includes('emojiConfig')) {
            processFile(fullPath);
        }
    });
}

walkDir('./src');
console.log('Processed ALL src directories via fix_emojis.js');
