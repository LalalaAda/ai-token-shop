'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Eye, Loader2 } from 'lucide-react';

interface Order {
  id: string;
  orderNo: string;
  items: { productName: string; quantity: number }[];
  payAmount: number;
  status: string;
  createdAt: string;
  tokenKeys?: { keyValue: string; keyType: string }[];
}

function getUserId(sessionUserId?: string | null): string {
  if (sessionUserId) return sessionUserId;
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('shop_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('shop_user_id', userId);
  }
  return userId;
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

export default function UserOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userId = getUserId(session?.user?.id);
        const res = await fetch(`/api/orders?userId=${userId}`);
        const json = await res.json();
        if (json.success) {
          setOrders(json.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-4">暂无订单</p>
          <Link href="/shop/products" className="text-blue-600 hover:underline">去选购 →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-gray-500">{order.orderNo}</span>
                  <span className={'px-2 py-1 rounded-full text-xs ' + (statusMap[order.status]?.color || 'bg-gray-100 text-gray-600')}>
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.items.map(i => i.productName).join(', ')}</p>
                  <p className="text-red-500 font-bold mt-1">¥{Number(order.payAmount)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {order.status === 'PENDING' && (
                    <Link href="/checkout" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">去支付</Link>
                  )}
                  {order.tokenKeys && order.tokenKeys.length > 0 && (
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-xs text-gray-500">卡密: </span>
                      <code className="text-sm font-mono">{order.tokenKeys[0].keyValue}</code>
                    </div>
                  )}
                  <button className="p-2 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-gray-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
