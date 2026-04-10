import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export async function GET(req, { params }) {
    try {
        const { workspaceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query');

        if (!query || query.length < 2) {
            return NextResponse.json({ results: [] });
        }

        // We use grep to find the class in src/app
        // The regex looks for the query within class or className attributes
        // This is much faster than Node's recursive fs walk.
        const searchDir = path.join(process.cwd(), 'src', 'app');
        
        // Escape the query for shell
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Grep command: -n (line number), -r (recursive), -I (skip binary)
        // We look for the query string surrounded by quotes inside class/className
        const grepCommand = `grep -rnI "${escapedQuery}" "${searchDir}" | grep -E "class(Name)?=" | head -n 100`;

        try {
            const { stdout } = await execPromise(grepCommand);
            const lines = stdout.split('\n').filter(line => line.trim() !== '');
            
            const results = lines.map(line => {
                // Grep format: D:/path/to/file:line:content
                const [fullPath, lineNumber, ...contentParts] = line.split(':');
                const content = contentParts.join(':').trim();
                
                // Make path relative to project root for cleaner UI
                const relativePath = path.relative(process.cwd(), fullPath);
                
                return {
                    file: relativePath,
                    line: parseInt(lineNumber),
                    snippet: content
                };
            });

            return NextResponse.json({ results });
        } catch (grepError) {
            // Grep returns exit code 1 if no matches found
            if (grepError.code === 1) {
                return NextResponse.json({ results: [] });
            }
            throw grepError;
        }

    } catch (error) {
        console.error("[STYLE_CLEANER_SEARCH_GET]", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
