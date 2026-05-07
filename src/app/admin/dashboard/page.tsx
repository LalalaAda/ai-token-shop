import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUNDING: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-red-100 text-red-700',
};

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  interface TopProduct {
    name: string;
    salesCount: number;
  }

  interface OrderItemData {
    productName: string;
  }

interface RecentOrderData {
  id: string;
  orderNo: string;
  payAmount: unknown;
  status: string;
  createdAt: Date;
  items: { productName: string }[];
}

  const [
    totalOrders, todayOrders, yesterdayOrders,
    totalUsers, todayUsers, yesterdayUsers,
    totalProducts,
    todayRevenue, yesterdayRevenue, totalRevenue,
    topProducts,
    recentOrders,
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
    prisma.product.findMany({
      where: { status: 'ONLINE' },
      orderBy: { salesCount: 'desc' },
      take: 5,
      select: { name: true, salesCount: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { items: { select: { productName: true } } },
    }),
  ]);

  const todayRev = Number(todayRevenue._sum.amount || 0);
  const yesterdayRev = Number(yesterdayRevenue._sum.amount || 0);
  const maxSales = topProducts.length > 0 ? topProducts[0].salesCount : 1;

  function calcChange(current: number, previous: number): { value: string; up: boolean } {
    if (previous === 0) return { value: current > 0 ? '+100%' : '0%', up: current > 0 };
    const pct = ((current - previous) / previous * 100).toFixed(1);
    return { value: (Number(pct) >= 0 ? '+' : '') + pct + '%', up: Number(pct) >= 0 };
  }

  const stats = [
    { label: '今日销售额', value: formatPrice(todayRev), change: calcChange(todayRev, yesterdayRev), icon: DollarSign },
    { label: '今日订单', value: todayOrders.toString(), change: calcChange(todayOrders, yesterdayOrders), icon: ShoppingCart },
    { label: '上架商品', value: totalProducts.toString(), change: { value: `共 ${totalProducts} 个`, up: true }, icon: Package },
    { label: '用户总数', value: totalUsers.toLocaleString(), change: calcChange(todayUsers, 0), icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">数据看板</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">{stat.label}</span>
              <stat.icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className={cn('flex items-center text-sm', stat.change.up ? 'text-green-600' : 'text-red-600')}>
              {stat.change.up ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {stat.change.value}
            </div>
          </div>
        ))}
      </div>

      {/* Top Products + Revenue Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">销售趋势</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-600">总营收</span>
              <span className="text-2xl font-bold text-blue-600">{formatPrice(Number(totalRevenue._sum.amount) || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-600">今日营收</span>
              <span className="text-xl font-bold text-green-600">{formatPrice(todayRev)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">昨日营收</span>
              <span className="text-lg font-medium text-gray-700">{formatPrice(yesterdayRev)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-600">总订单数</span>
              <span className="text-lg font-medium text-purple-600">{totalOrders}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">商品销量 TOP5</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((item: TopProduct, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={cn(
                    'text-sm w-6 h-6 flex items-center justify-center rounded-full font-medium',
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
                  )}>{i + 1}</span>
                  <span className="flex-1 text-sm truncate">{item.name}</span>
                  <span className="text-sm font-medium">{item.salesCount} 单</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: Math.round(item.salesCount / maxSales * 100) + '%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">暂无销售数据</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">最近订单</h2>
          <Link href="/admin/orders" className="text-blue-600 hover:underline text-sm">查看全部</Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="px-6 py-3">订单号</th>
                  <th className="px-6 py-3">商品</th>
                  <th className="px-6 py-3">金额</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: RecentOrderData) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{order.orderNo}</td>
                    <td className="px-6 py-4 text-sm truncate max-w-[200px]">{order.items.map(i => i.productName).join(', ')}</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.payAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-1 rounded-full text-xs', statusColors[order.status] || 'bg-gray-100 text-gray-600')}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">暂无订单</div>
        )}
      </div>
    </div>
  );
}