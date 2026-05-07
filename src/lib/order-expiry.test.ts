import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {
  filterExpiredOrders,
  buildCancelMutations,
  getRemainingSeconds,
  type ExpiredOrder,
} from './order-expiry';

describe('Order Expiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('filterExpiredOrders', () => {
    it('returns empty when no orders are provided', () => {
      const result = filterExpiredOrders([]);
      expect(result).toEqual([]);
    });

    it('filters out non-PENDING orders', () => {
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PAID', expireAt: new Date('2020-01-01'), createdAt: new Date() },
        { id: '2', orderNo: 'ORD002', status: 'CANCELLED', expireAt: new Date('2020-01-01'), createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(0);
    });

    it('filters out PENDING orders without expireAt', () => {
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PENDING', expireAt: null, createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(0);
    });

    it('filters out PENDING orders with future expireAt', () => {
      const future = new Date(Date.now() + 3600_000); // 1 hour later
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PENDING', expireAt: future, createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(0);
    });

    it('returns PENDING orders with past expireAt', () => {
      const past = new Date(Date.now() - 60_000); // 1 minute ago
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PENDING', expireAt: past, createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('handles mixed orders correctly', () => {
      const past = new Date(Date.now() - 60_000);
      const future = new Date(Date.now() + 3600_000);
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PENDING', expireAt: past, createdAt: new Date() },
        { id: '2', orderNo: 'ORD002', status: 'PENDING', expireAt: future, createdAt: new Date() },
        { id: '3', orderNo: 'ORD003', status: 'PAID', expireAt: past, createdAt: new Date() },
        { id: '4', orderNo: 'ORD004', status: 'PENDING', expireAt: null, createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('uses fake timer for precise boundary testing', () => {
      vi.setSystemTime(new Date('2026-05-07T12:00:00Z'));
      const past = new Date('2026-05-07T11:59:00Z'); // 1 minute ago
      const orders: ExpiredOrder[] = [
        { id: '1', orderNo: 'ORD001', status: 'PENDING', expireAt: past, createdAt: new Date() },
      ];
      const result = filterExpiredOrders(orders);
      expect(result).toHaveLength(1);
    });
  });

  describe('buildCancelMutations', () => {
    it('returns empty array for empty input', () => {
      const result = buildCancelMutations([]);
      expect(result).toEqual([]);
    });

    it('builds mutations with correct shape', () => {
      const orders: ExpiredOrder[] = [
        { id: 'abc', orderNo: 'ORD001', status: 'PENDING', expireAt: new Date(), createdAt: new Date() },
        { id: 'def', orderNo: 'ORD002', status: 'PENDING', expireAt: new Date(), createdAt: new Date() },
      ];
      const result = buildCancelMutations(orders);
      expect(result).toEqual([
        { id: 'abc', orderNo: 'ORD001', newStatus: 'CANCELLED' },
        { id: 'def', orderNo: 'ORD002', newStatus: 'CANCELLED' },
      ]);
    });
  });

  describe('getRemainingSeconds', () => {
    it('returns 0 for non-PENDING orders', () => {
      const result = getRemainingSeconds({ status: 'PAID', expireAt: new Date(Date.now() + 60_000) });
      expect(result).toBe(0);
    });

    it('returns 0 when no expireAt', () => {
      const result = getRemainingSeconds({ status: 'PENDING', expireAt: null });
      expect(result).toBe(0);
    });

    it('returns remaining seconds for a PENDING order with future expireAt', () => {
      const oneMinuteFromNow = new Date(Date.now() + 60_000);
      const result = getRemainingSeconds({ status: 'PENDING', expireAt: oneMinuteFromNow });
      expect(result).toBe(60);
    });

    it('returns 0 when already expired', () => {
      const past = new Date(Date.now() - 10_000);
      const result = getRemainingSeconds({ status: 'PENDING', expireAt: past });
      expect(result).toBe(0);
    });
  });
});
