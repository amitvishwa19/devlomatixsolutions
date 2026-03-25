'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSWRConfig } from 'swr';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const CreateChannelModal = ({ isOpen, onClose, initialType = 'TEXT' }) => {
    const params = useParams();
    const workspaceId = params?.workspaceId;
    const { mutate } = useSWRConfig();

    const [name, setName] = useState("");
    const [type, setType] = useState(initialType);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setIsLoading(true);
            await fetch(`/api/workspace/${workspaceId}/productivity/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type })
            });

            // Re-fetch channels
            mutate(`/api/workspace/${workspaceId}/productivity/channels`);
            
            setName("");
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) onClose();
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Channels are where your team communicates. They're best when organized around a topic.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Channel Name</Label>
                        <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="e.g. general" 
                            disabled={isLoading} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Channel Type</Label>
                        <Select disabled={isLoading} value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a channel type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TEXT">Text Channel</SelectItem>
                                <SelectItem value="AUDIO">Audio Channel</SelectItem>
                                <SelectItem value="VIDEO">Video Channel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoading || !name.trim()}>
                        {isLoading ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
