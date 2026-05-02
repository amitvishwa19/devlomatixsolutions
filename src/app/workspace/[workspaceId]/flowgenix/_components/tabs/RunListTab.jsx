'use client'

import { useState, useEffect, useCallback } from "react";
import { RunList } from "../runs/RunList";
import { listRuns } from "../../_actions/runs/actions";

export function RunListTab({ workspaceId }) {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadRuns = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const data = await listRuns(workspaceId);
            setRuns(data || []);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadRuns();
    }, [loadRuns]);

    return (
        <RunList 
            runs={runs} 
            loading={loading} 
            onRefresh={loadRuns} 
        />
    );
}
