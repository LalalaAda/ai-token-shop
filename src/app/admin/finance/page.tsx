'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Settlement {
  id: string;
  platformAmount: number;
  supplierAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  createdAt: string;
  order: {
    orderNo: string;
    payAmount: number;
    paidAt: string | null;
  };
}

interface Stats {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  totalPlatform: number;
  totalSupplier: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: '已完成', color: 'bg-green-100 text-green-700' },
};

export default function FinancePage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSettlements = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/settlements?${params}`);
      const json = await res.json();
      if (json.success) {
        setSettlements(json.data.settlements);
        setStats(json.data.stats);
        setPagination(json.data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch settlements:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/settlements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('状态已更新');
        fetchSettlements(pagination.page);
      } else {
        toast.error(json.error || '更新失败');
      }
    } catch {
      toast.error('更新失败');
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">财务管理</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">平台总收入</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">
            {stats ? `¥${stats.totalPlatform.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">供应商总分成</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">
            {stats ? `¥${stats.totalSupplier.toFixed(2)}` : '-'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">待结算</span>
            <Wallet className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold">{stats?.pendingCount || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm">已完成</span>
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold">{stats?.completedCount || 0}</div>
        </div>
      </div>

      {/* Settlement List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">分账记录</h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">全部状态</option>
              <option value="PENDING">待处理</option>
              <option value="PROCESSING">处理中</option>
              <option value="COMPLETED">已完成</option>
            </select>
            <button onClick={() => fetchSettlements(pagination.page)} className="p-1.5 hover:bg-gray-100 rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="text-center text-gray-400 py-16">暂无分账记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="px-6 py-3">订单号</th>
                  <th className="px-6 py-3">订单金额</th>
                  <th className="px-6 py-3">平台分成</th>
                  <th className="px-6 py-3">供应商分成</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">时间</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">{s.order?.orderNo || '-'}</td>
                    <td className="px-6 py-4 text-sm">¥{Number(s.order?.payAmount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ¥{Number(s.platformAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      ¥{Number(s.supplierAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusMap[s.status]?.color}`}>
                        {statusMap[s.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(s.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {s.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(s.id, 'PROCESSING')}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            处理
                          </button>
                        )}
                        {s.status === 'PROCESSING' && (
                          <button
                            onClick={() => updateStatus(s.id, 'COMPLETED')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            完成
                          </button>
                        )}
                        {s.status === 'COMPLETED' && (
                          <span className="px-3 py-1 text-xs text-gray-400">已结束</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <span className="text-sm text-gray-500">
              共 {pagination.total} 条，第 {pagination.page}/{pagination.totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchSettlements(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => fetchSettlements(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
