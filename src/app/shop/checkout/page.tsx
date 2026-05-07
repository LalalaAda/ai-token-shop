'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditCard, Smartphone, Loader2, CheckCircle } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sellingPrice: number;
  };
}

function getUserId(sessionUserId?: string | null): string {
  // Use session user ID if available
  if (sessionUserId) return sessionUserId;
  // Fallback to localStorage for anonymous users
  if (typeof window === 'undefined') return '';
  let userId = localStorage.getItem('shop_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('shop_user_id', userId);
  }
  return userId;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userId = getUserId(session?.user?.id);
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
    fetchCart();
  }, []);

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setProcessing(true);

    try {
      const userId = getUserId(session?.user?.id);
      const items = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        subtotal: Number(item.product.sellingPrice) * item.quantity,
      }));

      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items,
          totalAmount: total,
          payAmount: total,
          discountAmount: 0,
        }),
      });
      const orderJson = await orderRes.json();

      if (!orderJson.success) {
        alert(orderJson.message || '创建订单失败');
        setProcessing(false);
        return;
      }

      const newOrderId = orderJson.data.id;
      setOrderId(newOrderId);
      setOrderCreated(true);

      // Create payment
      const payRes = await fetch(`/api/pay/${payMethod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newOrderId }),
      });
      const payJson = await payRes.json();

      if (payJson.success && payJson.data?.payUrl) {
        // Redirect to payment page
        window.location.href = payJson.data.payUrl;
      } else if (payJson.success && payJson.data?.paymentId) {
        // Demo mode - go to demo payment page
        window.location.href = `/shop/pay/demo?orderId=${newOrderId}&paymentId=${payJson.data.paymentId}`;
      } else {
        // For demo, just show success
        alert('订单创建成功！(支付功能演示模式)');
        router.push('/shop/user/orders');
      }
    } catch (e) {
      console.error('Checkout failed:', e);
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-500 mb-4">购物车是空的</p>
        <a href="/shop/products" className="text-blue-600 hover:underline">去选购 →</a>
      </div>
    );
  }

return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">订单商品</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <span className="font-medium">¥{(Number(item.product.sellingPrice) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">选择支付方式</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPayMethod('wechat')}
                className={'p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ' + (payMethod === 'wechat' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300')}
              >
                <Smartphone className="w-8 h-8 text-green-600" />
                <span className="font-medium">微信支付</span>
              </button>
              <button
                onClick={() => setPayMethod('alipay')}
                className={'p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition ' + (payMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300')}
              >
                <CreditCard className="w-8 h-8 text-blue-600" />
                <span className="font-medium">支付宝</span>
              </button>
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4">优惠券</h2>
            <div className="flex gap-3">
              <input type="text" placeholder="请输入优惠码" className="flex-1 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">使用</button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">订单摘要</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-500">商品金额</span><span>¥{total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">运费</span><span className="text-green-600">免运费</span></div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>实付金额</span>
                <span className="text-red-500 text-xl">¥{total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {processing ? '处理中...' : `确认支付 ¥${total.toFixed(2)}`}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">支付即表示同意服务条款和购买协议</p>
          </div>
        </div>
      </div>
    </div>
  );
}
