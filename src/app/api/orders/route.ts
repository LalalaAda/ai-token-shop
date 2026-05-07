import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { generateOrderNo } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, couponId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(errorResponse('订单商品不能为空'), { status: 400 });
    }

    const orderNo = generateOrderNo();

    // Use transaction: create order + update coupon usage count
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNo,
          userId: body.userId,
          totalAmount: body.totalAmount,
          payAmount: body.payAmount,
          discountAmount: body.discountAmount || 0,
          expireAt: new Date(Date.now() + 30 * 60 * 1000),
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          },
        },
        include: { items: true },
      });

      // If coupon was used, increment its usage count
      if (couponId && body.discountAmount > 0) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return order;
    });

    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(errorResponse('创建订单失败'), { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(errorResponse('缺少用户ID'), { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json(successResponse(orders));
  } catch (error) {
    return NextResponse.json(errorResponse('获取订单失败'), { status: 500 });
  }
}
