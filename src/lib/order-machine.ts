/**
 * Order state machine - pure logic, no DB dependencies.
 * Validates and processes order status transitions.
 */

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDING'
  | 'REFUNDED';

/** Human-readable labels for each status */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
};

/** CSS color classes for each status */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDING: 'bg-orange-100 text-orange-700',
  REFUNDED: 'bg-red-100 text-red-700',
};

/** Valid transitions: from → allowed next statuses */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'REFUNDING'],
  SHIPPED: ['COMPLETED', 'REFUNDING'],
  COMPLETED: ['REFUNDING'],
  REFUNDING: ['REFUNDED', 'SHIPPED'],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Returns true if transitioning from `current` to `next` is valid.
 */
export function canTransition(current: OrderStatus, next: OrderStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Returns the list of allowed next statuses from the given current status.
 */
export function getAllowedTransitions(current: OrderStatus): OrderStatus[] {
  return [...(VALID_TRANSITIONS[current] ?? [])];
}

/**
 * Validate and transition. Returns the new status on success,
 * or throws a descriptive error on invalid transition.
 */
export function transition(current: OrderStatus, next: OrderStatus): OrderStatus {
  if (!canTransition(current, next)) {
    throw new Error(
      `无效的订单状态变更: 不能从「${ORDER_STATUS_LABELS[current]}」变更为「${ORDER_STATUS_LABELS[next]}」`
    );
  }
  return next;
}
