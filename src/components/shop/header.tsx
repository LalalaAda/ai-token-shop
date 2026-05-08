"use client"

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, Search, LogOut, Sparkles, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationBell } from './notification-bell';

export function Header() {
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)

  // 模拟获取购物车数量
  useEffect(() => {
    // TODO: 从API获取真实购物车数量
    setCartCount(0)
  }, [])

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/shop" className="text-xl font-bold text-blue-600">
            AI Token Shop
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-gray-600 hover:text-blue-600 transition text-sm">首页</Link>
            <Link href="/shop/products" className="text-gray-600 hover:text-blue-600 transition text-sm">全部商品</Link>
            <Link href="/shop/ai-tokens" className="text-gray-600 hover:text-blue-600 transition text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Token
            </Link>
            <Link href="/shop/help" className="text-gray-600 hover:text-blue-600 transition text-sm flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              帮助中心
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center border rounded-lg px-3 py-2 w-48 lg:w-64">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="搜索商品..."
                className="flex-1 outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) window.location.href = `/shop/products?search=${encodeURIComponent(val)}`;
                  }
                }}
              />
            </div>
            <NotificationBell />
            <Link href="/shop/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || '用户'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {session.user?.name || '用户'}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-1">
                    <Link 
                      href="/shop/user" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      个人中心
                    </Link>
                    <Link 
                      href="/shop/user/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      我的订单
                    </Link>
                    <Link 
                      href="/shop/user/tokens" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      我的卡密
                    </Link>
                    <button 
                      onClick={() => signOut({ callbackUrl: '/shop' })}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/shop/login" 
                  className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  登录
                </Link>
                <Link 
                  href="/shop/register" 
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
