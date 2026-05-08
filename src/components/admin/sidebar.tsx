'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Key,
  Megaphone, Wallet, BarChart3, Settings, LogOut, Shield, Ticket,
  Star, Percent
} from 'lucide-react';
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: '数据看板', href: '/admin/dashboard' },
  { icon: Package, label: '商品管理', href: '/admin/admin-products' },
  { icon: ShoppingCart, label: '订单管理', href: '/admin/orders' },
  { icon: Users, label: '用户管理', href: '/admin/users' },
  { icon: Ticket, label: '卡密管理', href: '/admin/tokens' },
  { icon: Key, label: '库存管理', href: '/admin/inventory' },
  { icon: Megaphone, label: '营销管理', href: '/admin/marketing' },
  { icon: Percent, label: '促销活动', href: '/admin/promotions' },
  { icon: Star, label: '评价管理', href: '/admin/reviews' },
  { icon: Wallet, label: '财务管理', href: '/admin/finance' },
  { icon: Shield, label: '权限管理', href: '/admin/settings/roles' },
  { icon: Settings, label: '系统设置', href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">AI Token 管理后台</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition',
              pathname === item.href || pathname?.startsWith(item.href + '/')
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white transition w-full">
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}