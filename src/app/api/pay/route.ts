import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/types';

export async function GET() {
  // This serves as a demo payment confirmation page
  // The actual processing is done client-side
  return NextResponse.json(successResponse({ 
    message: 'Demo payment page',
    redirect: '/api/pay/demo'
  }));
}