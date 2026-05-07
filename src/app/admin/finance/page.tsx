import { DollarSign, TrendingUp, Wallet, CreditCard } from 'lucide-react';

export default function FinancePage() {
  const financeStats = [
    { label: '今日收入', value: '¥12,580', icon: DollarSign, color: 'text-green-600' },
    { label: '本月收入', value: '¥256,890', icon: TrendingUp, color: 'text-blue-600' },
    { label: '待结算金额', value: '¥8,450', icon: Wallet, color: 'text-orange-600' },
    { label: '退款金额', value: '¥1,230', icon: CreditCard, color: 'text-red-600' },
  ];

  const settlements = [
    { id: 'S001', orderNo: 'ORD20260506001', platform: '¥79.20', supplier: '¥19.80', status: 'completed', time: '2026-05-06' },
    { id: 'S002', orderNo: 'ORD20260506002', platform: '¥102.40', supplier: '¥25.60', status: 'pending', time: '2026-05-06' },
    { id: 'S003', orderNo: 'ORD20260506003', platform: '¥62.40', supplier: '¥15.60', status: 'processing', time: '2026-05-05' },
  ];

  const withdrawals = [
    { id: 'W001', supplier: '供应商A', amount: '¥5,680', status: 'pending', time: '2026-05-06' },
    { id: 'W002', supplier: '供应商B', amount: '¥3,250', status: 'pending', time: '2026-05-05' },
  ];

  const statusMap: Record<string, { label: string; color: string }> = {
    completed: { label: '已完成', color: 'bg-green-100 text-green-700' },
    pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
    processing: { label: '处理中', color: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">财务管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {financeStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">{stat.label}</span>
              <stat.icon className={'w-5 h-5 ' + stat.color} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">分账记录</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3">订单号</th>
                <th className="px-4 py-3">平台分成</th>
                <th className="px-4 py-3">供应商分成</th>
                <th className="px-4 py-3">状态</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{s.orderNo}</td>
                  <td className="px-4 py-3 text-sm">{s.platform}</td>
                  <td className="px-4 py-3 text-sm">{s.supplier}</td>
                  <td className="px-4 py-3">
                    <span className={'px-2 py-1 rounded-full text-xs ' + statusMap[s.status]?.color}>
                      {statusMap[s.status]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">提现审核</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-4 py-3">供应商</th>
                <th className="px-4 py-3">金额</th>
                <th className="px-4 py-3">申请时间</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{w.supplier}</td>
                  <td className="px-4 py-3 text-sm font-medium">{w.amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{w.time}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">通过</button>
                      <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">驳回</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
