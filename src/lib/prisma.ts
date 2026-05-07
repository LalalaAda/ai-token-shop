// Prisma Client with PostgreSQL adapter
//// @ts-nocheck - Prisma 7 has unusual module structure
// import * as Prisma from './prisma/client'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

function getPrisma() {
  // const { PrismaPg } = require('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || '' })
  return new PrismaClient({ adapter })
}

export default getPrisma()