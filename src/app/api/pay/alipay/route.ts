import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderNo } = body;

    const order = await prisma.order.findUnique({
      where: orderId ? { id: orderId } : { orderNo: orderNo },
    });

    if (!order) {
      return NextResponse.json(errorResponse('订单不存在'), { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(errorResponse('订单状态异常'), { status: 400 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        amount: order.payAmount,
        channel: 'ALIPAY',
        status: 'PENDING',
      },
    });

    // TODO: In production, integrate with Alipay SDK
    // const payUrl = await alipay.createOrder({ 
    //   outTradeNo: order.orderNo,
    //   totalAmount: Number(order.payAmount),
    //   subject: order.items.map(i => i.productName).join(', '),
    // })

    // Demo mode: return mock payment URL
    const payUrl = `/api/pay/alipay/demo?orderId=${order.id}&paymentId=${payment.id}`;
    
    return NextResponse.json(successResponse({
      paymentId: payment.id,
      payUrl,
      orderNo: order.orderNo,
    }));
  } catch (error) {
    return NextResponse.json(errorResponse('发起支付失败'), { status: 500 });
  }
}
