'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">系统错误</h1>
          <p className="text-gray-600 mb-8">抱歉，系统发生了错误，请稍后重试</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
            <a
              href="/shop"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              返回首页
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-8 text-sm text-gray-400 max-w-md mx-auto break-words">
              {error.message}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
