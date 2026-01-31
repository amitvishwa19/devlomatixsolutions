import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  IndianRupee, 
  Building2, 
  Users,
  Stethoscope,
  FlaskConical,
  ScanLine,
  Heart,
  Activity,
  Shield,
  Smile,
  Droplet,
  Ribbon,
  Bed,
  Scissors,
  Siren,
  Baby,
  Pill,
  Package
} from 'lucide-react';
import { formatCurrency, formatDuration, getStatusConfig, getCategoryConfig } from './utils';

// Icon mapping for categories
const iconMap = {
  Stethoscope,
  FlaskConical,
  ScanLine,
  Heart,
  Activity,
  Shield,
  Smile,
  Droplet,
  Ribbon,
  Bed,
  Scissors,
  Siren,
  Baby,
  Pill,
  Package,
};

export function ServiceCard({ service, onClick }) {
  const statusConfig = getStatusConfig(service.status);
  const categoryConfig = getCategoryConfig(service.category);
  const IconComponent = iconMap[categoryConfig.icon] || Package;

  return (
    <Card 
      className="border border-border hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick?.(service)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Category Icon */}
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-muted-foreground">{service.code}</p>
              </div>
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.name}
              </Badge>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {service.description}
            </p>
            
            {/* Info Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{formatCurrency(service.basePrice)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(service.duration, service.durationUnit)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate capitalize">{service.department}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{service.usageCount?.toLocaleString('en-IN') || 0} uses</span>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {categoryConfig.name}
              </Badge>
              {service.serviceType === 'opd' && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  OPD
                </Badge>
              )}
              {service.serviceType === 'ipd' && (
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  IPD
                </Badge>
              )}
              {service.serviceType === 'both' && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  OPD & IPD
                </Badge>
              )}
              {service.isEmergency && (
                <Badge variant="destructive" className="text-xs">
                  Emergency
                </Badge>
              )}
              {service.isPackage && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Package
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
