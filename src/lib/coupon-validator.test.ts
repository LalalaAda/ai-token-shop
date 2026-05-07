import { describe, it, expect } from 'vitest';
import { validateCoupon, type CouponData } from './coupon-validator';

function makeCoupon(overrides: Partial<CouponData> = {}): CouponData {
  return {
    id: 'c001',
    code: 'TEST20',
    name: 'Test Coupon',
    type: 'FIXED',
    value: 20,
    minAmount: 50,
    totalCount: 100,
    usedCount: 0,
    status: 'ACTIVE',
    startAt: new Date('2026-01-01'),
    endAt: new Date('2026-12-31'),
    ...overrides,
  };
}

describe('Coupon Validator', () => {
  const now = new Date('2026-06-15');

  describe('INACTIVE coupon', () => {
    it('rejects coupon with INACTIVE status', () => {
      const coupon = makeCoupon({ status: 'INACTIVE' });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(false);
      expect(result.discount).toBe(0);
      expect(result.message).toContain('已失效');
    });
  });

  describe('date range', () => {
    it('rejects coupon before start date', () => {
      const coupon = makeCoupon({ startAt: new Date('2026-07-01'), endAt: new Date('2026-12-31') });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('尚未开始');
    });

    it('rejects coupon after end date', () => {
      const coupon = makeCoupon({ startAt: new Date('2026-01-01'), endAt: new Date('2026-05-01') });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('已过期');
    });

    it('accepts coupon within date range', () => {
      const coupon = makeCoupon();
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(true);
    });
  });

  describe('usage limit', () => {
    it('rejects coupon when all used', () => {
      const coupon = makeCoupon({ totalCount: 50, usedCount: 50 });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('领完');
    });

    it('accepts coupon when not fully used', () => {
      const coupon = makeCoupon({ totalCount: 100, usedCount: 50 });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(true);
    });
  });

  describe('minimum amount', () => {
    it('rejects coupon when order amount is below minimum', () => {
      const coupon = makeCoupon({ minAmount: 100 });
      const result = validateCoupon(coupon, 50, now);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('满');
    });

    it('accepts coupon when order amount meets minimum', () => {
      const coupon = makeCoupon({ minAmount: 100 });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(true);
    });

    it('accepts coupon when order amount exceeds minimum', () => {
      const coupon = makeCoupon({ minAmount: 50 });
      const result = validateCoupon(coupon, 200, now);
      expect(result.valid).toBe(true);
    });
  });

  describe('FIXED discount calculation', () => {
    it('applies full fixed discount when order exceeds value', () => {
      const coupon = makeCoupon({ type: 'FIXED', value: 20 });
      const result = validateCoupon(coupon, 100, now);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(20);
    });

    it('caps fixed discount at order amount', () => {
      const coupon = makeCoupon({ type: 'FIXED', value: 50, minAmount: 0 });
      const result = validateCoupon(coupon, 30, now);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(30);
    });
  });

  describe('PERCENT discount calculation', () => {
    it('applies percentage discount correctly (15% off $200)', () => {
      const coupon = makeCoupon({ type: 'PERCENT', value: 15 });
      const result = validateCoupon(coupon, 200, now);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(30); // 15% of 200 = 30
    });

    it('caps percentage discount at order amount', () => {
      const coupon = makeCoupon({ type: 'PERCENT', value: 90, minAmount: 0 });
      const result = validateCoupon(coupon, 10, now);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(9); // 90% of 10 = 9, capped at 10
    });
  });

  describe('zero minimum amount', () => {
    it('allows coupon with no minimum', () => {
      const coupon = makeCoupon({ minAmount: 0 });
      const result = validateCoupon(coupon, 10, now);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(10); // $10 order, $20 fixed capped at $10
    });
  });
});
