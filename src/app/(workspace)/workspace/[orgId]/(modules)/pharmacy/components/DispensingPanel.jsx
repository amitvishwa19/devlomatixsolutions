import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ShoppingCart, Pill, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function DispensingPanel({ dispensing, inventory, onDispense }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDispensing = React.useMemo(() => {
    return dispensing.filter(d => 
      d.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.medicineName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dispensing, searchQuery]);

  // Group by date
  const groupedByDate = React.useMemo(() => {
    const groups = {};
    filteredDispensing.forEach(d => {
      const dateKey = format(new Date(d.dispensedAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(d);
    });
    return groups;
  }, [filteredDispensing]);

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Dispensing History</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patient or medicine..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="pl-9 w-64" 
                />
              </div>
              <Button onClick={onDispense}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                New Dispense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {dates.map(dateKey => (
            <div key={dateKey} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground">
                  {format(new Date(dateKey), 'EEEE, dd MMMM yyyy')}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {groupedByDate[dateKey].length} items
                </Badge>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Prescription</TableHead>
                      <TableHead>Dispensed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedByDate[dateKey].map(d => (
                      <TableRow key={d.id}>
                        <TableCell className="text-sm">
                          {format(new Date(d.dispensedAt), 'HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{d.patientName}</p>
                              <p className="text-xs text-muted-foreground">{d.patientId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Pill className="w-4 h-4 text-muted-foreground" />
                            <span>{d.medicineName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{d.quantity} units</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {d.prescriptionId}
                        </TableCell>
                        <TableCell className="text-sm">
                          {d.dispensedBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
          
          {dates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No dispensing records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
