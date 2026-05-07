'use client';

import Link from 'next/link';
import { Package, Ticket, Heart, Settings, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface User {
  nickname: string | null;
  avatar: string | null;
  memberLevel: number;
  points: number;
  balance: number;
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('shop_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('shop_user_id', userId);
  }
  return userId;
}

const memberLevels = ['', '普通会员', '白银会员', '黄金会员', '铂金会员', '钻石会员'];

export default function UserCenterPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = getUserId();
        // For demo, generate a simple user object
        // In production, fetch from /api/user
        setUser({
          nickname: '用户',
          avatar: null,
          memberLevel: 0,
          points: 0,
          balance: 0,
        });
      } catch (e) {
        console.error('Failed to fetch user:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const menuItems = [
    { icon: Package, label: '我的订单', href: '/user/orders', desc: '查看全部订单' },
    { icon: Ticket, label: '优惠券', href: '/user/coupons', desc: '查看可用优惠券' },
    { icon: Heart, label: '我的收藏', href: '/user/favorites', desc: '收藏的商品' },
    { icon: Settings, label: '账号设置', href: '/user/settings', desc: '修改个人资料' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user?.nickname?.[0] || '我用'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.nickname || '用户'}</h2>
            {user?.memberLevel ? (
              <span className="bg-yellow-100 text-yellow-700 text-sm px-2 py-1 rounded">
                {memberLevels[user.memberLevel] || '普通会员'}
              </span>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">¥{(Number(user?.balance) || 0).toFixed(2)}</div>
            <div className="text-sm text-gray-500">余额</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{user?.points || 0}</div>
            <div className="text-sm text-gray-500">积分</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-500">优惠券</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="bg-white rounded-xl border p-6 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <item.icon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
