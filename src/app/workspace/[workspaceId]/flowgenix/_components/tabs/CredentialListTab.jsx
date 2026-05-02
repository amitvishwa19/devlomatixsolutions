'use client'

import { useState, useEffect, useCallback } from "react";
import { CredentialList } from "../credentials/CredentialList";
import { listCredentials, deleteCredential } from "../../_actions/credentials/actions";
import { toast } from "sonner";

export function CredentialListTab({ workspaceId, userId }) {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCredentials = useCallback(async () => {
        if (!workspaceId) return;
        setLoading(true);
        try {
            const data = await listCredentials(workspaceId);
            setCredentials(data || []);
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        loadCredentials();
    }, [loadCredentials]);

    const handleDeleteCredential = async (id) => {
        if (!confirm("Delete this credential?")) return;
        try {
            await deleteCredential(workspaceId, id);
            toast.success("Credential deleted");
            loadCredentials();
        } catch (error) {
            toast.error("Failed to delete credential");
        }
    };

    return (
        <CredentialList 
            credentials={credentials} 
            loading={loading} 
            onDelete={handleDeleteCredential} 
            onRefresh={loadCredentials}
            workspaceId={workspaceId}
            userId={userId}
        />
    );
}
