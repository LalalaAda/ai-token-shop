/**
 * Coupon validation logic - pure functions, no DB dependencies.
 */

export type CouponType = 'FIXED' | 'PERCENT';

export interface CouponData {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  value: number;
  minAmount: number;
  totalCount: number;
  usedCount: number;
  status: string;
  startAt: Date;
  endAt: Date;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message: string;
}

/**
 * Calculate discount for a given coupon and order amount.
 * Returns { valid, discount, message }.
 */
export function validateCoupon(
  coupon: CouponData,
  orderAmount: number,
  now: Date = new Date(),
): CouponValidationResult {
  // Check status
  if (coupon.status !== 'ACTIVE') {
    return { valid: false, discount: 0, message: '优惠券已失效' };
  }

  // Check date range
  if (now < coupon.startAt) {
    return { valid: false, discount: 0, message: '优惠券尚未开始' };
  }
  if (now > coupon.endAt) {
    return { valid: false, discount: 0, message: '优惠券已过期' };
  }

  // Check usage limit
  if (coupon.usedCount >= coupon.totalCount) {
    return { valid: false, discount: 0, message: '优惠券已被领完' };
  }

  // Check minimum amount
  if (orderAmount < coupon.minAmount) {
    return {
      valid: false,
      discount: 0,
      message: `订单金额需满 ¥${coupon.minAmount.toFixed(2)} 才能使用`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'FIXED') {
    discount = Math.min(coupon.value, orderAmount);
  } else if (coupon.type === 'PERCENT') {
    discount = Math.min(orderAmount * (coupon.value / 100), orderAmount);
  }

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    discount,
    message: `优惠券已应用，减免 ¥${discount.toFixed(2)}`,
  };
}
