'use client';

import { useState } from'react';
import { useParams, useRouter } from'next/navigation';
import {
 Mic,
 Video,
 VideoOff,
 MicOff,
 MessageSquare,
 Users,
 Settings,
 PhoneOff,
 Monitor,
 Hand,
 Sparkles,
 MoreVertical,
 ChevronLeft,
 Star,
 Layout,
 ClipboardIcon,
 Code,
 Terminal
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from'@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from'@/components/ui/avatar';
import { Badge } from'@/components/ui/badge';
import { Separator } from'@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";
import { Textarea } from'@/components/ui/textarea';
import { motion, AnimatePresence } from'framer-motion';

export default function InterviewSpacePage() {
 const { workspaceId, interviewId } = useParams();
 const router = useRouter();
 const [isMuted, setIsMuted] = useState(false);
 const [isVideoOff, setIsVideoOff] = useState(false);
 const [isScreenSharing, setIsScreenSharing] = useState(false);
 const [activeTool, setActiveTool] = useState('ai');

 return (
 <div id='main-container'className="absolute inset-0 w-full text-white overflow-hidden font-sans">

 <div className='flex flex-row h-full'>
 {/* Left Sidebar: Interview Context & Feedback */}
 <div className="w-[30%] h-full border-r border-white/5 bg-card backdrop-blur-3xl p-6 flex flex-col gap-6 min-w-0 h-full">
 <div className="flex items-center gap-2 shrink-0">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => router.back()}
 className="p-0 h-auto hover:bg-transparent text-muted-foreground hover:text-primary transition-colors text-[10px] tracking-[0.2em]"
 >
 <ChevronLeft size={12} className="mr-1"/>
 Back to Hub
 </Button>
 </div>

 <div className="space-y-4 shrink-0">
 <div className="flex items-center gap-4">
 <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-2xl">
 <AvatarFallback className="bg-primary/10 text-primary text-lg italic">RS</AvatarFallback>
 </Avatar>
 <div className="min-w-0">
 <h1 className="text-xl tracking-tighter truncate">Rohit Sharma</h1>
 <p className="text-[10px] text-primary/60 italic truncate">Frontend Developer Candidate</p>
 </div>
 </div>
 <div className="flex gap-2">
 <Badge variant="outline"className="h-6 rounded-md bg-white/5 border-white/10 text-[9px]">Technical Round</Badge>
 <Badge variant="outline"className="h-6 rounded-md bg-primary/10 border-primary/20 text-primary text-[9px]">A-Priority</Badge>
 </div>
 </div>

 <Separator className="bg-white/5 shrink-0"/>

 <Tabs defaultValue="notes"className="flex-1 flex flex-col min-h-0">
 <TabsList className="bg-white/5 p-1 rounded-md h-9 border border-white/10 shrink-0">
 <TabsTrigger value="notes"className="rounded-md text-[8px] flex-1 px-1">Notes</TabsTrigger>
 <TabsTrigger value="scorecard"className="rounded-md text-[8px] flex-1 px-1">Score</TabsTrigger>
 <TabsTrigger value="resume"className="rounded-md text-[8px] flex-1 px-1">Resume</TabsTrigger>
 </TabsList>

 <TabsContent value="notes"className="flex-1 mt-4 outline-none min-h-0 flex flex-col overflow-hidden">
 <div className="flex-1 min-h-0 bg-white/5 rounded-md border border-white/5 p-5 overflow-y-auto scrollbar-hide">
 <p className="text-[9px] font-bold text-white/20 italic mb-4">Transcription Start...</p>
 <div className="space-y-5">
 <div className="space-y-1">
 <p className="text-[9px] text-primary italic">Interviewer (You)</p>
 <p className="text-xs font-medium opacity-60">Can you explain your experience with Next.js Server Components?</p>
 </div>
 <div className="space-y-1">
 <p className="text-[9px] text-white/40 italic">Rohit Sharma</p>
 <p className="text-xs font-medium opacity-90">Sure. Server Components allow us to render complex UI on the server, reducing the client-side JavaScript bundle...</p>
 </div>
 </div>
 </div>
 <div className="mt-4 relative group shrink-0">
 <Textarea
 placeholder="Add a private note..."
 className="bg-white/5 border-white/10 rounded-md min-h-[100px] p-5 text-sm font-medium focus-visible:ring-primary shadow-inner resize-none h-24"
 />
 <div className="absolute bottom-3 right-4 text-[8px] text-white/20 italic group-focus-within:text-primary transition-colors">Shift + Enter to save</div>
 </div>
 </TabsContent>

 <TabsContent value="scorecard"className="flex-1 mt-4 outline-none overflow-y-auto pr-1 scrollbar-hide">
 <div className="space-y-6 p-1">
 {[
 { icon: Code, label:"Technical Prowess"},
 { icon: MessageSquare, label:"Communication"},
 { icon: Sparkles, label:"Problem Solving"}
 ].map((trait, i) => (
 <div key={i} className="space-y-2">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <trait.icon size={12} className="text-primary/60"/>
 <span className="text-[9px] opacity-60">{trait.label}</span>
 </div>
 <span className="text-base text-primary">05<span className="text-[9px] text-white/20">/05</span></span>
 </div>
 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
 <div className="h-full w-[80%] bg-primary shadow-[0_0_15px_rgba(255,255,255,0.1)]"/>
 </div>
 </div>
 ))}
 <Button className="w-full bg-primary hover:bg-primary/90 rounded-md text-[9px] shadow-lg shadow-primary/20 mt-2">
 Submit Preliminary Scorecard
 </Button>
 </div>
 </TabsContent>
 </Tabs>
 </div>

 {/* Main Center: Video Feed */}
 <div className="flex-1 flex flex-col p-6 gap-6 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#131317] to-black min-w-0">
 {/* Header Info */}
 <div className="flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-xl">
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
 <span className="text-[8px] text-emerald-500/80">Live Session • 12:45</span>
 </div>
 <Separator orientation="vertical"className="h-2.5 bg-white/10"/>
 <span className="text-[8px] text-white/40 italic">U12-99X</span>
 </div>

 <div className="flex items-center gap-2">
 <div className="flex -space-x-2">
 {[1, 2, 3].map((_, i) => (
 <Avatar key={i} className="h-7 w-7 border-2 border-black">
 <AvatarFallback className="bg-white/5 text-[7px] font-bold">TM</AvatarFallback>
 </Avatar>
 ))}
 </div>
 <Badge variant="ghost"className="h-7 rounded-full bg-white/5 border border-white/10 text-[9px] px-3">+2</Badge>
 </div>
 </div>

 {/* Primary Video Grid */}
 <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 relative">
 {/* Candidate Feed */}
 <div className="relative rounded-md overflow-hidden border border-white/5 bg-[#0A0A0B] shadow-2xl group flex items-center justify-center">
 <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
 <Avatar className="h-40 w-40 border-[8px] border-white/5 shadow-2xl opacity-20 filter grayscale">
 <AvatarFallback className="text-xl italic">RS</AvatarFallback>
 </Avatar>
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent"/>
 </div>
 <div className="absolute bottom-6 left-6 flex items-center gap-2">
 <Badge className="bg-white/10 backdrop-blur-xl text-white border-white/20 italic text-[9px] px-2.5 py-0.5">Rohit Sharma</Badge>
 <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
 <Mic size={9} />
 </div>
 </div>
 </div>

 {/* My Feed */}
 <div className="relative rounded-md overflow-hidden border border-white/5 shadow-2xl bg-[#0F0F11] flex items-center justify-center">
 <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
 {isVideoOff ? (
 <Avatar className="h-24 w-24 border-4 border-white/5">
 <AvatarFallback className="text-xl italic">YOU</AvatarFallback>
 </Avatar>
 ) : (
 <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center opacity-40 italic text-white/5 text-2xl">Camera Active</div>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent"/>
 </div>
 <div className="absolute bottom-6 left-6 flex items-center gap-2">
 <Badge className="bg-primary/20 backdrop-blur-xl text-primary border-primary/20 italic text-[9px] px-2.5 py-0.5">YOU</Badge>
 <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isMuted ?'bg-rose-500/20 text-rose-500':'bg-emerald-500/20 text-emerald-500'}`}>
 {isMuted ? <MicOff size={9} /> : <Mic size={9} />}
 </div>
 </div>
 </div>

 {/* Shared Content Layer / Overlay */}
 {isScreenSharing && (
 <div className="absolute inset-0 z-50 bg-black/95 rounded-md border border-primary/40 flex items-center justify-center">
 <div className="text-center space-y-4">
 <Monitor size={48} className="mx-auto text-primary animate-pulse"/>
 <h3 className="text-xl">Presenting Screen</h3>
 <Button onClick={() => setIsScreenSharing(false)} className="bg-rose-500 hover:bg-rose-600 rounded-md px-6 text-[9px]">Stop Sharing</Button>
 </div>
 </div>
 )}
 </div>

 {/* Main Interaction Bar */}
 <div className="shrink-0 flex items-center justify-center gap-5 pb-1">
 <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-md border border-white/10 backdrop-blur-3xl shadow-2xl">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setIsMuted(!isMuted)}
 className={`h-11 w-11 rounded-md transition-all ${isMuted ?'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30':'hover:bg-white/10'}`}
 >
 {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
 </Button>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setIsVideoOff(!isVideoOff)}
 className={`h-11 w-11 rounded-md transition-all ${isVideoOff ?'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30':'hover:bg-white/10'}`}
 >
 {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
 </Button>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setIsScreenSharing(!isScreenSharing)}
 className={`h-11 w-11 rounded-md transition-all ${isScreenSharing ?'bg-emerald-500/10 text-emerald-500':'hover:bg-white/10'}`}
 >
 <Monitor size={18} />
 </Button>
 <Button variant="ghost"size="icon"className="h-11 w-11 rounded-md hover:bg-white/10">
 <Hand size={18} />
 </Button>
 </div>

 <div className="flex items-center gap-2">
 <Button variant="ghost"size="icon"className="h-11 w-11 rounded-md bg-white/5 border border-white/10 hover:bg-white/10">
 <Layout size={18} />
 </Button>
 <Button variant="ghost"size="icon"className="h-11 w-11 rounded-md bg-white/5 border border-white/10 hover:bg-white/10">
 <MessageSquare size={18} />
 </Button>
 <Button variant="ghost"size="icon"className="h-11 w-11 rounded-md bg-white/5 border border-white/10 hover:bg-white/10">
 <MoreVertical size={18} />
 </Button>
 </div>

 <Button className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-md h-11 px-6 shadow-lg shadow-rose-500/20 flex items-center gap-2 group">
 <PhoneOff size={18} className="group-hover:rotate-12 transition-transform"/>
 <span className="text-[9px]">End</span>
 </Button>
 </div>

 {/* Dynamic Tool Panel */}
 <AnimatePresence mode="wait">
 {activeTool && (
 <motion.div
 initial={{ x: 300, opacity: 0 }}
 animate={{ x: 0, opacity: 1 }}
 exit={{ x: 300, opacity: 0 }}
 transition={{ type:'spring', damping: 25, stiffness: 200 }}
 className="absolute top-24 right-6 bottom-24 w-80 bg-[#16161E]/95 backdrop-blur-2xl border border-white/10 rounded-md shadow-2xl z-[60] flex flex-col overflow-hidden"
 >
 <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
 <h3 className="text-[10px] tracking-[0.2em] text-primary">
 {activeTool ==='ai'&&'AI Assistant'}
 {activeTool ==='notes'&&'Quick Notes'}
 {activeTool ==='code'&&'Code Editor'}
 {activeTool ==='terminal'&&'Interviewer Console'}
 {activeTool ==='settings'&&'Media Settings'}
 </h3>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setActiveTool(null)}
 className="h-6 w-6 hover:bg-white/10 rounded-full"
 >
 <ChevronLeft size={14} className="rotate-180"/>
 </Button>
 </div>

 <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
 {activeTool ==='ai'&& (
 <div className="space-y-4">
 <div className="bg-primary/10 border border-primary/20 p-3 rounded-md">
 <p className="text-[10px] text-primary mb-1">AI Suggestion</p>
 <p className="text-xs opacity-80 leading-relaxed italic">"Ask about their experience with Hydration errors in Next.js 14."</p>
 </div>
 <div className="space-y-2">
 <p className="text-[9px] opacity-40">Relevant Topics</p>
 <div className="flex flex-wrap gap-2">
 {['SSR','Hydration','Server Actions','PPR'].map(t => (
 <Badge key={t} variant="outline"className="text-[8px] bg-white/5 border-white/10">{t}</Badge>
 ))}
 </div>
 </div>
 </div>
 )}

 {activeTool ==='notes'&& (
 <Textarea
 placeholder="Type quick thoughts here..."
 className="h-full bg-transparent border-none resize-none focus-visible:ring-0 text-xs opacity-80"
 />
 )}

 {activeTool ==='code'&& (
 <div className="bg-black/40 rounded-md p-4 font-mono text-[11px] leading-relaxed border border-white/5 h-full">
 <p className="text-emerald-400">async function <span className="text-blue-400">interviewTask</span>() &#123;</p>
 <p className="pl-4 text-white/60">// Implement the fix here</p>
 <p className="pl-4 text-emerald-400">const <span className="text-white/90">data</span> = await fetch('/api/stats');</p>
 <p className="text-emerald-400">&#125;</p>
 <div className="mt-4 pt-4 border-t border-white/5 italic text-white/20">Collaborative mode active</div>
 </div>
 )}

 {activeTool ==='terminal'&& (
 <div className="bg-[#0D0D0F] rounded-md p-4 font-mono text-[10px] border border-white/5 h-full space-y-1">
 <p className="text-emerald-500">$ npm run analyze</p>
 <p className="text-white/40">Analyzing heap segments...</p>
 <p className="text-white/40">Chunk [01] size: 1.2MB</p>
 <p className="text-amber-500">Warning: Large bundle detected</p>
 <div className="flex gap-1 items-center mt-2">
 <span className="text-emerald-500 animate-pulse">_</span>
 </div>
 </div>
 )}

 {activeTool ==='settings'&& (
 <div className="space-y-6">
 <div className="space-y-3">
 <p className="text-[9px] opacity-40">Microphone</p>
 <div className="bg-white/5 rounded-md border border-white/10 flex items-center px-4 text-xs">Standard Internal Mic</div>
 </div>
 <div className="space-y-3">
 <p className="text-[9px] opacity-40">Camera</p>
 <div className="bg-white/5 rounded-md border border-white/10 flex items-center px-4 text-xs">FaceTime HD Camera</div>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Right Sidebar: Quick Actions & Snippets */}
 <div className="w-[70px] h-full border-l border-white/5 bg-card backdrop-blur-3xl p-4 flex flex-col items-center gap-8 shrink-0">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setActiveTool('ai')}
 className={` w-10 rounded-md transition-all shadow-lg ${activeTool ==='ai'?'bg-primary/10 text-primary shadow-primary/10 opacity-100':'opacity-40 hover:opacity-100 hover:text-primary'}`}
 >
 <Sparkles size={20} />
 </Button>

 <div className="flex flex-col gap-5">
 {[
 { id:'notes', icon: ClipboardIcon },
 { id:'code', icon: Code },
 { id:'terminal', icon: Terminal },
 { id:'settings', icon: Settings }
 ].map((tool) => (
 <Button
 key={tool.id}
 variant="ghost"
 size="icon"
 onClick={() => setActiveTool(tool.id)}
 className={`h-9 w-9 transition-all ${activeTool === tool.id ?'bg-primary/10 text-primary opacity-100':'opacity-40 hover:opacity-100 hover:text-primary'}`}
 >
 <tool.icon size={18} />
 </Button>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}