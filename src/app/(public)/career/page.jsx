'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  Search,
  Users,
  Globe,
  Zap,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobCard } from './_components/JobCard';
import { JobFilter } from './_components/JobFilter';
import { ApplyModal } from './_components/ApplyModal';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

const STATS = [
  { label: 'Offices Worldwide', value: '12+', icon: Globe },
  { label: 'Team Members', value: '250+', icon: Users },
  { label: 'Success Rate', value: '98%', icon: Trophy },
];

export default function CareerPage() {
  // Filter States
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [location, setLocation] = useState('ALL');

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: jobs, isLoading } = useSWR('/api/public/jobs', fetcher);

  const filteredJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase());
      const matchesDept = department === 'ALL' || job.department === department;
      const matchesType = type === 'ALL' || job.type === type;
      const matchesLoc = location === 'ALL' || job.location.toLowerCase().includes(location.toLowerCase());

      return matchesSearch && matchesDept && matchesType && matchesLoc;
    });
  }, [search, department, type, location, jobs]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const scrollToJobs = () => {
    const element = document.getElementById('open-positions');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToCulture = () => {
    const element = document.getElementById('our-culture');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] uppercase tracking-widest shadow-lg shadow-primary/5"
            >
              <Sparkles size={14} className="fill-primary" />
              Careers at Devlomatix
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl tracking-tight leading-[1.1]"
            >
              Join the Future of <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-indigo-500">
                Digital Innovation
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-70"
            >
              Build revolutionary products with a team that values creativity,
              excellence, and your professional growth. Your next big challenge awaits.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                size="lg"
                onClick={scrollToJobs}
                className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                View Openings
                <ChevronDown size={18} className="ml-2 animate-bounce" />
              </Button>

            </motion.div>

            {/* Stats Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16"
            >
              {STATS.map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/40 shadow-sm">
                  <div className="p-3 bg-primary/10 rounded-xl mb-2">
                    <stat.icon size={24} className="text-primary" />
                  </div>
                  <span className="text-3xl">{stat.value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                    {stat.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="our-culture" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-6 text-center space-y-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] uppercase tracking-widest"
            >
              Our Vision
            </motion.div>
            <h2 className="text-4xl md:text-5xl tracking-tight leading-tight">
              Driven by Innovation,<br />
              <span className="text-primary">Defined by People.</span>
            </h2>
            <p className="text-lg font-medium text-muted-foreground opacity-70">
              At Devlomatix, we're not just building apps—we're creating tools that change
              how people communicate and grow. Our culture is built on trust, transparency,
              and the relentless pursuit of excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation First",
                desc: "We push boundaries and embrace failure as a stepping stone to breakthrough ideas.",
                icon: Sparkles
              },
              {
                title: "Collaboration",
                desc: "Breaking silos and working as one unified team to deliver exceptional results.",
                icon: Users
              },
              {
                title: "Growth Mindset",
                desc: "Continuous learning and professional development are at the heart of our journey.",
                icon: Zap
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-[40px] bg-card/40 border border-border/40 hover:border-primary/40 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <value.icon size={28} />
                </div>
                <h4 className="text-xl mb-3">{value.title}</h4>
                <p className="text-sm font-medium text-muted-foreground opacity-60 leading-relaxed">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="open-positions" className="py-24 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-4xl tracking-tight">Open Positions</h2>
                <p className="text-sm font-bold text-muted-foreground opacity-60">
                  Showing {isLoading ? '...' : filteredJobs.length} opportunities across the globe
                </p>
              </div>
              <div className="flex items-center gap-3 p-2 bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-3 py-1.5">
                  Engineering
                </Badge>
                <Badge variant="ghost" className="text-[10px] font-bold opacity-40">
                  Design
                </Badge>
                <Badge variant="ghost" className="text-[10px] font-bold opacity-40">
                  Sales
                </Badge>
              </div>
            </div>

            {/* Search & Filter */}
            <JobFilter
              search={search}
              setSearch={setSearch}
              department={department}
              setDepartment={setDepartment}
              type={type}
              setType={setType}
              location={location}
              setLocation={setLocation}
            />

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                  />
                ))}
              </AnimatePresence>

              {filteredJobs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full h-80 flex flex-col items-center justify-center space-y-4 bg-card/40 backdrop-blur-xl border border-dashed border-border/60 rounded-[40px]"
                >
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                    <Search size={32} className="text-muted-foreground opacity-20" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl">No positions found</h4>
                    <p className="text-sm font-medium text-muted-foreground opacity-60">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setDepartment('ALL');
                      setType('ALL');
                    }}
                    className="rounded-full px-8 border-dashed"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20 relative overflow-hidden text-center space-y-10 group">
            {/* Animated Grid Decoration */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="space-y-4 relative z-10">
              <h2 className="text-4xl md:text-5xl tracking-tight leading-tight">
                Don't see the right role? <br />
                <span className="text-primary">Apply anyway.</span>
              </h2>
              <p className="text-lg font-medium text-muted-foreground opacity-70 max-w-xl mx-auto">
                We're always on the lookout for exceptional talent. If you're passionate
                about what we do, let's talk.
              </p>
            </div>

            <div className="relative z-10">
              <Button
                size="lg"
                className="h-14 px-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-[10px] transition-all group-hover:scale-105 active:scale-95"
                onClick={() => handleApply({
                  id: 'custom',
                  title: 'General Application',
                  department: 'Talent Pool',
                  location: 'Global / Remote',
                  type: 'Flexible',
                  salary: 'Competitive',
                  description: 'This is a general application for future opportunities at Devlomatix. Tell us why you\'d be a great fit!',
                  requirements: ['Passion for innovation', 'Strong work ethic', 'Great communication'],
                  benefits: ['Being part of the future', 'Global network', 'Career growth']
                })}
              >
                Send us your CV
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <ApplyModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
