import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';
import type { Prisma } from '@/generated/prisma/client';
import { TokenType } from '@/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'default';
    const tokenType = searchParams.get('tokenType');

    const where: Prisma.ProductWhereInput = { status: 'ONLINE' };

    if (category && category !== 'all') {
      where.categoryId = category;
    }

    if (tokenType) {
      where.tokenType = tokenType as TokenType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'sales') orderBy = { salesCount: 'desc' };
    else if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json(successResponse({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }));
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
        slug: body.slug,
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
