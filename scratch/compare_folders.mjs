import fs from 'fs';
import path from 'path';

const refDir = 'd:/Dev/React/devlomatix/devlomatix-workspace/devlomatixsolutions/flowbyte_reference_delete/flowbite';
const targetDir = 'd:/Dev/React/devlomatix/devlomatix-workspace/devlomatixsolutions/src/app/workspace/[workspaceId]/flowbyte';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}

const refFiles = getAllFiles(refDir).map(file => path.relative(refDir, file));

const audit = {
    missing: [],
    present: [],
    renamed: []
};

refFiles.forEach(relPath => {
    const targetPathJsx = path.join(targetDir, relPath.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js'));
    const targetPathTsx = path.join(targetDir, relPath);
    
    // Some components are in _components in target
    let alternatePath = null;
    if (relPath.startsWith('components/')) {
        alternatePath = path.join(targetDir, '_components', relPath.replace('components/', '').replace(/\.tsx$/, '.jsx'));
    } else if (relPath.startsWith('hooks/')) {
        alternatePath = path.join(targetDir, '_hooks', relPath.replace('hooks/', '').replace(/\.ts$/, '.js'));
    } else if (relPath.startsWith('lib/')) {
        alternatePath = path.join(targetDir, '_lib', relPath.replace('lib/', '').replace(/\.ts$/, '.js'));
    }

    if (fs.existsSync(targetPathJsx) || fs.existsSync(targetPathTsx)) {
        audit.present.push(relPath);
    } else if (alternatePath && fs.existsSync(alternatePath)) {
        audit.present.push(relPath + ' (at ' + path.relative(targetDir, alternatePath) + ')');
    } else {
        audit.missing.push(relPath);
    }
});

console.log(JSON.stringify(audit, null, 2));
