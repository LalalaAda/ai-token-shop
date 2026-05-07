import Link from 'next/link';
import { Plus, Edit, Trash2, TicketPercent, Zap } from 'lucide-react';

export default function MarketingPage() {
  const coupons = [
    { id: '1', name: 'New User Coupon', code: 'NEWUSER2026', type: 'fixed', value: 20, minAmount: 50, total: 1000, used: 234, status: 'active', endAt: '2026-12-31' },
    { id: '2', name: 'Save 15', code: 'SAVE15', type: 'fixed', value: 15, minAmount: 100, total: 500, used: 89, status: 'active', endAt: '2026-06-30' },
    { id: '3', name: '20% Off', code: 'OFF20', type: 'percent', value: 20, minAmount: 200, total: 200, used: 45, status: 'active', endAt: '2026-08-31' },
  ];

  const promotions = [
    { id: '1', name: 'May Day Flash Sale', type: 'seckill', status: 'active', startAt: '2026-05-01', endAt: '2026-05-07', participants: 1234 },
    { id: '2', name: 'Claude Pro Group Buy', type: 'groupbuy', status: 'draft', startAt: '2026-06-01', endAt: '2026-06-30', participants: 0 },
  ];

  const typeMap: Record<string, string> = { seckill: 'Flash Sale', groupbuy: 'Group Buy', full_reduce: 'Full Reduce' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketing Management</h1>

      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Coupons</h2>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Value</th>
              <th className="px-6 py-3">Min Amount</th>
              <th className="px-6 py-3">Used/Total</th>
              <th className="px-6 py-3">Expires</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm font-mono">{c.code}</td>
                <td className="px-6 py-4 text-sm">{c.type === 'fixed' ? 'Fixed' : 'Percent'}</td>
                <td className="px-6 py-4 text-sm">{c.type === 'fixed' ? '$' + c.value : c.value + '%'}</td>
                <td className="px-6 py-4 text-sm"></td>
                <td className="px-6 py-4 text-sm">{c.used}/{c.total}</td>
                <td className="px-6 py-4 text-sm">{c.endAt}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded-full text-xs ' + (c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {c.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold">Promotions</h2>
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition">
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Start</th>
              <th className="px-6 py-3">End</th>
              <th className="px-6 py-3">Participants</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                <td className="px-6 py-4 text-sm">{typeMap[p.type]}</td>
                <td className="px-6 py-4 text-sm">{p.startAt}</td>
                <td className="px-6 py-4 text-sm">{p.endAt}</td>
                <td className="px-6 py-4 text-sm">{p.participants}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded-full text-xs ' + (p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                    {p.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={'/admin/marketing/' + p.id + '/edit'} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-blue-500" /></Link>
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
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
