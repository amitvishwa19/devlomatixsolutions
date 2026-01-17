'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import React from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { Plus, FolderOpen, Share2, Table2, Files, ReceiptText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from './_hooks/useDocuments'
import { BulkActionsBar, CategoryBreakdown, DocumentFilters, DocumentList, DocumentPreviewDialog, DocumentStats, RecentActivity, ShareDocumentDialog, SharedWithMe, UploadDocumentDialog } from './_components'


export default function DocumentPage() {
    const {
        // Data
        filteredDocuments,
        sharedDocuments,
        documentShares,
        selectedDocument,
        selectedDocuments,

        // Filters
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        showStarredOnly,
        setShowStarredOnly,

        // UI state
        viewMode,
        setViewMode,
        selectionMode,
        setSelectionMode,
        activeTab,
        setActiveTab,

        // Dialogs
        uploadDialogOpen,
        setUploadDialogOpen,
        shareDialogOpen,
        setShareDialogOpen,
        previewDialogOpen,
        setPreviewDialogOpen,

        // Document actions
        handleView,
        handleDownload,
        handleDelete,
        handleShare,
        handleToggleStar,
        handleSelectDocument,
        handleClearSelection,

        // Bulk actions
        handleBulkDownload,
        handleBulkShare,
        handleBulkArchive,
        handleBulkDelete,

        // Sharing actions
        handleAddShare,
        handleRemoveShare,
        handleUpdatePermission,

        // Upload
        handleUpload,

        // Shared document actions
        handleViewShared,
        handleDownloadShared,
    } = useDocuments();


    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Documents'
                description='Patient Records, Invoices, Reports, and Forms – Always Organized, Always Accessible'
                icon='files'
                actionComp={<Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>}
            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md  '>
                {/* Stats */}
                <DocumentStats />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-4">
                    <TabsList className="bg-secondary/30">
                        <TabsTrigger value="my-documents" className="gap-2">
                            <FolderOpen className="h-4 w-4" />
                            My Documents
                        </TabsTrigger>
                        <TabsTrigger value="all-documents" className="gap-2">
                            <Table2 className="h-4 w-4" />
                            All Documents
                        </TabsTrigger>
                        <TabsTrigger value="shared-with-me" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Shared with Me
                            {sharedDocuments.length > 0 && (
                                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                    {sharedDocuments.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-documents" className="space-y-6 mt-0">
                        {/* Filters */}
                        <DocumentFilters
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            categoryFilter={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                            showStarredOnly={showStarredOnly}
                            onShowStarredChange={setShowStarredOnly}
                            selectionMode={selectionMode}
                            onSelectionModeChange={setSelectionMode}
                        />

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Document List */}
                            <div className="lg:col-span-3">
                                <DocumentList
                                    documents={filteredDocuments}
                                    onView={handleView}
                                    onDownload={handleDownload}
                                    onDelete={handleDelete}
                                    onShare={handleShare}
                                    viewMode={viewMode}
                                    selectedDocuments={selectedDocuments}
                                    onSelectDocument={handleSelectDocument}
                                    onToggleStar={handleToggleStar}
                                    selectionMode={selectionMode}
                                />
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <CategoryBreakdown />
                                <RecentActivity />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="all-documents" className="space-y-6 mt-0">
                        {/* Simple search for table view */}
                        <DocumentFilters
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            categoryFilter={categoryFilter}
                            onCategoryChange={setCategoryFilter}
                            statusFilter={statusFilter}
                            onStatusChange={setStatusFilter}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            showStarredOnly={showStarredOnly}
                            onShowStarredChange={setShowStarredOnly}
                            selectionMode={selectionMode}
                            onSelectionModeChange={setSelectionMode}
                        />

                        {/* Full width table */}
                        <DocumentList
                            documents={filteredDocuments}
                            onView={handleView}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            onShare={handleShare}
                            viewMode="list"
                            selectedDocuments={selectedDocuments}
                            onSelectDocument={handleSelectDocument}
                            onToggleStar={handleToggleStar}
                            selectionMode={selectionMode}
                        />
                    </TabsContent>

                    <TabsContent value="shared-with-me" className="space-y-6 mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <SharedWithMe
                                    documents={sharedDocuments}
                                    onView={handleViewShared}
                                    onDownload={handleDownloadShared}
                                />
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-card rounded-xl border border-border p-5">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-foreground">Sharing Info</h3>
                                        <p className="text-xs text-muted-foreground">How sharing works</p>
                                    </div>
                                    <div className="space-y-3 text-xs text-muted-foreground">
                                        <p><span className="font-medium text-foreground">View only:</span> Can open and download the document.</p>
                                        <p><span className="font-medium text-foreground">Can edit:</span> Can modify document metadata and annotations.</p>
                                        <p><span className="font-medium text-foreground">Full access:</span> Can share, edit, and manage the document.</p>
                                    </div>
                                </div>
                                <RecentActivity />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>



            </ScrollArea>


            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedDocuments.size}
                onClearSelection={handleClearSelection}
                onBulkDownload={handleBulkDownload}
                onBulkShare={handleBulkShare}
                onBulkArchive={handleBulkArchive}
                onBulkDelete={handleBulkDelete}
            />

            {/* Upload Dialog */}
            <UploadDocumentDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                onUpload={handleUpload}
            />

            {/* Share Dialog */}
            <ShareDocumentDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                document={selectedDocument}
                sharedUsers={selectedDocument ? (documentShares[selectedDocument.id] || []) : []}
                onShare={handleAddShare}
                onRemoveShare={handleRemoveShare}
                onUpdatePermission={handleUpdatePermission}
            />

            {/* Preview Dialog */}
            <DocumentPreviewDialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                document={selectedDocument}
                onDownload={handleDownload}
                onShare={handleShare}
            />

        </div >
    )
}
