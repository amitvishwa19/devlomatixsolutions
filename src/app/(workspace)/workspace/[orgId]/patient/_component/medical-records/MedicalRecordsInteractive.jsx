'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import MedicalHistoryTimeline from './MedicalHistoryTimeline';
import ClinicalNotesEditor from './ClinicalNotesEditor';
import LabResultsPanel from './LabResultsPanel';
import PrescriptionManager from './PrescriptionManager';
import VitalSignsTracker from './VitalSignsTracker';
import AllergyAlerts from './AllergyAlerts';
import DocumentManager from './DocumentManager';

export default function MedicalRecordsInteractive({ initialData }) {
    const [activeTab, setActiveTab] = useState('overview');

    const handleSaveNote = (noteData) => {
        console.log('Saving clinical note:', noteData);
    };

    const tabs = [
        { id: 'overview', name: 'Overview', icon: 'HomeIcon' },
        { id: 'history', name: 'Medical History', icon: 'ClockIcon' },
        { id: 'vitals', name: 'Vital Signs', icon: 'HeartIcon' },
        { id: 'labs', name: 'Lab Results', icon: 'BeakerIcon' },
        { id: 'medications', name: 'Medications', icon: 'ClipboardDocumentIcon' },
        { id: 'documents', name: 'Documents', icon: 'FolderIcon' },
        { id: 'notes', name: 'Clinical Notes', icon: 'DocumentTextIcon' }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {tabs?.map((tab) => (
                        <button
                            key={tab?.id}
                            onClick={() => setActiveTab(tab?.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors duration-200 ${activeTab === tab?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-text-secondary hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <span>{tab?.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <VitalSignsTracker vitalSigns={initialData?.vitalSigns} />
                        <PrescriptionManager prescriptions={initialData?.prescriptions} />
                    </div>
                    <div className="space-y-6">
                        <AllergyAlerts allergies={initialData?.allergies} />
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-base font-semibold text-foreground mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Total Visits</span>
                                    <span className="text-lg font-semibold text-foreground">{initialData?.stats?.totalVisits}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Active Medications</span>
                                    <span className="text-lg font-semibold text-foreground">{initialData?.stats?.activeMedications}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Lab Tests</span>
                                    <span className="text-lg font-semibold text-foreground">{initialData?.stats?.labTests}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">Documents</span>
                                    <span className="text-lg font-semibold text-foreground">{initialData?.stats?.documents}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'history' && (
                <MedicalHistoryTimeline historyData={initialData?.medicalHistory} />
            )}
            {activeTab === 'vitals' && (
                <VitalSignsTracker vitalSigns={initialData?.vitalSigns} />
            )}
            {activeTab === 'labs' && (
                <LabResultsPanel labResults={initialData?.labResults} />
            )}
            {activeTab === 'medications' && (
                <PrescriptionManager prescriptions={initialData?.prescriptions} />
            )}
            {activeTab === 'documents' && (
                <DocumentManager documents={initialData?.documents} />
            )}
            {activeTab === 'notes' && (
                <ClinicalNotesEditor
                    templates={initialData?.noteTemplates}
                    onSaveNote={handleSaveNote}
                />
            )}
        </div>
    );
}

MedicalRecordsInteractive.propTypes = {
    initialData: PropTypes?.shape({
        medicalHistory: PropTypes?.array?.isRequired,
        noteTemplates: PropTypes?.array?.isRequired,
        labResults: PropTypes?.array?.isRequired,
        prescriptions: PropTypes?.array?.isRequired,
        vitalSigns: PropTypes?.object?.isRequired,
        allergies: PropTypes?.array?.isRequired,
        documents: PropTypes?.array?.isRequired,
        stats: PropTypes?.shape({
            totalVisits: PropTypes?.number?.isRequired,
            activeMedications: PropTypes?.number?.isRequired,
            labTests: PropTypes?.number?.isRequired,
            documents: PropTypes?.number?.isRequired
        })?.isRequired
    })?.isRequired
};