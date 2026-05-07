"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Clock } from "lucide-react"
import { toast } from "sonner"

interface Token {
  id: string
  keyValue: string
  keyType: string
  status: string
  expireAt: string | null
  soldAt: string | null
  product: {
    id: string
    name: string
    slug: string
    coverImage: string | null
  }
  order: {
    orderNo: string
    paidAt: string
  }
}

export default function UserTokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/tokens")
      const data = await res.json()
      if (res.ok) {
        setTokens(data.tokens)
      }
    } catch (error) {
      console.error("获取卡密失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = async (token: string, id: string) => {
    await navigator.clipboard.writeText(token)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("卡密已复制")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SOLD":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">已使用</span>
      case "EXPIRED":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">已过期</span>
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">可用</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的卡密</h1>

      {tokens.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <p className="text-gray-500 mb-2">暂无卡密</p>
          <p className="text-sm text-gray-400">购买商品后，您的卡密将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <div key={token.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-start gap-4">
                {token.product.coverImage && (
                  <img
                    src={token.product.coverImage}
                    alt={token.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{token.product.name}</h3>
                    {getStatusBadge(token.status)}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2 flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-700">{token.keyValue}</code>
                    <button
                      onClick={() => copyToken(token.keyValue, token.id)}
                      className="ml-3 p-1.5 hover:bg-gray-200 rounded transition"
                    >
                      {copiedId === token.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>订单号: {token.order.orderNo}</span>
                    {token.expireAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        有效期至: {new Date(token.expireAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}