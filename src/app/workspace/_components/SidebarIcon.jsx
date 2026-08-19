'use client';

import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Tag,
    Users,
    ShoppingCart,
    Package,
    ShoppingBag,
    Ticket,
    Star,
    Settings,
    MessageCircleMore,
    BotMessageSquare,
    Zap,
    Megaphone,
    Bot,
    CreditCard,
    BookOpenText,
    Settings2,
    Workflow,
    LayoutGrid,
    GitBranch,
    ScrollText,
    Layers,
    MessagesSquare,
    MessageSquareText,
    Receipt,
    Repeat,
    DollarSign,
    IndianRupee,
    FormInput,
    FileEdit,
    Inbox,
    LayoutTemplate,
    BarChart3,
    Activity,
    TrendingUp,
    PieChart,
    BookOpen,
    FolderTree,
    ThumbsUp,
    Share2,
    Calendar,
    Send,
    Clock,
    File,
    Files,
    Folder,
    UploadCloud,
    Trash2,
    User,
    Briefcase,
    Handshake,
    UserSearch,
    GitMerge,
    FolderKanban,
    Columns3,
    Mail,
    MessageSquareMore,
    Blocks,
    FileSpreadsheet,
    UserPlus,
    UserCheck,
    MonitorCog,
    ShieldCheck,
    KeySquare,
    Timer,
    HelpCircle
} from 'lucide-react';

const ICON_MAP = {
    // Workspace & Common
    'layout-dashboard': LayoutDashboard,
    'layout-grid': LayoutGrid,
    'file-text': FileText,
    'tag': Tag,
    'users': Users,
    'user': User,
    'user-plus': UserPlus,
    'user-check': UserCheck,
    'user-search': UserSearch,
    'briefcase': Briefcase,
    'handshake': Handshake,
    'git-merge': GitMerge,

    // eCommerce
    'shopping-cart': ShoppingCart,
    'package': Package,
    'shopping-bag': ShoppingBag,
    'ticket': Ticket,
    'star': Star,
    'settings': Settings,
    'settings-2': Settings2,

    // KonnectX & Chat
    'message-circle-more': MessageCircleMore,
    'bot-message-square': BotMessageSquare,
    'messages-square': MessagesSquare,
    'message-square-text': MessageSquareText,
    'message-square-more': MessageSquareMore,
    'zap': Zap,
    'megaphone': Megaphone,
    'bot': Bot,
    'book-open-text': BookOpenText,

    // FlowForge & Workflows
    'workflow': Workflow,
    'git-branch': GitBranch,
    'scroll-text': ScrollText,
    'layers': Layers,

    // PayFlow
    'credit-card': CreditCard,
    'receipt': Receipt,
    'repeat': Repeat,
    'dollar-sign': IndianRupee,
    'indian-rupee': IndianRupee,

    // FormCraft
    'form-input': FormInput,
    'file-edit': FileEdit,
    'inbox': Inbox,
    'layout-template': LayoutTemplate,
    'bar-chart-3': BarChart3,

    // MetricPulse
    'activity': Activity,
    'trending-up': TrendingUp,
    'pie-chart': PieChart,

    // KnowBase
    'book-open': BookOpen,
    'folder-tree': FolderTree,
    'thumbs-up': ThumbsUp,

    // SocialHub
    'share-2': Share2,
    'calendar': Calendar,
    'send': Send,
    'clock': Clock,

    // Documents
    'file': File,
    'files': Files,
    'folder': Folder,
    'upload-cloud': UploadCloud,
    'trash-2': Trash2,

    // Productivity & System
    'folder-kanban': FolderKanban,
    'columns-3': Columns3,
    'mail': Mail,
    'blocks': Blocks,
    'file-spreadsheet': FileSpreadsheet,
    'monitor-cog': MonitorCog,
    'shield-check': ShieldCheck,
    'key-square': KeySquare,
    'timer': Timer,
};

export default function SidebarIcon({ name, size = 16, className = "" }) {
    if (!name) return null;
    const IconComponent = ICON_MAP[name.toLowerCase()] || LayoutGrid;
    return <IconComponent size={size} className={className} />;
}
