import Link from 'next/link';
import { Upload, Download, Plus, Search, Trash2 } from 'lucide-react';

export default function InventoryPage() {
  const inventory = [
    { id: 'TK001', product: 'ChatGPT Plus 账号', key: 'sk-xxxx...xxxx', status: 'unused', expireAt: '2027-05-06' },
    { id: 'TK002', product: 'ChatGPT Plus 账号', key: 'sk-yyyy...yyyy', status: 'sold', expireAt: '2027-05-06' },
    { id: 'TK003', product: 'Claude Pro 会员', key: 'sess-zzzz...zzzz', status: 'unused', expireAt: '2027-06-01' },
    { id: 'TK004', product: 'Midjourney 订阅', key: 'mj-aaaa...aaaa', status: 'sold', expireAt: '2027-04-15' },
    { id: 'TK005', product: 'Gemini Advanced', key: 'gem-bbbb...bbbb', status: 'expired', expireAt: '2026-01-01' },
  ];

  const statusMap: Record<string, { label: string; color: string }> = {
    unused: { label: '未使用', color: 'bg-green-100 text-green-700' },
    sold: { label: '已售出', color: 'bg-blue-100 text-blue-700' },
    expired: { label: '已过期', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">库存/卡密管理</h1>
        <div className="flex gap-3">
          <button className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="border px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
            <Upload className="w-4 h-4" />
            批量导入
          </button>
          <Link href="/admin/inventory/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            新增卡密
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="搜索商品/卡密..." className="flex-1 outline-none text-sm" />
          </div>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>全部状态</option>
            <option>未使用</option>
            <option>已售出</option>
            <option>已过期</option>
          </select>
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>全部商品</option>
            <option>ChatGPT Plus</option>
            <option>Claude Pro</option>
          </select>
        </div>

        <div className="p-4 bg-blue-50 border-b flex gap-8 text-sm">
          <div><span className="text-gray-500">总库存: </span><span className="font-semibold">250</span></div>
          <div><span className="text-gray-500">未使用: </span><span className="font-semibold text-green-600">120</span></div>
          <div><span className="text-gray-500">已售出: </span><span className="font-semibold text-blue-600">125</span></div>
          <div><span className="text-gray-500">已过期: </span><span className="font-semibold text-red-600">5</span></div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3"><input type="checkbox" /></th>
              <th className="px-6 py-3">卡密ID</th>
              <th className="px-6 py-3">关联商品</th>
              <th className="px-6 py-3">卡密内容</th>
              <th className="px-6 py-3">状态</th>
              <th className="px-6 py-3">过期时间</th>
              <th className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4"><input type="checkbox" /></td>
                <td className="px-6 py-4 text-sm font-mono">{item.id}</td>
                <td className="px-6 py-4 text-sm">{item.product}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-500">{item.key}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded-full text-xs ' + statusMap[item.status]?.color}>
                    {statusMap[item.status]?.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{item.expireAt}</td>
                <td className="px-6 py-4">
                  <button className="p-1.5 hover:bg-gray-100 rounded transition">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
