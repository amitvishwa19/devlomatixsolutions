import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Specifically targeting the workspace directory as requested
const TARGET_DIR = path.join(__dirname, 'src', 'app', 'workspace');

const [, , from, to] = process.argv;

const REPLACEMENTS = [];

if (from && to) {
  REPLACEMENTS.push({ from, to });
} else {
  // Default cleanup tasks if no arguments provided
  REPLACEMENTS.push(
    { from: 'rounded-lg', to: 'rounded-md' },
    { from: 'text-[10px]', to: '' },
    { from: 'h-10', to: '' }
  );
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
        let originalContent = content;

        REPLACEMENTS.forEach(({ from, to }) => {
          if (content.includes(from)) {
            if (to === '') {
              // Handle removal: remove the class and extra spaces
              // Match word boundary to avoid partial matches
              const regex = new RegExp(`\\b${from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'g');
              content = content.replace(regex, '');
            } else {
              content = content.split(from).join(to);
            }
          }
        });

        // Cleanup: remove multiple spaces and spaces next to quotes
        content = content
          .replace(/ {2,}/g, ' ')
          .replace(/" /g, '"')
          .replace(/ "/g, '"')
          .replace(/' /g, "'")
          .replace(/ '/g, "'")
          .trim();

        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`\x1b[32m✓ Updated:\x1b[0m ${path.relative(__dirname, fullPath)}`);
        }
      } catch (err) {
        console.error(`\x1b[31m✗ Error processing ${fullPath}:\x1b[0m`, err.message);
      }
    }
  });
}

console.log(`\n\x1b[36m🚀 Starting Global UI Cleanup\x1b[0m`);
console.log(`\x1b[90mTarget Folder:\x1b[0m ${TARGET_DIR}`);
REPLACEMENTS.forEach(({ from, to }) => {
  console.log(`\x1b[90mAction:\x1b[0m ${to === '' ? 'Removing' : 'Replacing'} "${from}" ${to === '' ? '' : `with "${to}"`}`);
});
console.log('');

if (fs.existsSync(TARGET_DIR)) {
  walk(TARGET_DIR);
  console.log(`\n\x1b[36m✨ Cleanup complete.\x1b[0m\n`);
} else {
  console.error(`\x1b[31mError:\x1b[0m Directory not found: ${TARGET_DIR}`);
}
