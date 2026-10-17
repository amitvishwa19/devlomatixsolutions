import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
    getWorkspaceBackupStatsAction,
    createWorkspaceBackupAction,
    getWorkspaceSnapshotsAction,
    getSnapshotDataAction,
    deleteWorkspaceSnapshotAction,
    validateBackupBundleAction,
    restoreWorkspaceBackupAction
} from "@/app/workspace/[workspaceId]/system/_actions/backup-restore-actions";

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;

        if (!workspaceId) {
            return NextResponse.json({ message: "Workspace ID is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.userId && !session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        // 1. Fetch Stats
        if (action === 'stats') {
            const result = await getWorkspaceBackupStatsAction({ workspaceId });
            return NextResponse.json(result);
        }

        // 2. Fetch Snapshots
        if (action === 'snapshots') {
            const result = await getWorkspaceSnapshotsAction({ workspaceId });
            return NextResponse.json(result);
        }

        // 3. Fetch Single Snapshot Payload
        if (action === 'snapshot-data') {
            const snapshotId = searchParams.get('snapshotId');
            if (!snapshotId) {
                return NextResponse.json({ success: false, error: "Snapshot ID is required" }, { status: 400 });
            }
            const result = await getSnapshotDataAction({ workspaceId, snapshotId });
            return NextResponse.json(result);
        }

        // 4. Direct JSON Download
        const format = searchParams.get('format') || 'download';
        const label = searchParams.get('label') || 'Export';
        const modulesParam = searchParams.get('modules');
        const selectedModules = modulesParam
            ? modulesParam.split(',')
            : ['settings', 'crm', 'konnectx', 'konnect-legacy', 'productivity', 'automation', 'ats'];

        const result = await createWorkspaceBackupAction({
            workspaceId,
            selectedModules,
            label,
            saveAsSnapshot: false,
            includeSensitive: true
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        const safeFilename = `workspace-backup-${workspaceId.substring(0, 8)}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

        if (format === 'download') {
            return new NextResponse(JSON.stringify(result.backupBundle, null, 2), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${safeFilename}"`
                }
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("[API backup GET] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const resolvedParams = await params;
        const workspaceId = resolvedParams?.workspaceId;

        if (!workspaceId) {
            return NextResponse.json({ message: "Workspace ID is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.userId && !session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { action = 'restore' } = body;

        // 1. Create Backup / Snapshot
        if (action === 'create') {
            const { selectedModules, label, saveAsSnapshot, includeSensitive } = body;
            const result = await createWorkspaceBackupAction({
                workspaceId,
                selectedModules,
                label,
                saveAsSnapshot,
                includeSensitive
            });
            return NextResponse.json(result);
        }

        // 2. Validate Staged Bundle
        if (action === 'validate') {
            const { backupBundle } = body;
            const validation = await validateBackupBundleAction({ workspaceId, backupBundle });
            return NextResponse.json(validation);
        }

        // 3. Delete Snapshot
        if (action === 'delete-snapshot') {
            const { snapshotId } = body;
            const result = await deleteWorkspaceSnapshotAction({ workspaceId, snapshotId });
            return NextResponse.json(result);
        }

        // 4. Restore Bundle
        if (action === 'restore') {
            const { backupBundle, options } = body;
            const restoreResult = await restoreWorkspaceBackupAction({
                workspaceId,
                backupBundle,
                options
            });
            return NextResponse.json(restoreResult);
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("[API backup POST] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
