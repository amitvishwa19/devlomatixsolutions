'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { mockPatientData } from './PatientProfilePage';

export default function DocumentsTab() {
    const documents = mockPatientData.documents
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Lab Results', 'Imaging', 'Prescriptions', 'Consent Forms', 'Other'];

    const getDocumentIcon = (type) => {
        switch (type) {
            case 'Lab Results':
                return 'BeakerIcon';
            case 'Imaging':
                return 'PhotoIcon';
            case 'Prescriptions':
                return 'DocumentTextIcon';
            case 'Consent Forms':
                return 'ClipboardDocumentCheckIcon';
            default:
                return 'DocumentIcon';
        }
    };

    const filteredDocuments = selectedCategory === 'All'
        ? documents
        : documents?.filter(doc => doc?.category === selectedCategory);

    const handleDownload = (documentId) => {
        console.log('Downloading document:', documentId);
    };

    const handleView = (documentId) => {
        console.log('Viewing document:', documentId);
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-wrap gap-2">
                {categories?.map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ease-out ${selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-text-secondary hover:bg-muted/80 hover:text-foreground'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                {filteredDocuments?.length > 0 ? (
                    filteredDocuments?.map((document) => (
                        <div key={document?.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon name={getDocumentIcon(document?.category)} size={24} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-foreground truncate">{document?.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-text-secondary">{document?.uploadDate}</span>
                                                <span className="text-xs text-text-secondary">•</span>
                                                <span className="text-xs text-text-secondary">{document?.size}</span>
                                                <span className="text-xs text-text-secondary">•</span>
                                                <span className="inline-flex items-center px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium">
                                                    {document?.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleView(document?.id)}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
                                                title="View document"
                                            >
                                                <Icon name="EyeIcon" size={18} className="text-text-secondary" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(document?.id)}
                                                className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
                                                title="Download document"
                                            >
                                                <Icon name="ArrowDownTrayIcon" size={18} className="text-text-secondary" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-text-secondary">Uploaded by {document?.uploadedBy}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="DocumentIcon" size={32} className="text-text-secondary" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">No Documents Found</h3>
                        <p className="text-sm text-text-secondary">No documents available in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

DocumentsTab.propTypes = {
    documents: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        uploadDate: PropTypes?.string?.isRequired,
        size: PropTypes?.string?.isRequired,
        uploadedBy: PropTypes?.string?.isRequired
    }))?.isRequired
};