import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getAllowedTransitions,
  transition,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  type OrderStatus,
} from './order-machine';

describe('Order State Machine', () => {
  describe('canTransition', () => {
    it.each([
      // PENDING
      ['PENDING', 'PAID', true],
      ['PENDING', 'CANCELLED', true],
      ['PENDING', 'SHIPPED', false],
      ['PENDING', 'COMPLETED', false],
      ['PENDING', 'REFUNDING', false],
      ['PENDING', 'REFUNDED', false],
      // PAID
      ['PAID', 'SHIPPED', true],
      ['PAID', 'REFUNDING', true],
      ['PAID', 'PENDING', false],
      ['PAID', 'COMPLETED', false],
      ['PAID', 'CANCELLED', false],
      // SHIPPED
      ['SHIPPED', 'COMPLETED', true],
      ['SHIPPED', 'REFUNDING', true],
      ['SHIPPED', 'PAID', false],
      ['SHIPPED', 'PENDING', false],
      // COMPLETED
      ['COMPLETED', 'REFUNDING', true],
      ['COMPLETED', 'SHIPPED', false],
      ['COMPLETED', 'PENDING', false],
      // REFUNDING
      ['REFUNDING', 'REFUNDED', true],
      ['REFUNDING', 'SHIPPED', true],
      ['REFUNDING', 'PAID', false],
      ['REFUNDING', 'PENDING', false],
      // CANCELLED - terminal
      ['CANCELLED', 'PENDING', false],
      ['CANCELLED', 'PAID', false],
      ['CANCELLED', 'REFUNDED', false],
      // REFUNDED - terminal
      ['REFUNDED', 'PENDING', false],
      ['REFUNDED', 'CANCELLED', false],
      ['REFUNDED', 'REFUNDING', false],
    ] as [OrderStatus, OrderStatus, boolean][])(
      'returns %s for %s → %s',
      (current, next, expected) => {
        expect(canTransition(current as OrderStatus, next as OrderStatus)).toBe(expected);
      }
    );
  });

  describe('getAllowedTransitions', () => {
    it('returns correct next statuses for PENDING', () => {
      expect(getAllowedTransitions('PENDING')).toEqual(['PAID', 'CANCELLED']);
    });

    it('returns empty array for CANCELLED (terminal)', () => {
      expect(getAllowedTransitions('CANCELLED')).toEqual([]);
    });

    it('returns empty array for REFUNDED (terminal)', () => {
      expect(getAllowedTransitions('REFUNDED')).toEqual([]);
    });

    it('returns correct next statuses for PAID', () => {
      expect(getAllowedTransitions('PAID')).toEqual(['SHIPPED', 'REFUNDING']);
    });

    it('returns correct next statuses for SHIPPED', () => {
      expect(getAllowedTransitions('SHIPPED')).toEqual(['COMPLETED', 'REFUNDING']);
    });

    it('returns a copy (immutable)', () => {
      const transitions = getAllowedTransitions('PENDING');
      transitions.push('SHIPPED' as OrderStatus);
      // Should not affect subsequent calls
      expect(getAllowedTransitions('PENDING')).toEqual(['PAID', 'CANCELLED']);
    });
  });

  describe('transition', () => {
    it('returns the next status on valid transition', () => {
      expect(transition('PENDING', 'PAID')).toBe('PAID');
      expect(transition('PAID', 'SHIPPED')).toBe('SHIPPED');
      expect(transition('SHIPPED', 'COMPLETED')).toBe('COMPLETED');
      expect(transition('REFUNDING', 'REFUNDED')).toBe('REFUNDED');
    });

    it('throws on invalid transition', () => {
      expect(() => transition('PENDING', 'COMPLETED')).toThrow('无效的订单状态变更');
      expect(() => transition('CANCELLED', 'PENDING')).toThrow('无效的订单状态变更');
      expect(() => transition('COMPLETED', 'PAID')).toThrow('无效的订单状态变更');
    });
  });

  describe('ORDER_STATUS_LABELS', () => {
    it('has Chinese labels for all statuses', () => {
      const expected: Record<OrderStatus, string> = {
        PENDING: '待支付',
        PAID: '已支付',
        SHIPPED: '已发货',
        COMPLETED: '已完成',
        CANCELLED: '已取消',
        REFUNDING: '退款中',
        REFUNDED: '已退款',
      };
      expect(ORDER_STATUS_LABELS).toEqual(expected);
    });
  });

  describe('ORDER_STATUS_COLORS', () => {
    it('has color classes for all statuses', () => {
      const statuses: OrderStatus[] = [
        'PENDING', 'PAID', 'SHIPPED', 'COMPLETED',
        'CANCELLED', 'REFUNDING', 'REFUNDED',
      ];
      for (const s of statuses) {
        expect(ORDER_STATUS_COLORS[s]).toMatch(/^bg-/);
      }
    });
  });

  describe('full lifecycle scenarios', () => {
    it('happy path: PENDING → PAID → SHIPPED → COMPLETED', () => {
      let status: OrderStatus = 'PENDING';
      status = transition(status, 'PAID');
      expect(status).toBe('PAID');
      status = transition(status, 'SHIPPED');
      expect(status).toBe('SHIPPED');
      status = transition(status, 'COMPLETED');
      expect(status).toBe('COMPLETED');
    });

    it('refund after completion: COMPLETED → REFUNDING → REFUNDED', () => {
      let status: OrderStatus = 'PENDING';
      status = transition(status, 'PAID');
      status = transition(status, 'SHIPPED');
      status = transition(status, 'COMPLETED');
      status = transition(status, 'REFUNDING');
      expect(status).toBe('REFUNDING');
      status = transition(status, 'REFUNDED');
      expect(status).toBe('REFUNDED');
    });

    it('reject refund: REFUNDING → SHIPPED', () => {
      let status: OrderStatus = 'PENDING';
      status = transition(status, 'PAID');
      status = transition(status, 'SHIPPED');
      status = transition(status, 'REFUNDING');
      status = transition(status, 'SHIPPED');
      expect(status).toBe('SHIPPED');
    });

    it('cancel before payment: PENDING → CANCELLED', () => {
      const status = transition('PENDING', 'CANCELLED');
      expect(status).toBe('CANCELLED');
    });

    it('terminal states reject all transitions', () => {
      expect(() => transition('CANCELLED', 'PENDING')).toThrow();
      expect(() => transition('REFUNDED', 'PENDING')).toThrow();
    });
  });
});
