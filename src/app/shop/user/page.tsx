'use client';

import Link from 'next/link';
import { Package, Ticket, Settings, Loader2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nickname: string | null;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  memberLevel: number;
  points: number;
  balance: number;
}

const memberLevels = ['', '普通会员', '白银会员', '黄金会员', '铂金会员', '钻石会员'];

export default function UserCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/shop/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session, status, router]);

  const menuItems = [
    { icon: Package, label: '我的订单', href: '/shop/user/orders', desc: '查看全部订单' },
    { icon: Ticket, label: '我的卡密', href: '/shop/user/tokens', desc: '查看已购买的卡密' },
    { icon: Settings, label: '账号设置', href: '/shop/user/settings', desc: '修改个人资料' },
  ];

  if (status === 'loading' || loading) {
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
            {user?.nickname?.[0] || session?.user?.name?.[0] || '用'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.nickname || session?.user?.name || '用户'}</h2>
            <p className="text-sm text-gray-500">{user?.phone || user?.email || session?.user?.email || ''}</p>
            {user?.memberLevel ? (
              <span className="bg-yellow-100 text-yellow-700 text-sm px-2 py-1 rounded">
                {memberLevels[user.memberLevel] || '普通会员'}
              </span>
            ) : null}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/shop' })}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="退出登录"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
          </button>
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
