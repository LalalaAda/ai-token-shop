import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('请先登录'), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = { userId: session.user.id };
    if (unreadOnly) Object.assign(where, { isRead: false });

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.user.id, isRead: false },
      }),
    ]);

    return NextResponse.json(successResponse({
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(errorResponse('获取通知失败'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('请先登录'), { status: 401 });
    }

    const body = await request.json();
    const { id, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json(successResponse({ marked: true }));
    }

    if (!id) {
      return NextResponse.json(errorResponse('缺少通知ID'), { status: 400 });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(successResponse({ marked: true }));
  } catch (error) {
    console.error('Mark notification error:', error);
    return NextResponse.json(errorResponse('操作失败'), { status: 500 });
  }
}
