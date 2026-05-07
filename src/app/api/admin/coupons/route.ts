import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { z } from 'zod';

const createCouponSchema = z.object({
  name: z.string().min(1, '优惠券名称为必填'),
  code: z.string().min(1, '优惠码为必填').max(50),
  type: z.enum(['FIXED', 'PERCENT']),
  value: z.number().positive('优惠金额必须大于0'),
  minAmount: z.number().min(0, '最低消费不能为负数').default(0),
  totalCount: z.number().int().min(1, '发行数量至少为1'),
  startAt: z.string().min(1, '开始时间为必填'),
  endAt: z.string().min(1, '结束时间为必填'),
});

const updateCouponSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  code: z.string().min(1).max(50).optional(),
  type: z.enum(['FIXED', 'PERCENT']).optional(),
  value: z.number().positive().optional(),
  minAmount: z.number().min(0).optional(),
  totalCount: z.number().int().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json(successResponse({
      coupons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(errorResponse('获取优惠券列表失败'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createCouponSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { name, code, type, value, minAmount, totalCount, startAt, endAt } = result.data;

    // Check if coupon code already exists
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(errorResponse('优惠码已存在'), { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        name,
        code,
        type,
        value,
        minAmount,
        totalCount,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
      },
    });

    return NextResponse.json(successResponse(coupon), { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json(errorResponse('创建优惠券失败'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateCouponSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { id, ...updateData } = result.data;
    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.code !== undefined) data.code = updateData.code;
    if (updateData.type !== undefined) data.type = updateData.type;
    if (updateData.value !== undefined) data.value = updateData.value;
    if (updateData.minAmount !== undefined) data.minAmount = updateData.minAmount;
    if (updateData.totalCount !== undefined) data.totalCount = updateData.totalCount;
    if (updateData.status !== undefined) data.status = updateData.status;
    if (updateData.startAt !== undefined) data.startAt = new Date(updateData.startAt);
    if (updateData.endAt !== undefined) data.endAt = new Date(updateData.endAt);

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    return NextResponse.json(successResponse(coupon));
  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json(errorResponse('更新优惠券失败'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(errorResponse('缺少优惠券ID'), { status: 400 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(errorResponse('删除优惠券失败'), { status: 500 });
  }
}
