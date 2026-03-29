'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
 Star, 
 CheckCircle2, 
 AlertCircle, 
 MessageSquare, 
 TrendingUp, 
 Zap,
 Scale,
 ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ATTRIBUTES = [
 { id: 'technical', label: 'Technical Proficiency', icon: Zap, color: 'text-blue-500', description: 'Domain knowledge and technical skills required for the role.' },
 { id: 'culture', label: 'Culture Fit', icon: ShieldCheck, color: 'text-emerald-500', description: 'Alignment with company values and team dynamics.' },
 { id: 'potential', label: 'Growth Potential', icon: TrendingUp, color: 'text-purple-500', description: 'Ability to learn, adapt, and scale with the organization.' },
 { id: 'communication', label: 'Communication', icon: MessageSquare, color: 'text-amber-500', description: 'Clarity, empathy, and effectiveness in verbal/written communication.' },
 { id: 'logic', label: 'Problem Solving', icon: Scale, color: 'text-rose-500', description: 'Logical reasoning and approach to complex challenges.' }
];

export default function Scorecards({ candidate, onSubmit }) {
 const [scores, setScores] = useState({
 technical: 3,
 culture: 3,
 potential: 3,
 communication: 3,
 logic: 3
 });
 const [overallFeedback, setOverallFeedback] = useState("");
 const [finalRecommendation, setFinalRecommendation] = useState("maybe");

 const averageScore = Object.values(scores).reduce((a, b) => a + b, 0) / ATTRIBUTES.length;

 const handleScoreChange = (id, value) => {
 setScores(prev => ({ ...prev, [id]: value[0] }));
 };

 const getRecommendationColor = (rec) => {
 switch(rec) {
 case 'yes': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
 case 'strong_yes': return 'bg-primary/20 text-primary border-primary/40';
 case 'no': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
 default: return 'bg-muted/40 text-muted-foreground border-border/20';
 }
 };

 return (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
 <Card className="border-border/40 bg-card/30 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl shadow-black/5">
 <CardHeader className="p-8 border-b border-border/10">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-2xl tracking-tighter">Structured Scorecard</CardTitle>
 <CardDescription className="text-[10px] opacity-40">Evaluating Candidate Fit with Precision</CardDescription>
 </div>
 <div className="text-right">
 <p className="text-[10px] opacity-40 mb-1">Overall Average</p>
 <div className="text-3xl text-primary">{averageScore.toFixed(1)}</div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-8 space-y-10">
 <div className="grid gap-10">
 {ATTRIBUTES.map((attr) => (
 <div key={attr.id} className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-lg bg-card border border-border/40 ${attr.color}`}>
 <attr.icon size={16} />
 </div>
 <div>
 <h4 className="text-sm ">{attr.label}</h4>
 <p className="text-[10px] font-medium opacity-40">{attr.description}</p>
 </div>
 </div>
 <Badge variant="outline" className={`h-8 w-12 flex items-center justify-center text-xs rounded-lg ${attr.color} bg-background/40`}>
 {scores[attr.id]}/5
 </Badge>
 </div>
 <Slider 
 min={1} 
 max={5} 
 step={1} 
 value={[scores[attr.id]]} 
 onValueChange={(v) => handleScoreChange(attr.id, v)}
 className="cursor-pointer"
 />
 <div className="flex justify-between px-1">
 {['Poor', 'Below Average', 'Average', 'Good', 'Exceptional'].map((label, i) => (
 <span key={i} className={`text-[8px] tracking-tighter opacity-30 ${scores[attr.id] === i + 1 ? 'opacity-100 text-primary' : ''}`}>
 {label}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>

 <Separator className="bg-border/10" />

 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] text-muted-foreground opacity-50 ml-1">Evidence & Notes</label>
 <Textarea 
 placeholder="Describe specific examples or observations that justify the scores above..."
 className="min-h-[150px] bg-muted/20 border-border/20 rounded-lg p-6 font-medium text-sm focus-visible:ring-primary shadow-inner"
 value={overallFeedback}
 onChange={(e) => setOverallFeedback(e.target.value)}
 />
 </div>

 <div className="space-y-4">
 <label className="text-[10px] text-muted-foreground opacity-50 ml-1">Final Recommendation</label>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { value: 'strong_yes', label: 'Strong Hire', icon: Zap },
 { value: 'yes', label: 'Hire', icon: CheckCircle2 },
 { value: 'maybe', label: 'Maybe / Note', icon: AlertCircle },
 { value: 'no', label: 'Do Not Hire', icon: ShieldCheck }
 ].map((rec) => (
 <Button
 key={rec.value}
 variant="outline"
 className={`h-14 rounded-lg flex flex-col items-center justify-center gap-1 border-border/40 transition-all ${
 finalRecommendation === rec.value 
 ? `${getRecommendationColor(rec.value)} border-current scale-[1.02] shadow-xl` 
 : 'bg-card/40 opacity-40 hover:opacity-100 hover:scale-[1.02]'
 }`}
 onClick={() => setFinalRecommendation(rec.value)}
 >
 <rec.icon size={16} />
 <span className="text-[10px] ">{rec.label}</span>
 </Button>
 ))}
 </div>
 </div>
 </div>

 <div className="pt-6">
 <Button 
 className="w-full h-14 rounded-lg bg-primary text-primary-foreground tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all hover:shadow-primary/40"
 onClick={() => onSubmit({ scores, overallFeedback, finalRecommendation })}
 >
 Finalize Evaluation & Submit Scorecard
 </Button>
 <p className="text-center mt-4 text-[9px] font-bold text-muted-foreground opacity-40 ">
 Submitted scorecards are permanent and will be visible to the hiring team.
 </p>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
