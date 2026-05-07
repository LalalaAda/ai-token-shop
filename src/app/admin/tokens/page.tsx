"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Download, Search, RefreshCw, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface Token {
  id: string
  keyValue: string
  keyType: string
  status: string
  expireAt: string | null
  soldAt: string | null
  createdAt: string
  product: {
    id: string
    name: string
    slug: string
  }
  order?: {
    orderNo: string
  }
}

export default function TokenManagementPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    productId: "",
    status: "",
  })
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // 生成卡密表单
  const [generateForm, setGenerateForm] = useState({
    productId: "",
    count: 10,
    keyType: "API_KEY",
    expireDays: 0,
  })

  const fetchTokens = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      })
      if (filters.productId) params.set("productId", filters.productId)
      if (filters.status) params.set("status", filters.status)

      const res = await fetch(`/api/admin/tokens?${params}`)
      const data = await res.json()
      setTokens(data.tokens)
      setPagination(data.pagination)
    } catch (error) {
      toast.error("获取失败")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, filters])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generateForm),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "生成失败")
        return
      }

      toast.success(data.message)
      setShowGenerateModal(false)
      setGenerateForm({
        productId: "",
        count: 10,
        keyType: "API_KEY",
        expireDays: 0,
      })
      fetchTokens()
    } catch (error) {
      toast.error("生成失败")
    } finally {
      setGenerating(false)
    }
  }

  const copyToken = async (token: string, id: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("已复制")
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    UNUSED: { label: "未使用", color: "bg-green-100 text-green-700" },
    SOLD: { label: "已售出", color: "bg-blue-100 text-blue-700" },
    EXPIRED: { label: "已过期", color: "bg-red-100 text-red-700" },
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">卡密管理</h1>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          生成卡密
        </button>
      </div>

      {/* 筛选 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索卡密..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">全部状态</option>
            <option value="UNUSED">未使用</option>
            <option value="SOLD">已售出</option>
            <option value="EXPIRED">已过期</option>
          </select>
          <button
            onClick={fetchTokens}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">商品</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">卡密</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">订单</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">过期时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : tokens.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">{token.product?.name || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {token.keyValue.substring(0, 20)}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">
                      {token.keyType === "API_KEY" ? "API Key" : token.keyType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusMap[token.status]?.color}`}>
                      {statusMap[token.status]?.label || token.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">{token.order?.orderNo || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">
                      {token.expireAt ? new Date(token.expireAt).toLocaleDateString() : "永久有效"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyToken(token.keyValue, token.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="复制卡密"
                    >
                      {copiedId === token.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">
              共 {pagination.total} 条，第 {pagination.page}/{pagination.totalPages} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 生成卡密弹窗 */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">生成卡密</h2>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">选择商品</label>
                <select
                  value={generateForm.productId}
                  onChange={(e) => setGenerateForm({ ...generateForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">请选择商品</option>
                  {/* TODO: 加载商品列表 */}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">生成数量</label>
                <input
                  type="number"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 0 })}
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">卡密类型</label>
                <select
                  value={generateForm.keyType}
                  onChange={(e) => setGenerateForm({ ...generateForm, keyType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="API_KEY">API Key</option>
                  <option value="ACCOUNT">账号</option>
                  <option value="PASSWORD">密码</option>
                  <option value="TOKEN">Token</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">有效期(天，0为永久)</label>
                <input
                  type="number"
                  value={generateForm.expireDays}
                  onChange={(e) => setGenerateForm({ ...generateForm, expireDays: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={generating || !generateForm.productId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? "生成中..." : "生成"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}