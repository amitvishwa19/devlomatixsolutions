const fs = require('fs');
const path = require('path');

const WACRM_DIR = path.join(__dirname, 'src/app/workspace/[workspaceId]/wacrm');
const API_DIR = path.join(__dirname, 'src/app/api');

function processDirectory(directory) {
  if (!fs.existsSync(directory)) return;
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // auth imports
      const authRegex = new RegExp(`from\\s+['"]@\\/components\\/auth\\/([^'"]+)['"]`, 'g');
      const newAuthContent = content.replace(authRegex, `from '@/app/workspace/[workspaceId]/wacrm/_components/auth/$1'`);
      if (newAuthContent !== content) {
        content = newAuthContent;
        changed = true;
      }

      // auth imports missing extension
      const authNoExtRegex = new RegExp(`from\\s+['"]@\\/components\\/auth['"]`, 'g');
      const newAuthNoExtContent = content.replace(authNoExtRegex, `from '@/app/workspace/[workspaceId]/wacrm/_components/auth'`);
      if (newAuthNoExtContent !== content) {
        content = newAuthNoExtContent;
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Process the components and pages
processDirectory(WACRM_DIR);

// Process the api
const apiFolders = ['account', 'automations', 'flows', 'invitations', 'whatsapp'];
for (const folder of apiFolders) {
  processDirectory(path.join(API_DIR, folder));
}

console.log("Done auth rewrite");
