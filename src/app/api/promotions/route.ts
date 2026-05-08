import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET() {
  try {
    const now = new Date();

    const promotions = await prisma.promotion.findMany({
      where: {
        status: 'ACTIVE',
        startAt: { lte: now },
        endAt: { gte: now },
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            slug: true,
            sellingPrice: true,
            originalPrice: true,
            coverImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(successResponse({ promotions }));
  } catch (error) {
    console.error('Get active promotions error:', error);
    return NextResponse.json(errorResponse('获取促销活动失败'), { status: 500 });
  }
}
