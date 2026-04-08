import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Globe, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useContentHistory } from "@/social-hub/hooks/use-content-history";

const COLORS = ["hsl(172, 66%, 50%)", "hsl(280, 65%, 60%)", "hsl(200, 80%, 55%)", "hsl(320, 70%, 55%)", "hsl(45, 80%, 55%)"];

const Analytics = () => {
  const { history } = useContentHistory();

  const totalGenerations = history.length;
  
  const platformCounts = history.reduce<Record<string, number>>((acc, item) => {
    const platform = item.platform || "unknown";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({ name, value }));

  const topicCounts = history.reduce<Record<string, number>>((acc, item) => {
    const topic = item.topic?.slice(0, 30) || "untitled";
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});

  const topicData = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const contentTypeCounts = history.reduce<Record<string, number>>((acc, item) => {
    const type = item.contentType || "post";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const contentTypeData = Object.entries(contentTypeCounts).map(([name, value]) => ({ name, value }));

  const languageCounts = history.reduce<Record<string, number>>((acc, item) => {
    const lang = item.language || "english";
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const uniquePlatforms = Object.keys(platformCounts).length;
  const uniqueLanguages = Object.keys(languageCounts).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your content generation activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Generations", value: totalGenerations, icon: BarChart3 },
          { label: "Platforms Used", value: uniquePlatforms, icon: Layers },
          { label: "Languages", value: uniqueLanguages, icon: Globe },
          { label: "Topics Covered", value: Object.keys(topicCounts).length, icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/60">
            <CardContent className="pt-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalGenerations === 0 ? (
        <Card className="border-border/50 bg-card/60">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No data yet. Generate some content to see analytics!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(240, 5%, 60%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "hsl(240, 5%, 60%)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(240, 10%, 5.5%)", border: "1px solid hsl(240, 5%, 18%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(172, 66%, 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60">
            <CardHeader>
              <CardTitle className="text-sm">Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {platformData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(240, 10%, 5.5%)", border: "1px solid hsl(240, 5%, 18%)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Content Types & Languages</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {contentTypeData.map((ct) => (
                <Badge key={ct.name} variant="outline" className="text-sm px-3 py-1">
                  {ct.name}: {ct.value}
                </Badge>
              ))}
              <span className="text-muted-foreground mx-2">|</span>
              {Object.entries(languageCounts).map(([lang, count]) => (
                <Badge key={lang} className="bg-accent/20 text-accent-foreground text-sm px-3 py-1">
                  {lang}: {count}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;