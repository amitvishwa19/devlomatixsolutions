import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SRC_DIR = 'src';
const TARGET_CLASS = 'font-black';
const EXTENSIONS = ['.jsx', '.js', '.tsx', '.ts', '.css'];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (EXTENSIONS.includes(extname(file))) {
                arrayOfFiles.push(join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(SRC_DIR);
let count = 0;

files.forEach(file => {
    let content = readFileSync(file, 'utf8');
    if (content.includes(TARGET_CLASS)) {
        // Replace font-black followed by an optional space, OR preceded by an optional space
        // This handles middle, start, and end of className strings
        const newContent = content
            .replace(/ font-black/g, '') // remove with leading space
            .replace(/font-black /g, '') // remove with trailing space
            .replace(/font-black/g, '')  // remove catch-all
            .replace(/  /g, ' ');         // cleanup double spaces

        if (newContent !== content) {
            writeFileSync(file, newContent);
            console.log(`Modified: ${file}`);
            count++;
        }
    }
});

console.log(`Total files modified: ${count}`);
