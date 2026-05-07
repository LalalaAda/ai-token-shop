import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

// 生成随机卡密
function generateTokenKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 生成批量卡密
const generateSchema = z.object({
  productId: z.string().uuid("无效的商品ID"),
  count: z.number().int().min(1).max(1000, "一次最多生成1000个"),
  keyType: z.enum(["API_KEY", "ACCOUNT", "PASSWORD", "TOKEN"]).default("API_KEY"),
  expireDays: z.number().int().min(0).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // 验证管理员登录
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    const where: any = {}
    if (productId) where.productId = productId
    if (status) where.status = status

    const [tokens, total] = await Promise.all([
      prisma.tokenKey.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, slug: true },
          },
          order: {
            select: { orderNo: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.tokenKey.count({ where }),
    ])

    return NextResponse.json({
      tokens,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Get tokens error:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证管理员登录
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const result = generateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { productId, count, keyType, expireDays } = result.data

    // 检查商品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 400 })
    }

    // 生成卡密
    const expireAt = expireDays ? new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000) : null

    // 逐个创建 (Prisma批量创建有类型限制)
    const created = []
    for (let i = 0; i < count; i++) {
      const token = await prisma.tokenKey.create({
        data: {
          productId,
          keyValue: generateTokenKey(),
          keyType: keyType as any,
          status: "UNUSED",
          expireAt,
        },
      })
      created.push(token)
    }

    // 更新商品的可用库存
    await prisma.product.update({
      where: { id: productId },
      data: {
        availableStock: { increment: count },
      },
    })

    return NextResponse.json({
      message: `成功生成 ${count} 个卡密`,
      count: created.length,
    })
  } catch (error) {
    console.error("Generate tokens error:", error)
    return NextResponse.json({ error: "生成失败" }, { status: 500 })
  }
}