'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, Zap, Cpu, Image, Video } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  sellingPrice: number;
  originalPrice: number;
  salesCount: number;
  tokenType: string | null;
  tokenAmount: number | null;
  coverImage: string | null;
  availableStock: number;
}

const tokenTypeOptions = [
  { value: '', label: '全部类型', icon: Sparkles },
  { value: 'CHAT', label: '对话模型', icon: Zap },
  { value: 'EMBEDDING', label: '嵌入模型', icon: Cpu },
  { value: 'IMAGE', label: '图像模型', icon: Image },
  { value: 'VIDEO', label: '视频模型', icon: Video },
  { value: 'API_KEY', label: 'API密钥', icon: Key },
];

function Key({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
}

export default function AITokensPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100', sort: 'sales' });
        if (selectedType) params.set('tokenType', selectedType);

        const res = await fetch(`/api/products?${params}`);
        const json = await res.json();
        if (json.success) {
          setProducts(json.data.products);
        }
      } catch (e) {
        console.error('Failed to fetch:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedType]);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-3xl font-bold">AI Token 专区</h1>
        </div>
        <p className="text-purple-100">精选AI模型Token、API密钥和账号资源</p>
      </div>

      {/* Token type filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tokenTypeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelectedType(opt.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition ${
              selectedType === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            <opt.icon className="w-4 h-4" />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-500 mb-2">暂无符合条件的AI Token商品</p>
          <p className="text-sm text-gray-400">请尝试其他分类筛选</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/shop/products/${product.id}`}
              className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center relative">
                {product.coverImage ? (
                  <img src={product.coverImage} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Sparkles className="w-12 h-12 text-purple-300" />
                )}
                {product.tokenType && (
                  <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    {product.tokenType}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-1 group-hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
                {product.tokenAmount && (
                  <p className="text-xs text-purple-600 mb-2">{product.tokenAmount.toLocaleString()} Tokens</p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-red-500 font-bold text-lg">{formatPrice(product.sellingPrice)}</span>
                    <span className="text-gray-400 text-sm line-through ml-2">{formatPrice(product.originalPrice)}</span>
                  </div>
                  <span className="text-gray-400 text-xs">已售 {product.salesCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
