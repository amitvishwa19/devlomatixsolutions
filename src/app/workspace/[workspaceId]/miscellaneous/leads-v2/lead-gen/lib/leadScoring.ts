import type { Lead } from '../data/mockLeads';

export interface LeadScore {
  total: number;       // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    rating: number;    // 0-35
    reviews: number;   // 0-30
    website: number;   // 0-15
    email: number;     // 0-10
    phone: number;     // 0-10
  };
}

export function scoreLead(lead: Lead): LeadScore {
  const breakdown = {
    rating: Math.min(35, (lead.rating / 5) * 35),
    reviews: Math.min(30, Math.log10(Math.max(1, lead.reviews)) / Math.log10(1000) * 30),
    website: lead.website ? 15 : 0,
    email: lead.email ? 10 : 0,
    phone: lead.phone ? 10 : 0,
  };

  const total = Math.round(
    breakdown.rating + breakdown.reviews + breakdown.website + breakdown.email + breakdown.phone
  );

  let grade: LeadScore['grade'];
  if (total >= 80) grade = 'A';
  else if (total >= 60) grade = 'B';
  else if (total >= 40) grade = 'C';
  else if (total >= 20) grade = 'D';
  else grade = 'F';

  return { total, grade, breakdown };
}

export const gradeColors: Record<LeadScore['grade'], string> = {
  A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  B: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  F: 'bg-red-500/20 text-red-400 border-red-500/30',
};
