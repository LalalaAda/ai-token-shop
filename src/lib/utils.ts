import { Decimal } from "@/generated/internal/prismaNamespace";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: unknown): string {
  let num = 0;
  if (typeof price === 'number') num = price;
  else if (typeof price === 'string') num = parseFloat(price);
  else if (price && typeof price === 'object') {
    // Handle Prisma Decimal type or any object with valueOf
    // const val = (price as Decimal).valueOf;
    const val = Decimal.valueOf.apply(price as Decimal) // Ensure it's a Decimal instance
    num = val ? +val : 0;
  }
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOrderNo(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `ORD${timestamp}${random}`.toUpperCase()
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
