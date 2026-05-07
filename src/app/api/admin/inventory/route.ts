import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (productId) where.productId = productId;

    const [tokenKeys, total] = await Promise.all([
      prisma.tokenKey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { product: { select: { name: true } } },
      }),
      prisma.tokenKey.count({ where }),
    ]);

    const stats = await Promise.all([
      prisma.tokenKey.count(),
      prisma.tokenKey.count({ where: { status: 'UNUSED' } }),
      prisma.tokenKey.count({ where: { status: 'SOLD' } }),
      prisma.tokenKey.count({ where: { status: 'EXPIRED' } }),
    ]);

    return NextResponse.json(successResponse({
      tokenKeys,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { total: stats[0], unused: stats[1], sold: stats[2], expired: stats[3] },
    }));
  } catch (error) {
    return NextResponse.json(errorResponse('获取库存列表失败'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, keyValue, keyType, expireAt } = body;

    if (!productId || !keyValue) {
      return NextResponse.json(errorResponse('缺少必要参数'), { status: 400 });
    }

    const tokenKey = await prisma.tokenKey.create({
      data: {
        productId,
        keyValue,
        keyType: keyType || 'API_KEY',
        expireAt: expireAt ? new Date(expireAt) : undefined,
      },
    });

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { increment: 1 },
        availableStock: { increment: 1 },
      },
    });

    return NextResponse.json(successResponse(tokenKey), { status: 201 });
  } catch (error) {
    return NextResponse.json(errorResponse('添加卡密失败'), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(errorResponse('缺少卡密ID'), { status: 400 });
    }

    const tokenKey = await prisma.tokenKey.findUnique({ where: { id } });
    
    if (!tokenKey) {
      return NextResponse.json(errorResponse('卡密不存在'), { status: 404 });
    }

    if (tokenKey.status === 'SOLD') {
      return NextResponse.json(errorResponse('已售出的卡密不能删除'), { status: 400 });
    }

    await prisma.tokenKey.delete({ where: { id } });

    // Update product stock
    await prisma.product.update({
      where: { id: tokenKey.productId },
      data: {
        stock: { decrement: 1 },
        availableStock: { decrement: 1 },
      },
    });

    return NextResponse.json(successResponse(null));
  } catch (error) {
    return NextResponse.json(errorResponse('删除卡密失败'), { status: 500 });
  }
}