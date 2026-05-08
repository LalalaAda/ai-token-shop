import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type') || 'all';

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const result: Record<string, unknown> = {};

    // Revenue & Orders time-series
    if (type === 'all' || type === 'revenue') {
      // Get daily revenue and order counts
      const payments = await prisma.payment.findMany({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: startDate },
        },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      // Build daily buckets
      const dailyData: Record<string, { revenue: number; orders: number }> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split('T')[0];
        dailyData[key] = { revenue: 0, orders: 0 };
      }

      // Unique order ids per day for order count
      const dailyOrders: Record<string, Set<string>> = {};
      payments.forEach((p) => {
        const key = p.createdAt.toISOString().split('T')[0];
        if (dailyData[key]) {
          dailyData[key].revenue += Number(p.amount);
        }
      });

      // Get daily order counts from orders table
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['PAID', 'COMPLETED', 'SHIPPED'] },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      orders.forEach((o) => {
        const key = o.createdAt.toISOString().split('T')[0];
        if (dailyData[key]) {
          dailyData[key].orders++;
        }
      });

      const timeSeriesData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }));

      result.timeSeriesData = timeSeriesData;
    }

    // Category distribution
    if (type === 'all' || type === 'categories') {
      const categories = await prisma.product.groupBy({
        by: ['categoryId'],
        where: { status: 'ONLINE' },
        _count: { id: true },
        _sum: { salesCount: true },
      });

      const categoryIds = categories.map((c) => c.categoryId);
      const categoryNames = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });

      const nameMap = new Map(categoryNames.map((c) => [c.id, c.name]));
      result.categoryData = categories.map((c) => ({
        name: nameMap.get(c.categoryId) || '未分类',
        count: c._count.id,
        sales: c._sum.salesCount || 0,
      }));
    }

    // Order status distribution
    if (type === 'all' || type === 'status') {
      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      const statusLabels: Record<string, string> = {
        PENDING: '待支付',
        PAID: '已支付',
        SHIPPED: '已发货',
        COMPLETED: '已完成',
        CANCELLED: '已取消',
        REFUNDING: '退款中',
        REFUNDED: '已退款',
      };

      result.orderStatusData = statusCounts.map((s) => ({
        status: s.status,
        label: statusLabels[s.status] || s.status,
        count: s._count.id,
      }));
    }

    // Revenue summary
    if (type === 'all' || type === 'summary') {
      const totalRevenue = await prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      });

      const periodRevenue = await prisma.payment.aggregate({
        where: { status: 'SUCCESS', createdAt: { gte: startDate } },
        _sum: { amount: true },
      });

      const totalOrders = await prisma.order.count();
      const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });

      result.summary = {
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        periodRevenue: Number(periodRevenue._sum.amount || 0),
        totalOrders,
        completedOrders,
        periodDays: days,
      };
    }

    return NextResponse.json(successResponse(result));
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(errorResponse('获取分析数据失败'), { status: 500 });
  }
}
