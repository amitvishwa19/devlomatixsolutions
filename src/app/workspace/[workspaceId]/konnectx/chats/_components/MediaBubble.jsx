import React, { useState } from 'react';
import { 
    FileText, 
    Download, 
    Play, 
    Image as ImageIcon, 
    Video as VideoIcon, 
    File, 
    Music, 
    MapPin, 
    User, 
    FileDigit, 
    Layers, 
    AlertCircle, 
    ShoppingBag, 
    ShoppingCart, 
    Package, 
    Tag, 
    ExternalLink, 
    CheckCircle2, 
    Sparkles, 
    ListFilter, 
    MousePointerClick, 
    ChevronDown, 
    ChevronUp, 
    Copy, 
    Check, 
    Mail, 
    Phone, 
    Calendar, 
    Briefcase,
    Award,
    CheckSquare,
    Clock,
    DollarSign,
    Eye,
    Building
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";

const SCREEN_SECTION_MAP = {
    0: "Personal Details",
    1: "Professional Profile",
    2: "Sales Skills",
    3: "Sales Experience",
    4: "Sales Assessment",
    5: "Work Preference",
    6: "Compensation",
    7: "Background"
};

const SECTION_DEFS = [
    {
        id: 'personal',
        title: 'Personal Details',
        icon: User,
        match: (key, label) => /screen_0|full_name|name|email|mobile|phone|city|location|address/i.test(key + ' ' + label)
    },
    {
        id: 'professional',
        title: 'Professional Profile',
        icon: Briefcase,
        match: (key, label) => /screen_1|current_status|status|b2b|sales_experience|lead_gen|generation/i.test(key + ' ' + label)
    },
    {
        id: 'skills',
        title: 'Sales Skills',
        icon: Award,
        match: (key, label) => /screen_2|communication|interaction|follow_up|lead_followup|comfort/i.test(key + ' ' + label)
    },
    {
        id: 'closing',
        title: 'Sales Experience',
        icon: CheckCircle2,
        match: (key, label) => /screen_3|have_you_closed_sales|closed|converted|customers_you_converted|sales_type|experience_type/i.test(key + ' ' + label)
    },
    {
        id: 'assessment',
        title: 'Sales Assessment',
        icon: CheckSquare,
        match: (key, label) => /screen_4|what_would_you_do|not_replying|discount|find_leads|leads_1|assessment/i.test(key + ' ' + label)
    },
    {
        id: 'preference',
        title: 'Work Preference',
        icon: Clock,
        match: (key, label) => /screen_5|preferred_work|work_type|hours|hours_available|daily|join|when_can_you_start/i.test(key + ' ' + label)
    },
    {
        id: 'compensation',
        title: 'Compensation',
        icon: DollarSign,
        match: (key, label) => /screen_6|pay|pay_structure|salary|performance_pay|open_to_performance/i.test(key + ' ' + label)
    },
    {
        id: 'background',
        title: 'Background',
        icon: Building,
        match: (key, label) => /screen_7|company|previous_company|previous_role|sales_role|linkedin|resume/i.test(key + ' ' + label)
    }
];

const KNOWN_KEY_MAP = {
    // Screen 0 - Personal Details
    full_name: { label: "Full Name", section: "Personal Details" },
    name: { label: "Full Name", section: "Personal Details" },
    email_address: { label: "Email Address", section: "Personal Details" },
    email: { label: "Email Address", section: "Personal Details" },
    mobile_number: { label: "Mobile Number", section: "Personal Details" },
    mobile: { label: "Mobile Number", section: "Personal Details" },
    phone: { label: "Mobile Number", section: "Personal Details" },
    location: { label: "Location", section: "Personal Details" },
    city: { label: "Location", section: "Personal Details" },
    citylocation: { label: "Location", section: "Personal Details" },

    // Screen 1 - Professional Profile
    current_status: { label: "Current Status?", section: "Professional Profile" },
    sales_experience: { label: "Sales Experience?", section: "Professional Profile" },
    b2b_sales_experience: { label: "B2B Sales Experience?", section: "Professional Profile" },
    have_you_worked_in_b2b_sales: { label: "B2B Sales Experience?", section: "Professional Profile" },
    lead_generation_experience: { label: "Lead Generation Experience?", section: "Professional Profile" },
    generated_leads_before: { label: "Lead Generation Experience?", section: "Professional Profile" },

    // Screen 2 - Sales Skills
    communication_skills: { label: "Communication Skills?", section: "Sales Skills" },
    client_interaction: { label: "Client Interaction?", section: "Sales Skills" },
    lead_followup_comfort: { label: "Lead Follow-Up Comfort?", section: "Sales Skills" },
    lead_follow_up_comfort: { label: "Lead Follow-Up Comfort?", section: "Sales Skills" },
    following_up_with_leads: { label: "Lead Follow-Up Comfort?", section: "Sales Skills" },

    // Screen 3 - Sales Experience
    have_you_closed_sales: { label: "Have You Closed Sales?", section: "Sales Experience" },
    converted__lead_into_client: { label: "Have You Closed Sales?", section: "Sales Experience" },
    converted_lead_into_client: { label: "Have You Closed Sales?", section: "Sales Experience" },
    customers_you_converted: { label: "Customers You Converted?", section: "Sales Experience" },
    converted_leadsclients: { label: "Customers You Converted?", section: "Sales Experience" },
    converted_leads: { label: "Customers You Converted?", section: "Sales Experience" },
    sales_experience_type: { label: "Sales Experience Type?", section: "Sales Experience" },

    // Screen 4 - Sales Assessment
    what_would_you_do: { label: "What would you do?", section: "Sales Assessment" },
    customer_is_not_replying: { label: "Customer Is Not Replying?", section: "Sales Assessment" },
    customer_wants_a_discount: { label: "Customer Wants A Discount?", section: "Sales Assessment" },
    how_do_you_find_leads: { label: "How Do You Find Leads?", section: "Sales Assessment" },

    // Screen 5 - Work Preference
    preferred_work_type: { label: "Preferred Work Type?", section: "Work Preference" },
    preferred_work_area: { label: "Preferred Work Type?", section: "Work Preference" },
    hours_available_daily: { label: "Hours Available Daily?", section: "Work Preference" },
    hours_available: { label: "Hours Available Daily?", section: "Work Preference" },
    availability_to_join: { label: "Availability To Join?", section: "Work Preference" },
    when_can_you_start: { label: "Availability To Join?", section: "Work Preference" },
    preferred_customer_interaction: { label: "Preferred Customer Interaction?", section: "Work Preference" },

    // Screen 6 - Compensation
    preferred_pay_structure: { label: "Preferred Pay Structure?", section: "Compensation" },
    open_to_performance_pay: { label: "Open To Performance Pay?", section: "Compensation" },

    // Screen 7 - Background
    previous_company_nam: { label: "Previous Company Nam", section: "Background" },
    previous_company_name: { label: "Previous Company Name", section: "Background" },
    previous_sales_role: { label: "Previous Sales Role?", section: "Background" },
    linkedin_profile: { label: "LinkedIn Profile?", section: "Background" }
};

function getFieldSortOrder(key) {
    const screenMatch = String(key).match(/screen_(\d+)/i);
    const fieldMatch = String(key).match(/_(\d+)$/i);
    const screenIdx = screenMatch ? parseInt(screenMatch[1], 10) : 999;
    const fieldIdx = fieldMatch ? parseInt(fieldMatch[1], 10) : 999;
    return screenIdx * 1000 + fieldIdx;
}

function getFieldMeta(rawKey) {
    if (!rawKey) return { label: '', section: 'General Details' };
    
    // Core key normalized
    const core = String(rawKey).replace(/^screen_\d+_/i, '').replace(/_\d+$/i, '');
    const normalized = core.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    const screenMatch = String(rawKey).match(/screen_(\d+)/i);
    let screenSection = null;
    if (screenMatch) {
        const sIdx = parseInt(screenMatch[1], 10);
        if (SCREEN_SECTION_MAP[sIdx]) {
            screenSection = SCREEN_SECTION_MAP[sIdx];
        }
    }

    if (KNOWN_KEY_MAP[normalized]) {
        return {
            label: KNOWN_KEY_MAP[normalized].label,
            section: screenSection || KNOWN_KEY_MAP[normalized].section
        };
    }

    // Dynamic Label Cleanup
    let cleaned = core.replace(/TextInput/gi, 'Additional Details');
    cleaned = cleaned.replace(/CityLocation/gi, 'Location');
    cleaned = cleaned.replace(/LeadsClients/gi, 'Leads / Clients');
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
    cleaned = cleaned.replace(/_+/g, ' ').trim();

    const words = cleaned.split(' ').map(w => {
        if (/^(b2b|crm|it|ai|api|faq|hr)$/i.test(w)) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    const label = (/^(have|how|what|when|where|which|who|why|is|do|did|are|can|open|current)\b/i.test(words) && !words.endsWith('?'))
        ? words + '?'
        : words;

    let section = screenSection || 'General Details';

    return { label, section };
}

function cleanFlowValue(val) {
    if (val === null || val === undefined || val === '') return 'Na';
    if (Array.isArray(val)) {
        const mapped = val.map(cleanFlowValue).filter(v => v !== 'Na');
        return mapped.length > 0 ? mapped : ['Na'];
    }
    if (typeof val === 'object') {
        return JSON.stringify(val);
    }
    let str = String(val).trim();
    if (!str || str.toLowerCase() === 'na' || str.toLowerCase() === 'n/a' || str.toLowerCase() === 'none') {
        return 'Na';
    }
    // Strip leading choice numbers like 0_, 1_, 2_
    str = str.replace(/^\d+_/g, '');
    // Replace underscores with space
    str = str.replace(/_+/g, ' ').trim();
    // Format 10-digit Indian phone nicely as "97123 40450"
    if (/^\d{10}$/.test(str)) {
        return `${str.slice(0, 5)} ${str.slice(5)}`;
    }
    // Format 12-digit Indian phone as "+91 97123 40450"
    if (/^91\d{10}$/.test(str)) {
        return `+91 ${str.slice(2, 7)} ${str.slice(7)}`;
    }
    return str;
}

function groupFieldsBySection(flowData) {
    let parsedData = flowData;
    if (typeof parsedData === 'string') {
        try { parsedData = JSON.parse(parsedData); } catch (_) {}
    }
    if (!parsedData || typeof parsedData !== 'object') return [];

    const rawEntries = Object.entries(parsedData)
        .filter(([k]) => k !== 'flow_token' && k !== 'error')
        .sort((a, b) => getFieldSortOrder(a[0]) - getFieldSortOrder(b[0]));

    const sectionsMap = new Map();

    rawEntries.forEach(([rawKey, val]) => {
        const info = getFieldMeta(rawKey);
        const sectionTitle = info.section || "General Details";

        if (!sectionsMap.has(sectionTitle)) {
            sectionsMap.set(sectionTitle, {
                title: sectionTitle,
                fields: []
            });
        }
        sectionsMap.get(sectionTitle).fields.push({
            rawKey,
            label: info.label,
            val,
            cleanVal: cleanFlowValue(val)
        });
    });

    return Array.from(sectionsMap.values());
}


const SECTION_ICONS = {
    "Personal Details": User,
    "Professional Profile": Briefcase,
    "Sales Skills": Award,
    "Sales Experience": CheckCircle2,
    "Sales Assessment": CheckSquare,
    "Work Preference": Clock,
    "Compensation": DollarSign,
    "Background": Building,
    "General Details": Layers
};

const FlowSubmissionCard = ({ flowName, flowData, metadata, originalPayload, msgText }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showInline, setShowInline] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const sections = groupFieldsBySection(flowData);
    const totalAnswers = sections.reduce((acc, s) => acc + s.fields.length, 0);

    // Extract top 3 fields for chat bubble snippet preview
    const allFields = sections.flatMap(s => s.fields);
    const topPreviewFields = allFields.slice(0, 3);

    const handleCopyAll = (e) => {
        if (e) e.stopPropagation();
        let text = "Your response\n\n";
        sections.forEach(sec => {
            text += `${sec.title}\n\n`;
            sec.fields.forEach(f => {
                const valStr = Array.isArray(f.cleanVal) ? f.cleanVal.join(', ') : f.cleanVal;
                text += `${f.label}\n${valStr}\n\n`;
            });
        });
        navigator.clipboard.writeText(text.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cleanTitle = (flowName || "Your response")
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const renderSectionCards = () => {
        if (!sections || sections.length === 0) {
            return (
                <div className="p-4 text-center text-sm text-muted-foreground italic bg-muted/20 rounded-xl">
                    {msgText || "Flow response received successfully."}
                </div>
            );
        }

        return sections.map((section, sIdx) => {
            const IconComponent = SECTION_ICONS[section.title] || Layers;
            return (
                <div key={sIdx} className="space-y-3">
                    {/* Section Title Banner */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <IconComponent className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {section.title}
                        </span>
                    </div>

                    {/* Field Q&A List in Crisp Cards */}
                    <div className="space-y-2.5 pl-1">
                        {section.fields.map((field, fIdx) => {
                            const isEmail = field.label.toLowerCase().includes('email') || (typeof field.val === 'string' && field.val.includes('@'));
                            const isPhone = field.label.toLowerCase().includes('mobile') || field.label.toLowerCase().includes('phone');
                            const isArray = Array.isArray(field.cleanVal);
                            const isNa = String(field.cleanVal).toLowerCase() === 'na';
                            const isYes = String(field.cleanVal).toLowerCase() === 'yes';
                            const isNo = String(field.cleanVal).toLowerCase() === 'no';

                            return (
                                <div key={fIdx} className="bg-card dark:bg-zinc-900 rounded-xl p-3 border border-border/80 shadow-2xs space-y-1 transition-all hover:border-emerald-500/40">
                                    {/* Question Label */}
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wide">
                                        {field.label}
                                    </p>
                                    
                                    {/* Answer Value */}
                                    <div className="pt-0.5">
                                        {isArray ? (
                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                {field.cleanVal.map((item, iIdx) => (
                                                    <Badge key={iIdx} variant="secondary" className="text-xs font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                                        {item}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : isEmail ? (
                                            <a href={`mailto:${field.val}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline break-all">
                                                <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                                <span>{field.cleanVal}</span>
                                            </a>
                                        ) : isPhone ? (
                                            <a href={`tel:${field.val}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                                                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span>{field.cleanVal}</span>
                                            </a>
                                        ) : isYes ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                Yes
                                            </span>
                                        ) : isNo ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                                                No
                                            </span>
                                        ) : isNa ? (
                                            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 italic">
                                                Na
                                            </span>
                                        ) : (
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 break-words leading-snug">
                                                {field.cleanVal}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    return (
        <>
            {/* WhatsApp Native Chat Bubble Card */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border/80 shadow-md w-full max-w-[340px] sm:max-w-[360px] text-foreground">
                {/* Header Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-transparent border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-black tracking-wider block leading-none mb-1">Your response</span>
                            <h4 className="text-xs font-bold text-foreground truncate">{cleanTitle === "Flow" ? "Application Form" : cleanTitle}</h4>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 font-semibold shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> {totalAnswers} Answers
                    </Badge>
                </div>

                {/* Summary Preview Box */}
                <div className="p-3.5 space-y-3">
                    {topPreviewFields.length > 0 && (
                        <div className="bg-muted/30 dark:bg-zinc-900/40 rounded-xl p-2.5 border border-border/40 space-y-1.5 text-xs">
                            {topPreviewFields.map((f, i) => (
                                <div key={i} className="flex items-baseline justify-between gap-2">
                                    <span className="text-muted-foreground font-medium truncate text-[11px]">{f.label}:</span>
                                    <span className="font-bold text-foreground truncate text-[11px]">{f.cleanVal}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prominent WhatsApp "View response" Button */}
                    <Button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View response</span>
                    </Button>

                    {/* Secondary Toggles: Inline Preview & Copy */}
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => setShowInline(!showInline)}
                            className="hover:text-foreground font-medium flex items-center gap-1 transition-colors"
                        >
                            {showInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {showInline ? "Hide inline" : "Show inline"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCopyAll}
                            className="hover:text-emerald-600 font-medium flex items-center gap-1 transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* Inline Expanded Questionnaire */}
                {showInline && (
                    <div className="p-3.5 border-t border-border/50 bg-zinc-50/50 dark:bg-zinc-950/50 space-y-4 max-h-80 overflow-y-auto">
                        {renderSectionCards()}
                    </div>
                )}
            </div>

            {/* Full "View response" Dialog Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[620px] max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-2xl bg-card border border-border shadow-2xl">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 pr-8">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 text-white shadow-inner backdrop-blur-xs">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[11px] text-emerald-100 uppercase font-black tracking-widest block leading-none mb-1">Your response</span>
                                <h3 className="text-base sm:text-lg font-bold text-white truncate">{cleanTitle === "Flow" ? "Application Form" : cleanTitle}</h3>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-white/20 text-white border-0 font-bold shrink-0 hidden sm:inline-flex">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" /> {totalAnswers} Answers
                        </Badge>
                    </div>

                    {/* Modal Body: All 8 Sections */}
                    <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-4 sm:p-6 space-y-6 bg-zinc-50/50 dark:bg-zinc-950/50">
                        {renderSectionCards()}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-3.5 sm:p-4 bg-muted/40 border-t border-border/60 flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyAll}
                            className="h-8 px-3 text-xs gap-1.5 font-bold text-foreground hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            {copied ? "Copied Formatted Text!" : "Copy Response"}
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRaw(!showRaw)}
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
                            >
                                {showRaw ? "Hide JSON" : "Raw JSON"}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                                className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                Close
                            </Button>
                        </div>
                    </div>

                    {showRaw && (
                        <div className="p-3 bg-muted/60 border-t border-border/60">
                            <pre className="text-[10px] font-mono bg-background p-3 rounded-xl overflow-x-auto max-h-40 border border-border/60 text-foreground">
                                {JSON.stringify(flowData || metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

const MediaBubble = ({ msg, workspaceId }) => {
    const [showRawPayload, setShowRawPayload] = useState(false);
    let metadata = msg.metadata || {};
    if (typeof metadata === 'string') {
        try { metadata = JSON.parse(metadata); } catch (_) { metadata = {}; }
    }
    const originalPayload = metadata.originalPayload || metadata.raw || {};
    
    const hasFlow = Boolean(
        metadata.flow_data || 
        originalPayload.flow_data || 
        metadata.raw?.flow_data || 
        metadata.flow_name || 
        originalPayload.flow_name || 
        metadata.interactiveType === 'nfm_reply' || 
        metadata.interactive?.type === 'nfm_reply' || 
        originalPayload.interactive?.type === 'nfm_reply' || 
        (typeof msg.text === 'string' && (msg.text.startsWith('[Flow:') || msg.text.startsWith('Flow Response:')))
    );
    
    const type = (
        hasFlow ? 'interactive' : 
        (metadata.type || (msg.text?.startsWith('[Product:') ? 'interactive' : 'text'))
    ).toLowerCase();
    
    // Extract ID and URL
    const mediaId = originalPayload[type]?.id || metadata.mediaId;
    
    // Media URL with proxy fallback
    const mediaUrl = (mediaId && workspaceId) 
        ? `/api/wa/media?mediaId=${mediaId}&workspaceId=${workspaceId}`
        : (metadata.mediaUrl || metadata.productImageUrl || originalPayload[type]?.url || originalPayload[type]?.link || originalPayload.link);

    const caption = metadata.caption || originalPayload[type]?.caption || "";

    const renderInteractiveContent = () => {
        const interactive = originalPayload.interactive || metadata.interactive || {};
        const iType = metadata.interactiveType || interactive.type || (metadata.catalogId || metadata.retailerId || msg.text?.includes('[Product:') ? 'product' : (msg.text?.includes('[Catalog]') ? 'catalog_message' : null));
        const order = originalPayload.order || metadata.order || {};
        
        let flowData = metadata.flow_data || originalPayload.flow_data || metadata.raw?.flow_data;
        if (!flowData && (interactive.nfm_reply?.response_json || originalPayload.interactive?.nfm_reply?.response_json || metadata.raw?.interactive?.nfm_reply?.response_json)) {
            try {
                const resp = interactive.nfm_reply?.response_json || originalPayload.interactive?.nfm_reply?.response_json || metadata.raw?.interactive?.nfm_reply?.response_json;
                flowData = typeof resp === 'string' ? JSON.parse(resp) : resp;
            } catch (_) {}
        }

        const flowName = metadata.flow_name || 
            originalPayload.flow_name || 
            metadata.raw?.flow_name || 
            interactive.nfm_reply?.name || 
            originalPayload.interactive?.nfm_reply?.name ||
            (typeof msg.text === 'string' && msg.text.startsWith('[Flow:') ? msg.text.split('[Flow:')[1]?.split(']')[0]?.trim() : null);

        // 1. WhatsApp Catalog Single Product Card
        if (iType === 'product' || metadata.retailerId || interactive.action?.product_retailer_id || msg.text?.includes('[Product:')) {
            const rawText = msg.text || '';
            const titleFromText = rawText.includes('[Product:') ? rawText.split('[Product:')[1]?.split(']')[0]?.trim() : null;
            const priceFromText = rawText.includes('Price:') ? rawText.split('Price:')[1]?.split('\n')[0]?.trim() : null;

            const productTitle = metadata.productTitle || titleFromText || metadata.retailerId || 'Catalog Product';
            const productPrice = metadata.productPrice || priceFromText || (rawText.includes('INR') ? rawText.split('INR')[1]?.split('\n')[0]?.trim() : null);
            const productCurrency = metadata.productCurrency || 'INR';
            const productSku = metadata.retailerId || interactive.action?.product_retailer_id || '';
            const catalogId = metadata.catalogId || interactive.action?.catalog_id;
            let productImg = metadata.productImageUrl ||
                metadata.imageUrl ||
                metadata.mediaUrl ||
                (Array.isArray(metadata.imageUrls) ? metadata.imageUrls[0] : null) ||
                originalPayload.image?.url ||
                originalPayload.image?.link ||
                originalPayload.raw?.image?.url ||
                originalPayload.raw?.image?.link ||
                originalPayload.raw?.productImageUrl ||
                mediaUrl;

            // Also search for image URL in text (e.g. Supabase storage or web image)
            if (!productImg && typeof rawText === 'string') {
                const urlMatch = rawText.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif|svg)/i) ||
                    rawText.match(/https?:\/\/[^\s"'<>]*(?:supabase\.co|catalog_images|storage)[^\s"'<>]*/i);
                if (urlMatch) {
                    productImg = urlMatch[0];
                }
            }

            const body = metadata.bodyText || interactive.body?.text || (rawText && !rawText.startsWith('[Product:') ? rawText : '');
            const footer = metadata.footerText || interactive.footer?.text;
            const productUrl = metadata.productUrl;

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm w-full max-w-[300px]">
                    {/* Header Banner */}
                    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-3 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Catalog Product</span>
                        </div>
                        {catalogId && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                ID: {catalogId}
                            </Badge>
                        )}
                    </div>

                    {/* Product Image */}
                    {productImg ? (
                        <div className="relative h-44 w-full bg-muted/40 overflow-hidden group">
                            <img
                                src={productImg}
                                alt={productTitle}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    ) : (
                        <div className="relative h-28 w-full bg-gradient-to-br from-emerald-500/10 via-primary/5 to-muted/40 flex flex-col items-center justify-center gap-1.5 border-b border-border/30">
                            <div className="w-10 h-10 rounded-full bg-card shadow-xs flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-semibold">Devlomatix Catalog</span>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="p-3.5 space-y-2.5">
                        <div>
                            <h4 className="font-bold text-sm text-foreground leading-tight">{productTitle}</h4>
                            {productPrice && (
                                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-0.5">
                                    {productCurrency} {productPrice}
                                </div>
                            )}
                        </div>

                        {productSku && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md w-fit border border-border/40">
                                <Tag className="w-3 h-3 text-primary" />
                                <span>SKU: {productSku}</span>
                            </div>
                        )}

                        {body && body !== productTitle && (
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                        )}

                        {footer && (
                            <p className="text-[10px] text-muted-foreground/60 italic border-t border-border/30 pt-1.5">{footer}</p>
                        )}

                        {/* Interactive View Button */}
                        <div className="pt-1 border-t border-border/40 flex flex-col gap-1.5">
                            <div className="w-full py-1.5 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs text-center flex items-center justify-center gap-1.5 border border-emerald-500/20">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>View Item on WhatsApp</span>
                            </div>
                            {productUrl && (
                                <a
                                    href={productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary hover:underline text-center flex items-center justify-center gap-1 font-semibold"
                                >
                                    <ExternalLink className="w-3 h-3" /> View Store Link
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // 2. WhatsApp Catalog Storefront Collection Message
        if (iType === 'catalog_message' || interactive.action?.name === 'catalog_message' || msg.text?.includes('[Catalog]')) {
            const body = metadata.bodyText || interactive.body?.text || (msg.text ? msg.text.replace(/^\[Catalog\]\s*/, '') : 'Explore our complete product catalog on WhatsApp!');
            const footer = metadata.footerText || interactive.footer?.text;
            const catalogId = metadata.catalogId || interactive.action?.catalog_id;
            const catalogImg = metadata.productImageUrl || metadata.imageUrl || metadata.mediaUrl;

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-emerald-500/30 shadow-sm w-full max-w-[300px]">
                    <div className="bg-emerald-500/10 p-3.5 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-foreground">WhatsApp Catalog</h4>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Interactive Storefront</p>
                            </div>
                        </div>
                        {catalogId && (
                            <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                                {catalogId}
                            </Badge>
                        )}
                    </div>
                    {catalogImg && (
                        <div className="relative h-32 w-full bg-muted/40 overflow-hidden">
                            <img
                                src={catalogImg}
                                alt="Catalog"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}
                    <div className="p-3.5 space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{body}</p>
                        {footer && <p className="text-[10px] text-muted-foreground/60 italic">{footer}</p>}
                        <div className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Browse Full Catalog</span>
                        </div>
                    </div>
                </div>
            );
        }

        // 3. WhatsApp Order / Cart Details
        if (type === 'order' || iType === 'order_details' || (order.product_items && order.product_items.length > 0)) {
            const items = order.product_items || [];
            const total = items.reduce((acc, it) => acc + (Number(it.item_price || 0) * Number(it.quantity || 1)), 0);
            const currency = items[0]?.currency || 'INR';

            return (
                <div className="rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm w-full max-w-[320px]">
                    <div className="bg-primary/10 px-3.5 py-2.5 border-b border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                            <ShoppingCart className="w-4 h-4" />
                            <span>WhatsApp Order Details</span>
                        </div>
                        {order.catalog_id && (
                            <span className="text-[9px] font-mono text-muted-foreground">Catalog: {order.catalog_id}</span>
                        )}
                    </div>
                    <div className="p-3.5 space-y-3">
                        <div className="space-y-2">
                            {items.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/20 rounded-lg border border-border/30">
                                    <div className="min-w-0 pr-2">
                                        <p className="font-semibold text-foreground truncate">{it.product_retailer_id || `Item ${idx + 1}`}</p>
                                        <p className="text-[10px] text-muted-foreground">Qty: {it.quantity || 1} × {it.currency || currency} {it.item_price || 0}</p>
                                    </div>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                        {it.currency || currency} {(Number(it.item_price || 0) * Number(it.quantity || 1)).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {total > 0 && (
                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-bold">
                                <span>Order Total:</span>
                                <span className="text-sm text-emerald-600 dark:text-emerald-400">{currency} {total.toLocaleString()}</span>
                            </div>
                        )}

                        {order.text && (
                            <div className="p-2 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                                <span className="font-semibold text-[10px] uppercase text-foreground block mb-0.5">Customer Note:</span>
                                {order.text}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 4. Meta Flow Form Submission
        if (iType === 'nfm_reply' || flowData || flowName || (typeof msg.text === 'string' && (msg.text.startsWith('[Flow:') || msg.text.startsWith('Flow Response:')))) {
            return (
                <FlowSubmissionCard
                    flowName={flowName}
                    flowData={flowData}
                    metadata={metadata}
                    originalPayload={originalPayload}
                    msgText={msg.text}
                />
            );
        }

        // 5. Button Reply
        if (iType === 'button_reply') {
            const btn = interactive.button_reply || {};
            return (
                <div className="p-3 bg-card border border-border/60 rounded-xl flex items-center gap-2.5 w-full max-w-[280px]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <MousePointerClick className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Button Selected</span>
                        <span className="text-xs font-bold text-foreground truncate block">{btn.title || msg.text}</span>
                        {btn.id && <span className="text-[9px] font-mono text-muted-foreground/70">ID: {btn.id}</span>}
                    </div>
                </div>
            );
        }

        // 6. List Reply
        if (iType === 'list_reply') {
            const item = interactive.list_reply || {};
            return (
                <div className="p-3 bg-card border border-border/60 rounded-xl flex items-center gap-2.5 w-full max-w-[280px]">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <ListFilter className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Menu Item Selected</span>
                        <span className="text-xs font-bold text-foreground truncate block">{item.title || msg.text}</span>
                        {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                        {item.id && <span className="text-[9px] font-mono text-muted-foreground/70">ID: {item.id}</span>}
                    </div>
                </div>
            );
        }

        // 7. General Interactive Message Fallback with Accordion
        return (
            <div className="p-3 bg-card border border-border/60 rounded-2xl flex flex-col gap-2 w-full max-w-[280px]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Interactive Response</span>
                        <p className="text-xs font-semibold text-foreground truncate">{msg.text || "Interactive Message"}</p>
                    </div>
                </div>

                {/* Raw details toggle */}
                <button
                    type="button"
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    className="text-[10px] text-primary flex items-center gap-1 font-semibold hover:underline pt-1 border-t border-border/30"
                >
                    {showRawPayload ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showRawPayload ? "Hide Details" : "View Raw Payload"}
                </button>

                {showRawPayload && (
                    <pre className="text-[9px] font-mono bg-muted/40 p-2 rounded-lg overflow-x-auto max-h-36 border border-border/40 text-muted-foreground">
                        {JSON.stringify(originalPayload || metadata, null, 2)}
                    </pre>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (type) {
            case 'image':
                return (
                    <div className="relative group overflow-hidden rounded-lg bg-muted/20 border border-border/30">
                        <img 
                            src={mediaUrl} 
                            alt={caption || "WhatsApp Image"} 
                            className="w-full max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x400?text=Expired+Media";
                            }}
                        />
                        {caption && (
                            <div className="p-2 border-t border-border/30 bg-card/80 backdrop-blur-sm">
                                <p className="text-xs leading-relaxed">{caption}</p>
                            </div>
                        )}
                    </div>
                );
            case 'sticker':
                return (
                    <div className="relative group overflow-hidden rounded-lg bg-transparent">
                        <img 
                            src={mediaUrl} 
                            alt="Sticker" 
                            className="w-[120px] h-[120px] object-contain transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/200x200?text=Expired+Sticker";
                            }}
                        />
                    </div>
                );
            case 'video':
                return (
                    <div className="rounded-lg overflow-hidden bg-zinc-900 border border-border/30 shadow-sm relative group/video">
                        <video 
                            controls 
                            playsInline
                            preload="metadata"
                            crossOrigin="anonymous"
                            className="w-full max-h-[400px] bg-black"
                        >
                            <source src={mediaUrl} />
                            Your browser does not support the video tag.
                        </video>
                        {caption && (
                            <div className="p-2.5 bg-card/90 backdrop-blur-md border-t border-border/20">
                                <p className="text-[11px] leading-relaxed text-foreground/90">{caption}</p>
                                <a 
                                    href={mediaUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    download 
                                    className="text-[9px] text-primary hover:underline mt-1 flex items-center gap-1 font-bold"
                                >
                                    <Download size={10} /> Download / View Original
                                </a>
                            </div>
                        )}
                    </div>
                );

            case 'audio':
            case 'voice':
                return (
                    <div className="p-3 bg-muted/30 rounded-2xl flex items-center gap-3 w-full max-w-[280px]">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-primary" />
                        </div>
                        <audio controls className="h-8 flex-1">
                            <source src={mediaUrl} type="audio/mpeg" />
                        </audio>
                        {type === 'voice' && <span className="text-[10px] text-muted-foreground mr-2 font-bold uppercase">Voice</span>}
                    </div>
                );

            case 'document':
                const fileName = metadata.fileName || originalPayload.document?.filename || "Document";
                return (
                    <a 
                        href={mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl hover:bg-muted/30 transition-colors w-full max-w-[300px]"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{fileName}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{metadata.mimetype?.split('/')[1] || 'FILE'}</p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                    </a>
                );

            case 'location':
                const loc = originalPayload.location || metadata.location || {};
                const lat = loc.latitude;
                const lon = loc.longitude;
                const name = loc.name || "Shared Location";
                const address = loc.address || "";
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                
                return (
                    <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block p-0 overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all w-full max-w-[280px]"
                    >
                        <div className="bg-primary/10 h-24 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-bold truncate">{name}</p>
                            {address && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{address}</p>}
                            <p className="text-[9px] text-primary font-bold mt-2 uppercase tracking-wider flex items-center gap-1">
                                View on Maps <Download size={8} />
                            </p>
                        </div>
                    </a>
                );

            case 'contacts':
                const contactData = originalPayload.contacts?.[0] || {};
                const cName = contactData.name?.formatted_name || contactData.name?.first_name || "Contact";
                const cPhone = contactData.phones?.[0]?.phone || "No number";
                
                return (
                    <div className="p-3 bg-card border border-border/50 rounded-xl flex items-center gap-3 w-full max-w-[280px]">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{cName}</p>
                            <p className="text-[10px] text-muted-foreground">{cPhone}</p>
                        </div>
                    </div>
                );

            case 'poll':
            case 'poll_creation':
                const pollData = originalPayload.poll || {};
                const pollName = pollData.name || "WhatsApp Poll";
                return (
                    <div className="p-3 bg-card border border-border/50 rounded-xl flex flex-col gap-2 w-full max-w-[280px]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <FileDigit className="w-4 h-4 text-orange-500" />
                            </div>
                            <p className="text-xs font-bold">{pollName}</p>
                        </div>
                        {pollData.options?.map((opt, i) => (
                            <div key={i} className="px-3 py-1.5 bg-muted/50 rounded-lg text-[10px] border border-border/30">
                                {opt.option_text}
                            </div>
                        ))}
                        <p className="text-[9px] text-muted-foreground mt-1 italic">Poll created via WhatsApp</p>
                    </div>
                );

            case 'interactive':
            case 'order':
                return renderInteractiveContent();

            case 'unsupported':
                return (
                    <div className="flex flex-col gap-2 p-3 bg-muted/20 border border-dashed border-muted-foreground/30 rounded-xl w-full max-w-[280px]">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">System Message</p>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                            This message type is currently not supported by your WhatsApp API version or device.
                        </p>
                        <div className="text-[9px] px-2 py-0.5 bg-muted/50 rounded-full w-fit">
                            Type: {metadata.type || 'unknown'}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex items-center gap-2 p-3 bg-muted/10 border border-border/50 rounded-xl text-xs text-muted-foreground italic">
                        <File className="w-4 h-4" />
                        {msg.text || `Message Type: ${type}`}
                    </div>
                );
        }
    };

    return <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">{renderContent()}</div>;
};

export default MediaBubble;
