'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Star, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  sellingPrice: number;
  originalPrice: number;
  salesCount: number;
  coverImage: string | null;
  availableStock: number;
  category: { id: string; name: string } | null;
}

const categories = [
  { id: 'all', name: '全部' },
  { id: 'CHAT', name: '对话类' },
  { id: 'IMAGE', name: '图像类' },
  { id: 'VIDEO', name: '视频类' },
  { id: 'API_KEY', name: 'API密钥' },
  { id: 'ACCOUNT', name: '账号类' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort,
      });
      if (category !== 'all') params.set('category', category);
      if (search) params.set('search', search);

      const res = await fetch('/api/products?' + params.toString());
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, category, search, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="flex gap-8">
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl border p-6 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">筛选</h3>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat.id}
                    onChange={() => setCategory(cat.id)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-500">{total} 件商品</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="default">默认排序</option>
            <option value="sales">销量优先</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={'/products/' + product.id} className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {product.coverImage ? (
                    <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">商品图片</span>
                  )}
                  {product.availableStock < 10 && product.availableStock > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">库存紧张</span>
                  )}
                  {product.availableStock === 0 && (
                    <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">已售罄</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 group-hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-gray-400 text-xs">已售 {product.salesCount}</span>
                  </div>
                  <div>
                    <span className="text-red-500 font-bold text-lg">{formatPrice(product.sellingPrice)}</span>
                    <span className="text-gray-400 text-sm line-through ml-2">{formatPrice(product.originalPrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 mb-4">暂无符合条件的商品</p>
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">第 {page} 页</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}