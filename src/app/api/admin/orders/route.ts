import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { transition } from '@/lib/order-machine';
import type { OrderStatus } from '@/lib/order-machine';
import { createOrderNotification } from '@/lib/notifications';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { select: { productName: true, quantity: true, unitPrice: true } },
          payments: { select: { channel: true, status: true } },
          user: { select: { nickname: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json(successResponse({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    return NextResponse.json(errorResponse('获取订单列表失败'), { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(errorResponse('缺少必要参数'), { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(errorResponse('订单不存在'), { status: 404 });
    }

    // Validate state machine transition
    try {
      transition(existing.status as OrderStatus, status as OrderStatus);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '无效的状态变更';
      return NextResponse.json(errorResponse(message), { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Auto-create settlement when order completes
    if (status === 'COMPLETED') {
      const existing = await prisma.settlement.findFirst({ where: { orderId: id } });
      if (!existing) {
        const platformRatio = 0.8;
        const payAmount = Number(order.payAmount);
        await prisma.settlement.create({
          data: {
            orderId: id,
            platformAmount: payAmount * platformRatio,
            supplierAmount: payAmount * (1 - platformRatio),
            status: 'PENDING',
          },
        });
      }
    }

    // Create notification for user
    if (['PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED', 'REFUNDING', 'REFUNDED'].includes(status)) {
      try {
        await createOrderNotification(id, status);
      } catch (e) {
        console.error('Create notification error:', e);
      }
    }

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return NextResponse.json(errorResponse('更新订单失败'), { status: 500 });
  }
}