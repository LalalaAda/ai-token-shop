'use client';

import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

interface TimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryItem {
  name: string;
  count: number;
  sales: number;
}

interface OrderStatusItem {
  status: string;
  label: string;
  count: number;
}

interface SummaryData {
  totalRevenue: number;
  periodRevenue: number;
  totalOrders: number;
  completedOrders: number;
  periodDays: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  const fetchData = async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}&type=all`);
      const json = await res.json();
      if (json.success) {
        setTimeSeries(json.data.timeSeriesData || []);
        setCategories(json.data.categoryData || []);
        setOrderStatus(json.data.orderStatusData || []);
        setSummary(json.data.summary || null);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
      toast.error('获取分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(days); }, [days]);

  const formatRevenue = (v: number) => `¥${v.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">数据分析</h1>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>最近7天</option>
            <option value={30}>最近30天</option>
            <option value={90}>最近90天</option>
          </select>
          <button onClick={() => fetchData(days)} className="p-2 hover:bg-gray-100 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">周期营收 ({summary.periodDays}天)</p>
                <p className="text-2xl font-bold text-green-600">{formatRevenue(summary.periodRevenue)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">总营收</p>
                <p className="text-2xl font-bold text-blue-600">{formatRevenue(summary.totalRevenue)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">总订单</p>
                <p className="text-2xl font-bold">{summary.totalOrders}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border">
                <p className="text-sm text-gray-500 mb-1">已完成订单</p>
                <p className="text-2xl font-bold text-green-600">{summary.completedOrders}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Line Chart */}
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">营收趋势</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.max(1, Math.floor(timeSeries.length / 10))} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => [formatRevenue(Number(value)), '营收']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} dot={false} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Bar Chart */}
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold">订单趋势</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={Math.max(1, Math.floor(timeSeries.length / 10))} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" radius={[2, 2, 0, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold">商品分类分布</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={categories.map(c => ({ name: c.name, value: c.count }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold">订单状态分布</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar data={orderStatus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
