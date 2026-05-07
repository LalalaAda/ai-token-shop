import { Search, Eye, Ban, Edit } from 'lucide-react';

export default function UsersPage() {
  const users = [
    { id: '1', nickname: '张三', openid: 'oXXXX1', phone: '138****1234', level: 2, orders: 15, spent: 1580, status: 'active', joinedAt: '2026-01-15' },
    { id: '2', nickname: '李四', openid: 'oXXXX2', phone: '139****5678', level: 1, orders: 5, spent: 490, status: 'active', joinedAt: '2026-02-20' },
    { id: '3', nickname: '王五', openid: 'oXXXX3', phone: '136****9012', level: 3, orders: 32, spent: 3850, status: 'active', joinedAt: '2025-12-01' },
    { id: '4', nickname: '赵六', openid: 'oXXXX4', phone: '-', level: 0, orders: 0, spent: 0, status: 'banned', joinedAt: '2026-03-10' },
  ];

  const levelMap: Record<number, string> = { 0: '普通', 1: '白银', 2: '黄金', 3: '钻石' };
  const levelColor: Record<number, string> = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-slate-100 text-slate-700', 2: 'bg-yellow-100 text-yellow-700', 3: 'bg-purple-100 text-purple-700' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="搜索用户..." className="flex-1 outline-none text-sm" />
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>全部会员等级</option>
            <option>普通</option>
            <option>白银</option>
            <option>黄金</option>
            <option>钻石</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">昵称</th>
              <th className="px-6 py-3">OpenID</th>
              <th className="px-6 py-3">手机号</th>
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
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{user.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{user.nickname}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-400">{user.openid}</td>
                <td className="px-6 py-4 text-sm">{user.phone}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded-full text-xs ' + levelColor[user.level]}>{levelMap[user.level]}</span>
                </td>
                <td className="px-6 py-4 text-sm">{user.orders}</td>
                <td className="px-6 py-4 text-sm font-medium">¥{user.spent}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.joinedAt}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded-full text-xs ' + (user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {user.status === 'active' ? '正常' : '封禁'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Eye className="w-4 h-4 text-blue-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Ban className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
