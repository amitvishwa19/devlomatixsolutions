'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Crown,
  Edit2,
  Trash2,
  UserPlus,
  Plus,
  X,
  Mail
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const DEPARTMENT_COLORS = {
  Executive: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    border: 'border-violet-500/30',
    text: 'text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    dot: 'bg-violet-500'
  },
  Engineering: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500'
  },
  'Human Resources': {
    bg: 'bg-pink-500/10 dark:bg-pink-500/20',
    border: 'border-pink-500/30',
    text: 'text-pink-600 dark:text-pink-400',
    badge: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
    dot: 'bg-pink-500'
  },
  Sales: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500'
  },
  Finance: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500'
  },
  Marketing: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500'
  },
  Operations: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    border: 'border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    dot: 'bg-orange-500'
  },
  Design: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    border: 'border-cyan-500/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500'
  }
};

export const OrgRoleNode = memo(({ data, selected }) => {
  const {
    id,
    title,
    department = 'Executive',
    responsibilities,
    mailboxEmail,
    assignedUsers = [],
    isRoot = false,
    onEditRole,
    onDeleteRole,
    onAssignUser,
    onRemoveUser,
    onAddReport,
  } = data;

  const deptStyle = DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS.Engineering;

  return (
    <div
      className={`w-[240px] bg-white dark:bg-[#1e1e2e] text-slate-900 dark:text-white border border-border/80 dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg p-3 relative group transition-all select-none ${
        selected ? 'ring-2 ring-primary border-primary shadow-md -translate-y-0.5' : 'hover:border-primary/50'
      }`}
    >
      {/* Top Handle (Incoming Reports-To Connection) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background dark:!border-[#1e1e2e] !-top-1.5 transition-transform hover:scale-125 z-20 cursor-crosshair"
      />

      {/* Department Badge & Action Buttons */}
      <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-border/40 dark:border-white/10">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${deptStyle.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${deptStyle.dot}`} />
          {department || 'General'}
        </span>

        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity nodrag">
          <button
            type="button"
            onClick={() => onEditRole?.(id)}
            className="p-1 hover:bg-secondary dark:hover:bg-white/10 rounded text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
            title="Edit Role"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {!isRoot && (
            <button
              type="button"
              onClick={() => onDeleteRole?.(id)}
              className="p-1 hover:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded text-muted-foreground dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Role"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Role Title & Responsibilities */}
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-foreground dark:text-white leading-snug truncate" title={title}>
          {isRoot && <Crown className="w-3.5 h-3.5 inline mr-1 text-amber-500" />}
          {title}
        </h4>
        {responsibilities ? (
          <p className="text-[10px] text-muted-foreground dark:text-slate-400 line-clamp-1 mt-0.5" title={responsibilities}>
            {responsibilities}
          </p>
        ) : null}

        {/* Mailbox Badge */}
        {mailboxEmail && (
          <div
            className="flex items-center gap-1 mt-1 text-[10px] text-blue-600 dark:text-blue-300 font-medium truncate bg-blue-50/70 dark:bg-blue-500/15 px-1.5 py-0.5 rounded border border-blue-200/50 dark:border-blue-500/30"
            title={`Assigned Mailbox: ${mailboxEmail}`}
          >
            <Mail className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{mailboxEmail}</span>
          </div>
        )}
      </div>

      {/* Assigned Members Section */}
      <div className="mt-2 pt-2 border-t border-border/40 dark:border-white/10 space-y-1 nodrag">
        {assignedUsers.length > 0 ? (
          <div className="space-y-1">
            {assignedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-1 px-1.5 rounded-md bg-secondary/40 dark:bg-white/5 border border-border/40 dark:border-white/10 text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="w-5 h-5 border border-border/60 dark:border-white/10">
                    <AvatarImage src={u.avatar || ''} />
                    <AvatarFallback className="text-[8px] bg-secondary dark:bg-white/10 font-bold text-foreground dark:text-white">
                      {(u.displayName || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-medium text-foreground dark:text-slate-200 truncate max-w-[110px]">
                    {u.displayName || 'User'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUser?.(id, u.id, e);
                  }}
                  className="p-0.5 hover:bg-rose-500/20 rounded text-muted-foreground dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer"
                  title="Unassign user"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => onAssignUser?.(id)}
            className="flex items-center justify-center gap-1 p-1 border border-dashed border-border/70 dark:border-white/15 hover:border-emerald-500/60 dark:hover:border-emerald-400/60 rounded-md text-[10px] text-muted-foreground dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-pointer bg-secondary/15 dark:bg-white/[0.03]"
          >
            <UserPlus className="w-3 h-3" />
            <span>Assign Member</span>
          </div>
        )}

        {/* Quick Add Assignee if already has users */}
        {assignedUsers.length > 0 && (
          <button
            type="button"
            onClick={() => onAssignUser?.(id)}
            className="w-full text-center text-[9px] text-primary dark:text-cyan-400 hover:underline font-semibold cursor-pointer pt-0.5"
          >
            + Manage / Add Users
          </button>
        )}
      </div>

      {/* Add Direct Report Bottom Button */}
      <div className="mt-2 pt-1 text-center nodrag">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onAddReport?.(id)}
          className="w-full h-6 text-[10px] font-medium text-muted-foreground dark:text-slate-300 hover:text-primary dark:hover:text-white hover:bg-primary/10 dark:hover:bg-white/10 gap-1 rounded-md cursor-pointer justify-center"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>Add Direct Report</span>
        </Button>
      </div>

      {/* Bottom Handle (Outgoing Subordinate Reporting Connection) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background dark:!border-[#1e1e2e] !-bottom-1.5 transition-transform hover:scale-125 z-20 cursor-crosshair"
      />
    </div>
  );
});

OrgRoleNode.displayName = 'OrgRoleNode';

export default OrgRoleNode;
