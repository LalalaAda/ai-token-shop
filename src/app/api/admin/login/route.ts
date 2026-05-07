import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { compare } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(errorResponse('请输入用户名和密码'), { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!admin) {
      return NextResponse.json(errorResponse('用户名或密码错误'), { status: 401 });
    }

    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(errorResponse('账号已被禁用'), { status: 403 });
    }

    const isValid = await compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(errorResponse('用户名或密码错误'), { status: 401 });
    }

    // Update last login time
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log operation
    await prisma.operationLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        entityType: 'admin',
        entityId: admin.id,
        details: { username: admin.username },
      },
    });

    // Set session cookie
    const sessionData = {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      roleId: admin.roleId,
      permissions: admin.role?.permissions,
    };

    const response = NextResponse.json(successResponse({
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
      },
    }));

    response.cookies.set('admin_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(errorResponse('登录失败'), { status: 500 });
  }
}