import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/types';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json(errorResponse('缺少必要参数'), { status: 400 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCESS',
        tradeNo: `DEMO_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Update product sales count
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { salesCount: { increment: item.quantity } },
        });
      }
    }

    return NextResponse.json(successResponse({ success: true }));
  } catch (error) {
    return NextResponse.json(errorResponse('处理支付失败'), { status: 500 });
  }
}