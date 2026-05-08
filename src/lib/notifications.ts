import prisma from '@/lib/prisma';

export async function createNotification(params: {
  userId: string;
  type: 'ORDER_STATUS' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';
  title: string;
  message?: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    },
  });
}

export async function createOrderNotification(orderId: string, status: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      userId: true,
      orderNo: true,
      status: true,
    },
  });

  if (!order) return;

  const statusLabels: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    REFUNDING: '退款中',
    REFUNDED: '已退款',
  };

  const label = statusLabels[status] || status;
  const titleMap: Record<string, string> = {
    PAID: '支付成功通知',
    SHIPPED: '订单已发货',
    COMPLETED: '订单已完成',
    CANCELLED: '订单已取消',
    REFUNDING: '退款处理中',
    REFUNDED: '已退款',
  };

  const title = titleMap[status] || `订单状态更新`;
  const message = `订单 ${order.orderNo} 状态已更新为: ${label}`;

  return createNotification({
    userId: order.userId,
    type: 'ORDER_STATUS',
    title,
    message,
    link: `/shop/user/orders`,
  });
}
