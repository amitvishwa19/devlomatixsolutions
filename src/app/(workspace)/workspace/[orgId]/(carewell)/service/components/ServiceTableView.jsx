import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDuration, getStatusConfig, getCategoryConfig } from '../utils/utils';

export function ServiceTableView({ services, onServiceClick, onEditService }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No services found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Service Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Usage</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const categoryConfig = getCategoryConfig(service.category);

            return (
              <TableRow
                key={service.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onServiceClick?.(service)}
              >
                <TableCell className="font-mono text-sm">{service.code}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {service.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {categoryConfig.name}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{service.department}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(service.basePrice)}
                </TableCell>
                <TableCell>{formatDuration(service.duration, service.durationUnit)}</TableCell>
                <TableCell>
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
                      Both
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusConfig.color}>
                    {statusConfig.name}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {service.usageCount?.toLocaleString('en-IN') || 0}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onServiceClick?.(service); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditService?.(service); }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
