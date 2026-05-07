# Utilities

**Stack:** Prisma client, NextAuth 5, Zod

## FILES
- `auth.ts` - NextAuth configuration
- `prisma.ts` - Prisma client singleton
- `types.ts` - Shared TypeScript types
- `utils.ts` - Helper functions (clsx, tailwind-merge)

## CONVENTIONS
- Prisma client: `import { prisma } from '@/lib/prisma'`
- Auth config: `import { auth } from '@/lib/auth'`

## ANTI-PATTERNS
- DO NOT re-export Prisma client in multiple places
- DO NOT create Prisma client per-request