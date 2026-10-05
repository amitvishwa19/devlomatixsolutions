'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckSquare,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    Plus,
    MessageCircle,
    Phone,
    Briefcase,
    Receipt,
    Trash2,
    RefreshCw,
    Filter,
    Send,
    Loader2,
    ChevronRight,
    Sparkles,
    Building2,
    User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { getCrmTasksAction, updateCrmTaskStatusAction, deleteCrmTaskAction } from '../_actions/crm-task-actions';
import { sendWhatsAppFromCrmAction } from '../_actions/crm-bridge-actions';

import CreateTaskModal from './_components/CreateTaskModal';

export default function CrmTasksPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [selectedPriority, setSelectedPriority] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Quick WhatsApp State for Task Action
    const [activeWaTask, setActiveWaTask] = useState(null);
    const [quickWaText, setQuickWaText] = useState('');
    const [isSendingWA, setIsSendingWA] = useState(false);

    const loadTasks = async () => {
        if (!workspaceId) return;
        try {
            setIsLoading(true);
            const res = await getCrmTasksAction(workspaceId, {
                status: activeTab,
                type: selectedType,
                priority: selectedPriority
            });
            if (res.success) {
                setTasks(res.data);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
            toast.error("Failed to load tasks");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, [workspaceId, activeTab, selectedType, selectedPriority]);

    const handleToggleComplete = async (taskId, currentStatus) => {
        try {
            const res = await updateCrmTaskStatusAction(workspaceId, taskId, !currentStatus);
            if (res.success) {
                setTasks(tasks.map(t => t.id === taskId ? { ...t, isCompleted: !currentStatus } : t));
                toast.success(!currentStatus ? "Task completed! 🎉" : "Task marked pending");
            } else {
                toast.error(res.error || "Failed to update task");
            }
        } catch (error) {
            toast.error("Error updating task status");
        }
    };

    const handleDeleteTask = async (taskId, taskTitle) => {
        if (!confirm(`Delete task "${taskTitle}"?`)) return;
        try {
            const res = await deleteCrmTaskAction(workspaceId, taskId);
            if (res.success) {
                setTasks(tasks.filter(t => t.id !== taskId));
                toast.success("Task deleted");
            }
        } catch (error) {
            toast.error("Error deleting task");
        }
    };

    const handleSendQuickWhatsApp = async () => {
        if (!activeWaTask?.contactPhone || !quickWaText.trim()) return;

        try {
            setIsSendingWA(true);
            const res = await sendWhatsAppFromCrmAction(workspaceId, {
                contactId: activeWaTask.contactId,
                dealId: activeWaTask.dealId,
                phone: activeWaTask.contactPhone,
                message: quickWaText.trim()
            });

            if (res.success) {
                toast.success(`WhatsApp follow-up dispatched to ${activeWaTask.contactPhone}!`);
                // Mark task complete
                await updateCrmTaskStatusAction(workspaceId, activeWaTask.id, true);
                setActiveWaTask(null);
                setQuickWaText('');
                loadTasks();
            } else {
                toast.error(res.error || "Failed to send WhatsApp");
            }
        } catch (error) {
            toast.error("Error sending WhatsApp follow-up");
        } finally {
            setIsSendingWA(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'WHATSAPP_FOLLOWUP':
                return <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />;
            case 'CALL':
                return <Phone className="w-3.5 h-3.5 text-blue-500" />;
            case 'MEETING':
                return <Calendar className="w-3.5 h-3.5 text-purple-500" />;
            case 'PAYMENT_CHASE':
                return <Receipt className="w-3.5 h-3.5 text-cyan-500" />;
            default:
                return <CheckSquare className="w-3.5 h-3.5 text-amber-500" />;
        }
    };

    const now = new Date();
    const overdueCount = tasks.filter(t => !t.isCompleted && new Date(t.dueDate) < now).length;
    const completedCount = tasks.filter(t => t.isCompleted).length;
    const pendingCount = tasks.filter(t => !t.isCompleted).length;

    const filteredTasks = tasks.filter(t => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.title.toLowerCase().includes(q) ||
            (t.contactName && t.contactName.toLowerCase().includes(q)) ||
            (t.dealTitle && t.dealTitle.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Telemetry Hero */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-card via-card to-background border border-border/80 shadow-sm relative overflow-hidden">
                <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5">
                            <CheckSquare className="w-3.5 h-3.5 mr-1" />
                            Omnichannel Action Center
                        </Badge>
                        {overdueCount > 0 && (
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px] font-bold">
                                {overdueCount} Overdue Follow-up{overdueCount !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                        Tasks & Follow-up Scheduler
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                        Schedule discovery calls, trigger 1-click WhatsApp follow-ups, and track rep action items across deals.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 z-10 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setIsRefreshing(true); loadTasks(); }}
                        disabled={isRefreshing}
                        className="h-9 text-xs gap-1.5 bg-background border-border/80"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-9 text-xs font-bold gap-1.5 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Schedule Task</span>
                    </Button>
                </div>
            </div>

            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider">Pending Action Items</span>
                        <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {pendingCount}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Active tasks across pipeline
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Overdue Alerts</span>
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-black text-rose-500">
                        {overdueCount}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Requires immediate touchpoint
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Completed Tasks</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-500">
                        {completedCount}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Executed action items
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">WhatsApp Follow-ups</span>
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {tasks.filter(t => t.type === 'WHATSAPP_FOLLOWUP').length}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        1-Click KonnectX bridge ready
                    </p>
                </div>
            </div>

            {/* Filter Controls & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/60">
                        <TabsTrigger value="ALL" className="rounded-xl text-xs font-bold px-3 py-1.5">
                            All ({tasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="TODAY" className="rounded-xl text-xs font-bold px-3 py-1.5 text-primary">
                            Due Today
                        </TabsTrigger>
                        <TabsTrigger value="OVERDUE" className="rounded-xl text-xs font-bold px-3 py-1.5 text-rose-500">
                            Overdue ({overdueCount})
                        </TabsTrigger>
                        <TabsTrigger value="COMPLETED" className="rounded-xl text-xs font-bold px-3 py-1.5 text-emerald-500">
                            Completed ({completedCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 flex-wrap">
                    <Input
                        placeholder="Search tasks, clients, deals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 text-xs w-[200px] bg-background"
                    />

                    <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="WHATSAPP_FOLLOWUP">WhatsApp</SelectItem>
                            <SelectItem value="CALL">Phone Call</SelectItem>
                            <SelectItem value="MEETING">Meeting</SelectItem>
                            <SelectItem value="PAYMENT_CHASE">Payment Chase</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="h-8 text-xs w-[120px] bg-background">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Task Cards List */}
            {isLoading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading schedule & follow-ups...</span>
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
                    <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                    <h3 className="font-bold text-sm text-foreground">No tasks matching criteria</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        All action items are up to date. Schedule a new task to stay on top of client follow-ups.
                    </p>
                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-xs font-bold">
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Schedule New Task
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTasks.map((task) => {
                        const isOverdue = !task.isCompleted && new Date(task.dueDate) < now;
                        const isActionableWA = task.contactPhone;

                        return (
                            <div
                                key={task.id}
                                className={`p-4 rounded-3xl bg-card border transition-all duration-200 hover:shadow-xs space-y-3 ${
                                    task.isCompleted
                                        ? 'opacity-60 bg-muted/10 border-border/40'
                                        : isOverdue
                                        ? 'border-rose-500/40 bg-gradient-to-r from-rose-500/5 via-card to-card'
                                        : 'border-border/80'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-start gap-3 min-w-0">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleComplete(task.id, task.isCompleted)}
                                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                                                task.isCompleted
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'border-muted-foreground/40 hover:border-primary hover:bg-primary/10'
                                            }`}
                                        >
                                            {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                                        </button>

                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    {getTypeIcon(task.type)}
                                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                                        {task.type?.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                <Badge className={`text-[10px] font-bold ${
                                                    task.priority === 'URGENT'
                                                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                        : task.priority === 'HIGH'
                                                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                }`}>
                                                    {task.priority}
                                                </Badge>

                                                {isOverdue && (
                                                    <Badge className="bg-rose-500 text-white text-[10px] font-bold py-0">
                                                        OVERDUE
                                                    </Badge>
                                                )}
                                            </div>

                                            <h3 className={`text-sm font-bold ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                {task.title}
                                            </h3>

                                            {task.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        {/* 1-Click WhatsApp Follow-up Quick Action */}
                                        {isActionableWA && !task.isCompleted && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setActiveWaTask(task);
                                                    setQuickWaText(`Hi ${task.contactName || 'there'}, following up regarding ${task.dealTitle || 'our discussion'}. Let me know if you have any questions!`);
                                                }}
                                                className="h-8 text-xs gap-1.5 text-[#25D366] border-[#25D366]/40 hover:bg-[#25D366]/10 font-bold"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                <span>WhatsApp Outreach</span>
                                            </Button>
                                        )}

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteTask(task.id, task.title)}
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Linked Deal & Contact Footnote */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 font-semibold text-foreground">
                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                            <span>Due: {new Date(task.dueDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                        </div>

                                        {task.contactName && (
                                            <div className="flex items-center gap-1 text-[11px]">
                                                <User className="w-3 h-3 text-primary" />
                                                <span>{task.contactName} {task.contactPhone ? `(${task.contactPhone})` : ''}</span>
                                            </div>
                                        )}

                                        {task.dealTitle && (
                                            <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                                                <Briefcase className="w-3 h-3" />
                                                <span className="truncate max-w-[160px]">{task.dealTitle}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[11px]">
                                        Assigned to: <strong className="text-foreground">{task.assignedTo || 'Amit Vishwakarma'}</strong>
                                    </div>
                                </div>

                                {/* Inline WhatsApp Sender Drawer */}
                                {activeWaTask?.id === task.id && (
                                    <div className="p-3 bg-[#25D366]/5 border border-[#25D366]/30 rounded-2xl space-y-2 mt-2">
                                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                            <span className="flex items-center gap-1 text-[#25D366]">
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                1-Click WhatsApp to {task.contactPhone}
                                            </span>
                                            <button type="button" onClick={() => setActiveWaTask(null)} className="text-xs text-muted-foreground hover:text-foreground">
                                                ✕
                                            </button>
                                        </div>
                                        <Input
                                            value={quickWaText}
                                            onChange={(e) => setQuickWaText(e.target.value)}
                                            className="h-8 text-xs bg-background"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setActiveWaTask(null)}
                                                className="h-7 text-xs"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={handleSendQuickWhatsApp}
                                                disabled={isSendingWA || !quickWaText.trim()}
                                                className="h-7 text-xs bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-1"
                                            >
                                                {isSendingWA ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                                <span>Send & Mark Complete</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                workspaceId={workspaceId}
                onTaskCreated={() => loadTasks()}
            />
        </div>
    );
}
