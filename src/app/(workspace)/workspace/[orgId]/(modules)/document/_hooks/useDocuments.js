import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  mockDocuments,
  mockSharedDocuments,
  initialDocumentShares,
  filterDocuments,
  createDocumentFromUpload,
} from "../_functions/document-utils";

export function useDocuments() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState(mockDocuments);
  const [sharedDocuments] = useState(mockSharedDocuments);
  const [documentShares, setDocumentShares] = useState(initialDocumentShares);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // UI state
  const [viewMode, setViewMode] = useState("grid");
  const [selectionMode, setSelectionMode] = useState(false);
  const [activeTab, setActiveTab] = useState("my-documents");

  // Dialogs state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return filterDocuments(documents, {
      searchQuery,
      categoryFilter,
      statusFilter,
      showStarredOnly,
      sortBy,
    });
  }, [documents, searchQuery, categoryFilter, statusFilter, sortBy, showStarredOnly]);

  // Document actions
  const handleView = useCallback((doc) => {
    setSelectedDocument(doc);
    setPreviewDialogOpen(true);
  }, []);

  const handleDownload = useCallback((doc) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.name}`,
    });
  }, [toast]);

  const handleDelete = useCallback((doc) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
    toast({
      title: "Document deleted",
      description: `${doc.name} has been removed`,
      variant: "destructive",
    });
  }, [toast]);

  const handleShare = useCallback((doc) => {
    setSelectedDocument(doc);
    setShareDialogOpen(true);
    setPreviewDialogOpen(false);
  }, []);

  const handleToggleStar = useCallback((doc) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, starred: !d.starred } : d))
    );
    toast({
      title: doc.starred ? "Removed from starred" : "Added to starred",
      description: doc.name,
    });
  }, [toast]);

  const handleSelectDocument = useCallback((doc, selected) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(doc.id);
      } else {
        next.delete(doc.id);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedDocuments(new Set());
    setSelectionMode(false);
  }, []);

  // Bulk actions
  const handleBulkDownload = useCallback(() => {
    toast({
      title: "Bulk download started",
      description: `Downloading ${selectedDocuments.size} documents`,
    });
    handleClearSelection();
  }, [toast, selectedDocuments.size, handleClearSelection]);

  const handleBulkShare = useCallback(() => {
    toast({
      title: "Bulk share",
      description: `Sharing ${selectedDocuments.size} documents`,
    });
  }, [toast, selectedDocuments.size]);

  const handleBulkArchive = useCallback(() => {
    setDocuments((prev) =>
      prev.map((d) =>
        selectedDocuments.has(d.id) ? { ...d, status: "archived" } : d
      )
    );
    toast({
      title: "Documents archived",
      description: `${selectedDocuments.size} documents have been archived`,
    });
    handleClearSelection();
  }, [toast, selectedDocuments, handleClearSelection]);

  const handleBulkDelete = useCallback(() => {
    setDocuments((prev) => prev.filter((d) => !selectedDocuments.has(d.id)));
    toast({
      title: "Documents deleted",
      description: `${selectedDocuments.size} documents have been removed`,
      variant: "destructive",
    });
    handleClearSelection();
  }, [toast, selectedDocuments, handleClearSelection]);

  // Sharing actions
  const handleAddShare = useCallback((email, permission) => {
    if (!selectedDocument) return;

    const newShare = {
      id: `u-${Date.now()}`,
      email,
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      permission: permission,
      sharedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    setDocumentShares((prev) => ({
      ...prev,
      [selectedDocument.id]: [...(prev[selectedDocument.id] || []), newShare],
    }));

    toast({
      title: "Document shared",
      description: `${selectedDocument.name} shared with ${email}`,
    });
  }, [selectedDocument, toast]);

  const handleRemoveShare = useCallback((userId) => {
    if (!selectedDocument) return;

    setDocumentShares((prev) => ({
      ...prev,
      [selectedDocument.id]: (prev[selectedDocument.id] || []).filter((u) => u.id !== userId),
    }));

    toast({
      title: "Access removed",
      description: "User no longer has access to this document",
    });
  }, [selectedDocument, toast]);

  const handleUpdatePermission = useCallback((userId, permission) => {
    if (!selectedDocument) return;

    setDocumentShares((prev) => ({
      ...prev,
      [selectedDocument.id]: (prev[selectedDocument.id] || []).map((u) =>
        u.id === userId ? { ...u, permission: permission } : u
      ),
    }));

    toast({
      title: "Permission updated",
      description: "User permissions have been changed",
    });
  }, [selectedDocument, toast]);

  // Upload action
  const handleUpload = useCallback((data) => {
    if (data.file) {
      const newDoc = createDocumentFromUpload({
        file: data.file,
        category: data.category,
        patientId: data.patientId || undefined,
      });
      setDocuments((prev) => [newDoc, ...prev]);
      toast({
        title: "Document uploaded",
        description: `${data.file.name} has been uploaded successfully`,
      });
    }
  }, [toast]);

  // Shared document actions
  const handleViewShared = useCallback((doc) => {
    toast({
      title: "Opening shared document",
      description: `Viewing ${doc.name}`,
    });
  }, [toast]);

  const handleDownloadShared = useCallback((doc) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.name}`,
    });
  }, [toast]);

  return {
    // Data
    documents,
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
  };
}
