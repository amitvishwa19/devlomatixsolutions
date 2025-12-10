'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function DocumentManager({ documents }) {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedDocument, setSelectedDocument] = useState(null);

    const categories = [
        { id: 'all', name: 'All Documents', icon: 'FolderIcon' },
        { id: 'imaging', name: 'Imaging', icon: 'PhotoIcon' },
        { id: 'reports', name: 'Lab Reports', icon: 'DocumentTextIcon' },
        { id: 'prescriptions', name: 'Prescriptions', icon: 'ClipboardDocumentIcon' },
        { id: 'referrals', name: 'Referrals', icon: 'ArrowRightCircleIcon' }
    ];

    const filteredDocuments = selectedCategory === 'all'
        ? documents
        : documents?.filter(doc => doc?.category === selectedCategory);

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
    };

    const handleCloseViewer = () => {
        setSelectedDocument(null);
    };

    const handleDownload = (documentId) => {
        console.log('Downloading document:', documentId);
    };

    const getFileIcon = (fileType) => {
        if (fileType?.startsWith('image/')) return 'PhotoIcon';
        if (fileType === 'application/pdf') return 'DocumentTextIcon';
        return 'DocumentIcon';
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Medical Documents</h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded transition-colors duration-200 ${viewMode === 'grid' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                                }`}
                        >
                            <Icon name="Squares2X2Icon" size={16} className="text-text-secondary" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded transition-colors duration-200 ${viewMode === 'list' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                                }`}
                        >
                            <Icon name="ListBulletIcon" size={16} className="text-text-secondary" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors duration-200">
                        <Icon name="ArrowUpTrayIcon" size={16} />
                        <span>Upload</span>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {categories?.map((category) => (
                    <button
                        key={category?.id}
                        onClick={() => setSelectedCategory(category?.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors duration-200 ${selectedCategory === category?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-text-secondary hover:bg-muted/80'
                            }`}
                    >
                        <Icon name={category?.icon} size={16} />
                        <span>{category?.name}</span>
                    </button>
                ))}
            </div>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments?.map((document) => (
                        <div
                            key={document?.id}
                            onClick={() => handleDocumentClick(document)}
                            className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        >
                            <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                {document?.thumbnail ? (
                                    <AppImage
                                        src={document?.thumbnail}
                                        alt={`Thumbnail preview of ${document?.name}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Icon name={getFileIcon(document?.fileType)} size={48} className="text-text-secondary" />
                                )}
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{document?.name}</h3>
                            <div className="flex items-center justify-between text-xs text-text-secondary">
                                <span>{document?.uploadDate}</span>
                                <span>{document?.fileSize}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredDocuments?.map((document) => (
                        <div
                            key={document?.id}
                            onClick={() => handleDocumentClick(document)}
                            className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name={getFileIcon(document?.fileType)} size={24} className="text-text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-foreground mb-1 truncate">{document?.name}</h3>
                                <div className="flex items-center gap-4 text-xs text-text-secondary">
                                    <span>{document?.uploadDate}</span>
                                    <span>{document?.fileSize}</span>
                                    <span className="capitalize">{document?.category}</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e?.stopPropagation();
                                    handleDownload(document?.id);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                            >
                                <Icon name="ArrowDownTrayIcon" size={20} className="text-text-secondary" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {selectedDocument && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
                    <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">{selectedDocument?.name}</h2>
                                <p className="text-sm text-text-secondary mt-1">
                                    Uploaded on {selectedDocument?.uploadDate} • {selectedDocument?.fileSize}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(selectedDocument?.id)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                                >
                                    <Icon name="ArrowDownTrayIcon" size={24} className="text-text-secondary" />
                                </button>
                                <button
                                    onClick={handleCloseViewer}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                                >
                                    <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-muted rounded-lg aspect-[4/3] flex items-center justify-center">
                                {selectedDocument?.thumbnail ? (
                                    <AppImage
                                        src={selectedDocument?.thumbnail}
                                        alt={`Full view of ${selectedDocument?.name}`}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Icon name={getFileIcon(selectedDocument?.fileType)} size={64} className="text-text-secondary mx-auto mb-4" />
                                        <p className="text-sm text-text-secondary">Preview not available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

DocumentManager.propTypes = {
    documents: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            category: PropTypes?.oneOf(['imaging', 'reports', 'prescriptions', 'referrals'])?.isRequired,
            fileType: PropTypes?.string?.isRequired,
            fileSize: PropTypes?.string?.isRequired,
            uploadDate: PropTypes?.string?.isRequired,
            thumbnail: PropTypes?.string
        })
    )?.isRequired
};