'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Loader2, RefreshCw, Megaphone } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
}

interface Promotion {
  id: string;
  name: string;
  type: 'SECKILL' | 'GROUPBUY' | 'FULL_REDUCE';
  startAt: string;
  endAt: string;
  rules: {
    discountPercent?: number;
    discountAmount?: number;
    minAmount?: number;
    groupSize?: number;
    maxQuantity?: number;
  };
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED';
  products: Product[];
  createdAt: string;
}

const typeLabels: Record<string, string> = {
  SECKILL: '秒杀',
  GROUPBUY: '团购',
  FULL_REDUCE: '满减',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'bg-gray-100 text-gray-600' },
  ACTIVE: { label: '进行中', color: 'bg-green-100 text-green-700' },
  EXPIRED: { label: '已结束', color: 'bg-red-100 text-red-700' },
};

const defaultForm = {
  name: '',
  type: 'SECKILL' as 'SECKILL' | 'GROUPBUY' | 'FULL_REDUCE',
  startAt: '',
  endAt: '',
  rules: {} as Record<string, number>,
  productIds: [] as string[],
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions?limit=100');
      const json = await res.json();
      if (json.success) setPromotions(json.data.promotions);
    } catch (e) {
      console.error('Failed to fetch promotions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?limit=500');
      const json = await res.json();
      if (json.success) setProducts(json.data.products);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
  };

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);
  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      startAt: p.startAt.split('T')[0],
      endAt: p.endAt.split('T')[0],
      rules: p.rules || {},
      productIds: p.products.map((pr) => pr.id),
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        productIds: form.productIds,
      };

      let res;
      if (editing) {
        res = await fetch('/api/admin/promotions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...body }),
        });
      } else {
        res = await fetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const json = await res.json();
      if (json.success) {
        toast.success(editing ? '促销活动已更新' : '促销活动已创建');
        setShowModal(false);
        fetchPromotions();
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个促销活动吗？')) return;
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('已删除');
        fetchPromotions();
      } else {
        toast.error(json.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const toggleStatus = async (p: Promotion) => {
    const newStatus = p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: p.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(newStatus === 'ACTIVE' ? '已启用' : '已停用');
        fetchPromotions();
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('zh-CN');

  const ruleSummary = (p: Promotion) => {
    const r = p.rules;
    switch (p.type) {
      case 'SECKILL':
        return r.discountPercent ? `${r.discountPercent}%折扣` : r.discountAmount ? `减¥${r.discountAmount}` : '-';
      case 'GROUPBUY':
        return `${r.groupSize || '?'}人团 ${r.discountPercent ? `${r.discountPercent}%折扣` : ''}`;
      case 'FULL_REDUCE':
        return `满¥${r.minAmount}减¥${r.discountAmount}`;
      default:
        return '-';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">促销活动管理</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          新建活动
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">活动列表</h2>
          </div>
          <button onClick={fetchPromotions} className="p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="mb-2">暂无促销活动</p>
            <button onClick={openCreate} className="text-blue-600 hover:underline text-sm">
              创建第一个活动
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="px-6 py-3">名称</th>
                  <th className="px-6 py-3">类型</th>
                  <th className="px-6 py-3">规则</th>
                  <th className="px-6 py-3">商品</th>
                  <th className="px-6 py-3">有效期</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {typeLabels[p.type]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ruleSummary(p)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.products.length} 件</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(p.startAt)} ~ {formatDate(p.endAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${statusLabels[p.status]?.color}`}
                      >
                        {statusLabels[p.status]?.label}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded" title="编辑">
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-gray-100 rounded" title="删除">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? '编辑促销活动' : '新建促销活动'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">活动名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">活动类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'SECKILL' | 'GROUPBUY' | 'FULL_REDUCE' })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="SECKILL">秒杀</option>
                    <option value="GROUPBUY">团购</option>
                    <option value="FULL_REDUCE">满减</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">状态</label>
                  {editing ? (
                    <select
                      value={editing.status}
                      onChange={(e) => setEditing({ ...editing, status: e.target.value as 'DRAFT' | 'ACTIVE' | 'EXPIRED' })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">草稿</option>
                      <option value="ACTIVE">进行中</option>
                      <option value="EXPIRED">已结束</option>
                    </select>
                  ) : (
                    <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50" value="草稿" disabled />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              {/* Type-specific rules */}
              {form.type === 'SECKILL' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">折扣百分比 (%)</label>
                    <input
                      type="number"
                      value={form.rules.discountPercent || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, discountPercent: parseInt(e.target.value) || 0 } })}
                      min={1} max={100}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="如 80 = 8折"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">限购数量</label>
                    <input
                      type="number"
                      value={form.rules.maxQuantity || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, maxQuantity: parseInt(e.target.value) || 0 } })}
                      min={1}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      placeholder="每人限购"
                    />
                  </div>
                </div>
              )}

              {form.type === 'GROUPBUY' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">成团人数</label>
                    <input
                      type="number"
                      value={form.rules.groupSize || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, groupSize: parseInt(e.target.value) || 0 } })}
                      min={2}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">折扣百分比 (%)</label>
                    <input
                      type="number"
                      value={form.rules.discountPercent || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, discountPercent: parseInt(e.target.value) || 0 } })}
                      min={1} max={100}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {form.type === 'FULL_REDUCE' && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">最低金额 (¥)</label>
                    <input
                      type="number"
                      value={form.rules.minAmount || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, minAmount: parseFloat(e.target.value) || 0 } })}
                      min={0}
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">减免金额 (¥)</label>
                    <input
                      type="number"
                      value={form.rules.discountAmount || ''}
                      onChange={(e) => setForm({ ...form, rules: { ...form.rules, discountAmount: parseFloat(e.target.value) || 0 } })}
                      min={0}
                      step="0.01"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Product selection */}
              <div>
                <label className="block text-sm font-medium mb-1">参与商品</label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2">
                  {products.length === 0 ? (
                    <p className="text-sm text-gray-400 p-2">暂无商品</p>
                  ) : (
                    products.map((pr) => (
                      <label key={pr.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.productIds.includes(pr.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, productIds: [...form.productIds, pr.id] });
                            } else {
                              setForm({ ...form, productIds: form.productIds.filter((id) => id !== pr.id) });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{pr.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">¥{Number(pr.sellingPrice)}</span>
                      </label>
                    ))
                  )}
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
                  disabled={saving || form.productIds.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {saving ? '保存中...' : (editing ? '保存修改' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
