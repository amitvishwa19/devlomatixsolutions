import React, { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Pill, Users, Calendar, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function PrescriptionAnalytics({ prescriptions }) {
  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts = { active: 0, completed: 0, 'on-hold': 0, discontinued: 0 };
    prescriptions.forEach(rx => {
      counts[rx.status] = (counts[rx.status] || 0) + 1;
    });
    return [
      { name: 'Active', value: counts.active, color: '#22c55e' },
      { name: 'Completed', value: counts.completed, color: '#0ea5e9' },
      { name: 'On Hold', value: counts['on-hold'], color: '#f59e0b' },
      { name: 'Discontinued', value: counts.discontinued, color: '#ef4444' },
    ];
  }, [prescriptions]);

  // Top prescribed medications
  const topMedications = useMemo(() => {
    const medCounts = {};
    prescriptions.forEach(rx => {
      rx.medicines.forEach(med => {
        medCounts[med.name] = (medCounts[med.name] || 0) + 1;
      });
    });
    return Object.entries(medCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [prescriptions]);

  // Prescriptions by doctor
  const prescriptionsByDoctor = useMemo(() => {
    const docCounts = {};
    prescriptions.forEach(rx => {
      const docName = rx.doctor.replace('Dr. ', '');
      docCounts[docName] = (docCounts[docName] || 0) + 1;
    });
    return Object.entries(docCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [prescriptions]);

  // Daily prescription trend (last 30 days)
  const dailyTrend = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = prescriptions.filter(rx => 
        format(new Date(rx.prescribedDate), 'yyyy-MM-dd') === dayStr
      ).length;
      return {
        date: format(day, 'MMM dd'),
        prescriptions: count,
      };
    });
  }, [prescriptions]);

  // Medicine categories
  const medicineCategories = useMemo(() => {
    const categories = {
      'Antibiotics': ['Azithromycin', 'Amoxicillin', 'Ciprofloxacin'],
      'Cardiovascular': ['Lisinopril', 'Amlodipine', 'Metoprolol', 'Losartan', 'Atorvastatin'],
      'Diabetes': ['Metformin'],
      'Pain Relief': ['Tramadol', 'Ibuprofen'],
      'Respiratory': ['Albuterol', 'Montelukast'],
      'Mental Health': ['Sertraline', 'Duloxetine'],
      'Other': [],
    };

    const catCounts = {};
    Object.keys(categories).forEach(cat => catCounts[cat] = 0);

    prescriptions.forEach(rx => {
      rx.medicines.forEach(med => {
        let found = false;
        for (const [cat, meds] of Object.entries(categories)) {
          if (meds.some(m => med.name.toLowerCase().includes(m.toLowerCase()))) {
            catCounts[cat]++;
            found = true;
            break;
          }
        }
        if (!found) catCounts['Other']++;
      });
    });

    return Object.entries(catCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [prescriptions]);

  // Key metrics
  const metrics = useMemo(() => {
    const totalMeds = prescriptions.reduce((sum, rx) => sum + rx.medicines.length, 0);
    const avgMedsPerRx = prescriptions.length > 0 ? (totalMeds / prescriptions.length).toFixed(1) : 0;
    const uniquePatients = new Set(prescriptions.map(rx => rx.patientId)).size;
    const refillsNeeded = prescriptions.filter(rx => rx.status === 'active' && rx.refillsRemaining <= 1).length;
    
    return { totalMeds, avgMedsPerRx, uniquePatients, refillsNeeded };
  }, [prescriptions]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalMeds}</p>
                <p className="text-xs text-muted-foreground">Total Medicines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgMedsPerRx}</p>
                <p className="text-xs text-muted-foreground">Avg per Rx</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.uniquePatients}</p>
                <p className="text-xs text-muted-foreground">Unique Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.refillsNeeded}</p>
                <p className="text-xs text-muted-foreground">Low Refills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prescription Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {statusDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Doctor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions by Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prescriptionsByDoctor} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Medications */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Prescribed Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMedications}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Medicine Categories */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">By Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={medicineCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {medicineCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Prescription Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      interval={4}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="prescriptions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
