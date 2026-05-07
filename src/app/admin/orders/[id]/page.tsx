'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Loader2, Package, CreditCard, Key,
  User as UserIcon, Calendar, Copy, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  getAllowedTransitions,
} from '@/lib/order-machine';
import type { OrderStatus } from '@/lib/order-machine';
import { toast } from 'sonner';

interface OrderDetail {
  id: string;
  orderNo: string;
  totalAmount: number;
  payAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paidAt: string | null;
  expireAt: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; nickname: string | null; phone: string | null; email: string | null };
  items: { id: string; productName: string; quantity: number; unitPrice: number; subtotal: number }[];
  payments: { id: string; channel: string; amount: number; status: string; tradeNo: string | null; paidAt: string | null }[];
  tokenKeys: { id: string; keyValue: string; keyType: string; status: string; expireAt: string | null; soldAt: string | null }[];
  userCoupon: { coupon: { name: string; code: string } } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
        } else {
          toast.error(json.error || '获取订单失败');
        }
      } catch {
        toast.error('获取订单失败');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        toast.success(`订单状态已更新为「${ORDER_STATUS_LABELS[newStatus]}」`);
      } else {
        toast.error(json.error || '更新失败');
      }
    } catch {
      toast.error('更新订单状态失败');
    } finally {
      setUpdating(false);
    }
  };

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('已复制');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">订单不存在</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">返回</button>
      </div>
    );
  }

  const allowedTransitions = getAllowedTransitions(order.status);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN');
  };

  const channelLabel: Record<string, string> = {
    WECHAT: '微信支付',
    ALIPAY: '支付宝',
  };

  const paymentStatusLabel: Record<string, string> = {
    PENDING: '待支付',
    SUCCESS: '成功',
    FAILED: '失败',
    REFUNDED: '已退款',
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">订单详情</h1>
          <p className="text-gray-500 text-sm font-mono">{order.orderNo}</p>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-sm font-medium', ORDER_STATUS_COLORS[order.status])}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              订单商品
            </h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">商品名称</th>
                  <th className="pb-3">单价</th>
                  <th className="pb-3">数量</th>
                  <th className="pb-3 text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 text-sm">{item.productName}</td>
                    <td className="py-3 text-sm">¥{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="py-3 text-sm">{item.quantity}</td>
                    <td className="py-3 text-sm text-right">¥{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              支付信息
            </h2>
            {order.payments.length === 0 ? (
              <p className="text-gray-400 text-sm">暂无支付记录</p>
            ) : (
              <div className="space-y-3">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">{channelLabel[p.channel] || p.channel}</span>
                      <span className={cn('ml-2 text-xs px-2 py-0.5 rounded-full',
                        p.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                        p.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}>{paymentStatusLabel[p.status]}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">¥{Number(p.amount).toFixed(2)}</p>
                      {p.tradeNo && <p className="text-xs text-gray-400">交易号: {p.tradeNo}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Token Keys */}
          {order.tokenKeys.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-400" />
                发放的卡密 ({order.tokenKeys.length})
              </h2>
              <div className="space-y-2">
                {order.tokenKeys.map((tk) => (
                  <div key={tk.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded font-mono">
                        {tk.keyValue.substring(0, 24)}...
                      </code>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full',
                        tk.status === 'UNUSED' ? 'bg-green-100 text-green-700' :
                        tk.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      )}>{tk.status === 'UNUSED' ? '未使用' : tk.status === 'SOLD' ? '已售出' : '已过期'}</span>
                    </div>
                    <button
                      onClick={() => copyText(tk.keyValue, tk.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition"
                    >
                      {copiedId === tk.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">状态管理</h2>
            {allowedTransitions.length === 0 ? (
              <p className="text-gray-400 text-sm">没有可执行的操作</p>
            ) : (
              <div className="space-y-2">
                {allowedTransitions.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={updating}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium border transition disabled:opacity-50 hover:bg-gray-50"
                  >
                    {updating ? '更新中...' : `标记为「${ORDER_STATUS_LABELS[nextStatus]}」`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              用户信息
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">昵称</span>
                <span>{order.user.nickname || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">手机</span>
                <span>{order.user.phone || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">邮箱</span>
                <span>{order.user.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">订单摘要</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">商品总额</span>
                <span>¥{Number(order.totalAmount).toFixed(2)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">优惠金额</span>
                  <span className="text-red-500">-¥{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>实付金额</span>
                <span className="text-lg text-red-500">¥{Number(order.payAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              时间线
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">创建时间</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">支付时间</span>
                <span>{formatDate(order.paidAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">过期时间</span>
                <span>{formatDate(order.expireAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">更新时间</span>
                <span>{formatDate(order.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
