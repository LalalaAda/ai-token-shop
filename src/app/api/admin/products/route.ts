import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json(successResponse({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  } catch (error) {
    return NextResponse.json(errorResponse('获取商品列表失败'), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug || slugify(body.name),
        description: body.description,
        coverImage: body.coverImage,
        images: body.images || [],
        originalPrice: body.originalPrice,
        sellingPrice: body.sellingPrice,
        costPrice: body.costPrice,
        stock: body.stock || 0,
        availableStock: body.availableStock || 0,
        tokenType: body.tokenType,
        tokenAmount: body.tokenAmount,
        validityDays: body.validityDays,
        status: body.status || 'DRAFT',
        categoryId: body.categoryId,
      },
    });
    return NextResponse.json(successResponse(product), { status: 201 });
  } catch (error) {
    return NextResponse.json(errorResponse('创建商品失败'), { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return NextResponse.json(successResponse(product));
  } catch (error) {
    return NextResponse.json(errorResponse('更新商品失败'), { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json(errorResponse('缺少商品ID'), { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json(successResponse(null));
  } catch (error) {
    return NextResponse.json(errorResponse('删除商品失败'), { status: 500 });
  }
}
