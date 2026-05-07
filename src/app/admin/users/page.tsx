'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Loader2, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  nickname: string | null;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  memberLevel: number;
  openid: string | null;
  status: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

const levelMap: Record<number, string> = { 0: '普通', 1: '白银', 2: '黄金', 3: '铂金', 4: '钻石' };
const levelColor: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-slate-100 text-slate-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      if (levelFilter) params.set('memberLevel', levelFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setPagination(json.data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, levelFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(newStatus === 'BANNED' ? '已封禁用户' : '已解封用户');
        fetchUsers();
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch (e) {
      toast.error('操作失败');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4 flex-wrap">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="搜索昵称/手机号/邮箱..."
              className="flex-1 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setPagination(p => ({ ...p, page: 1 }))}
            />
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={levelFilter}
            onChange={(e) => { setLevelFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          >
            <option value="">全部会员等级</option>
            <option value="0">普通</option>
            <option value="1">白银</option>
            <option value="2">黄金</option>
            <option value="3">铂金</option>
            <option value="4">钻石</option>
          </select>
          <button
            onClick={fetchUsers}
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
        ) : users.length === 0 ? (
          <div className="text-center text-gray-400 py-12">暂无用户</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">昵称</th>
                    <th className="px-6 py-3">联系方式</th>
                    <th className="px-6 py-3">会员等级</th>
                    <th className="px-6 py-3">订单数</th>
                    <th className="px-6 py-3">累计消费</th>
                    <th className="px-6 py-3">注册时间</th>
                    <th className="px-6 py-3">状态</th>
                    <th className="px-6 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">{user.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-600 font-medium">
                              {user.nickname?.[0] || '?'}
                            </div>
                          )}
                          <span className="text-sm font-medium">{user.nickname || '未设置'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.phone || user.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={'px-2 py-1 rounded-full text-xs ' + (levelColor[user.memberLevel] || 'bg-gray-100 text-gray-600')}>
                          {levelMap[user.memberLevel] || '普通'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.orderCount}</td>
                      <td className="px-6 py-4 text-sm font-medium">¥{user.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className={'px-2 py-1 rounded-full text-xs ' + (user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                          {user.status === 'ACTIVE' ? '正常' : '封禁'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(user)}
                          className="p-1.5 hover:bg-gray-100 rounded transition"
                          title={user.status === 'ACTIVE' ? '封禁用户' : '解封用户'}
                        >
                          {user.status === 'ACTIVE' ? (
                            <Ban className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t">
                <span className="text-sm text-gray-500">
                  共 {pagination.total} 条，第 {pagination.page}/{pagination.totalPages} 页
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
