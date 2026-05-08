'use client';

import { useEffect } from 'react';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Shop error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">😵</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">页面出了点问题</h2>
        <p className="text-gray-500 mb-8">请尝试刷新页面或返回首页</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <a
            href="/shop"
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回首页
          </a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-6 text-sm text-gray-400 max-w-lg mx-auto break-words">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
