const fs = require('fs');
const path = require('path');

const WACRM_DIR = path.join(__dirname, 'src/app/workspace/[workspaceId]/wacrm');

// Folders we want to rewrite components for:
const componentFolders = [
  'automations',
  'broadcasts',
  'contacts',
  'dashboard',
  'flows',
  'inbox',
  'pipelines',
  'settings'
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Rewrite component imports
      for (const folder of componentFolders) {
        const regex = new RegExp(`from\\s+['"]@\\/components\\/${folder}\\/([^'"]+)['"]`, 'g');
        const newContent = content.replace(regex, `from '@/app/workspace/[workspaceId]/wacrm/_components/${folder}/$1'`);
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      }

      // Rewrite lib imports, BUT ignore @/lib/utils if we want to share it (actually, we copied utils.ts, so let's rewrite it)
      // Actually let's just rewrite ALL @/lib/ except maybe we can rewrite all of them:
      const libRegex = new RegExp(`from\\s+['"]@\\/lib\\/([^'"]+)['"]`, 'g');
      const newLibContent = content.replace(libRegex, `from '@/app/workspace/[workspaceId]/wacrm/_lib/$1'`);
      if (newLibContent !== content) {
        content = newLibContent;
        changed = true;
      }

      // Rewrite hooks imports
      const hooksRegex = new RegExp(`from\\s+['"]@\\/hooks\\/([^'"]+)['"]`, 'g');
      const newHooksContent = content.replace(hooksRegex, `from '@/app/workspace/[workspaceId]/wacrm/_hooks/$1'`);
      if (newHooksContent !== content) {
        content = newHooksContent;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Process the copied directories
processDirectory(path.join(WACRM_DIR, '_components'));
processDirectory(path.join(WACRM_DIR, '_lib'));
processDirectory(path.join(WACRM_DIR, '_hooks'));

console.log("Done");
