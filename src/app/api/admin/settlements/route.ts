import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { z } from 'zod';

const updateSettlementSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED']),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [settlements, total] = await Promise.all([
      prisma.settlement.findMany({
        where,
        include: {
          order: {
            select: { id: true, orderNo: true, payAmount: true, paidAt: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.settlement.count({ where }),
    ]);

    // Summary stats
    const [pendingCount, processingCount, completedCount] = await Promise.all([
      prisma.settlement.count({ where: { status: 'PENDING' } }),
      prisma.settlement.count({ where: { status: 'PROCESSING' } }),
      prisma.settlement.count({ where: { status: 'COMPLETED' } }),
    ]);

    const totalPlatform = settlements
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + Number(s.platformAmount), 0);
    const totalSupplier = settlements
      .filter(s => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + Number(s.supplierAmount), 0);

    return NextResponse.json(successResponse({
      settlements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        pendingCount,
        processingCount,
        completedCount,
        totalPlatform,
        totalSupplier,
      },
    }));
  } catch (error) {
    console.error('Get settlements error:', error);
    return NextResponse.json(errorResponse('获取结算记录失败'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateSettlementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { id, status } = result.data;

    const settlement = await prisma.settlement.update({
      where: { id },
      data: { status },
      include: {
        order: {
          select: { id: true, orderNo: true },
        },
      },
    });

    return NextResponse.json(successResponse(settlement));
  } catch (error) {
    console.error('Update settlement error:', error);
    return NextResponse.json(errorResponse('更新结算记录失败'), { status: 500 });
  }
}
