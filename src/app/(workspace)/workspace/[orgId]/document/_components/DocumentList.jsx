
import { DocumentCard } from "./DocumentCard";
import { FileX, UserRound, FlaskConical, Pill, ScanLine, FileSignature, Shield, ClipboardList, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryLabels } from "../_data/document";

const categoryIconMap = {
  "patient-records": UserRound,
  "lab-reports": FlaskConical,
  "prescriptions": Pill,
  "imaging": ScanLine,
  "consent-forms": FileSignature,
  "insurance": Shield,
  "discharge-summary": ClipboardList,
  "other": File,
};

export function DocumentList({ documents, viewMode, onPreview, groupByCategory = false }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No documents found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  if (groupByCategory) {
    // Group documents by category
    const groupedDocuments = documents.reduce((acc, doc) => {
      if (!acc[doc.category]) {
        acc[doc.category] = [];
      }
      acc[doc.category].push(doc);
      return acc;
    }, {});

    const categories = Object.keys(groupedDocuments);

    return (
      <div className="space-y-8">
        {categories.map((category) => {
          const Icon = categoryIconMap[category];
          const categoryDocs = groupedDocuments[category];

          return (
            <div key={category} className="animate-fade-in">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {categoryLabels[category]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {categoryDocs.length} document{categoryDocs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Documents Grid */}
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "grid gap-4"
                )}
              >
                {categoryDocs.map((doc, index) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    viewMode={viewMode}
                    onPreview={onPreview}
                    style={{ animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "grid gap-4"
      )}
    >
      {documents.map((doc, index) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          viewMode={viewMode}
          onPreview={onPreview}
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}
