'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';


const ImportContactsModal = ({
    isOpen,
    onClose,
    onImport,
}) => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const modalRef = useRef < HTMLDivElement > (null);
    const fileInputRef = useRef(null);

    useState(() => {
        setIsHydrated(true);
    });

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setSelectedFile(file);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
            setSelectedFile(null);
            onClose();
        }
    };

    const handleBrowse = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen || !isHydrated) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="bg-card rounded-lg shadow-elevation-xl w-full max-w-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Import Contacts</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-muted transition-smooth"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="px-6 py-6">
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                            Import Instructions
                        </h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li className="flex items-start space-x-2">
                                <Icon name="CheckCircleIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                                <span>Upload a CSV file with contact information</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Icon name="CheckCircleIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                                <span>Required columns: Name, Email, Phone, Type, Department</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Icon name="CheckCircleIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                                <span>Optional columns: Role, Status, Communication Preference</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Icon name="CheckCircleIcon" size={16} className="text-success mt-0.5 flex-shrink-0" />
                                <span>System will validate and detect duplicates automatically</span>
                            </li>
                        </ul>
                    </div>

                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${dragActive
                            ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {selectedFile ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                                    <Icon name="DocumentTextIcon" size={32} className="text-success" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="text-sm text-error hover:text-error/80 transition-smooth"
                                >
                                    Remove file
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                                    <Icon name="ArrowUpTrayIcon" size={32} className="text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        Drag and drop your CSV file here
                                    </p>
                                    <p className="text-xs text-muted-foreground">or</p>
                                </div>
                                <button
                                    onClick={handleBrowse}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth"
                                >
                                    Browse Files
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start space-x-2">
                            <Icon name="InformationCircleIcon" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">CSV Format Example:</p>
                                <code className="text-xs bg-background px-2 py-1 rounded">
                                    Name,Email,Phone,Type,Department,Status\nJohn Doe,john@example.com,555-0123,patient,Cardiology,active
                                </code>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-smooth"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!selectedFile}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Import Contacts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportContactsModal;