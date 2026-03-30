const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'src', 'app', 'workspace', '[workspaceId]');

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach((name) => {
        const filePath = path.join(currentDirPath, name);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.tsx')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const originalContent = content;

    // 1. Replace text-3xl with text-xl inside <h1> tags
    content = content.replace(/<h1([\s\S]*?)text-3xl([\s\S]*?)>/g, '<h1$1text-xl$2>');
    
    // 2. Replace font-extrabold with font-bold inside <h1> tags
    content = content.replace(/<h1([\s\S]*?)font-extrabold([\s\S]*?)>/g, '<h1$1font-bold$2>');

    // 3. Replace text-sm with text-xs inside <p> tags 
    // Usually these are the "text-muted-foreground" subtitle tags under the h1
    content = content.replace(/<p([\s\S]*?)text-sm([\s\S]*?)>/g, '<p$1text-xs$2>');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated typography in: ${path.relative(__dirname, filePath)}`);
    }
}

console.log("Starting typography update for Header Areas...");
walkSync(targetDir, processFile);
console.log('Update complete!');
