'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function DemoPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

  useEffect(() => {
    const processPayment = async () => {
      if (!orderId || !paymentId) {
        setStatus('failed');
        return;
      }
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await fetch('/api/pay/demo-process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentId }),
        });
        setStatus('success');
        setTimeout(() => router.push('/user/orders'), 2000);
      } catch (e) {
        console.error('Payment failed:', e);
        setStatus('failed');
      }
    };
    processPayment();
  }, [orderId, paymentId, router]);

  if (status === 'processing') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-6" />
        <h2 className="text-xl font-semibold mb-2">正在处理支付...</h2>
        <p className="text-gray-500">请稍候</p>
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
        <h2 className="text-xl font-semibold mb-2">支付成功!</h2>
        <p className="text-gray-500">即将跳转到订单页面...</p>
      </div>
    );
  }
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <XCircle className="w-16 h-16 text-red-500 mb-6" />
      <h2 className="text-xl font-semibold mb-2">支付失败</h2>
      <p className="text-gray-500 mb-4">请重试或联系客服</p>
      <button onClick={() => router.push('/checkout')} className="text-blue-600 hover:underline">返回结账</button>
    </div>
  );
}

function Loading() {
  return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-blue-600" /></div>;
}

export default function DemoPaymentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DemoPaymentContent />
    </Suspense>
  );
}