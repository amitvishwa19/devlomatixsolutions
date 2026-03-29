import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = 'src/app/workspace';
// Look for tags that seem to have " animate-pulse" followed by } /> 
// but missing the opening className structure.
const patterns = [
  /<\w+\s+[^>]*?animate-pulse["'` ]*?\s*[} ]*?\/>/g,
  /<\w+\s+[^>]*?\}\s*?\/>/g,
  /Unterminated template/i // Just in case it appears in comments or logs
];

function getAllFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) results.push(...getAllFiles(full));
      else if (['.jsx', '.tsx'].includes(extname(full))) results.push(full);
    }
  } catch (e) {}
  return results;
}

const files = getAllFiles(ROOT);
console.log(`Scanning ${files.length} files for corruption...`);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    // Specifically looking for the broken div pattern
    if (line.includes('animate-pulse') && !line.includes('className')) {
      console.log(`Potential corruption in ${file} at line ${i + 1}: ${line.trim()}`);
    }
  });
}
