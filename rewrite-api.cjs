const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'src/app/api');
const apiFolders = ['account', 'automations', 'flows', 'invitations', 'whatsapp'];

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

      const libRegex = new RegExp(`from\\s+['"]@\\/lib\\/([^'"]+)['"]`, 'g');
      const newLibContent = content.replace(libRegex, `from '@/app/workspace/[workspaceId]/wacrm/_lib/$1'`);
      if (newLibContent !== content) {
        content = newLibContent;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const folder of apiFolders) {
  processDirectory(path.join(API_DIR, folder));
}
console.log("Done API");
