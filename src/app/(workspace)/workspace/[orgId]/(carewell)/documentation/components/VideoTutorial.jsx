import { Play, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VideoTutorial({ tutorials }) {
  if (!tutorials || tutorials.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Play className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Video Tutorials</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutorials.map((tutorial, index) => (
          <Card key={index} className="overflow-hidden hover:border-primary/50 transition-colors">
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center z-10">
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              </div>
              <Badge className="absolute top-3 right-3" variant="secondary">
                {tutorial.duration}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{tutorial.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
