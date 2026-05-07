'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, RefreshCw, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  orderNo: string;
  user: { nickname: string | null; phone: string | null };
  items: { productName: string; quantity: number; unitPrice: number }[];
  payAmount: number;
  status: string;
  payments: { channel: string; status: string }[];
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待支付', color: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: '已支付', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: '已发货', color: 'bg-indigo-100 text-indigo-700' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: '已取消', color: 'bg-gray-100 text-gray-600' },
  REFUNDING: { label: '退款中', color: 'bg-orange-100 text-orange-700' },
  REFUNDED: { label: '已退款', color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data.orders);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchOrders();
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = search
    ? orders.filter(o => o.orderNo.toLowerCase().includes(search.toLowerCase()))
    : orders;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">订单管理</h1>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4 flex-wrap">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="搜索订单号..." 
              className="flex-1 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="PENDING">待支付</option>
            <option value="PAID">已支付</option>
            <option value="SHIPPED">已发货</option>
            <option value="COMPLETED">已完成</option>
            <option value="CANCELLED">已取消</option>
            <option value="REFUNDING">退款中</option>
            <option value="REFUNDED">已退款</option>
          </select>
          <button 
            onClick={fetchOrders}
            className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-12">暂无订单</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-6 py-3">订单号</th>
                <th className="px-6 py-3">用户</th>
                <th className="px-6 py-3">商品</th>
                <th className="px-6 py-3">金额</th>
                <th className="px-6 py-3">支付方式</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">时间</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono">{order.orderNo}</td>
                  <td className="px-6 py-4 text-sm">{order.user?.nickname || order.user?.phone || '-'}</td>
                  <td className="px-6 py-4 text-sm truncate max-w-[200px]">
                    {order.items.map(i => i.productName).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">¥{Number(order.payAmount)}</td>
                  <td className="px-6 py-4 text-sm">
                    {order.payments?.[0]?.channel === 'WECHAT' ? '微信' : order.payments?.[0]?.channel === 'ALIPAY' ? '支付宝' : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={'px-2 py-1 rounded-full text-xs ' + (statusMap[order.status]?.color || 'bg-gray-100 text-gray-600')}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Link href={'/admin/orders/' + order.id} className="p-1.5 hover:bg-gray-100 rounded transition">
                      <Eye className="w-4 h-4 text-blue-500" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
