# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-07
**Stack:** Next.js 16.2.4 + React 19 + Prisma 7 + PostgreSQL + NextAuth 5

## OVERVIEW
AI Token Shop - E-commerce platform for selling AI tokens/keys with admin panel

## STRUCTURE
```
./
├── prisma/           # DB schema (PostgreSQL)
├── src/
│   ├── app/        # Next.js App Router
│   │   ├── api/    # API routes (auth, cart, orders, pay, products, tokens)
│   │   ├── shop/   # Customer-facing shop
│   │   └── admin/  # Admin panel (12 sub-routes)
│   ├── components/   # UI components
│   ├── lib/        # Utilities
│   ├── hooks/      # React hooks
│   └── generated/   # Prisma client
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| API routes | `src/app/api/*/route.ts` | Auth, Cart, Orders, Pay, Products, Tokens |
| Shop pages | `src/app/shop/*/page.tsx` | Customer UI |
| Admin pages | `src/app/admin/*/page.tsx` | Admin panel |
| Admin route protection | `src/proxy.ts` | Proxy renames from middleware in v16 |
| DB models | `prisma/schema.prisma` | 18 models |
| Utils | `src/lib/*.ts` | Shared functions |

## CONVENTIONS
- Next.js 16 App Router (not legacy pages)
- Prisma with custom output to `src/generated/prisma`
- API routes use route.ts (not page.ts)
- Admin auth separate from NextAuth

## ANTI-PATTERNS
- DO NOT use `as any` - type safety required
- DO NOT commit `.env` - credentials must stay local

## COMMANDS
```bash
bun dev      # Dev server
bun build   # Production build
npx prisma generate  # Regenerate Prisma client
```
