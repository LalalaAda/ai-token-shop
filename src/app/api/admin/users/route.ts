import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const memberLevel = searchParams.get('memberLevel');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (memberLevel) where.memberLevel = parseInt(memberLevel);
    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nickname: true,
          avatar: true,
          phone: true,
          email: true,
          memberLevel: true,
          openid: true,
          status: true,
          createdAt: true,
          orders: { select: { id: true, payAmount: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithStats = users.map((user: { 
      id: string;
      nickname: string | null;
      phone: string | null;
      createdAt: Date;
      status: string;
      orders: { payAmount: unknown }[];
    }) => ({
      ...user,
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, o) => sum + Number(o.payAmount), 0),
    }));

    return NextResponse.json(successResponse({
      users: usersWithStats,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    return NextResponse.json(errorResponse('获取用户列表失败'), { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, memberLevel } = body;

    if (!id) {
      return NextResponse.json(errorResponse('缺少用户ID'), { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (memberLevel !== undefined) updateData.memberLevel = memberLevel;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(successResponse(user));
  } catch (error) {
    return NextResponse.json(errorResponse('更新用户失败'), { status: 500 });
  }
}