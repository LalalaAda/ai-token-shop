import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Alipay callback
    const formData = await request.formData();
    const params = Object.fromEntries(formData.entries());

    // 1. Verify signature
    // 2. Check trade_status
    if (params.trade_status === 'TRADE_SUCCESS') {
      const { out_trade_no, trade_no, total_amount } = params;

      const order = await prisma.order.findUnique({
        where: { orderNo: out_trade_no as string },
      });

      if (order && order.status === 'PENDING') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID', paidAt: new Date() },
        });

        await prisma.payment.updateMany({
          where: { orderId: order.id, status: 'PENDING' },
          data: { status: 'SUCCESS', tradeNo: trade_no as string, paidAt: new Date() },
        });
      }
    }

    return new Response('success');
  } catch (error) {
    return new Response('fail');
  }
}
