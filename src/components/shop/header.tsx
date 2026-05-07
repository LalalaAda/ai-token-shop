import Link from 'next/link';
import { ShoppingCart, User, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            AI Token Shop
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition">首页</Link>
            <Link href="/products" className="text-gray-600 hover:text-blue-600 transition">全部商品</Link>
            <Link href="/user/orders" className="text-gray-600 hover:text-blue-600 transition">我的订单</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center border rounded-lg px-3 py-2 w-64">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="搜索商品..."
                className="flex-1 outline-none text-sm"
              />
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">0</span>
            </Link>
            <Link href="/user" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
