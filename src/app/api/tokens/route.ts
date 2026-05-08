import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const userId = (session.user as { id: string }).id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // 获取用户已购买的卡密
    const [tokens, total] = await Promise.all([
      prisma.tokenKey.findMany({
        where: {
          order: {
            userId,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              coverImage: true,
            },
          },
          order: {
            select: {
              orderNo: true,
              paidAt: true,
            },
          },
        },
        orderBy: { soldAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.tokenKey.count({
        where: {
          order: { userId },
        },
      }),
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
    console.error("Get user tokens error:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}