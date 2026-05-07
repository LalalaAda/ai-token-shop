# API Routes

**Stack:** Next.js 16 App Router + Prisma 7 + Zod validation

## WHERE TO LOOK
| Route | File | Auth |
|-------|------|------|
| Auth | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth 5 |
| Cart | `src/app/api/cart/route.ts` | Session |
| Orders | `src/app/api/orders/route.ts` | Session |
| Products | `src/app/api/products/route.ts` | Public |
| Tokens | `src/app/api/tokens/route.ts` | Admin |
| Payments | `src/app/api/pay/route.ts` | Session |
| WeChat Pay | `src/app/api/pay/wechat/route.ts` | - |
| Alipay | `src/app/api/pay/alipay/route.ts` | - |

## CONVENTIONS
- Route handlers use `.ts` (not `.tsx`)
- Validation via Zod schemas
- Admin routes under `src/app/api/admin/*`
- Payment callbacks in subdirs: `wechat/notify`, `alipay/notify`

## ANTI-PATTERNS
- NEVER skip input validation
- NEVER expose raw DB errors to client