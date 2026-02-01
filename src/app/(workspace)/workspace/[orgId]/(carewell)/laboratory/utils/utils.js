import { format, isToday, isYesterday, differenceInHours } from 'date-fns';
import { TEST_ORDER_STATUS } from './types';

/**
 * Format date for display
 */
export function formatLabDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Format short date
 */
export function formatShortDate(date) {
  if (!date) return '-';
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Calculate turnaround time
 */
export function calculateTurnaround(orderedAt, completedAt) {
  if (!orderedAt || !completedAt) return null;
  const hours = differenceInHours(new Date(completedAt), new Date(orderedAt));
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Calculate laboratory statistics
 */
export function calculateLabStats(orders) {
  const stats = {
    total: orders.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    stat: 0,
    todayOrders: 0,
    averageTurnaround: 0,
    completionRate: 0,
  };

  let totalTurnaround = 0;
  let turnaroundCount = 0;

  orders.forEach((order) => {
    // Status counts
    switch (order.status) {
      case TEST_ORDER_STATUS.ORDERED:
      case TEST_ORDER_STATUS.SAMPLE_COLLECTED:
        stats.pending++;
        break;
      case TEST_ORDER_STATUS.IN_PROGRESS:
        stats.inProgress++;
        break;
      case TEST_ORDER_STATUS.COMPLETED:
        stats.completed++;
        break;
      case TEST_ORDER_STATUS.CANCELLED:
        stats.cancelled++;
        break;
    }

    // Priority counts
    if (order.priority === 'stat') {
      stats.stat++;
    }

    // Today's orders
    if (isToday(new Date(order.orderedAt))) {
      stats.todayOrders++;
    }

    // Calculate turnaround for completed orders
    if (order.status === TEST_ORDER_STATUS.COMPLETED && order.orderedAt && order.completedAt) {
      const hours = differenceInHours(new Date(order.completedAt), new Date(order.orderedAt));
      totalTurnaround += hours;
      turnaroundCount++;
    }
  });

  // Calculate averages
  if (turnaroundCount > 0) {
    stats.averageTurnaround = Math.round(totalTurnaround / turnaroundCount);
  }

  if (stats.total > 0) {
    stats.completionRate = Math.round((stats.completed / stats.total) * 100);
  }

  return stats;
}

/**
 * Filter test orders
 */
export function filterTestOrders(orders, filters) {
  return orders.filter((order) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.patient.name.toLowerCase().includes(searchLower) ||
        order.patient.mrn.toLowerCase().includes(searchLower) ||
        order.tests.some((t) => t.name.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && order.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all' && order.priority !== filters.priority) {
      return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const hasCategory = order.tests.some((t) => t.category === filters.category);
      if (!hasCategory) return false;
    }

    return true;
  });
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate total price for tests
 */
export function calculateTestsTotal(tests) {
  return tests.reduce((sum, test) => sum + (test.price || 0), 0);
}
