import fs from 'fs';
import path from 'path';

const refDir = 'd:/Dev/React/devlomatix/devlomatix-workspace/devlomatixsolutions/flowbyte_reference_delete/flowbite';
const targetDir = 'd:/Dev/React/devlomatix/devlomatix-workspace/devlomatixsolutions/src/app/workspace/[workspaceId]/flowbyte';

const mapping = {
    'components': '_components',
    'hooks': '_hooks',
    'lib': '_lib',
    'layouts': '_layouts',
};

function getFiles(dir, prefix = '') {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(getFiles(filePath, path.join(prefix, file)));
        } else {
            results.push(path.join(prefix, file));
        }
    });
    return results;
}

const refFiles = getFiles(refDir);
const report = [];

refFiles.forEach(file => {
    const parts = file.split(path.sep);
    const category = parts[0];
    const rest = parts.slice(1).join(path.sep);
    
    let possiblePaths = [];
    
    // Exact path check
    possiblePaths.push(path.join(targetDir, file));
    
    // Mapped path check (e.g. components -> _components)
    if (mapping[category]) {
        possiblePaths.push(path.join(targetDir, mapping[category], rest));
    }
    
    // Check for both .tsx and .jsx extensions
    possiblePaths = possiblePaths.flatMap(p => [
        p,
        p.replace(/\.tsx$/, '.jsx'),
        p.replace(/\.ts$/, '.js'),
        p.replace(/\.tsx$/, '.js'),
        path.join(targetDir, '_components', 'nodes', rest.replace(/\.tsx$/, '.jsx')) // For nodes
    ]);

    let foundPath = possiblePaths.find(p => fs.existsSync(p));
    
    if (foundPath) {
        const refContent = fs.readFileSync(path.join(refDir, file), 'utf-8').trim();
        const targetContent = fs.readFileSync(foundPath, 'utf-8').trim();
        
        // Basic comparison (ignoring line endings and some whitespaces for a better indicator)
        const normalize = (s) => s.replace(/\r\n/g, '\n').replace(/\s+/g, ' ');
        const isMatch = normalize(refContent).length === normalize(targetContent).length; // Rough check
        
        report.push({
            file,
            status: 'Present',
            target: path.relative(targetDir, foundPath),
            contentMatch: isMatch ? 'Rough Similarity' : 'Different Content'
        });
    } else {
        report.push({
            file,
            status: 'MISSING',
            target: null,
            contentMatch: 'N/A'
        });
    }
});

console.log(JSON.stringify(report, null, 2));
