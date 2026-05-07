import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(50, '昵称最多50个字符').optional(),
  avatar: z.string().url('头像地址无效').optional().or(z.literal('')),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        email: true,
        memberLevel: true,
        points: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const userId = session.user.id;
    const data: Record<string, string> = {};
    if (result.data.nickname !== undefined) data.nickname = result.data.nickname;
    if (result.data.avatar !== undefined) data.avatar = result.data.avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nickname: true,
        avatar: true,
        phone: true,
        email: true,
        memberLevel: true,
        points: true,
        balance: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
