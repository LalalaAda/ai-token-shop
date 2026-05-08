'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Loader2, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  _count: { adminUsers: number };
  createdAt: string;
}

const ALL_PERMISSIONS = [
  { key: 'dashboard:view', label: '数据看板' },
  { key: 'products:view', label: '商品查看' },
  { key: 'products:create', label: '商品创建' },
  { key: 'products:edit', label: '商品编辑' },
  { key: 'products:delete', label: '商品删除' },
  { key: 'orders:view', label: '订单查看' },
  { key: 'orders:edit', label: '订单编辑' },
  { key: 'users:view', label: '用户查看' },
  { key: 'users:edit', label: '用户编辑' },
  { key: 'tokens:view', label: '卡密查看' },
  { key: 'tokens:create', label: '卡密生成' },
  { key: 'promotions:view', label: '促销查看' },
  { key: 'promotions:create', label: '促销创建' },
  { key: 'promotions:edit', label: '促销编辑' },
  { key: 'promotions:delete', label: '促销删除' },
  { key: 'reviews:view', label: '评价查看' },
  { key: 'reviews:delete', label: '评价删除' },
  { key: 'settlements:view', label: '结算查看' },
  { key: 'settlements:edit', label: '结算编辑' },
  { key: 'roles:view', label: '角色查看' },
  { key: 'roles:create', label: '角色创建' },
  { key: 'roles:edit', label: '角色编辑' },
  { key: 'roles:delete', label: '角色删除' },
  { key: 'settings:view', label: '设置查看' },
  { key: 'settings:edit', label: '设置编辑' },
];

const PERMISSION_GROUPS = [
  { group: 'dashboard', label: '数据看板', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('dashboard')) },
  { group: 'products', label: '商品管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('products')) },
  { group: 'orders', label: '订单管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('orders')) },
  { group: 'users', label: '用户管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('users')) },
  { group: 'tokens', label: '卡密管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('tokens')) },
  { group: 'promotions', label: '促销管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('promotions')) },
  { group: 'reviews', label: '评价管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('reviews')) },
  { group: 'settlements', label: '结算管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('settlements')) },
  { group: 'roles', label: '角色管理', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('roles')) },
  { group: 'settings', label: '系统设置', perms: ALL_PERMISSIONS.filter(p => p.key.startsWith('settings')) },
];

const defaultForm = {
  name: '',
  description: '',
  permissions: [] as string[],
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState(defaultForm);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const json = await res.json();
      if (json.success) setRoles(json.data.roles);
    } catch (e) {
      console.error('Failed to fetch roles:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
    });
    setShowModal(true);
  };

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const selectAllInGroup = (groupPerms: string[]) => {
    const allSelected = groupPerms.every((p) => form.permissions.includes(p));
    if (allSelected) {
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => !groupPerms.includes(p)),
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPerms])],
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.permissions.length === 0) {
      toast.error('请至少选择一个权限');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || undefined,
        permissions: form.permissions,
      };

      let res;
      if (editing) {
        res = await fetch('/api/admin/roles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...body }),
        });
      } else {
        res = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const json = await res.json();
      if (json.success) {
        toast.success(editing ? '角色已更新' : '角色已创建');
        setShowModal(false);
        fetchRoles();
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
    if (!confirm('确定要删除这个角色吗？')) return;
    try {
      const res = await fetch(`/api/admin/roles?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('已删除');
        fetchRoles();
      } else {
        toast.error(json.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">权限管理</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          新建角色
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">角色列表</h2>
          </div>
          <button onClick={fetchRoles} className="p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p>暂无角色</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="px-6 py-3">角色名称</th>
                  <th className="px-6 py-3">描述</th>
                  <th className="px-6 py-3">权限数</th>
                  <th className="px-6 py-3">管理员数</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{role.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{role.description || '-'}</td>
                    <td className="px-6 py-4 text-sm">{role.permissions.length}</td>
                    <td className="px-6 py-4 text-sm">{role._count.adminUsers}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(role)} className="p-1.5 hover:bg-gray-100 rounded" title="编辑">
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="p-1.5 hover:bg-gray-100 rounded" title="删除">
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
            <h2 className="text-xl font-bold mb-4">{editing ? '编辑角色' : '新建角色'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">角色名称</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">权限设置</label>
                <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.group} className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={group.perms.every((p) => form.permissions.includes(p.key))}
                          onChange={() => selectAllInGroup(group.perms.map((p) => p.key))}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{group.label}</span>
                      </div>
                      <div className="ml-6 flex flex-wrap gap-2">
                        {group.perms.map((perm) => (
                          <label
                            key={perm.key}
                            className="flex items-center gap-1.5 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(perm.key)}
                              onChange={() => togglePermission(perm.key)}
                              className="rounded"
                            />
                            <span className="text-xs text-gray-600">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
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
                  disabled={saving || !form.name}
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
