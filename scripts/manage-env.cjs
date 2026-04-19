const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const gitHooksDir = path.join(rootDir, '.git', 'hooks');

/**
 * Gets the current Git branch name.
 */
function getCurrentBranch() {
    try {
        return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error('Error fetching git branch:', error.message);
        return null;
    }
}

/**
 * Switches the .env.local file based on the current branch.
 */
function switchEnv() {
    const branch = getCurrentBranch();
    if (!branch) return;

    const branchEnvFile = path.join(rootDir, `.env.${branch}`);
    const targetEnvFileLocal = path.join(rootDir, '.env.local');
    const targetEnvFileRoot = path.join(rootDir, '.env');

    if (fs.existsSync(branchEnvFile)) {
        console.log(`\n🔄 Branch-Specific Env: Found .env.${branch}`);
        try {
            // Copy to .env.local (standard Next.js)
            fs.copyFileSync(branchEnvFile, targetEnvFileLocal);
            // Copy to root .env (for Prisma and other tools)
            fs.copyFileSync(branchEnvFile, targetEnvFileRoot);
            console.log(`✅ Successfully updated .env and .env.local from .env.${branch}\n`);
        } catch (error) {
            console.error(`❌ Failed to sync environment files:`, error.message);
        }
    } else {
        // Silent on branches without specific config
    }
}

/**
 * Installs the Git post-checkout hook.
 */
function installHook() {
    const hookPath = path.join(gitHooksDir, 'post-checkout');
    // Updated hook logic to check if script exists before running
    const hookContent = `#!/bin/sh
# Check if the environment manager script exists in the current branch
if [ -f "scripts/manage-env.cjs" ]; then
  node scripts/manage-env.cjs --switch
fi
`;

    if (!fs.existsSync(gitHooksDir)) {
        console.error('❌ .git/hooks directory not found. Are you in a Git repository?');
        return;
    }

    try {
        fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
        console.log('✅ Git post-checkout hook updated with existence check.');
    } catch (error) {
        console.error('❌ Failed to update Git hook:', error.message);
    }
}

// Command line arguments handling
const args = process.argv.slice(2);

if (args.includes('--install')) {
    installHook();
} else if (args.includes('--switch')) {
    switchEnv();
} else {
    switchEnv();
}
