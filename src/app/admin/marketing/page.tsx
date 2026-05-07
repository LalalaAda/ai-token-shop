'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TicketPercent, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  name: string;
  code: string;
  type: 'FIXED' | 'PERCENT';
  value: number;
  minAmount: number;
  totalCount: number;
  usedCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  startAt: string;
  endAt: string;
  createdAt: string;
}

const defaultForm = {
  name: '',
  code: '',
  type: 'FIXED' as 'FIXED' | 'PERCENT',
  value: 10,
  minAmount: 0,
  totalCount: 100,
  startAt: '',
  endAt: '',
};

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons?limit=100');
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data.coupons);
      }
    } catch (e) {
      console.error('Failed to fetch coupons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('优惠券创建成功');
        setShowModal(false);
        setForm(defaultForm);
        fetchCoupons();
      } else {
        toast.error(json.error || '创建失败');
      }
    } catch (e) {
      toast.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个优惠券吗？')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('已删除');
        fetchCoupons();
      } else {
        toast.error(json.error || '删除失败');
      }
    } catch (e) {
      toast.error('删除失败');
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          status: coupon.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(coupon.status === 'ACTIVE' ? '已停用' : '已启用');
        fetchCoupons();
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch (e) {
      toast.error('操作失败');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('zh-CN');
  const formatDateISO = (date: string) => date.split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">营销管理 - 优惠券</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          新建优惠券
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">优惠券列表</h2>
          </div>
          <button onClick={fetchCoupons} className="p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="mb-2">暂无优惠券</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              创建第一个优惠券
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="px-6 py-3">名称</th>
                  <th className="px-6 py-3">优惠码</th>
                  <th className="px-6 py-3">类型</th>
                  <th className="px-6 py-3">优惠</th>
                  <th className="px-6 py-3">最低消费</th>
                  <th className="px-6 py-3">使用/总量</th>
                  <th className="px-6 py-3">有效期</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-sm font-mono text-blue-600">{c.code}</td>
                    <td className="px-6 py-4 text-sm">{c.type === 'FIXED' ? '固定金额' : '百分比'}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {c.type === 'FIXED' ? `¥${c.value}` : `${c.value}%`}
                    </td>
                    <td className="px-6 py-4 text-sm">{c.minAmount > 0 ? `¥${c.minAmount}` : '无限制'}</td>
                    <td className="px-6 py-4 text-sm">{c.usedCount}/{c.totalCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(c.startAt)} ~ {formatDate(c.endAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(c)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {c.status === 'ACTIVE' ? '启用' : '停用'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新建优惠券</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">优惠码</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="如 SAVE20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'FIXED' | 'PERCENT' })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="FIXED">固定金额</option>
                    <option value="PERCENT">百分比</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {form.type === 'FIXED' ? '优惠金额 (¥)' : '折扣百分比 (%)'}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    min={0.01}
                    step={form.type === 'FIXED' ? '0.01' : '1'}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">最低消费 (¥, 0=无限制)</label>
                  <input
                    type="number"
                    value={form.minAmount}
                    onChange={(e) => setForm({ ...form, minAmount: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step="0.01"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">发行数量</label>
                  <input
                    type="number"
                    value={form.totalCount}
                    onChange={(e) => setForm({ ...form, totalCount: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">开始时间</label>
                  <input
                    type="date"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结束时间</label>
                  <input
                    type="date"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {saving ? '创建中...' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
