'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: { name: string };
  originalPrice: number;
  sellingPrice: number;
  stock: number;
  availableStock: number;
  salesCount: number;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');
      
      const res = await fetch(`/api/admin/products?${params}`);
      const json = await res.json();
      if (json.success) {
        let data = json.data.products;
        if (search) {
          data = data.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const updateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchProducts();
    } catch (e) {
      console.error('Update failed:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link href="/admin/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          新增商品
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="搜索商品名称..." 
              className="flex-1 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            />
          </div>
          <select 
            className="border rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="ONLINE">上架中</option>
            <option value="OFFLINE">已下架</option>
            <option value="DRAFT">草稿</option>
          </select>
          <button 
            onClick={fetchProducts}
            className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            刷新
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 py-12">暂无商品</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">商品名称</th>
                <th className="px-6 py-3">分类</th>
                <th className="px-6 py-3">价格</th>
                <th className="px-6 py-3">库存</th>
                <th className="px-6 py-3">销量</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-sm">{product.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">¥{Number(product.sellingPrice)}</td>
                  <td className="px-6 py-4 text-sm">{product.availableStock}</td>
                  <td className="px-6 py-4 text-sm">{product.salesCount}</td>
                  <td className="px-6 py-4">
                    <span className={'px-2 py-1 rounded-full text-xs ' + (product.status === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                      {product.status === 'ONLINE' ? '上架中' : product.status === 'OFFLINE' ? '已下架' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={'/admin/products/' + product.id} className="p-1.5 hover:bg-gray-100 rounded transition" title="查看">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <Link href={'/admin/products/' + product.id + '/edit'} className="p-1.5 hover:bg-gray-100 rounded transition" title="编辑">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Link>
                      <button 
                        onClick={() => updateStatus(product.id, product.status)} 
                        className="p-1.5 hover:bg-gray-100 rounded transition" 
                        title={product.status === 'ONLINE' ? '下架' : '上架'}
                      >
                        {product.status === 'ONLINE' ? <EyeOff className="w-4 h-4 text-orange-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)} 
                        className="p-1.5 hover:bg-gray-100 rounded transition" 
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
