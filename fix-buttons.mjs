/**
 * fix-buttons.mjs
 * Repairs corrupted Button tags across the workspace.
 * 
 * The corruption pattern is:
 *   >                    <-- orphan `>` (was: <Button variant="..." className="...">)
 *   ...content...
 *   </Button>
 *
 * This script replaces every orphan `>` that is immediately followed
 * (within 10 lines) by a `</Button>` with `<Button>` to restore valid JSX.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ROOT = 'src/app/workspace';
let totalFiles = 0;
let totalFixes = 0;

function getAllFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) results.push(...getAllFiles(full));
      else if (['.jsx', '.tsx'].includes(extname(full))) results.push(full);
    } catch {}
  }
  return results;
}

function fixFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  const lines = original.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    // Detect a line that is ONLY whitespace + `>`
    if (/^\s+>\s*$/.test(lines[i])) {
      // Look ahead up to 15 lines for </Button>
      const ahead = lines.slice(i + 1, i + 16).join('\n');
      if (ahead.includes('</Button>')) {
        const indent = lines[i].match(/^(\s+)/)?.[1] ?? '';
        lines[i] = `${indent}<Button>`;
        changed = true;
        totalFixes++;
      }
    }
  }

  if (changed) {
    writeFileSync(filePath, lines.join('\n'), 'utf8');
    totalFiles++;
    console.log(`Fixed: ${filePath}`);
  }
}

const files = getAllFiles(ROOT);
for (const f of files) {
  fixFile(f);
}

console.log(`\nDone: repaired ${totalFixes} Button tags across ${totalFiles} files.`);
