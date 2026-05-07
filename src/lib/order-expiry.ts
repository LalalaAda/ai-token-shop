/**
 * Order expiry logic - finds and cancels PENDING orders past their expireAt time.
 * Pure logic (no DB), relies on the caller to provide data and execute mutations.
 */

import { canTransition } from './order-machine';

export interface ExpiredOrder {
  id: string;
  orderNo: string;
  status: string;
  expireAt: Date | null;
  createdAt: Date;
}

export interface ExpiryResult {
  cancelledCount: number;
  cancelledOrders: string[];
  errors: string[];
}

/**
 * Filter expired PENDING orders from a list of orders.
 * An order is expired if:
 * 1. status is 'PENDING'
 * 2. expireAt is set and is in the past
 * 3. PENDING → CANCELLED is a valid transition
 */
export function filterExpiredOrders(orders: ExpiredOrder[]): ExpiredOrder[] {
  const now = new Date();
  return orders.filter((order) => {
    if (order.status !== 'PENDING') return false;
    if (!order.expireAt) return false;
    if (order.expireAt > now) return false;
    if (!canTransition('PENDING', 'CANCELLED')) return false;
    return true;
  });
}

/**
 * Build an array of cancel mutations for the caller to execute.
 * Each mutation contains the order data and the target status.
 * This keeps the function pure (no side effects).
 */
export function buildCancelMutations(
  orders: ExpiredOrder[],
): { id: string; orderNo: string; newStatus: string }[] {
  return orders.map((order) => ({
    id: order.id,
    orderNo: order.orderNo,
    newStatus: 'CANCELLED',
  }));
}

/**
 * Calculate remaining seconds before an order expires.
 * Returns 0 if already expired or no expireAt set.
 */
export function getRemainingSeconds(order: {
  status: string;
  expireAt: Date | null;
}): number {
  if (order.status !== 'PENDING' || !order.expireAt) return 0;
  const remaining = order.expireAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / 1000));
}
