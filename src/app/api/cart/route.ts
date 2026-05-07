import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(successResponse({ items: [] }));
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            coverImage: true,
            sellingPrice: true,
            availableStock: true,
          },
        },
      },
    });

    return NextResponse.json(successResponse({ items: cartItems }));
  } catch (error) {
    return NextResponse.json(errorResponse('获取购物车失败'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(errorResponse('缺少必要参数'), { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ONLINE') {
      return NextResponse.json(errorResponse('商品不存在或已下架'), { status: 404 });
    }

    if (product.availableStock < quantity) {
      return NextResponse.json(errorResponse('库存不足'), { status: 400 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }

    return NextResponse.json(successResponse(null));
  } catch (error) {
    return NextResponse.json(errorResponse('添加购物车失败'), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(errorResponse('缺少购物车项ID'), { status: 400 });
    }

    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json(successResponse(null));
  } catch (error) {
    return NextResponse.json(errorResponse('删除购物车项失败'), { status: 500 });
  }
}