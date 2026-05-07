"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        login: formData.login,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("手机号/邮箱或密码错误")
      } else {
        router.push("/shop")
        router.refresh()
      }
    } catch (err) {
      setError("登录失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">登录</h1>
          <p className="text-gray-500 mt-2">欢迎回来</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号 / 邮箱
            </label>
            <input
              type="text"
              value={formData.login}
              onChange={(e) => setFormData({ ...formData, login: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="请输入手机号或邮箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-500">还没有账号？</span>
          <Link href="/shop/register" className="text-blue-600 hover:underline ml-1">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}