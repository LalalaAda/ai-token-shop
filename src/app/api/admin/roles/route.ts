import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { z } from 'zod';

const PERMISSION_OPTIONS = [
  'dashboard:view',
  'products:view', 'products:create', 'products:edit', 'products:delete',
  'orders:view', 'orders:edit',
  'users:view', 'users:edit',
  'tokens:view', 'tokens:create',
  'promotions:view', 'promotions:create', 'promotions:edit', 'promotions:delete',
  'reviews:view', 'reviews:delete',
  'settlements:view', 'settlements:edit',
  'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
  'settings:view', 'settings:edit',
] as const;

const createRoleSchema = z.object({
  name: z.string().min(1, '角色名称为必填'),
  description: z.string().optional(),
  permissions: z.array(z.enum(PERMISSION_OPTIONS)).min(1, '至少选择一个权限'),
});

const updateRoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  permissions: z.array(z.enum(PERMISSION_OPTIONS)).optional(),
});

export async function GET() {
  try {
    const roles = await prisma.adminRole.findMany({
      include: {
        _count: { select: { adminUsers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(successResponse({ roles }));
  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(errorResponse('获取角色列表失败'), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { name, description, permissions } = result.data;

    // Check name uniqueness
    const existing = await prisma.adminRole.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json(errorResponse('角色名称已存在'), { status: 409 });
    }

    const role = await prisma.adminRole.create({
      data: { name, description, permissions },
    });

    return NextResponse.json(successResponse(role), { status: 201 });
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json(errorResponse('创建角色失败'), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        errorResponse(result.error.issues[0]?.message || '参数错误'),
        { status: 400 },
      );
    }

    const { id, ...updateData } = result.data;
    const data: Record<string, unknown> = {};

    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.permissions !== undefined) data.permissions = updateData.permissions;

    const role = await prisma.adminRole.update({
      where: { id },
      data,
      include: {
        _count: { select: { adminUsers: true } },
      },
    });

    return NextResponse.json(successResponse(role));
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(errorResponse('更新角色失败'), { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(errorResponse('缺少角色ID'), { status: 400 });
    }

    // Check if role has users
    const userCount = await prisma.adminUser.count({ where: { roleId: id } });
    if (userCount > 0) {
      return NextResponse.json(errorResponse('该角色下还有管理员，无法删除'), { status: 400 });
    }

    await prisma.adminRole.delete({ where: { id } });

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(errorResponse('删除角色失败'), { status: 500 });
  }
}
