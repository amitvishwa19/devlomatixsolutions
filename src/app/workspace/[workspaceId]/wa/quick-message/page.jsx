'use client';

import { useState, useEffect, use } from'react';
import { useSession } from'next-auth/react';
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Plus, Trash2, Smartphone, Send, ExternalLink, MessageCircleDashed } from'lucide-react';
import Link from'next/link';
import { Button } from'@/components/ui/button';

export default function QuickMessage({ params: paramsPromise }) {
 const params = use(paramsPromise);
 const workspaceId = params.workspaceId;

 const { data: session } = useSession();
 const userId = session?.user?.userId || session?.user?.id;

 // Connection State
 const [status, setStatus] = useState('loading');
 const [messages, setMessages] = useState([]);

 // Messaging State
 const [toNumber, setToNumber] = useState('+919712340450');
 const [msgType, setMsgType] = useState('text'); //'text'|'interactive'
 const [messageText, setMessageText] = useState('');

 // Interactive Message State
 const [intBody, setIntBody] = useState('👋 Hello! Please choose an option.');
 const [intFooter, setIntFooter] = useState('');
 const [intButton, setIntButton] = useState('View Options');
 const [intSections, setIntSections] = useState([
 {
 title:"Options",
 rows: [
 { id:"opt1", title:"Option 1", description:"First choice"},
 { id:"opt2", title:"Option 2", description:"Second choice"}]

 }]
 );

 const [sendLoading, setSendLoading] = useState(false);
 const [feedback, setFeedback] = useState(null);

 useEffect(() => {
 const fetchStatusAndHistory = async () => {
 try {
 // Fetch Connection Status
 const authRes = await fetch('/api/wa/auth');
 if (authRes.ok) {
 const authData = await authRes.json();
 setStatus(authData.status ||'welcome');
 } else {
 setStatus('welcome');
 }

 // Fetch Persistent History
 if (userId) {
 const historyRes = await fetch(`/api/wa/messages?userId=${userId}&limit=20`);
 if (historyRes.ok) {
 const historyData = await historyRes.json();
 setMessages(historyData);
 }
 }
 } catch (err) {
 console.error('Fetch error:', err);
 setStatus('welcome');
 }
 };

 fetchStatusAndHistory();
 const interval = setInterval(fetchStatusAndHistory, 5000); // Poll for new messages
 return () => clearInterval(interval);
 }, [userId]);

 // Send Message Handler
 const handleSendMessage = async (e) => {
 e.preventDefault();
 setSendLoading(true);
 setFeedback(null);

 try {
 let payload = { to: toNumber };

 if (msgType ==='text') {
 payload.text = messageText;
 } else if (msgType ==='interactive') {
 payload.text = intBody; // Required fallback text
 payload.interactive = {
 type:"list",
 body: { text: intBody },
 footer: intFooter ? { text: intFooter } : undefined,
 action: {
 button: intButton ||"Options",
 sections: intSections.map((sec) => ({
 title: sec.title,
 rows: sec.rows.map((r) => ({
 id: r.id || Math.random().toString(36).substr(2, 9),
 title: r.title,
 description: r.description || undefined
 }))
 }))
 }
 };
 }

 const res = await fetch('/api/wa/send', {
 method:'POST',
 headers: {'Content-Type':'application/json'},
 body: JSON.stringify(payload)
 });
 const data = await res.json();

 if (res.ok && data.success) {
 setFeedback({ type:'success', msg:'Message sent successfully!'});
 if (msgType ==='text') setMessageText('');
 } else {
 throw new Error(data.error ||'Failed to send');
 }
 } catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 setFeedback({ type:'error', msg: message });
 } finally {
 setSendLoading(false);
 setTimeout(() => setFeedback(null), 5000); // clear feedback automatically
 }
 };

 // Interactive Form Helpers
 const addSection = () => {
 setIntSections([...intSections, { title:"New Section", rows: [{ id: Math.random().toString(36).substr(2, 9), title:"New Option", description:""}] }]);
 };
 const removeSection = (sIdx) => {
 setIntSections(intSections.filter((_, i) => i !== sIdx));
 };
 const updateSectionTitle = (sIdx, val) => {
 const newSec = [...intSections];
 newSec[sIdx].title = val;
 setIntSections(newSec);
 };
 const addRow = (sIdx) => {
 const newSec = [...intSections];
 newSec[sIdx].rows.push({ id: Math.random().toString(36).substr(2, 9), title:"New Option", description:""});
 setIntSections(newSec);
 };
 const removeRow = (sIdx, rIdx) => {
 const newSec = [...intSections];
 newSec[sIdx].rows = newSec[sIdx].rows.filter((_, i) => i !== rIdx);
 setIntSections(newSec);
 };
 const updateRow = (sIdx, rIdx, field, val) => {
 const newSec = [...intSections];
 newSec[sIdx].rows[rIdx][field] = val;
 setIntSections(newSec);
 };

 return (
 <div className='flex flex-col xl:flex-row h-full gap-6'>
 {/* Left: Configuration Panel */}
 <div className="flex-1 space-y-6 animate-in fade-in duration-500 max-w-3xl overflow-y-auto">
 <div className="flex border border-border items-center justify-between bg-card p-6 rounded-md shadow-sm">
 <div>
 <h2 className="text-2xl font-bold text-foreground">Quick Message</h2>
 <p className="text-sm text-muted-foreground mt-1">Send standard or interactive messages instantly.</p>
 </div>
 </div>

 <div className="w-full bg-card rounded-md shadow-sm border border-border overflow-hidden">
 <div className="p-6 md:p-8">
 {status ==='loading'|| status ==='connecting'?
 <div className="text-center py-16 animate-in fade-in duration-300">
 <div className="w-12 h-12 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary border-t-transparent animate-spin"></div>
 <h3 className="text-xl font-bold text-foreground mb-2">Connecting to WhatsApp...</h3>
 <p className="text-muted-foreground max-w-sm mx-auto">
 Establishing a secure connection to your device. Please wait a moment.
 </p>
 </div> :
 status !=='open'?
 <div className="text-center py-16 animate-in zoom-in duration-300">
 <div className="w-20 h-20 mx-auto mb-6 bg-secondary/30 rounded-full flex items-center justify-center border-4 border-background shadow-sm">
 <MessageCircleDashed className="w-10 text-muted-foreground"/>
 </div>
 <h3 className="text-xl font-bold text-foreground mb-2">WhatsApp Not Connected</h3>
 <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
 You need to link your WhatsApp account to send messages. Please go to the main Dashboard to connect your device.
 </p>
 <Button asChild className="px-6">
 <Link href={`/workspace/${workspaceId}/wa`}>
 <ExternalLink className="w-4 h-4 mr-2"/>
 Go to Dashboard
 </Link>
 </Button>
 </div> :

 <form onSubmit={handleSendMessage} className="space-y-6 animate-in fade-in">
 <div className="flex items-center space-x-2 bg-green-500/10 text-green-600 px-4 py-3 rounded-md text-sm mb-4 font-medium border border-green-500/20">
 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
 <span>Connected and ready to send.</span>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Recipient Number (with country code)</label>
 <Input
 type="tel"
 placeholder="919876543210"
 value={toNumber}
 onChange={(e) => setToNumber(e.target.value)}
 required
 className="w-full bg-background border-border"/>
 
 </div>

 {/* Tabs for Message Type */}
 <div className="flex space-x-4 border-b border-border mb-4">
 <button
 type="button"
 onClick={() => setMsgType('text')}
 className={`pb-3 text-sm font-semibold transition-all ${msgType ==='text'?'border-b-2 border-primary text-primary':'text-muted-foreground hover:text-foreground'}`}>
 
 Standard Text
 </button>
 <button
 type="button"
 onClick={() => setMsgType('interactive')}
 className={`pb-3 text-sm font-semibold transition-all ${msgType ==='interactive'?'border-b-2 border-primary text-primary':'text-muted-foreground hover:text-foreground'}`}>
 
 Interactive (List Menu)
 </button>
 </div>

 {/* Text Form */}
 {msgType ==='text'&&
 <div className="space-y-2 animate-in fade-in">
 <label className="text-sm font-semibold text-foreground">Message Content</label>
 <Textarea
 placeholder="Type your WhatsApp notification..."
 value={messageText}
 onChange={(e) => setMessageText(e.target.value)}
 required={msgType ==='text'}
 rows={5}
 className="resize-none"/>
 
 </div>
 }

 {/* Interactive Form Builder */}
 {msgType ==='interactive'&&
 <div className="space-y-6 animate-in fade-in">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Main Body Text</label>
 <Textarea
 value={intBody}
 onChange={(e) => setIntBody(e.target.value)}
 required={msgType ==='interactive'}
 rows={3} />
 
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Footer Text (Optional)</label>
 <Input value={intFooter} onChange={(e) => setIntFooter(e.target.value)} placeholder="e.g. Reply STOP to unsubscribe"/>
 </div>
 <div className="space-y-2">
 <label className="text-sm font-semibold text-foreground">Menu Button Title</label>
 <Input value={intButton} onChange={(e) => setIntButton(e.target.value)} required={msgType ==='interactive'} />
 </div>
 </div>

 <div className="bg-muted/30 p-4 rounded-md border border-border space-y-6">
 <div className="flex justify-between items-center">
 <h4 className="font-semibold text-sm">List Sections & Options</h4>
 <button type="button"onClick={addSection} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-medium flex items-center">
 <Plus className="w-3 h-3 mr-1"/> Add Section
 </button>
 </div>

 {intSections.map((sec, sIdx) =>
 <div key={`section-${sIdx}`} className="bg-background border border-border p-4 rounded-md space-y-4">
 <div className="flex justify-between items-center space-x-3">
 <Input
 value={sec.title}
 onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
 placeholder="Section Title"
 className="font-semibold"
 required />
 
 {intSections.length > 1 &&
 <button type="button"onClick={() => removeSection(sIdx)} className="text-destructive p-2 hover:bg-destructive/10 rounded-md">
 <Trash2 className="w-4 h-4"/>
 </button>
 }
 </div>

 <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-muted">
 {sec.rows.map((row, rIdx) =>
 <div key={`row-${rIdx}`} className="flex items-start space-x-3">
 <div className="flex-1 space-y-2">
 <Input value={row.title} onChange={(e) => updateRow(sIdx, rIdx,'title', e.target.value)} placeholder="Option Title (e.g. Sales Dept)"required />
 <Input value={row.description} onChange={(e) => updateRow(sIdx, rIdx,'description', e.target.value)} placeholder="Option Description (Optional)"className="text-xs"/>
 </div>
 {sec.rows.length > 1 &&
 <button type="button"onClick={() => removeRow(sIdx, rIdx)} className="text-muted-foreground hover:text-destructive mt-2">
 <Trash2 className="w-4 h-4"/>
 </button>
 }
 </div>
 )}
 <button type="button"onClick={() => addRow(sIdx)} className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center pt-2">
 <Plus className="w-3 h-3 mr-1"/> Add Option
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 }

 {feedback &&
 <div className={`p-3.5 rounded-md text-sm font-medium border ${feedback.type ==='success'?'bg-green-500/10 text-green-600 border-green-500/20':'bg-destructive/10 text-destructive border-destructive/20'}`}>
 {feedback.msg}
 </div>
 }

 <button
 type="submit"
 disabled={sendLoading}
 className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
 
 {sendLoading ?
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50 border-t-white"></div>
 <span>Sending...</span>
 </> :

 <>
 <Send className="w-4 h-4"/>
 <span>Send Message</span>
 </>
 }
 </button>
 </form>
 }
 </div>
 </div>
 </div>

 {/* Right: Message History & Live Preview */}
 <div className="w-full xl:w-[400px] flex flex-col space-y-6">

 {/* Live Preview Panel (Only for Interactive, purely visual) */}
 {status ==='open'&& msgType ==='interactive'&&
 <div className="bg-card border border-border rounded-md flex flex-col overflow-hidden shadow-sm h-auto shrink-0 animate-in fade-in">
 <div className="px-4 py-3 bg-muted/30 border-b border-border text-sm font-semibold flex items-center text-muted-foreground">
 <Smartphone className="w-4 h-4 mr-2"/> Live Preview
 </div>
 <div className="bg-[#EFEAE2] p-4 flex-1">
 {/* Dummy WhatsApp Message Bubble */}
 <div className="bg-white rounded-md rounded-tl-none p-3 shadow-sm max-w-[90%] text-sm text-gray-800 break-words whitespace-pre-wrap">
 {intBody ||'Type a message...'}
 {intFooter && <div className="text-xs text-gray-400 mt-2">{intFooter}</div>}

 <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center text-[#00A884] font-medium text-center">
 <svg className="w-5 h-5 mr-1.5"viewBox="0 0 24 24"fill="none"stroke="currentColor"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
 {intButton ||'Options'}
 </div>
 </div>
 </div>
 </div>
 }

 {/* History Panel */}
 <div id='message-history'className='flex-1 border border-border rounded-md p-4 bg-card shadow-sm flex flex-col min-h-[400px]'>
 <div className="flex justify-between items-center mb-4">
 <h3 className="font-bold text-foreground">Activity History</h3>
 <span className="text-xs font-semibold px-2 py-1 bg-secondary text-secondary-foreground rounded-full">{messages.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-border">
 {messages.length === 0 ?
 <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
 <Send className="w-8 h-8 mb-2 opacity-20"/>
 <span className="text-sm">No recent messages.</span>
 </div> :

 messages.map((msg, index) =>
 <div key={`${msg.id}-${index}`} className={`flex ${msg.fromMe ?'justify-end':'justify-start'}`}>
 <div className={`max-w-[85%] p-3 rounded-md text-sm shadow-sm ${msg.fromMe ?'bg-[#005c4b] text-[#e9edef] rounded-tr-sm':'bg-[#202c33] text-[#e9edef] rounded-tl-sm'}`}>
 <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
 <div className={`text-[10px] mt-1.5 opacity-70 flex ${msg.fromMe ?'justify-end':'justify-start'}`}>
 {new Date(msg.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit'})} • {msg.jid.split('@')[0]}
 </div>
 </div>
 </div>
 )
 }
 </div>
 </div>
 </div>
 </div>);

}