'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Network,
    Crown,
    ShieldCheck,
    User,
    ChevronDown,
    Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getVisibleTeamMembersAction } from '../_actions/crm-visibility-helper';

/**
 * Reusable CRM Hierarchy Filter Component
 * Renders the user's hierarchy scope (Super Admin / Manager ladder / Individual rep)
 * and allows higher-ladder managers to filter CRM views by subordinate team members.
 */
export default function CrmHierarchyFilter({
    workspaceId,
    selectedUserId = 'ALL',
    onUserChange,
    className = ''
}) {
    const [scopeData, setScopeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!workspaceId) return;
        let isMounted = true;

        async function fetchScope() {
            try {
                const res = await getVisibleTeamMembersAction(workspaceId);
                if (isMounted && res.success && res.data) {
                    setScopeData(res.data);
                }
            } catch (err) {
                console.error("[CrmHierarchyFilter] Failed to fetch team scope:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchScope();
        return () => { isMounted = false; };
    }, [workspaceId]);

    if (loading || !scopeData) {
        return null;
    }

    const { isSuperAdmin, currentUserId, assignedRoles = [], members = [] } = scopeData;
    const isManager = members.length > 1;
    const subordinateCount = members.filter(m => m.id !== currentUserId).length;
    const roleTitle = assignedRoles[0] || (isSuperAdmin ? 'Super Admin' : 'Team Member');

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            {/* Hierarchy Badge / Ladder Level */}
            {isSuperAdmin ? (
                <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold flex items-center gap-1.5 shrink-0"
                >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Super Admin</span>
                    <span className="text-[9px] opacity-70">Company-wide</span>
                </Badge>
            ) : isManager ? (
                <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30 font-semibold flex items-center gap-1.5 shrink-0"
                >
                    <Network className="w-3.5 h-3.5 text-violet-500" />
                    <span className="truncate max-w-[120px]">{roleTitle}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300">
                        {subordinateCount} reports
                    </span>
                </Badge>
            ) : (
                <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-0.5 bg-secondary/60 text-muted-foreground border-border/70 font-medium flex items-center gap-1.5 shrink-0"
                >
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{roleTitle}</span>
                    <span className="text-[9px] opacity-70">My Records</span>
                </Badge>
            )}

            {/* Team Member Filter Selector (Only shown if user has subordinates or is Super Admin) */}
            {(isSuperAdmin || isManager) && (
                <div className="flex items-center gap-1.5">
                    <Select
                        value={selectedUserId || 'ALL'}
                        onValueChange={(val) => onUserChange && onUserChange(val)}
                    >
                        <SelectTrigger className="h-7 text-xs px-2.5 bg-background border-border/70 rounded-lg gap-2 cursor-pointer focus:ring-1 focus:ring-primary min-w-[140px] max-w-[210px]">
                            <Filter className="w-3 h-3 text-muted-foreground shrink-0" />
                            <SelectValue placeholder="Filter by Member" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999] max-h-60 bg-popover border border-border shadow-xl text-xs">
                            <SelectItem value="ALL" className="font-semibold cursor-pointer">
                                {isSuperAdmin ? '🌐 All Organization Members' : '👥 Entire Team / Subordinates'}
                            </SelectItem>
                            <SelectItem value={currentUserId} className="font-medium cursor-pointer text-primary">
                                👤 My Records Only
                            </SelectItem>
                            {members
                                .filter(m => m.id !== currentUserId)
                                .map((member) => (
                                    <SelectItem key={member.id} value={member.id} className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-4 h-4 border border-border/50 shrink-0">
                                                <AvatarImage src={member.avatar || ''} />
                                                <AvatarFallback className="text-[8px]">
                                                    {(member.displayName || 'U').slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{member.displayName || member.email}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}
