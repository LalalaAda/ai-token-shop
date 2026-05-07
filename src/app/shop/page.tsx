import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Zap, Shield, Headphones } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

interface HomeProduct {
  id: string;
  name: string;
  coverImage: string | null;
  sellingPrice: unknown;
  originalPrice: unknown;
  salesCount: number;
}

const features = [
  { icon: Sparkles, title: '优质卡密', desc: '精选AI Token账号，品质保证' },
  { icon: Zap, title: '即时交付', desc: '支付成功后自动发送卡密' },
  { icon: Shield, title: '安全保障', desc: '加密存储，安全交易' },
  { icon: Headphones, title: '售后支持', desc: '7x24小时客服在线' },
];

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: 'ONLINE' },
    orderBy: { salesCount: 'desc' },
    take: 8,
    select: {
      id: true,
      name: true,
      coverImage: true,
      sellingPrice: true,
      originalPrice: true,
      salesCount: true,
    },
  });

  return (
    <div>
      <section className="relative py-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl text-white mb-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">AI Token Shop</h1>
          <p className="text-xl opacity-90 mb-8">专业的AI账号卡密交易平台</p>
          <Link href="/products" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            浏览全部商品
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {features.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <f.icon className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">热门商品</h2>
          <Link href="/products" className="text-blue-600 hover:underline">查看全部</Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product: HomeProduct) => (
              <Link key={product.id} href={'/products/' + product.id} className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.coverImage ? (
                    <Image src={product.coverImage} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">商品图片</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 group-hover:text-blue-600 transition truncate">{product.name}</h3>
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
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 mb-4">暂无商品</p>
          </div>
        )}
      </section>
    </div>
  );
}