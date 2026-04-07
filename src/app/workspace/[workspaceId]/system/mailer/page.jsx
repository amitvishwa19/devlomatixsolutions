'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/utils/axios';
import Editor from '@monaco-editor/react';
import {
    Mail,
    Plus,
    Save,
    Play,
    FileText,
    Trash2,
    ChevronRight,
    Loader2,
    RefreshCw,
    Send,
    Eye,
    Settings2,
    Code2,
    AlertCircle,
    CheckCircle2,
    Search,
    Layout,
    Braces,
    Copy,
    Check,
    Edit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function MailerPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    // State
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [previewHtml, setPreviewHtml] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('preview');
    const [cloningFile, setCloningFile] = useState(null);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [fileToRename, setFileToRename] = useState(null);
    const [renamingFileName, setRenamingFileName] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modals
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [assignFromEmail, setAssignFromEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testDestinationEmail, setTestDestinationEmail] = useState('');
    const [testSenderEmail, setTestSenderEmail] = useState('');

    const iframeRef = useRef(null);
    const editorRef = useRef(null);

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    // Fetch Files
    const fetchFiles = useCallback(async () => {
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/mailer/files`);
            setFiles(res.data);
            if (res.data.length > 0 && !selectedFile) {
                handleFileSelect(res.data[0].name);
            }
        } catch (error) {
            toast.error("Failed to fetch templates");
        }
    }, [workspaceId, selectedFile]);

    // Fetch Assignments
    const fetchAssignments = useCallback(async () => {
        try {
            const res = await axios.get(`/api/workspace/${workspaceId}/mailer/assignments`);
            setAssignments(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchFiles();
        fetchAssignments();
        setIsLoading(false);
    }, [fetchFiles, fetchAssignments]);

    // Handle File Selection
    const handleFileSelect = async (filename) => {
        try {
            setIsRendering(true);
            const res = await axios.get(`/api/workspace/${workspaceId}/mailer/files/${filename}`);
            setSelectedFile(filename);
            setFileContent(res.data.content);
            setOriginalContent(res.data.content);

            // Auto-render preview
            await handleRenderPreview(filename);
        } catch (error) {
            toast.error("Failed to load template content");
        } finally {
            setIsRendering(false);
        }
    };

    // Auto-format when template charges
    useEffect(() => {
        if (selectedFile && editorRef.current) {
            const timer = setTimeout(() => {
                editorRef.current.getAction('editor.action.formatDocument')?.run();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [selectedFile, activeTab]);

    // Save File
    const handleSave = async () => {
        if (!selectedFile) return;
        setIsSaving(true);
        try {
            await axios.patch(`/api/workspace/${workspaceId}/mailer/files/${selectedFile}`, {
                content: fileContent
            });
            setOriginalContent(fileContent);
            toast.success("Template saved successfully");
            await handleRenderPreview(selectedFile);
        } catch (error) {
            toast.error("Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    // Create New File
    const handleCreateFile = async () => {
        if (!newFileName) return;
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/mailer/files`, {
                name: newFileName
            });
            toast.success("Template created");
            setIsNewModalOpen(false);
            setNewFileName('');
            fetchFiles();
            // Automatically select the new file
            if (res.data.name) {
                handleFileSelect(res.data.name);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create template");
        }
    };

    // Clone Template
    const handleCloneFile = async (sourceFilename) => {
        setCloningFile(sourceFilename);
        try {
            // Remove extension for naming the copy
            const baseName = sourceFilename.replace(/\.(html|jsx)$/, "");
            const newName = `copy-of-${baseName}_${new Date().getTime().toString().slice(-4)}`;

            const res = await axios.post(`/api/workspace/${workspaceId}/mailer/files`, {
                name: newName,
                cloneFrom: sourceFilename
            });

            toast.success(`Cloned ${sourceFilename} to ${res.data.name}`);
            await fetchFiles();
            // Select the cloned file
            if (res.data.name) {
                handleFileSelect(res.data.name);
            }
        } catch (error) {
            toast.error("Failed to clone template");
            console.error(error);
        } finally {
            setCloningFile(null);
        }
    };

    // Rename Template
    const handleRenameFile = async () => {
        if (!fileToRename || !renamingFileName) return;
        try {
            await axios.patch(`/api/workspace/${workspaceId}/mailer/files/${fileToRename}`, {
                newName: renamingFileName
            });

            toast.success(`Renamed ${fileToRename} to ${renamingFileName}`);
            setIsRenameModalOpen(false);
            setRenamingFileName('');
            setFileToRename(null);
            
            await fetchFiles();
            // Automatically select the renamed file
            handleFileSelect(renamingFileName);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to rename template");
            console.error(error);
        }
    };

    // Delete Template
    const handleDeleteFile = async () => {
        if (!fileToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/api/workspace/${workspaceId}/mailer/files/${fileToDelete}`);
            toast.success(`Deleted template: ${fileToDelete}`);
            setIsDeleteModalOpen(false);
            setFileToDelete(null);
            
            // Refetch list and select another file if needed
            const updatedFiles = files.filter(f => f.name !== fileToDelete);
            setFiles(updatedFiles);
            if (selectedFile === fileToDelete) {
                setSelectedFile(null);
                setFileContent('');
                setPreviewHtml('');
            }
            await fetchFiles();
        } catch (error) {
            toast.error("Failed to delete template");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Render Preview
    const handleRenderPreview = async (filename) => {
        if (!filename) return;
        setIsRendering(true);
        try {
            const res = await axios.post(`/api/workspace/${workspaceId}/mailer/render`, {
                filename
            });
            setPreviewHtml(res.data.html);
        } catch (error) {
            console.error("Render error:", error);
            setPreviewHtml(`
                <div style="padding: 20px; color: #e11d48; font-family: sans-serif; background: #fff1f2; border: 1px solid #fda4af; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0;">Render Error</h3>
                    <p style="margin: 0; font-size: 14px;">${error.response?.data?.message || error.message}</p>
                </div>
            `);
        } finally {
            setIsRendering(false);
        }
    };

    // Update Assignment
    const handleAssignEvent = async () => {
        if (!selectedFile || !selectedEvent) return;
        try {
            await axios.post(`/api/workspace/${workspaceId}/mailer/assignments`, {
                event: selectedEvent,
                templateName: selectedFile,
                fromEmail: assignFromEmail || null
            });
            toast.success("Event assigned successfully");
            setIsAssignModalOpen(false);
            fetchAssignments();
        } catch (error) {
            toast.error("Failed to assign event");
        }
    };

    // Send Test Mail
    const handleTestSend = async () => {
        if (!selectedFile) return;
        setIsTesting(true);
        try {
            await axios.post(`/api/workspace/${workspaceId}/mailer/test`, {
                templateName: selectedFile,
                testEmail: testDestinationEmail || null,
                testFromEmail: testSenderEmail || null
            });
            toast.success("Test email sent successfully!");
            setIsTestModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send test email");
        } finally {
            setIsTesting(false);
        }
    };

    const hasChanges = fileContent !== originalContent;

    const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col bg-background animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b px-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold tracking-tight">Mail Message Templates</h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60">Design & Manage Email Library</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsNewModalOpen(true)}
                        className="h-8 text-[10px] font-bold rounded-md gap-2"
                    >
                        <Plus className="h-3 w-3" /> New Template
                    </Button>
                    <Button
                        disabled={!selectedFile || isTesting}
                        onClick={() => setIsTestModalOpen(true)}
                        size="sm"
                        variant="secondary"
                        className="h-8 text-[10px] font-bold rounded-md gap-2 shadow-sm border"
                    >
                        {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Send Test
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/20 flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-[10px] font-medium bg-background border-none rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
                        <div className="space-y-1">
                            {filteredFiles.map((file) => (
                                <div
                                    key={file.name}
                                    onClick={() => handleFileSelect(file.name)}
                                    className={`group w-full flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-bold transition-all cursor-pointer ${selectedFile === file.name
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <FileText className="h-3.5 w-3.5 opacity-50" />
                                    <span className="truncate flex-1 text-left">{file.name}</span>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloneFile(file.name);
                                            }}
                                            disabled={cloningFile === file.name}
                                            className="p-1 hover:bg-primary/20 rounded-md transition-colors"
                                            title="Clone Template"
                                        >
                                            {cloningFile === file.name ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileToRename(file.name);
                                                setRenamingFileName(file.name.replace(/\.(html|jsx)$/, ""));
                                                setIsRenameModalOpen(true);
                                            }}
                                            className="p-1 hover:bg-primary/20 rounded-md transition-colors"
                                            title="Rename Template"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileToDelete(file.name);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-1 hover:bg-destructive/20 rounded-md transition-colors text-muted-foreground hover:text-destructive"
                                            title="Delete Template"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>

                                    {assignments.some(a => a.templateName === file.name) && (
                                        <Badge variant="outline" className="h-4 px-1 text-[8px] bg-primary/5 text-primary border-primary/20">Active</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor & Preview */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                        <div className="flex items-center justify-between px-4 border-b bg-card h-12">
                            <TabsList className="bg-transparent border-none gap-4">
                                <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-[10px] font-bold px-4 gap-2">
                                    {isRendering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} Preview
                                </TabsTrigger>
                                <TabsTrigger value="editor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-[10px] font-bold px-4 gap-2">
                                    <Code2 className="h-3.5 w-3.5" /> Editor
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 text-[10px] font-bold px-4 gap-2">
                                    <Settings2 className="h-3.5 w-3.5" /> Assignments
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                {selectedFile && (
                                    <>
                                        <Button
                                            disabled={isSaving || !hasChanges}
                                            onClick={handleSave}
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[10px] font-bold rounded-md gap-2 px-3 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleFormat}
                                            className="h-8 text-[10px] font-bold rounded-md gap-2 px-3"
                                            title="Format Code (Alt+Shift+F)"
                                        >
                                            <Braces className="h-3 w-3" />
                                            Format
                                        </Button>
                                        <div className="w-px h-4 bg-border/50 mx-1" />
                                        <Button variant="ghost" size="sm" onClick={() => handleRenderPreview(selectedFile)} className="h-8 w-8 p-0" title="Refresh Preview">
                                            <RefreshCw className={`h-3.5 w-3.5 ${isRendering ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden outline-none">
                            {selectedFile ? (
                                <Editor
                                    height="100%"
                                    defaultLanguage="html"
                                    theme="vs-dark"
                                    value={fileContent}
                                    onChange={(value) => setFileContent(value)}
                                    onMount={handleEditorMount}
                                    options={{
                                        fontSize: 13,
                                        fontFamily: 'JetBrains Mono, monospace',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        readOnly: false,
                                        cursorStyle: 'line',
                                        automaticLayout: true,
                                        padding: { top: 20 },
                                        formatOnPaste: true,
                                        formatOnType: true,
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5">
                                    <Layout className="h-12 w-12 opacity-10" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Select a template to edit</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="preview" className="flex-1 m-0 p-4 bg-muted/30 overflow-auto outline-none">
                            <div className="max-w-4xl mx-auto h-full rounded-md border bg-white shadow-xl overflow-hidden relative">
                                {isRendering && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    </div>
                                )}
                                <iframe
                                    srcDoc={previewHtml}
                                    className="w-full h-full border-none"
                                    title="Email Preview"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="settings" className="flex-1 m-0 p-8 overflow-y-auto outline-none">
                            <div className="">
                                <Card className="border-none shadow-soft overflow-hidden">
                                    <CardHeader className="bg-primary/5">
                                        <CardTitle className="text-sm font-bold">Event Assignments</CardTitle>
                                        <CardDescription className="text-[10px]">Map your templates to system-wide email triggers.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="bg-muted/50 border-y">
                                                <tr>
                                                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-muted-foreground h-10 align-middle">System Event</th>
                                                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-muted-foreground h-10 align-middle">Connected Template</th>
                                                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-muted-foreground h-10 align-middle text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {[
                                                    { event: 'USER_REGISTRATION', label: 'User Registration' },
                                                    { event: 'WORKSPACE_INVITE', label: 'Workspace Invitation' },
                                                    { event: 'PASSWORD_RESET', label: 'Password Reset' },
                                                    { event: 'JOB_APPLICATION_ACK', label: 'Job Application Confirmation' }
                                                ].map((item) => {
                                                    const assigned = assignments.find(a => a.event === item.event);
                                                    return (
                                                        <tr key={item.event} className="hover:bg-muted/30 transition-colors">
                                                            <td className="px-6 py-4 font-bold">{item.label}</td>
                                                            <td className="px-6 py-4">
                                                                {assigned ? (
                                                                    <div className="flex items-center gap-2 text-primary">
                                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                                        <span>{assigned.templateName}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-muted-foreground italic opacity-50">
                                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                                        <span>Not assigned</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    {assigned && (
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            className="h-7 text-[9px] font-bold rounded-md border shadow-sm"
                                                                            onClick={() => {
                                                                                setSelectedFile(assigned.templateName);
                                                                                setTestSenderEmail(assigned.fromEmail || '');
                                                                                setIsTestModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <Send className="h-3 w-3 mr-1" /> Test Mapping
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 text-[9px] font-bold rounded-md"
                                                                        onClick={() => {
                                                                            setSelectedEvent(item.event);
                                                                            setSelectedFile(assigned ? assigned.templateName : '');
                                                                            setAssignFromEmail(assigned?.fromEmail || '');
                                                                            setIsAssignModalOpen(true);
                                                                        }}
                                                                    >
                                                                        {assigned ? 'Change Mapping' : 'Assign Template'}
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* New Template Modal */}
            <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
                <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" /> Create New Template
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-2 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Template Name</label>
                            <Input
                                placeholder="e.g. welcome-email"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                            />
                            <p className="text-[9px] text-muted-foreground px-1 opacity-60">This will store a standard HTML Handlebars template in your database</p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/10">
                        <Button variant="ghost" onClick={() => setIsNewModalOpen(false)} className="text-[10px] font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleCreateFile} className="text-[10px] font-bold rounded-md px-8 shadow-lg shadow-primary/20">Create Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assignment Modal */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                            <Layout className="h-5 w-5" /> Assign Template to Event
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-2 space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-md">
                            <Settings2 className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-[10px] font-bold text-primary uppercase">Current Event</p>
                                <p className="text-sm font-bold">{selectedEvent}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Select Template</label>
                                <Select value={selectedFile} onValueChange={setSelectedFile}>
                                    <SelectTrigger className="h-12 bg-muted/30 border-none rounded-md font-bold focus:ring-1 focus:ring-primary shadow-inner">
                                        <SelectValue placeholder="Choose a template file" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md border-border/20 shadow-2xl">
                                        {filteredFiles.map(f => (
                                            <SelectItem key={f.name} value={f.name} className="py-3 font-bold text-xs">{f.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Custom "From" Email (Optional)</label>
                                <Input
                                    placeholder="e.g. support@devlomatix.com"
                                    value={assignFromEmail}
                                    onChange={(e) => setAssignFromEmail(e.target.value)}
                                    className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                                />
                                <p className="text-[9px] text-muted-foreground px-1 opacity-60">Leave blank to use the system default address config.</p>
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 text-primary mt-2 flex items-center gap-1"><Send className="h-3 w-3" /> Quick Test Sandbox</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Testing target 'To' email (Optional)"
                                        value={testDestinationEmail}
                                        onChange={(e) => setTestDestinationEmail(e.target.value)}
                                        className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner flex-1"
                                    />
                                    <Button 
                                        variant="secondary" 
                                        className="h-12 border shadow-sm px-6 font-bold text-xs"
                                        disabled={isTesting || !selectedFile}
                                        onClick={async () => {
                                            setIsTesting(true);
                                            try {
                                                await axios.post(`/api/workspace/${workspaceId}/mailer/test`, {
                                                    templateName: selectedFile,
                                                    testEmail: testDestinationEmail || null,
                                                    testFromEmail: assignFromEmail || null
                                                });
                                                toast.success("Sandbox test dispatched!");
                                            } catch (error) {
                                                toast.error(error.response?.data?.message || "Failed to dispatch test");
                                            } finally {
                                                setIsTesting(false);
                                            }
                                        }}
                                    >
                                        {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Test'}
                                    </Button>
                                </div>
                                <p className="text-[9px] text-muted-foreground px-1 opacity-60">Dry-run this assignment immediately to verify your layouts and mappings.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/10">
                        <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)} className="text-[10px] font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleAssignEvent} className="text-[10px] font-bold rounded-md px-8 shadow-lg shadow-primary/20">Confirm Assignment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Email Modal */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
                            <Send className="h-5 w-5" /> Send Test Email
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-2 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">To Email Address</label>
                            <Input
                                placeholder="Optional (defaults to your admin email)"
                                value={testDestinationEmail}
                                onChange={(e) => setTestDestinationEmail(e.target.value)}
                                className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                            />
                            <p className="text-[9px] text-muted-foreground px-1 opacity-60">Leave blank to use your logged-in email.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Custom "From" Email</label>
                            <Input
                                placeholder="e.g. alerts@devlomatix.com"
                                value={testSenderEmail}
                                onChange={(e) => setTestSenderEmail(e.target.value)}
                                className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                            />
                            <p className="text-[9px] text-muted-foreground px-1 opacity-60">Test delivery mapping using a specific sender address.</p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/10">
                        <Button variant="ghost" onClick={() => setIsTestModalOpen(false)} className="text-[10px] font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleTestSend} disabled={isTesting} className="text-[10px] font-bold rounded-md px-8 shadow-lg shadow-primary/20">
                            {isTesting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Send Test Email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Template Modal */}
            <Dialog open={isRenameModalOpen} onOpenChange={setIsRenameModalOpen}>
                <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Edit2 className="h-5 w-5 text-primary" /> Rename Template
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-2 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">New Template Name</label>
                            <Input
                                placeholder="e.g. welcome-email-v2"
                                value={renamingFileName}
                                onChange={(e) => setRenamingFileName(e.target.value)}
                                className="h-12 bg-muted/30 border-none rounded-md font-bold focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                            />
                            <p className="text-[9px] text-muted-foreground px-1 opacity-60">This will update all system event mappings associated with this template name.</p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/10">
                        <Button variant="ghost" onClick={() => setIsRenameModalOpen(false)} className="text-[10px] font-bold rounded-md">Cancel</Button>
                        <Button onClick={handleRenameFile} className="text-[10px] font-bold rounded-md px-8 shadow-lg shadow-primary/20">Rename Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md rounded-md p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-4">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" /> Delete Template
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-8 pt-2 space-y-4">
                        <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-md">
                            <p className="text-sm font-bold text-destructive mb-1">Confirm Permanent Deletion</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-foreground">"{fileToDelete}"</span>? This will permanently remove all versions and unassign it from any system events. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-2 bg-muted/10 border-t border-border/10">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-[10px] font-bold rounded-md">Cancel</Button>
                        <Button 
                            disabled={isDeleting}
                            onClick={handleDeleteFile} 
                            variant="destructive"
                            className="text-[10px] font-bold rounded-md px-8 shadow-lg shadow-destructive/20"
                        >
                            {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Delete Forever
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
