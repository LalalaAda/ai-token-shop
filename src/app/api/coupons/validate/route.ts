import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { validateCoupon } from '@/lib/coupon-validator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(errorResponse('请输入优惠码'), { status: 400 });
    }
    if (!orderAmount || orderAmount <= 0) {
      return NextResponse.json(errorResponse('无效的订单金额'), { status: 400 });
    }

    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(successResponse({
        valid: false,
        discount: 0,
        message: '优惠码不存在',
      }));
    }

    // Validate using pure logic
    const result = validateCoupon(
      {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type as 'FIXED' | 'PERCENT',
        value: Number(coupon.value),
        minAmount: Number(coupon.minAmount),
        totalCount: coupon.totalCount,
        usedCount: coupon.usedCount,
        status: coupon.status,
        startAt: coupon.startAt,
        endAt: coupon.endAt,
      },
      orderAmount,
    );

    return NextResponse.json(successResponse({
      ...result,
      couponId: result.valid ? coupon.id : null,
      couponName: result.valid ? coupon.name : null,
    }));
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json(errorResponse('验证优惠券失败'), { status: 500 });
  }
}
