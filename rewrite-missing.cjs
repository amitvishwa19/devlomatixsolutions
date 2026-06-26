const fs = require('fs');
const path = require('path');

const WACRM_DIR = path.join(__dirname, 'src/app/workspace/[workspaceId]/wacrm');

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

      // tremor imports
      const tremorRegex = new RegExp(`from\\s+['"]@\\/components\\/tremor\\/([^'"]+)['"]`, 'g');
      const newTremorContent = content.replace(tremorRegex, `from '@/app/workspace/[workspaceId]/wacrm/_components/tremor/$1'`);
      if (newTremorContent !== content) {
        content = newTremorContent;
        changed = true;
      }

      // gated-button imports
      const gatedRegex = new RegExp(`from\\s+['"]@\\/components\\/ui\\/gated-button['"]`, 'g');
      const newGatedContent = content.replace(gatedRegex, `from '@/app/workspace/[workspaceId]/wacrm/_components/ui/gated-button'`);
      if (newGatedContent !== content) {
        content = newGatedContent;
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
console.log("Done missing imports");
