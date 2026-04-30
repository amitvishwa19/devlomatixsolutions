'use client';

import React from 'react';
import { Cpu, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CloudAccountModal({
    open,
    onOpenChange,
    tempCreds,
    setTempCreds,
    onSave,
    loading
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" p-0 rounded-lg  overflow-hidden border card-glass">
                <div className="p-4 space-y-4">
                    <DialogHeader className=" flex-row items-start gap-4">
                        <div className="p-3 bg-primary/10 w-fit rounded-xl">
                            <Cpu className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold tracking-tight">Cloud API Configuration</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">Link your official Meta business account</DialogDescription>
                        </div>
                    </DialogHeader>
                    <div className="grid gap-5 py-2">
                        <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Account Nickname</Label>
                            <Input
                                className="bg-muted/5  text-sm font-medium rounded-md px-4 border"
                                value={tempCreds.profile || ''}
                                onChange={(e) => setTempCreds({ ...tempCreds, profile: e.target.value })}
                                placeholder="e.g. Sales Primary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Phone Number ID</Label>
                            <Input
                                className="bg-muted/5  text-sm font-medium rounded-md px-4 border"
                                value={tempCreds.phoneNumberId || ''}
                                onChange={(e) => setTempCreds({ ...tempCreds, phoneNumberId: e.target.value })}
                                placeholder="10492..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">Business Account ID (WABA)</Label>
                            <Input
                                className="bg-muted/5  text-sm font-medium rounded-md px-4 border"
                                value={tempCreds.wabaId || ''}
                                onChange={(e) => setTempCreds({ ...tempCreds, wabaId: e.target.value })}
                                placeholder="92837..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground ml-1">System Access Token</Label>
                            <Input
                                className="bg-muted/5  text-sm font-medium rounded-md px-4 border"
                                type="password"
                                value={tempCreds.accessToken || ''}
                                onChange={(e) => setTempCreds({ ...tempCreds, accessToken: e.target.value })}
                                placeholder={tempCreds.id ? "•••••••• (Token is stored. Leave blank to keep existing.)" : "EAAG..."}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-2 bg-muted/5 border-t border-border/40 flex items-center justify-end gap-4">
                    <Button
                        variant="outline"
                        className="text-sm font-medium  rounded-md px-6 hover:bg-muted/10"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={'primary'}
                        className=" text-sm font-medium  px-10 shadow-lg  "
                        onClick={onSave}
                        disabled={loading}
                    >
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : (tempCreds.id ? 'Save Changes' : 'Link Account')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
