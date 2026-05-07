import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    if (type === 'overview') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const [
        totalOrders, todayOrders, yesterdayOrders,
        totalUsers, todayUsers, yesterdayUsers,
        totalProducts,
        todayRevenue, yesterdayRevenue, totalRevenue,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: today } } }),
        prisma.order.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: today } } }),
        prisma.user.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
        prisma.product.count({ where: { status: 'ONLINE' } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: today } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: yesterday, lt: today } }, _sum: { amount: true } }),
        prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      ]);

      const todayRev = Number(todayRevenue._sum.amount || 0);
      const yesterdayRev = Number(yesterdayRevenue._sum.amount || 0);

      const orderChange = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(1) : todayOrders > 0 ? '100.0' : '0.0';
      const userChange = yesterdayUsers > 0 ? ((todayUsers - yesterdayUsers) / yesterdayUsers * 100).toFixed(1) : todayUsers > 0 ? '100.0' : '0.0';
      const revenueChange = yesterdayRev > 0 ? ((todayRev - yesterdayRev) / yesterdayRev * 100).toFixed(1) : todayRev > 0 ? '100.0' : '0.0';

      return NextResponse.json(successResponse({
        totalOrders,
        todayOrders,
        orderChange,
        totalUsers,
        todayUsers,
        userChange,
        totalProducts,
        todayRevenue: todayRev,
        revenueChange,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
      }));
    }

    if (type === 'topProducts') {
      const topProducts = await prisma.product.findMany({
        where: { status: 'ONLINE' },
        orderBy: { salesCount: 'desc' },
        take: 5,
        select: { name: true, salesCount: true },
      });

      const maxSales = topProducts.length > 0 ? topProducts[0].salesCount : 1;

      return NextResponse.json(successResponse(
        topProducts.map((p: { name: string; salesCount: number }) => ({
          name: p.name,
          sales: p.salesCount,
          percent: Math.round(p.salesCount / maxSales * 100),
        }))
      ));
    }

    if (type === 'recentOrders') {
      const recentOrders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: { select: { productName: true } },
        },
      });

      return NextResponse.json(successResponse(
        recentOrders.map((order: { orderNo: string; payAmount: unknown; status: string; createdAt: Date; items: { productName: string }[] }) => ({
          id: order.orderNo,
          product: order.items.map(i => i.productName).join(', '),
          amount: Number(order.payAmount),
          status: order.status,
          time: order.createdAt,
        }))
      ));
    }

    return NextResponse.json(successResponse({}));
  } catch (error) {
    return NextResponse.json(errorResponse('获取统计数据失败'), { status: 500 });
  }
}