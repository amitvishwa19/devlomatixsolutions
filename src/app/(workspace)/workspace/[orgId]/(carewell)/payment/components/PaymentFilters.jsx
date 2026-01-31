import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, List, Table, Calendar, Download, Filter } from 'lucide-react';
import { TRANSACTION_STATUS, PAYMENT_GATEWAYS } from '../types';

export function PaymentFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  gatewayFilter,
  onGatewayFilterChange,
  viewMode,
  onViewModeChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient, invoice, or transaction ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={TRANSACTION_STATUS.SUCCESS}>Success</SelectItem>
          <SelectItem value={TRANSACTION_STATUS.PENDING}>Pending</SelectItem>
          <SelectItem value={TRANSACTION_STATUS.PROCESSING}>Processing</SelectItem>
          <SelectItem value={TRANSACTION_STATUS.FAILED}>Failed</SelectItem>
          <SelectItem value={TRANSACTION_STATUS.REFUNDED}>Refunded</SelectItem>
        </SelectContent>
      </Select>

      {/* Gateway Filter */}
      <Select value={gatewayFilter} onValueChange={onGatewayFilterChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Gateway" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Gateways</SelectItem>
          <SelectItem value={PAYMENT_GATEWAYS.RAZORPAY}>Razorpay</SelectItem>
          <SelectItem value={PAYMENT_GATEWAYS.STRIPE}>Stripe</SelectItem>
          <SelectItem value={PAYMENT_GATEWAYS.UPI}>UPI Direct</SelectItem>
          <SelectItem value={PAYMENT_GATEWAYS.CASH}>Cash</SelectItem>
          <SelectItem value={PAYMENT_GATEWAYS.NEFT}>NEFT/RTGS</SelectItem>
        </SelectContent>
      </Select>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 border rounded-md p-1">
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          <Table className="w-4 h-4" />
        </Button>
      </div>

      {/* Export Button */}
      <Button variant="outline" size="sm">
        <Download className="w-4 h-4 mr-1" />
        Export
      </Button>
    </div>
  );
}
