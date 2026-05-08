import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { transition } from '@/lib/order-machine';
import type { OrderStatus } from '@/lib/order-machine';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        tokenKeys: {
          select: {
            id: true,
            keyValue: true,
            keyType: true,
            status: true,
            expireAt: true,
            soldAt: true,
          },
        },
        user: {
          select: { id: true, nickname: true, phone: true, email: true },
        },
        userCoupon: {
          include: { coupon: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(errorResponse('订单不存在'), { status: 404 });
    }

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return NextResponse.json(errorResponse('获取订单详情失败'), { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(errorResponse('缺少状态参数'), { status: 400 });
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

    // Update with side effects
    const updateData: Record<string, unknown> = { status };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        payments: true,
        tokenKeys: {
          select: { id: true, keyValue: true, keyType: true, status: true },
        },
        user: {
          select: { id: true, nickname: true, phone: true },
        },
      },
    });

    // Auto-create settlement when order completes
    if (status === 'COMPLETED') {
      const existingSettlement = await prisma.settlement.findFirst({ where: { orderId: id } });
      if (!existingSettlement) {
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

    return NextResponse.json(successResponse(order));
  } catch (error) {
    return NextResponse.json(errorResponse('更新订单失败'), { status: 500 });
  }
}
