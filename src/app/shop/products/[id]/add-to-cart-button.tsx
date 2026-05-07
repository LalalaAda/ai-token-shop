'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

export default function AddToCartButton({ productId, stock }: { productId: string; stock: number }) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const getUserId = (): string | undefined => {
    if (session?.user?.id) return session.user.id;
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('shop_user_id') || undefined;
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, userId: getUserId() }),
      });
      const data = await res.json();
      if (data.success) {
        alert('已添加到购物车');
      } else {
        alert(data.error || '添加失败');
      }
    } catch {
      alert('添加失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <span className="text-gray-700 font-medium">数量</span>
        <div className="flex items-center border rounded-lg">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100 transition"><Minus className="w-4 h-4" /></button>
          <span className="px-6 py-2 font-medium">{quantity}</span>
          <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-100 transition"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <button
          onClick={handleAddToCart}
          disabled={loading || stock === 0}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShoppingCart className="w-5 h-5" />
          {loading ? '添加中...' : stock === 0 ? '已售罄' : '加入购物车'}
        </button>
        <Link
          href={`/shop/checkout?productId=${productId}&quantity=${quantity}`}
          className={`flex-1 py-3 rounded-lg font-semibold transition text-center ${stock === 0 ? 'bg-gray-400 text-gray-200 pointer-events-none' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
        >
          立即购买
        </Link>
      </div>
    </>
  );
}