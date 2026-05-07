'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowLeft, Loader2 } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    coverImage: string | null;
    sellingPrice: number;
    availableStock: number;
  };
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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const userId = getUserId();
      const res = await fetch(`/api/cart?userId=${userId}`);
      const json = await res.json();
      if (json.success && json.data?.items) {
        setCartItems(json.data.items);
      }
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.product.availableStock) return;

    setUpdating(id);
    try {
      const userId = getUserId();
      await fetch(`/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.product.id, quantity: newQty, userId }),
      });
      await fetchCart();
    } catch (e) {
      console.error('Update failed:', e);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
      await fetchCart();
    } catch (e) {
      console.error('Remove failed:', e);
    } finally {
      setUpdating(null);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

return (
    <div>
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        继续购物
      </Link>
      <h1 className="text-2xl font-bold mb-6">购物车 ({cartItems.length})</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-4">购物车是空的</p>
          <Link href="/products" className="text-blue-600 hover:underline">去逛逛 →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.product.coverImage ? (
                    <img src={item.product.coverImage} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-xs">图片</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{item.product.name}</h3>
                  <p className="text-red-500 font-bold">¥{Number(item.product.sellingPrice).toFixed(2)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQuantity(item.id, -1)} disabled={updating === item.id} className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"><Minus className="w-3 h-3" /></button>
                      <span className="px-4 py-1 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} disabled={updating === item.id} className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} disabled={updating === item.id} className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">订单摘要</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-gray-500">商品合计</span><span>¥{total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">优惠</span><span className="text-green-600">-¥0.00</span></div>
                <div className="border-t pt-3 flex justify-between font-bold"><span>应付总额</span><span className="text-red-500 text-xl">¥{total.toFixed(2)}</span></div>
              </div>
              <Link href="/checkout" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-700 transition">
                去结算
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
