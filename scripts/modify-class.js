//node scripts/modify-class.js


const fs = require('fs');
const path = require('path');

// --- Configuration ---
// The directory path where you want the script to search and modify files.
const scanPath = 'D:\\Dev\\React\\devlomatix\\devlomatixsolutions\\src\\app\\workspace';

// Add the classes or prefixes you want to DELETE from your project here.
// Example: ['tracking', 'uppercase']
// const classesToRemove = ['tracking', 'uppercase'];
const classesToRemove = ['italic'];

// Add the classes you want to REPLACE [from, to]
// Example: [['font-bold', 'font-black'], ['text-sm', 'text-[10px]']]
const classesToModify = [
  ['font-bold', 'font-black']
];

// Set to false to actually modify the files. TRUE will only log the changes.
const dryRun = true;

// --- Logic ---
const classRegex = /(className=["']|class=["'])([^"']*?)(["'])/g;

function modifyClasses(classList) {
  let initialClasses = classList;
  let classes = classList.split(' ');

  // 1. Handle Deletions (Prefix match)
  classes = classes.filter(cls => {
    const shouldRemove = classesToRemove.some(target => cls.startsWith(target));
    return !shouldRemove;
  });

  // 2. Handle Modifications (Exact match or simple replace)
  classes = classes.map(cls => {
    const modification = classesToModify.find(([from, to]) => cls === from);
    return modification ? modification[1] : cls;
  });

  // Cleanup extra whitespace
  return classes.join(' ').replace(/\s+/g, ' ').trim();
}

let affectedFilesCount = 0;
let totalChangesCount = 0;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasChanged = false;
  let fileChanges = 0;

  const newContent = content.replace(classRegex, (match, prefix, classList, suffix) => {
    const updated = modifyClasses(classList);

    if (updated !== classList) {
      hasChanged = true;
      fileChanges++; // Counting tag matches instead of individual class counts for simplicity
      return `${prefix}${updated}${suffix}`;
    }
    return match;
  });

  if (hasChanged) {
    affectedFilesCount++;
    totalChangesCount += fileChanges;
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent);
    }
    console.log(`${dryRun ? '[DRY RUN] Would update' : '[UPDATED]'}: ${path.relative(scanPath, filePath)} (${fileChanges} tags modified)`);
  }
}

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        traverse(fullPath);
      }
    } else if (/\.(jsx|tsx|js|ts)$/.test(file)) {
      processFile(fullPath);
    }
  });
}

function main() {
  const absoluteTarget = path.isAbsolute(scanPath) ? scanPath : path.join(process.cwd(), scanPath);
  console.log(`Starting CSS Utility Cleanup...`);
  console.log(`Target: ${absoluteTarget}`);
  console.log(`Removals: [${classesToRemove.join(', ')}]`);
  console.log(`Modifications: [${classesToModify.map(m => `${m[0]} -> ${m[1]}`).join(', ')}]`);
  if (dryRun) console.log('\n--- DRY RUN MODE (No files will be modified) ---\n');

  traverse(absoluteTarget);

  console.log(`\nSummary:`);
  console.log(`- Total Files Affected: ${affectedFilesCount}`);
  console.log(`- Total Classes ${dryRun ? 'Found' : 'Removed'}: ${totalChangesCount}`);
  if (dryRun) console.log('\nEdit dryRun = false in the script to apply changes.\n');
}

main();
