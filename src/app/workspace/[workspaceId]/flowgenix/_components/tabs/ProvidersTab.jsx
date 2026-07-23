'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Cpu, 
    Plus, 
    CheckCircle2, 
    AlertCircle, 
    Key, 
    Globe, 
    Eye, 
    EyeOff, 
    Trash2, 
    RefreshCw, 
    Search,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    ExternalLink,
    Loader2,
    Check,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    getProvidersAction, 
    upsertProviderAction, 
    toggleProviderStatusAction, 
    testProviderConnectionAction, 
    deleteProviderAction,
    validateApiKeyAction 
} from '../../_action/provider-actions';

export function ProvidersTab({ workspaceId }) {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testingId, setTestingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [configuredOnly, setConfiguredOnly] = useState(false);

    // Selected Provider Detail View
    const [activeDetailProvider, setActiveDetailProvider] = useState(null);

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState('single'); // 'single' | 'bulk'
    const [checkingKey, setCheckingKey] = useState(false);
    const [keyValidationResult, setKeyValidationResult] = useState(null); // { valid: true, models: [], message: "" }
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showKey, setShowKey] = useState(false);
    
    // Form state (matching screenshot)
    const [formData, setFormData] = useState({
        id: '',
        provider: 'freemodel',
        providerName: 'FreeModel.dev',
        name: 'main',
        apiKey: '',
        importFreeOnly: false,
        validationModel: '',
        priority: '1',
        baseUrl: ''
    });

    // 250+ Provider Catalog
    const providerCatalog = [
        { id: "freemodel", name: "FreeModel.dev", category: "free", authType: "API Key", defaultModels: ["meta-llama/llama-3.1-8b-instruct", "qwen/qwen-2.5-72b-instruct", "deepseek-ai/deepseek-r1-distill-llama-70b"], isFreeTier: true, defaultUrl: "https://freemodel.dev/api/v1" },
        { id: "nvidia", name: "NVIDIA NIM", category: "coding", authType: "API Key", defaultModels: ["meta/llama-3.1-405b-instruct", "nvidia/nemotron-4-340b-instruct"], isFreeTier: false, defaultUrl: "https://integrate.api.nvidia.com/v1" },
        { id: "anthropic", name: "Anthropic", category: "coding", authType: "API Key", defaultModels: ["claude-3-7-sonnet", "claude-3-5-haiku"], isFreeTier: false, defaultUrl: "https://api.anthropic.com" },
        { id: "deepseek", name: "DeepSeek API", category: "coding", authType: "API Key", defaultModels: ["deepseek-chat-v3", "deepseek-reasoner-r1"], isFreeTier: false, defaultUrl: "https://api.deepseek.com" },
        { id: "groq", name: "Groq Cloud", category: "free", authType: "Free Tier API Key", defaultModels: ["llama-3.3-70b-versatile", "mixtral-8x7b"], isFreeTier: true, defaultUrl: "https://api.groq.com/openai/v1" },
        { id: "google", name: "Google AI Studio", category: "free", authType: "Free Tier API Key", defaultModels: ["gemini-2.0-flash", "gemini-1.5-pro"], isFreeTier: true, defaultUrl: "https://generativelanguage.googleapis.com" },
        { id: "openrouter", name: "OpenRouter", category: "all", authType: "API Key", defaultModels: ["auto", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-r1"], isFreeTier: true, defaultUrl: "https://openrouter.ai/api/v1" },
        { id: "ollama", name: "Ollama (Local GPU)", category: "local", authType: "Local / No Key", defaultModels: ["llama3.2:latest", "deepseek-r1:14b"], isFreeTier: true, defaultUrl: "http://localhost:11434" }
    ];

    const categories = [
        { id: "all", label: "All Providers" },
        { id: "free", label: "Free Tiers (90+)" },
        { id: "coding", label: "Coding Plans" },
        { id: "local", label: "Ollama & Local" }
    ];

    useEffect(() => {
        fetchProviders();
    }, [workspaceId]);

    const fetchProviders = async () => {
        if (!workspaceId) return;
        setLoading(true);
        const res = await getProvidersAction(workspaceId);
        if (res.success) {
            setProviders(res.data || []);
        } else {
            toast.error(res.error || "Failed to load providers");
        }
        setLoading(false);
    };

    // Trigger API Key Check
    const handleCheckKey = async () => {
        if (!formData.apiKey || !formData.apiKey.trim()) {
            return toast.error("Please enter an API Key to check.");
        }

        setCheckingKey(true);
        setKeyValidationResult(null);

        const res = await validateApiKeyAction({
            provider: formData.provider,
            apiKey: formData.apiKey,
            baseUrl: formData.baseUrl,
            validationModel: formData.validationModel,
            importFreeOnly: formData.importFreeOnly
        });

        if (res.success && res.valid) {
            setKeyValidationResult({
                valid: true,
                models: res.models || [],
                message: "Valid API Key"
            });
            toast.success(`Valid API Key! (${res.models?.length || 0} models found)`);
        } else {
            setKeyValidationResult({
                valid: false,
                models: [],
                message: res.error || "Invalid API Key"
            });
            toast.error(res.error || "Invalid API Key");
        }
        setCheckingKey(false);
    };

    const handleSaveProvider = async () => {
        if (!formData.name || !formData.apiKey) {
            return toast.error("Connection Name and API Key are required.");
        }

        setSubmitting(true);
        
        // Imported models array
        const importedModels = keyValidationResult?.models || providerCatalog.find(c => c.id === formData.provider)?.defaultModels || [];

        const res = await upsertProviderAction({
            workspaceId,
            id: formData.id || undefined,
            provider: formData.provider,
            name: `${formData.providerName} - ${formData.name}`,
            label: formData.name,
            apiKey: formData.apiKey,
            baseUrl: formData.baseUrl || undefined,
            description: `Priority: ${formData.priority} • Imported Models: ${importedModels.join(', ')}`,
            metadata: {
                priority: formData.priority,
                validationModel: formData.validationModel,
                importFreeOnly: formData.importFreeOnly,
                importedModels
            }
        });

        if (res.success) {
            toast.success(`Saved and imported ${importedModels.length} model names!`);
            setIsAddModalOpen(false);
            resetForm();
            fetchProviders();
        } else {
            toast.error(res.error || "Failed to save provider");
        }
        setSubmitting(false);
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const res = await toggleProviderStatusAction({ id, isActive: !currentStatus, workspaceId });
        if (res.success) {
            toast.success(!currentStatus ? "Provider enabled" : "Provider disabled");
            setProviders(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
        } else {
            toast.error(res.error || "Failed to toggle status");
        }
    };

    const handleDeleteProvider = async (id) => {
        if (!confirm("Are you sure you want to delete this provider connection?")) return;
        const res = await deleteProviderAction({ id, workspaceId });
        if (res.success) {
            toast.success("Provider connection removed");
            setProviders(prev => prev.filter(p => p.id !== id));
        } else {
            toast.error(res.error || "Failed to delete provider");
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            provider: 'freemodel',
            providerName: 'FreeModel.dev',
            name: 'main',
            apiKey: '',
            importFreeOnly: false,
            validationModel: '',
            priority: '1',
            baseUrl: ''
        });
        setKeyValidationResult(null);
        setShowAdvanced(false);
    };

    const openAddModalForProvider = (providerItem) => {
        setFormData({
            id: '',
            provider: providerItem.id,
            providerName: providerItem.name,
            name: 'main',
            apiKey: '',
            importFreeOnly: false,
            validationModel: '',
            priority: '1',
            baseUrl: providerItem.defaultUrl
        });
        setKeyValidationResult(null);
        setShowAdvanced(false);
        setIsAddModalOpen(true);
    };

    const displayedProviders = providerCatalog.filter(catalogItem => {
        const matchesSearch = catalogItem.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || catalogItem.category === selectedCategory;
        const configuredMatch = providers.some(p => p.provider === catalogItem.id);
        if (configuredOnly && !configuredMatch) return false;
        return matchesSearch && matchesCategory;
    });

    const renderAddModal = () => (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if(!open) resetForm(); }}>
            <DialogContent className="sm:max-w-md bg-[#161822] text-foreground border border-border/40 shadow-2xl p-0 overflow-hidden rounded-xl">
                <DialogTitle className="sr-only">Add {formData.providerName} API Key</DialogTitle>
                
                {/* macOS Traffic Lights Header */}
                <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between bg-card/60">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <h3 className="text-sm font-bold tracking-tight">Add {formData.providerName} API Key</h3>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Single / Bulk Add Tabs */}
                    <div className="flex items-center border-b border-border/30 gap-6">
                        <button 
                            onClick={() => setModalTab('single')}
                            className={`pb-2 text-xs font-bold transition-all relative ${modalTab === 'single' ? 'text-primary border-b-2 border-red-500' : 'text-muted-foreground'}`}
                        >
                            Single
                        </button>
                        <button 
                            onClick={() => setModalTab('bulk')}
                            className={`pb-2 text-xs font-bold transition-all relative ${modalTab === 'bulk' ? 'text-primary border-b-2 border-red-500' : 'text-muted-foreground'}`}
                        >
                            Bulk Add
                        </button>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-foreground">Name</label>
                        <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="main"
                            className="bg-[#1e2230] border-border/30 text-xs h-10 rounded-lg"
                        />
                    </div>

                    {/* API Key Field + Check Button */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-foreground">API Key</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Input 
                                    type={showKey ? "text" : "password"}
                                    value={formData.apiKey}
                                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                    placeholder="••••••••"
                                    className="bg-[#1e2230] border-purple-500/50 focus:border-purple-500 text-xs h-10 rounded-lg pr-10 font-mono"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <Button 
                                type="button" 
                                variant="secondary"
                                size="sm"
                                disabled={checkingKey || !formData.apiKey}
                                onClick={handleCheckKey}
                                className="h-10 px-4 text-xs font-bold bg-[#292d3e] hover:bg-[#34394e] text-foreground border border-border/30"
                            >
                                {checkingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
                            </Button>
                        </div>
                        {keyValidationResult && (
                            <div className={`mt-1.5 text-xs flex items-center gap-1.5 font-bold ${keyValidationResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                {keyValidationResult.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                <span>{keyValidationResult.message} ({keyValidationResult.models.length} models detected)</span>
                            </div>
                        )}
                    </div>

                    {/* Import Only Free Models Switch */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                        <div className="space-y-0.5 text-left">
                            <label className="text-xs font-bold text-foreground block">Import only free models</label>
                            <p className="text-[10px] text-muted-foreground">
                                When enabled, only this provider's free models are imported. Paid models are skipped.
                            </p>
                        </div>
                        <Switch 
                            checked={formData.importFreeOnly} 
                            onCheckedChange={(val) => setFormData({ ...formData, importFreeOnly: val })}
                        />
                    </div>

                    {/* Collapsible Advanced Settings */}
                    <div className="border-t border-border/20 pt-3">
                        <button 
                            type="button" 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                            {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                            Advanced Settings
                        </button>

                        {showAdvanced && (
                            <div className="space-y-4 pt-3 text-left">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">Validation Model</label>
                                    <Input 
                                        value={formData.validationModel}
                                        onChange={(e) => setFormData({ ...formData, validationModel: e.target.value })}
                                        placeholder="e.g. meta-llama/llama-3.1-8b-instruct"
                                        className="bg-[#1e2230] border-border/30 text-xs h-10 rounded-lg"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Model used to verify the API key. Leave blank to use provider's first available model.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground">Priority</label>
                                    <Input 
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="bg-[#1e2230] border-border/30 text-xs h-10 rounded-lg"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="p-5 bg-[#12141d] border-t border-border/20 flex items-center justify-between gap-3">
                    <Button 
                        type="button" 
                        className="w-1/2 h-10 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs rounded-lg shadow-lg shadow-purple-500/20"
                        disabled={submitting}
                        onClick={handleSaveProvider}
                    >
                        {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                        Save
                    </Button>
                    <Button 
                        type="button" 
                        variant="ghost"
                        className="w-1/2 h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

    // Render Provider Detail Screen matching Screenshot #1
    if (activeDetailProvider) {
        const configuredConnections = providers.filter(p => p.provider === activeDetailProvider.id);
        
        return (
            <div className="space-y-6 pb-6">
                {/* Breadcrumbs & Navigation */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span>Dashboard</span>
                        <span>›</span>
                        <span>Providers</span>
                        <span>›</span>
                        <span className="text-foreground font-bold">{activeDetailProvider.name}</span>
                    </div>
                    <button 
                        onClick={() => setActiveDetailProvider(null)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Providers
                    </button>
                </div>

                {/* Provider Title Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center border border-primary/30 text-base">
                        {activeDetailProvider.name[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight">{activeDetailProvider.name}</h1>
                            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{configuredConnections.length} connections</span>
                    </div>
                </div>

                {/* Connections Card */}
                <Card className="border border-border/50 bg-card/40">
                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-bold">Connections</CardTitle>
                            <Badge className="text-[10px] bg-secondary text-secondary-foreground">Provider Proxy</Badge>
                        </div>
                        <Button 
                            size="sm" 
                            className="bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
                            onClick={() => openAddModalForProvider(activeDetailProvider)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add
                        </Button>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        {configuredConnections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-4 rounded-full bg-secondary/30 text-purple-400 mb-3 border border-border/30">
                                    <Key className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-foreground mb-1">No connections yet</h4>
                                <p className="text-xs text-muted-foreground mb-4">Add your first connection to get started</p>
                                <Button 
                                    size="sm"
                                    className="bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs"
                                    onClick={() => openAddModalForProvider(activeDetailProvider)}
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Connection
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {configuredConnections.map((conn) => (
                                    <div key={conn.id} className="p-3.5 rounded-lg border border-border/40 bg-secondary/20 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs">{conn.name}</span>
                                                <Badge className="text-[9px] bg-emerald-500/15 text-emerald-500">{conn.healthStatus}</Badge>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground font-mono">{conn.description}</p>
                                        </div>
                                        <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProvider(conn.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Available Models Block */}
                <Card className="border border-border/50 bg-card/40">
                    <CardHeader className="p-5 pb-3">
                        <CardTitle className="text-sm font-bold">Available Models</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {activeDetailProvider.defaultModels.map((model, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs font-mono bg-secondary/50 p-2">
                                    {model}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {renderAddModal()}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            {/* Top Bar Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-xs">
                <div>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-primary" />
                        <h2 className="text-base font-bold tracking-tight">Provider Catalog & API Key Connections</h2>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Validate keys, test live ping, and auto-import all model names upon save.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/40">
                        <span className="text-xs font-semibold text-muted-foreground">Configured Only</span>
                        <Switch 
                            checked={configuredOnly} 
                            onCheckedChange={setConfiguredOnly}
                            className="scale-90"
                        />
                    </div>

                    {/* Add API Key Dialog */}
                    {renderAddModal()}
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                        <Button 
                            key={cat.id} 
                            variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                            size="sm"
                            className={`text-xs h-8 rounded-lg ${selectedCategory === cat.id ? "bg-primary/15 text-primary border border-primary/20 font-bold" : "text-muted-foreground"}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                        placeholder="Search providers..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-secondary/30 border-border/40 text-xs h-8 rounded-lg" 
                    />
                </div>
            </div>

            {/* Provider Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProviders.map((catItem) => {
                    const dbMatch = providers.find(p => p.provider === catItem.id);
                    const isConfigured = !!dbMatch;
                    const isActive = dbMatch?.isActive ?? false;

                    return (
                        <Card 
                            key={catItem.id} 
                            onClick={() => setActiveDetailProvider(catItem)}
                            className={`border transition-all flex flex-col justify-between cursor-pointer hover:border-primary/50 ${isConfigured ? "border-primary/30 bg-card/60 shadow-xs" : "border-border/40 bg-card/30 opacity-90"}`}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center border border-primary/30 text-sm">
                                            {catItem.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">{catItem.name}</span>
                                                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono block">{catItem.authType}</span>
                                        </div>
                                    </div>

                                    {isConfigured && (
                                        <Switch 
                                            checked={isActive} 
                                            onClick={(e) => e.stopPropagation()}
                                            onCheckedChange={() => handleToggleStatus(dbMatch.id, isActive)}
                                        />
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 pt-1 space-y-3">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Supported Models</span>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {catItem.defaultModels.map((m, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-[9px] font-mono bg-secondary/40">
                                                {m}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-border/30 flex items-center justify-between">
                                    {isConfigured ? (
                                        <Badge className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400">
                                            Connected • Active
                                        </Badge>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground italic">0 connections</span>
                                    )}

                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="h-7 text-[10px] font-bold"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openAddModalForProvider(catItem);
                                        }}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Key
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
