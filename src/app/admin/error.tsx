'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">系统错误</h2>
        <p className="text-gray-500 mb-8">操作过程中发生了错误，请重试</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <a
            href="/admin"
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回后台首页
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
