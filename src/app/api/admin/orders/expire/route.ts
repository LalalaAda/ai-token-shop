import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

/**
 * POST /api/admin/orders/expire
 * Finds all PENDING orders past their expireAt and cancels them.
 * Can be called by a cron job (e.g., every 5 minutes).
 */
export async function POST() {
  try {
    const now = new Date();

    // Find all expired PENDING orders
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        expireAt: {
          not: null,
          lt: now,
        },
      },
      select: {
        id: true,
        orderNo: true,
      },
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json(successResponse({
        cancelledCount: 0,
        cancelledOrders: [],
        message: '没有需要取消的过期订单',
      }));
    }

    // Cancel all expired orders
    const ids = expiredOrders.map((o: { id: string }) => o.id);

    await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json(successResponse({
      cancelledCount: expiredOrders.length,
      cancelledOrders: expiredOrders.map((o: { id: string; orderNo: string }) => o.orderNo),
      message: `成功取消 ${expiredOrders.length} 个过期订单`,
    }));
  } catch (error) {
    console.error('Order expiry error:', error);
    return NextResponse.json(errorResponse('处理过期订单失败'), { status: 500 });
  }
}
