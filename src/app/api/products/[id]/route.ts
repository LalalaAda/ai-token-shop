import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id, status: 'ONLINE' },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(errorResponse('Product not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(product));
  } catch (error) {
    return NextResponse.json(errorResponse('Failed to fetch product'), { status: 500 });
  }
}
