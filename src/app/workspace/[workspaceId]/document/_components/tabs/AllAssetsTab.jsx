'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/global/EmptyState';
import { DocumentCard } from '../DocumentCard';
import {
    FolderOpen,
    FileText,
    Pencil,
    Upload,
    ChevronRight,
    Home
} from 'lucide-react';

export function AllAssetsTab({
    documents = [],
    loading = false,
    viewMode = 'grid',
    activeTab = 'all',
    currentFolder = null,
    breadcrumbs = [],
    searchTerm = '',
    selectedDocIds = [],
    onSelectToggle,
    onNavigateBreadcrumb,
    onDeleteDocument,
    onViewDocument,
    onShareDocument,
    onEditNote,
    onOpenFolder,
    onUploadToFolder,
    onMoveDocument,
    onToggleStar,
    onDuplicateDocument,
    onAiInsights,
    onSelectForInspector,
    onOpenCreateNote,
    onOpenUploadModal
}) {
    return (
        <div className={`flex-1 overflow-y-auto p-4 flex flex-col transition-opacity duration-150 ${loading && documents.length > 0 ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            {/* Breadcrumbs Trail (when inside folders) */}
            {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-border/40 text-xs font-semibold text-muted-foreground overflow-x-auto shrink-0">
                    <button
                        onClick={() => onNavigateBreadcrumb('root')}
                        className="flex items-center gap-1 hover:text-primary transition-colors text-foreground"
                    >
                        <Home className="w-3.5 h-3.5" /> Workspace Root
                    </button>
                    {breadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={crumb.id || idx}>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                            <button
                                onClick={() => onNavigateBreadcrumb(crumb.id)}
                                className={`truncate max-w-[150px] transition-colors ${idx === breadcrumbs.length - 1
                                    ? "text-primary font-bold"
                                    : "hover:text-primary text-foreground"
                                    }`}
                            >
                                {crumb.name}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {loading && documents.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 animate-pulse">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-36 rounded-xl border border-border/40 bg-muted/20 p-4 flex flex-col justify-between" />
                    ))}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center flex-1">
                    <EmptyState
                        icon={currentFolder ? FolderOpen : FileText}
                        title={
                            activeTab === 'starred' ? "No Starred Items" :
                                activeTab === 'shared' ? "No Shared Documents" :
                                    currentFolder ? `"${currentFolder.name}" is empty` :
                                        "No Documents Found"
                        }
                        description={
                            searchTerm ? "No assets match your search criteria." :
                                currentFolder ? "This folder has no files or subfolders yet. Upload a file or create a note to get started." :
                                    "Start by creating a note, folder, or uploading a file."
                        }
                    />
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            onClick={onOpenCreateNote}
                            className="text-xs font-semibold gap-1.5"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Create Note
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onOpenUploadModal}
                            className="text-xs font-semibold gap-1.5"
                        >
                            <Upload className="w-3.5 h-3.5" /> Upload File
                        </Button>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            isSelected={selectedDocIds.includes(doc.id)}
                            onSelectToggle={onSelectToggle}
                            onDelete={onDeleteDocument}
                            onDownload={(d) => window.open(d.fileUrl, '_blank')}
                            onView={onViewDocument}
                            onShare={onShareDocument}
                            onEditNote={onEditNote}
                            onOpenFolder={onOpenFolder}
                            onUploadToFolder={onUploadToFolder}
                            onMoveDocument={onMoveDocument}
                            onToggleStar={onToggleStar}
                            onDuplicate={onDuplicateDocument}
                            onAiInsights={onAiInsights}
                            onSelectForInspector={onSelectForInspector}
                            viewMode="grid"
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {documents.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            isSelected={selectedDocIds.includes(doc.id)}
                            onSelectToggle={onSelectToggle}
                            onDelete={onDeleteDocument}
                            onDownload={(d) => window.open(d.fileUrl, '_blank')}
                            onView={onViewDocument}
                            onShare={onShareDocument}
                            onEditNote={onEditNote}
                            onOpenFolder={onOpenFolder}
                            onUploadToFolder={onUploadToFolder}
                            onMoveDocument={onMoveDocument}
                            onToggleStar={onToggleStar}
                            onDuplicate={onDuplicateDocument}
                            onAiInsights={onAiInsights}
                            onSelectForInspector={onSelectForInspector}
                            viewMode="list"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
