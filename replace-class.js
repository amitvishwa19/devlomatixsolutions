import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Specifically targeting the workspace directory as requested
const TARGET_DIR = path.join(__dirname, 'src', 'app', 'workspace');

const [, , from, to] = process.argv;

if (!from || !to) {
  console.log('\x1b[33mUsage: node replace-class.js "string_a" "string_b"\x1b[0m');
  console.log('Example: node replace-class.js "text-[10px]" "-"');
  process.exit(1);
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);

    // Skip system/library directories if they happen to be in the path
    if (file === 'node_modules' || file === '.next' || file === '.git') return;

    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (/\.(jsx|js|tsx|ts|css)$/.test(file)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(from)) {
          const newContent = content.split(from).join(to);
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`\x1b[32m✓ Updated:\x1b[0m ${path.relative(__dirname, fullPath)}`);
        }
      } catch (err) {
        console.error(`\x1b[31m✗ Error reading ${fullPath}:\x1b[0m`, err.message);
      }
    }
  });
}

console.log(`\n\x1b[36m🚀 Starting Global Replace\x1b[0m`);
console.log(`\x1b[90mTarget Folder:\x1b[0m ${TARGET_DIR}`);
console.log(`\x1b[90mAction:\x1b[0m Replacing "${from}" with "${to}"\n`);

if (fs.existsSync(TARGET_DIR)) {
  walk(TARGET_DIR);
  console.log(`\n\x1b[36m✨ Replacement complete.\x1b[0m\n`);
} else {
  console.error(`\x1b[31mError:\x1b[0m Directory not found: ${TARGET_DIR}`);
}
