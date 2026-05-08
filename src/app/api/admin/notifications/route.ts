import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET() {
  try {
    // Get all unread notification counts (aggregated, for admin monitoring)
    const [totalUnread, recentNotifications] = await Promise.all([
      prisma.notification.count({ where: { isRead: false } }),
      prisma.notification.findMany({
        where: { isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, nickname: true } },
        },
      }),
    ]);

    return NextResponse.json(successResponse({
      totalUnread,
      notifications: recentNotifications,
    }));
  } catch (error) {
    console.error('Admin notifications error:', error);
    return NextResponse.json(errorResponse('获取通知失败'), { status: 500 });
  }
}
