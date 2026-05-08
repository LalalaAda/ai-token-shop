import Link from 'next/link';
import { Shield, Zap, Headphones, Star } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from './add-to-cart-button';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product || product.status !== 'ONLINE') {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">商品不存在或已下架</h1>
        <Link href="/products" className="text-blue-600 hover:underline">返回商品列表</Link>
      </div>
    );
  }

  // Fetch reviews
  const [reviews, reviewTotal] = await Promise.all([
    prisma.review.findMany({
      where: { productId: id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { productId: id } }),
  ]);

  const avgRating = reviewTotal > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewTotal
    : 0;

  const discount = Number(product.originalPrice) - Number(product.sellingPrice);

  return (
    <div>
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
        ← 返回商品列表
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          {product.coverImage ? (
            <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-gray-400 text-lg">商品展示图</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gray-500">已售 {product.salesCount}</span>
            {product.category && (
              <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">{product.category.name}</span>
            )}
            {product.tokenType && (
              <span className="bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded">{product.tokenType}</span>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-red-500 text-4xl font-bold">{formatPrice(product.sellingPrice)}</span>
              <span className="text-gray-400 text-lg line-through">{formatPrice(product.originalPrice)}</span>
              {discount > 0 && (
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">省{formatPrice(discount)}</span>
              )}
            </div>
            <p className="text-gray-500 text-sm">库存: {product.availableStock} 件</p>
          </div>
          <AddToCartButton productId={product.id} stock={product.availableStock} />
          <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
            <div className="flex flex-col items-center gap-2 text-center"><Shield className="w-6 h-6 text-green-600" /><span className="text-sm text-gray-600">安全保障</span></div>
            <div className="flex flex-col items-center gap-2 text-center"><Zap className="w-6 h-6 text-yellow-600" /><span className="text-sm text-gray-600">即时交付</span></div>
            <div className="flex flex-col items-center gap-2 text-center"><Headphones className="w-6 h-6 text-blue-600" /><span className="text-sm text-gray-600">售后支持</span></div>
          </div>
        </div>
      </div>
      {product.description && (
        <div className="mt-12 bg-white rounded-xl border p-8">
          <h2 className="text-xl font-bold mb-4">商品详情</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
          <p className="mt-4 text-gray-600">购买后系统将自动发送账号信息，请妥善保管。如有任何问题请联系客服。</p>
        </div>
      )}

      {/* Review Section */}
      <div className="mt-12 bg-white rounded-xl border p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">商品评价</h2>
            {reviewTotal > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} 分 · {reviewTotal} 条评价
                </span>
              </div>
            )}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>暂无评价</p>
            <p className="text-sm mt-1">购买后可以发表评价</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {review.user?.nickname?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.user?.nickname || '匿名用户'}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
                {review.content && (
                  <p className="text-sm text-gray-600 ml-11">{review.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}