import { useState, useMemo } from "react";
import { FileText, Calendar, Clock, Archive, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./Header";
import { StatsCard } from "./StatsCard";
import { ViewToggle } from "./ViewToggle";
import { DocumentList } from "./DocumentList";
import { UploadModal } from "./UploadModal";
import { PrescriptionParserModal } from "./PrescriptionParserModal";
import { mockDocuments, mockStats } from "../_data/mockDocuments";
import { DocumentPreviewModal } from "./DocumentPreviewModal";



export default function DocumentIntractive() {
    const [searchQuery, setSearchQuery] = useState("");
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [previewDocument, setPreviewDocument] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [prescriptionParserOpen, setPrescriptionParserOpen] = useState(false);

    const handlePreview = (document) => {
        setPreviewDocument(document);
        setPreviewModalOpen(true);
    };

    const filteredDocuments = useMemo(() => {
        return mockDocuments.filter((doc) => {
            const matchesSearch =
                searchQuery === "" ||
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [searchQuery]);
    return (
        <div className="min-h-screen w-full bg-background">
            <div className="flex flex-col min-w-0">
                <Header
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onUploadClick={() => setUploadModalOpen(true)}
                />

                <main className="flex-1 p-6 overflow-auto">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Document <span className="gradient-text">Management</span>
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage and organize all hospital documents securely
                            </p>
                        </div>
                        <Button
                            onClick={() => setPrescriptionParserOpen(true)}
                            className="gap-2"
                            variant="outline"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Prescription Parser
                        </Button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatsCard
                            title="Total Documents"
                            value={mockStats.total}
                            icon={FileText}
                            variant="primary"
                            trend={{ value: 12, isPositive: true }}
                        />
                        <StatsCard
                            title="This Month"
                            value={mockStats.thisMonth}
                            icon={Calendar}
                            variant="success"
                            trend={{ value: 8, isPositive: true }}
                        />
                        <StatsCard
                            title="Pending Review"
                            value={mockStats.pending}
                            icon={Clock}
                            variant="warning"
                        />
                        <StatsCard
                            title="Archived"
                            value={mockStats.archived}
                            icon={Archive}
                            variant="default"
                        />
                    </div>

                    {/* Documents Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">All Documents</h2>
                                <p className="text-sm text-muted-foreground">
                                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""} found
                                </p>
                            </div>
                            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
                        </div>

                        <DocumentList
                            documents={filteredDocuments}
                            viewMode={viewMode}
                            onPreview={handlePreview}
                            groupByCategory={true}
                        />
                    </div>
                </main>
            </div>

            <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
            <DocumentPreviewModal
                document={previewDocument}
                open={previewModalOpen}
                onOpenChange={setPreviewModalOpen}
            />
            <PrescriptionParserModal
                open={prescriptionParserOpen}
                onOpenChange={setPrescriptionParserOpen}
            />
        </div>
    )
}
