import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.return_code === 'SUCCESS' && body.result_code === 'SUCCESS') {
      const { out_trade_no, transaction_id } = body;

      const order = await prisma.order.findUnique({
        where: { orderNo: out_trade_no },
        include: { items: true },
      });

      if (order && order.status === 'PENDING') {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID', paidAt: new Date() },
          }),
          prisma.payment.updateMany({
            where: { orderId: order.id, status: 'PENDING' },
            data: { status: 'SUCCESS', tradeNo: transaction_id, paidAt: new Date() },
          }),
        ]);
      }
    }

    return new Response('<xml><return_code>SUCCESS</return_code><return_msg>OK</return_msg></xml>');
  } catch (error) {
    return new Response('<xml><return_code>FAIL</return_code></xml>');
  }
}
