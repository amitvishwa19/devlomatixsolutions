'use client';

import React from 'react';
import { 
    RefreshCw, 
    Zap, 
    ChevronRight, 
    Trash2 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

export default function MetaCloudTab({
    metaCloudVersion,
    setMetaCloudVersion,
    metaCloudAccessToken,
    setMetaCloudAccessToken,
    metaCloudTesting,
    handleTestMetaCloud,
    metaCloudResult,
    metaCloudResultOpen,
    setMetaCloudResultOpen,
    displayNamesPhoneId,
    setDisplayNamesPhoneId,
    displayNamesTesting,
    handleGetDisplayNames,
    displayNamesResult,
    displayNamesResultOpen,
    setDisplayNamesResultOpen,
    obaPhoneId,
    setObaPhoneId,
    obaStatusTesting,
    handleCheckObaStatus,
    obaStatusResult,
    obaStatusResultOpen,
    setObaStatusResultOpen,
    obaWebsiteUrl,
    setObaWebsiteUrl,
    obaParentBusiness,
    setObaParentBusiness,
    obaCountry,
    setObaCountry,
    obaLanguage,
    setObaLanguage,
    obaAdditionalInfo,
    setObaAdditionalInfo,
    obaTesting,
    handleObaStatus,
    obaResult,
    obaResultOpen,
    setObaResultOpen,
    qrMessage,
    setQrMessage,
    qrFormat,
    setQrFormat,
    qrTesting,
    handleCreateQR,
    qrResult,
    qrResultOpen,
    setQrResultOpen,
    qrListTesting,
    handleListQR,
    qrListResult,
    qrListResultOpen,
    setQrListResultOpen,
    qrUpdateCodeId,
    setQrUpdateCodeId,
    qrUpdateMessage,
    setQrUpdateMessage,
    qrUpdateFormat,
    setQrUpdateFormat,
    qrUpdateTesting,
    handleUpdateQR,
    qrUpdateResult,
    qrUpdateResultOpen,
    setQrUpdateResultOpen,
    qrDeleteCodeId,
    setQrDeleteCodeId,
    qrDeleteTesting,
    handleDeleteQR,
    qrDeleteResult,
    qrDeleteResultOpen,
    setQrDeleteResultOpen
}) {
    return (
        <ScrollArea className="h-[72vh] space-y-6 p-4">
            <div id='all-test-container' className='flex flex-col gap-2'>
                {/* Card 1 — Developer App Info */}
                <Card className="glass-card border-none shadow-none w-full">
                    <CardContent className="flex flex-col gap-4 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <Label className="text-sm font-bold tracking-tight">Developer App Info</Label>
                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /debug_token</span>
                        </div>

                        <div className="flex gap-3">
                            <div className="space-y-1.5 w-28 shrink-0">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Version</Label>
                                <Input
                                    value={metaCloudVersion ?? ''}
                                    onChange={(e) => setMetaCloudVersion(e.target.value)}
                                    className="bg-background/40 text-xs font-mono font-bold border rounded-md px-3 shadow-inner"
                                />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Access Token</Label>
                                <Input
                                    type="password"
                                    placeholder="EAAG..."
                                    value={metaCloudAccessToken ?? ''}
                                    onChange={(e) => setMetaCloudAccessToken(e.target.value)}
                                    className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<API_VERSION>'}</span>/debug_token?input_token=<span className="text-primary/80">{metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                            <br />
                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                        </div>

                        <div>
                            <Button
                                className="px-8 rounded-md text-xs gap-2"
                                onClick={handleTestMetaCloud}
                                disabled={metaCloudTesting || !metaCloudAccessToken.trim()}
                            >
                                {metaCloudTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {metaCloudTesting ? 'Getting Info...' : 'Get Info'}
                            </Button>
                        </div>

                        {metaCloudResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setMetaCloudResultOpen(v => !v)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors"
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${metaCloudResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {metaCloudResult.success ? '✓ Success' : '✗ Failed'}
                                    </span>
                                    {metaCloudResult.status && <span className="text-[10px] font-mono text-muted-foreground">{metaCloudResult.status} {metaCloudResult.statusText}</span>}
                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${metaCloudResultOpen ? 'rotate-90' : ''}`} />
                                </button>
                                {metaCloudResultOpen && (
                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                        {metaCloudResult.error ? metaCloudResult.error : JSON.stringify(metaCloudResult.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 2 — Get Display Names */}
                <Card className="glass-card border-none shadow-none w-full">
                    <CardContent className="flex flex-col gap-4 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <Label className="text-sm font-bold tracking-tight">Get Display Names</Label>
                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /{'{phone_id}'}?fields=verified_name,name_status</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Phone Number ID</Label>
                            <Input
                                placeholder="106540352242922"
                                value={displayNamesPhoneId ?? ''}
                                onChange={(e) => setDisplayNamesPhoneId(e.target.value)}
                                className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner"
                            />
                        </div>

                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Version</span> and <span className="text-primary/60 font-bold">Access Token</span> from card above.</p>

                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{displayNamesPhoneId || '<phone_number_id>'}</span>?fields=verified_name,name_status
                            <br />
                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                        </div>

                        <div>
                            <Button
                                className="px-8 rounded-md text-xs gap-2"
                                onClick={handleGetDisplayNames}
                                disabled={displayNamesTesting || !displayNamesPhoneId.trim() || !metaCloudAccessToken.trim()}
                            >
                                {displayNamesTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {displayNamesTesting ? 'Fetching...' : 'Get Display Names'}
                            </Button>
                        </div>

                        {displayNamesResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setDisplayNamesResultOpen(v => !v)}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors"
                                >
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${displayNamesResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {displayNamesResult.success ? '✓ Success' : '✗ Failed'}
                                    </span>
                                    {displayNamesResult.status && <span className="text-[10px] font-mono text-muted-foreground">{displayNamesResult.status} {displayNamesResult.statusText}</span>}
                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${displayNamesResultOpen ? 'rotate-90' : ''}`} />
                                </button>
                                {displayNamesResultOpen && (
                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                        {displayNamesResult.error ? displayNamesResult.error : JSON.stringify(displayNamesResult.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 3 - OBA Status Check */}
                <Card className="glass-card border-none shadow-none w-full">
                    <CardContent className="flex flex-col gap-4 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <Label className="text-sm font-bold tracking-tight">OBA Status Check</Label>
                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">GET /{'{phone_id}'}?fields=name_status,code_verification_status</span>
                        </div>

                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Phone Number ID</span> from above, and <span className="text-primary/60 font-bold">Version</span> / <span className="text-primary/60 font-bold">Access Token</span> from top card.</p>

                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                            GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>?fields=name_status,code_verification_status
                            <br />
                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                        </div>

                        <div>
                            <Button className="px-8 rounded-md text-xs gap-2" onClick={handleCheckObaStatus} disabled={obaStatusTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                {obaStatusTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {obaStatusTesting ? 'Checking...' : 'Check OBA Status'}
                            </Button>
                        </div>

                        {obaStatusResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                <button onClick={() => setObaStatusResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${obaStatusResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {obaStatusResult.success ? '✓ Success' : '✗ Failed'}
                                    </span>
                                    {obaStatusResult.status && <span className="text-[10px] font-mono text-muted-foreground">{obaStatusResult.status} {obaStatusResult.statusText}</span>}
                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${obaStatusResultOpen ? 'rotate-90' : ''}`} />
                                </button>
                                {obaStatusResultOpen && (
                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                        {obaStatusResult.error ? obaStatusResult.error : JSON.stringify(obaStatusResult.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 4 - OBA Request */}
                <Card className="glass-card border-none shadow-none w-full">
                    <CardContent className="flex flex-col gap-4 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <Label className="text-sm font-bold tracking-tight">OBA Request</Label>
                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">POST /{'{phone_id}'}/official_business_account</span>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Phone Number ID</Label>
                            <Input placeholder="106540352242922" value={obaPhoneId ?? ''} onChange={(e) => setObaPhoneId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Business Website URL</Label>
                                <Input placeholder="https://yourbusiness.com" value={obaWebsiteUrl ?? ''} onChange={(e) => setObaWebsiteUrl(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Parent Business / Brand</Label>
                                <Input placeholder="Lucky Shrub LLC" value={obaParentBusiness ?? ''} onChange={(e) => setObaParentBusiness(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Primary Country</Label>
                                <Input placeholder="United States of America" value={obaCountry ?? ''} onChange={(e) => setObaCountry(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Primary Language</Label>
                                <Input placeholder="English" value={obaLanguage ?? ''} onChange={(e) => setObaLanguage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Additional Supporting Information</Label>
                            <textarea
                                rows={2}
                                placeholder="We are also featured in..."
                                value={obaAdditionalInfo ?? ''}
                                onChange={(e) => setObaAdditionalInfo(e.target.value)}
                                className="w-full bg-background/40 text-xs font-medium border border-input rounded-md px-3 py-2 shadow-inner resize-none outline-none focus:border-primary/20"
                            />
                        </div>

                        <p className="text-[10px] text-muted-foreground/40 ml-1">Uses <span className="text-primary/60 font-bold">Version</span> and <span className="text-primary/60 font-bold">Access Token</span> from top card.</p>

                        <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                            POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion || '<version>'}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/official_business_account
                            <br />
                            <span className="opacity-50">Authorization: Bearer {metaCloudAccessToken ? '••••••••' : '<ACCESS_TOKEN>'}</span>
                        </div>

                        <div>
                            <Button className="px-8 rounded-md text-xs gap-2" onClick={handleObaStatus} disabled={obaTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                {obaTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                {obaTesting ? 'Submitting...' : 'Submit OBA Request'}
                            </Button>
                        </div>

                        {obaResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border border-border/20 rounded-lg overflow-hidden">
                                <button onClick={() => setObaResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${obaResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {obaResult.success ? '✓ Success' : '✗ Failed'}
                                    </span>
                                    {obaResult.status && <span className="text-[10px] font-mono text-muted-foreground">{obaResult.status} {obaResult.statusText}</span>}
                                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${obaResultOpen ? 'rotate-90' : ''}`} />
                                </button>
                                {obaResultOpen && (
                                    <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-72 text-muted-foreground leading-relaxed whitespace-pre-wrap break-all">
                                        {obaResult.error ? obaResult.error : JSON.stringify(obaResult.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 5 — QR Codes */}
                <Card className="glass-card border-none shadow-none w-full">
                    <CardContent className="flex flex-col gap-4 pt-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <Label className="text-sm font-bold tracking-tight">QR Codes</Label>
                            <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">/message_qrdls</span>
                        </div>

                        <Tabs defaultValue="create" className="w-full">
                            <TabsList className="bg-muted/5 w-full justify-start rounded-lg h-auto p-1 gap-1 border border-border/20 mb-3">
                                {[
                                    { value: 'create', label: 'Create', method: 'POST' },
                                    { value: 'list', label: 'Get List', method: 'GET' },
                                    { value: 'update', label: 'Update', method: 'POST' },
                                    { value: 'delete', label: 'Delete', method: 'DEL' },
                                ].map(({ value, label, method }) => (
                                    <TabsTrigger key={value} value={value} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                        <span className={`text-[8px] font-black px-1 py-0.5 rounded ${method === 'GET' ? 'bg-blue-500/10 text-blue-400' : method === 'DEL' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{method}</span>
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* CREATE */}
                            <TabsContent value="create" className="space-y-3 mt-0">
                                <div className="flex gap-3">
                                    <div className="space-y-1.5 flex-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Prefilled Message</Label>
                                        <Input placeholder="e.g. Cyber Monday" value={qrMessage ?? ''} onChange={(e) => setQrMessage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                    </div>
                                    <div className="space-y-1.5 w-28 shrink-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Format</Label>
                                        <Select value={qrFormat} onValueChange={setQrFormat}>
                                            <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="SVG" className="text-xs">SVG</SelectItem><SelectItem value="PNG" className="text-xs">PNG</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                    POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                </div>
                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleCreateQR} disabled={qrTesting || !obaPhoneId.trim() || !qrMessage.trim() || !metaCloudAccessToken.trim()}>
                                    {qrTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                    {qrTesting ? 'Generating...' : 'Create QR Code'}
                                </Button>
                                {qrResult && (
                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                        <button onClick={() => setQrResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrResult.success ? '✓ Success' : '✗ Failed'}</span>
                                            {qrResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrResult.status} {qrResult.statusText}</span>}
                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrResultOpen ? 'rotate-90' : ''}`} />
                                        </button>
                                        {qrResultOpen && (
                                            <div className="p-3 space-y-3">
                                                {qrResult.data?.qr_image_url && (
                                                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg">
                                                        <img src={qrResult.data.qr_image_url} alt="QR Code" className="w-40 h-40 object-contain" />
                                                        {qrResult.data?.deep_link_url && <a href={qrResult.data.deep_link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-mono underline break-all">{qrResult.data.deep_link_url}</a>}
                                                    </div>
                                                )}
                                                <pre className="text-[10px] font-mono bg-muted/5 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrResult.error ? qrResult.error : JSON.stringify(qrResult.data, null, 2)}</pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            {/* GET LIST */}
                            <TabsContent value="list" className="space-y-3 mt-0">
                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                    GET https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                </div>
                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleListQR} disabled={qrListTesting || !obaPhoneId.trim() || !metaCloudAccessToken.trim()}>
                                    {qrListTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                    {qrListTesting ? 'Fetching...' : 'Get QR Codes'}
                                </Button>
                                {qrListResult && (
                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                        <button onClick={() => setQrListResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrListResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrListResult.success ? '✓ Success' : '✗ Failed'}</span>
                                            {qrListResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrListResult.status} {qrListResult.statusText}</span>}
                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrListResultOpen ? 'rotate-90' : ''}`} />
                                        </button>
                                        {qrListResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-64 text-muted-foreground whitespace-pre-wrap break-all">{qrListResult.error ? qrListResult.error : JSON.stringify(qrListResult.data, null, 2)}</pre>}
                                    </div>
                                )}
                            </TabsContent>

                            {/* UPDATE */}
                            <TabsContent value="update" className="space-y-3 mt-0">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">QR Code ID</Label>
                                    <Input placeholder="e.g. 4O4YGZEG3" value={qrUpdateCodeId ?? ''} onChange={(e) => setQrUpdateCodeId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                </div>
                                <div className="flex gap-3">
                                    <div className="space-y-1.5 flex-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">New Prefilled Message</Label>
                                        <Input placeholder="e.g. Black Friday" value={qrUpdateMessage ?? ''} onChange={(e) => setQrUpdateMessage(e.target.value)} className="bg-background/40 text-xs font-medium border rounded-md px-3 shadow-inner" />
                                    </div>
                                    <div className="space-y-1.5 w-28 shrink-0">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Format</Label>
                                        <Select value={qrUpdateFormat} onValueChange={setQrUpdateFormat}>
                                            <SelectTrigger className="h-9 bg-background/40 text-xs font-bold border rounded-md px-3 shadow-inner"><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="SVG" className="text-xs">SVG</SelectItem><SelectItem value="PNG" className="text-xs">PNG</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                    POST https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls
                                    <br /><span className="opacity-60">{'{ code: "'}<span className="text-primary/80">{qrUpdateCodeId || '<code_id>'}</span>{", prefilled_message: \"...\" }" }</span>
                                </div>
                                <Button className="px-6 rounded-md text-xs gap-2" onClick={handleUpdateQR} disabled={qrUpdateTesting || !qrUpdateCodeId.trim() || !metaCloudAccessToken.trim()}>
                                    {qrUpdateTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                    {qrUpdateTesting ? 'Updating...' : 'Update QR Code'}
                                </Button>
                                {qrUpdateResult && (
                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                        <button onClick={() => setQrUpdateResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrUpdateResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrUpdateResult.success ? '✓ Success' : '✗ Failed'}</span>
                                            {qrUpdateResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrUpdateResult.status} {qrUpdateResult.statusText}</span>}
                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrUpdateResultOpen ? 'rotate-90' : ''}`} />
                                        </button>
                                        {qrUpdateResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrUpdateResult.error ? qrUpdateResult.error : JSON.stringify(qrUpdateResult.data, null, 2)}</pre>}
                                    </div>
                                )}
                            </TabsContent>

                            {/* DELETE */}
                            <TabsContent value="delete" className="space-y-3 mt-0">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">QR Code ID</Label>
                                    <Input placeholder="e.g. 4O4YGZEG3" value={qrDeleteCodeId ?? ''} onChange={(e) => setQrDeleteCodeId(e.target.value)} className="bg-background/40 text-xs font-mono font-medium border rounded-md px-3 shadow-inner" />
                                </div>
                                <div className="px-3 py-2 bg-muted/10 border border-border/20 rounded-md text-[10px] font-mono text-muted-foreground/60 break-all">
                                    DELETE https://graph.facebook.com/<span className="text-primary/80">{metaCloudVersion}</span>/<span className="text-primary/80">{obaPhoneId || '<phone_id>'}</span>/message_qrdls/<span className="text-red-400">{qrDeleteCodeId || '<code_id>'}</span>
                                </div>
                                <Button variant="destructive" className="px-6 rounded-md text-xs gap-2" onClick={handleDeleteQR} disabled={qrDeleteTesting || !qrDeleteCodeId.trim() || !metaCloudAccessToken.trim()}>
                                    {qrDeleteTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    {qrDeleteTesting ? 'Deleting...' : 'Delete QR Code'}
                                </Button>
                                {qrDeleteResult && (
                                    <div className="border border-border/20 rounded-lg overflow-hidden animate-in fade-in">
                                        <button onClick={() => setQrDeleteResultOpen(v => !v)} className="w-full flex items-center gap-2 px-3 py-2 bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${qrDeleteResult.success ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{qrDeleteResult.success ? '✓ Success' : '✗ Failed'}</span>
                                            {qrDeleteResult.status && <span className="text-[10px] font-mono text-muted-foreground">{qrDeleteResult.status} {qrDeleteResult.statusText}</span>}
                                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform duration-200 ${qrDeleteResultOpen ? 'rotate-90' : ''}`} />
                                        </button>
                                        {qrDeleteResultOpen && <pre className="text-[10px] font-mono bg-muted/5 p-3 overflow-x-auto max-h-48 text-muted-foreground whitespace-pre-wrap break-all">{qrDeleteResult.error ? qrDeleteResult.error : JSON.stringify(qrDeleteResult.data, null, 2)}</pre>}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
    );
}
