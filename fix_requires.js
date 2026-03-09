const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fullPath.includes('node_modules') || fullPath.includes('.git')) return;
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Fix require paths for emojiConfig
            if (content.includes('emojiConfig')) {
                const parts = fullPath.split(path.sep);
                const srcIndex = parts.indexOf('src');
                if (srcIndex !== -1) {
                    const depth = parts.length - srcIndex - 2; 
                    let reqPath = depth > 0 ? '../'.repeat(depth) + 'utils/emojiConfig' : './utils/emojiConfig';
                    content = content.replace(/require\(['"].*emojiConfig['"]\)/g, "require('" + reqPath + "')");
                    if (content !== original) {
                        fs.writeFileSync(fullPath, content);
                    }
                }
            }
        }
    });
}
walkDir('./src');
console.log('Fixed require paths for emojiConfig');
