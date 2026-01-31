import { Card, CardContent } from '@/components/ui/card';
import { FolderTree, Tag, TrendingUp, Layers } from 'lucide-react';

export function TaxonomyStats({ categories, tags }) {
  const stats = [
    {
      label: 'Categories',
      value: categories.length,
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Tags',
      value: tags.length,
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Total Items Tagged',
      value: tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      label: 'Nested Categories',
      value: categories.filter(c => c.parentId).length,
      icon: Layers,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
