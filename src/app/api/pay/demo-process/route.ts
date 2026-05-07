import { NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/types';
import prisma from '@/lib/prisma';

// 发放卡密函数
async function distributeTokens(orderId: string) {
  // 获取订单详情
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw new Error('订单不存在');
  }

  const distributedTokens = [];

  // 为每个订单项分配卡密
  for (const item of order.items) {
    const quantity = item.quantity;

    // 查找可用卡密
    const availableTokens = await prisma.tokenKey.findMany({
      where: {
        productId: item.productId,
        status: 'UNUSED',
        // 检查是否过期
        OR: [
          { expireAt: null },
          { expireAt: { gt: new Date() } },
        ],
      },
      take: quantity,
    });

    if (availableTokens.length < quantity) {
      console.warn(`商品 ${item.productName} 库存不足，需要 ${quantity} 个，只有 ${availableTokens.length} 个`);
    }

    // 分配卡密
    for (const token of availableTokens) {
      await prisma.tokenKey.update({
        where: { id: token.id },
        data: {
          status: 'SOLD',
          orderId: orderId,
          soldAt: new Date(),
        },
      });
      distributedTokens.push(token);
    }

    // 更新商品销量和库存
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        salesCount: { increment: availableTokens.length },
        availableStock: { decrement: availableTokens.length },
      },
    });
  }

  return distributedTokens;
}

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

    // 更新商品销量
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

    // 发放卡密
    const distributedTokens = await distributeTokens(orderId);

    return NextResponse.json(successResponse({ 
      success: true,
      tokensCount: distributedTokens.length,
    }));
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(errorResponse('处理支付失败'), { status: 500 });
  }
}