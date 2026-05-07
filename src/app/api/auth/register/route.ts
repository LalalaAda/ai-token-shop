import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  login: z.string().min(1, "请输入手机号或邮箱"),
  password: z.string().min(6, "密码至少6位"),
  nickname: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证输入
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { login, password, nickname } = result.data

    // 判断是手机号还是邮箱
    const isPhone = /^1[3-9]\d{9}$/.test(login)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)

    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { error: "请输入有效的手机号或邮箱" },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: isPhone ? { phone: login } : { email: login },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: isPhone ? "手机号已被注册" : "邮箱已被注册" },
        { status: 400 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: isPhone
        ? { phone: login, passwordHash, nickname: nickname || undefined }
        : { email: login, passwordHash, nickname: nickname || undefined },
    })

    return NextResponse.json(
      { message: "注册成功", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}