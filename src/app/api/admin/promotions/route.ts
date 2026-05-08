import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { z } from 'zod';

const createPromotionSchema = z.object({
  name: z.string().min(1, '活动名称为必填'),
  type: z.enum(['SECKILL', 'GROUPBUY', 'FULL_REDUCE']),
  startAt: z.string().min(1, '开始时间为必填'),
  endAt: z.string().min(1, '结束时间为必填'),
  rules: z.object({
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    minAmount: z.number().min(0).optional(),
    groupSize: z.number().int().min(2).optional(),
    maxQuantity: z.number().int().min(1).optional(),
  }),
  productIds: z.array(z.string().uuid()).min(1, '至少选择一个商品'),
});

const updatePromotionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  type: z.enum(['SECKILL', 'GROUPBUY', 'FULL_REDUCE']).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED']).optional(),
  rules: z.object({
    discountPercent: z.number().min(0).max(100).optional(),
    discountAmount: z.number().min(0).optional(),
    minAmount: z.number().min(0).optional(),
    groupSize: z.number().int().min(2).optional(),
    maxQuantity: z.number().int().min(1).optional(),
  }).optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        include: {
          products: {
            select: { id: true, name: true, slug: true, sellingPrice: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.promotion.count({ where }),
    ]);

    return NextResponse.json(successResponse({
      promotions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('Get promotions error:', error);
    return NextResponse.json(errorResponse('获取促销活动列表失败'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createPromotionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { name, type, startAt, endAt, rules, productIds } = result.data;

    const promotion = await prisma.promotion.create({
      data: {
        name,
        type,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        rules,
        products: {
          connect: productIds.map((id) => ({ id })),
        },
      },
      include: {
        products: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(successResponse(promotion), { status: 201 });
  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json(errorResponse('创建促销活动失败'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updatePromotionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { id, productIds, ...updateData } = result.data;
    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.type !== undefined) data.type = updateData.type;
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.rules !== undefined) data.rules = updateData.rules;
    if (updateData.startAt !== undefined) data.startAt = new Date(updateData.startAt);
    if (updateData.endAt !== undefined) data.endAt = new Date(updateData.endAt);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...data,
        ...(productIds ? {
          products: {
            set: productIds.map((id) => ({ id })),
          },
        } : {}),
      },
      include: {
        products: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(successResponse(promotion));
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json(errorResponse('更新促销活动失败'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(errorResponse('缺少活动ID'), { status: 400 });
    }

    // Disconnect products first then delete
    await prisma.promotion.update({
      where: { id },
      data: { products: { set: [] } },
    });
    await prisma.promotion.delete({ where: { id } });

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json(errorResponse('删除促销活动失败'), { status: 500 });
  }
}
