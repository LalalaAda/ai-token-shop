import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(errorResponse('商品不存在'), { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: id },
        include: {
          user: {
            select: { id: true, nickname: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { productId: id } }),
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Rating distribution
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      distribution[r.rating - 1]++;
    });

    return NextResponse.json(successResponse({
      reviews,
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      distribution,
    }));
  } catch (error) {
    console.error('Get product reviews error:', error);
    return NextResponse.json(errorResponse('获取评价失败'), { status: 500 });
  }
}
