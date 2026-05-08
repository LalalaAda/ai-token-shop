import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/types';
import { z } from 'zod';

const createReviewSchema = z.object({
  productId: z.string().uuid('无效的商品ID'),
  rating: z.number().int().min(1, '评分最低为1').max(5, '评分最高为5'),
  content: z.string().min(1, '评价内容为必填').max(1000, '评价内容不能超过1000字'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('请先登录'), { status: 401 });
    }

    const body = await request.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { productId, rating, content } = result.data;

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(errorResponse('商品不存在'), { status: 404 });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
    if (existing) {
      return NextResponse.json(errorResponse('您已经评价过该商品'), { status: 409 });
    }

    // Check user has purchased this product
    const hasOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        items: { some: { productId } },
      },
    });
    if (!hasOrder) {
      return NextResponse.json(errorResponse('请先购买该商品后再评价'), { status: 403 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        content,
      },
      include: {
        user: {
          select: { id: true, nickname: true, avatar: true },
        },
      },
    });

    return NextResponse.json(successResponse(review), { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(errorResponse('创建评价失败'), { status: 500 });
  }
}
